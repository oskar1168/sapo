import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityItem } from '../constants/travelData';

const getCategoryLabel = (cat: string) => {
  switch (cat) {
    case 'flight': return '✈️ 항공';
    case 'meal': return '🍴 식당/맛집';
    case 'cafe': return '☕ 카페/디저트';
    case 'sightseeing': return '🏔️ 관광지/명소';
    case 'shopping': return '🛍️ 쇼핑';
    case 'lodging': return '🏨 숙소';
    case 'transport': return '🚌 교통';
    default: return '✨ 기타';
  }
};

interface PlaceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ActivityItem, 'id'> & { id?: number }, targetDay?: string) => void;
  editingItem: ActivityItem | null;
  dayOptions: { label: string; value: string }[];
  defaultDay: string;
  exchangeRate: number; // 1 JPY to KRW
  isRecommendedSpot?: boolean; // If triggered from Liked spot (locks fields)
  recommendedData?: { name: string; category: string; address?: string; menu?: string; tips?: string };
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

  // Recommended Spot parameters
  const [recMenu, setRecMenu] = useState('');
  const [recTips, setRecTips] = useState('');

  // Lock status flag
  const isLocked = isRecommendedSpot || (editingItem && editingItem.currency === undefined); // fallback logic

  useEffect(() => {
    if (visible) {
      if (editingItem) {
        // Edit Mode
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
        // Add Recommended Spot Mode (Lock fields)
        setName(recommendedData.name);
        setTime('12:00');
        // Map category
        let mappedCat = 'etc';
        if (recommendedData.category === 'spot') mappedCat = 'sightseeing';
        else if (recommendedData.category === 'dessert') mappedCat = 'cafe';
        else if (['meat', 'seafood', 'noodle'].includes(recommendedData.category)) mappedCat = 'meal';
        setCategory(mappedCat);
        
        setCost('');
        setCurrency('JPY');
        setAddress(recommendedData.address || '');
        setMemo('');
        setRecMenu(recommendedData.menu || '');
        setRecTips(recommendedData.tips || '');
      } else {
        // Pure Add Mode
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
    }
  }, [visible, editingItem, isRecommendedSpot, recommendedData, defaultDay]);

  const handleSave = () => {
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        alert('장소 이름을 입력해 주세요.');
      } else {
        Alert.alert('오류', '장소 이름을 입력해 주세요.');
      }
      return;
    }

    onSubmit({
      type: category,
      name: name.trim(),
      time: time || '12:00',
      memo: memo.trim(),
      cost: cost ? parseFloat(cost) : undefined,
      currency: cost ? currency : undefined,
      address: address ? address.trim() : undefined,
      ...(editingItem?.id ? { id: editingItem.id } : {}),
    }, day);
    onClose();
  };

  const getCostConversionText = () => {
    if (!cost) return '';
    const numCost = parseFloat(cost);
    if (isNaN(numCost)) return '';

    if (currency === 'JPY') {
      const krwVal = Math.round(numCost * exchangeRate);
      return `약 ₩ ${krwVal.toLocaleString()}원 (100엔 = ${Math.round(exchangeRate * 100)}원 기준)`;
    } else {
      const jpyVal = Math.round(numCost / exchangeRate);
      return `약 ¥ ${jpyVal.toLocaleString()}엔 (100엔 = ${Math.round(exchangeRate * 100)}원 기준)`;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContentContainer}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {editingItem ? '방문 장소 수정' : isRecommendedSpot ? '추천 장소 일정 추가' : '방문 장소 추가'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.btnClose}>
                <Ionicons name="close" size={24} color="#60646c" />
              </TouchableOpacity>
            </View>

            {/* Scroll Form */}
            <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
              {/* Day Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>방문 일차 *</Text>
                <View style={styles.dayPickerRow}>
                  {dayOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.dayChip, day === opt.value && styles.dayChipActive]}
                      onPress={() => setDay(opt.value)}
                    >
                      <Text style={[styles.dayChipText, day === opt.value && styles.dayChipTextActive]}>
                        {opt.label.split(' (')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Place Name */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>장소 이름 *</Text>
                <TextInput
                  style={[styles.input, isLocked && styles.inputLocked]}
                  value={name}
                  onChangeText={setName}
                  placeholder="예: 스스키노 라멘 골목, 오타루 운하"
                  editable={!isLocked}
                />
              </View>

              {/* Time & Category Row */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>시간 *</Text>
                  <TextInput
                    style={styles.input}
                    value={time}
                    onChangeText={setTime}
                    placeholder="예: 12:00"
                  />
                </View>

                {/* Category Selection (Hidden when recommended spot) */}
                {!isRecommendedSpot ? (
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>분류</Text>
                    <View style={styles.pickerFakeContainer}>
                      <Text style={styles.pickerText}>
                        {getCategoryLabel(category)}
                      </Text>
                      {/* Simulating picker toggle with custom chips */}
                    </View>
                  </View>
                ) : null}
              </View>

              {/* Custom Category Selection Chips */}
              {!isRecommendedSpot ? (
                <View style={styles.categoryChipsContainer}>
                  {[
                    { val: 'flight', label: '✈️ 항공' },
                    { val: 'meal', label: '🍴 식당' },
                    { val: 'cafe', label: '☕ 카페' },
                    { val: 'sightseeing', label: '🏔️ 관광' },
                    { val: 'shopping', label: '🛍️ 쇼핑' },
                    { val: 'lodging', label: '🏨 숙소' },
                    { val: 'transport', label: '🚌 교통' },
                    { val: 'etc', label: '✨ 기타' },
                  ].map((catItem) => (
                    <TouchableOpacity
                      key={catItem.val}
                      style={[styles.catChip, category === catItem.val && styles.catChipActive]}
                      onPress={() => setCategory(catItem.val)}
                    >
                      <Text style={[styles.catChipText, category === catItem.val && styles.catChipTextActive]}>
                        {catItem.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {/* Estimated Cost */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>1인당 예상 비용 (선택)</Text>
                <View style={styles.costInputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={cost}
                    onChangeText={setCost}
                    placeholder="예: 1500"
                    keyboardType="numeric"
                  />
                  <View style={styles.currencyToggleRow}>
                    {['JPY', 'KRW'].map((curr) => (
                      <TouchableOpacity
                        key={curr}
                        style={[styles.currBtn, currency === curr && styles.currBtnActive]}
                        onPress={() => setCurrency(curr)}
                      >
                        <Text style={[styles.currBtnText, currency === curr && styles.currBtnTextActive]}>
                          {curr === 'JPY' ? '¥ 엔' : '₩ 원'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {cost ? <Text style={styles.conversionLabel}>{getCostConversionText()}</Text> : null}
              </View>

              {/* Google Map Address (Hidden when recommended spot) */}
              {!isRecommendedSpot ? (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>구글맵 주소 또는 검색어 (선택)</Text>
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="예: 삿포로역, 스스키노 다루마"
                  />
                </View>
              ) : null}

              {/* Read-Only Recommended Spot Metadata Box */}
              {isRecommendedSpot && (recMenu || recTips) ? (
                <View style={styles.recInfoBox}>
                  {recMenu ? (
                    <Text style={styles.recInfoMenu}>✨ 추천: {recMenu}</Text>
                  ) : null}
                  {recTips ? (
                    <Text style={styles.recInfoTips}>💡 꿀팁: {recTips}</Text>
                  ) : null}
                </View>
              ) : null}

              {/* Detail Memo */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>나의 상세 메모</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={memo}
                  onChangeText={setMemo}
                  placeholder="예: 몇 시 예약 완료!, 이 지점이 대기가 짧다고 함"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={styles.btnCancel}>
                <Text style={styles.btnCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.btnSubmit}>
                <Text style={styles.btnSubmitText}>저장하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContentContainer: {
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  btnClose: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  inputLocked: {
    backgroundColor: '#e2e8f0',
    color: '#64748b',
    borderColor: '#cbd5e1',
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  dayPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dayChipActive: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  dayChipTextActive: {
    color: '#ffffff',
  },
  pickerFakeContainer: {
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#e2e8f0',
  },
  pickerText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '700',
  },
  categoryChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  catChipActive: {
    backgroundColor: '#a29bfe',
    borderColor: '#a29bfe',
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#ffffff',
  },
  costInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  currencyToggleRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    overflow: 'hidden',
  },
  currBtn: {
    paddingHorizontal: 12,
    height: 42,
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  currBtnActive: {
    backgroundColor: '#2ecc71',
  },
  currBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  currBtnTextActive: {
    color: '#ffffff',
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
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  btnCancel: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  btnSubmit: {
    flex: 1,
    height: 46,
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
