import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image, Modal } from 'react-native';

const walkingSummerGif = require('../../assets/walking_summer.gif');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CITY_TEMPLATES, ActivityItem } from '../constants/travelData';
import ExploreScreen from '../screens/ExploreScreen';
import MyTripsScreen, { TripMetadata } from '../screens/MyTripsScreen';
import TripDetailScreen from '../screens/TripDetailScreen';

export default function AppIndex() {
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'explore' | 'myTrips' | 'detail'>('explore');

  // Core App states
  const [tripsList, setTripsList] = useState<TripMetadata[]>([]);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [activeTripId, setActiveTripId] = useState<string>('');
  const [travelData, setTravelData] = useState<any>(null); // Detail data of active trip
  const [likedSpots, setLikedSpots] = useState<{ city: string; originalIndex: number }[]>([]);
  const [autoAddSpot, setAutoAddSpot] = useState<{ city: string; originalIndex: number } | null>(null);

  // 1. Initial State Load from AsyncStorage
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedTrips = await AsyncStorage.getItem('sapo_trips_list');
        const savedLiked = await AsyncStorage.getItem('sapo_liked_spots');
        const savedActiveId = await AsyncStorage.getItem('sapo_active_trip_id');

        let parsedTrips: TripMetadata[] = savedTrips ? JSON.parse(savedTrips) : [];
        let parsedLiked = savedLiked ? JSON.parse(savedLiked) : [];
        let activeId = savedActiveId || '';

        // If app has 0 trips, pre-initialize with Sapporo as default template
        if (parsedTrips.length === 0) {
          const sapporoTemp = CITY_TEMPLATES.sapporo;
          const defaultTripId = `trip-${Date.now()}`;
          
          const defaultTripMeta: TripMetadata = {
            id: defaultTripId,
            cityCode: sapporoTemp.cityCode,
            title: sapporoTemp.title,
            startDate: sapporoTemp.startDate,
            endDate: sapporoTemp.endDate,
            memberCount: sapporoTemp.memberCount,
          };

          parsedTrips = [defaultTripMeta];
          activeId = defaultTripId;

          // Save detail data
          await AsyncStorage.setItem(`sapo_trip_detail_${defaultTripId}`, JSON.stringify(sapporoTemp));
          await AsyncStorage.setItem('sapo_trips_list', JSON.stringify(parsedTrips));
          await AsyncStorage.setItem('sapo_active_trip_id', defaultTripId);
        }

        setTripsList(parsedTrips);
        setLikedSpots(parsedLiked);
        setActiveTripId(activeId);

        // Fetch detailed data of active trip
        if (activeId) {
          const detailData = await AsyncStorage.getItem(`sapo_trip_detail_${activeId}`);
          if (detailData) {
            setTravelData(JSON.parse(detailData));
          } else {
            // fallback template
            const sapporoTemp = CITY_TEMPLATES.sapporo;
            setTravelData(sapporoTemp);
            await AsyncStorage.setItem(`sapo_trip_detail_${activeId}`, JSON.stringify(sapporoTemp));
          }
        }
      } catch (e) {
        console.warn('Failed to load initial data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadSavedData();
  }, []);

  // Sync trips list change to storage
  const saveTripsList = async (newList: TripMetadata[]) => {
    setTripsList(newList);
    try {
      await AsyncStorage.setItem('sapo_trips_list', JSON.stringify(newList));
    } catch (e) {
      console.warn('Failed to save trips list:', e);
    }
  };

  // Sync liked spots change to storage
  const saveLikedSpots = async (newLiked: typeof likedSpots) => {
    setLikedSpots(newLiked);
    try {
      await AsyncStorage.setItem('sapo_liked_spots', JSON.stringify(newLiked));
    } catch (e) {
      console.warn('Failed to save liked spots:', e);
    }
  };

  // CRUD: Create Trip
  const handleCreateTrip = async (newTripMeta: Omit<TripMetadata, 'id'>) => {
    const newId = `trip-${Date.now()}`;
    const tripMeta: TripMetadata = { id: newId, ...newTripMeta };
    const newList = [tripMeta, ...tripsList];
    
    // Copy default template based on cityCode
    const template = CITY_TEMPLATES[newTripMeta.cityCode] || CITY_TEMPLATES.sapporo;
    const initialTripDetail = {
      ...template,
      title: newTripMeta.title,
      startDate: newTripMeta.startDate,
      endDate: newTripMeta.endDate,
      memberCount: newTripMeta.memberCount,
    };

    setIsCreatingTrip(true);

    // Save
    try {
      await AsyncStorage.setItem(`sapo_trip_detail_${newId}`, JSON.stringify(initialTripDetail));
      await AsyncStorage.setItem('sapo_active_trip_id', newId);
    } catch (e) {
      console.warn('Failed to save trip detail:', e);
    }

    await saveTripsList(newList);
    setActiveTripId(newId);
    setTravelData(initialTripDetail);
    
    // 3초간 Splash 로더 화면 노출 후 상세 뷰로 전환
    setTimeout(() => {
      setIsCreatingTrip(false);
      setCurrentView('detail');
    }, 3000);
  };

  // CRUD: Update Trip Metadata
  const handleEditTripMetadata = async (updatedMeta: TripMetadata) => {
    const newList = tripsList.map((t) => (t.id === updatedMeta.id ? updatedMeta : t));
    await saveTripsList(newList);

    // Also sync values inside detail object
    try {
      const detailStr = await AsyncStorage.getItem(`sapo_trip_detail_${updatedMeta.id}`);
      if (detailStr) {
        const detailObj = JSON.parse(detailStr);
        detailObj.title = updatedMeta.title;
        detailObj.startDate = updatedMeta.startDate;
        detailObj.endDate = updatedMeta.endDate;
        detailObj.memberCount = updatedMeta.memberCount;
        
        await AsyncStorage.setItem(`sapo_trip_detail_${updatedMeta.id}`, JSON.stringify(detailObj));
        
        if (updatedMeta.id === activeTripId) {
          setTravelData(detailObj);
        }
      }
    } catch (e) {
      console.warn('Failed to sync edited metadata:', e);
    }
  };

  // CRUD: Delete Trip
  const handleDeleteTrip = async (tripId: string) => {
    const newList = tripsList.filter((t) => t.id !== tripId);
    await saveTripsList(newList);

    try {
      await AsyncStorage.removeItem(`sapo_trip_detail_${tripId}`);
      
      // If we deleted the active trip, assign new active
      if (tripId === activeTripId) {
        if (newList.length > 0) {
          const nextActiveId = newList[0].id;
          setActiveTripId(nextActiveId);
          await AsyncStorage.setItem('sapo_active_trip_id', nextActiveId);
          
          const nextDetail = await AsyncStorage.getItem(`sapo_trip_detail_${nextActiveId}`);
          setTravelData(nextDetail ? JSON.parse(nextDetail) : null);
        } else {
          setActiveTripId('');
          setTravelData(null);
          await AsyncStorage.removeItem('sapo_active_trip_id');
        }
      }
    } catch (e) {
      console.warn('Failed to delete trip data:', e);
    }
  };

  // CRUD: Update active trip detail (e.g., activities, checklist, shopping)
  const handleUpdateTripData = async (updatedDetail: any) => {
    setTravelData(updatedDetail);
    if (!activeTripId) return;

    try {
      await AsyncStorage.setItem(`sapo_trip_detail_${activeTripId}`, JSON.stringify(updatedDetail));
      
      // Sync title/dates in metadata list as well
      const updatedList = tripsList.map((t) => {
        if (t.id === activeTripId) {
          return {
            ...t,
            title: updatedDetail.title,
            startDate: updatedDetail.startDate,
            endDate: updatedDetail.endDate,
            memberCount: updatedDetail.memberCount,
          };
        }
        return t;
      });
      setTripsList(updatedList);
      await AsyncStorage.setItem('sapo_trips_list', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Failed to save detailed trip updates:', e);
    }
  };

  // Select another trip
  const handleSelectTrip = async (tripId: string) => {
    setActiveTripId(tripId);
    try {
      await AsyncStorage.setItem('sapo_active_trip_id', tripId);
      const detailStr = await AsyncStorage.getItem(`sapo_trip_detail_${tripId}`);
      if (detailStr) {
        setTravelData(JSON.parse(detailStr));
      }
    } catch (e) {
      console.warn('Failed to select trip:', e);
    }
    setCurrentView('detail');
  };

  // Toggle Spot Liked
  const handleToggleLike = (city: string, originalIndex: number) => {
    const existsIdx = likedSpots.findIndex(
      (s) => s.city === city && s.originalIndex === originalIndex
    );
    let newLiked = [...likedSpots];

    if (existsIdx > -1) {
      newLiked.splice(existsIdx, 1);
    } else {
      newLiked.push({ city, originalIndex });
    }
    saveLikedSpots(newLiked);
  };

  // Add Recommended Spot directly from explore screen
  const handleAddSpotToTimeline = (city: string, originalIndex: number) => {
    // Navigate to detail view and auto trigger Place modal
    setAutoAddSpot({ city, originalIndex });
    setCurrentView('detail');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>데이터 동기화 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      {/* 1단계: Explore View */}
      {currentView === 'explore' ? (
        <ExploreScreen
          likedSpots={likedSpots}
          onToggleLike={handleToggleLike}
          onAddSpotToTimeline={handleAddSpotToTimeline}
          onNavigateToMyTrips={() => setCurrentView('myTrips')}
          cityCode={travelData?.cityCode || 'sapporo'}
        />
      ) : null}

      {/* 2단계: Trip List View */}
      {currentView === 'myTrips' ? (
        <MyTripsScreen
          trips={tripsList}
          activeTripId={activeTripId}
          onSelectTrip={handleSelectTrip}
          onCreateTrip={handleCreateTrip}
          onEditTrip={handleEditTripMetadata}
          onDeleteTrip={handleDeleteTrip}
          onBackToExplore={() => setCurrentView('explore')}
        />
      ) : null}

      {/* 3단계: Trip Detail View */}
      {currentView === 'detail' && travelData ? (
        <TripDetailScreen
          tripId={activeTripId}
          travelData={travelData}
          likedSpots={likedSpots}
          onToggleLike={handleToggleLike}
          onUpdateTripData={handleUpdateTripData}
          onBackToExplore={() => setCurrentView('explore')}
          autoAddSpot={autoAddSpot}
          onClearAutoAddSpot={() => setAutoAddSpot(null)}
        />
      ) : null}

      {/* 일정 생성 중 로딩 (Splash Intro) */}
      <Modal visible={isCreatingTrip} transparent={true} animationType="fade">
        <View style={styles.splashOverlay}>
          <Image
            source={walkingSummerGif}
            style={styles.splashGif}
            resizeMode="contain"
          />
          <Text style={styles.splashText}>새로운 여행 계획 방을 개설하고 있습니다...</Text>
          <Text style={styles.splashSubtext}>잠시만 기다려 주세요 ✈️</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
  },
  splashOverlay: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  splashGif: {
    width: 280,
    height: 280,
    borderRadius: 24,
    marginBottom: 20,
  },
  splashText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
  },
  splashSubtext: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
});
