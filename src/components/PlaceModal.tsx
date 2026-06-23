import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { ActivityItem } from '../constants/travelData';
import {
  CurrencyToggle,
  FormChipGroup,
  FormField,
  FormModal,
  FormTextInput,
} from './forms/ModalForm';

const placeCategoryOptions = [
  { value: 'flight', label: '항공' },
  { value: 'meal', label: '식당' },
  { value: 'cafe', label: '카페' },
  { value: 'sightseeing', label: '관광' },
  { value: 'shopping', label: '쇼핑' },
  { value: 'lodging', label: '숙소' },
  { value: 'transport', label: '교통' },
  { value: 'etc', label: '기타' },
];

interface PlaceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ActivityItem, 'id'> & { id?: number }, targetDay?: string) => void;
  editingItem: ActivityItem | null;
  dayOptions: { label: string; value: string }[];
  defaultDay: string;
  exchangeRate: number;
  isRecommendedSpot?: boolean;
  recommendedData?: {
    name: string;
    category: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    googleMapsUrl?: string;
    menu?: string;
    tips?: string;
  };
}

function mapRecommendedCategory(category: string) {
  if (category === 'spot') return 'sightseeing';
  if (category === 'dessert') return 'cafe';
  if (['meat', 'seafood', 'noodle'].includes(category)) return 'meal';
  return 'etc';
}

function showRequiredNameAlert() {
  if (Platform.OS === 'web') {
    alert('장소 이름을 입력해 주세요.');
    return;
  }

  Alert.alert('오류', '장소 이름을 입력해 주세요.');
}

export default function PlaceModal({
  visible,
  onClose,
  onSubmit,
  editingItem,
  dayOptions,
  defaultDay,
  exchangeRate,
  isRecommendedSpot = false,
  recommendedData,
}: PlaceModalProps) {
  const [day, setDay] = useState(defaultDay);
  const [name, setName] = useState('');
  const [time, setTime] = useState('12:00');
  const [category, setCategory] = useState('etc');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState('JPY');
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [recMenu, setRecMenu] = useState('');
  const [recTips, setRecTips] = useState('');

  const isLocked = Boolean(isRecommendedSpot || (editingItem && editingItem.currency === undefined));

  const dayChipOptions = useMemo(
    () =>
      dayOptions.map((option) => ({
        value: option.value,
        label: option.label.split(' (')[0],
      })),
    [dayOptions],
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!visible) return;

    if (editingItem) {
      setName(editingItem.name);
      setTime(editingItem.time);
      setCategory(editingItem.type);
      setCost(editingItem.cost !== undefined ? editingItem.cost.toString() : '');
      setCurrency(editingItem.currency || 'JPY');
      setAddress(editingItem.address || '');
      setMemo(editingItem.memo || '');
      setRecMenu('');
      setRecTips('');
    } else if (isRecommendedSpot && recommendedData) {
      setName(recommendedData.name);
      setTime('12:00');
      setCategory(mapRecommendedCategory(recommendedData.category));
      setCost('');
      setCurrency('JPY');
      setAddress(recommendedData.address || '');
      setMemo('');
      setRecMenu(recommendedData.menu || '');
      setRecTips(recommendedData.tips || '');
    } else {
      setName('');
      setTime('12:00');
      setCategory('sightseeing');
      setCost('');
      setCurrency('JPY');
      setAddress('');
      setMemo('');
      setRecMenu('');
      setRecTips('');
    }

    setDay(defaultDay);
  }, [visible, editingItem, isRecommendedSpot, recommendedData, defaultDay]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = () => {
    if (!name.trim()) {
      showRequiredNameAlert();
      return;
    }

    onSubmit(
      {
        type: category,
        name: name.trim(),
        time: time || '12:00',
        memo: memo.trim(),
        cost: cost ? parseFloat(cost) : undefined,
        currency: cost ? currency : undefined,
        address: address ? address.trim() : undefined,
        latitude: editingItem?.latitude ?? recommendedData?.latitude,
        longitude: editingItem?.longitude ?? recommendedData?.longitude,
        googleMapsUrl: editingItem?.googleMapsUrl || recommendedData?.googleMapsUrl,
        ...(editingItem?.id ? { id: editingItem.id } : {}),
      },
      day,
    );
    onClose();
  };

  const getCostConversionText = () => {
    if (!cost) return '';
    const numCost = parseFloat(cost);
    if (isNaN(numCost)) return '';

    if (currency === 'JPY') {
      const krwVal = Math.round(numCost * exchangeRate);
      return `약 ${krwVal.toLocaleString()}원 (100엔 = ${Math.round(exchangeRate * 100)}원 기준)`;
    }

    const jpyVal = Math.round(numCost / exchangeRate);
    return `약 ${jpyVal.toLocaleString()}엔 (100엔 = ${Math.round(exchangeRate * 100)}원 기준)`;
  };

  const modalTitle = editingItem ? '방문 장소 수정' : isRecommendedSpot ? '추천 장소 일정 추가' : '방문 장소 추가';

  return (
    <FormModal
      visible={visible}
      title={modalTitle}
      submitLabel={editingItem ? '수정하기' : '저장하기'}
      cancelLabel="취소"
      onClose={onClose}
      onSubmit={handleSave}
    >
      <FormField label="방문 일차 *">
        <FormChipGroup options={dayChipOptions} value={day} onChange={setDay} />
      </FormField>

      <FormField label="장소 이름 *">
        <FormTextInput
          locked={isLocked}
          value={name}
          onChangeText={setName}
          placeholder="예: 스스키노 라멘 골목, 오타루 운하"
          editable={!isLocked}
        />
      </FormField>

      <View style={styles.formRow}>
        <FormField label="시간 *" style={styles.formColumn}>
          <FormTextInput value={time} onChangeText={setTime} placeholder="예: 12:00" />
        </FormField>

        {!isRecommendedSpot ? (
          <FormField label="분류" style={styles.formColumn}>
            <View style={styles.categorySummary}>
              <Text style={styles.categorySummaryText}>
                {placeCategoryOptions.find((option) => option.value === category)?.label || '기타'}
              </Text>
            </View>
          </FormField>
        ) : null}
      </View>

      {!isRecommendedSpot ? (
        <View style={styles.categoryChipsContainer}>
          <FormChipGroup options={placeCategoryOptions} value={category} onChange={setCategory} variant="compact" />
        </View>
      ) : null}

      <FormField label="1인당 예상 비용 (선택)">
        <View style={styles.costInputRow}>
          <FormTextInput
            style={{ flex: 1 }}
            value={cost}
            onChangeText={setCost}
            placeholder="예: 1500"
            keyboardType="numeric"
          />
          <CurrencyToggle value={currency} onChange={setCurrency} />
        </View>
        {cost ? <Text style={styles.conversionLabel}>{getCostConversionText()}</Text> : null}
      </FormField>

      {!isRecommendedSpot ? (
        <FormField label="구글맵 주소 또는 검색어 (선택)">
          <FormTextInput value={address} onChangeText={setAddress} placeholder="예: 삿포로역, 스스키노 다루마" />
        </FormField>
      ) : null}

      {isRecommendedSpot && (recMenu || recTips) ? (
        <View style={styles.recInfoBox}>
          {recMenu ? <Text style={styles.recInfoMenu}>추천: {recMenu}</Text> : null}
          {recTips ? <Text style={styles.recInfoTips}>꿀팁: {recTips}</Text> : null}
        </View>
      ) : null}

      <FormField label="나의 상세 메모">
        <FormTextInput
          style={styles.textArea}
          value={memo}
          onChangeText={setMemo}
          placeholder="예: 몇 시 예약 완료, 이 지점이 대기가 짧다고 함"
          multiline={true}
          numberOfLines={3}
        />
      </FormField>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formColumn: {
    flex: 1,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  categorySummary: {
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#e2e8f0',
  },
  categorySummaryText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '700',
  },
  categoryChipsContainer: {
    marginBottom: 16,
  },
  costInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  conversionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 6,
  },
  recInfoBox: {
    padding: 12,
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.2)',
    marginBottom: 16,
    gap: 4,
  },
  recInfoMenu: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#27ae60',
  },
  recInfoTips: {
    fontSize: 12.5,
    color: '#2c3e50',
    lineHeight: 18,
  },
});
