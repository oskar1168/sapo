import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CITY_OPTIONS, buildDefaultTripTitle } from '../../services/tripMetadata';
import { FormModal } from '../forms/ModalForm';
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
  const footer =
    step === 2 ? (
      <View style={styles.modalFooter}>
        <TouchableOpacity onPress={() => onChangeStep(1)} style={styles.btnBackStep}>
          <Ionicons name="arrow-back" size={16} color="#64748b" />
          <Text style={styles.btnBackStepText}>이전으로</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSubmit} style={styles.btnSubmit}>
          <Text style={styles.btnSubmitText}>일정 만들기</Text>
        </TouchableOpacity>
      </View>
    ) : null;

  return (
    <FormModal
      visible={visible}
      title={step === 1 ? '여행지를 선택하세요' : '여행 정보 입력'}
      onClose={onClose}
      footer={footer}
      presentation="dialog"
    >
      {step === 1 ? (
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
      ) : (
        <TripForm values={values} onChange={onChangeValues} showScheduleMode={true} />
      )}
    </FormModal>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
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
