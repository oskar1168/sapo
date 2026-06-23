import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import TripForm from './TripForm';
import { modalStyles } from './CreateTripModal';
import { TripFormValues } from './types';

type EditTripModalProps = {
  visible: boolean;
  values: TripFormValues;
  onChangeValues: (values: TripFormValues | ((prev: TripFormValues) => TripFormValues)) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function EditTripModal({
  visible,
  values,
  onChangeValues,
  onClose,
  onSubmit,
}: EditTripModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>여행 일정 수정</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TripForm
              values={values}
              onChange={onChangeValues}
              footer={
                <View style={styles.modalFooterOnly}>
                  <TouchableOpacity onPress={onSubmit} style={[styles.btnSubmit, styles.btnFull]}>
                    <Text style={styles.btnSubmitText}>저장하기</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  ...modalStyles,
  modalFooterOnly: {
    marginTop: 10,
  },
  btnSubmit: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnFull: {
    width: '100%',
  },
  btnSubmitText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
