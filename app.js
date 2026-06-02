/* Sapo - Sapporo & Otaru Travel Planner Core Script */

// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration from user
const firebaseConfig = {
  apiKey: "AIzaSyCsh26wifPbjtl24zt9F9qPuOnYKHZc5Ws",
  authDomain: "travel-plan-47a20.firebaseapp.com",
  projectId: "travel-plan-47a20",
  storageBucket: "travel-plan-47a20.firebasestorage.app",
  messagingSenderId: "586074256321",
  appId: "1:586074256321:web:3fb5f72c641419a4337540",
  measurementId: "G-H5B7GF19CV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// 1. CONSTANTS & INITIAL DATA (Sapporo 3박 4일 템플릿)
// ==========================================
const SAPPORO_TEMPLATE = {
  version: "1.0",
  title: "삿포로 & 오타루 초여름 여행 ✈️",
  startDate: "2026-06-13",
  endDate: "2026-06-16",
  memberCount: 2,
  days: {
    day1: [],
    day2: [],
    day3: [],
    day4: []
  },
  checklist: [
    { id: 1, text: "여권 (만료일 6개월 이상)", checked: true },
    { id: 2, text: "비행기 표 & 호텔 바우처 확인", checked: true },
    { id: 3, text: "Visit Japan Web 미리 등록", checked: false },
    { id: 4, text: "트래블월렛 / 트래블로그 카드 발급", checked: true },
    { id: 5, text: "현금 환전 (야타이나 시장 결제용)", checked: false },
    { id: 6, text: "일본용 eSIM / 유심 구매", checked: false },
    { id: 7, text: "110V 돼지코 플러그", checked: false },
    { id: 8, text: "얇은 가디건 또는 바람막이 (밤 기온 낮음)", checked: false },
    { id: 9, text: "우산/양산 겸용 소형 우산", checked: false }
  ]
};

// ==========================================
// 1-2. PLAN B FOODIE LISTS (삿포로 & 오타루 대체 맛집)
// ==========================================
const FOOD_CATEGORIES = {
  meat: { label: "🥩 고기 / 육류", icon: "ri-restaurant-line" },
  seafood: { label: "🐟 해산물 / 스시", icon: "ri-goblet-line" },
  noodle: { label: "🍛 면 / 스프카레", icon: "ri-restaurant-2-line" },
  dessert: { label: "🍰 디저트 / 카페", icon: "ri-cup-line" }
};

const SAPPORO_FOOD_LIST = [
  {
    name: "스프카레 스아게플러스 (Suage+)",
    category: "noodle",
    rating: "4.5",
    menu: "닭꼬치(시레토코도리) 스프카레 (약 1,400엔)",
    tips: "가라쿠(GARAKU)의 줄이 너무 길어 포기해야 할 때 1티어 대안지! 숯불에 구운 닭고기가 꼬치에 꽂혀 나와 먹기 편하고 국물이 대단히 깊고 얼큰합니다. 가라쿠 바로 근처에 본점과 2호점이 붙어있어 웨이팅 분산이 빠릅니다.",
    address: "Suage+, South 4 West 5, Sapporo",
    openTime: "11:30",
    closeTime: "21:30"
  },
  {
    name: "스프카레 트레져 (TREASURE)",
    category: "noodle",
    rating: "4.4",
    menu: "함바그 스프카레 (약 1,350엔)",
    tips: "스프카레 맛집 가라쿠(GARAKU)의 자매 브랜드 식당입니다. 비법 베이스 스프와 맛이 매우 유사하여 가라쿠 웨이팅이 감당이 안 될 때 바로 갈 수 있는 훌륭한 대안입니다. 철판 함바그 토핑이 대단히 잘 어울립니다.",
    address: "스프카레 TREASURE, Sapporo",
    openTime: "11:30",
    closeTime: "20:30"
  },
  {
    name: "징기스칸 아루코 (Alco)",
    category: "meat",
    rating: "4.6",
    menu: "생양고기 어깨살 & 양갈비 (약 1,200엔)",
    tips: "다루마 본점과 스스키노 골목의 다른 지점에 줄이 수십 미터 서 있을 때 갈 수 있는 숨겨진 골목 생양고기 최강 대안! 고기 질이 다루마만큼 훌륭하고 가격도 착합니다. 아늑한 다찌석 위주로 조용히 맥주와 곁들이기 좋습니다.",
    address: "Arco Jingisukan, Sapporo",
    openTime: "17:00",
    closeTime: "22:00"
  },
  {
    name: "라멘 요시야마 쇼텐 (Yoshiyama Shouten)",
    category: "noodle",
    rating: "4.3",
    menu: "매운 참깨 미소 라멘 (약 950엔)",
    tips: "라멘 신겐의 1~2시간 이상 웨이팅이 부담스러우시다면 삿포로역 ESTA 공화국이나 스스키노 빌딩 지하의 요시야마 쇼텐으로 가세요! 볶은 참깨의 고소함과 삿포로 정통 미소의 감칠맛이 폭발하는 국물이 웨이팅 타협 이상의 맛을 선사합니다.",
    address: "Yoshiyama Shouten, Sapporo",
    openTime: "11:00",
    closeTime: "21:00"
  },
  {
    name: "스시잔마이 스스키노점 (Sushizanmai)",
    category: "seafood",
    rating: "4.1",
    menu: "참치 세트 & 단품 초밥 (세트 약 2,500엔)",
    tips: "삿포로 유명 스시야들이 대부분 사전 예약제이거나 대기가 일찍 마감됩니다. 스시잔마이는 24시간 영업하여 늦은 밤 야식으로도 웨이팅 없이 신선한 홋카이도 해산물 스시를 맛볼 수 있는 최고의 전천후 대체지입니다.",
    address: "Sushizanmai Susukino, Sapporo",
    openTime: "00:00",
    closeTime: "24:00"
  }
];

const OTARU_FOOD_LIST = [
  {
    name: "오타루 도야마 (Otaru Toyama)",
    category: "seafood",
    rating: "4.5",
    menu: "도야마 특선 카이센동 (약 3,500엔)",
    tips: "오타루역 삼각시장 내부의 타키나미 식당 웨이팅이 시장 밖까지 가득 차 있을 때 탈출할 수 있는 최고의 1선 대체지입니다! 삼각시장 바로 뒤쪽에 위치하며, 재료 신선도와 우니, 게살 토핑 양이 전혀 밀리지 않는 숨은 로컬 강자입니다.",
    address: "Otaru Toyama Kaisendon",
    openTime: "11:00",
    closeTime: "18:00"
  },
  {
    name: "오타루 마사즈시 운하점 (Masazushi)",
    category: "seafood",
    rating: "4.4",
    menu: "타쿠미 스시 코스 (약 6,500엔)",
    tips: "미스터 초밥왕의 고향 오타루에서 가장 전통 있고 상징적인 대표 스시야입니다. 본관 웨이팅이 길다면 운하점의 아름다운 운하 전망 창가 자리를 노려보는 것을 적극 추천합니다. 이세즈시 대비 예약 난이도가 낮고 캐주얼합니다.",
    address: "Otaru Masazushi Zenan",
    openTime: "11:00",
    closeTime: "21:00"
  },
  {
    name: "롯카테이 오타루점 (Rokkatei)",
    category: "dessert",
    rating: "4.4",
    menu: "슈크림 빵 & 유키콘치즈 (약 150엔~300엔)",
    tips: "사카이마치 거리의 르타오(LeTAO) 카페 테이블 웨이팅 대기가 50팀이 넘어갈 때, 바로 옆에 있는 롯카테이 2층 카페 스탠딩석으로 가세요! 갓 구운 바삭한 슈크림 빵을 사면 무료로 원두커피 한 잔을 제공하는 혜택이 있어 가성비 쉼터로 제격입니다.",
    address: "Rokkatei Otaru",
    openTime: "09:00",
    closeTime: "18:00"
  },
  {
    name: "기타카로 오타루 본점 (Kitakaro)",
    category: "dessert",
    rating: "4.3",
    menu: "홋카이도 우유 소프트 아이스크림 (약 400엔)",
    tips: "르타오 본점 웨이팅 타협을 위한 두 번째 대안! 기타카로 본관 안쪽의 조용하고 고풍스러운 정원에서 아주 진한 정통 홋카이도 목장 우유 맛 아이스크림과 달콤한 바움쿠헨 한 조각을 시켜서 벤치에 앉아 여유롭게 쉴 수 있습니다.",
    address: "Kitakaro Otaru",
    openTime: "09:00",
    closeTime: "18:00"
  }
];

// ==========================================
// 2. STATE MANAGEMENT & APP STATE
// ==========================================
let travelData = {};
let roomId = ""; // Room code for Firestore sync
let activeTab = "day1"; // Default tab
let isEditor = true; // Editor permission state
let currentOtaruFilter = "all"; // Otaru foodie filter state
let currentSapporoFilter = "all"; // Sapporo foodie filter state
const CURRENCY_CONVERSION_RATE = 9.0; // 100 JPY = 900 KRW

// ==========================================
// 2-2. IN-APP LIVE MAP STATE & DB (TRIPLE STYLE)
// ==========================================
let leafletMap = null;
let leafletMarkers = [];
let leafletPolyline = null;
const coordsCache = {};

// Sapporo & Otaru Essential Coordinates Database (0-latency rendering)
const LOCATION_COORDINATES = {
  "신치토세 공항": [42.7874, 141.6811],
  "삿포로역": [43.0686, 141.3508],
  "머큐어 호텔 삿포로": [43.0560, 141.3556],
  "스스키노": [43.0556, 141.3538],
  "오도리 공원": [43.0601, 141.3491],
  "징기스칸 다루마": [43.0545, 141.3533],
  "스프카레 가라쿠": [43.0570, 141.3552],
  "스프카레 스아게플러스": [43.0558, 141.3527],
  "오타루 운하": [43.2014, 141.0022],
  "오타루역": [43.1970, 140.9942],
  "오타루 마사즈시": [43.1931, 141.0006],
  "사카이마치 거리": [43.1918, 141.0076],
  "오타루 오르골당": [43.1903, 141.0078],
  "오타루 르타오 본점": [43.1908, 141.0076],
  "비에이역": [43.5902, 142.4578],
  "준페이": [43.5900, 142.4415],
  "비에이 준페이": [43.5900, 142.4415],
  "준페이 덮밥": [43.5900, 142.4415],
  "청의 호수": [43.4936, 142.6144],
  "청의호수": [43.4936, 142.6144],
  "흰수염 폭포": [43.4735, 142.6393],
  "흰수염폭포": [43.4735, 142.6393],
  "후라노": [43.3421, 142.3831],
  "팜 도미타": [43.4181, 142.4278],
  "탁신관": [43.5322, 142.4839],
  "자작나무 숲": [43.5322, 142.4839],
  "사계채의 언덕": [43.5284, 142.4646],
  "사계채의언덕": [43.5284, 142.4646],
  "시키사이노오카": [43.5284, 142.4646],
  "켄과 메리의 나무": [43.6065, 142.4497],
  "켄과 메리 나무": [43.6065, 142.4497],
  "패치워크의 길": [43.6000, 142.4400],
  "패치워크 로드": [43.6000, 142.4400],
  "마일드세븐 언덕": [43.5937, 142.4042],
  "마일드세븐의 언덕": [43.5937, 142.4042],
  "세븐스타의 나무": [43.6268, 142.4347],
  "세븐스타 나무": [43.6268, 142.4347],
  "크리스마스 트리": [43.5654, 142.4428],
  "비에이 크리스마스 트리": [43.5654, 142.4428],
  "크리스마스트리": [43.5654, 142.4428],
  "닝글테라스": [43.3232, 142.3582],
  "닝글 테라스": [43.3232, 142.3582],
  
  // Incheon / Korea (Prevents breaking in case of Korea tests)
  "인천공항": [37.4602, 126.4407],
  "인천국제공항": [37.4602, 126.4407],
  "인천국제공항 제1여객터미널": [37.4602, 126.4407],
  "노벨파킹센터": [37.4475, 126.3762],
  
  // Custom exact copy-paste Google Map English addresses
  "4 Chome Kita 6 Jonishi, Kita Ward, Sapporo, Hokkaido 060-0806 일본": [43.0708, 141.3496],
  "4 Chome Kita 6 Jonishi, Kita Ward, Sapporo, Hokkaido": [43.0708, 141.3496],
  "4 Chome-4-10 Motomachi, Biei, Kamikawa District, Hokkaido 071-0208 일본": [43.5900, 142.4415],
  "4 Chome-4-10 Motomachi, Biei, Kamikawa District, Hokkaido": [43.5900, 142.4415],
  "1-chōme-4-20 Ironai, Otaru, Hokkaido 047-0031 일본": [43.2010, 141.0010],
  "1-chōme-4-20 Ironai, Otaru, Hokkaido 047-0031": [43.2010, 141.0010],
  "1-chōme-4-20 Ironai, Otaru, Hokkaido": [43.2010, 141.0010]
};

// Clean address string for OSM geocoding maximize success rate
function cleanAddress(addr) {
  if (!addr) return "";
  let cleaned = addr.trim();

  // 1. Remove country and postal code prefixes/suffixes
  cleaned = cleaned.replace(/일본\s*/gi, "");
  cleaned = cleaned.replace(/japan\s*/gi, "");
  cleaned = cleaned.replace(/〒\s*\d{3}-\d{4}\s*/g, "");
  cleaned = cleaned.replace(/\d{3}-\d{4}\s*/g, ""); // 7-digit postal code format

  // 2. Convert Japanese full-width characters (numbers and hyphens) to half-width
  const fullWidthMap = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
    '－': '-', 'ー': '-', '−': '-', '－': '-'
  };
  cleaned = cleaned.replace(/[０-９－ー−]/g, m => fullWidthMap[m] || m);

  // 3. Remove parentheses or brackets and contents within them (often contains store names that confuse OSM)
  cleaned = cleaned.replace(/\([^)]*\)/g, "");
  cleaned = cleaned.replace(/\[[^\]]*\]/g, "");

  return cleaned.trim();
}

// Low-level OSM Nominatim fetch helper
async function callNominatim(q) {
  if (!q || q.length < 3) return null;
  
  // Only append ", Hokkaido" if it doesn't already contain it to prevent OSM confusion
  let searchQuery = q;
  if (!q.toLowerCase().includes("hokkaido")) {
    searchQuery = q + ", Hokkaido";
  }
  
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery)}`, {
      headers: { "User-Agent": "SapoTravelPlanner/1.0" }
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    }
  } catch (error) {
    console.warn("OSM single fetch failed for: " + q, error);
  }
  return null;
}

// Progressive backoff geocoder to guarantee nearest district match for both English & Japanese address styles
async function geocodeWithProgressiveBackoff(cleanedQuery) {
  if (!cleanedQuery) return null;

  // 1. Try whole cleaned query first
  let coords = await callNominatim(cleanedQuery);
  if (coords) return coords;

  // Split query into parts
  let parts = cleanedQuery.split(/[\s,]+/);
  if (parts.length <= 1) return null;

  // Detect if address is English/Romanized (contains typical Latin alphabets like Sapporo, Otaru, Chome)
  const isEnglishAddress = /[a-zA-Z]/g.test(cleanedQuery);

  if (isEnglishAddress) {
    // English address style: Detailed is on the LEFT, Generic is on the RIGHT
    // We progressively chop off from the LEFT (front)
    while (parts.length > 1) {
      parts.shift(); // Remove the leftmost detailed word (e.g. "4", "Chome")
      const subQuery = parts.join(" ").trim();
      if (subQuery.length < 5) break; // Don't search too generic terms like just "Hokkaido"
      
      coords = await callNominatim(subQuery);
      if (coords) return coords;
    }
  } else {
    // Japanese address style: Generic is on the LEFT, Detailed is on the RIGHT
    // We progressively chop off from the RIGHT (back)
    while (parts.length > 1) {
      parts.pop(); // Remove the rightmost detailed word (e.g. building number, detailed chome)
      const subQuery = parts.join(" ").trim();
      if (subQuery.length < 4) break;
      
      coords = await callNominatim(subQuery);
      if (coords) return coords;
    }
  }

  // 3. Fuzzy fallback: search regional centers if specific words exist
  if (cleanedQuery.toLowerCase().includes("biei")) {
    coords = await callNominatim("Biei");
    if (coords) return coords;
  }
  if (cleanedQuery.toLowerCase().includes("otaru")) {
    coords = await callNominatim("Otaru");
    if (coords) return coords;
  }
  if (cleanedQuery.toLowerCase().includes("sapporo")) {
    coords = await callNominatim("Sapporo");
    if (coords) return coords;
  }

  return null;
}

// Async geocoding helper using 100% Free OpenStreetMap API & Google Maps Redirect Resolver
async function getCoordinates(name, mapAddress) {
  const query = (mapAddress || name || "").trim();
  if (!query) return null;

  // Check local memory cache first to protect API limits
  if (coordsCache[query]) return coordsCache[query];

  let targetQuery = query;

  // 0. Resolve short Google Maps URLs (e.g., maps.app.goo.gl or goo.gl/maps)
  if (query.includes("maps.app.goo.gl") || query.includes("goo.gl/maps")) {
    try {
      // Use AllOrigins CORS Proxy to fetch the actual redirect page
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(query)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const data = await response.json();
        if (data && data.contents) {
          // The Google Maps redirection page contains meta refresh link
          const metaMatch = data.contents.match(/url=([^"'>\s]+)/i);
          if (metaMatch && metaMatch[1]) {
            targetQuery = decodeURIComponent(metaMatch[1]);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to unshorten using allorigins proxy: " + query, e);
    }
  }

  // 1. Core Rule: Multi-pattern Regex parser to extract raw Lat/Lng from Google Maps link/text!
  // Pattern A: Standard Lat, Lng pair (e.g. 43.0560, 141.3533 or @43.0560,141.3533)
  let coordsMatch = targetQuery.match(/@?(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  
  // Pattern B: Google Maps iframe/embedded url coordinate parameters (!3d43.0560065!4d141.3533802)
  if (!coordsMatch) {
    coordsMatch = targetQuery.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  }
  
  // Pattern C: Query parameter coordinates (query=43.0560065,141.3533802 or q=43.0560,141.3533)
  if (!coordsMatch) {
    coordsMatch = targetQuery.match(/[?&](?:query|q)=(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  }

  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lon = parseFloat(coordsMatch[2]);
    // Safety check bounds for Japan/Hokkaido & Korea
    if (lat > 30 && lat < 50 && lon > 120 && lon < 150) {
      const coords = [lat, lon];
      coordsCache[query] = coords;
      return coords;
    }
  }

  // 2. Search local coordinate database first (0-latency match)
  if (LOCATION_COORDINATES[targetQuery]) {
    coordsCache[query] = LOCATION_COORDINATES[targetQuery];
    return LOCATION_COORDINATES[targetQuery];
  }
  
  // Fuzzy match local DB
  for (const key of Object.keys(LOCATION_COORDINATES)) {
    if (targetQuery.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(targetQuery.toLowerCase())) {
      coordsCache[query] = LOCATION_COORDINATES[key];
      return LOCATION_COORDINATES[key];
    }
  }

  // 3. Fallback to OpenStreetMap Nominatim with clean & progressive backoff
  const cleanedAddress = cleanAddress(targetQuery);
  const coords = await geocodeWithProgressiveBackoff(cleanedAddress);
  if (coords) {
    coordsCache[query] = coords;
    return coords;
  }

  return null;
}

// ==========================================
// 3. ELEMENT REFERENCES
// ==========================================
const elements = {
  txtDday: document.getElementById("txtDday"),
  txtTotalBudget: document.getElementById("txtTotalBudget"),
  txtTotalPlaces: document.getElementById("txtTotalPlaces"),
  tabButtons: document.querySelectorAll(".nav-tab"),
  tabContentDays: document.getElementById("tabContentDays"),
  tabContentExtra: document.getElementById("tabContentExtra"),
  timelineDayTitle: document.getElementById("timelineDayTitle"),
  timelineList: document.getElementById("timelineList"),
  timelineEmptyState: document.getElementById("timelineEmptyState"),
  btnAddPlace: document.getElementById("btnAddPlace"),
  btnEmptyAdd: document.getElementById("btnEmptyAdd"),
  btnShare: document.getElementById("btnShare"),
  
  // Settlement Tab Elements
  settleTotalBudget: document.getElementById("settleTotalBudget"),
  inputMemberCount: document.getElementById("inputMemberCount"),
  btnMemberDec: document.getElementById("btnMemberDec"),
  btnMemberInc: document.getElementById("btnMemberInc"),
  settlePerMember: document.getElementById("settlePerMember"),
  categoryBreakdownList: document.getElementById("categoryBreakdownList"),
  
  // Foodie List Elements
  tabContentFoodOtaru: document.getElementById("tabContentFoodOtaru"),
  tabContentFoodSapporo: document.getElementById("tabContentFoodSapporo"),
  otaruFoodFilter: document.getElementById("otaruFoodFilter"),
  sapporoFoodFilter: document.getElementById("sapporoFoodFilter"),
  otaruFoodGrid: document.getElementById("otaruFoodGrid"),
  sapporoFoodGrid: document.getElementById("sapporoFoodGrid"),

  // Food Add Modal Elements
  modalFood: document.getElementById("modalFood"),
  formFood: document.getElementById("formFood"),
  foodModalTitle: document.getElementById("foodModalTitle"),
  foodCityType: document.getElementById("foodCityType"),
  foodEditIndex: document.getElementById("foodEditIndex"),
  foodName: document.getElementById("foodName"),
  foodCategory: document.getElementById("foodCategory"),
  foodRating: document.getElementById("foodRating"),
  foodMenu: document.getElementById("foodMenu"),
  foodAddress: document.getElementById("foodAddress"),
  foodOpenTime: document.getElementById("foodOpenTime"),
  foodCloseTime: document.getElementById("foodCloseTime"),
  foodTips: document.getElementById("foodTips"),
  btnFoodModalCancel: document.getElementById("btnFoodModalCancel"),
  btnFoodModalClose: document.getElementById("btnFoodModalClose"),
  
  // Checklist Tab Elements
  formAddChecklist: document.getElementById("formAddChecklist"),
  inputChecklistText: document.getElementById("inputChecklistText"),
  checklistContainer: document.getElementById("checklistContainer"),
  btnResetChecklist: document.getElementById("btnResetChecklist"),

  // Modal Elements
  modalPlace: document.getElementById("modalPlace"),
  formPlace: document.getElementById("formPlace"),
  modalTitle: document.getElementById("modalTitle"),
  editItemIndex: document.getElementById("editItemIndex"),
  placeName: document.getElementById("placeName"),
  placeTime: document.getElementById("placeTime"),
  placeCategory: document.getElementById("placeCategory"),
  placeCost: document.getElementById("placeCost"),
  placeCurrency: document.getElementById("placeCurrency"),
  placeMap: document.getElementById("placeMap"),
  placeMemo: document.getElementById("placeMemo"),
  lblCostConversion: document.getElementById("lblCostConversion"),
  btnModalCancel: document.getElementById("btnModalCancel"),
  btnModalClose: document.getElementById("btnModalClose"),
  btnModalSubmit: document.getElementById("btnModalSubmit"),

  // Toast Container
  toastContainer: document.getElementById("toastContainer"),

  // Passcode Unlock
  btnUnlockEditor: document.getElementById("btnUnlockEditor")
};

// ==========================================
// 4. CORE INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initAppState();
  setupEventListeners();
});

// Initialize state from URL or LocalStorage or Template with Firestore sync
function initAppState() {
  const urlParams = new URLSearchParams(window.location.search);
  const compressedData = urlParams.get("p");
  const forceEdit = urlParams.get("edit") === "true";
  let roomParam = urlParams.get("room");

  // Load owned rooms list from localStorage to verify admin rights
  let ownedRooms = [];
  try {
    ownedRooms = JSON.parse(localStorage.getItem("sapo_owned_rooms") || "[]");
  } catch (e) {
    ownedRooms = [];
  }

  // 1. Backward Compatibility Bridge: Old link with compressed '?p=...'
  if (compressedData && !roomParam) {
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(compressedData);
      if (decompressed) {
        const importedData = JSON.parse(decompressed);
        
        // Auto-create a brand new Firestore room for migration
        roomParam = "sapo-" + Math.random().toString(36).substring(2, 8);
        ownedRooms.push(roomParam);
        localStorage.setItem("sapo_owned_rooms", JSON.stringify(ownedRooms));
        
        roomId = roomParam;
        isEditor = true;
        travelData = importedData;
        ensureFoodListsExist();
        
        // Save imported data to the newly created room and start sync
        setDoc(doc(db, "rooms", roomId), travelData).then(() => {
          showToast("✈️ 구버전 일정을 실시간 연동 클라우드 방으로 이전했습니다!", "success");
          const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
          window.history.replaceState({}, document.title, newUrl);
          startFirestoreSync();
        });
        return;
      }
    } catch (error) {
      console.error("구버전 URL 데이터 파싱 및 실시간 변환 실패:", error);
    }
  }

  // 2. Normal access or room link access
  if (!roomParam) {
    // 2-1. First time accessing without any room parameter in URL
    roomParam = "sapo-" + Math.random().toString(36).substring(2, 8);
    ownedRooms.push(roomParam);
    localStorage.setItem("sapo_owned_rooms", JSON.stringify(ownedRooms));
    
    // Auto-migrate standard sapo_travel_data if exists locally
    const legacyLocal = localStorage.getItem("sapo_travel_data");
    if (legacyLocal) {
      try {
        travelData = JSON.parse(legacyLocal);
        showToast("✨ 기존 로컬 일정을 실시간 클라우드로 자동 동기화합니다!", "success");
      } catch (e) {
        travelData = JSON.parse(JSON.stringify(SAPPORO_TEMPLATE));
      }
    } else {
      travelData = JSON.parse(JSON.stringify(SAPPORO_TEMPLATE));
    }
    
    roomId = roomParam;
    isEditor = true;
    ensureFoodListsExist();
    
    const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    window.history.replaceState({}, document.title, newUrl);

    setDoc(doc(db, "rooms", roomId), travelData).then(() => {
      startFirestoreSync();
    });
  } else {
    // 2-2. Entering via room share link (?room=xxxxxx)
    roomId = roomParam;
    
    // Grant admin rights if room is owned or force edit mode is present
    if (ownedRooms.includes(roomId) || forceEdit) {
      isEditor = true;
    } else {
      isEditor = false;
    }
    
    startFirestoreSync();
  }
}

// Start real-time Firestore sync channel
function startFirestoreSync() {
  const roomDocRef = doc(db, "rooms", roomId);
  
  onSnapshot(roomDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const serverData = docSnap.data();
      travelData = serverData;
      ensureFoodListsExist();
      
      // Update UI elements reactively
      renderApp();
      calculateDday();
      
      // If user joined via explicit &edit=true, save this room to owned list for convenience next time
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("edit") === "true") {
        let ownedRooms = [];
        try {
          ownedRooms = JSON.parse(localStorage.getItem("sapo_owned_rooms") || "[]");
          if (!ownedRooms.includes(roomId)) {
            ownedRooms.push(roomId);
            localStorage.setItem("sapo_owned_rooms", JSON.stringify(ownedRooms));
          }
        } catch (e) {}
      }
    } else {
      // Room does not exist in DB yet (e.g. invalid code or new creation fallback)
      if (isEditor) {
        if (!travelData || Object.keys(travelData).length === 0) {
          travelData = JSON.parse(JSON.stringify(SAPPORO_TEMPLATE));
          ensureFoodListsExist();
        }
        setDoc(roomDocRef, travelData);
      } else {
        showToast("존재하지 않는 여행 계획 방 코드입니다. 주소를 다시 확인해주세요.", "error");
      }
    }
  });
}

// Utility to verify and migrate food list structures to travelData
function ensureFoodListsExist() {
  if (!travelData.otaruFoodList) {
    travelData.otaruFoodList = JSON.parse(JSON.stringify(OTARU_FOOD_LIST));
  }
  if (!travelData.sapporoFoodList) {
    travelData.sapporoFoodList = JSON.parse(JSON.stringify(SAPPORO_FOOD_LIST));
  }
}

function applyEditorRights() {
  const editorElements = document.querySelectorAll(".editor-only");
  const viewerElements = document.querySelectorAll(".viewer-only");

  if (!isEditor) {
    // Viewer Mode (Hide editor buttons, show viewer badge)
    editorElements.forEach(el => el.classList.add("hidden-editor"));
    viewerElements.forEach(el => el.classList.remove("hidden"));
  } else {
    // Editor Mode (Show editor buttons, hide viewer badge)
    editorElements.forEach(el => el.classList.remove("hidden-editor"));
    viewerElements.forEach(el => el.classList.add("hidden"));
  }
}

async function saveToLocalStorage() {
  // Keep localized backup for safety
  localStorage.setItem(`sapo_travel_data_${roomId}`, JSON.stringify(travelData));
  
  if (!isEditor) return;
  
  try {
    const roomDocRef = doc(db, "rooms", roomId);
    await setDoc(roomDocRef, travelData);
  } catch (error) {
    console.error("Firestore 저장 실패:", error);
    showToast("⚠️ 실시간 서버 저장 실패! 네트워크를 확인하세요.", "error");
  }
}

// D-day Calculation
function calculateDday() {
  const today = new Date();
  // Set time to 00:00:00 for accurate day diff
  today.setHours(0, 0, 0, 0);
  
  const tripDate = new Date(travelData.startDate);
  tripDate.setHours(0, 0, 0, 0);
  
  const diffTime = tripDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    elements.txtDday.innerText = `D-${diffDays}`;
  } else if (diffDays === 0) {
    elements.txtDday.innerText = "D-Day 🎉";
  } else {
    elements.txtDday.innerText = `D+${Math.abs(diffDays)}`;
  }
}

// ==========================================
// 5. RENDERING ENGINE
// ==========================================
function renderApp() {
  updateDashboardStats();
  
  // 1. Hide all tab contents first to prevent overlapping or rendering conflicts
  elements.tabContentDays.classList.add("hidden");
  elements.tabContentDays.classList.remove("active");
  
  elements.tabContentExtra.classList.add("hidden");
  elements.tabContentExtra.classList.remove("active");
  
  elements.tabContentFoodOtaru.classList.add("hidden");
  elements.tabContentFoodOtaru.classList.remove("active");
  
  elements.tabContentFoodSapporo.classList.add("hidden");
  elements.tabContentFoodSapporo.classList.remove("active");
  
  // 2. Open and render the selected tab precisely
  if (activeTab === "extra") {
    elements.tabContentExtra.classList.remove("hidden");
    elements.tabContentExtra.classList.add("active");
    renderSettlementTab();
    renderChecklistTab();
  } else if (activeTab === "foodOtaru") {
    elements.tabContentFoodOtaru.classList.remove("hidden");
    elements.tabContentFoodOtaru.classList.add("active");
    renderFoodFilters("otaru");
    renderFoodList("otaru", currentOtaruFilter);
  } else if (activeTab === "foodSapporo") {
    elements.tabContentFoodSapporo.classList.remove("hidden");
    elements.tabContentFoodSapporo.classList.add("active");
    renderFoodFilters("sapporo");
    renderFoodList("sapporo", currentSapporoFilter);
  } else {
    // Day Tabs (day1 ~ day4)
    elements.tabContentDays.classList.remove("hidden");
    elements.tabContentDays.classList.add("active");
    
    // Set Day Title
    const dayIndex = activeTab.replace("day", "");
    const dateStr = getDayDateString(dayIndex);
    elements.timelineDayTitle.innerText = `Day ${dayIndex} 일정 (${dateStr})`;
    
    renderTimeline(activeTab);
  }
  
  applyEditorRights(); // Ensure permissions are applied strictly after all renders!
}

// Render Category Filter Chips for Food lists
function renderFoodFilters(city) {
  const container = city === "otaru" ? elements.otaruFoodFilter : elements.sapporoFoodFilter;
  const currentFilter = city === "otaru" ? currentOtaruFilter : currentSapporoFilter;
  
  container.innerHTML = "";
  
  // Filter Options list
  const filters = [
    { value: "all", label: "🌟 전체보기" },
    { value: "meat", label: "🥩 고기 / 육류" },
    { value: "seafood", label: "🐟 해산물 / 스시" },
    { value: "noodle", label: "🍛 면 / 스프카레" },
    { value: "dessert", label: "🍰 디저트 / 카페" }
  ];
  
  filters.forEach(f => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `filter-chip ${currentFilter === f.value ? "active" : ""}`;
    chip.innerHTML = f.label;
    
    chip.addEventListener("click", () => {
      if (city === "otaru") {
        currentOtaruFilter = f.value;
      } else {
        currentSapporoFilter = f.value;
      }
      renderFoodFilters(city); // Redraw chips active state
      renderFoodList(city, f.value); // Re-render grid with filter
    });
    
    container.appendChild(chip);
  });
}

// Render Food List dynamically (Otaru or Sapporo) with Filter support
function renderFoodList(city, filterType = "all") {
  let list = city === "otaru" ? travelData.otaruFoodList : travelData.sapporoFoodList;
  const gridEl = city === "otaru" ? elements.otaruFoodGrid : elements.sapporoFoodGrid;
  
  gridEl.innerHTML = "";
  
  // Filter items by category if not 'all'
  if (filterType !== "all") {
    list = list.filter(item => item.category === filterType);
  }
  
  if (!list || list.length === 0) {
    gridEl.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-sub); padding: 40px; font-weight: 600;">등록된 카테고리의 대체 맛집이 없습니다.</p>`;
    return;
  }
  
  list.forEach((item, index) => {
    // Map internal key to beautiful display badge
    const catInfo = FOOD_CATEGORIES[item.category] || { label: item.category, icon: "ri-restaurant-fill" };
    
    const card = document.createElement("div");
    card.className = "card glass-card food-card";
    card.style.position = "relative"; // For absolute positioning of delete button
    
    const googleMapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address || item.name)}`;
    const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address || item.name)}`;

    // Need to find original index of the item for correct deletion when filtered
    const originalList = city === "otaru" ? travelData.otaruFoodList : travelData.sapporoFoodList;
    const originalIndex = originalList.indexOf(item);

    card.innerHTML = `
      ${isEditor ? `
        <button class="btn-card-action btn-edit" style="position: absolute; top: 18px; right: 48px; font-size: 1.25rem;" onclick="openFoodEditModal('${city}', ${originalIndex})" title="맛집 수정">
          <i class="ri-edit-box-line"></i>
        </button>
        <button class="btn-card-action btn-delete" style="position: absolute; top: 18px; right: 18px; font-size: 1.25rem;" onclick="deleteFoodItem('${city}', ${originalIndex})" title="맛집 삭제">
          <i class="ri-delete-bin-line"></i>
        </button>
      ` : ""}
      <div class="food-card-header" style="${isEditor ? "padding-right: 72px;" : ""}">
        <div class="food-title-group">
          <h3 class="food-name">${escapeHTML(item.name)}</h3>
          <div class="food-meta">
            <span class="badge badge-meal"><i class="${catInfo.icon}"></i> ${escapeHTML(catInfo.label)}</span>
            <span class="food-rating"><i class="ri-star-fill"></i> ${item.rating}</span>
            ${item.openTime ? `<span class="food-rating" style="background: rgba(255,255,255,0.08); color: var(--text-sub); display: inline-flex; align-items: center; gap: 4px;"><i class="ri-time-line"></i> ${item.openTime} ~ ${item.closeTime}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="food-recommend-menu">
        <i class="ri-thumb-up-fill" style="color: var(--success)"></i>
        <span>추천메뉴: <strong>${escapeHTML(item.menu)}</strong></span>
      </div>
      <p class="food-tips">${escapeHTML(item.tips)}</p>
      <div class="food-card-footer">
        <a href="${googleMapSearchUrl}" target="_blank" class="btn-map-action btn-map-view" style="flex: 1; text-align: center; justify-content: center;" title="구글맵에서 장소 주소 검색"><i class="ri-map-pin-2-fill"></i> 지도 보기</a>
        <a href="${directionUrl}" target="_blank" class="btn-map-action btn-map-dir" style="flex: 1; text-align: center; justify-content: center;" title="내 위치에서 길찾기"><i class="ri-navigation-fill"></i> 길찾기</a>
      </div>
    `;
    gridEl.appendChild(card);
  });
}

// Food list CRUD actions (Delete & Add Modal)
window.deleteFoodItem = function(city, originalIndex) {
  if (confirm("정말 이 맛집을 리스트에서 삭제하시겠습니까?")) {
    const list = city === "otaru" ? travelData.otaruFoodList : travelData.sapporoFoodList;
    list.splice(originalIndex, 1);
    saveToLocalStorage();
    
    // Re-render with the current filter state
    const currentFilter = city === "otaru" ? currentOtaruFilter : currentSapporoFilter;
    renderFoodList(city, currentFilter);
    showToast("맛집이 리스트에서 삭제되었습니다.", "success");
  }
};

window.openFoodModal = function(city) {
  elements.foodModalTitle.innerText = city === "otaru" ? "🍣 오타루 대체 맛집 추가" : "🍺 삿포로 대체 맛집 추가";
  elements.foodCityType.value = city;
  elements.foodEditIndex.value = ""; // Clear edit index
  elements.formFood.reset();
  
  // Smart default rating
  elements.foodRating.value = "4.5";
  
  // Clear time defaults
  elements.foodOpenTime.value = "11:00";
  elements.foodCloseTime.value = "21:00";
  
  elements.modalFood.classList.remove("hidden");
};

window.openFoodEditModal = function(city, originalIndex) {
  const list = city === "otaru" ? travelData.otaruFoodList : travelData.sapporoFoodList;
  const item = list[originalIndex];
  
  elements.foodModalTitle.innerText = city === "otaru" ? "🍣 오타루 대체 맛집 수정" : "🍺 삿포로 대체 맛집 수정";
  elements.foodCityType.value = city;
  elements.foodEditIndex.value = `${city}:${originalIndex}`;
  
  // Fill in inputs
  elements.foodName.value = item.name;
  elements.foodCategory.value = item.category;
  elements.foodRating.value = item.rating;
  elements.foodMenu.value = item.menu;
  elements.foodAddress.value = item.address;
  elements.foodOpenTime.value = item.openTime || "11:00";
  elements.foodCloseTime.value = item.closeTime || "21:00";
  elements.foodTips.value = item.tips || "";
  
  elements.modalFood.classList.remove("hidden");
};

// Helper to get formatted date string for tab
function getDayDateString(dayIndex) {
  const dates = ["06/13 (토)", "06/14 (일)", "06/15 (월)", "06/16 (화)"];
  return dates[parseInt(dayIndex) - 1] || "";
}

// Update Top Dashboard Stats
function updateDashboardStats() {
  let totalCostKRW = 0;
  let totalPlaces = 0;
  const memberCount = parseInt(travelData.memberCount) || 2;

  // Calculate stats from all days
  Object.keys(travelData.days).forEach(dayKey => {
    const items = travelData.days[dayKey] || [];
    totalPlaces += items.length;
    
    items.forEach(item => {
      const totalItemCost = (parseFloat(item.cost) || 0) * memberCount;
      totalCostKRW += getCostInKRW(totalItemCost, item.currency);
    });
  });

  elements.txtTotalBudget.innerText = formatNumber(totalCostKRW) + "원";
  elements.txtTotalPlaces.innerText = `${totalPlaces}곳`;
}

// Convert Cost to KRW based on fixed conversion rate
function getCostInKRW(cost, currency) {
  if (!cost) return 0;
  if (currency === "JPY") {
    return Math.round(cost * CURRENCY_CONVERSION_RATE);
  }
  return cost;
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Render Timeline List for Specific Day
function renderTimeline(dayKey) {
  const items = travelData.days[dayKey] || [];
  elements.timelineList.innerHTML = "";
  
  if (items.length === 0) {
    elements.timelineEmptyState.classList.remove("hidden");
    elements.timelineList.classList.add("hidden");
    return;
  }
  
  elements.timelineEmptyState.classList.add("hidden");
  elements.timelineList.classList.remove("hidden");

  // Sort items by time
  const sortedItems = [...items].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });

  // Keep state updated in case sorting shuffled things
  travelData.days[dayKey] = sortedItems;

  let placeNumber = 0;

  sortedItems.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "timeline-item";
    
    const memberCount = parseInt(travelData.memberCount) || 2;
    const totalCost = (parseFloat(item.cost) || 0) * memberCount;

    const displayCost = item.cost > 0 
      ? (item.currency === "JPY" 
         ? `¥ ${formatNumber(item.cost)} (1인) ➡️ 총 ¥ ${formatNumber(totalCost)} (${memberCount}명)` 
         : `₩ ${formatNumber(item.cost)} (1인) ➡️ 총 ₩ ${formatNumber(totalCost)} (${memberCount}명)`)
      : "무료 / 예산 없음";
      
    const krwCostSub = (item.cost > 0 && item.currency === "JPY")
      ? `<span class="cost-converted">(총 약 ${formatNumber(getCostInKRW(totalCost, item.currency))}원)</span>`
      : "";

    const categoryLabels = {
      flight: "✈️ 항공",
      meal: "🍴 맛집",
      cafe: "☕ 카페",
      sightseeing: "🏔️ 명소",
      shopping: "🛍️ 쇼핑",
      lodging: "🏨 숙소",
      transport: "🚌 교통",
      etc: "✨ 기타"
    };

    // Calculate Triple-style sequential badge (Excluding flight & transport)
    let badgeHtml = "";
    if (item.category === "flight") {
      badgeHtml = `<span class="timeline-badge timeline-badge-icon" title="항공편">✈️</span>`;
    } else if (item.category === "transport") {
      badgeHtml = `<span class="timeline-badge timeline-badge-icon" title="교통이동">🚌</span>`;
    } else {
      placeNumber++;
      badgeHtml = `<span class="timeline-badge timeline-badge-number" title="방문 순서">${placeNumber}</span>`;
    }

    // Generate Google Maps Links
    const mapQuery = item.mapAddress || item.name;
    const googleMapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
    const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`;
    const directionBtnHtml = `<a href="${directionUrl}" target="_blank" class="btn-map-action btn-map-dir" title="현재 내 위치에서 구글맵 길찾기 시작"><i class="ri-navigation-fill"></i> 내 위치에서 길찾기</a>`;

    itemEl.innerHTML = `
      <div class="timeline-marker"></div>
      <div class="card glass-card timeline-card ${item.completed ? "completed" : ""}">
        <div class="card-top">
          <div class="place-time-title">
            <span class="place-time"><i class="ri-time-line"></i> ${item.time}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button class="btn-complete-toggle ${item.completed ? "completed" : ""}" onclick="toggleTimelineItemCompleted('${dayKey}', ${index})" title="${item.completed ? "미완료로 표시" : "완료로 표시"}">
                <i class="${item.completed ? "ri-checkbox-circle-fill" : "ri-checkbox-blank-circle-line"}"></i>
              </button>
              ${badgeHtml}
              <h3 class="place-title">${escapeHTML(item.name)}</h3>
            </div>
            <span class="badge badge-${item.category}">${categoryLabels[item.category] || "기타"}</span>
          </div>
          ${isEditor ? `
          <div class="card-actions">
            <button class="btn-card-action btn-edit" onclick="openEditModal('${dayKey}', ${index})" title="일정 수정"><i class="ri-edit-box-line"></i></button>
            <button class="btn-card-action btn-delete" onclick="deleteTimelineItem('${dayKey}', ${index})" title="일정 삭제"><i class="ri-delete-bin-6-line"></i></button>
          </div>
          ` : ""}
        </div>
        ${item.memo ? `<p class="place-memo">${escapeHTML(item.memo)}</p>` : ""}
        
        <!-- Google Maps Quick Actions -->
        <div class="card-map-actions">
          <a href="${googleMapSearchUrl}" target="_blank" class="btn-map-action btn-map-view" title="구글맵에서 장소 주소 검색"><i class="ri-map-pin-2-fill"></i> 지도 보기</a>
          ${directionBtnHtml}
        </div>

        <div class="card-bottom">
          <span class="place-cost">
            <i class="ri-money-dollar-circle-line"></i>
            <span class="currency-${item.currency.toLowerCase()}">${displayCost}</span>
            ${krwCostSub}
          </span>
        </div>
      </div>
    `;
    elements.timelineList.appendChild(itemEl);
  });

  // Update Triple-style In-App Live Map dynamically
  updateInAppMap(dayKey);
}

// Render Settlement Tab
function renderSettlementTab() {
  let totalCostKRW = 0;
  const catCosts = { flight: 0, meal: 0, cafe: 0, sightseeing: 0, shopping: 0, lodging: 0, transport: 0, etc: 0 };
  const memberCount = parseInt(elements.inputMemberCount.value) || 1;
  
  // Calculate total costs & category breakdowns
  Object.keys(travelData.days).forEach(dayKey => {
    const items = travelData.days[dayKey] || [];
    items.forEach(item => {
      const totalItemCost = (parseFloat(item.cost) || 0) * memberCount;
      const krwVal = getCostInKRW(totalItemCost, item.currency);
      totalCostKRW += krwVal;
      if (catCosts.hasOwnProperty(item.category)) {
        catCosts[item.category] += krwVal;
      } else {
        catCosts.etc += krwVal;
      }
    });
  });

  // Display Total
  elements.settleTotalBudget.innerText = formatNumber(totalCostKRW) + "원";

  // Calculate per member
  const costPerMember = Math.round(totalCostKRW / memberCount);
  elements.settlePerMember.innerText = formatNumber(costPerMember) + "원";

  // Render category breakdown progress bars
  elements.categoryBreakdownList.innerHTML = "";
  const catNames = {
    flight: "✈️ 항공/비행기",
    meal: "🍴 식당/맛집",
    cafe: "☕ 카페/디저트",
    sightseeing: "🏔️ 관광지/명소",
    shopping: "🛍️ 쇼핑/면세",
    lodging: "🏨 숙박시설",
    transport: "🚌 교통비용",
    etc: "✨ 기타 잡비"
  };

  const catColors = {
    flight: "var(--cat-flight)",
    meal: "var(--cat-meal)",
    cafe: "var(--cat-cafe)",
    sightseeing: "var(--cat-sightseeing)",
    shopping: "var(--cat-shopping)",
    lodging: "var(--cat-lodging)",
    transport: "var(--cat-transport)",
    etc: "var(--cat-etc)"
  };

  Object.keys(catCosts).forEach(cat => {
    const amount = catCosts[cat];
    const percentage = totalCostKRW > 0 ? Math.round((amount / totalCostKRW) * 100) : 0;
    
    // Only show category if it has expenses, or show at least standard ones
    if (amount > 0 || cat === "flight" || cat === "meal" || cat === "lodging" || cat === "transport") {
      const row = document.createElement("div");
      row.className = "breakdown-row";
      row.innerHTML = `
        <span class="breakdown-cat-name">${catNames[cat] || cat}</span>
        <div class="breakdown-progress-container">
          <div class="breakdown-progress-bar" style="width: ${percentage}%; background-color: ${catColors[cat]}"></div>
        </div>
        <span class="breakdown-value">${formatNumber(amount)}원 (${percentage}%)</span>
      `;
      elements.categoryBreakdownList.appendChild(row);
    }
  });
}

// Render Checklist Tab
function renderChecklistTab() {
  elements.checklistContainer.innerHTML = "";
  const list = travelData.checklist || [];
  
  if (list.length === 0) {
    elements.checklistContainer.innerHTML = `<p class="empty-text" style="color:var(--text-sub); text-align:center; padding: 20px;">체크리스트가 비어있습니다.</p>`;
    return;
  }

  list.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "checklist-item";
    itemEl.innerHTML = `
      <label class="checklist-label">
        <input type="checkbox" class="checklist-checkbox" ${item.checked ? "checked" : ""} ${isEditor ? "" : "disabled"} onchange="toggleChecklistItem(${index})">
        <span class="checklist-text">${escapeHTML(item.text)}</span>
      </label>
      ${isEditor ? `<button class="btn-delete-check" onclick="deleteChecklistItem(${index})" title="준비물 삭제"><i class="ri-delete-bin-line"></i></button>` : ""}
    `;
    elements.checklistContainer.appendChild(itemEl);
  });
}

// ==========================================
// 6. INTERACTIVE ACTIONS (CRUD)
// ==========================================

// 1) Timeline CRUD
window.deleteTimelineItem = function(dayKey, index) {
  if (confirm("정말 이 장소를 일정에서 삭제하시겠습니까?")) {
    travelData.days[dayKey].splice(index, 1);
    saveToLocalStorage();
    renderApp();
    showToast("일정이 성공적으로 삭제되었습니다.", "success");
  }
};

window.toggleTimelineItemCompleted = function(dayKey, index) {
  const currentVal = travelData.days[dayKey][index].completed || false;
  travelData.days[dayKey][index].completed = !currentVal;
  saveToLocalStorage();
  renderApp();
  
  if (!currentVal) {
    showToast("🎉 일정을 완료했습니다! 정말 수고하셨습니다!", "success");
  } else {
    showToast("일정 완료 상태를 취소했습니다.", "info");
  }
};

window.openEditModal = function(dayKey, index) {
  const item = travelData.days[dayKey][index];
  
  elements.modalTitle.innerText = "방문 장소 수정";
  elements.editItemIndex.value = `${dayKey}:${index}`;
  elements.placeName.value = item.name;
  elements.placeTime.value = item.time;
  elements.placeCategory.value = item.category;
  elements.placeCost.value = item.cost || "";
  elements.placeCurrency.value = item.currency || "KRW";
  elements.placeMap.value = item.mapAddress || "";
  elements.placeMemo.value = item.memo || "";
  
  updateCostConversionLabel();
  elements.modalPlace.classList.remove("hidden");
};

// 2) Checklist CRUD
window.toggleChecklistItem = function(index) {
  travelData.checklist[index].checked = !travelData.checklist[index].checked;
  saveToLocalStorage();
  // Do not full render to avoid losing scroll or animation, just update stats & local storage
  updateDashboardStats();
};

window.deleteChecklistItem = function(index) {
  travelData.checklist.splice(index, 1);
  saveToLocalStorage();
  renderChecklistTab();
  showToast("준비물이 삭제되었습니다.", "info");
};

// ==========================================
// 7. EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Passcode Unlock Event
  if (elements.btnUnlockEditor) {
    elements.btnUnlockEditor.addEventListener("click", () => {
      const pass = prompt("🔑 편집 권한을 획득하려면 관리자 비밀번호를 입력하세요:");
      if (pass === "aa178641") {
        isEditor = true;
        
        // Save this room to owned list for permanent edit access
        let ownedRooms = [];
        try {
          ownedRooms = JSON.parse(localStorage.getItem("sapo_owned_rooms") || "[]");
          if (!ownedRooms.includes(roomId)) {
            ownedRooms.push(roomId);
            localStorage.setItem("sapo_owned_rooms", JSON.stringify(ownedRooms));
          }
        } catch (e) {}
        
        applyEditorRights();
        renderApp();
        showToast("🔓 편집 권한이 승인되었습니다! 일정을 마음껏 수정해보세요.", "success");
      } else if (pass !== null) {
        showToast("❌ 비밀번호가 올바르지 않습니다.", "error");
      }
    });
  }

  // Tab Switching
  elements.tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      elements.tabButtons.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      
      activeTab = btn.getAttribute("data-tab");
      renderApp();
    });
  });

  // Open Modal (Add Place)
  const handleOpenAddModal = () => {
    elements.modalTitle.innerText = "방문 장소 추가";
    elements.editItemIndex.value = "";
    elements.formPlace.reset();
    
    // Set smart defaults
    elements.placeTime.value = "12:00";
    elements.placeCategory.value = "flight";
    elements.placeCurrency.value = "JPY"; // Sapporo uses JPY mostly!
    
    updateCostConversionLabel();
    elements.modalPlace.classList.remove("hidden");
  };

  elements.btnAddPlace.addEventListener("click", handleOpenAddModal);
  elements.btnEmptyAdd.addEventListener("click", handleOpenAddModal);

  // Close Modal
  const closeModal = () => {
    elements.modalPlace.classList.add("hidden");
  };
  elements.btnModalCancel.addEventListener("click", closeModal);
  elements.btnModalClose.addEventListener("click", closeModal);
  
  // Submit Form (Save Place)
  elements.formPlace.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = elements.placeName.value.trim();
    const time = elements.placeTime.value;
    const category = elements.placeCategory.value;
    const cost = parseFloat(elements.placeCost.value) || 0;
    const currency = elements.placeCurrency.value;
    const mapAddress = elements.placeMap.value.trim();
    const memo = elements.placeMemo.value.trim();
    
    // 백그라운드 위경도 즉시 동기화
    showToast("🔄 지도의 정확한 위치를 동기화하고 있습니다...", "info");
    let lat = null;
    let lng = null;
    
    if (category !== 'flight' && category !== 'transport') {
      try {
        const coords = await getCoordinates(name, mapAddress);
        if (coords) {
          lat = coords[0];
          lng = coords[1];
        }
      } catch (err) {
        console.warn("Failed to get coordinates during save", err);
      }
    }
    
    const itemData = { name, time, category, cost, currency, mapAddress, memo, lat, lng };
    const editVal = elements.editItemIndex.value;
    
    if (editVal) {
      // EDIT MODE
      const [dayKey, index] = editVal.split(":");
      travelData.days[dayKey][parseInt(index)] = itemData;
      showToast("일정이 성공적으로 수정되었습니다.", "success");
    } else {
      // ADD MODE
      if (!travelData.days[activeTab]) {
        travelData.days[activeTab] = [];
      }
      travelData.days[activeTab].push(itemData);
      showToast("새로운 일정이 추가되었습니다.", "success");
    }
    
    saveToLocalStorage();
    closeModal();
    renderApp();
  });

  // Cost Input Conversion Hint Trigger
  elements.placeCost.addEventListener("input", updateCostConversionLabel);
  elements.placeCurrency.addEventListener("change", updateCostConversionLabel);

  // Share button
  elements.btnShare.addEventListener("click", handleShareLink);

  // Settlement Member Counter
  elements.btnMemberDec.addEventListener("click", () => {
    let val = parseInt(elements.inputMemberCount.value) || 1;
    if (val > 1) {
      elements.inputMemberCount.value = val - 1;
      travelData.memberCount = val - 1;
      saveToLocalStorage();
      renderSettlementTab();
    }
  });

  elements.btnMemberInc.addEventListener("click", () => {
    let val = parseInt(elements.inputMemberCount.value) || 1;
    elements.inputMemberCount.value = val + 1;
    travelData.memberCount = val + 1;
    saveToLocalStorage();
    renderSettlementTab();
  });

  elements.inputMemberCount.addEventListener("change", () => {
    let val = parseInt(elements.inputMemberCount.value) || 1;
    if (val < 1) val = 1;
    elements.inputMemberCount.value = val;
    travelData.memberCount = val;
    saveToLocalStorage();
    renderSettlementTab();
  });

  // Checklist Add Form
  elements.formAddChecklist.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = elements.inputChecklistText.value.trim();
    if (!text) return;

    if (!travelData.checklist) {
      travelData.checklist = [];
    }

    const newId = travelData.checklist.length > 0 
      ? Math.max(...travelData.checklist.map(item => item.id)) + 1 
      : 1;

    travelData.checklist.push({ id: newId, text, checked: false });
    saveToLocalStorage();
    elements.inputChecklistText.value = "";
    renderChecklistTab();
    showToast("준비물이 추가되었습니다.", "success");
  });

  // Reset Checklist
  elements.btnResetChecklist.addEventListener("click", () => {
    if (confirm("체크리스트를 처음 권장 품목들로 초기화하시겠습니까?")) {
      travelData.checklist = JSON.parse(JSON.stringify(SAPPORO_TEMPLATE.checklist));
      saveToLocalStorage();
      renderChecklistTab();
      showToast("체크리스트가 초기화되었습니다.", "info");
    }
  });

  // Food Add Modal Cancel & Close
  const closeFoodModal = () => {
    elements.modalFood.classList.add("hidden");
  };
  elements.btnFoodModalCancel.addEventListener("click", closeFoodModal);
  elements.btnFoodModalClose.addEventListener("click", closeFoodModal);

  // Food Add Form Submit
  elements.formFood.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = elements.foodCityType.value;
    const name = elements.foodName.value.trim();
    const category = elements.foodCategory.value.trim();
    const rating = elements.foodRating.value;
    const menu = elements.foodMenu.value.trim();
    const address = elements.foodAddress.value.trim();
    const openTime = elements.foodOpenTime.value;
    const closeTime = elements.foodCloseTime.value;
    const tips = elements.foodTips.value.trim();

    const newFoodItem = { name, category, rating, menu, address, openTime, closeTime, tips };
    const editVal = elements.foodEditIndex.value;

    if (editVal) {
      // EDIT MODE
      const [editCity, indexStr] = editVal.split(":");
      const index = parseInt(indexStr);
      if (editCity === "otaru") {
        travelData.otaruFoodList[index] = newFoodItem;
      } else {
        travelData.sapporoFoodList[index] = newFoodItem;
      }
      showToast("대체 맛집 정보가 성공적으로 수정되었습니다!", "success");
    } else {
      // ADD MODE
      if (city === "otaru") {
        travelData.otaruFoodList.push(newFoodItem);
      } else {
        travelData.sapporoFoodList.push(newFoodItem);
      }
      showToast("새로운 대체 맛집이 리스트에 추가되었습니다!", "success");
    }

    saveToLocalStorage();
    closeFoodModal();
    
    // Re-render with the current filter state
    const currentFilter = city === "otaru" ? currentOtaruFilter : currentSapporoFilter;
    renderFoodList(city, currentFilter);
  });

  // ==========================================
  // Inline Google Maps Search for foodAddress
  // ==========================================
  const btnFoodAddressMap = document.getElementById("btnFoodAddressMap");
  if (btnFoodAddressMap) {
    btnFoodAddressMap.addEventListener("click", () => openGoogleMapsForSearch("foodAddress"));
  }

  // ==========================================
  // Inline Google Maps Search for placeMap
  // ==========================================
  const btnPlaceMapMap = document.getElementById("btnPlaceMapMap");
  if (btnPlaceMapMap) {
    btnPlaceMapMap.addEventListener("click", () => openGoogleMapsForSearch("placeMap"));
  }
}

// Update Cost Label (JPY to KRW)
function updateCostConversionLabel() {
  const cost = parseFloat(elements.placeCost.value) || 0;
  const currency = elements.placeCurrency.value;
  const memberCount = parseInt(travelData.memberCount) || 2;
  const totalCost = cost * memberCount;
  
  if (currency === "JPY") {
    const krwPerPerson = Math.round(cost * CURRENCY_CONVERSION_RATE);
    const krwTotal = Math.round(totalCost * CURRENCY_CONVERSION_RATE);
    elements.lblCostConversion.innerText = `1인당 ₩ ${formatNumber(krwPerPerson)}원 (총 ${memberCount}명 약 ₩ ${formatNumber(krwTotal)}원, 100엔 = 900원 대략적 기준)`;
    elements.lblCostConversion.style.visibility = "visible";
  } else {
    elements.lblCostConversion.innerText = `총 ${memberCount}명 ₩ ${formatNumber(totalCost)}원`;
    elements.lblCostConversion.style.visibility = "visible";
  }
}

// ==========================================
// 8. SHARE LINK GENERATION (Ultra-compact Compression)
// ==========================================
async function handleShareLink() {
  try {
    showToast("🔄 실시간 공유 링크를 생성하고 있습니다...", "info");

    // Build the simple shareable URL based on roomId
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    
    // Rewrite address bar to represent exact room state
    window.history.replaceState({}, document.title, shareUrl);

    let finalCopyUrl = shareUrl;

    try {
      // Direct call to TinyURL API for immediate shortening
      const targetApiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(shareUrl)}`;
      
      const response = await fetch(targetApiUrl);
      if (response.ok) {
        const shortUrlResult = await response.text();
        const cleanedUrl = shortUrlResult.trim();
        if (cleanedUrl && cleanedUrl.startsWith("http")) {
          finalCopyUrl = cleanedUrl;
        }
      }
    } catch (apiError) {
      console.warn("단축 URL 생성 API 호출 실패 (네트워크 이슈). 긴 URL로 대체합니다.", apiError);
    }
    
    // Copy to clipboard
    await navigator.clipboard.writeText(finalCopyUrl);
    
    if (finalCopyUrl.includes("tinyurl.com")) {
      showToast("🔗 실시간 공유 링크(단축형)가 복사되었습니다! 친구들에게 공유하세요.", "success");
    } else {
      showToast("🔗 실시간 공유 링크가 복사되었습니다!", "success");
    }
    
  } catch (error) {
    console.error("공유 링크 생성 실패:", error);
    showToast("링크 생성에 실패했습니다.", "error");
  }
}

// ==========================================
// 9. TOAST NOTIFICATION UTILITY
// ==========================================
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: "ri-checkbox-circle-fill",
    error: "ri-error-warning-fill",
    info: "ri-information-fill"
  };
  
  toast.innerHTML = `
    <i class="${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `;
  
  elements.toastContainer.appendChild(toast);
  
  // Remove toast after animation finishes
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ==========================================
// 10. UTILITIES
// ==========================================
function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// 11. CLIPBOARD COPY & PASTE SYSTEM
// ==========================================

// Open Google Maps in a new tab for searching address
function openGoogleMapsForSearch(inputId) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;
  
  const text = inputEl.value.trim();
  let targetUrl = "https://www.google.com";
  
  if (text) {
    targetUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
    showToast(`🔍 '${text}' 검색어로 구글 지도를 엽니다...`, "info");
  } else {
    // Default to Sapporo center
    targetUrl = "https://www.google.com/maps/search/?api=1&query=Sapporo";
    showToast("🔍 구글 지도를 엽니다. 장소를 검색해 주소를 복사해 오세요!", "info");
  }
  
  window.open(targetUrl, "_blank");
}

// Generate complete routing path URL for Google Maps (Slash-separated waypoints for 100% pin visibility)
function generateDayRouteUrl(dayKey) {
  const items = travelData.days[dayKey] || [];
  if (items.length < 2) return null;
  
  // Sort by time first to ensure sequential pathing
  const sortedItems = [...items].sort((a, b) => a.time.localeCompare(b.time));
  const locations = sortedItems.map(item => item.mapAddress || item.name);
  
  // Clean empty or invalid strings to prevent map breaks
  const validLocations = locations.filter(loc => loc && loc.trim() !== "");
  if (validLocations.length < 2) return null;
  
  // Build traditional google maps slash directory format
  const path = validLocations.map(loc => encodeURIComponent(loc.trim())).join("/");
  return `https://www.google.com/maps/dir/${path}`;
}

// ==========================================
// 12. IN-APP LIVE MAP CORE ENGINE (TRIPLE STYLE)
// ==========================================

async function updateInAppMap(dayKey) {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  const items = travelData.days[dayKey] || [];

  // 1. Initialize map if not already done
  if (!leafletMap) {
    try {
      leafletMap = L.map('map', {
        zoomControl: false,
        attributionControl: false
      }).setView([43.0686, 141.3508], 10);
      
      // Load premium CartoDB Voyager pastel maps (Beautiful light gray styling)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(leafletMap);
      
      // Auto-invalidation on resize for flawless responsive rendering
      const resizeObserver = new ResizeObserver(() => {
        if (leafletMap) leafletMap.invalidateSize();
      });
      resizeObserver.observe(mapEl);
      
    } catch (e) {
      console.error("Map initialization failed: ", e);
      return;
    }
  }

  // 2. Clear all previous markers and polylines safely
  leafletMarkers.forEach(m => leafletMap.removeLayer(m));
  leafletMarkers = [];
  
  if (leafletPolyline) {
    leafletMap.removeLayer(leafletPolyline);
    leafletPolyline = null;
  }

  // Filter out flight & transport items from map display to avoid cross-sea errors
  const mappableItems = items.filter(item => item.category !== 'flight' && item.category !== 'transport');

  if (mappableItems.length === 0) {
    // Zoom back to general Sapporo view if no mappable items
    leafletMap.setView([43.0686, 141.3508], 10);
    return;
  }

  // 3. Resolve all coordinates asynchronously in parallel (Uses stored lat/lng first to bypass API completely!)
  const coordsPromises = mappableItems.map(async (item) => {
    if (item.lat && item.lng) {
      return [item.lat, item.lng];
    }
    return await getCoordinates(item.name, item.mapAddress);
  });
  const resolvedCoords = await Promise.all(coordsPromises);

  const latlngs = [];
  const validItems = [];

  resolvedCoords.forEach((coords, idx) => {
    let finalCoords = coords;
    
    // Fallback Safeguard: If geocoding failed, generate a sequential offset near Sapporo center so it ALWAYS displays!
    if (!finalCoords) {
      finalCoords = [43.0620 + (idx * 0.006), 141.3540 + (idx * 0.006)];
    }
    
    latlngs.push(finalCoords);
    validItems.push({
      item: mappableItems[idx],
      coords: finalCoords,
      index: idx
    });
  });

  // 4. Draw Purple Number Pins (Triple style ①, ②, ③)
  validItems.forEach((vi, pinIdx) => {
    const customIcon = L.divIcon({
      className: 'custom-number-marker',
      html: `${pinIdx + 1}`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const popupHtml = `
      <div style="font-family: var(--font-family); text-align: left; padding: 2px;">
        <span style="font-weight:800; color:var(--secondary); font-size:0.9rem;">${pinIdx + 1}. ${escapeHTML(vi.item.name)}</span><br>
        <span style="color:var(--text-sub); font-size:0.75rem;"><i class="ri-time-line"></i> ${vi.item.time}</span>
      </div>
    `;

    const marker = L.marker(vi.coords, { icon: customIcon })
      .bindPopup(popupHtml, { closeButton: false, offset: [0, -5] })
      .addTo(leafletMap);
      
    leafletMarkers.push(marker);
  });

  // 5. Draw Beautiful Purple Dashed Connection Line
  if (latlngs.length >= 2) {
    leafletPolyline = L.polyline(latlngs, {
      color: '#6c5ce7',
      dashArray: '6, 8',
      weight: 3,
      opacity: 0.8
    }).addTo(leafletMap);

    // 6. Smoothly auto-fit bounds so all pins are visible
    try {
      leafletMap.fitBounds(leafletPolyline.getBounds(), {
        padding: [40, 40],
        maxZoom: 13,
        animate: true,
        duration: 0.6
      });
    } catch (err) {}
  } else if (latlngs.length === 1) {
    // Focus single pin smoothly
    leafletMap.setView(latlngs[0], 12, { animate: true, duration: 0.6 });
  } else {
    // Default Sapporo view if no valid geocoded coordinates
    leafletMap.setView([43.0686, 141.3508], 10);
  }

  // Ensures Leaflet recalculates and renders flawlessly
  setTimeout(() => {
    if (leafletMap) leafletMap.invalidateSize();
  }, 100);
}



