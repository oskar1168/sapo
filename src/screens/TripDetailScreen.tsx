import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  Image,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  CITY_TEMPLATES,
  SAPPORO_FOOD_LIST,
  OTARU_FOOD_LIST,
  TOKYO_FOOD_LIST,
  OSAKA_FOOD_LIST,
  FOOD_CATEGORIES,
  ActivityItem,
  ChecklistItem,
  ShoppingItem,
  SpotItem,
} from '../constants/travelData';
import { getExchangeRate } from '../utils/exchange';
import { getWeatherData, getForecastData, getSeasonGuide, ForecastInfo, WeatherInfo, SeasonGuide } from '../utils/weather';
import { translateText } from '../utils/translator';
import PlaceModal from '../components/PlaceModal';
import ShoppingModal from '../components/ShoppingModal';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

interface TripDetailScreenProps {
  tripId: string;
  travelData: any; // Dynamic trip data from state
  likedSpots: { city: string; originalIndex: number }[];
  onToggleLike: (city: string, originalIndex: number) => void;
  onUpdateTripData: (updatedData: any) => void; // Callback to sync parent state & local storage
  onBackToExplore: () => void;
  autoAddSpot: { city: string; originalIndex: number } | null;
  onClearAutoAddSpot: () => void;
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
  const [expandedSpots, setExpandedSpots] = useState<{ [key: number]: boolean }>({});

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
      let list: SpotItem[] = [];
      if (autoAddSpot.city === 'sapporo') list = SAPPORO_FOOD_LIST;
      else if (autoAddSpot.city === 'otaru') list = OTARU_FOOD_LIST;
      else if (autoAddSpot.city === 'tokyo') list = TOKYO_FOOD_LIST;
      else if (autoAddSpot.city === 'osaka') list = OSAKA_FOOD_LIST;

      const spot = list[autoAddSpot.originalIndex];
      if (spot) {
        triggerAddSpotToTimeline(spot);
      }
      onClearAutoAddSpot();
    }
  }, [autoAddSpot]);

  if (!travelData) return null;

  const dayKeys = Object.keys(travelData.days || {}).sort((a, b) => {
    return parseInt(a.replace('day', '')) - parseInt(b.replace('day', ''));
  });

  const getDayDateString = (dayIndex: string) => {
    const start = new Date(travelData.startDate);
    const dayOffset = parseInt(dayIndex) - 1;
    start.setDate(start.getDate() + dayOffset);
    const mm = String(start.getMonth() + 1).padStart(2, '0');
    const dd = String(start.getDate()).padStart(2, '0');
    const dayName = start.toLocaleDateString('ko-KR', { weekday: 'short' });
    return `${mm}.${dd}(${dayName})`;
  };

  const dayOptions = dayKeys.map((dk) => {
    const idx = dk.replace('day', '');
    return { label: `Day ${idx} (${getDayDateString(idx)})`, value: dk };
  });

  // Calculate stats
  const calculateStats = () => {
    let totalPlaces = 0;
    let totalBudgetKRW = 0;

    Object.keys(travelData.days || {}).forEach((dayKey) => {
      const items = travelData.days[dayKey] || [];
      totalPlaces += items.length;
      items.forEach((item: ActivityItem) => {
        if (item.cost) {
          if (item.currency === 'JPY') {
            totalBudgetKRW += Math.round(item.cost * exchangeRate);
          } else {
            totalBudgetKRW += item.cost;
          }
        }
      });
    });

    // Shopping total cost
    let shoppingTotalCostKRW = 0;
    (travelData.shoppingList || []).forEach((item: ShoppingItem) => {
      if (item.checked) {
        const itemCost = item.cost * item.qty;
        if (item.currency === 'JPY') {
          shoppingTotalCostKRW += Math.round(itemCost * exchangeRate);
        } else {
          shoppingTotalCostKRW += itemCost;
        }
      }
    });

    const totalDays = dayKeys.length;
    const nights = totalDays > 1 ? `${totalDays - 1}박 ${totalDays}일` : '당일 일정';

    return {
      totalPlaces,
      totalBudgetKRW,
      shoppingTotalCostKRW,
      nights,
    };
  };

  const stats = calculateStats();

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
    const dayKey = targetDay || activeDay;
    const updatedDays = { ...travelData.days };

    // Shallow copy each day array to guarantee React state update detection
    Object.keys(updatedDays).forEach((dk) => {
      updatedDays[dk] = [...(updatedDays[dk] || [])];
    });

    if (place.id) {
      // Edit
      let foundDayKey = activeDay;
      let foundIdx = -1;

      // Find original item position
      for (const dk of Object.keys(updatedDays)) {
        const idx = updatedDays[dk].findIndex((i: ActivityItem) => i.id === place.id);
        if (idx > -1) {
          foundDayKey = dk;
          foundIdx = idx;
          break;
        }
      }

      if (foundIdx > -1) {
        const itemToUpdate = { ...updatedDays[foundDayKey][foundIdx], ...place } as ActivityItem;
        if (foundDayKey === dayKey) {
          // Just update within the same day
          updatedDays[dayKey][foundIdx] = itemToUpdate;
        } else {
          // Day changed: remove from old day, add to new day
          updatedDays[foundDayKey].splice(foundIdx, 1);
          updatedDays[dayKey].push(itemToUpdate);
        }
      }
    } else {
      // Add
      const nextId = Date.now();
      updatedDays[dayKey].push({ id: nextId, ...place } as ActivityItem);
    }

    onUpdateTripData({ ...travelData, days: updatedDays });
    setPlaceModalVisible(false);
    setActiveDay(dayKey);
  };

  const handlePlaceDelete = (dayKey: string, itemId: number) => {
    const performDelete = () => {
      const updatedDays = { ...travelData.days };
      Object.keys(updatedDays).forEach((dk) => {
        updatedDays[dk] = [...(updatedDays[dk] || [])];
      });
      updatedDays[dayKey] = updatedDays[dayKey].filter((i: ActivityItem) => i.id !== itemId);
      onUpdateTripData({ ...travelData, days: updatedDays });
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

  const getSpotSource = (spot: SpotItem): { city: string; originalIndex: number } => {
    const sourceLists = [
      { city: 'sapporo', spots: SAPPORO_FOOD_LIST },
      { city: 'otaru', spots: OTARU_FOOD_LIST },
      { city: 'tokyo', spots: TOKYO_FOOD_LIST },
      { city: 'osaka', spots: OSAKA_FOOD_LIST },
    ];

    for (const source of sourceLists) {
      const originalIndex = source.spots.findIndex((item) => item.name === spot.name);
      if (originalIndex > -1) {
        return { city: source.city, originalIndex };
      }
    }

    return { city: travelData.cityCode || 'sapporo', originalIndex: 0 };
  };

  // Recommended spots list retrieval based on city
  const getSpotsList = (): SpotItem[] => {
    if (travelData.cityCode === 'tokyo') return TOKYO_FOOD_LIST;
    if (travelData.cityCode === 'osaka') return OSAKA_FOOD_LIST;
    
    // Default Sapporo / Otaru
    if (cityFilter === 'sapporo') return SAPPORO_FOOD_LIST;
    if (cityFilter === 'otaru') return OTARU_FOOD_LIST;
    return [...SAPPORO_FOOD_LIST, ...OTARU_FOOD_LIST];
  };

  const filteredSpots = getSpotsList().filter((spot) => {
    // Search match
    const matchesSearch =
      spot.name.toLowerCase().includes(spotSearchQuery.toLowerCase()) ||
      spot.menu.toLowerCase().includes(spotSearchQuery.toLowerCase()) ||
      spot.tips.toLowerCase().includes(spotSearchQuery.toLowerCase());
    
    // Category match
    const matchesCategory = spotCategoryFilter === 'all' || spot.category === spotCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const toggleSpotAccordion = (index: number) => {
    setExpandedSpots((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const triggerAddSpotToTimeline = (spot: SpotItem) => {
    setRecommendedSpotData({
      name: spot.name,
      category: spot.category,
      address: spot.address,
      menu: spot.menu,
      tips: spot.tips,
    });
    setIsRecommendedSpotAdd(true);
    setEditingPlace(null);
    setPlaceModalVisible(true);
  };

  // Shopping handlers
  const handleShoppingSubmit = (item: Omit<ShoppingItem, 'id'> & { id?: number }) => {
    let updatedList = [...(travelData.shoppingList || [])];

    if (item.id) {
      const idx = updatedList.findIndex((i) => i.id === item.id);
      if (idx > -1) {
        updatedList[idx] = { ...updatedList[idx], ...item };
      }
    } else {
      updatedList.push({ id: Date.now(), ...item });
    }

    onUpdateTripData({ ...travelData, shoppingList: updatedList });
    setShoppingModalVisible(false);
  };

  const handleShoppingCheckToggle = (itemId: number) => {
    const updatedList = (travelData.shoppingList || []).map((item: ShoppingItem) => {
      if (item.id === itemId) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    onUpdateTripData({ ...travelData, shoppingList: updatedList });
  };

  const handleShoppingDelete = (itemId: number) => {
    Alert.alert('삭제 확인', '이 쇼핑 항목을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          const updatedList = (travelData.shoppingList || []).filter((i: ShoppingItem) => i.id !== itemId);
          onUpdateTripData({ ...travelData, shoppingList: updatedList });
        },
      },
    ]);
  };

  // Checklist handlers
  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: Date.now(),
      text: newChecklistText.trim(),
      checked: false,
    };
    const updatedChecklist = [...(travelData.checklist || []), newItem];
    onUpdateTripData({ ...travelData, checklist: updatedChecklist });
    setNewChecklistText('');
  };

  const handleChecklistToggle = (itemId: number) => {
    const updatedChecklist = (travelData.checklist || []).map((item: ChecklistItem) => {
      if (item.id === itemId) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    onUpdateTripData({ ...travelData, checklist: updatedChecklist });
  };

  const handleResetChecklist = () => {
    Alert.alert('초기화', '체크리스트를 초기 상태로 리셋하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '리셋',
        onPress: () => {
          // Fallback initial checklist template
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
          <View style={{ flex: 1 }}>
            {/* Day horizontal selector chips */}
            <View style={styles.dayTabsWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
                {dayOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.dayTabBtn, activeDay === opt.value && styles.dayTabBtnActive]}
                    onPress={() => setActiveDay(opt.value)}
                  >
                    <Text style={[styles.dayTabLabel, activeDay === opt.value && styles.dayTabLabelActive]}>
                      {opt.label.split(' (')[0]}
                    </Text>
                    <Text style={[styles.dayTabDate, activeDay === opt.value && styles.dayTabDateActive]}>
                      {opt.label.split(' (')[1]?.slice(0, -1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.timelineScroll}>
              <View style={styles.timelineHeader}>
                <Text style={styles.timelineTitle}>
                  Day {activeDay.replace('day', '')} 일정 ({getDayDateString(activeDay.replace('day', ''))})
                </Text>
                <TouchableOpacity
                  style={styles.btnAddPlace}
                  onPress={() => {
                    setIsRecommendedSpotAdd(false);
                    setEditingPlace(null);
                    setPlaceModalVisible(true);
                  }}
                >
                  <Ionicons name="add-circle" size={16} color="#ffffff" />
                  <Text style={styles.btnAddPlaceText}>장소 추가</Text>
                </TouchableOpacity>
              </View>

              {/* Timeline Items */}
              {(travelData.days[activeDay] || []).length === 0 ? (
                <View style={styles.emptyTimeline}>
                  <Ionicons name="map-outline" size={48} color="#cbd5e1" />
                  <Text style={styles.emptyTimelineText}>등록된 일정이 없습니다.</Text>
                  <Text style={styles.emptyTimelineSub}>첫 번째 장소를 등록해 볼까요?</Text>
                </View>
              ) : (
                <View style={styles.timelineContainer}>
                  {(travelData.days[activeDay] || []).map((item: ActivityItem, idx: number) => {
                    // Category icon mapping
                    let iconName: any = 'location';
                    if (item.type === 'flight') iconName = 'airplane';
                    else if (item.type === 'meal') iconName = 'restaurant';
                    else if (item.type === 'cafe') iconName = 'cafe';
                    else if (item.type === 'sightseeing') iconName = 'image';
                    else if (item.type === 'shopping') iconName = 'bag-handle';
                    else if (item.type === 'lodging') iconName = 'home';
                    else if (item.type === 'transport') iconName = 'bus';

                    return (
                      <View key={item.id} style={styles.timelineRow}>
                        {/* Time Left & line */}
                        <View style={styles.timelineLeft}>
                          <Text style={styles.timelineTime}>{item.time}</Text>
                          <View style={styles.timelineDotLineContainer}>
                            <View style={styles.timelineDot} />
                            {idx < (travelData.days[activeDay] || []).length - 1 && (
                              <View style={styles.timelineLine} />
                            )}
                          </View>
                        </View>

                        {/* Card Right */}
                        <View style={styles.timelineCard}>
                          <View style={styles.timelineCardHeader}>
                            <View style={styles.timelineCardTitleRow}>
                              <Ionicons name={iconName} size={15} color="#6c5ce7" />
                              <Text style={styles.timelineCardName}>{item.name}</Text>
                            </View>
                            <View style={styles.timelineCardActions}>
                              <TouchableOpacity
                                onPress={() => {
                                  setEditingPlace(item);
                                  setIsRecommendedSpotAdd(false);
                                  setPlaceModalVisible(true);
                                }}
                              >
                                <Ionicons name="pencil-outline" size={16} color="#64748b" />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handlePlaceDelete(activeDay, item.id)}>
                                <Ionicons name="trash-outline" size={16} color="#ff7675" />
                              </TouchableOpacity>
                            </View>
                          </View>

                          {item.memo ? (
                            <Text style={styles.timelineCardMemo}>{item.memo}</Text>
                          ) : null}

                          {item.cost ? (
                            <View style={styles.costBadge}>
                              <Text style={styles.costBadgeText}>
                                {item.cost.toLocaleString()}
                                {item.currency === 'JPY' ? ' ¥' : ' ₩'}
                              </Text>
                              {item.currency === 'JPY' ? (
                                <Text style={styles.costConversionSmall}>
                                  (약 ₩ {Math.round(item.cost * exchangeRate).toLocaleString()}원)
                                </Text>
                              ) : null}
                            </View>
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* ==================== 2. SPOTS TAB ==================== */}
        {activeTab === 'spots' && (
          <View style={{ flex: 1 }}>
            {/* Spot Search input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#64748b" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={spotSearchQuery}
                onChangeText={setSpotSearchQuery}
                placeholder="스팟 이름, 추천 메뉴, 꿀팁 검색..."
              />
              {spotSearchQuery ? (
                <TouchableOpacity onPress={() => setSpotSearchQuery('')}>
                  <Ionicons name="close" size={18} color="#64748b" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* City sub-regions filter (only for Sapporo) */}
            {travelData.cityCode === 'sapporo' ? (
              <View style={styles.subCityChips}>
                {[
                  { value: 'all', label: '🗺️ 전체보기' },
                  { value: 'sapporo', label: '🧭 삿포로' },
                  { value: 'otaru', label: '🌊 오타루' },
                ].map((chip) => (
                  <TouchableOpacity
                    key={chip.value}
                    style={[styles.filterChip, cityFilter === chip.value && styles.filterChipActive]}
                    onPress={() => setCityFilter(chip.value)}
                  >
                    <Text style={[styles.filterChipText, cityFilter === chip.value && styles.filterChipTextActive]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Category Filter Chips */}
            <View style={styles.categoryChipsWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                <TouchableOpacity
                  style={[styles.filterChip, spotCategoryFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setSpotCategoryFilter('all')}
                >
                  <Text style={[styles.filterChipText, spotCategoryFilter === 'all' && styles.filterChipTextActive]}>
                    🗺️ 전체
                  </Text>
                </TouchableOpacity>
                {Object.keys(FOOD_CATEGORIES).map((catKey) => (
                  <TouchableOpacity
                    key={catKey}
                    style={[styles.filterChip, spotCategoryFilter === catKey && styles.filterChipActive]}
                    onPress={() => setSpotCategoryFilter(catKey)}
                  >
                    <Text style={[styles.filterChipText, spotCategoryFilter === catKey && styles.filterChipTextActive]}>
                      {FOOD_CATEGORIES[catKey].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Spots list */}
            <ScrollView contentContainerStyle={styles.spotsScroll}>
              {filteredSpots.length === 0 ? (
                <Text style={styles.emptySpotsText}>검색 및 조건에 일치하는 추천 스팟이 없습니다.</Text>
              ) : (
                filteredSpots.map((spot, index) => {
                  const isExpanded = !!expandedSpots[index];
                  const spotSource = getSpotSource(spot);

                  // Check if liked
                  const isLiked = likedSpots.some(
                    (s) => s.city === spotSource.city && s.originalIndex === spotSource.originalIndex
                  );

                  return (
                    <View key={index} style={styles.spotCard}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => toggleSpotAccordion(index)}
                        style={styles.spotHeader}
                      >
                        <Image
                          source={{ uri: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80' }}
                          style={styles.spotThumb}
                        />
                        <View style={styles.spotInfo}>
                          <View style={styles.spotTitleRow}>
                            <Text style={styles.spotName}>{spot.name}</Text>
                            <View style={styles.ratingRow}>
                              <Ionicons name="star" size={13} color="#f1c40f" />
                              <Text style={styles.ratingText}>{spot.rating}</Text>
                            </View>
                          </View>
                          <Text style={styles.spotMenu} numberOfLines={1}>
                            {spot.menu}
                          </Text>
                          <View style={styles.spotCardBadgeRow}>
                            <View style={styles.spotBadge}>
                              <Text style={styles.spotBadgeText}>
                                {FOOD_CATEGORIES[spot.category]?.label || '추천스팟'}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color="#64748b"
                          style={{ marginLeft: 6 }}
                        />
                      </TouchableOpacity>

                      {/* Expandable Accordion Body */}
                      {isExpanded && (
                        <View style={styles.spotDetails}>
                          <Text style={styles.spotTipsTitle}>💡 현지 이용 꿀팁</Text>
                          <Text style={styles.spotTips}>{spot.tips}</Text>
                          <Text style={styles.spotTimeText}>
                            🕒 운영: {spot.openTime} ~ {spot.closeTime}
                          </Text>

                          {/* Action button row */}
                          <View style={styles.spotActionRow}>
                            <TouchableOpacity
                              style={styles.btnSpotSchedule}
                              onPress={() => triggerAddSpotToTimeline(spot)}
                            >
                              <Ionicons name="calendar" size={16} color="#ffffff" />
                              <Text style={styles.btnSpotScheduleText}>내 일정에 추가</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.btnSpotLike, isLiked && styles.btnSpotLikeActive]}
                              onPress={() => {
                                onToggleLike(spotSource.city, spotSource.originalIndex);
                              }}
                            >
                              <Ionicons
                                name={isLiked ? 'heart' : 'heart-outline'}
                                size={18}
                                color={isLiked ? '#ffffff' : '#ff7675'}
                              />
                              <Text style={[styles.btnSpotLikeText, isLiked && styles.btnSpotLikeTextActive]}>
                                {isLiked ? '찜 완료' : '찜하기'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}

        {/* ==================== 3. SHOPPING TAB ==================== */}
        {activeTab === 'shopping' && (
          <ScrollView contentContainerStyle={styles.shoppingScroll}>
            {/* Header summary card */}
            <View style={styles.shoppingSummaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>총 쇼핑 금액 (구매완료 기준)</Text>
                <Text style={styles.summaryValue}>
                  {stats.shoppingTotalCostKRW.toLocaleString()}원
                </Text>
              </View>
              {/* Discount banner */}
              <TouchableOpacity
                style={styles.donkiBanner}
                activeOpacity={0.8}
                onPress={() => Alert.alert('쿠폰 안내', '🎟️ 돈키호테 15% 면세 할인 쿠폰 바코드를 전송 중입니다!')}
              >
                <Ionicons name="gift" size={20} color="#ff7675" />
                <View style={styles.donkiTextGroup}>
                  <Text style={styles.donkiTitle}>돈키호테 15% 할인 쿠폰 발급</Text>
                  <Text style={styles.donkiSub}>10% 면세 + 5% 추가 즉시할인 받기</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#a29bfe" />
              </TouchableOpacity>
            </View>

            <View style={styles.shoppingHeaderRow}>
              <Text style={styles.shoppingListTitle}>🛒 나의 쇼핑 목록</Text>
              <TouchableOpacity
                style={styles.btnAddShopping}
                onPress={() => {
                  setEditingShopping(null);
                  setShoppingModalVisible(true);
                }}
              >
                <Ionicons name="add-circle" size={16} color="#ffffff" />
                <Text style={styles.btnAddShoppingText}>아이템 추가</Text>
              </TouchableOpacity>
            </View>

            {/* List */}
            {(travelData.shoppingList || []).length === 0 ? (
              <View style={styles.emptyShopping}>
                <Ionicons name="cart-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyTimelineText}>등록된 쇼핑 품목이 없습니다.</Text>
              </View>
            ) : (
              (travelData.shoppingList || []).map((item: ShoppingItem) => {
                let catEmoji = '✨';
                if (item.category === 'dessert') catEmoji = '🍰';
                else if (item.category === 'drug') catEmoji = '💊';
                else if (item.category === 'alcohol') catEmoji = '🍶';
                else if (item.category === 'souvenir') catEmoji = '🧸';

                return (
                  <View
                    key={item.id}
                    style={[styles.shoppingItemCard, item.checked && styles.shoppingItemCardChecked]}
                  >
                    <TouchableOpacity
                      onPress={() => handleShoppingCheckToggle(item.id)}
                      style={styles.shoppingCheckbox}
                    >
                      <Ionicons
                        name={item.checked ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={item.checked ? '#6c5ce7' : '#cbd5e1'}
                      />
                    </TouchableOpacity>

                    <View style={styles.shoppingInfo}>
                      <Text style={[styles.shoppingName, item.checked && styles.shoppingNameChecked]}>
                        {catEmoji} {item.name}
                      </Text>
                      <Text style={styles.shoppingQty}>수량: {item.qty}개</Text>
                      {item.cost ? (
                        <Text style={styles.shoppingCost}>
                          가격: {item.cost.toLocaleString()}
                          {item.currency === 'JPY' ? ' ¥' : ' ₩'}
                          {item.currency === 'JPY' ? (
                            <Text style={styles.shoppingCostConversion}>
                              {' '}
                              (약 ₩ {Math.round(item.cost * item.qty * exchangeRate).toLocaleString()}원)
                            </Text>
                          ) : null}
                        </Text>
                      ) : null}
                      {item.memo ? (
                        <Text style={styles.shoppingMemo}>Memo: {item.memo}</Text>
                      ) : null}
                    </View>

                    <View style={styles.shoppingActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingShopping(item);
                          setShoppingModalVisible(true);
                        }}
                      >
                        <Ionicons name="pencil" size={16} color="#64748b" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleShoppingDelete(item.id)}>
                        <Ionicons name="trash" size={16} color="#ff7675" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
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
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>여행 준비물 체크리스트</Text>
                    <TouchableOpacity onPress={handleResetChecklist}>
                      <Ionicons name="refresh" size={18} color="#64748b" />
                    </TouchableOpacity>
                  </View>

                  {/* Add Input Form */}
                  <View style={styles.checklistAddForm}>
                    <TextInput
                      style={[styles.input, { flex: 1, height: 40 }]}
                      value={newChecklistText}
                      onChangeText={setNewChecklistText}
                      placeholder="준비물 직접 추가..."
                    />
                    <TouchableOpacity onPress={handleAddChecklist} style={styles.btnAddChecklist}>
                      <Ionicons name="add" size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </View>

                  {/* List */}
                  {(travelData.checklist || []).map((item: ChecklistItem) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.checklistRow}
                      onPress={() => handleChecklistToggle(item.id)}
                    >
                      <Ionicons
                        name={item.checked ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={item.checked ? '#2ecc71' : '#cbd5e1'}
                      />
                      <Text style={[styles.checklistText, item.checked && styles.checklistTextChecked]}>
                        {item.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* 4-2. BUDGET & SETTLEMENT SUB-TAB */}
              {activeExtraSubTab === 'settlement' && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>여행 예산 및 N분의 1 정산</Text>

                  <View style={styles.budgetSummaryBox}>
                    <View style={styles.budgetRow}>
                      <Text style={styles.budgetLabel}>총 예상 지출</Text>
                      <Text style={styles.budgetValue}>
                        {Math.round(stats.totalBudgetKRW * travelData.memberCount).toLocaleString()}원
                      </Text>
                    </View>
                    <View style={styles.budgetDivider} />
                    <View style={styles.memberInputRow}>
                      <Text style={styles.budgetLabel}>함께 가는 인원</Text>
                      <View style={styles.counterRow}>
                        <TouchableOpacity
                          style={styles.counterBtnSmall}
                          onPress={() => onUpdateTripData({ ...travelData, memberCount: Math.max(1, travelData.memberCount - 1) })}
                        >
                          <Ionicons name="remove" size={14} color="#000000" />
                        </TouchableOpacity>
                        <Text style={styles.counterValueSmall}>{travelData.memberCount}명</Text>
                        <TouchableOpacity
                          style={styles.counterBtnSmall}
                          onPress={() => onUpdateTripData({ ...travelData, memberCount: travelData.memberCount + 1 })}
                        >
                          <Ionicons name="add" size={14} color="#000000" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.budgetDivider} />
                    <View style={[styles.budgetRow, { marginTop: 4 }]}>
                      <Text style={[styles.budgetLabel, { fontWeight: '800', color: '#2ecc71' }]}>
                        1인당 예상 정산 금액
                      </Text>
                      <Text style={[styles.budgetValue, { color: '#2ecc71', fontSize: 16 }]}>
                        {Math.round(stats.totalBudgetKRW).toLocaleString()}원
                      </Text>
                    </View>
                  </View>

                  {/* Shopping total details inside settlement */}
                  <View style={styles.shoppingTotalCard}>
                    <Text style={styles.shoppingTotalTitle}>나의 총 쇼핑 금액 (실지출)</Text>
                    <Text style={styles.shoppingTotalVal}>
                      {stats.shoppingTotalCostKRW.toLocaleString()}원
                    </Text>
                    <Text style={styles.shoppingTotalDesc}>
                      💡 쇼핑 리스트 탭에서 체크(구매완료)한 항목들의 총합계입니다.
                    </Text>
                  </View>
                </View>
              )}

              {/* 4-3. TOOLS SUB-TAB */}
              {activeExtraSubTab === 'tools' && (
                <View style={styles.toolsContainer}>
                  {/* Weather Monitor */}
                  <View style={styles.card}>
                    <View style={styles.weatherHeader}>
                      <Text style={styles.weatherIcon}>{weather?.icon || '☁️'}</Text>
                      <View>
                        <Text style={styles.toolTitle}>실시간 날씨 정보</Text>
                        <View style={styles.weatherTempRow}>
                          <Text style={styles.weatherTemp}>{weather?.temp !== undefined ? `${weather.temp}°C` : '--°C'}</Text>
                          <Text style={styles.weatherDesc}>{weather?.desc || '로딩 중...'}</Text>
                        </View>
                      </View>
                    </View>

                    {/* 5-day Weather Forecast */}
                    <Text style={styles.subSectionTitle}>🕒 일정별 날씨 예보</Text>
                    <View style={styles.forecastGrid}>
                      {forecast.map((f, i) => (
                        <View key={i} style={styles.forecastCard}>
                          <Text style={styles.forecastDay}>{f.day}</Text>
                          <Text style={styles.forecastIcon}>{f.icon}</Text>
                          <Text style={styles.forecastTemp}>{f.temp}°C</Text>
                          <Text style={styles.forecastDesc}>{f.desc}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Clothing Guide tips */}
                    {clothingTips ? (
                      <View style={styles.clothingTipsBox}>
                        <Text style={styles.clothingTipsTitle}>
                          👗 의상 추천 팁 ({clothingTips.seasonName})
                        </Text>
                        <Text style={styles.clothingTipsText}>{clothingTips.tips}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Exchange Rate Card */}
                  <View style={styles.card}>
                    <View style={styles.exchangeHeader}>
                      <View style={styles.exchangeIconBox}>
                        <Text style={styles.exchangeIconEmoji}>🪙</Text>
                      </View>
                      <View>
                        <Text style={styles.toolTitle}>실시간 엔화 환율 (100 JPY)</Text>
                        <View style={styles.rateValueRow}>
                          <Text style={styles.rateValue}>
                            ₩ {Math.round(exchangeRate * 100 * 100) / 100}원
                          </Text>
                          <Text style={styles.rateTime}>({exchangeUpdateTime || '인터넷 연결 필요'})</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Google Translation Card */}
                  <View style={styles.card}>
                    <Text style={styles.toolTitle}>🇯🇵 실시간 여행 번역기</Text>
                    
                    {/* Source & Target Indicator */}
                    <View style={styles.transLangRow}>
                      <Text style={styles.langLabel}>
                        {transSourceLang === 'ko' ? '한국어' : '일본어'}
                      </Text>
                      <TouchableOpacity onPress={swapTranslationLanguages} style={styles.btnSwap}>
                        <Ionicons name="swap-horizontal" size={16} color="#6c5ce7" />
                      </TouchableOpacity>
                      <Text style={styles.langLabel}>
                        {transTargetLang === 'ko' ? '한국어' : '일본어'}
                      </Text>
                    </View>

                    {/* Translation Input */}
                    <TextInput
                      style={[styles.input, styles.transInput]}
                      value={sourceText}
                      onChangeText={setSourceText}
                      placeholder="번역할 내용을 입력해 주세요..."
                      multiline={true}
                    />

                    {/* Run translation trigger */}
                    <View style={styles.transActionRow}>
                      <TouchableOpacity onPress={() => setSourceText('')} style={styles.btnTransClear}>
                        <Text style={styles.btnTransClearText}>지우기</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleTranslate} style={styles.btnTransSubmit}>
                        <Text style={styles.btnTransSubmitText}>
                          {isTranslating ? '번역 중...' : '번역하기'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Result Panel */}
                    {targetText ? (
                      <View style={styles.transResultPanel}>
                        <View style={styles.transResultHeader}>
                          <Text style={styles.transResultLabel}>번역 결과</Text>
                          <TouchableOpacity onPress={() => copyToClipboard(targetText)}>
                            <Ionicons name="copy-outline" size={16} color="#6c5ce7" />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.transResultText}>{targetText}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              )}

              {/* 4-4. ETC / SETTINGS SUB-TAB */}
              {activeExtraSubTab === 'etc' && (
                <View style={styles.etcContainer}>
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>📄 여행 일정 PDF 출력</Text>
                    <Text style={styles.etcDesc}>
                      작성하신 여행 일정을 깔끔한 PDF 레이아웃으로 출력하거나 기기에 파일로 저장 및 공유할 수 있습니다.
                    </Text>
                    <TouchableOpacity style={styles.btnPdfExport} onPress={handleExportTimelinePDF}>
                      <Ionicons name="document-text" size={16} color="#ffffff" />
                      <Text style={styles.btnPdfExportText}>전 일정 PDF 인쇄 및 저장</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>🪙 예산 및 정산 보고서 PDF 출력</Text>
                    <Text style={styles.etcDesc}>
                      공동 경비 지출 내역 및 쇼핑 지출을 합산한 예산 보고서와 정산 결과를 PDF 파일로 인쇄 및 내보내기 합니다.
                    </Text>
                    <TouchableOpacity style={[styles.btnPdfExport, { backgroundColor: '#e17055' }]} onPress={handleExportBudgetPDF}>
                      <Ionicons name="wallet" size={16} color="#ffffff" />
                      <Text style={styles.btnPdfExportText}>예산 및 정산 PDF 인쇄/저장</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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

// ==================== PDF HTML GENERATOR FUNCTIONS ====================

const generateScheduleHtml = (travelData: any, exchangeRate: number) => {
  const categoryLabels: { [key: string]: string } = {
    flight: "✈️ 항공",
    meal: "🍴 맛집",
    cafe: "☕ 카페",
    sightseeing: "🏔️ 명소",
    shopping: "🛍️ 쇼핑",
    lodging: "🏨 숙소",
    transport: "🚌 교통",
    etc: "✨ 기타"
  };

  const escapeHTML = (str: string) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  const getDayDateString = (dayIndex: string) => {
    const start = new Date(travelData.startDate);
    const dayOffset = parseInt(dayIndex) - 1;
    start.setDate(start.getDate() + dayOffset);
    const mm = String(start.getMonth() + 1).padStart(2, '0');
    const dd = String(start.getDate()).padStart(2, '0');
    const dayName = start.toLocaleDateString('ko-KR', { weekday: 'short' });
    return `${mm}.${dd}(${dayName})`;
  };

  const dayKeys = Object.keys(travelData.days || {}).sort((a, b) => {
    return parseInt(a.replace('day', '')) - parseInt(b.replace('day', ''));
  });

  const tripTitle = travelData.title || '나의 여행 계획';
  const tripDates = `${travelData.startDate} ~ ${travelData.endDate}`;
  const totalDays = dayKeys.length;
  const nights = totalDays > 1 ? `${totalDays - 1}박 ${totalDays}일` : '당일 일정';
  const memberText = `${travelData.memberCount}명`;

  let styleHtml = `
    <style>
      body {
        margin: 0;
        padding: 20px;
        background-color: #f8fafc;
      }
      .pdf-export-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #2c3e50;
        background: #ffffff;
        width: 100%;
        max-width: 720px;
        margin: 0 auto;
        padding: 40px;
        box-sizing: border-box;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      }
      * {
        box-shadow: none !important;
        text-shadow: none !important;
      }
    </style>
  `;

  let headerHtml = `
    <div style="border-bottom: 3px solid #6c5ce7; padding-bottom: 16px; margin-bottom: 24px; text-align: center; width: 100%;">
      <h1 style="font-size: 1.8rem; font-weight: 800; color: #2c3e50; margin: 0 0 8px 0; letter-spacing: -0.5px;">✈️ ${escapeHTML(tripTitle)}</h1>
      <p style="font-size: 0.95rem; color: #7f8c8d; font-weight: 600; margin: 0;">여행 기간: ${tripDates} (${nights}) | 여행 인원: ${memberText}</p>
    </div>
  `;

  let contentHtml = '';

  dayKeys.forEach((dayKey) => {
    const items = travelData.days[dayKey] || [];
    if (items.length === 0) return;

    const dayIndex = dayKey.replace('day', '');
    const dateStr = getDayDateString(dayIndex);

    contentHtml += `
      <div style="margin-top: 28px; margin-bottom: 14px; border-bottom: 1.5px solid rgba(108, 92, 231, 0.25); padding-bottom: 6px; text-align: left; width: 100%;">
        <h2 style="font-size: 1.25rem; font-weight: 800; color: #6c5ce7; margin: 0;">Day ${dayIndex} <span style="font-size: 0.9rem; font-weight: 600; color: #7f8c8d; margin-left: 6px;">(${dateStr})</span></h2>
      </div>
    `;

    const sortedItems = [...items].sort((a, b) => a.time.localeCompare(b.time));

    sortedItems.forEach((item) => {
      const catLabel = categoryLabels[item.type] || categoryLabels[item.category] || "기타";
      const costText = item.cost > 0
        ? (item.currency === 'JPY'
            ? `¥ ${formatNumber(item.cost)} (약 ₩ ${formatNumber(item.cost * exchangeRate)})`
            : `₩ ${formatNumber(item.cost)}`)
        : "비용 없음/무료";

      contentHtml += `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; background: #fdfdfd; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; page-break-inside: avoid; box-sizing: border-box;">
          <tr>
            <td style="width: 62px; padding: 12px; vertical-align: top;">
              <div style="width: 62px; background: rgba(108, 92, 231, 0.08); border-radius: 8px; padding: 6px 4px; text-align: center; box-sizing: border-box;">
                <span style="font-size: 0.75rem; font-weight: 800; color: #6c5ce7; line-height: 1.2; display: block;">${item.time}</span>
                <span style="font-size: 0.62rem; color: #7f8c8d; font-weight: 700; margin-top: 2px; display: block;">${catLabel}</span>
              </div>
            </td>
            <td style="padding: 12px 16px 12px 6px; vertical-align: top; text-align: left;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: left; vertical-align: top;">
                    <h3 style="font-size: 1rem; font-weight: 700; color: #2c3e50; margin: 0; padding: 0;">${escapeHTML(item.name)}</h3>
                  </td>
                  <td style="text-align: right; vertical-align: top; width: 200px; padding-left: 10px;">
                    <span style="font-size: 0.78rem; color: #2ecc71; font-weight: 700; white-space: nowrap;">${costText}</span>
                  </td>
                </tr>
                ${item.memo ? `
                <tr>
                  <td colspan="2" style="padding-top: 6px;">
                    <p style="font-size: 0.8rem; color: #7f8c8d; margin: 0; white-space: pre-line; background: rgba(0,0,0,0.01); padding: 6px 10px; border-radius: 6px; border-left: 3px solid rgba(108, 92, 231, 0.4); line-height: 1.4; text-align: left;">${escapeHTML(item.memo)}</p>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
        </table>
      `;
    });
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      ${styleHtml}
    </head>
    <body>
      <div class="pdf-export-container">
        ${headerHtml}
        ${contentHtml}
      </div>
    </body>
    </html>
  `;
};

const generateBudgetHtml = (travelData: any, stats: any, exchangeRate: number) => {
  const escapeHTML = (str: string) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  const tripTitle = travelData.title || '나의 여행 계획';
  const tripDates = `${travelData.startDate} ~ ${travelData.endDate}`;

  // 공동 경비 리스트 추출
  const jointDetailedList: any[] = [];
  let jointCostKRW = 0;

  const dayKeys = Object.keys(travelData.days || {}).sort((a, b) => {
    return parseInt(a.replace('day', '')) - parseInt(b.replace('day', ''));
  });

  const categoryLabels: { [key: string]: string } = {
    flight: "✈️ 항공",
    meal: "🍴 식당/맛집",
    cafe: "☕ 카페/디저트",
    sightseeing: "🏔️ 관광지/명소",
    shopping: "🛍️ 쇼핑",
    lodging: "🏨 숙소",
    transport: "🚌 교통",
    etc: "✨ 기타"
  };

  dayKeys.forEach((dayKey) => {
    const items = travelData.days[dayKey] || [];
    items.forEach((item: any) => {
      if (item.cost && item.cost > 0) {
        const itemCostKRW = item.currency === 'JPY' ? Math.round(item.cost * exchangeRate) : item.cost;
        jointCostKRW += itemCostKRW;
        jointDetailedList.push({
          name: item.name,
          categoryName: categoryLabels[item.type] || categoryLabels[item.category] || "기타",
          costText: item.currency === 'JPY' ? `¥ ${formatNumber(item.cost)}` : `₩ ${formatNumber(item.cost)}`,
          totalKRW: itemCostKRW
        });
      }
    });
  });

  // 개인 쇼핑 리스트 추출
  const personalShoppingList: any[] = [];
  let personalShoppingCostKRW = 0;

  const shoppingCategories: { [key: string]: string } = {
    dessert: "🍰 디저트/과자",
    drug: "💊 의약품/화장품",
    alcohol: "🍶 주류 (맥주/위스키)",
    souvenir: "🧸 기념품/소품",
    etc: "✨ 기타"
  };

  (travelData.shoppingList || []).forEach((item: any) => {
    if (item.checked) {
      const itemTotalCost = item.cost * item.qty;
      const itemTotalKRW = item.currency === 'JPY' ? Math.round(itemTotalCost * exchangeRate) : itemTotalCost;
      personalShoppingCostKRW += itemTotalKRW;
      personalShoppingList.push({
        name: item.name,
        categoryName: shoppingCategories[item.category] || "기타",
        costPerUnit: item.currency === 'JPY' ? `¥ ${formatNumber(item.cost)}` : `₩ ${formatNumber(item.cost)}`,
        qtyText: `${item.qty}개`,
        totalKRW: itemTotalKRW
      });
    }
  });

  const totalDays = dayKeys.length;
  const nights = totalDays > 1 ? `${totalDays - 1}박 ${totalDays}일` : '당일 일정';

  let styleHtml = `
    <style>
      body {
        margin: 0;
        padding: 20px;
        background-color: #f8fafc;
      }
      .pdf-export-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #2c3e50;
        background: #ffffff;
        width: 100%;
        max-width: 720px;
        margin: 0 auto;
        padding: 40px;
        box-sizing: border-box;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
      }
      th, td {
        padding: 10px;
        border-bottom: 1px solid #e2e8f0;
        text-align: left;
        font-size: 0.85rem;
      }
      th {
        background-color: #f1f5f9;
        font-weight: 800;
      }
    </style>
  `;

  let headerHtml = `
    <div style="border-bottom: 3px solid #6c5ce7; padding-bottom: 16px; margin-bottom: 24px; text-align: center; width: 100%;">
      <h1 style="font-size: 1.8rem; font-weight: 800; color: #2c3e50; margin: 0 0 8px 0; letter-spacing: -0.5px;">🪙 ${escapeHTML(tripTitle)} 예산 보고서</h1>
      <p style="font-size: 0.95rem; color: #7f8c8d; font-weight: 600; margin: 0;">여행 기간: ${tripDates} (${nights}) | 인원: ${travelData.memberCount}명</p>
    </div>
  `;

  let jointTableHtml = `
    <h3 style="font-size: 1.1rem; font-weight: 800; color: #6c5ce7; margin: 0 0 10px 0;">🏔️ 공동 여행 경비 지출 내역 (일정 기준)</h3>
    <table>
      <thead>
        <tr>
          <th>지출 항목명</th>
          <th style="width: 130px;">분류</th>
          <th style="width: 120px; text-align: right;">단가</th>
          <th style="width: 140px; text-align: right;">환산 금액(KRW)</th>
        </tr>
      </thead>
      <tbody>
        ${jointDetailedList.map((item, idx) => `
          <tr style="background-color: ${idx % 2 === 1 ? '#fafafa' : '#ffffff'};">
            <td style="font-weight: 600;">${escapeHTML(item.name)}</td>
            <td style="color: #7f8c8d;">${item.categoryName}</td>
            <td style="text-align: right; font-weight: 700;">${item.costText}</td>
            <td style="text-align: right; font-weight: 800; color: #27ae60;">${formatNumber(item.totalKRW)}원</td>
          </tr>
        `).join('')}
        <tr style="background: rgba(46, 204, 113, 0.04); font-weight: 800;">
          <td colspan="3">공동 경비 합계 금액</td>
          <td style="text-align: right; color: #27ae60; font-size: 0.95rem; font-weight: 900;">${formatNumber(jointCostKRW)}원</td>
        </tr>
      </tbody>
    </table>
  `;

  let personalTableHtml = `
    <h3 style="font-size: 1.1rem; font-weight: 800; color: #e17055; margin: 24px 0 10px 0;">🛒 개인 쇼핑 지출 내역</h3>
    <table>
      <thead>
        <tr>
          <th>쇼핑 항목명</th>
          <th style="width: 130px;">분류</th>
          <th style="width: 100px; text-align: right;">단가</th>
          <th style="width: 70px; text-align: right;">수량</th>
          <th style="width: 140px; text-align: right;">총 지출 금액</th>
        </tr>
      </thead>
      <tbody>
        ${personalShoppingList.map((item, idx) => `
          <tr style="background-color: ${idx % 2 === 1 ? '#fafafa' : '#ffffff'};">
            <td style="font-weight: 600;">🛒 ${escapeHTML(item.name)}</td>
            <td style="color: #7f8c8d;">${item.categoryName}</td>
            <td style="text-align: right; font-weight: 700;">${item.costPerUnit}</td>
            <td style="text-align: right; color: #7f8c8d;">${item.qtyText}</td>
            <td style="text-align: right; font-weight: 800; color: #d35400;">${formatNumber(item.totalKRW)}원</td>
          </tr>
        `).join('')}
        <tr style="background: rgba(225, 112, 85, 0.04); font-weight: 800;">
          <td colspan="4">개인 소비 합계 금액</td>
          <td style="text-align: right; color: #e17055; font-size: 0.95rem; font-weight: 900;">${formatNumber(personalShoppingCostKRW)}원</td>
        </tr>
      </tbody>
    </table>
  `;

  let settlementHtml = `
    <div style="margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 12px;">
      <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0 0 10px 0;">🪙 N분의 1 정산 요약</h3>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: 600; color: #475569;">총 예상 공동 경비:</span>
        <span style="font-weight: 800; color: #6c5ce7;">${formatNumber(jointCostKRW * travelData.memberCount)}원</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: 600; color: #475569;">정산 인원:</span>
        <span style="font-weight: 800; color: #2c3e50;">${travelData.memberCount}명</span>
      </div>
      <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 12px 0;">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span style="font-weight: 800; color: #2c3e50; font-size: 1.05rem;">1인당 정산 금액 (공동경비):</span>
        <span style="font-weight: 900; color: #2ecc71; font-size: 1.3rem;">${formatNumber(Math.round(jointCostKRW))}원</span>
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      ${styleHtml}
    </head>
    <body>
      <div class="pdf-export-container">
        ${headerHtml}
        ${jointTableHtml}
        ${personalTableHtml}
        ${settlementHtml}
      </div>
    </body>
    </html>
  `;
};

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
