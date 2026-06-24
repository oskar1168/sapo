import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Share,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  SpotItem,
} from '../constants/travelData';
import PlaceModal from '../components/PlaceModal';
import ShoppingModal from '../components/ShoppingModal';
import ShoppingTab from '../components/trip-detail/ShoppingTab';
import SpotsTab from '../components/trip-detail/SpotsTab';
import TripExtraTabs, { TripExtraTabKey } from '../components/trip-detail/TripExtraTabs';
import TripHeader from '../components/trip-detail/TripHeader';
import TripMainTabs, { TripMainTabKey } from '../components/trip-detail/TripMainTabs';
import TimelineTab from '../components/trip-detail/TimelineTab';
import { generateBudgetHtml, generateScheduleHtml } from '../services/pdfExport';
import { getSpotDetail, getSpotDetailById } from '../services/spotCatalog';
import {
  calculateTripStats,
  getTripDayDateString,
  getTripDayOptions,
  getTripWarningsForDay,
} from '../services/tripPlanning';
import { useTripDetailActions } from '../hooks/useTripDetailActions';
import { useTripDetailResources } from '../hooks/useTripDetailResources';
import { useTripModals } from '../hooks/useTripModals';
import { useTripTranslationTool } from '../hooks/useTripTranslationTool';
import { SpotRef } from '../types/spot';

interface TripDetailScreenProps {
  tripId: string;
  travelData: any; // Dynamic trip data from state
  likedSpots: SpotRef[];
  onToggleLike: (city: string, originalIndex: number) => void;
  onUpdateTripData: (updatedData: any) => void; // Callback to sync parent state & local storage
  onBackToExplore: () => void;
  autoAddSpot: SpotRef | null;
  onClearAutoAddSpot: () => void;
  onRefreshSpots?: (cityCode: string) => Promise<void>;
  isRefreshing?: boolean;
}

export default function TripDetailScreen({
  tripId,
  travelData,
  likedSpots,
  onToggleLike,
  onUpdateTripData,
  onBackToExplore,
  autoAddSpot,
  onClearAutoAddSpot,
  onRefreshSpots,
  isRefreshing,
}: TripDetailScreenProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<TripMainTabKey>('timeline');
  const [activeDay, setActiveDay] = useState('day1'); // 'day1', 'day2', etc.
  const [activeExtraSubTab, setActiveExtraSubTab] = useState<TripExtraTabKey>('checklist');

  // Spot Filter/Search States
  const [spotSearchQuery, setSpotSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all'); // 'all', 'sapporo', 'otaru'
  const [spotCategoryFilter, setSpotCategoryFilter] = useState('all');
  const [expandedSpots, setExpandedSpots] = useState<Record<string, boolean>>({});

  // Checklist direct add input
  const [newChecklistText, setNewChecklistText] = useState('');

  const {
    placeModalVisible,
    editingPlace,
    isRecommendedSpotAdd,
    recommendedSpotData,
    shoppingModalVisible,
    editingShopping,
    openAddPlace,
    openEditPlace,
    openRecommendedSpotPlace,
    closePlaceModal,
    openAddShopping,
    openEditShopping,
    closeShoppingModal,
  } = useTripModals();

  const {
    exchangeRate,
    exchangeUpdateTime,
    weather,
    forecast,
    clothingTips,
  } = useTripDetailResources(travelData?.cityCode || 'sapporo');

  const {
    sourceText,
    targetText,
    transSourceLang,
    transTargetLang,
    isTranslating,
    setSourceText,
    handleTranslate,
    swapTranslationLanguages,
  } = useTripTranslationTool();

  const triggerAddSpotToTimeline = useCallback((spot: SpotItem) => {
    openRecommendedSpotPlace(spot);
  }, [openRecommendedSpotPlace]);

  const {
    handlePlaceSubmit,
    handlePlaceDelete,
    handleShoppingSubmit,
    handleShoppingCheckToggle,
    handleShoppingDelete,
    handleAddChecklist,
    handleChecklistToggle,
    handleResetChecklist,
    handleMemberCountChange,
  } = useTripDetailActions({
    travelData,
    activeDay,
    setActiveDay,
    onUpdateTripData,
    closePlaceModal,
    closeShoppingModal,
    newChecklistText,
    setNewChecklistText,
  });

  // Handle automatic PlaceModal open when navigated from Explore screen 'Add Spot'
  useEffect(() => {
    if (autoAddSpot) {
      const timeoutId = setTimeout(() => {
        const spot = autoAddSpot.spotId
          ? getSpotDetailById(autoAddSpot.city, autoAddSpot.spotId)
          : getSpotDetail(autoAddSpot.city, autoAddSpot.originalIndex);
        if (spot) {
          triggerAddSpotToTimeline(spot);
        }
        onClearAutoAddSpot();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [autoAddSpot, onClearAutoAddSpot, triggerAddSpotToTimeline]);

  if (!travelData) return null;

  const getDayDateString = (dayIndex: string) => getTripDayDateString(travelData.startDate, dayIndex);
  const dayOptions = getTripDayOptions(travelData);
  const stats = calculateTripStats(travelData, exchangeRate);
  const timelineWarnings = getTripWarningsForDay(travelData, activeDay);
  // Share itinerary link
  const handleShare = async () => {
    try {
      await Share.share({
        message: `✈️ [Sapo Travel] '${travelData.title}' 일정 링크\n출발일: ${travelData.startDate} ~ 도착일: ${travelData.endDate}\n함께 떠나볼까요?`,
      });
    } catch (error) {
      console.warn(error);
    }
  };

  // Export Timeline PDF
  const handleExportTimelinePDF = async () => {
    const htmlContent = generateScheduleHtml(travelData, exchangeRate);
    try {
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (error) {
      console.warn('PDF export failed:', error);
      Alert.alert('오류', 'PDF 내보내기에 실패했습니다.');
    }
  };

  // Export Budget PDF
  const handleExportBudgetPDF = async () => {
    const htmlContent = generateBudgetHtml(travelData, stats, exchangeRate);
    try {
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (error) {
      console.warn('PDF export failed:', error);
      Alert.alert('오류', 'PDF 내보내기에 실패했습니다.');
    }
  };

  const toggleSpotAccordion = (spotKey: string) => {
    setExpandedSpots((prev) => ({ ...prev, [spotKey]: !prev[spotKey] }));
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('알림', '번역 결과가 클립보드에 복사되었습니다.');
  };

  return (
    <View style={styles.container}>
      <TripHeader
        title={travelData.title}
        startDate={travelData.startDate}
        endDate={travelData.endDate}
        dayCount={dayOptions.length}
        stats={stats}
        onBack={onBackToExplore}
        onShare={handleShare}
      />

      <TripMainTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Tab Contents */}
      <View style={styles.contentContainer}>
        {/* ==================== 1. TIMELINE TAB ==================== */}
        {activeTab === 'timeline' && (
          <TimelineTab
            activeDay={activeDay}
            dayOptions={dayOptions}
            items={travelData.days[activeDay] || []}
            warnings={timelineWarnings}
            exchangeRate={exchangeRate}
            onSelectDay={setActiveDay}
            onAddPlace={openAddPlace}
            onEditPlace={openEditPlace}
            onDeletePlace={handlePlaceDelete}
            getDayDateString={getDayDateString}
          />
        )}
        {/* ==================== 2. SPOTS TAB ==================== */}
        {activeTab === 'spots' && (
          <SpotsTab
            cityCode={travelData.cityCode || 'sapporo'}
            cityFilter={cityFilter}
            spotCategoryFilter={spotCategoryFilter}
            spotSearchQuery={spotSearchQuery}
            expandedSpots={expandedSpots}
            likedSpots={likedSpots}
            onSetCityFilter={setCityFilter}
            onSetSpotCategoryFilter={setSpotCategoryFilter}
            onSetSpotSearchQuery={setSpotSearchQuery}
            onToggleSpotAccordion={toggleSpotAccordion}
            onToggleLike={onToggleLike}
            onAddSpotToTimeline={triggerAddSpotToTimeline}
            onRefresh={async () => {
              if (onRefreshSpots) {
                await onRefreshSpots(travelData.cityCode || 'sapporo');
              }
            }}
            refreshing={isRefreshing}
          />
        )}
        {/* ==================== 3. SHOPPING TAB ==================== */}
        {activeTab === 'shopping' && (
          <ShoppingTab
            cityCode={travelData.cityCode || 'sapporo'}
            shoppingList={travelData.shoppingList || []}
            shoppingTotalCostKRW={stats.shoppingTotalCostKRW}
            exchangeRate={exchangeRate}
            onAddShopping={openAddShopping}
            onEditShopping={openEditShopping}
            onToggleShoppingCheck={handleShoppingCheckToggle}
            onDeleteShopping={handleShoppingDelete}
          />
        )}
        {/* ==================== 4. EXTRA TAB ==================== */}
        {activeTab === 'extra' && (
          <TripExtraTabs
            activeTab={activeExtraSubTab}
            onChangeTab={setActiveExtraSubTab}
            checklist={travelData.checklist || []}
            newChecklistText={newChecklistText}
            onChangeNewChecklistText={setNewChecklistText}
            onAddChecklist={handleAddChecklist}
            onToggleChecklist={handleChecklistToggle}
            onResetChecklist={handleResetChecklist}
            memberCount={travelData.memberCount}
            totalBudgetKRW={stats.totalBudgetKRW}
            shoppingTotalCostKRW={stats.shoppingTotalCostKRW}
            onChangeMemberCount={handleMemberCountChange}
            weather={weather}
            forecast={forecast}
            clothingTips={clothingTips}
            exchangeRate={exchangeRate}
            exchangeUpdateTime={exchangeUpdateTime}
            sourceText={sourceText}
            targetText={targetText}
            transSourceLang={transSourceLang}
            transTargetLang={transTargetLang}
            isTranslating={isTranslating}
            onChangeSourceText={setSourceText}
            onClearSourceText={() => setSourceText('')}
            onTranslate={handleTranslate}
            onSwapLanguages={swapTranslationLanguages}
            onCopyTranslation={() => copyToClipboard(targetText)}
            onExportTimelinePDF={handleExportTimelinePDF}
            onExportBudgetPDF={handleExportBudgetPDF}
          />
        )}
      </View>

      {/* Place Add/Edit Modal */}
      <PlaceModal
        visible={placeModalVisible}
        onClose={closePlaceModal}
        onSubmit={handlePlaceSubmit}
        editingItem={editingPlace}
        dayOptions={dayOptions}
        defaultDay={activeDay}
        exchangeRate={exchangeRate}
        isRecommendedSpot={isRecommendedSpotAdd}
        recommendedData={recommendedSpotData}
      />

      {/* Shopping Add/Edit Modal */}
      <ShoppingModal
        visible={shoppingModalVisible}
        onClose={closeShoppingModal}
        onSubmit={handleShoppingSubmit}
        editingItem={editingShopping}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  contentContainer: {
    flex: 1,
  },
});
