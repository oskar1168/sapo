import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FormTextInput } from './ModalForm';

type QuantityStepperProps = {
  value: string;
  onChange: (value: string) => void;
  min?: number;
};

export default function QuantityStepper({ value, onChange, min = 1 }: QuantityStepperProps) {
  const parseValue = () => {
    const parsed = parseInt(value || String(min), 10);
    return Number.isNaN(parsed) ? min : parsed;
  };

  const decrement = () => {
    onChange(Math.max(min, parseValue() - 1).toString());
  };

  const increment = () => {
    onChange((parseValue() + 1).toString());
  };

  return (
    <View style={styles.qtyRow}>
      <TouchableOpacity style={styles.qtyBtn} onPress={decrement}>
        <Ionicons name="remove" size={20} color="#475569" />
      </TouchableOpacity>
      <FormTextInput
        style={styles.qtyInput}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        textAlign="center"
      />
      <TouchableOpacity style={styles.qtyBtn} onPress={increment}>
        <Ionicons name="add" size={20} color="#475569" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
