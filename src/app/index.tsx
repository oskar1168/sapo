import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image, Modal } from 'react-native';
import ExploreScreen from '../screens/ExploreScreen';
import MyTripsScreen from '../screens/MyTripsScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import {
  createTrip,
  deleteTrip,
  loadInitialTripSnapshot,
  persistLikedSpots,
  selectTrip,
  updateActiveTripDetail,
  updateTripMetadata,
} from '../services/tripRepository';
import { getSpotDetail, isSameSpotRef, loadSpotCatalog, loadCitySpots } from '../services/spotCatalog';
import { SpotRef } from '../types/spot';
import { TripMetadata } from '../types/trip';

const walkingSummerGif = require('../../assets/walking_summer.gif');

export default function AppIndex() {
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'explore' | 'myTrips' | 'detail'>('explore');

  // Core App states
  const [tripsList, setTripsList] = useState<TripMetadata[]>([]);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [activeTripId, setActiveTripId] = useState<string>('');
  const [travelData, setTravelData] = useState<any>(null); // Detail data of active trip
  const [likedSpots, setLikedSpots] = useState<SpotRef[]>([]);
  const [autoAddSpot, setAutoAddSpot] = useState<SpotRef | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialCreateCity, setInitialCreateCity] = useState<string | null>(null);

  // 1. Initial State Load from storage & lazy load required spots
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const snapshot = await loadInitialTripSnapshot();
        setTripsList(snapshot.tripsList);
        setLikedSpots(snapshot.likedSpots);
        setActiveTripId(snapshot.activeTripId);
        setTravelData(snapshot.travelData);

        // 로드해야 할 도시 집합 수집 (과금 방지를 위해 필요한 것들만)
        const citiesToLoad = new Set<string>();
        if (snapshot.travelData?.cityCode) {
          citiesToLoad.add(snapshot.travelData.cityCode);
        }
        snapshot.tripsList.forEach((t: any) => {
          if (t.cityCode) citiesToLoad.add(t.cityCode);
        });
        snapshot.likedSpots.forEach((s: any) => {
          if (s.city) citiesToLoad.add(s.city);
        });

        await loadSpotCatalog(Array.from(citiesToLoad) as any);
      } catch (e) {
        console.warn('Failed to load initial data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadSavedData();
  }, []);

  const saveLikedSpots = async (newLiked: typeof likedSpots) => {
    setLikedSpots(newLiked);
    try {
      await persistLikedSpots(newLiked);
    } catch (e) {
      console.warn('Failed to save liked spots:', e);
    }
  };

  const handleCreateTrip = async (newTripMeta: Omit<TripMetadata, 'id'>) => {
    setIsCreatingTrip(true);

    try {
      const result = await createTrip(tripsList, newTripMeta);
      setTripsList(result.tripsList);
      setActiveTripId(result.tripId);
      setTravelData(result.travelData);

      if (newTripMeta.cityCode) {
        await loadCitySpots(newTripMeta.cityCode as any);
      }
    } catch (e) {
      console.warn('Failed to save trip detail:', e);
    }

    setTimeout(() => {
      setIsCreatingTrip(false);
      setCurrentView('detail');
    }, 3000);
  };

  const handleEditTripMetadata = async (updatedMeta: TripMetadata) => {
    try {
      const result = await updateTripMetadata(tripsList, updatedMeta);
      setTripsList(result.tripsList);

      if (updatedMeta.id === activeTripId && result.travelData) {
        setTravelData(result.travelData);
      }
    } catch (e) {
      console.warn('Failed to sync edited metadata:', e);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const result = await deleteTrip(tripsList, tripId, activeTripId);
      setTripsList(result.tripsList);

      if (tripId === activeTripId) {
        setActiveTripId(result.activeTripId);
        setTravelData(result.travelData);
      }
    } catch (e) {
      console.warn('Failed to delete trip data:', e);
    }
  };

  const handleUpdateTripData = async (updatedDetail: any) => {
    setTravelData(updatedDetail);
    if (!activeTripId) return;

    try {
      const updatedList = await updateActiveTripDetail(tripsList, activeTripId, updatedDetail);
      setTripsList(updatedList);
    } catch (e) {
      console.warn('Failed to save detailed trip updates:', e);
    }
  };

  const handleSelectTrip = async (tripId: string) => {
    setActiveTripId(tripId);
    try {
      const detail = await selectTrip(tripId);
      if (detail) {
        setTravelData(detail);
        if (detail.cityCode) {
          await loadCitySpots(detail.cityCode as any);
        }
      }
    } catch (e) {
      console.warn('Failed to select trip:', e);
    }
    setCurrentView('detail');
  };

  // Toggle liked spot
  const handleToggleLike = (city: string, originalIndex: number) => {
    const spot = getSpotDetail(city, originalIndex);
    const nextRef: SpotRef = {
      city,
      spotId: spot?.id,
      originalIndex,
    };
    const existsIdx = likedSpots.findIndex((likedSpot) => isSameSpotRef(likedSpot, nextRef));
    const newLiked = [...likedSpots];

    if (existsIdx > -1) {
      newLiked.splice(existsIdx, 1);
    } else {
      newLiked.push(nextRef);
    }
    saveLikedSpots(newLiked);
  };

  // Add recommended spot directly from explore screen
  const handleAddSpotToTimeline = (city: string, originalIndex: number) => {
    if (!travelData) {
      setCurrentView('myTrips');
      return;
    }

    const spot = getSpotDetail(city, originalIndex);
    setAutoAddSpot({ city, spotId: spot?.id, originalIndex });
    setCurrentView('detail');
  };

  const handleStartTripPlanning = (cityCode: string) => {
    setInitialCreateCity(cityCode);
    setCurrentView('myTrips');
  };

  // Pull-to-refresh handler to invalidate cache and fetch fresh spots
  const handleRefreshSpots = async (cityCode: string) => {
    setIsRefreshing(true);
    try {
      await loadCitySpots(cityCode as any, true);
      // Trigger state update/re-render by copying travelData object
      if (travelData) {
        setTravelData({ ...travelData });
      }
    } catch (e) {
      console.warn('Failed to refresh spots:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>여행 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      {/* Explore View */}
      {currentView === 'explore' ? (
        <ExploreScreen
          likedSpots={likedSpots}
          onToggleLike={handleToggleLike}
          onAddSpotToTimeline={handleAddSpotToTimeline}
          onNavigateToMyTrips={() => setCurrentView('myTrips')}
          onStartTripPlanning={handleStartTripPlanning}
          cityCode={travelData?.cityCode}
        />
      ) : null}

      {/* Trip List View */}
      {currentView === 'myTrips' ? (
        <MyTripsScreen
          trips={tripsList}
          activeTripId={activeTripId}
          onSelectTrip={handleSelectTrip}
          onCreateTrip={handleCreateTrip}
          onEditTrip={handleEditTripMetadata}
          onDeleteTrip={handleDeleteTrip}
          onBackToExplore={() => setCurrentView('explore')}
          initialCreateCity={initialCreateCity}
          onInitialCreateCityHandled={() => setInitialCreateCity(null)}
        />
      ) : null}

      {/* Trip Detail View */}
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
          onRefreshSpots={handleRefreshSpots}
          isRefreshing={isRefreshing}
        />
      ) : null}

      {/* Trip creation splash */}
      <Modal visible={isCreatingTrip} transparent={true} animationType="fade">
        <View style={styles.splashOverlay}>
          <Image
            source={walkingSummerGif}
            style={styles.splashGif}
            resizeMode="contain"
          />
          <Text style={styles.splashText}>새 여행 계획을 준비하고 있습니다...</Text>
          <Text style={styles.splashSubtext}>잠시만 기다려 주세요</Text>
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
