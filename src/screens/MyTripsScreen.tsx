import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  buildDefaultTripTitle,
  getCityDetails,
  isTripMetadataFormValid,
} from '../services/tripMetadata';
import CreateTripModal from '../components/my-trips/CreateTripModal';
import EditTripModal from '../components/my-trips/EditTripModal';
import TripCard, { tripCardWidth } from '../components/my-trips/TripCard';
import { emptyTripForm, TripFormValues } from '../components/my-trips/types';
import { TripMetadata } from '../types/trip';

interface MyTripsScreenProps {
  trips: TripMetadata[];
  activeTripId: string;
  onSelectTrip: (tripId: string) => void;
  onCreateTrip: (newTrip: Omit<TripMetadata, 'id'>) => void;
  onEditTrip: (updatedTrip: TripMetadata) => void;
  onDeleteTrip: (tripId: string) => void;
  onBackToExplore: () => void;
  initialCreateCity?: string | null;
  onInitialCreateCityHandled?: () => void;
}


export default function MyTripsScreen({
  trips,
  activeTripId,
  onSelectTrip,
  onCreateTrip,
  onEditTrip,
  onDeleteTrip,
  onBackToExplore,
  initialCreateCity,
  onInitialCreateCityHandled,
}: MyTripsScreenProps) {
  const initialCityDetails = initialCreateCity ? getCityDetails(initialCreateCity) : null;
  const [createModalVisible, setCreateModalVisible] = useState(Boolean(initialCreateCity));
  const [step, setStep] = useState(initialCreateCity ? 2 : 1);
  const [selectedCity, setSelectedCity] = useState(initialCityDetails?.code || '');
  const [createForm, setCreateForm] = useState<TripFormValues>(
    initialCityDetails
      ? {
          ...emptyTripForm,
          title: buildDefaultTripTitle(initialCityDetails.name),
        }
      : emptyTripForm,
  );

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTripId, setEditingTripId] = useState('');
  const [editForm, setEditForm] = useState<TripFormValues>(emptyTripForm);

  const resetCreateForm = () => {
    setCreateModalVisible(false);
    setStep(1);
    setSelectedCity('');
    setCreateForm(emptyTripForm);
    onInitialCreateCityHandled?.();
  };

  const openCreateModal = () => {
    setStep(1);
    setSelectedCity('');
    setCreateForm(emptyTripForm);
    setCreateModalVisible(true);
  };

  const handleCreateSubmit = () => {
    if (!isTripMetadataFormValid(createForm.title, createForm.startDate, createForm.endDate)) {
      Alert.alert('오류', '여행 제목과 날짜를 모두 입력해 주세요.');
      return;
    }

    onCreateTrip({
      cityCode: selectedCity || 'sapporo',
      title: createForm.title.trim(),
      startDate: createForm.startDate,
      endDate: createForm.endDate,
      memberCount: createForm.memberCount,
      scheduleMode: createForm.scheduleMode,
    });

    resetCreateForm();
  };

  const handleEditOpen = (trip: TripMetadata) => {
    setEditingTripId(trip.id);
    setEditForm({
      title: trip.title,
      startDate: trip.startDate,
      endDate: trip.endDate,
      memberCount: trip.memberCount,
      scheduleMode: trip.scheduleMode || 'recommended',
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    if (!isTripMetadataFormValid(editForm.title, editForm.startDate, editForm.endDate)) {
      Alert.alert('오류', '여행 제목과 날짜를 모두 입력해 주세요.');
      return;
    }

    onEditTrip({
      id: editingTripId,
      cityCode: trips.find((trip) => trip.id === editingTripId)?.cityCode || 'sapporo',
      title: editForm.title.trim(),
      startDate: editForm.startDate,
      endDate: editForm.endDate,
      memberCount: editForm.memberCount,
      scheduleMode: trips.find((trip) => trip.id === editingTripId)?.scheduleMode,
    });

    setEditModalVisible(false);
  };

  const handleDeleteConfirm = (tripId: string, title: string) => {
    const message = `'${title}' 일정을 삭제하시겠습니까?`;

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(message);
      if (confirmDelete) {
        onDeleteTrip(tripId);
      }
      return;
    }

    Alert.alert('일정 삭제', message, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => onDeleteTrip(tripId) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToExplore} style={styles.btnBack}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
          <Text style={styles.btnBackText}>탐색으로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 여행 일정</Text>
        <Text style={styles.headerSubtitle}>저장된 여행 계획을 관리하세요</Text>
      </View>

      <View style={styles.grid}>
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            isActive={trip.id === activeTripId}
            onSelect={onSelectTrip}
            onEdit={handleEditOpen}
            onDelete={handleDeleteConfirm}
          />
        ))}

        <TouchableOpacity style={styles.newCard} onPress={openCreateModal} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={36} color="#6c5ce7" />
          <Text style={styles.newCardText}>새 여행 일정 만들기</Text>
        </TouchableOpacity>
      </View>

      <CreateTripModal
        visible={createModalVisible}
        step={step}
        values={createForm}
        onChangeValues={setCreateForm}
        onChangeStep={setStep}
        onSelectCity={setSelectedCity}
        onClose={resetCreateForm}
        onSubmit={handleCreateSubmit}
      />

      <EditTripModal
        visible={editModalVisible}
        values={editForm}
        onChangeValues={setEditForm}
        onClose={() => setEditModalVisible(false)}
        onSubmit={handleEditSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  btnBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  btnBackText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  newCard: {
    width: tripCardWidth,
    height: 160,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(108, 92, 231, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(108, 92, 231, 0.02)',
  },
  newCardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6c5ce7',
  },
});
