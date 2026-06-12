import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SettlementPanelProps {
  memberCount: number;
  totalBudgetKRW: number;
  shoppingTotalCostKRW: number;
  onChangeMemberCount: (memberCount: number) => void;
}

export default function SettlementPanel({
  memberCount,
  totalBudgetKRW,
  shoppingTotalCostKRW,
  onChangeMemberCount,
}: SettlementPanelProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>여행 예산 및 N분의 1 정산</Text>

      <View style={styles.budgetSummaryBox}>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>총 예상 지출</Text>
          <Text style={styles.budgetValue}>
            {Math.round(totalBudgetKRW * memberCount).toLocaleString()}원
          </Text>
        </View>
        <View style={styles.budgetDivider} />
        <View style={styles.memberInputRow}>
          <Text style={styles.budgetLabel}>함께 가는 인원</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtnSmall}
              onPress={() => onChangeMemberCount(Math.max(1, memberCount - 1))}
            >
              <Ionicons name="remove" size={14} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.counterValueSmall}>{memberCount}명</Text>
            <TouchableOpacity
              style={styles.counterBtnSmall}
              onPress={() => onChangeMemberCount(memberCount + 1)}
            >
              <Ionicons name="add" size={14} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.budgetDivider} />
        <View style={[styles.budgetRow, styles.highlightRow]}>
          <Text style={styles.highlightLabel}>1인당 예상 정산 금액</Text>
          <Text style={styles.highlightValue}>{Math.round(totalBudgetKRW).toLocaleString()}원</Text>
        </View>
      </View>

      <View style={styles.shoppingTotalCard}>
        <Text style={styles.shoppingTotalTitle}>내 쇼핑 금액</Text>
        <Text style={styles.shoppingTotalVal}>{shoppingTotalCostKRW.toLocaleString()}원</Text>
        <Text style={styles.shoppingTotalDesc}>
          쇼핑 리스트에서 체크한 항목들의 합계입니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  budgetSummaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 10,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6c5ce7',
  },
  budgetDivider: {
    height: 0.5,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  memberInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    height: 30,
    width: 100,
  },
  counterBtnSmall: {
    width: 30,
    height: '100%',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValueSmall: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  highlightRow: {
    marginTop: 4,
  },
  highlightLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2ecc71',
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2ecc71',
  },
  shoppingTotalCard: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    gap: 4,
  },
  shoppingTotalTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  shoppingTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#27ae60',
  },
  shoppingTotalDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
});

