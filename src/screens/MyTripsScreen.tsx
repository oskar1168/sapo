import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

export interface TripMetadata {
  id: string;
  cityCode: string;
  title: string;
  startDate: string;
  endDate: string;
  memberCount: number;
}

interface MyTripsScreenProps {
  trips: TripMetadata[];
  activeTripId: string;
  onSelectTrip: (tripId: string) => void;
  onCreateTrip: (newTrip: Omit<TripMetadata, 'id'>) => void;
  onEditTrip: (updatedTrip: TripMetadata) => void;
  onDeleteTrip: (tripId: string) => void;
  onBackToExplore: () => void;
}

export default function MyTripsScreen({
  trips,
  activeTripId,
  onSelectTrip,
  onCreateTrip,
  onEditTrip,
  onDeleteTrip,
  onBackToExplore,
}: MyTripsScreenProps) {
  // Modal states for creating new trip
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState('');
  const [tripTitle, setTripTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [memberCount, setMemberCount] = useState(2);

  // Edit Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTripId, setEditingTripId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editMember, setEditMember] = useState(2);

  // Calculate D-day
  const getDday = (startDateStr: string) => {
    if (!startDateStr) return 'D-??';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  const getCityDetails = (cityCode: string) => {
    switch (cityCode) {
      case 'tokyo':
        return { emoji: '🗼', name: '도쿄', bg: '#ff7675' };
      case 'osaka':
        return { emoji: '🐙', name: '오사카', bg: '#fdcb6e' };
      default:
        return { emoji: '❄️', name: '삿포로 & 오타루', bg: '#6c5ce7' };
    }
  };

  const handleCreateSubmit = () => {
    if (!tripTitle.trim() || !startDate || !endDate) {
      Alert.alert('오류', '모든 정보를 성실히 입력해 주세요.');
      return;
    }

    onCreateTrip({
      cityCode: selectedCity,
      title: tripTitle.trim(),
      startDate,
      endDate,
      memberCount,
    });

    // Reset Form
    setCreateModalVisible(false);
    setStep(1);
    setSelectedCity('');
    setTripTitle('');
    setStartDate('');
    setEndDate('');
    setMemberCount(2);
  };

  const handleEditOpen = (trip: TripMetadata) => {
    setEditingTripId(trip.id);
    setEditTitle(trip.title);
    setEditStart(trip.startDate);
    setEditEnd(trip.endDate);
    setEditMember(trip.memberCount);
    setEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    if (!editTitle.trim() || !editStart || !editEnd) {
      Alert.alert('오류', '모든 필드를 입력해 주세요.');
      return;
    }

    onEditTrip({
      id: editingTripId,
      cityCode: trips.find((t) => t.id === editingTripId)?.cityCode || 'sapporo',
      title: editTitle.trim(),
      startDate: editStart,
      endDate: editEnd,
      memberCount: editMember,
    });

    setEditModalVisible(false);
  };

  const handleDeleteConfirm = (tripId: string, title: string) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`'${title}' 일정을 삭제하시겠습니까?`);
      if (confirmDelete) {
        onDeleteTrip(tripId);
      }
    } else {
      Alert.alert('일정 삭제', `'${title}' 일정을 삭제하시겠습니까?`, [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => onDeleteTrip(tripId) },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToExplore} style={styles.btnBack}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
          <Text style={styles.btnBackText}>홈으로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>✈️ 어디로 떠나시나요?</Text>
        <Text style={styles.headerSubtitle}>나의 여행 계획 목록</Text>
      </View>

      {/* Trips Grid */}
      <View style={styles.grid}>
        {trips.map((trip) => {
          const city = getCityDetails(trip.cityCode);
          const dday = getDday(trip.startDate);
          const isActive = trip.id === activeTripId;

          return (
            <TouchableOpacity
              key={trip.id}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => onSelectTrip(trip.id)}
              activeOpacity={0.8}
            >
              {/* Image banner replacement with custom gradient */}
              <View style={[styles.cardHeader, { backgroundColor: city.bg }]}>
                <Text style={styles.cardDday}>{dday}</Text>
                <Text style={styles.cardEmoji}>{city.emoji}</Text>

                {/* Edit & Delete absolute buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.cardActionBtn}
                    onPress={() => handleEditOpen(trip)}
                  >
                    <Ionicons name="create-outline" size={16} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cardActionBtn, { backgroundColor: 'rgba(255, 76, 76, 0.6)' }]}
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

        {/* Add New Trip Dotted Card */}
        <TouchableOpacity
          style={styles.newCard}
          onPress={() => {
            setStep(1);
            setCreateModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={36} color="#6c5ce7" />
          <Text style={styles.newCardText}>새 여행 일정 만들기</Text>
        </TouchableOpacity>
      </View>

      {/* CREATE TRIP MODAL (2-STEP) */}
      <Modal
        visible={createModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {step === 1 ? '어디로 여행을 떠나시나요? ✈️' : '여행 상세 설정'}
              </Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Step 1: Destination Selection */}
            {step === 1 && (
              <View style={styles.stepContainer}>
                {[
                  { code: 'sapporo', name: '삿포로 & 오타루', desc: '초여름 낭만과 설경의 도시', emoji: '❄️' },
                  { code: 'tokyo', name: '도쿄 (Tokyo)', desc: '쇼핑과 미식, 화려한 도심', emoji: '🗼' },
                  { code: 'osaka', name: '오사카 & 교토', desc: '먹방 오사카와 천년고도 교토', emoji: '🐙' },
                ].map((city) => (
                  <TouchableOpacity
                    key={city.code}
                    style={styles.cityItem}
                    onPress={() => {
                      setSelectedCity(city.code);
                      setTripTitle(`${city.name} 힐링 여행 ✈️`);
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

            {/* Step 2: Date & Title Setup */}
            {step === 2 && (
              <View style={styles.stepContainer}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>여행 제목 *</Text>
                  <TextInput
                    style={styles.input}
                    value={tripTitle}
                    onChangeText={setTripTitle}
                    placeholder="예: 삿포로 여름 휴가"
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>출발일 *</Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{
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
                        }}
                      />
                    ) : (
                      <TextInput
                        style={styles.input}
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="YYYY-MM-DD"
                      />
                    )}
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>도착일 *</Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{
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
                        }}
                      />
                    ) : (
                      <TextInput
                        style={styles.input}
                        value={endDate}
                        onChangeText={setEndDate}
                        placeholder="YYYY-MM-DD"
                      />
                    )}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>동행인원 (명) *</Text>
                  <View style={styles.memberCounter}>
                    <TouchableOpacity
                      onPress={() => setMemberCount(Math.max(1, memberCount - 1))}
                      style={styles.counterBtn}
                    >
                      <Ionicons name="remove" size={18} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.counterText}>{memberCount}명</Text>
                    <TouchableOpacity
                      onPress={() => setMemberCount(memberCount + 1)}
                      style={styles.counterBtn}
                    >
                      <Ionicons name="add" size={18} color="#0f172a" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Footer Buttons */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity onPress={() => setStep(1)} style={styles.btnBackStep}>
                    <Ionicons name="arrow-back" size={16} color="#64748b" />
                    <Text style={styles.btnBackStepText}>이전으로</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCreateSubmit} style={styles.btnSubmit}>
                    <Text style={styles.btnSubmitText}>일정 만들기 🚀</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* EDIT TRIP METADATA MODAL */}
      <Modal
        visible={editModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>여행 일정 수정 ✏️</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>여행 제목 *</Text>
                <TextInput
                  style={styles.input}
                  value={editTitle}
                  onChangeText={setEditTitle}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>출발일 *</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="date"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      style={{
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
                      }}
                    />
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={editStart}
                      onChangeText={setEditStart}
                      placeholder="YYYY-MM-DD"
                    />
                  )}
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>도착일 *</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="date"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      style={{
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
                      }}
                    />
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={editEnd}
                      onChangeText={setEditEnd}
                      placeholder="YYYY-MM-DD"
                    />
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>동행인원 (명) *</Text>
                <View style={styles.memberCounter}>
                  <TouchableOpacity
                    onPress={() => setEditMember(Math.max(1, editMember - 1))}
                    style={styles.counterBtn}
                  >
                    <Ionicons name="remove" size={18} color="#0f172a" />
                  </TouchableOpacity>
                  <Text style={styles.counterText}>{editMember}명</Text>
                  <TouchableOpacity
                    onPress={() => setEditMember(editMember + 1)}
                    style={styles.counterBtn}
                  >
                    <Ionicons name="add" size={18} color="#0f172a" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalFooterOnly}>
                <TouchableOpacity onPress={handleEditSubmit} style={[styles.btnSubmit, { width: '100%' }]}>
                  <Text style={styles.btnSubmitText}>저장하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  card: {
    width: isTablet ? (width - 56) / 2 : width - 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
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
    borderColor: '#a29bfe',
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
    borderRadius: 12,
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
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 20,
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
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
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
  stepContainer: {
    gap: 14,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
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
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  memberCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
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
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSubmitText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
