import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExportPanelProps {
  onExportTimelinePDF: () => void;
  onExportBudgetPDF: () => void;
}

export default function ExportPanel({
  onExportTimelinePDF,
  onExportBudgetPDF,
}: ExportPanelProps) {
  return (
    <View style={styles.etcContainer}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>여행 일정 PDF 출력</Text>
        <Text style={styles.etcDesc}>
          작성한 여행 일정을 PDF 레이아웃으로 출력하거나 저장할 수 있습니다.
        </Text>
        <TouchableOpacity style={styles.btnPdfExport} onPress={onExportTimelinePDF}>
          <Ionicons name="document-text" size={16} color="#ffffff" />
          <Text style={styles.btnPdfExportText}>일정 PDF 출력/저장</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>예산 및 정산 보고서 PDF 출력</Text>
        <Text style={styles.etcDesc}>
          공동 경비와 쇼핑 지출을 합산해 정산 보고서를 PDF로 출력할 수 있습니다.
        </Text>
        <TouchableOpacity
          style={[styles.btnPdfExport, styles.btnBudgetExport]}
          onPress={onExportBudgetPDF}
        >
          <Ionicons name="wallet" size={16} color="#ffffff" />
          <Text style={styles.btnPdfExportText}>예산/정산 PDF 출력</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  etcContainer: {
    gap: 16,
  },
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
  etcDesc: {
    fontSize: 12.5,
    color: '#64748b',
    lineHeight: 18,
    marginTop: 6,
  },
  btnPdfExport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
    height: 44,
    gap: 8,
    marginTop: 14,
  },
  btnBudgetExport: {
    backgroundColor: '#e17055',
  },
  btnPdfExportText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});

