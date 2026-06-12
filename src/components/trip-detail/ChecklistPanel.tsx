import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ChecklistItem } from '../../constants/travelData';

interface ChecklistPanelProps {
  checklist: ChecklistItem[];
  newChecklistText: string;
  onChangeNewChecklistText: (value: string) => void;
  onAddChecklist: () => void;
  onToggleChecklist: (itemId: number) => void;
  onResetChecklist: () => void;
}

export default function ChecklistPanel({
  checklist,
  newChecklistText,
  onChangeNewChecklistText,
  onAddChecklist,
  onToggleChecklist,
  onResetChecklist,
}: ChecklistPanelProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>여행 준비물 체크리스트</Text>
        <TouchableOpacity onPress={onResetChecklist}>
          <Ionicons name="refresh" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.checklistAddForm}>
        <TextInput
          style={styles.input}
          value={newChecklistText}
          onChangeText={onChangeNewChecklistText}
          placeholder="준비물 직접 추가..."
        />
        <TouchableOpacity onPress={onAddChecklist} style={styles.btnAddChecklist}>
          <Ionicons name="add" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {checklist.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.checklistRow}
          onPress={() => onToggleChecklist(item.id)}
        >
          <Ionicons
            name={item.checked ? 'checkbox' : 'square-outline'}
            size={20}
            color={item.checked ? '#2ecc71' : '#cbd5e1'}
          />
          <Text style={[styles.checklistText, item.checked && styles.checklistTextChecked]}>
            {item.text}
          </Text>
        </TouchableOpacity>
      ))}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  checklistAddForm: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: '#f8fafc',
  },
  btnAddChecklist: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  checklistText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  checklistTextChecked: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
});

