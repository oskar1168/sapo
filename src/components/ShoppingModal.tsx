import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ShoppingItem } from '../constants/travelData';
import { CurrencyToggle, FormChipGroup, FormField, FormModal, FormTextInput } from './forms/ModalForm';
import QuantityStepper from './forms/QuantityStepper';

const shoppingCategoryOptions = [
  { value: 'dessert', label: '디저트/과자' },
  { value: 'drug', label: '의약품/화장품' },
  { value: 'alcohol', label: '주류' },
  { value: 'souvenir', label: '기념품' },
  { value: 'etc', label: '기타' },
];

interface ShoppingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ShoppingItem, 'id'> & { id?: number }) => void;
  editingItem: ShoppingItem | null;
}

export default function ShoppingModal({ visible, onClose, onSubmit, editingItem }: ShoppingModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('dessert');
  const [qty, setQty] = useState('1');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState('JPY');
  const [memo, setMemo] = useState('');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!visible) return;

    if (editingItem) {
      setName(editingItem.name);
      setCategory(editingItem.category);
      setQty(editingItem.qty.toString());
      setCost(editingItem.cost !== undefined ? editingItem.cost.toString() : '');
      setCurrency(editingItem.currency || 'JPY');
      setMemo(editingItem.memo || '');
      return;
    }

    setName('');
    setCategory('dessert');
    setQty('1');
    setCost('');
    setCurrency('JPY');
    setMemo('');
  }, [visible, editingItem]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('오류', '아이템 이름을 입력해 주세요.');
      return;
    }

    const parsedQty = parseInt(qty, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      Alert.alert('오류', '올바른 수량을 입력해 주세요.');
      return;
    }

    onSubmit({
      name: name.trim(),
      category,
      qty: parsedQty,
      cost: cost ? parseFloat(cost) : 0,
      currency,
      memo: memo.trim(),
      checked: editingItem ? editingItem.checked : false,
      ...(editingItem?.id ? { id: editingItem.id } : {}),
    });
    onClose();
  };

  return (
    <FormModal
      visible={visible}
      title={editingItem ? '쇼핑 아이템 수정' : '쇼핑 아이템 추가'}
      submitLabel={editingItem ? '수정하기' : '추가하기'}
      cancelLabel="취소"
      onClose={onClose}
      onSubmit={handleSave}
    >
      <FormField label="아이템 이름 *">
        <FormTextInput value={name} onChangeText={setName} placeholder="예: 시로이 코이비토, 키캣" />
      </FormField>

      <FormField label="카테고리 *">
        <FormChipGroup options={shoppingCategoryOptions} value={category} onChange={setCategory} />
      </FormField>

      <FormField label="수량 *">
        <QuantityStepper value={qty} onChange={setQty} />
      </FormField>

      <FormField label="예상 가격 (1개당)">
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
      </FormField>

      <FormField label="메모 (선택)">
        <FormTextInput
          style={styles.textArea}
          value={memo}
          onChangeText={setMemo}
          placeholder="예: 돈키호테 메가스토어 스스키노점 2층"
          multiline={true}
          numberOfLines={2}
        />
      </FormField>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  textArea: {
    height: 60,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  costInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
});
