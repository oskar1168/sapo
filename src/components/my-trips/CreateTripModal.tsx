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

import { CITY_OPTIONS, buildDefaultTripTitle } from '../../services/tripMetadata';
import TripForm from './TripForm';
import { TripFormValues } from './types';

type CreateTripModalProps = {
  visible: boolean;
  step: number;
  values: TripFormValues;
  onChangeValues: (values: TripFormValues | ((prev: TripFormValues) => TripFormValues)) => void;
  onChangeStep: (step: number) => void;
  onSelectCity: (cityCode: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function CreateTripModal({
  visible,
  step,
  values,
  onChangeValues,
  onChangeStep,
  onSelectCity,
  onClose,
  onSubmit,
}: CreateTripModalProps) {
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
            <Text style={styles.modalTitle}>{step === 1 ? '여행지를 선택하세요' : '여행 정보 입력'}</Text>
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
            {step === 1 && (
              <View style={styles.stepContainer}>
                {CITY_OPTIONS.map((city) => (
                  <TouchableOpacity
                    key={city.code}
                    style={styles.cityItem}
                    onPress={() => {
                      onSelectCity(city.code);
                      onChangeValues((prev) => ({
                        ...prev,
                        title: buildDefaultTripTitle(city.name),
                      }));
                      onChangeStep(2);
                    }}
                  >
                    <Text style={styles.cityEmoji}>{city.emoji}</Text>
                    <View style={styles.cityInfo}>
                      <Text style={styles.cityName}>{city.name}</Text>
                      <Text style={styles.cityDesc}>{city.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step === 2 && (
              <TripForm
                values={values}
                onChange={onChangeValues}
                showScheduleMode={true}
                footer={
                  <View style={styles.modalFooter}>
                    <TouchableOpacity onPress={() => onChangeStep(1)} style={styles.btnBackStep}>
                      <Ionicons name="arrow-back" size={16} color="#64748b" />
                      <Text style={styles.btnBackStepText}>이전으로</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onSubmit} style={styles.btnSubmit}>
                      <Text style={styles.btnSubmitText}>일정 만들기</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
    padding: 24,
    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
    paddingRight: 10,
  },
  modalBody: {
    marginHorizontal: -4,
  },
  modalBodyContent: {
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
});

const styles = StyleSheet.create({
  ...modalStyles,
  stepContainer: {
    gap: 14,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 14,
  },
  cityEmoji: {
    fontSize: 28,
  },
  cityInfo: {
    flex: 1,
    gap: 2,
  },
  cityName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  cityDesc: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  btnBackStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 10,
  },
  btnBackStepText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748b',
  },
  btnSubmit: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSubmitText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
