import React from 'react';

import { FormModal } from '../forms/ModalForm';
import TripForm from './TripForm';
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
    <FormModal
      visible={visible}
      title="여행 일정 수정"
      submitLabel="저장하기"
      cancelLabel="취소"
      onClose={onClose}
      onSubmit={onSubmit}
      presentation="dialog"
    >
      <TripForm values={values} onChange={onChangeValues} />
    </FormModal>
  );
}
