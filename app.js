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
  ],
  shoppingList: [
    { id: 1, name: "시로이 코이비토 18개입", category: "dessert", qty: 2, cost: 1520, currency: "JPY", memo: "신치토세 공항 면세점 추천", checked: false },
    { id: 2, name: "돈키호테 동전패치", category: "drug", qty: 3, cost: 800, currency: "JPY", memo: "사츠도라 또는 돈키호테 스스키노점", checked: false },
    { id: 3, name: "삿포로 클래식 맥주 6캔", category: "alcohol", qty: 1, cost: 1300, currency: "JPY", memo: "편의점 또는 동네 마트", checked: false }
  ]
};

// ==========================================
// 1-2. PLAN B SPOT LISTS (삿포로 & 오타루 감성 스팟)
// ==========================================
const FOOD_CATEGORIES = {
  spot: { label: "🏞️ 명소 / 관광지", icon: "ri-landscape-line" },
  meat: { label: "🥩 고기 / 육류", icon: "ri-restaurant-line" },
  seafood: { label: "🐟 해산물 / 스시", icon: "ri-goblet-line" },
  noodle: { label: "🍛 면 / 스프카레", icon: "ri-restaurant-2-line" },
  dessert: { label: "🍰 디저트 / 카페", icon: "ri-cup-line" }
};

const SAPPORO_FOOD_LIST = [
  {
    name: "오도리 공원 (Odori Park)",
    category: "spot",
    rating: "4.5",
    menu: "공원 산책 및 구운 옥수수 맛보기 🌽",
    tips: "삿포로 TV타워를 배경으로 완벽한 인생샷을 남길 수 있는 최고 명소입니다! 공원 내 포장마차(토키비 웨건)에서 파는 노릇노릇한 구운 옥수수와 버터 감자는 삿포로 여름의 상징이니 벤치에 앉아 꼭 드셔보세요.",
    address: "Odori Park, Sapporo",
    openTime: "00:00",
    closeTime: "24:00"
  },
  {
    name: "모이와야마 전망대 (Mt. Moiwa Ropeway)",
    category: "spot",
    rating: "4.7",
    menu: "일본 3대 야경 로프웨이 탑승 🚡",
    tips: "해발 531m 정상에서 감상하는 삿포로 시내의 360도 은하수 야경은 압도적입니다. 산 정상의 '사랑의 종'에서 하트 자물쇠를 걸거나 종을 함께 울리며 황홀하고 로맨틱한 삿포로의 밤을 연출해보세요.",
    address: "Mt. Moiwa Ropeway, Sapporo",
    openTime: "10:30",
    closeTime: "22:00"
  },
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
    tips: "라멘 신겐의 1~2시간 이상 웨이팅이 부담스러우시다면 삿포로역 ESTA 공화국이나 스스키노 빌딩 지하의 요시야마 쇼텐으로 가세요! 볶은 참깨의 고소함 and 삿포로 정통 미소의 감칠맛이 폭발하는 국물이 웨이팅 타협 이상의 맛을 선사합니다.",
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
    name: "오타루 운하 (Otaru Canal)",
    category: "spot",
    rating: "4.6",
    menu: "운하 가스등 산책 및 크루즈 탑승 🛥️",
    tips: "일몰 30분 전부터 붉은 노을과 함께 가스등 노란 불빛이 운하를 따라 켜지는 순간이 가장 환상적으로 아름답습니다. 낮보다 밤이 훨씬 아름다운 스팟으로, 옛 벽돌 창고를 개조한 비어홀이나 카페도 함께 둘러보세요.",
    address: "Otaru Canal, Otaru",
    openTime: "00:00",
    closeTime: "24:00"
  },
  {
    name: "오타루 오르골당 (Otaru Music Box Museum)",
    category: "spot",
    rating: "4.6",
    menu: "천상의 오르골 선율 감상 🎶",
    tips: "약 3만여 점에 달하는 아기자기한 오르골이 빛나는 세계 최대 규모의 오르골 전시장입니다. 입구의 상징적인 스팀 증기시계는 15분마다 아름다운 멜로디를 연주하며 증기를 뿜어내니 타이밍에 맞춰 인증샷을 찰칵!",
    address: "Otaru Music Box Museum",
    openTime: "09:00",
    closeTime: "18:00"
  },
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
let activeExtraSubTab = "checklist"; // Sub-tab within extra tab: 'checklist', 'settlement'
let isEditor = true; // Editor permission state
let currentCityFilter = "all"; // 'all', 'sapporo', 'otaru'
let currentSpotsFilter = "all"; // spots filter state (spot, meat, etc.)
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
  "1-chōme-4-20 Ironai, Otaru, Hokkaido": [43.2010, 141.0010],
  
  // Solaria Nishitetsu Hotel Sapporo (5 Chome-1-2)
  "솔라리아 니시테츠 호텔 삿포로": [43.0672, 141.3489],
  "솔라리아 니시테츠 호텔": [43.0672, 141.3489],
  "Solaria Nishitetsu Hotel Sapporo": [43.0672, 141.3489],
  "5 Chome-1番2 Kita 4 Jonishi, Chuo Ward, Sapporo, Hokkaido 060-0004 일본": [43.0672, 141.3489],
  "5 Chome-1番2 Kita 4 Jonishi, Chuo Ward, Sapporo, Hokkaido 060-0004": [43.0672, 141.3489],
  "5 Chome-1番2 Kita 4 Jonishi, Chuo Ward, Sapporo, Hokkaido": [43.0672, 141.3489],
  "5 Chome-1-2 Kita 4 Jonishi, Chuo Ward, Sapporo, Hokkaido 060-0004 일본": [43.0672, 141.3489],
  "5 Chome-1-2 Kita 4 Jonishi, Chuo Ward, Sapporo, Hokkaido 060-0004": [43.0672, 141.3489],
  "5 Chome-1-2 Kita 4 Jonishi, Chuo Ward, Sapporo, Hokkaido": [43.0672, 141.3489]
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

  // 1-2. Sapporo & Hokkaido Grid-style Address Fuzzy Resolver
  const lowerQuery = targetQuery.toLowerCase();
  if (lowerQuery.includes("kita 4") && (lowerQuery.includes("jonishi") || lowerQuery.includes("west"))) {
    const coords = [43.0678, 141.3489];
    coordsCache[query] = coords;
    return coords;
  }
  if (lowerQuery.includes("kita 6") && (lowerQuery.includes("jonishi") || lowerQuery.includes("west"))) {
    const coords = [43.0708, 141.3496];
    coordsCache[query] = coords;
    return coords;
  }
  if (lowerQuery.includes("minami 4") && (lowerQuery.includes("jonishi") || lowerQuery.includes("west"))) {
    const coords = [43.0556, 141.3538];
    coordsCache[query] = coords;
    return coords;
  }
  if (lowerQuery.includes("ironai")) {
    const coords = [43.2010, 141.0010];
    coordsCache[query] = coords;
    return coords;
  }
  if (lowerQuery.includes("motomachi") && lowerQuery.includes("biei")) {
    const coords = [43.5900, 142.4415];
    coordsCache[query] = coords;
    return coords;
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
  
  // Recommended Spots List Elements
  tabContentRecommendedSpots: document.getElementById("tabContentRecommendedSpots"),
  recommendedSpotsFilter: document.getElementById("recommendedSpotsFilter"),
  recommendedSpotsGrid: document.getElementById("recommendedSpotsGrid"),
  spotsTitle: document.getElementById("spotsTitle"),
  btnAddSpot: document.getElementById("btnAddSpot"),
  
  // Shopping List Elements
  tabContentShoppingList: document.getElementById("tabContentShoppingList"),
  modalShopping: document.getElementById("modalShopping"),
  shoppingModalTitle: document.getElementById("shoppingModalTitle"),
  btnShoppingModalClose: document.getElementById("btnShoppingModalClose"),
  formShopping: document.getElementById("formShopping"),
  shoppingEditIndex: document.getElementById("shoppingEditIndex"),
  shoppingName: document.getElementById("shoppingName"),
  shoppingCategory: document.getElementById("shoppingCategory"),
  shoppingQty: document.getElementById("shoppingQty"),
  shoppingCost: document.getElementById("shoppingCost"),
  shoppingCurrency: document.getElementById("shoppingCurrency"),
  shoppingMemo: document.getElementById("shoppingMemo"),
  btnShoppingSubmit: document.getElementById("btnShoppingSubmit"),
  btnShoppingCancel: document.getElementById("btnShoppingCancel"),
  shoppingStatsBadge: document.getElementById("shoppingStatsBadge"),
  shoppingTotalCost: document.getElementById("shoppingTotalCost"),
  shoppingListContainer: document.getElementById("shoppingListContainer"),

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
  foodBreakStart: document.getElementById("foodBreakStart"),
  foodBreakEnd: document.getElementById("foodBreakEnd"),
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
  placeDay: document.getElementById("placeDay"),
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
  if (!travelData.shoppingList) {
    travelData.shoppingList = JSON.parse(JSON.stringify(SAPPORO_TEMPLATE.shoppingList || []));
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
  
  elements.tabContentRecommendedSpots.classList.add("hidden");
  elements.tabContentRecommendedSpots.classList.remove("active");
  
  elements.tabContentShoppingList.classList.add("hidden");
  elements.tabContentShoppingList.classList.remove("active");
  
  // 2. Open and render the selected tab precisely
  if (activeTab === "extra") {
    elements.tabContentExtra.classList.remove("hidden");
    elements.tabContentExtra.classList.add("active");
    setExtraSubTab(activeExtraSubTab);
  } else if (activeTab === "recommendedSpots") {
    elements.tabContentRecommendedSpots.classList.remove("hidden");
    elements.tabContentRecommendedSpots.classList.add("active");
    renderSpotsFilters();
    renderSpotsList();
  } else if (activeTab === "shoppingList") {
    elements.tabContentShoppingList.classList.remove("hidden");
    elements.tabContentShoppingList.classList.add("active");
    renderShoppingList();
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

window.setExtraSubTab = function(subTab) {
  activeExtraSubTab = subTab;
  
  const btnChecklist = document.getElementById("btnSubChecklist");
  const btnSettlement = document.getElementById("btnSubSettlement");
  const wrapperChecklist = document.getElementById("wrapperChecklist");
  const wrapperSettlement = document.getElementById("wrapperSettlement");
  
  if (subTab === "checklist") {
    if (btnChecklist) btnChecklist.classList.add("active");
    if (btnSettlement) btnSettlement.classList.remove("active");
    if (wrapperChecklist) wrapperChecklist.classList.remove("hidden");
    if (wrapperSettlement) wrapperSettlement.classList.add("hidden");
    renderChecklistTab();
  } else {
    if (btnChecklist) btnChecklist.classList.remove("active");
    if (btnSettlement) btnSettlement.classList.add("active");
    if (wrapperChecklist) wrapperChecklist.classList.add("hidden");
    if (wrapperSettlement) wrapperSettlement.classList.remove("hidden");
    renderSettlementTab();
  }
};

// Spot list navigation city filter chip toggle
window.setCityFilter = function(city) {
  currentCityFilter = city;
  
  // Update active class on selector chips
  const container = document.getElementById("citySelectorContainer");
  if (container) {
    const chips = container.querySelectorAll(".filter-chip");
    chips.forEach(chip => chip.classList.remove("active"));
    
    if (city === "all") document.getElementById("btnCityAll").classList.add("active");
    else if (city === "sapporo") document.getElementById("btnCitySapporo").classList.add("active");
    else if (city === "otaru") document.getElementById("btnCityOtaru").classList.add("active");
  }
  
  renderSpotsFilters();
  renderSpotsList();
};

// Render Category Filter Chips for Spots lists
function renderSpotsFilters() {
  const container = elements.recommendedSpotsFilter;
  container.innerHTML = "";
  
  // Filter Options list
  const filters = [
    { value: "all", label: "🌟 전체분류" },
    { value: "spot", label: "🏞️ 명소 / 관광지" },
    { value: "meat", label: "🥩 고기 / 육류" },
    { value: "seafood", label: "🐟 해산물 / 스시" },
    { value: "noodle", label: "🍛 면 / 스프카레" },
    { value: "dessert", label: "🍰 디저트 / 카페" }
  ];
  
  filters.forEach(f => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `filter-chip ${currentSpotsFilter === f.value ? "active" : ""}`;
    chip.innerHTML = f.label;
    
    chip.addEventListener("click", () => {
      currentSpotsFilter = f.value;
      renderSpotsFilters(); // Redraw chips active state
      renderSpotsList(); // Re-render grid with filter
    });
    
    container.appendChild(chip);
  });
}

// Render Spot List dynamically (Otaru & Sapporo merged) with Filter support
function renderSpotsList() {
  const gridEl = elements.recommendedSpotsGrid;
  gridEl.innerHTML = "";
  
  let mergedList = [];
  
  // Extract and tag Sapporo places
  if (travelData.sapporoFoodList) {
    travelData.sapporoFoodList.forEach((item, index) => {
      mergedList.push({ ...item, city: "sapporo", originalIndex: index });
    });
  }
  
  // Extract and tag Otaru places
  if (travelData.otaruFoodList) {
    travelData.otaruFoodList.forEach((item, index) => {
      mergedList.push({ ...item, city: "otaru", originalIndex: index });
    });
  }
  
  // 1. City Filter
  if (currentCityFilter !== "all") {
    mergedList = mergedList.filter(item => item.city === currentCityFilter);
  }
  
  // 2. Category Filter
  if (currentSpotsFilter !== "all") {
    mergedList = mergedList.filter(item => item.category === currentSpotsFilter);
  }
  
  if (mergedList.length === 0) {
    gridEl.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-sub); padding: 40px; font-weight: 600;">등록된 카테고리의 추천 스팟이 없습니다.</p>`;
    return;
  }
  
  mergedList.forEach((item) => {
    const catInfo = FOOD_CATEGORIES[item.category] || { label: item.category, icon: "ri-restaurant-fill" };
    const cityLabel = item.city === "otaru" ? "🌊 오타루" : "🧭 삿포로";
    
    const card = document.createElement("div");
    card.className = "card glass-card food-card";
    card.style.position = "relative"; // For absolute positioning of delete button
    
    const googleMapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address || item.name)}`;
    const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address || item.name)}`;
 
    card.innerHTML = `
      ${isEditor ? `
        <button class="btn-card-action btn-edit" style="position: absolute; top: 18px; right: 48px; font-size: 1.25rem;" onclick="openFoodEditModal('${item.city}', ${item.originalIndex})" title="스팟 수정">
          <i class="ri-edit-box-line"></i>
        </button>
        <button class="btn-card-action btn-delete" style="position: absolute; top: 18px; right: 18px; font-size: 1.25rem;" onclick="deleteFoodItem('${item.city}', ${item.originalIndex})" title="스팟 삭제">
          <i class="ri-delete-bin-line"></i>
        </button>
      ` : ""}
      <div class="food-card-header" style="${isEditor ? "padding-right: 72px;" : ""}">
        <div class="food-title-group">
          <h3 class="food-name">${escapeHTML(item.name)}</h3>
          <div class="food-meta" style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start; margin-top: 6px;">
            <!-- 1층: 스팟 기본 정보 및 도시 태그 -->
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="badge" style="font-size: 0.72rem; padding: 3px 6px; background-color: ${item.city === 'otaru' ? 'var(--secondary)' : 'var(--primary)'}">${cityLabel}</span>
              <span class="badge badge-meal" style="font-size: 0.72rem; padding: 3px 6px;">${escapeHTML(catInfo.label)}</span>
              <span class="food-rating" style="font-size: 0.78rem; display: inline-flex; align-items: center; gap: 2px;"><i class="ri-star-fill"></i> ${item.rating}</span>
            </div>
            <!-- 2층: 영업 시간 & 브레이크 타임 세트 -->
            ${(item.openTime || (item.breakStart && item.breakEnd)) ? `
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px;">
              ${item.openTime ? `<span class="food-rating" style="background: rgba(255,255,255,0.08); color: var(--text-sub); display: inline-flex; align-items: center; gap: 4px; padding: 3px 6px; border-radius: 6px; font-size: 0.75rem;" title="영업 시간"><i class="ri-time-line"></i> ${item.openTime} ~ ${item.closeTime}</span>` : ""}
              ${item.breakStart && item.breakEnd ? `<span class="food-rating" style="background: rgba(255,118,117,0.1); color: var(--danger); display: inline-flex; align-items: center; gap: 4px; padding: 3px 6px; border-radius: 6px; font-size: 0.75rem;" title="브레이크 타임"><i class="ri-pause-circle-line"></i> 브레이크: ${item.breakStart} ~ ${item.breakEnd}</span>` : ""}
            </div>
            ` : ""}
          </div>
        </div>
      </div>
      <div class="food-recommend-menu">
        <i class="ri-thumb-up-fill" style="color: var(--success)"></i>
        <span>추천메뉴 / 즐길거리: <strong>${escapeHTML(item.menu)}</strong></span>
      </div>
      <p class="food-tips">${escapeHTML(item.tips)}</p>
      <div class="food-card-footer" style="flex-wrap: wrap;">
        <a href="${googleMapSearchUrl}" target="_blank" class="btn-map-action btn-map-view" style="flex: 1; text-align: center; justify-content: center; min-width: 80px;" title="구글맵에서 장소 주소 검색"><i class="ri-map-pin-2-fill"></i> 지도</a>
        <a href="${directionUrl}" target="_blank" class="btn-map-action btn-map-dir" style="flex: 1; text-align: center; justify-content: center; min-width: 80px;" title="내 위치에서 길찾기"><i class="ri-navigation-fill"></i> 길찾기</a>
        ${isEditor ? `
          <button type="button" class="btn-map-action btn-map-dir" style="flex: 1.2; text-align: center; justify-content: center; min-width: 100px; background: rgba(46, 204, 113, 0.08); color: var(--success); border-color: rgba(46, 204, 113, 0.15);" onclick="addSpotToTimeline('${item.city}', ${item.originalIndex})" title="이 장소를 내 여행 일정에 추가"><i class="ri-calendar-todo-line"></i> 일정 추가</button>
        ` : ""}
      </div>
    `;
    gridEl.appendChild(card);
  });
}
 
// Spot list CRUD actions (Delete & Add Modal)
window.deleteFoodItem = function(city, originalIndex) {
  if (confirm("정말 이 추천 스팟을 리스트에서 삭제하시겠습니까?")) {
    const list = city === "otaru" ? travelData.otaruFoodList : travelData.sapporoFoodList;
    list.splice(originalIndex, 1);
    saveToLocalStorage();
    
    renderSpotsList();
    showToast("추천 스팟이 리스트에서 삭제되었습니다.", "success");
  }
};
 
window.openFoodModal = function(city) {
  let targetCity = city;
  if (city === 'current') {
    targetCity = currentCityFilter === 'all' ? 'sapporo' : currentCityFilter;
  }
  
  elements.foodModalTitle.innerText = targetCity === "otaru" ? "🗺️ 오타루 추천 스팟 추가" : "🧭 삿포로 추천 스팟 추가";
  elements.foodCityType.value = targetCity;
  elements.foodEditIndex.value = ""; // Clear edit index
  elements.formFood.reset();
  
  // Smart default rating
  elements.foodRating.value = "4.5";
  
  // Clear time defaults
  elements.foodOpenTime.value = "11:00";
  elements.foodCloseTime.value = "21:00";
  elements.foodBreakStart.value = "";
  elements.foodBreakEnd.value = "";
  
  elements.modalFood.classList.remove("hidden");
};
 
window.openFoodEditModal = function(city, originalIndex) {
  const list = city === "otaru" ? travelData.otaruFoodList : travelData.sapporoFoodList;
  const item = list[originalIndex];
  
  elements.foodModalTitle.innerText = city === "otaru" ? "🗺️ 오타루 추천 스팟 수정" : "🧭 삿포로 추천 스팟 수정";
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
  elements.foodBreakStart.value = item.breakStart || "";
  elements.foodBreakEnd.value = item.breakEnd || "";
  elements.foodTips.value = item.tips || "";
  
  elements.modalFood.classList.remove("hidden");
};

// Render Shopping List Tab
function renderShoppingList() {
  const container = elements.shoppingListContainer;
  container.innerHTML = "";
  
  const list = travelData.shoppingList || [];
  
  // Calculate stats
  let totalCostKRW = 0;
  let checkedCount = 0;
  
  list.forEach(item => {
    if (item.checked) {
      checkedCount++;
      const itemTotal = (parseFloat(item.cost) || 0) * (parseInt(item.qty) || 1);
      totalCostKRW += getCostInKRW(itemTotal, item.currency);
    }
  });
  
  elements.shoppingStatsBadge.innerText = `${checkedCount} / ${list.length} 구매`;
  elements.shoppingTotalCost.innerText = formatNumber(totalCostKRW) + "원";
  
  if (list.length === 0) {
    container.innerHTML = `<p class="empty-text" style="color:var(--text-sub); text-align:center; padding: 40px; font-weight:600;">쇼핑 리스트가 비어있습니다.</p>`;
    return;
  }
  
  const categoryBadges = {
    dessert: "🍰 디저트/과자",
    drug: "💊 의약품/화장품",
    alcohol: "🍶 주류 (맥주/위스키)",
    souvenir: "🧸 기념품/소품",
    etc: "✨ 기타"
  };
  
  const categoryColors = {
    dessert: "var(--cat-cafe)",
    drug: "var(--cat-meal)",
    alcohol: "var(--cat-lodging)",
    souvenir: "var(--cat-flight)",
    etc: "var(--cat-etc)"
  };
  
  list.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = `shopping-item-card ${item.checked ? "checked" : ""}`;
    
    const totalCost = (parseFloat(item.cost) || 0) * (parseInt(item.qty) || 1);
    
    const displayCostPerUnit = item.cost > 0
      ? (item.currency === "JPY"
         ? `¥ ${formatNumber(item.cost)} x ${item.qty}개`
         : `₩ ${formatNumber(item.cost)} x ${item.qty}개`)
      : "가격 미정 / 미기입";
      
    const displayCostTotal = item.cost > 0
      ? (item.currency === "JPY"
         ? `총 ¥ ${formatNumber(totalCost)}`
         : `총 ₩ ${formatNumber(totalCost)}`)
      : "";
      
    const krwSub = (item.cost > 0 && item.currency === "JPY")
      ? `<span class="cost-converted" style="font-size: 0.75rem; color: var(--text-sub); margin-left: 2px;">(약 ${formatNumber(getCostInKRW(totalCost, "JPY"))}원)</span>`
      : "";
      
    itemEl.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 10px; width: 100%;">
        <input type="checkbox" class="checklist-checkbox" style="margin-top: 4px;" ${item.checked ? "checked" : ""} ${isEditor ? "" : "disabled"} onchange="toggleShoppingItem(${index})">
        <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
          <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
            <span class="badge" style="font-size: 0.68rem; padding: 2px 6px; background-color: ${categoryColors[item.category] || 'var(--cat-etc)'}; color: white; display: inline-block;">${categoryBadges[item.category] || "기타"}</span>
            <span class="shopping-item-name" style="font-weight: 700; font-size: 0.98rem; ${item.checked ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHTML(item.name)}</span>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <div style="font-size: 0.82rem; font-weight: 600; color: var(--text-sub); display: flex; align-items: center; gap: 4px;">
              <i class="ri-price-tag-3-line"></i>
              <span>${displayCostPerUnit}</span>
            </div>
            ${item.cost > 0 ? `
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--success); display: flex; align-items: center; gap: 4px; padding-left: 14px;">
              <i class="ri-corner-down-right-line" style="opacity: 0.6;"></i>
              <span>${displayCostTotal} ${krwSub}</span>
            </div>
            ` : ""}
          </div>
          
          ${item.memo ? `<div class="shopping-item-memo" style="font-size: 0.78rem; color: var(--text-sub); background: rgba(0,0,0,0.02); padding: 4px 8px; border-radius: 6px; border-left: 2px solid var(--secondary); margin-top: 2px; white-space: pre-line;">${escapeHTML(item.memo)}</div>` : ""}
        </div>
        
        ${isEditor ? `
        <div class="shopping-item-actions" style="display: flex; gap: 2px; opacity: 0.4; transition: opacity 0.2s;">
          <button class="btn-card-action btn-edit" onclick="startEditShoppingItem(${index})" title="수정" style="padding: 2px; font-size: 1.05rem;"><i class="ri-edit-line"></i></button>
          <button class="btn-card-action btn-delete" onclick="deleteShoppingItem(${index})" title="삭제" style="padding: 2px; font-size: 1.05rem;"><i class="ri-delete-bin-line"></i></button>
        </div>
        ` : ""}
      </div>
    `;
    
    // Add hover behavior for action buttons in JS
    if (isEditor) {
      itemEl.addEventListener("mouseenter", () => {
        const actions = itemEl.querySelector(".shopping-item-actions");
        if (actions) actions.style.opacity = "1";
      });
      itemEl.addEventListener("mouseleave", () => {
        const actions = itemEl.querySelector(".shopping-item-actions");
        if (actions) actions.style.opacity = "0.4";
      });
    }

    container.appendChild(itemEl);
  });
}

window.toggleShoppingItem = function(index) {
  travelData.shoppingList[index].checked = !travelData.shoppingList[index].checked;
  saveToLocalStorage();
  renderShoppingList();
};

window.deleteShoppingItem = function(index) {
  if (confirm("이 쇼핑 아이템을 리스트에서 삭제하시겠습니까?")) {
    travelData.shoppingList.splice(index, 1);
    saveToLocalStorage();
    renderShoppingList();
    showToast("쇼핑 아이템이 삭제되었습니다.", "success");
  }
};

window.startEditShoppingItem = function(index) {
  const item = travelData.shoppingList[index];
  
  elements.shoppingModalTitle.innerText = "🛒 쇼핑 아이템 수정";
  elements.shoppingEditIndex.value = index;
  elements.shoppingName.value = item.name;
  elements.shoppingCategory.value = item.category;
  elements.shoppingQty.value = item.qty || 1;
  elements.shoppingCost.value = item.cost || "";
  elements.shoppingCurrency.value = item.currency || "JPY";
  elements.shoppingMemo.value = item.memo || "";
  
  elements.btnShoppingSubmit.innerText = "저장하기";
  elements.modalShopping.classList.remove("hidden");
};

window.openShoppingModal = function() {
  elements.shoppingModalTitle.innerText = "🛒 쇼핑 아이템 추가";
  elements.shoppingEditIndex.value = "";
  elements.formShopping.reset();
  
  elements.btnShoppingSubmit.innerText = "추가하기";
  elements.modalShopping.classList.remove("hidden");
};

window.addSpotToTimeline = function(city, originalIndex) {
  const list = city === "otaru" ? travelData.otaruFoodList : travelData.sapporoFoodList;
  const item = list[originalIndex];
  if (!item) return;

  // 1. 모달 상태 및 정보 바인딩
  elements.modalTitle.innerText = "추천 스팟을 일정에 추가";
  elements.editItemIndex.value = ""; // 신규 추가 모드

  // 방문 일차 기본값 설정
  elements.placeDay.value = activeTab.startsWith("day") ? activeTab : "day1";

  elements.placeName.value = item.name;
  elements.placeTime.value = "12:00"; // 기본값

  // 카테고리 매핑
  let placeCat = "etc";
  if (item.category === "spot") placeCat = "sightseeing";
  else if (item.category === "dessert") placeCat = "cafe";
  else if (["meat", "seafood", "noodle"].includes(item.category)) placeCat = "meal";
  elements.placeCategory.value = placeCat;

  elements.placeCost.value = "";
  elements.placeCurrency.value = "JPY";
  elements.placeMap.value = item.address || item.name;

  // 메모에 꿀팁 정보 결합
  let memoText = `✨ 추천메뉴: ${item.menu}`;
  if (item.tips) {
    memoText += `\n💡 꿀팁: ${item.tips}`;
  }
  elements.placeMemo.value = memoText;

  updateCostConversionLabel();
  elements.modalPlace.classList.remove("hidden");
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

    const displayCostPerPerson = item.cost > 0 
      ? (item.currency === "JPY" 
         ? `¥ ${formatNumber(item.cost)} (1인)` 
         : `₩ ${formatNumber(item.cost)} (1인)`)
      : "무료 / 예산 없음";
      
    const displayCostTotal = item.cost > 0 
      ? (item.currency === "JPY" 
         ? `총 ¥ ${formatNumber(totalCost)} (${memberCount}명)` 
         : `총 ₩ ${formatNumber(totalCost)} (${memberCount}명)`)
      : "";
      
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
      badgeHtml = "✈️";
    } else if (item.category === "transport") {
      badgeHtml = "🚌";
    } else {
      placeNumber++;
      badgeHtml = placeNumber;
    }

    // Generate Google Maps Links
    const mapQuery = item.mapAddress || item.name;
    const googleMapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
    const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`;
    const directionBtnHtml = `<a href="${directionUrl}" target="_blank" class="btn-map-action btn-map-dir" title="현재 내 위치에서 구글맵 길찾기 시작"><i class="ri-navigation-fill"></i> 길찾기</a>`;

    itemEl.innerHTML = `
      <div class="timeline-marker">${badgeHtml}</div>
      <div class="card glass-card timeline-card ${item.completed ? "completed" : ""}">
        <div class="card-top">
          <div class="place-time-title">
            <div class="place-time-row">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="place-time"><i class="ri-time-line"></i> ${item.time}</span>
                <span class="badge badge-${item.category}">${categoryLabels[item.category] || "기타"}</span>
              </div>
              ${isEditor ? `
              <div class="card-actions">
                <button class="btn-card-action btn-edit" onclick="openEditModal('${dayKey}', ${index})" title="일정 수정"><i class="ri-edit-box-line"></i></button>
                <button class="btn-card-action btn-delete" onclick="deleteTimelineItem('${dayKey}', ${index})" title="일정 삭제"><i class="ri-delete-bin-6-line"></i></button>
              </div>
              ` : ""}
            </div>
            <div class="place-name-row">
              <button class="btn-complete-toggle ${item.completed ? "completed" : ""}" onclick="toggleTimelineItemCompleted('${dayKey}', ${index})" title="${item.completed ? "미완료로 표시" : "완료로 표시"}">
                <i class="${item.completed ? "ri-checkbox-circle-fill" : "ri-checkbox-blank-circle-line"}"></i>
              </button>
              <h3 class="place-title">${escapeHTML(item.name)}</h3>
            </div>
          </div>
        </div>
        ${item.memo ? `<p class="place-memo">${escapeHTML(item.memo)}</p>` : ""}
        
        <!-- Google Maps Quick Actions -->
        <div class="card-map-actions">
          <a href="${googleMapSearchUrl}" target="_blank" class="btn-map-action btn-map-view" title="구글맵에서 장소 주소 검색"><i class="ri-map-pin-2-fill"></i> 지도</a>
          ${directionBtnHtml}
        </div>

        <div class="card-bottom">
          <div class="cost-info-group">
            <span class="place-cost">
              <i class="ri-money-dollar-circle-line"></i>
              <span class="currency-${item.currency.toLowerCase()}">${displayCostPerPerson}</span>
            </span>
            ${item.cost > 0 ? `
            <div class="place-cost-total">
              <i class="ri-corner-down-right-line"></i>
              <span>${displayCostTotal} ${krwCostSub}</span>
            </div>
            ` : ""}
          </div>
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

  // 나의 총 쇼핑 금액 (실지출) 계산 및 UI 반영
  let totalShoppingKRW = 0;
  (travelData.shoppingList || []).forEach(item => {
    if (item.checked) {
      const itemTotal = (parseFloat(item.cost) || 0) * (parseInt(item.qty) || 1);
      totalShoppingKRW += getCostInKRW(itemTotal, item.currency);
    }
  });
  const extraShoppingCostEl = document.getElementById("extraShoppingTotalCost");
  if (extraShoppingCostEl) {
    extraShoppingCostEl.innerText = formatNumber(totalShoppingKRW) + "원";
  }
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
  elements.placeDay.value = dayKey;
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
    elements.placeDay.value = activeTab.startsWith("day") ? activeTab : "day1";
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
    const selectedDay = elements.placeDay.value;
    
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
      const [dayKey, indexStr] = editVal.split(":");
      const index = parseInt(indexStr);
      
      if (dayKey === selectedDay) {
        // 일차가 바뀌지 않은 경우: 덮어쓰기
        travelData.days[dayKey][index] = itemData;
      } else {
        // 일차가 바뀐 경우: 기존 일차에서 삭제 후 새 일차에 추가
        travelData.days[dayKey].splice(index, 1);
        if (!travelData.days[selectedDay]) {
          travelData.days[selectedDay] = [];
        }
        travelData.days[selectedDay].push(itemData);
      }
      showToast("일정이 성공적으로 수정되었습니다.", "success");
    } else {
      // ADD MODE
      if (!travelData.days[selectedDay]) {
        travelData.days[selectedDay] = [];
      }
      travelData.days[selectedDay].push(itemData);
      showToast("새로운 일정이 추가되었습니다.", "success");
    }
    
    // 저장 후 해당 일차 탭으로 자동 이동 처리
    activeTab = selectedDay;
    elements.tabButtons.forEach(b => {
      if (b.getAttribute("data-tab") === selectedDay) {
        b.classList.add("active");
        b.setAttribute("aria-selected", "true");
      } else {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      }
    });
    
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
    const breakStart = elements.foodBreakStart.value;
    const breakEnd = elements.foodBreakEnd.value;
    const tips = elements.foodTips.value.trim();

    const newFoodItem = { name, category, rating, menu, address, openTime, closeTime, breakStart, breakEnd, tips };
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
      showToast("추천 스팟 정보가 성공적으로 수정되었습니다!", "success");
    } else {
      // ADD MODE
      if (city === "otaru") {
        travelData.otaruFoodList.push(newFoodItem);
      } else {
        travelData.sapporoFoodList.push(newFoodItem);
      }
      showToast("새로운 추천 스팟이 리스트에 추가되었습니다!", "success");
    }

    saveToLocalStorage();
    closeFoodModal();
    renderSpotsList();
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

  // ==========================================
  // Shopping List Form Events
  // ==========================================
  if (elements.formShopping) {
    elements.formShopping.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = elements.shoppingName.value.trim();
      const category = elements.shoppingCategory.value;
      const qty = parseInt(elements.shoppingQty.value) || 1;
      const cost = parseFloat(elements.shoppingCost.value) || 0;
      const currency = elements.shoppingCurrency.value;
      const memo = elements.shoppingMemo.value.trim();
      
      const editIndexVal = elements.shoppingEditIndex.value;
      const itemData = { name, category, qty, cost, currency, memo, checked: false };
      
      if (editIndexVal) {
        const index = parseInt(editIndexVal);
        itemData.checked = travelData.shoppingList[index].checked || false;
        travelData.shoppingList[index] = itemData;
        showToast("쇼핑 아이템이 수정되었습니다.", "success");
      } else {
        if (!travelData.shoppingList) {
          travelData.shoppingList = [];
        }
        travelData.shoppingList.push(itemData);
        showToast("새로운 쇼핑 아이템이 추가되었습니다.", "success");
      }
      
      saveToLocalStorage();
      resetShoppingForm();
      renderShoppingList();
    });
  }

  if (elements.btnShoppingCancel) {
    elements.btnShoppingCancel.addEventListener("click", resetShoppingForm);
  }

  if (elements.btnShoppingModalClose) {
    elements.btnShoppingModalClose.addEventListener("click", resetShoppingForm);
  }

  function resetShoppingForm() {
    elements.formShopping.reset();
    elements.shoppingEditIndex.value = "";
    elements.shoppingModalTitle.innerText = "🛒 쇼핑 아이템 추가";
    elements.btnShoppingSubmit.innerText = "추가하기";
    elements.modalShopping.classList.add("hidden");
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

// ==========================================
// 13. PDF IMAGE EXPORT SYSTEM
// ==========================================
window.exportTimelineToPDF = function() {
  const timelineEl = document.getElementById("timelineList");
  if (!timelineEl || timelineEl.children.length === 0) {
    showToast("캡처할 일정이 없습니다! 장소를 먼저 추가해 주세요.", "error");
    return;
  }
  
  showToast("📄 PDF 일정을 생성하고 있습니다. 잠시만 기다려 주세요...", "info");
  
  // 1. 임시 복제본(clone) 생성
  const clone = timelineEl.cloneNode(true);
  
  // 2. 복제본 및 내부 모든 요소들의 애니메이션, 트랜지션, 투명도 강제 무력화 (백지 버그 원천 해결)
  clone.style.animation = "none !important";
  clone.style.transform = "none !important";
  clone.style.transition = "none !important";
  clone.style.opacity = "1 !important";
  
  const items = clone.querySelectorAll(".timeline-item, .card, .timeline-card, .btn-complete-toggle, .place-title, .place-time");
  items.forEach(el => {
    el.style.animation = "none";
    el.style.transform = "none";
    el.style.transition = "none";
    el.style.opacity = "1";
  });
  
  // 3. 모바일 브라우저 렌더링 최적화:
  // 오프스크린(-9999px)으로 보내면 모바일 브라우저가 리소스를 아끼기 위해 그리기(Paint)를 생략하여 백지가 발생합니다.
  // fixed와 opacity: 0.01을 주어 화면 내에 실제로 렌더링되게 만듭니다.
  clone.style.position = "fixed";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.zIndex = "-9999";
  clone.style.opacity = "0.01";
  clone.style.width = timelineEl.offsetWidth + "px";
  clone.style.background = "#ffffff";
  clone.style.padding = "20px";
  clone.style.boxSizing = "border-box";
  
  document.body.appendChild(clone);
  
  // 4. 모바일 기기의 렌더링 성능을 고려하여 200ms 대기 후 PDF 생성 트리거
  setTimeout(() => {
    const dayNum = activeTab.replace("day", "");
    const fileName = `sapo_travel_day${dayNum}_schedule.pdf`;
    
    const options = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // 5. 복제본 엘리먼트로 PDF 캡처 생성
    html2pdf().from(clone).set(options).save().then(() => {
      // 6. 사용 후 삭제
      document.body.removeChild(clone);
      showToast("🎉 PDF 저장이 완료되었습니다!", "success");
    }).catch(err => {
      console.error("PDF 생성 실패:", err);
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
      showToast("PDF 생성 중 오류가 발생했습니다.", "error");
    });
  }, 200);
};



