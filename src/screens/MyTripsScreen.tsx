import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CITY_OPTIONS,
  buildDefaultTripTitle,
  getCityDetails,
  getDday,
  isTripMetadataFormValid,
} from '../services/tripMetadata';
import { TripMetadata, TripScheduleMode } from '../types/trip';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

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

type TripFormValues = {
  title: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  scheduleMode: TripScheduleMode;
};

const emptyForm: TripFormValues = {
  title: '',
  startDate: '',
  endDate: '',
  memberCount: 2,
  scheduleMode: 'recommended',
};

const formatDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateString = (dateString?: string) => {
  if (!dateString) return null;

  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getMonthTitle = (date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

const getCalendarDays = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const blanks = Array.from({ length: firstDay.getDay() }, () => null);
  const days = Array.from({ length: lastDay.getDate() }, (_, index) => new Date(year, month, index + 1));

  return [...blanks, ...days];
};

function DateField({
  value,
  onChangeText,
  min,
}: {
  value: string;
  onChangeText: (value: string) => void;
  min?: string;
}) {
  const initialMonth = parseDateString(value) || parseDateString(min) || new Date();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  );
  const selectedDate = parseDateString(value);
  const minDate = parseDateString(min);
  const calendarDays = getCalendarDays(visibleMonth);

  if (Platform.OS === 'web') {
    return React.createElement('input', {
      type: 'date',
      value,
      min,
      onChange: (event: any) => onChangeText(event.target.value),
      style: webDateInputStyle,
    });
  }

  return (
    <>
      <TouchableOpacity
        style={styles.dateInputButton}
        onPress={() => setPickerVisible(true)}
        activeOpacity={0.75}
      >
        <Text style={[styles.dateInputText, !value && styles.dateInputPlaceholder]}>
          {value || '날짜 선택'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color="#64748b" />
      </TouchableOpacity>

      <Modal
        visible={pickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarNavBtn}
                onPress={() =>
                  setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
                }
              >
                <Ionicons name="chevron-back" size={20} color="#0f172a" />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>{getMonthTitle(visibleMonth)}</Text>
              <TouchableOpacity
                style={styles.calendarNavBtn}
                onPress={() =>
                  setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
                }
              >
                <Ionicons name="chevron-forward" size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdayRow}>
              {['일', '월', '화', '수', '목', '금', '토'].map((weekday) => (
                <Text key={weekday} style={styles.weekdayText}>
                  {weekday}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <View key={`blank-${index}`} style={styles.calendarDayCell} />;
                }

                const dateString = formatDateString(day);
                const isSelected = selectedDate ? dateString === formatDateString(selectedDate) : false;
                const isDisabled = minDate ? dateString < formatDateString(minDate) : false;

                return (
                  <TouchableOpacity
                    key={dateString}
                    style={[
                      styles.calendarDayCell,
                      styles.calendarDayButton,
                      isSelected && styles.calendarDaySelected,
                      isDisabled && styles.calendarDayDisabled,
                    ]}
                    disabled={isDisabled}
                    onPress={() => {
                      onChangeText(dateString);
                      setPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSelected && styles.calendarDayTextSelected,
                        isDisabled && styles.calendarDayTextDisabled,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.calendarCloseBtn}
              onPress={() => setPickerVisible(false)}
            >
              <Text style={styles.calendarCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const addDaysToDateString = (dateString: string, days: number) => {
  if (!dateString) return '';

  const date = parseDateString(dateString);
  if (!date) return '';

  date.setDate(date.getDate() + days);
  return formatDateString(date);
};

const getMinEndDate = (startDate: string) => addDaysToDateString(startDate, 1);

function MemberCounter({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
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
          ...emptyForm,
          title: buildDefaultTripTitle(initialCityDetails.name),
        }
      : emptyForm,
  );

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTripId, setEditingTripId] = useState('');
  const [editForm, setEditForm] = useState<TripFormValues>(emptyForm);

  const resetCreateForm = () => {
    setCreateModalVisible(false);
    setStep(1);
    setSelectedCity('');
    setCreateForm(emptyForm);
    onInitialCreateCityHandled?.();
  };

  const openCreateModal = () => {
    setStep(1);
    setSelectedCity('');
    setCreateForm(emptyForm);
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
        {trips.map((trip) => {
          const city = getCityDetails(trip.cityCode);
          const isActive = trip.id === activeTripId;

          return (
            <TouchableOpacity
              key={trip.id}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => onSelectTrip(trip.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.cardHeader, { backgroundColor: city.bg }]}>
                <Text style={styles.cardDday}>{getDday(trip.startDate)}</Text>
                <Text style={styles.cardEmoji}>{city.emoji}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.cardActionBtn} onPress={() => handleEditOpen(trip)}>
                    <Ionicons name="create-outline" size={16} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cardActionBtn, styles.cardDeleteBtn]}
                    onPress={() => handleDeleteConfirm(trip.id, trip.title)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {trip.title}
                </Text>
                <Text style={styles.cardCity}>{city.name}</Text>
                <View style={styles.cardMetaRow}>
                  <Ionicons name="calendar-outline" size={12} color="#64748b" />
                  <Text style={styles.cardMetaText}>
                    {trip.startDate} ~ {trip.endDate}
                  </Text>
                </View>
                <View style={styles.cardMetaRow}>
                  <Ionicons name="people-outline" size={12} color="#64748b" />
                  <Text style={styles.cardMetaText}>{trip.memberCount}명 동행</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.newCard} onPress={openCreateModal} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={36} color="#6c5ce7" />
          <Text style={styles.newCardText}>새 여행 일정 만들기</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={createModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={resetCreateForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{step === 1 ? '여행지를 선택하세요' : '여행 정보 입력'}</Text>
              <TouchableOpacity onPress={resetCreateForm}>
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
                        setSelectedCity(city.code);
                        setCreateForm((prev) => ({
                          ...prev,
                          title: buildDefaultTripTitle(city.name),
                        }));
                        setStep(2);
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
                  values={createForm}
                  onChange={setCreateForm}
                  showScheduleMode={true}
                  footer={
                    <View style={styles.modalFooter}>
                      <TouchableOpacity onPress={() => setStep(1)} style={styles.btnBackStep}>
                        <Ionicons name="arrow-back" size={16} color="#64748b" />
                        <Text style={styles.btnBackStepText}>이전으로</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleCreateSubmit} style={styles.btnSubmit}>
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

      <Modal
        visible={editModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>여행 일정 수정</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
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
                values={editForm}
                onChange={setEditForm}
                footer={
                  <View style={styles.modalFooterOnly}>
                    <TouchableOpacity onPress={handleEditSubmit} style={[styles.btnSubmit, styles.btnFull]}>
                      <Text style={styles.btnSubmitText}>저장하기</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function TripForm({
  values,
  onChange,
  showScheduleMode = false,
  footer,
}: {
  values: TripFormValues;
  onChange: (values: TripFormValues | ((prev: TripFormValues) => TripFormValues)) => void;
  showScheduleMode?: boolean;
  footer: React.ReactNode;
}) {
  const minEndDate = getMinEndDate(values.startDate);

  const handleStartDateChange = (startDate: string) => {
    onChange((prev) => {
      const nextMinEndDate = getMinEndDate(startDate);
      const shouldMoveEndDate =
        nextMinEndDate && (!prev.endDate || prev.endDate <= startDate);

      return {
        ...prev,
        startDate,
        endDate: shouldMoveEndDate ? nextMinEndDate : prev.endDate,
      };
    });
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>여행 제목 *</Text>
        <TextInput
          style={styles.input}
          value={values.title}
          onChangeText={(title) => onChange((prev) => ({ ...prev, title }))}
          placeholder="예: 삿포로 여름 휴가"
        />
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, styles.formColumn]}>
          <Text style={styles.label}>출발일 *</Text>
          <DateField
            value={values.startDate}
            onChangeText={handleStartDateChange}
          />
        </View>
        <View style={[styles.formGroup, styles.formColumn]}>
          <Text style={styles.label}>도착일 *</Text>
          <DateField
            value={values.endDate}
            min={minEndDate || undefined}
            onChangeText={(endDate) => onChange((prev) => ({ ...prev, endDate }))}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>동행 인원 *</Text>
        <MemberCounter
          value={values.memberCount}
          onChange={(memberCount) => onChange((prev) => ({ ...prev, memberCount }))}
        />
      </View>

      {showScheduleMode && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>일정 시작 방식</Text>
          <View style={styles.scheduleModeGroup}>
            {[
              {
                value: 'recommended' as TripScheduleMode,
                icon: 'sparkles-outline' as const,
                title: '추천 일정으로 시작',
                desc: '도시와 여행 기간에 맞춰 기본 코스를 자동으로 채워드려요.',
              },
              {
                value: 'blank' as TripScheduleMode,
                icon: 'calendar-clear-outline' as const,
                title: '빈 일정으로 시작',
                desc: '날짜만 만들고 장소는 직접 하나씩 추가해요.',
              },
            ].map((option) => {
              const isActive = values.scheduleMode === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.scheduleModeCard, isActive && styles.scheduleModeCardActive]}
                  onPress={() => onChange((prev) => ({ ...prev, scheduleMode: option.value }))}
                  activeOpacity={0.8}
                >
                  <View style={[styles.scheduleModeIcon, isActive && styles.scheduleModeIconActive]}>
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={isActive ? '#6c5ce7' : '#64748b'}
                    />
                  </View>
                  <View style={styles.scheduleModeCopy}>
                    <Text style={[styles.scheduleModeTitle, isActive && styles.scheduleModeTitleActive]}>
                      {option.title}
                    </Text>
                    <Text style={styles.scheduleModeDesc}>{option.desc}</Text>
                  </View>
                  <View style={[styles.scheduleModeRadio, isActive && styles.scheduleModeRadioActive]}>
                    {isActive && <View style={styles.scheduleModeRadioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {footer}
    </View>
  );
}

const webDateInputStyle = {
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#cbd5e1',
  borderRadius: 10,
  paddingLeft: 12,
  paddingRight: 12,
  height: 44,
  fontSize: 14,
  backgroundColor: '#f8fafc',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  outline: 'none',
};

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
  card: {
    width: isTablet ? (width - 56) / 2 : width - 40,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardActive: {
    borderColor: '#6c5ce7',
    borderWidth: 2,
  },
  cardHeader: {
    height: 90,
    position: 'relative',
    padding: 16,
    justifyContent: 'flex-end',
  },
  cardDday: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '800',
    color: '#1e293b',
  },
  cardEmoji: {
    position: 'absolute',
    top: 14,
    right: 14,
    fontSize: 22,
  },
  cardActions: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
  },
  cardActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDeleteBtn: {
    backgroundColor: 'rgba(255, 76, 76, 0.65)',
  },
  cardBody: {
    padding: 16,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardCity: {
    fontSize: 12,
    color: '#6c5ce7',
    fontWeight: '700',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  newCard: {
    width: isTablet ? (width - 56) / 2 : width - 40,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
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
  formGroup: {
    gap: 6,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formColumn: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  dateInputButton: {
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateInputText: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
  },
  dateInputPlaceholder: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 18,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calendarNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekdayText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayButton: {
    borderRadius: 8,
  },
  calendarDaySelected: {
    backgroundColor: '#6c5ce7',
  },
  calendarDayDisabled: {
    opacity: 0.35,
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  calendarDayTextSelected: {
    color: '#ffffff',
  },
  calendarDayTextDisabled: {
    color: '#94a3b8',
  },
  calendarCloseBtn: {
    height: 42,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  calendarCloseText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
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
  scheduleModeGroup: {
    gap: 8,
  },
  scheduleModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  scheduleModeCardActive: {
    borderColor: '#6c5ce7',
    backgroundColor: 'rgba(108, 92, 231, 0.06)',
  },
  scheduleModeIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleModeIconActive: {
    backgroundColor: '#ffffff',
  },
  scheduleModeCopy: {
    flex: 1,
    gap: 2,
  },
  scheduleModeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  scheduleModeTitleActive: {
    color: '#5b4bd6',
  },
  scheduleModeDesc: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 16,
  },
  scheduleModeRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleModeRadioActive: {
    borderColor: '#6c5ce7',
  },
  scheduleModeRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6c5ce7',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  modalFooterOnly: {
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
  btnFull: {
    width: '100%',
  },
  btnSubmitText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
