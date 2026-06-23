import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MemberCounterProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function MemberCounter({ value, onChange }: MemberCounterProps) {
  return (
    <View style={styles.memberCounter}>
      <TouchableOpacity onPress={() => onChange(Math.max(1, value - 1))} style={styles.counterBtn}>
        <Ionicons name="remove" size={18} color="#0f172a" />
      </TouchableOpacity>
      <Text style={styles.counterText}>{value}명</Text>
      <TouchableOpacity onPress={() => onChange(value + 1)} style={styles.counterBtn}>
        <Ionicons name="add" size={18} color="#0f172a" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  memberCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    height: 44,
    width: 140,
    overflow: 'hidden',
  },
  counterBtn: {
    width: 44,
    height: '100%',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
});
