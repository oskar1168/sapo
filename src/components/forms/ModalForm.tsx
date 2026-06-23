import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FormModalProps = {
  visible: boolean;
  title: string;
  submitLabel: string;
  cancelLabel: string;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
};

type FormFieldProps = {
  label: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

type FormTextInputProps = TextInputProps & {
  inputStyle?: StyleProp<TextStyle>;
  locked?: boolean;
};

type CurrencyToggleProps = {
  value: string;
  onChange: (currency: string) => void;
};

export function FormModal({
  visible,
  title,
  submitLabel,
  cancelLabel,
  onClose,
  onSubmit,
  children,
}: FormModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContentContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.btnClose}>
                <Ionicons name="close" size={24} color="#60646c" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={styles.btnCancel}>
                <Text style={styles.btnCancelText}>{cancelLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSubmit} style={styles.btnSubmit}>
                <Text style={styles.btnSubmitText}>{submitLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export function FormField({ label, children, style }: FormFieldProps) {
  return (
    <View style={[styles.formGroup, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export function FormTextInput({ inputStyle, locked = false, style, ...props }: FormTextInputProps) {
  return <TextInput {...props} style={[styles.input, locked && styles.inputLocked, style, inputStyle]} />;
}

export function CurrencyToggle({ value, onChange }: CurrencyToggleProps) {
  return (
    <View style={styles.currencyToggleRow}>
      {['JPY', 'KRW'].map((currency) => (
        <TouchableOpacity
          key={currency}
          style={[styles.currBtn, value === currency && styles.currBtnActive]}
          onPress={() => onChange(currency)}
        >
          <Text style={[styles.currBtnText, value === currency && styles.currBtnTextActive]}>
            {currency === 'JPY' ? '엔 ¥' : '원 ₩'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export const modalFormStyles = StyleSheet.create({
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  costInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  textArea: {
    paddingTop: 10,
    textAlignVertical: 'top',
  },
});

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
