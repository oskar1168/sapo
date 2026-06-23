import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShoppingItem } from '../constants/travelData';
import { CurrencyToggle, FormModal, FormTextInput } from './forms/ModalForm';

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
    if (visible) {
      if (editingItem) {
        setName(editingItem.name);
        setCategory(editingItem.category);
        setQty(editingItem.qty.toString());
        setCost(editingItem.cost !== undefined ? editingItem.cost.toString() : '');
        setCurrency(editingItem.currency || 'JPY');
        setMemo(editingItem.memo || '');
      } else {
        setName('');
        setCategory('dessert');
        setQty('1');
        setCost('');
        setCurrency('JPY');
        setMemo('');
      }
    }
  }, [visible, editingItem]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('오류', '아이템 이름을 입력해 주세요.');
      return;
    }

    const parsedQty = parseInt(qty);
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
              {/* Item Name */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>아이템 이름 *</Text>
                <FormTextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="예: 시로이 코이비토, 카베진"
                />
              </View>

              {/* Category selector (Chips) */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>카테고리 *</Text>
                <View style={styles.categoryChips}>
                  {[
                    { val: 'dessert', label: '🍰 디저트/과자' },
                    { val: 'drug', label: '💊 의약품/화장품' },
                    { val: 'alcohol', label: '🍶 주류 (맥주/위스키)' },
                    { val: 'souvenir', label: '🧸 기념품/소품' },
                    { val: 'etc', label: '✨ 기타' },
                  ].map((cat) => (
                    <TouchableOpacity
                      key={cat.val}
                      style={[styles.catChip, category === cat.val && styles.catChipActive]}
                      onPress={() => setCategory(cat.val)}
                    >
                      <Text style={[styles.catChipText, category === cat.val && styles.catChipTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Quantity */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>수량 *</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQty(Math.max(1, parseInt(qty || '1') - 1).toString())}
                  >
                    <Ionicons name="remove" size={20} color="#475569" />
                  </TouchableOpacity>
                  <FormTextInput
                    style={styles.qtyInput}
                    value={qty}
                    onChangeText={setQty}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQty((parseInt(qty || '1') + 1).toString())}
                  >
                    <Ionicons name="add" size={20} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Price per Item */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>예상 가격 (1개당)</Text>
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
              </View>

              {/* Memo */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>메모 (선택)</Text>
                <FormTextInput
                  style={styles.textArea}
                  value={memo}
                  onChangeText={setMemo}
                  placeholder="예: 돈키호테 메가스토어 스스키노점 2층"
                  multiline={true}
                  numberOfLines={2}
                />
              </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  textArea: {
    height: 60,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catChipActive: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#ffffff',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyInput: {
    width: 80,
  },
  costInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
});
