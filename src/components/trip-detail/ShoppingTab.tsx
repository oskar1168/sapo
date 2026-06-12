import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ShoppingItem } from '../../constants/travelData';

interface ShoppingTabProps {
  shoppingList: ShoppingItem[];
  shoppingTotalCostKRW: number;
  exchangeRate: number;
  onAddShopping: () => void;
  onEditShopping: (item: ShoppingItem) => void;
  onToggleShoppingCheck: (itemId: number) => void;
  onDeleteShopping: (itemId: number) => void;
}

export default function ShoppingTab({
  shoppingList,
  shoppingTotalCostKRW,
  exchangeRate,
  onAddShopping,
  onEditShopping,
  onToggleShoppingCheck,
  onDeleteShopping,
}: ShoppingTabProps) {
  return (
    <ScrollView contentContainerStyle={styles.shoppingScroll}>
      <View style={styles.shoppingSummaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>쇼핑 완료 금액</Text>
          <Text style={styles.summaryValue}>{shoppingTotalCostKRW.toLocaleString()}원</Text>
        </View>

        <TouchableOpacity
          style={styles.donkiBanner}
          activeOpacity={0.8}
          onPress={() => Alert.alert('쿠폰 안내', '제휴 쿠폰 연결 기능을 준비 중입니다.')}
        >
          <Ionicons name="gift" size={20} color="#ff7675" />
          <View style={styles.donkiTextGroup}>
            <Text style={styles.donkiTitle}>쇼핑 쿠폰 바로가기</Text>
            <Text style={styles.donkiSub}>면세, 드럭스토어, 기념품 할인 정보를 모아볼 수 있어요.</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#a29bfe" />
        </TouchableOpacity>
      </View>

      <View style={styles.shoppingHeaderRow}>
        <Text style={styles.shoppingListTitle}>쇼핑 목록</Text>
        <TouchableOpacity style={styles.btnAddShopping} onPress={onAddShopping}>
          <Ionicons name="add-circle" size={16} color="#ffffff" />
          <Text style={styles.btnAddShoppingText}>아이템 추가</Text>
        </TouchableOpacity>
      </View>

      {shoppingList.length === 0 ? (
        <View style={styles.emptyShopping}>
          <Ionicons name="cart-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyText}>등록된 쇼핑 아이템이 없습니다.</Text>
        </View>
      ) : (
        shoppingList.map((item) => (
          <View
            key={item.id}
            style={[styles.shoppingItemCard, item.checked && styles.shoppingItemCardChecked]}
          >
            <TouchableOpacity
              onPress={() => onToggleShoppingCheck(item.id)}
              style={styles.shoppingCheckbox}
            >
              <Ionicons
                name={item.checked ? 'checkbox' : 'square-outline'}
                size={22}
                color={item.checked ? '#6c5ce7' : '#cbd5e1'}
              />
            </TouchableOpacity>

            <View style={styles.shoppingInfo}>
              <Text style={[styles.shoppingName, item.checked && styles.shoppingNameChecked]}>
                {getCategoryEmoji(item.category)} {item.name}
              </Text>
              <Text style={styles.shoppingQty}>수량: {item.qty}개</Text>
              {item.cost ? (
                <Text style={styles.shoppingCost}>
                  가격: {item.cost.toLocaleString()}
                  {item.currency === 'JPY' ? ' JPY' : ' KRW'}
                  {item.currency === 'JPY' ? (
                    <Text style={styles.shoppingCostConversion}>
                      {' '}
                      ({Math.round(item.cost * item.qty * exchangeRate).toLocaleString()}원)
                    </Text>
                  ) : null}
                </Text>
              ) : null}
              {item.memo ? <Text style={styles.shoppingMemo}>Memo: {item.memo}</Text> : null}
            </View>

            <View style={styles.shoppingActions}>
              <TouchableOpacity onPress={() => onEditShopping(item)}>
                <Ionicons name="pencil" size={16} color="#64748b" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDeleteShopping(item.id)}>
                <Ionicons name="trash" size={16} color="#ff7675" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function getCategoryEmoji(category: string) {
  if (category === 'dessert') return 'Dessert';
  if (category === 'drug') return 'Drug';
  if (category === 'alcohol') return 'Drink';
  if (category === 'souvenir') return 'Gift';
  return 'Item';
}

const styles = StyleSheet.create({
  shoppingScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  shoppingSummaryBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6c5ce7',
  },
  donkiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 121, 168, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(253, 121, 168, 0.2)',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  donkiTextGroup: {
    flex: 1,
    gap: 2,
  },
  donkiTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  donkiSub: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  shoppingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  shoppingListTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  btnAddShopping: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  btnAddShoppingText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyShopping: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  shoppingItemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  shoppingItemCardChecked: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    opacity: 0.65,
  },
  shoppingCheckbox: {
    padding: 2,
  },
  shoppingInfo: {
    flex: 1,
    gap: 2,
  },
  shoppingName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  shoppingNameChecked: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  shoppingQty: {
    fontSize: 11,
    color: '#64748b',
  },
  shoppingCost: {
    fontSize: 11,
    fontWeight: '700',
    color: '#27ae60',
  },
  shoppingCostConversion: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'normal',
  },
  shoppingMemo: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  shoppingActions: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'center',
  },
});

