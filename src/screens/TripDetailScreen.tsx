import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  CITY_TEMPLATES,
  ActivityItem,
  ShoppingItem,
  SpotItem,
} from '../constants/travelData';
import { getExchangeRate } from '../utils/exchange';
import { getWeatherData, getForecastData, getSeasonGuide, ForecastInfo, WeatherInfo, SeasonGuide } from '../utils/weather';
import { translateText } from '../utils/translator';
import PlaceModal from '../components/PlaceModal';
import ShoppingModal from '../components/ShoppingModal';
import ChecklistPanel from '../components/trip-detail/ChecklistPanel';
import ExportPanel from '../components/trip-detail/ExportPanel';
import SettlementPanel from '../components/trip-detail/SettlementPanel';
import ShoppingTab from '../components/trip-detail/ShoppingTab';
import SpotsTab from '../components/trip-detail/SpotsTab';
import TimelineTab from '../components/trip-detail/TimelineTab';
import ToolsPanel from '../components/trip-detail/ToolsPanel';
import { generateBudgetHtml, generateScheduleHtml } from '../services/pdfExport';
import { getSpotDetail, getSpotDetailById } from '../services/spotCatalog';
import {
  addChecklistItem,
  calculateTripStats,
  createRecommendedSpotPlaceData,
  deleteActivityItem,
  deleteShoppingItem,
  getTripDayDateString,
  getTripDayOptions,
  toggleChecklistItem,
  toggleShoppingItemChecked,
  upsertActivityItem,
  upsertShoppingItem,
} from '../services/tripPlanning';
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
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline', 'spots', 'shopping', 'extra'
  const [activeDay, setActiveDay] = useState('day1'); // 'day1', 'day2', etc.
  const [activeExtraSubTab, setActiveExtraSubTab] = useState('checklist'); // 'checklist', 'settlement', 'tools', 'etc'

  // Modals visibility
  const [placeModalVisible, setPlaceModalVisible] = useState(false);
  const [editingPlace, setEditingPlace] = useState<ActivityItem | null>(null);
  const [isRecommendedSpotAdd, setIsRecommendedSpotAdd] = useState(false);
  const [recommendedSpotData, setRecommendedSpotData] = useState<any>(null);

  const [shoppingModalVisible, setShoppingModalVisible] = useState(false);
  const [editingShopping, setEditingShopping] = useState<ShoppingItem | null>(null);

  // Spot Filter/Search States
  const [spotSearchQuery, setSpotSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all'); // 'all', 'sapporo', 'otaru'
  const [spotCategoryFilter, setSpotCategoryFilter] = useState('all');
  const [expandedSpots, setExpandedSpots] = useState<Record<string, boolean>>({});

  // Real-time API data
  const [exchangeRate, setExchangeRate] = useState(9.0);
  const [exchangeUpdateTime, setExchangeUpdateTime] = useState('');
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [forecast, setForecast] = useState<ForecastInfo[]>([]);
  const [clothingTips, setClothingTips] = useState<SeasonGuide | null>(null);

  // Translator States
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [transSourceLang, setTransSourceLang] = useState('ko');
  const [transTargetLang, setTransTargetLang] = useState('ja');
  const [isTranslating, setIsTranslating] = useState(false);

  // Checklist direct add input
  const [newChecklistText, setNewChecklistText] = useState('');

  const triggerAddSpotToTimeline = useCallback((spot: SpotItem) => {
    setRecommendedSpotData(createRecommendedSpotPlaceData(spot));
    setIsRecommendedSpotAdd(true);
    setEditingPlace(null);
    setPlaceModalVisible(true);
  }, []);

  // Fetch real-time resources when extra/tools tab opens
  useEffect(() => {
    const fetchResources = async () => {
      // 1. Fetch Exchange Rate
      const exRes = await getExchangeRate();
      setExchangeRate(exRes.rate);
      setExchangeUpdateTime(exRes.time);

      // 2. Fetch Weather
      const weatherRes = await getWeatherData(travelData.cityCode || 'sapporo');
      setWeather(weatherRes);

      const forecastRes = await getForecastData(travelData.cityCode || 'sapporo');
      setForecast(forecastRes);

      // 3. Fetch Season tips
      const currentMonth = new Date().getMonth() + 1;
      const guideRes = getSeasonGuide(travelData.cityCode || 'sapporo', currentMonth);
      setClothingTips(guideRes);
    };

    fetchResources();
  }, [travelData.cityCode]);

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

  // Timeline item CRUD handlers
  const handlePlaceSubmit = (place: Omit<ActivityItem, 'id'> & { id?: number }, targetDay?: string) => {
    const result = upsertActivityItem(travelData, place, targetDay || activeDay, activeDay);
    onUpdateTripData(result.updatedData);
    setPlaceModalVisible(false);
    setActiveDay(result.activeDay);
  };

  const handlePlaceDelete = (dayKey: string, itemId: number) => {
    const performDelete = () => {
      onUpdateTripData(deleteActivityItem(travelData, dayKey, itemId));
    };

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm('일정 항목을 삭제하시겠습니까?');
      if (confirmDelete) {
        performDelete();
      }
    } else {
      Alert.alert('삭제 확인', '일정 항목을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: performDelete,
        },
      ]);
    }
  };

  const toggleSpotAccordion = (spotKey: string) => {
    setExpandedSpots((prev) => ({ ...prev, [spotKey]: !prev[spotKey] }));
  };

  // Shopping handlers
  const handleShoppingSubmit = (item: Omit<ShoppingItem, 'id'> & { id?: number }) => {
    onUpdateTripData(upsertShoppingItem(travelData, item));
    setShoppingModalVisible(false);
  };

  const handleShoppingCheckToggle = (itemId: number) => {
    onUpdateTripData(toggleShoppingItemChecked(travelData, itemId));
  };

  const handleShoppingDelete = (itemId: number) => {
    Alert.alert('삭제 확인', '쇼핑 항목을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => onUpdateTripData(deleteShoppingItem(travelData, itemId)),
      },
    ]);
  };

  // Checklist handlers
  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    onUpdateTripData(addChecklistItem(travelData, newChecklistText));
    setNewChecklistText('');
  };

  const handleChecklistToggle = (itemId: number) => {
    onUpdateTripData(toggleChecklistItem(travelData, itemId));
  };

  const handleResetChecklist = () => {
    Alert.alert('초기화', '체크리스트를 초기 상태로 되돌리시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        onPress: () => {
          const template = CITY_TEMPLATES[travelData.cityCode] || CITY_TEMPLATES.sapporo;
          onUpdateTripData({ ...travelData, checklist: template.checklist });
        },
      },
    ]);
  };
  // Translator operations
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    const result = await translateText(sourceText, transSourceLang, transTargetLang);
    setTargetText(result);
    setIsTranslating(false);
  };

  const swapTranslationLanguages = () => {
    const src = transSourceLang;
    setTransSourceLang(transTargetLang);
    setTransTargetLang(src);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('알림', '번역 결과가 클립보드에 복사되었습니다.');
  };

  return (
    <View style={styles.container}>
      {/* Top Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBackToExplore} style={styles.btnBackIcon}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {travelData.title}
            </Text>
            <Text style={styles.headerSubtitle}>
              {stats.nights} · {travelData.startDate} ~ {travelData.endDate}
            </Text>
          </View>
          <TouchableOpacity onPress={handleShare} style={styles.btnShare}>
            <Ionicons name="share-social-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid Row */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={16} color="#ffffff" />
            <Text style={styles.statLabel}>여행일정</Text>
            <Text style={styles.statValue}>
              {dayOptions.length}일
            </Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="wallet-outline" size={16} color="#ffffff" />
            <Text style={styles.statLabel}>총 예산</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {Math.round(stats.totalBudgetKRW / 10000).toLocaleString()}만원
            </Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="pin-outline" size={16} color="#ffffff" />
            <Text style={styles.statLabel}>방문지</Text>
            <Text style={styles.statValue}>{stats.totalPlaces}곳</Text>
          </View>
        </View>
      </View>

      {/* Main Tab switches */}
      <View style={styles.tabBar}>
        {[
          { key: 'timeline', label: '일정', icon: 'map' },
          { key: 'spots', label: '추천스팟', icon: 'compass' },
          { key: 'shopping', label: '쇼핑리스트', icon: 'cart' },
          { key: 'extra', label: '더보기', icon: 'ellipsis-horizontal' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={activeTab === tab.key ? (tab.icon as any) : `${tab.icon}-outline` as any}
              size={20}
              color={activeTab === tab.key ? '#6c5ce7' : '#64748b'}
            />
            <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Contents */}
      <View style={styles.contentContainer}>
        {/* ==================== 1. TIMELINE TAB ==================== */}
        {activeTab === 'timeline' && (
          <TimelineTab
            activeDay={activeDay}
            dayOptions={dayOptions}
            items={travelData.days[activeDay] || []}
            exchangeRate={exchangeRate}
            onSelectDay={setActiveDay}
            onAddPlace={() => {
              setIsRecommendedSpotAdd(false);
              setEditingPlace(null);
              setPlaceModalVisible(true);
            }}
            onEditPlace={(item) => {
              setEditingPlace(item);
              setIsRecommendedSpotAdd(false);
              setPlaceModalVisible(true);
            }}
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
            onAddShopping={() => {
              setEditingShopping(null);
              setShoppingModalVisible(true);
            }}
            onEditShopping={(item) => {
              setEditingShopping(item);
              setShoppingModalVisible(true);
            }}
            onToggleShoppingCheck={handleShoppingCheckToggle}
            onDeleteShopping={handleShoppingDelete}
          />
        )}
        {/* ==================== 4. EXTRA TAB ==================== */}
        {activeTab === 'extra' && (
          <View style={{ flex: 1 }}>
            {/* Sub Tabs Container */}
            <View style={styles.subTabsContainer}>
              {[
                { key: 'checklist', label: '📋 준비물' },
                { key: 'settlement', label: '🪙 정산' },
                { key: 'tools', label: '🛠️ 도구' },
                { key: 'etc', label: '⚙️ 기타' },
              ].map((subTab) => (
                <TouchableOpacity
                  key={subTab.key}
                  style={[styles.subTabBtn, activeExtraSubTab === subTab.key && styles.subTabBtnActive]}
                  onPress={() => setActiveExtraSubTab(subTab.key)}
                >
                  <Text style={[styles.subTabBtnText, activeExtraSubTab === subTab.key && styles.subTabBtnTextActive]}>
                    {subTab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView contentContainerStyle={styles.extraScroll}>
              {/* 4-1. CHECKLIST SUB-TAB */}
              {activeExtraSubTab === 'checklist' && (
                <ChecklistPanel
                  checklist={travelData.checklist || []}
                  newChecklistText={newChecklistText}
                  onChangeNewChecklistText={setNewChecklistText}
                  onAddChecklist={handleAddChecklist}
                  onToggleChecklist={handleChecklistToggle}
                  onResetChecklist={handleResetChecklist}
                />
              )}
              {/* 4-2. BUDGET & SETTLEMENT SUB-TAB */}
              {activeExtraSubTab === 'settlement' && (
                <SettlementPanel
                  memberCount={travelData.memberCount}
                  totalBudgetKRW={stats.totalBudgetKRW}
                  shoppingTotalCostKRW={stats.shoppingTotalCostKRW}
                  onChangeMemberCount={(memberCount) => onUpdateTripData({ ...travelData, memberCount })}
                />
              )}
              {/* 4-3. TOOLS SUB-TAB */}
              {activeExtraSubTab === 'tools' && (
                <ToolsPanel
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
                />
              )}
              {/* 4-4. ETC / SETTINGS SUB-TAB */}
              {activeExtraSubTab === 'etc' && (
                <ExportPanel
                  onExportTimelinePDF={handleExportTimelinePDF}
                  onExportBudgetPDF={handleExportBudgetPDF}
                />
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Place Add/Edit Modal */}
      <PlaceModal
        visible={placeModalVisible}
        onClose={() => setPlaceModalVisible(false)}
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
        onClose={() => setShoppingModalVisible(false)}
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
  headerCard: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#6c5ce7',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  btnBackIcon: {
    padding: 2,
  },
  headerInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#e0e0ff',
    fontWeight: '600',
    marginTop: 2,
  },
  btnShare: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    gap: 3,
  },
  statLabel: {
    fontSize: 10,
    color: '#e0e0ff',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    height: 52,
  },
  tabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6c5ce7',
  },
  tabBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#6c5ce7',
  },
  contentContainer: {
    flex: 1,
  },
  dayTabsWrapper: {
    height: 54,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dayScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  dayTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  dayTabBtnActive: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  dayTabLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  dayTabLabelActive: {
    color: '#ffffff',
  },
  dayTabDate: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#64748b',
  },
  dayTabDateActive: {
    color: '#e0e0ff',
  },
  timelineScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  btnAddPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  btnAddPlaceText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyTimeline: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTimelineText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
  },
  emptyTimelineSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timelineLeft: {
    width: 60,
    alignItems: 'center',
    position: 'relative',
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  timelineDotLineContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 6,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6c5ce7',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingRight: 6,
  },
  timelineCardName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
  },
  timelineCardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  timelineCardMemo: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 16,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    gap: 4,
  },
  costBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#27ae60',
  },
  costConversionSmall: {
    fontSize: 9.5,
    color: '#64748b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    margin: 16,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0f172a',
  },
  subCityChips: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  categoryChipsWrapper: {
    height: 40,
    marginBottom: 10,
  },
  catScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  spotsScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  emptySpotsText: {
    textAlign: 'center',
    color: '#64748b',
    marginVertical: 40,
    fontSize: 13,
  },
  spotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  spotThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  spotInfo: {
    flex: 1,
    gap: 2,
    paddingRight: 6,
  },
  spotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spotName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
  },
  spotMenu: {
    fontSize: 11,
    color: '#64748b',
  },
  spotCardBadgeRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  spotBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  spotBadgeText: {
    fontSize: 9.5,
    color: '#475569',
    fontWeight: '700',
  },
  spotDetails: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fafafb',
    gap: 6,
  },
  spotTipsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6c5ce7',
  },
  spotTips: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  spotTimeText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  spotActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  btnSpotSchedule: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c5ce7',
    borderRadius: 8,
    height: 38,
    gap: 4,
  },
  btnSpotScheduleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  btnSpotLike: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ff7675',
    borderRadius: 8,
    height: 38,
    gap: 4,
    backgroundColor: '#ffffff',
  },
  btnSpotLikeActive: {
    backgroundColor: '#ff7675',
  },
  btnSpotLikeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff7675',
  },
  btnSpotLikeTextActive: {
    color: '#ffffff',
  },
  shoppingScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  shoppingSummaryBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6c5ce7',
  },
  donkiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 121, 168, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(253, 121, 168, 0.2)',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  donkiTextGroup: {
    flex: 1,
    gap: 2,
  },
  donkiTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  donkiSub: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  shoppingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  shoppingListTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  btnAddShopping: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  btnAddShoppingText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyShopping: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shoppingItemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  shoppingItemCardChecked: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    opacity: 0.65,
  },
  shoppingCheckbox: {
    padding: 2,
  },
  shoppingInfo: {
    flex: 1,
    gap: 2,
  },
  shoppingName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  shoppingNameChecked: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  shoppingQty: {
    fontSize: 11,
    color: '#64748b',
  },
  shoppingCost: {
    fontSize: 11,
    fontWeight: '700',
    color: '#27ae60',
  },
  shoppingCostConversion: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'normal',
  },
  shoppingMemo: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  shoppingActions: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'center',
  },
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    height: 44,
  },
  subTabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6c5ce7',
  },
  subTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  subTabBtnTextActive: {
    color: '#6c5ce7',
  },
  extraScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  checklistAddForm: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: '#f8fafc',
  },
  btnAddChecklist: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  checklistText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  checklistTextChecked: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  budgetSummaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 10,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6c5ce7',
  },
  budgetDivider: {
    height: 0.5,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  memberInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    height: 30,
    width: 100,
  },
  counterBtnSmall: {
    width: 30,
    height: '100%',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValueSmall: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  shoppingTotalCard: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    gap: 4,
  },
  shoppingTotalTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  shoppingTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#27ae60',
  },
  shoppingTotalDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  toolsContainer: {
    gap: 16,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherIcon: {
    fontSize: 32,
    backgroundColor: '#f1f5f9',
    width: 50,
    height: 50,
    borderRadius: 25,
    textAlign: 'center',
    lineHeight: 50,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  weatherTempRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  weatherTemp: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  weatherDesc: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  subSectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 10,
  },
  forecastGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  forecastCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
  },
  forecastDay: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '600',
  },
  forecastIcon: {
    fontSize: 18,
    marginVertical: 4,
  },
  forecastTemp: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  forecastDesc: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },
  clothingTipsBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.08)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  clothingTipsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4a90e2',
    marginBottom: 4,
  },
  clothingTipsText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  exchangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exchangeIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exchangeIconEmoji: {
    fontSize: 24,
  },
  rateValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  rateTime: {
    fontSize: 10,
    color: '#64748b',
  },
  transLangRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 10,
  },
  langLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  btnSwap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transInput: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
    fontSize: 13.5,
  },
  transActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  btnTransClear: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  btnTransClearText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  btnTransSubmit: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    backgroundColor: '#6c5ce7',
  },
  btnTransSubmitText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  transResultPanel: {
    marginTop: 14,
    padding: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.05)',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(108, 92, 231, 0.2)',
    gap: 4,
  },
  transResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transResultLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6c5ce7',
  },
  transResultText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 18,
  },
  etcDesc: {
    fontSize: 12.5,
    color: '#64748b',
    lineHeight: 18,
    marginTop: 6,
  },
  etcContainer: {
    gap: 16,
  },
  btnPdfExport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
    height: 44,
    gap: 8,
    marginTop: 14,
  },
  btnPdfExportText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
