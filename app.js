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
// 1. CONSTANTS & INITIAL DATA (Multi-City Templates)
// ==========================================
const CITY_TEMPLATES = {
  sapporo: {
    cityCode: "sapporo",
    title: "삿포로 & 오타루 초여름 여행 ✈️",
    startDate: "2026-06-13",
    endDate: "2026-06-16",
    memberCount: 2,
    mapCenter: [43.06, 141.35],
    mapZoom: 11,
    days: {
      day1: [
        { id: 1, type: "checkin", name: "신치토세 공항", time: "11:30", memo: "세관 신고 완료 후 JR 탑승구로 이동" },
        { id: 2, type: "food", name: "삿포로역", time: "13:00", memo: "라멘 공화국에서 미소라멘 점심 식사" },
        { id: 3, type: "checkin", name: "머큐어 호텔 삿포로", time: "15:00", memo: "체크인 후 짐 보관" },
        { id: 4, type: "spot", name: "오도리 공원", time: "17:00", memo: "TV타워 배경으로 사진 촬영 📸" },
        { id: 5, type: "food", name: "징기스칸 다루마", time: "19:00", memo: "양고기구이와 시원한 맥주 한 잔" }
      ],
      day2: [
        { id: 6, type: "checkin", name: "오타루역", time: "10:00", memo: "JR 쾌속 에어포트 탑승 (약 35분 소요)" },
        { id: 7, type: "food", name: "오타루 마사즈시", time: "12:00", memo: "초밥 세트 점심식사" },
        { id: 8, type: "spot", name: "사카이마치 거리", time: "14:00", memo: "오르골당, 오타루 르타오 본점 디저트 쇼핑" },
        { id: 9, type: "spot", name: "오타루 운하", time: "18:00", memo: "가스등 켜지는 운하 야경 감상 및 크루즈" }
      ],
      day3: [
        { id: 10, type: "checkin", name: "비에이역", time: "09:30", memo: "비에이 버스 투어 합류" },
        { id: 11, type: "food", name: "준페이", time: "12:00", memo: "대표 메뉴 에비동 (새우튀김 덮밥)" },
        { id: 12, type: "spot", name: "청의 호수", time: "14:00", memo: "에메랄드빛 푸른 연못 감상" },
        { id: 13, type: "spot", name: "흰수염 폭포", time: "15:30", memo: "푸른 물줄기가 내리는 계곡 절경 감상" },
        { id: 14, type: "spot", name: "닝글테라스", time: "17:30", memo: "숲속 요정마을 같은 아기자기한 통나무 공방" }
      ],
      day4: [
        { id: 15, type: "shopping", name: "스스키노", time: "10:00", memo: "돈키호테에서 마지막 기념품 쇼핑" },
        { id: 16, type: "checkin", name: "신치토세 공항", time: "13:30", memo: "면세점에서 로이스 및 시로이코이비토 구매 후 출국" }
      ]
    },
    checklist: [
      { id: 1, text: "여권 (만료일 6개월 이상)", checked: true },
      { id: 2, text: "비행기 표 & 호텔 바우처 확인", checked: true },
      { id: 3, text: "Visit Japan Web 미리 등록", checked: false },
      { id: 4, text: "트래블월렛 / 트래블로그 카드 발급", checked: true },
      { id: 5, text: "현금 환전 (야타이나 시장 결제용)", checked: false },
      { id: 6, text: "일본용 eSIM / 유심 구매", checked: false },
      { id: 7, text: "110V 돼지코 플러그", checked: false }
    ],
    shoppingList: [
      { id: 1, name: "시로이 코이비토 18개입", category: "dessert", qty: 2, cost: 1520, currency: "JPY", memo: "신치토세 공항 면세점 추천", checked: false },
      { id: 2, name: "돈키호테 동전패치", category: "drug", qty: 3, cost: 800, currency: "JPY", memo: "사츠도라 또는 돈키호테 스스키노점", checked: false }
    ],
    explore: {
      welcomeSubtitle: "초여름의 낭만 홋카이도로 떠나볼까요?",
      bannerTitle: "6월 삿포로 라벤더 축제 & 비에이 투어 핵심 꿀팁",
      bannerDesc: "현지인들만 아는 주차 명소와 웨이팅 없는 맛집 리스트 대공개",
      cities: [
        { emoji: "🧭", name: "삿포로", desc: "식당 & 도심 야경", filter: "sapporo" },
        { emoji: "🌊", name: "오타루", desc: "오르골 & 감성 운하", filter: "otaru" },
        { emoji: "✨", name: "하코다테", desc: "세계 3대 로프웨이 야경", filter: "hakodate" },
        { emoji: "🌸", name: "비에이/후라노", desc: "청의 호수 & 패치워크", filter: "biei" }
      ],
      deals: [
        { emoji: "ri-coupon-3-fill", color: "var(--cat-shopping)", title: "돈키호테 할인 쿠폰 15% 받기", desc: "10% 면세 + 최대 5% 추가 즉시할인 바코드 연동" },
        { emoji: "ri-train-line", color: "var(--primary)", title: "JR 홋카이도 레일패스 (재팬 레일패스)", desc: "삿포로-오타루-하코다테 전 노선 자유 탑승권 예약" }
      ]
    }
  },
  tokyo: {
    cityCode: "tokyo",
    title: "도쿄 화려한 도심 탐방 🗼",
    startDate: "2026-07-10",
    endDate: "2026-07-13",
    memberCount: 2,
    mapCenter: [35.6812, 139.7671],
    mapZoom: 12,
    days: {
      day1: [
        { id: 1, type: "checkin", name: "도쿄역", time: "12:00", memo: "나리타 익스프레스(N'EX) 탑승 후 하차" },
        { id: 2, type: "food", name: "신주쿠역", time: "14:00", memo: "현지 라멘 맛집 점심 식사" },
        { id: 3, type: "spot", name: "도쿄 타워", time: "18:00", memo: "붉게 빛나는 상징적인 야경 전망대" }
      ],
      day2: [
        { id: 4, type: "spot", name: "아사쿠사 센소지", time: "10:00", memo: "전통 향로 연기 마시기 및 신주쿠 상점가 구경" },
        { id: 5, type: "spot", name: "시부야 스카이", time: "17:00", memo: "시부야 스크램블 교차로 야경 내려다보기 (예약 필수)" }
      ],
      day3: [
        { id: 6, type: "spot", name: "도쿄 디즈니랜드", time: "09:00", memo: "오픈런! 최고 스릴 어트랙션 우선 대기" }
      ],
      day4: [
        { id: 7, type: "shopping", name: "신주쿠역", time: "10:00", memo: "백화점 쇼핑 및 드럭스토어 마지막 털기" }
      ]
    },
    checklist: [
      { id: 1, text: "여권 (만료일 6개월 이상)", checked: true },
      { id: 2, text: "비행기 표 & 호텔 바우처 확인", checked: true },
      { id: 3, text: "도쿄 디즈니랜드 입장권 QR 확인", checked: false },
      { id: 4, text: "트래블월렛 카드 확인", checked: true },
      { id: 5, text: "110V 돼지코 플러그", checked: false }
    ],
    shoppingList: [
      { id: 1, name: "도쿄 바나나 8개입", category: "dessert", qty: 3, cost: 1200, currency: "JPY", memo: "공항 면세점 또는 백화점", checked: false },
      { id: 2, name: "퍼펙트휩 폼클렌징", category: "drug", qty: 5, cost: 450, currency: "JPY", memo: "돈키호테 신주쿠점", checked: false }
    ],
    explore: {
      welcomeSubtitle: "화려한 메트로폴리스 도쿄로 떠나볼까요?",
      bannerTitle: "도쿄 디즈니랜드 & 시부야 스카이 100% 꿀팁",
      bannerDesc: "미리 사지 않으면 매진되는 티켓과 어트랙션 루트 완벽 분석",
      cities: [
        { emoji: "🗼", name: "신주쿠/시부야", desc: "쇼핑 & 메인 거리", filter: "shinjuku" },
        { emoji: "⛩️", name: "아사쿠사", desc: "도쿄의 오랜 정취", filter: "asakusa" },
        { emoji: "🎢", name: "마이하마", desc: "디즈니랜드 리조트", filter: "maihama" },
        { emoji: "🛍️", name: "긴자", desc: "명품관 & 고급 식당", filter: "ginza" }
      ],
      deals: [
        { emoji: "ri-coupon-3-fill", color: "var(--cat-shopping)", title: "도쿄 메가 돈키호테 할인 쿠폰 15%", desc: "면세 10% + 시부야/신주쿠점 추가 5% 혜택" },
        { emoji: "ri-subway-line", color: "var(--primary)", title: "도쿄 서브웨이 티켓 (24/48/72시간권)", desc: "도쿄 전역 지하철 노선 무제한 탑승권 예약" }
      ]
    }
  },
  osaka: {
    cityCode: "osaka",
    title: "오사카 & 교토 먹방 여행 🐙",
    startDate: "2026-08-15",
    endDate: "2026-08-18",
    memberCount: 2,
    mapCenter: [34.6937, 135.5023],
    mapZoom: 12,
    days: {
      day1: [
        { id: 1, type: "checkin", name: "오사카역", time: "12:00", memo: "간사이 공항 하루카 특급 탑승 후 이동" },
        { id: 2, type: "food", name: "도톤보리", time: "14:00", memo: "글리코상 앞에서 인증샷 촬영 및 타코야키 점심" },
        { id: 3, type: "spot", name: "우메다 공중정원", time: "19:00", memo: "바람을 맞으며 감상하는 360도 스카이 야경" }
      ],
      day2: [
        { id: 4, type: "spot", name: "교토역", time: "09:30", memo: "한큐 전철 탑승 후 청수사(기요미즈데라)로 이동" },
        { id: 5, type: "spot", name: "오사카성", time: "17:00", memo: "역사적인 천수각 공원 산책" }
      ],
      day3: [
        { id: 6, type: "spot", name: "유니버설 스튜디오 재팬", time: "08:30", memo: "마리오 카트, 해리포터 포비든 저니 오픈런 탑승" }
      ],
      day4: [
        { id: 7, type: "shopping", name: "도톤보리", time: "10:00", memo: "드럭스토어 면세 쇼핑 및 말차 디저트 시식" }
      ]
    },
    checklist: [
      { id: 1, text: "여권 (만료일 6개월 이상)", checked: true },
      { id: 2, text: "USJ 익스프레스 패스 모바일 저장", checked: false },
      { id: 3, text: "하루카 편도 티켓 확인", checked: false },
      { id: 4, text: "110V 돼지코 플러그", checked: false }
    ],
    shoppingList: [
      { id: 1, name: "교토 우지 말차 과자", category: "dessert", qty: 2, cost: 980, currency: "JPY", memo: "교토역 선물샵", checked: false },
      { id: 2, name: "샤론 파스 140장", category: "drug", qty: 2, cost: 1100, currency: "JPY", memo: "돈키호테 난바점", checked: false }
    ],
    explore: {
      welcomeSubtitle: "도톤보리의 유쾌함과 교토의 고즈넉함 속으로!",
      bannerTitle: "오사카 유니버설 스튜디오 확약권 실패 없는 대기 꿀팁",
      bannerDesc: "익스프레스 없이 닌텐도 월드 정리권 발급받는 방법 완벽 가이드",
      cities: [
        { emoji: "🐙", name: "난바/우메다", desc: "오사카의 먹거리 & 쇼핑", filter: "namba" },
        { emoji: "🏯", name: "오사카성", desc: "역사 유적지 산책", filter: "castle" },
        { emoji: "⛩️", name: "교토", desc: "청수사 & 아라시야마", filter: "kyoto" },
        { emoji: "🎢", name: "사쿠라지마", desc: "USJ 테마파크", filter: "usj" }
      ],
      deals: [
        { emoji: "ri-coupon-3-fill", color: "var(--cat-shopping)", title: "오사카 돈키호테 난바점 15% 쿠폰", desc: "10% 면세 + 5% 현장 추가 쿠폰 링크" },
        { emoji: "ri-passport-line", color: "var(--primary)", title: "오사카 주유패스 1일권 / 2일권 예약", desc: "전철 무제한 및 40곳 이상 주요 관광지 무료 입장" }
      ]
    }
  }
};

const SAPPORO_TEMPLATE = CITY_TEMPLATES.sapporo;

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

const TOKYO_FOOD_LIST = [
  {
    name: "도쿄 타워 (Tokyo Tower)",
    category: "spot",
    rating: "4.7",
    menu: "도쿄의 상징 전망대 관람 🗼",
    tips: "도쿄의 오랜 랜드마크입니다. 시바 공원에서 도쿄 타워를 배경으로 돗자리를 펴고 피크닉 사진을 찍으면 인생샷을 쉽게 남길 수 있습니다.",
    address: "Tokyo Tower, Tokyo",
    openTime: "09:00",
    closeTime: "23:00"
  },
  {
    name: "아사쿠사 센소지 (Senso-ji)",
    category: "spot",
    rating: "4.6",
    menu: "전통 사찰 산책 & 나카미세도리 길거리 간식",
    tips: "도쿄에서 가장 오래된 절입니다. 입구의 붉은 거대 등(카미나리몬) 아래서 인증샷을 찍고 사찰 앞 상점가에서 화과자와 모찌를 즐겨보세요.",
    address: "Sensoji Temple, Tokyo",
    openTime: "06:00",
    closeTime: "17:00"
  },
  {
    name: "시부야 스카이 (Shibuya Sky)",
    category: "spot",
    rating: "4.8",
    menu: "전망대 옥상 시부야 스크램블 뷰",
    tips: "시부야 스크램블 스퀘어 빌딩 옥상에 있는 전망대입니다. 일몰 시간대 예약이 가장 인기가 많으며, 바람을 맞으며 360도로 펼쳐진 야경은 장관입니다.",
    address: "Shibuya Sky, Tokyo",
    openTime: "10:00",
    closeTime: "22:30"
  },
  {
    name: "이치란 라멘 신주쿠점",
    category: "noodle",
    rating: "4.3",
    menu: "천연 돈코츠 라멘 (약 980엔)",
    tips: "한국인 입맛에 가장 잘 맞는 1인 독서실 형태의 유명 돈코츠 라멘집입니다. 매운맛 소스 레벨을 4~5단계 정도로 올리면 느끼함 없이 맛있게 드실 수 있습니다.",
    address: "Ichiran Shinjuku, Tokyo",
    openTime: "10:00",
    closeTime: "23:00"
  }
];

const OSAKA_FOOD_LIST = [
  {
    name: "도톤보리 (Dotonbori)",
    category: "spot",
    rating: "4.6",
    menu: "글리코상 인증샷 & 타코야키 투어 🐙",
    tips: "오사카의 심장 같은 중심가입니다. 거대하고 화려한 입체 간판들을 배경으로 야경을 즐기고, 다리 밑 노점에서 파는 따끈한 타코야키를 맥주와 함께 즐겨보세요.",
    address: "Dotonbori, Osaka",
    openTime: "00:00",
    closeTime: "24:00"
  },
  {
    name: "유니버설 스튜디오 재팬 (USJ)",
    category: "spot",
    rating: "4.8",
    menu: "해리포터 & 닌텐도 월드 어트랙션 🎢",
    tips: "아시아 최고의 테마파크 중 하나입니다. 슈퍼 닌텐도 월드에 입장하려면 앱으로 정리권을 꼭 발급받거나 익스프레스 패스를 사전 구매해야 합니다.",
    address: "Universal Studios Japan, Osaka",
    openTime: "08:30",
    closeTime: "21:00"
  },
  {
    name: "교토 기요미즈데라 (청수사)",
    category: "spot",
    rating: "4.7",
    menu: "산등성이에 세워진 목조 사찰 관람 ⛩️",
    tips: "오사카에서 당일치기로 다녀오기 좋은 유네스코 세계유산 사찰입니다. 올라가는 언덕길(니넨자카, 산넨자카)의 고즈넉한 목조 건물들과 녹차 아이스크림이 필수 코스입니다.",
    address: "Kiyomizu-dera, Kyoto",
    openTime: "06:00",
    closeTime: "18:00"
  },
  {
    name: "치보 오사카 도톤보리본점",
    category: "meat",
    rating: "4.4",
    menu: "치보 도톤보리 오코노미야키 (약 1,650엔)",
    tips: "철판에 즉석으로 구워주는 도톤보리 정통 오코노미야키 & 야키소바 전문점입니다. 마요네즈 쇼를 눈앞에서 볼 수 있어 눈과 입이 모두 즐겁습니다.",
    address: "Chibo Dotonbori, Osaka",
    openTime: "11:00",
    closeTime: "22:00"
  }
];

// ==========================================
// 2. STATE MANAGEMENT & APP STATE
// ==========================================
let travelData = {};
let myTripsList = []; // Array to store multiple trips dynamically
let roomId = ""; // Room code for Firestore sync
let selectedCityCode = ""; // Temporary city code for multi-step trip creation
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
let isMapVisible = localStorage.getItem("sapo_map_visible") !== "false";
let activeBottomTab = "home"; // 'home', 'timeline', 'spots', 'shopping', 'extra'
let currentView = "explore"; // 'explore', 'myTrips', 'detail'
const coordsCache = {};

// Sapporo & Otaru Essential Coordinates Database (0-latency rendering)
const LOCATION_COORDINATES = {
  // Tokyo Landmarks
  "도쿄역": [35.6812, 139.7671],
  "신주쿠역": [35.6896, 139.6917],
  "시부야 스카이": [35.6585, 139.7023],
  "도쿄 디즈니랜드": [35.6329, 139.8804],
  "아사쿠사 센소지": [35.7148, 139.7967],
  "도쿄 타워": [35.6586, 139.7454],
  
  // Osaka Landmarks
  "오사카역": [34.7024, 135.4959],
  "도톤보리": [34.6687, 135.5013],
  "유니버설 스튜디오 재팬": [34.6654, 135.4323],
  "오사카성": [34.6873, 135.5262],
  "우메다 공중정원": [34.7053, 135.4902],
  "교토역": [34.9858, 135.7588],

  // Sapporo Landmarks
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
  
  // Dynamic suffix based on current travelData.cityCode to prevent OSM confusion
  let searchQuery = q;
  const currentCityCode = travelData.cityCode || "sapporo";
  if (currentCityCode === "sapporo") {
    if (!q.toLowerCase().includes("hokkaido")) searchQuery = q + ", Hokkaido";
  } else if (currentCityCode === "tokyo") {
    if (!q.toLowerCase().includes("tokyo")) searchQuery = q + ", Tokyo";
  } else if (currentCityCode === "osaka") {
    if (!q.toLowerCase().includes("osaka") && !q.toLowerCase().includes("kyoto")) {
      searchQuery = q + ", Osaka";
    }
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
  appNav: document.querySelector(".app-nav"),
  appMainEmoji: document.getElementById("appMainEmoji"),
  appMainTitle: document.getElementById("appMainTitle"),
  appSubTitle: document.getElementById("appSubTitle"),
  txtTripPeriod: document.getElementById("txtTripPeriod"),
  navTabs: document.getElementById("navTabs"),
  tabContentDays: document.getElementById("tabContentDays"),
  tabContentExtra: document.getElementById("tabContentExtra"),
  timelineDayTitle: document.getElementById("timelineDayTitle"),
  timelineList: document.getElementById("timelineList"),
  timelineEmptyState: document.getElementById("timelineEmptyState"),
  btnAddPlace: document.getElementById("btnAddPlace"),
  btnEmptyAdd: document.getElementById("btnEmptyAdd"),
  btnShare: document.getElementById("btnShare"),
  btnToggleMap: document.getElementById("btnToggleMap"),
  iconToggleMap: document.getElementById("iconToggleMap"),
  homeView: document.getElementById("homeView"),
  homeTripsGrid: document.getElementById("homeTripsGrid"),
  tripDetailView: document.getElementById("tripDetailView"),
  bottomNavItems: document.querySelectorAll(".bottom-nav-item"),
  bottomNav: document.querySelector(".bottom-nav"),
  appContainer: document.querySelector(".app-container"),
  mainExploreView: document.getElementById("mainExploreView"),
  btnGoToMyTrips: document.getElementById("btnGoToMyTrips"),
  btnBackToExplore: document.getElementById("btnBackToExplore"),
  modalCitySelect: document.getElementById("modalCitySelect"),
  cityModalTitle: document.getElementById("cityModalTitle"),
  citySelectStep1: document.getElementById("citySelectStep1"),
  citySelectStep2: document.getElementById("citySelectStep2"),
  selectedCityEmoji: document.getElementById("selectedCityEmoji"),
  selectedCityName: document.getElementById("selectedCityName"),
  inputTripStartDate: document.getElementById("inputTripStartDate"),
  inputTripEndDate: document.getElementById("inputTripEndDate"),
  btnCityModalClose: document.getElementById("btnCityModalClose"),
  btnCityModalCancel: document.getElementById("btnCityModalCancel"),
  btnDateSelectBack: document.getElementById("btnDateSelectBack"),
  btnCreateTripSubmit: document.getElementById("btnCreateTripSubmit"),
  
  // Trip Edit Modal Elements
  modalTripEdit: document.getElementById("modalTripEdit"),
  btnTripEditClose: document.getElementById("btnTripEditClose"),
  btnTripEditCancel: document.getElementById("btnTripEditCancel"),
  formTripEdit: document.getElementById("formTripEdit"),
  inputEditTripId: document.getElementById("inputEditTripId"),
  inputEditTripTitle: document.getElementById("inputEditTripTitle"),
  inputEditTripStartDate: document.getElementById("inputEditTripStartDate"),
  inputEditTripEndDate: document.getElementById("inputEditTripEndDate"),
  inputEditTripMember: document.getElementById("inputEditTripMember"),
  
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

  // Load myTripsList from localStorage
  try {
    myTripsList = JSON.parse(localStorage.getItem("sapo_trips_list") || "[]");
    sortMyTripsList();
  } catch (e) {
    myTripsList = [];
  }

  // Auto-route to the most upcoming trip if room parameter is missing in URL
  if (!roomParam && myTripsList.length > 0) {
    roomParam = myTripsList[0].id;
  }

  // Set up immediate local data fallback to render instantly before server connects
  let localBackup = null;
  if (roomParam) {
    try {
      localBackup = JSON.parse(localStorage.getItem(`sapo_travel_data_${roomParam}`));
    } catch (e) {}
  }
  if (!localBackup) {
    try {
      localBackup = JSON.parse(localStorage.getItem("sapo_travel_data"));
    } catch (e) {}
  }

  // Pre-load travelData to prevent blank page while waiting for Firestore
  travelData = localBackup || JSON.parse(JSON.stringify(CITY_TEMPLATES.sapporo));
  ensureFoodListsExist();
  
  // Set default edit permission status first
  if (roomParam) {
    roomId = roomParam;
    isEditor = ownedRooms.includes(roomId) || forceEdit;
  } else {
    isEditor = true;
  }

  // Ensure initial roomId is added to myTripsList if missing
  const activeRoomId = roomId || roomParam || "sapo-default";
  if (myTripsList.length === 0) {
    myTripsList.push({
      id: activeRoomId,
      title: travelData.title || "삿포로 & 오타루 초여름 여행 ✈️",
      cityCode: travelData.cityCode || "sapporo",
      startDate: travelData.startDate || "2026-06-13",
      endDate: travelData.endDate || "2026-06-16",
      memberCount: travelData.memberCount || 2
    });
    localStorage.setItem("sapo_trips_list", JSON.stringify(myTripsList));
  }

  // Render immediately for instant startup!
  renderApp();
  calculateDday();
  renderHomeTripsGrid();

  // 1. Backward Compatibility Bridge: Old link with compressed '?p=...'
  if (compressedData && !roomParam) {
    try {
      const decompressed = (typeof LZString !== 'undefined') ? LZString.decompressFromEncodedURIComponent(compressedData) : null;
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
        syncTripToMyTripsList();
        
        // Update URL immediately so user sees new state
        const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        window.history.replaceState({}, document.title, newUrl);
        renderApp();
        calculateDday();
        
        // Save imported data to the newly created room and start sync
        setDoc(doc(db, "rooms", roomId), travelData).then(() => {
          showToast("✈️ 구버전 일정을 실시간 연동 클라우드 방으로 이전했습니다!", "success");
          startFirestoreSync();
        }).catch(err => {
          console.error("Migration setDoc failed:", err);
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
        travelData = JSON.parse(JSON.stringify(CITY_TEMPLATES.sapporo));
      }
    } else {
      travelData = JSON.parse(JSON.stringify(CITY_TEMPLATES.sapporo));
    }
    
    roomId = roomParam;
    isEditor = true;
    ensureFoodListsExist();
    syncTripToMyTripsList();
    
    // Re-render local content
    renderApp();
    calculateDday();
    
    const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    window.history.replaceState({}, document.title, newUrl);

    setDoc(doc(db, "rooms", roomId), travelData).then(() => {
      startFirestoreSync();
    }).catch(err => {
      console.error("First-time room creation setDoc failed:", err);
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
    
    // Re-render local content before syncing with database
    renderApp();
    calculateDday();
    
    // Add shared room to myTripsList if not present
    const exists = myTripsList.some(t => t.id === roomId);
    if (!exists) {
      myTripsList.push({
        id: roomId,
        title: travelData.title || "공유받은 여행",
        cityCode: travelData.cityCode || "sapporo",
        startDate: travelData.startDate || "",
        endDate: travelData.endDate || "",
        memberCount: travelData.memberCount || 2
      });
      localStorage.setItem("sapo_trips_list", JSON.stringify(myTripsList));
      renderHomeTripsGrid();
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
      
      // Sync metadata with myTripsList locally
      syncTripToMyTripsList();
      
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
          travelData = JSON.parse(JSON.stringify(CITY_TEMPLATES.sapporo));
          ensureFoodListsExist();
        }
        setDoc(roomDocRef, travelData).catch(err => console.error("setDoc failed for non-existent room:", err));
      } else {
        showToast("존재하지 않는 여행 계획 방 코드입니다. 주소를 다시 확인해주세요.", "error");
      }
    }
  }, (error) => {
    console.error("Firestore sync failed:", error);
    showToast("⚠️ 실시간 서버 연결을 할 수 없습니다. (오프라인 모드 작동 중)", "info");
  });
}

function syncTripToMyTripsList() {
  if (!travelData || !roomId) return;
  const existingIdx = myTripsList.findIndex(t => t.id === roomId);
  const tripMeta = {
    id: roomId,
    title: travelData.title || "새로운 여행",
    cityCode: travelData.cityCode || "sapporo",
    startDate: travelData.startDate || "",
    endDate: travelData.endDate || "",
    memberCount: travelData.memberCount || 2
  };
  
  if (existingIdx !== -1) {
    myTripsList[existingIdx] = tripMeta;
  } else {
    myTripsList.unshift(tripMeta);
  }
  
  localStorage.setItem("sapo_trips_list", JSON.stringify(myTripsList));
  renderHomeTripsGrid();
}

function sortMyTripsList() {
  myTripsList.sort((a, b) => {
    const aDate = a.startDate ? new Date(a.startDate) : null;
    const bDate = b.startDate ? new Date(b.startDate) : null;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    
    aDate.setHours(0,0,0,0);
    bDate.setHours(0,0,0,0);
    
    const aDiff = aDate - today;
    const bDiff = bDate - today;
    
    const aIsFutureOrToday = aDiff >= 0;
    const bIsFutureOrToday = bDiff >= 0;
    
    if (aIsFutureOrToday && bIsFutureOrToday) {
      return aDiff - bDiff;
    } else if (aIsFutureOrToday) {
      return -1;
    } else if (bIsFutureOrToday) {
      return 1;
    } else {
      return bDiff - aDiff;
    }
  });
}

function deleteTripCard(id) {
  if (!confirm("이 여행 일정을 정말 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.")) return;
  
  const idx = myTripsList.findIndex(t => t.id === id);
  if (idx === -1) return;
  
  myTripsList.splice(idx, 1);
  localStorage.setItem("sapo_trips_list", JSON.stringify(myTripsList));
  localStorage.removeItem(`sapo_travel_data_${id}`);
  
  showToast("🗑️ 여행 일정이 성공적으로 삭제되었습니다.", "success");
  
  if (roomId === id) {
    sortMyTripsList();
    if (myTripsList.length > 0) {
      roomId = myTripsList[0].id;
      const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
      window.history.replaceState({}, document.title, newUrl);
      startFirestoreSync();
    } else {
      const newRoomParam = "sapo-" + Math.random().toString(36).substring(2, 8);
      roomId = newRoomParam;
      
      let ownedRooms = [];
      try {
        ownedRooms = JSON.parse(localStorage.getItem("sapo_owned_rooms") || "[]");
      } catch(e) {}
      ownedRooms.push(roomId);
      localStorage.setItem("sapo_owned_rooms", JSON.stringify(ownedRooms));
      
      travelData = JSON.parse(JSON.stringify(CITY_TEMPLATES.sapporo));
      ensureFoodListsExist();
      
      myTripsList = [{
        id: roomId,
        title: travelData.title,
        cityCode: travelData.cityCode,
        startDate: travelData.startDate,
        endDate: travelData.endDate,
        memberCount: travelData.memberCount
      }];
      localStorage.setItem("sapo_trips_list", JSON.stringify(myTripsList));
      
      const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
      window.history.replaceState({}, document.title, newUrl);
      
      setDoc(doc(db, "rooms", roomId), travelData).then(() => {
        startFirestoreSync();
      }).catch(() => startFirestoreSync());
    }
  } else {
    renderHomeTripsGrid();
  }
}

function openTripEditModal(id) {
  showToast("⏳ 일정 정보를 불러오고 있습니다...", "info");
  
  getDoc(doc(db, "rooms", id)).then(roomSnap => {
    if (!roomSnap.exists()) {
      showToast("⚠️ 존재하지 않는 여행방입니다.", "error");
      return;
    }
    const data = roomSnap.data();
    
    // Set edit form values
    elements.inputEditTripId.value = id;
    elements.inputEditTripTitle.value = data.title || "";
    elements.inputEditTripStartDate.value = data.startDate || "";
    elements.inputEditTripEndDate.value = data.endDate || "";
    elements.inputEditTripMember.value = data.memberCount || 2;
    
    // Set input min constraints
    const todayStr = new Date().toISOString().split("T")[0];
    elements.inputEditTripStartDate.min = todayStr;
    elements.inputEditTripEndDate.min = todayStr;
    
    // Show modal
    elements.modalTripEdit.classList.remove("hidden");
  }).catch(err => {
    console.error("Fetch room for edit failed:", err);
    showToast("⚠️ 여행 정보를 불러오는 데 실패했습니다.", "error");
  });
}

function renderHomeTripsGrid() {
  if (!elements.homeTripsGrid) return;
  
  // Sort trips by date proximity before rendering
  sortMyTripsList();
  
  const dynamicCards = elements.homeTripsGrid.querySelectorAll(".trip-card:not(.trip-card-new)");
  dynamicCards.forEach(c => c.remove());
  
  const newTripCard = document.getElementById("btnCreateNewTrip");
  
  myTripsList.forEach(trip => {
    let bgClass = "bg-sapporo";
    let emoji = "❄️";
    if (trip.cityCode === "tokyo") {
      bgClass = "bg-tokyo";
      emoji = "🗼";
    } else if (trip.cityCode === "osaka") {
      bgClass = "bg-osaka";
      emoji = "🐙";
    }
    
    let ddayText = "D-??";
    if (trip.startDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const start = new Date(trip.startDate);
      start.setHours(0,0,0,0);
      const diffTime = start - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) ddayText = "D-Day";
      else if (diffDays > 0) ddayText = `D-${diffDays}`;
      else ddayText = `D+${Math.abs(diffDays)}`;
    }

    const card = document.createElement("div");
    card.className = "trip-card glass-card";
    card.style.cursor = "pointer";
    if (trip.id === roomId) {
      card.style.border = "1.5px solid var(--secondary)";
    }
    
    card.innerHTML = `
      <button class="btn-trip-edit" title="일정 수정"><i class="ri-edit-line"></i></button>
      <button class="btn-trip-delete" title="일정 삭제"><i class="ri-delete-bin-line"></i></button>
      <div class="trip-card-image ${bgClass}">
        <span class="trip-dday-badge" style="color: var(--secondary);">${ddayText}</span>
        <div style="position: absolute; right: 16px; top: 16px; font-size: 1.5rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));">${emoji}</div>
      </div>
      <div class="trip-card-info">
        <h3 class="trip-title-text">${trip.title}</h3>
        <p class="trip-date-text"><i class="ri-calendar-line"></i> <span>${trip.startDate || "미정"} ~ ${trip.endDate || "미정"}</span></p>
        <p class="trip-meta-text"><i class="ri-user-line"></i> <span>${trip.memberCount || 2}명</span></p>
      </div>
    `;
    
    // Bind Edit Button Click with stopPropagation
    const editBtn = card.querySelector(".btn-trip-edit");
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openTripEditModal(trip.id);
      });
    }

    // Bind Delete Button Click with stopPropagation
    const deleteBtn = card.querySelector(".btn-trip-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTripCard(trip.id);
      });
    }
    
    card.addEventListener("click", () => {
      if (roomId === trip.id) {
        currentView = "detail";
        activeBottomTab = "timeline";
        activeTab = "day1";
        renderApp();
      } else {
        roomId = trip.id;
        
        const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        window.history.replaceState({}, document.title, newUrl);
        
        startFirestoreSync();
        
        currentView = "detail";
        activeBottomTab = "timeline";
        activeTab = "day1";
        showToast(`✈️ '${trip.title}' 일정으로 전환합니다.`, "info");
      }
    });
    
    if (newTripCard) {
      elements.homeTripsGrid.insertBefore(card, newTripCard);
    } else {
      elements.homeTripsGrid.appendChild(card);
    }
  });
}

function renderExploreView() {
  // Dynamic Trip Reminder Banner Above HOT Guide
  const reminderEl = document.getElementById("exploreTripReminder");
  if (reminderEl) {
    const nextTrip = myTripsList.find(t => {
      if (!t.startDate) return false;
      const start = new Date(t.startDate);
      start.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      return (start - today) >= 0;
    });

    if (nextTrip) {
      const start = new Date(nextTrip.startDate);
      start.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      const diffTime = start - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let text = "";
      if (diffDays === 0) {
        text = `D-Day 여행준비는 다 끝나셨나요 ?`;
      } else {
        text = `D-${diffDays} 여행준비는 다 끝나셨나요 ?`;
      }
      
      const textEl = reminderEl.querySelector(".reminder-text");
      if (textEl) textEl.innerText = text;
      reminderEl.classList.remove("hidden");
    } else {
      reminderEl.classList.add("hidden");
    }
  }

  const cityCode = travelData.cityCode || "sapporo";
  const template = CITY_TEMPLATES[cityCode] || CITY_TEMPLATES.sapporo;
  const exp = template.explore;
  
  // 1. Welcome Subtitle
  const subEl = elements.mainExploreView.querySelector(".explore-welcome-subtitle");
  if (subEl) {
    subEl.innerText = exp.welcomeSubtitle;
  }
  
  // 2. Main Visual Banner
  const banner = elements.mainExploreView.querySelector(".explore-banner");
  if (banner) {
    const bannerTitle = banner.querySelector("h3");
    const bannerDesc = banner.querySelector("p");
    if (bannerTitle) bannerTitle.innerText = exp.bannerTitle;
    if (bannerDesc) bannerDesc.innerText = exp.bannerDesc;
    
    // Set banner cover background based on city using CSS classes
    banner.className = `explore-banner glass-card bg-${cityCode}`;
  }
  
  // 3. Recommended Cities Grid
  const citiesGrid = elements.mainExploreView.querySelector(".explore-cities-grid");
  if (citiesGrid) {
    citiesGrid.innerHTML = "";
    exp.cities.forEach(city => {
      const card = document.createElement("div");
      card.className = "city-explore-card glass-card";
      card.style.cursor = "pointer";
      card.style.textAlign = "center";
      card.style.padding = "16px";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.alignItems = "center";
      card.style.gap = "8px";
      
      card.innerHTML = `
        <div style="font-size: 2.2rem;">${city.emoji}</div>
        <h4 style="font-size: 0.92rem; font-weight: 800; margin: 0; color: var(--text-main);">${city.name}</h4>
        <span style="font-size: 0.7rem; color: var(--text-sub); font-weight: 600;">${city.desc}</span>
      `;
      
      // Toast on click
      card.addEventListener("click", () => {
        showToast(`🧭 '${city.name}' 가이드 서비스는 현재 삿포로/오타루 위주로 제공 중입니다!`, "info");
      });
      citiesGrid.appendChild(card);
    });
  }
  
  // 4. Partner Coupon & Deals
  const dealsHeader = Array.from(elements.mainExploreView.querySelectorAll("h3")).find(h => h.innerText.includes("여행 필수품"));
  if (dealsHeader) {
    const dealsContainer = dealsHeader.nextElementSibling;
    if (dealsContainer) {
      dealsContainer.innerHTML = "";
      exp.deals.forEach((deal, idx) => {
        const dCard = document.createElement("div");
        dCard.className = "deal-card glass-card";
        dCard.style.display = "flex";
        dCard.style.alignItems = "center";
        dCard.style.gap = "16px";
        dCard.style.padding = "14px 20px";
        dCard.style.textAlign = "left";
        dCard.style.cursor = "pointer";
        
        dCard.innerHTML = `
          <div style="font-size: 1.8rem; background: rgba(108, 92, 231, 0.08); padding: 8px; border-radius: 12px; line-height: 1;"><i class="${deal.emoji}" style="color: ${deal.color};"></i></div>
          <div>
            <h4 style="font-size: 0.92rem; font-weight: 800; margin: 0; color: var(--text-main);">${deal.title}</h4>
            <p style="font-size: 0.78rem; color: var(--text-sub); margin: 2px 0 0 0; font-weight: 600;">${deal.desc}</p>
          </div>
        `;
        
        dCard.addEventListener("click", () => {
          if (idx === 0) {
            showToast(`🛍️ 돈키호테 할인 쿠폰 페이지(제휴 링크)로 연결을 준비 중입니다!`, "success");
          } else {
            showToast(`🚌 JR 패스 구매 페이지(제휴 링크)로 연결을 준비 중입니다!`, "success");
          }
        });
        dealsContainer.appendChild(dCard);
      });
    }
  }
}

// Utility to verify and migrate food list structures to travelData
function ensureFoodListsExist() {
  if (!travelData) {
    travelData = JSON.parse(JSON.stringify(CITY_TEMPLATES.sapporo));
  }
  travelData.cityCode = travelData.cityCode || "sapporo";
  const template = CITY_TEMPLATES[travelData.cityCode] || CITY_TEMPLATES.sapporo;
  
  if (!travelData.days) {
    travelData.days = JSON.parse(JSON.stringify(template.days));
  }
  // Ensure individual days are defined
  const daysKeys = Object.keys(template.days);
  daysKeys.forEach(k => {
    if (!travelData.days[k]) {
      travelData.days[k] = [];
    }
  });
  
  if (!travelData.checklist) {
    travelData.checklist = JSON.parse(JSON.stringify(template.checklist));
  }
  if (!travelData.shoppingList) {
    travelData.shoppingList = JSON.parse(JSON.stringify(template.shoppingList || []));
  }
  
  // Bind appropriate food lists depending on cityCode
  if (travelData.cityCode === "sapporo") {
    if (!travelData.otaruFoodList) travelData.otaruFoodList = JSON.parse(JSON.stringify(OTARU_FOOD_LIST));
    if (!travelData.sapporoFoodList) travelData.sapporoFoodList = JSON.parse(JSON.stringify(SAPPORO_FOOD_LIST));
  } else if (travelData.cityCode === "tokyo") {
    if (!travelData.tokyoFoodList) travelData.tokyoFoodList = JSON.parse(JSON.stringify(TOKYO_FOOD_LIST));
  } else if (travelData.cityCode === "osaka") {
    if (!travelData.osakaFoodList) travelData.osakaFoodList = JSON.parse(JSON.stringify(OSAKA_FOOD_LIST));
  }
  
  if (!travelData.startDate) {
    travelData.startDate = template.startDate;
  }
  if (!travelData.endDate) {
    travelData.endDate = template.endDate;
  }
  if (!travelData.title) {
    travelData.title = template.title;
  }
  if (travelData.memberCount === undefined) {
    travelData.memberCount = template.memberCount;
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
function applyMapVisibilityState() {
  const mapEl = document.getElementById("map");
  const iconEl = elements.iconToggleMap;
  
  if (!mapEl || !iconEl) return;
  
  if (!isMapVisible) {
    mapEl.classList.add("collapsed");
    elements.tabContentDays.classList.add("map-hidden");
    iconEl.className = "ri-arrow-down-s-line";
  } else {
    mapEl.classList.remove("collapsed");
    elements.tabContentDays.classList.remove("map-hidden");
    iconEl.className = "ri-arrow-up-s-line";
  }
}

function renderApp() {
  updateDashboardStats();
  
  // 버전 표시 반영 (캐시 및 배포 여부 확인용)
  const footerTip = document.querySelector(".footer-tip");
  if (footerTip) {
    footerTip.innerHTML = `<i class="ri-lightbulb-line"></i> 일정을 수정하면 자동으로 저장됩니다. (버전: 4.8)`;
  }
  
  // Update Bottom Nav active state
  elements.bottomNavItems.forEach(item => {
    if (item.getAttribute("data-bottom-tab") === activeBottomTab) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // 1. Hide all main views first
  elements.mainExploreView.classList.add("hidden");
  elements.homeView.classList.add("hidden");
  elements.tripDetailView.classList.add("hidden");

  // 2. Hide all detailed tab contents in detail view to prevent overlapping
  elements.appNav.classList.add("hidden");
  elements.tabContentDays.classList.add("hidden");
  elements.tabContentDays.classList.remove("active");
  elements.tabContentExtra.classList.add("hidden");
  elements.tabContentExtra.classList.remove("active");
  elements.tabContentRecommendedSpots.classList.add("hidden");
  elements.tabContentRecommendedSpots.classList.remove("active");
  elements.tabContentShoppingList.classList.add("hidden");
  elements.tabContentShoppingList.classList.remove("active");

  // 3. Render according to currentView state
  if (currentView === "explore") {
    elements.mainExploreView.classList.remove("hidden");
    elements.bottomNav.classList.add("hidden");
    elements.appContainer.classList.remove("has-bottom-nav");
    renderExploreView();
    
  } else if (currentView === "myTrips") {
    elements.homeView.classList.remove("hidden");
    elements.bottomNav.classList.add("hidden");
    elements.appContainer.classList.remove("has-bottom-nav");
    
    // Bind Realtime stats to home dashboard card
    const ddayText = elements.txtDday.innerText;
    const homeDdayBadge = document.getElementById("homeDdayBadge");
    if (homeDdayBadge) {
      homeDdayBadge.innerText = ddayText;
    }

    const homeTripTitle = document.getElementById("homeTripTitle");
    if (homeTripTitle) {
      homeTripTitle.innerText = travelData.title || "삿포로 & 오타루";
    }

    const homeTripDates = document.getElementById("homeTripDates");
    if (homeTripDates) {
      homeTripDates.innerText = `${travelData.startDate} ~ ${travelData.endDate}`;
    }

    const homeTripMember = document.getElementById("homeTripMember");
    if (homeTripMember) {
      homeTripMember.innerText = `${travelData.memberCount || 2}명`;
    }

    const homeTripPlaces = document.getElementById("homeTripPlaces");
    if (homeTripPlaces) {
      let totalPlaces = 0;
      Object.keys(travelData.days).forEach(dayKey => {
        totalPlaces += (travelData.days[dayKey] || []).length;
      });
      homeTripPlaces.innerText = `${totalPlaces}곳 방문`;
    }

  } else if (currentView === "detail") {
    // Show detailed planner view
    elements.tripDetailView.classList.remove("hidden");
    elements.bottomNav.classList.remove("hidden");
    elements.appContainer.classList.add("has-bottom-nav");

    // Dynamic header info update
    if (travelData) {
      // 1. Emoji
      if (elements.appMainEmoji) {
        let cityEmoji = "❄️";
        if (travelData.cityCode === "tokyo") cityEmoji = "🗼";
        else if (travelData.cityCode === "osaka") cityEmoji = "🐙";
        elements.appMainEmoji.innerText = cityEmoji + "✈️";
      }
      
      // 2. Title
      if (elements.appMainTitle) {
        let cityName = "삿포로 & 오타루";
        if (travelData.cityCode === "tokyo") cityName = "도쿄 (Tokyo)";
        else if (travelData.cityCode === "osaka") cityName = "오사카 & 교토";
        elements.appMainTitle.innerText = cityName;
      }
      
      // 3. Subtitle (Nights & Days calculation)
      if (elements.appSubTitle) {
        const dayKeys = Object.keys(travelData.days || {});
        const totalDays = dayKeys.length;
        const nights = totalDays > 1 ? `${totalDays - 1}박 ${totalDays}일` : "당일 일정";
        let conceptText = "초여름의 낭만 여행";
        if (travelData.cityCode === "tokyo") conceptText = "도심 쇼핑 미식 여행";
        else if (travelData.cityCode === "osaka") conceptText = "먹다 지치는 역사 미식 여행";
        elements.appSubTitle.innerText = `${conceptText} · ${nights}`;
      }
      
      // 4. Trip period text
      if (elements.txtTripPeriod) {
        const formatPeriodDate = (dateStr) => {
          if (!dateStr) return "";
          const parts = dateStr.split("-");
          if (parts.length === 3) return `${parts[1]}.${parts[2]}`;
          return dateStr;
        };
        elements.txtTripPeriod.innerText = `${formatPeriodDate(travelData.startDate)} - ${formatPeriodDate(travelData.endDate)}`;
      }
    }

    if (activeBottomTab === "timeline") {
      // Ensure activeTab is one of the days
      const dayKeys = Object.keys(travelData.days || {});
      const sortedDayKeys = dayKeys.sort((a, b) => parseInt(a.replace("day", "")) - parseInt(b.replace("day", "")));
      
      if (!activeTab.startsWith("day") || !travelData.days[activeTab]) {
        activeTab = sortedDayKeys[0] || "day1";
      }

      // Render Day Tabs Dynamically
      if (elements.navTabs) {
        elements.navTabs.innerHTML = "";
        sortedDayKeys.forEach(dayKey => {
          const dayIndex = dayKey.replace("day", "");
          const dateStr = getDayDateString(dayIndex);
          const btn = document.createElement("button");
          btn.className = `nav-tab ${dayKey === activeTab ? 'active' : ''}`;
          btn.setAttribute("data-tab", dayKey);
          btn.setAttribute("role", "tab");
          btn.setAttribute("aria-selected", dayKey === activeTab ? "true" : "false");
          btn.id = `tabDay${dayIndex}`;
          
          btn.innerHTML = `
            <span class="tab-day">Day ${dayIndex}</span>
            <span class="tab-date">${dateStr}</span>
          `;
          
          btn.addEventListener("click", () => {
            activeTab = dayKey;
            renderApp();
            
            setTimeout(() => {
              if (leafletMap) {
                leafletMap.invalidateSize();
                updateInAppMap(dayKey);
              }
            }, 100);
          });
          
          elements.navTabs.appendChild(btn);
        });
        
        // Refresh reference for tabButtons so other functions use the updated elements
        elements.tabButtons = document.querySelectorAll(".nav-tab");
      }

      elements.tabContentDays.classList.remove("hidden");
      elements.tabContentDays.classList.add("active");
      elements.appNav.classList.remove("hidden");
      
      const dayIndex = activeTab.replace("day", "");
      const dateStr = getDayDateString(dayIndex);
      elements.timelineDayTitle.innerText = `Day ${dayIndex} 일정 (${dateStr})`;
      
      renderTimeline(activeTab);
      applyMapVisibilityState();

    } else if (activeBottomTab === "spots") {
      elements.tabContentRecommendedSpots.classList.remove("hidden");
      elements.tabContentRecommendedSpots.classList.add("active");
      
      // Update spots title dynamically
      if (elements.spotsTitle) {
        let cityTitle = "삿포로 & 오타루";
        if (travelData.cityCode === "tokyo") cityTitle = "도쿄 (Tokyo)";
        else if (travelData.cityCode === "osaka") cityTitle = "오사카 & 교토";
        elements.spotsTitle.innerText = `🗺️ ${cityTitle} 추천 스팟`;
      }
      
      // Reset region filter to "all" if the current filter is not compatible with the new city
      const compatibleRegions = (CITY_SUB_REGIONS[travelData.cityCode || "sapporo"] || []).map(r => r.value);
      if (!compatibleRegions.includes(currentCityFilter)) {
        currentCityFilter = "all";
      }
      
      renderCitySelector();
      renderSpotsFilters();
      renderSpotsList();

    } else if (activeBottomTab === "shopping") {
      elements.tabContentShoppingList.classList.remove("hidden");
      elements.tabContentShoppingList.classList.add("active");
      renderShoppingList();

    } else if (activeBottomTab === "extra") {
      elements.tabContentExtra.classList.remove("hidden");
      elements.tabContentExtra.classList.add("active");
      setExtraSubTab(activeExtraSubTab);
    }
  }

  applyEditorRights(); // Ensure permissions are applied strictly after all renders!
}

window.setExtraSubTab = function(subTab) {
  activeExtraSubTab = subTab;
  
  const btnChecklist = document.getElementById("btnSubChecklist");
  const btnSettlement = document.getElementById("btnSubSettlement");
  const btnEtc = document.getElementById("btnSubEtc");
  
  const wrapperChecklist = document.getElementById("wrapperChecklist");
  const wrapperSettlement = document.getElementById("wrapperSettlement");
  const wrapperEtc = document.getElementById("wrapperEtc");
  
  // Reset all active and visibility states
  if (btnChecklist) btnChecklist.classList.remove("active");
  if (btnSettlement) btnSettlement.classList.remove("active");
  if (btnEtc) btnEtc.classList.remove("active");
  
  if (wrapperChecklist) wrapperChecklist.classList.add("hidden");
  if (wrapperSettlement) wrapperSettlement.classList.add("hidden");
  if (wrapperEtc) wrapperEtc.classList.add("hidden");
  
  if (subTab === "checklist") {
    if (btnChecklist) btnChecklist.classList.add("active");
    if (wrapperChecklist) wrapperChecklist.classList.remove("hidden");
    renderChecklistTab();
  } else if (subTab === "settlement") {
    if (btnSettlement) btnSettlement.classList.add("active");
    if (wrapperSettlement) wrapperSettlement.classList.remove("hidden");
    renderSettlementTab();
  } else if (subTab === "etc") {
    if (btnEtc) btnEtc.classList.add("active");
    if (wrapperEtc) wrapperEtc.classList.remove("hidden");
  }
};

const CITY_SUB_REGIONS = {
  sapporo: [
    { value: "all", label: "🗺️ 전체보기" },
    { value: "sapporo", label: "🧭 삿포로 스팟" },
    { value: "otaru", label: "🌊 오타루 스팟" }
  ],
  tokyo: [
    { value: "all", label: "🗺️ 전체보기" },
    { value: "shinjuku", label: "🗼 도심 스팟" },
    { value: "asakusa", label: "⛩️ 아사쿠사" },
    { value: "maihama", label: "🎢 디즈니 리조트" },
    { value: "ginza", label: "🛍️ 긴자" }
  ],
  osaka: [
    { value: "all", label: "🗺️ 전체보기" },
    { value: "namba", label: "🐙 난바/우메다" },
    { value: "kyoto", label: "⛩️ 교토" },
    { value: "usj", label: "🎢 USJ" },
    { value: "castle", label: "🏯 오사카성" }
  ]
};

function renderCitySelector() {
  const container = document.getElementById("citySelectorContainer");
  if (!container) return;
  container.innerHTML = "";
  
  const cityCode = travelData.cityCode || "sapporo";
  const regions = CITY_SUB_REGIONS[cityCode] || CITY_SUB_REGIONS.sapporo;
  
  regions.forEach(r => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `filter-chip ${currentCityFilter === r.value ? "active" : ""}`;
    btn.innerText = r.label;
    btn.addEventListener("click", () => {
      currentCityFilter = r.value;
      renderCitySelector();
      renderSpotsList();
    });
    container.appendChild(btn);
  });
}

// Spot list navigation city filter chip toggle
window.setCityFilter = function(city) {
  currentCityFilter = city;
  renderCitySelector();
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
  const cityCode = travelData.cityCode || "sapporo";
  
  if (cityCode === "sapporo") {
    if (travelData.sapporoFoodList) {
      travelData.sapporoFoodList.forEach((item, index) => {
        mergedList.push({ ...item, city: item.city || "sapporo", originalIndex: index });
      });
    }
    if (travelData.otaruFoodList) {
      travelData.otaruFoodList.forEach((item, index) => {
        mergedList.push({ ...item, city: item.city || "otaru", originalIndex: index });
      });
    }
  } else if (cityCode === "tokyo") {
    if (travelData.tokyoFoodList) {
      travelData.tokyoFoodList.forEach((item, index) => {
        let subCity = "shinjuku";
        if (item.name.includes("아사쿠사") || item.name.includes("Senso-ji")) subCity = "asakusa";
        else if (item.name.includes("디즈니") || item.name.includes("마이하마")) subCity = "maihama";
        else if (item.name.includes("긴자")) subCity = "ginza";
        mergedList.push({ ...item, city: item.city || subCity, originalIndex: index });
      });
    }
  } else if (cityCode === "osaka") {
    if (travelData.osakaFoodList) {
      travelData.osakaFoodList.forEach((item, index) => {
        let subCity = "namba";
        if (item.name.includes("교토") || item.name.includes("청수사") || item.name.includes("Kiyomizu")) subCity = "kyoto";
        else if (item.name.includes("유니버설") || item.name.includes("USJ") || item.name.includes("Universal")) subCity = "usj";
        else if (item.name.includes("오사카성")) subCity = "castle";
        mergedList.push({ ...item, city: item.city || subCity, originalIndex: index });
      });
    }
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
  
  const cityLabelMap = {
    sapporo: "🧭 삿포로",
    otaru: "🌊 오타루",
    shinjuku: "🗼 신주쿠/시부야",
    asakusa: "⛩️ 아사쿠사",
    maihama: "🎢 디즈니 리조트",
    ginza: "🛍️ 긴자",
    namba: "🐙 난바/우메다",
    castle: "🏯 오사카성",
    kyoto: "⛩️ 교토",
    usj: "🎢 USJ"
  };
  
  mergedList.forEach((item) => {
    const catInfo = FOOD_CATEGORIES[item.category] || { label: item.category, icon: "ri-restaurant-fill" };
    const cityLabel = cityLabelMap[item.city] || "🗺️ 기타";
    
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
              <span class="badge" style="font-size: 0.72rem; padding: 3px 6px; background-color: ${item.city === 'otaru' || item.city === 'kyoto' || item.city === 'asakusa' ? 'var(--secondary)' : 'var(--primary)'}">${cityLabel}</span>
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

  // Set place day option tags dynamically
  setupPlaceDayOptions();

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
  if (!travelData || !travelData.startDate) return "";
  const startDateObj = new Date(travelData.startDate);
  if (isNaN(startDateObj.getTime())) return "";
  
  const targetDate = new Date(startDateObj.getTime() + (parseInt(dayIndex) - 1) * 24 * 60 * 60 * 1000);
  
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = daysOfWeek[targetDate.getDay()];
  
  return `${month}/${day} (${dayName})`;
}

function setupPlaceDayOptions() {
  const selectDayEl = elements.placeDay;
  if (!selectDayEl) return;
  selectDayEl.innerHTML = "";
  
  const dayKeys = Object.keys(travelData.days || {});
  const sortedDayKeys = dayKeys.sort((a, b) => parseInt(a.replace("day", "")) - parseInt(b.replace("day", "")));
  
  sortedDayKeys.forEach(dayKey => {
    const dayIndex = dayKey.replace("day", "");
    const dateStr = getDayDateString(dayIndex);
    const opt = document.createElement("option");
    opt.value = dayKey;
    opt.innerText = `Day ${dayIndex} (${dateStr})`;
    selectDayEl.appendChild(opt);
  });
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
              <span class="currency-${(item.currency || "JPY").toLowerCase()}">${displayCostPerPerson}</span>
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
  
  // Set place day option tags dynamically
  setupPlaceDayOptions();
  
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
      
      // If upper tab is clicked, make sure bottom nav syncs to timeline
      if (activeTab.startsWith("day")) {
        activeBottomTab = "timeline";
      }
      
      renderApp();
    });
  });

  // Open Modal (Add Place)
  const handleOpenAddModal = () => {
    elements.modalTitle.innerText = "방문 장소 추가";
    elements.editItemIndex.value = "";
    elements.formPlace.reset();
    
    // Set place day option tags dynamically
    setupPlaceDayOptions();
    
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

  // 1단계 -> 2단계: 메인 "내 일정" 버튼 클릭 시
  if (elements.btnGoToMyTrips) {
    elements.btnGoToMyTrips.addEventListener("click", () => {
      currentView = "myTrips";
      renderApp();
    });
  }

  // 2단계 -> 1단계: 나의 여행 목록 "홈으로" 버튼 클릭 시
  if (elements.btnBackToExplore) {
    elements.btnBackToExplore.addEventListener("click", () => {
      currentView = "explore";
      renderApp();
    });
  }

  // Bottom Navigation Switching
  elements.bottomNavItems.forEach(item => {
    item.addEventListener("click", () => {
      const tab = item.getAttribute("data-bottom-tab");
      
      if (tab === "home") {
        currentView = "myTrips";
      } else {
        activeBottomTab = tab;
      }
      
      // If switching to timeline, make sure activeTab is one of the days
      if (tab === "timeline" && !activeTab.startsWith("day")) {
        activeTab = "day1";
        // Sync top tab visual active class
        elements.tabButtons.forEach(btn => {
          if (btn.getAttribute("data-tab") === "day1") {
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");
          } else {
            btn.classList.remove("active");
            btn.setAttribute("aria-selected", "false");
          }
        });
      }
      
      renderApp();
      
      // If switching to timeline and map is visible, recalculate map size
      if (tab === "timeline" && isMapVisible && leafletMap) {
        setTimeout(() => {
          leafletMap.invalidateSize();
          updateInAppMap(activeTab);
        }, 100);
      }
    });
  });

  // Home Dashboard Card Clicks
  const btnTripSapporo = document.getElementById("btnTripSapporo");
  if (btnTripSapporo) {
    btnTripSapporo.addEventListener("click", () => {
      currentView = "detail";
      activeBottomTab = "timeline";
      activeTab = "day1";
      // Sync top tab active class
      elements.tabButtons.forEach(btn => {
        if (btn.getAttribute("data-tab") === "day1") {
          btn.classList.add("active");
          btn.setAttribute("aria-selected", "true");
        } else {
          btn.classList.remove("active");
          btn.setAttribute("aria-selected", "false");
        }
      });
      renderApp();
      
      // Auto-refresh map
      if (isMapVisible && leafletMap) {
        setTimeout(() => {
          leafletMap.invalidateSize();
          updateInAppMap(activeTab);
        }, 100);
      }
    });
  }

  // Open City Select Modal & Reset steps
  const btnCreateNewTrip = document.getElementById("btnCreateNewTrip");
  if (btnCreateNewTrip && elements.modalCitySelect) {
    btnCreateNewTrip.addEventListener("click", () => {
      if (myTripsList.length >= 3) {
        showToast("⚠️ 여행 계획은 최대 3개까지만 생성할 수 있습니다. 기존 일정을 삭제하고 진행해 주세요.", "error");
        return;
      }
      if (elements.cityModalTitle) elements.cityModalTitle.innerText = "어디로 여행을 떠나시나요? ✈️";
      if (elements.citySelectStep1) elements.citySelectStep1.classList.remove("hidden");
      if (elements.citySelectStep2) elements.citySelectStep2.classList.add("hidden");
      if (elements.inputTripStartDate) elements.inputTripStartDate.value = "";
      if (elements.inputTripEndDate) elements.inputTripEndDate.value = "";
      elements.modalCitySelect.classList.remove("hidden");
    });
  }

  // Don Quijote Coupon Banner Click inside Shopping Tab
  const btnShoppingDonkiCoupon = document.getElementById("btnShoppingDonkiCoupon");
  if (btnShoppingDonkiCoupon) {
    btnShoppingDonkiCoupon.addEventListener("click", () => {
      showToast(`🛍️ 돈키호테 할인 쿠폰 페이지(제휴 링크)로 연결을 준비 중입니다!`, "success");
    });
  }

  // Close City Select Modal
  if (elements.btnCityModalClose) {
    elements.btnCityModalClose.addEventListener("click", () => {
      elements.modalCitySelect.classList.add("hidden");
    });
  }
  if (elements.btnCityModalCancel) {
    elements.btnCityModalCancel.addEventListener("click", () => {
      elements.modalCitySelect.classList.add("hidden");
    });
  }

  // Handle City Card Click (Switch to Step 2: Date Selection Form)
  document.querySelectorAll(".city-select-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedCityCode = card.getAttribute("data-city");
      const template = CITY_TEMPLATES[selectedCityCode];
      if (!template) return;
      
      let cityEmoji = "❄️";
      let cityName = "삿포로 & 오타루";
      if (selectedCityCode === "tokyo") {
        cityEmoji = "🗼";
        cityName = "도쿄 (Tokyo)";
      } else if (selectedCityCode === "osaka") {
        cityEmoji = "🐙";
        cityName = "오사카 & 교토";
      }
      
      if (elements.selectedCityEmoji) elements.selectedCityEmoji.innerText = cityEmoji;
      if (elements.selectedCityName) elements.selectedCityName.innerText = cityName;
      
      // Set input min date constraint to today
      const todayStr = new Date().toISOString().split("T")[0];
      if (elements.inputTripStartDate) {
        elements.inputTripStartDate.min = todayStr;
        elements.inputTripStartDate.value = todayStr;
      }
      if (elements.inputTripEndDate) {
        elements.inputTripEndDate.min = todayStr;
        elements.inputTripEndDate.value = todayStr;
      }
      
      // Switch Steps
      if (elements.cityModalTitle) elements.cityModalTitle.innerText = "여행 일정을 정해볼까요? 🗓️";
      if (elements.citySelectStep1) elements.citySelectStep1.classList.add("hidden");
      if (elements.citySelectStep2) elements.citySelectStep2.classList.remove("hidden");
    });
  });

  // Handle Date Modal "Back to Step 1" Button
  if (elements.btnDateSelectBack) {
    elements.btnDateSelectBack.addEventListener("click", () => {
      if (elements.cityModalTitle) elements.cityModalTitle.innerText = "어디로 여행을 떠나시나요? ✈️";
      if (elements.citySelectStep1) elements.citySelectStep1.classList.remove("hidden");
      if (elements.citySelectStep2) elements.citySelectStep2.classList.add("hidden");
    });
  }

  // Handle Create Trip Submit (Generate Dynamic Duration Days & Create room)
  if (elements.btnCreateTripSubmit) {
    elements.btnCreateTripSubmit.addEventListener("click", () => {
      if (myTripsList.length >= 3) {
        showToast("⚠️ 여행 계획은 최대 3개까지만 생성할 수 있습니다. 기존 일정을 삭제하고 진행해 주세요.", "error");
        return;
      }
      const startDateVal = elements.inputTripStartDate.value;
      const endDateVal = elements.inputTripEndDate.value;
      
      if (!startDateVal || !endDateVal) {
        showToast("⚠️ 출발일과 도착일을 모두 입력해 주세요.", "error");
        return;
      }
      
      const start = new Date(startDateVal);
      const end = new Date(endDateVal);
      
      if (end < start) {
        showToast("⚠️ 도착일은 출발일보다 빠를 수 없습니다.", "error");
        return;
      }
      
      // Calculate N days duration
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > 30) {
        showToast("⚠️ 최대 30일 이하의 일정만 생성할 수 있습니다.", "error");
        return;
      }
      
      // Hide Modal
      elements.modalCitySelect.classList.add("hidden");
      
      // Trigger Splash Overlay
      const splash = document.getElementById("splashIntro");
      const splashGif = document.getElementById("splashGif");
      if (splash && splashGif) {
        splash.style.display = "flex";
        splash.style.opacity = "1";
        splash.style.transform = "translateY(0)";
        splash.style.pointerEvents = "auto";
        splashGif.src = "walking_summer.gif?t=" + Date.now();
      }
      
      // Create new Room in Firestore
      const newRoomParam = "sapo-" + Math.random().toString(36).substring(2, 8);
      const template = CITY_TEMPLATES[selectedCityCode];
      
      // Clone Template Data
      const newTripData = JSON.parse(JSON.stringify(template));
      newTripData.title = `${template.title.replace(" 여행 ✈️", "")} (새 계획)`;
      newTripData.startDate = startDateVal;
      newTripData.endDate = endDateVal;
      newTripData.memberCount = 2;
      
      // Re-distribute days dynamic algorithm
      const templateDays = Object.keys(template.days).length;
      const newDays = {};
      
      for (let i = 1; i <= diffDays; i++) {
        newDays[`day${i}`] = [];
      }
      
      if (diffDays >= templateDays) {
        // Expand days: copy templates and fill remaining days with empty array
        for (let i = 1; i <= diffDays; i++) {
          if (i <= templateDays) {
            newDays[`day${i}`] = JSON.parse(JSON.stringify(template.days[`day${i}`] || []));
          } else {
            newDays[`day${i}`] = [];
          }
        }
      } else {
        // Compress days: merge remaining days into the last day (diffDays)
        for (let i = 1; i <= templateDays; i++) {
          const items = JSON.parse(JSON.stringify(template.days[`day${i}`] || []));
          if (i < diffDays) {
            newDays[`day${i}`] = items;
          } else {
            newDays[`day${diffDays}`] = newDays[`day${diffDays}`].concat(items);
          }
        }
      }
      
      // Normalize ids to prevent duplicate item keys
      let currentId = 1;
      for (let i = 1; i <= diffDays; i++) {
        newDays[`day${i}`].forEach(item => {
          item.id = currentId++;
        });
      }
      
      newTripData.days = newDays;
      
      // Register in local owned lists
      let ownedRooms = [];
      try {
        ownedRooms = JSON.parse(localStorage.getItem("sapo_owned_rooms") || "[]");
      } catch(e) {}
      ownedRooms.push(newRoomParam);
      localStorage.setItem("sapo_owned_rooms", JSON.stringify(ownedRooms));
      
      // Switch active room
      roomId = newRoomParam;
      isEditor = true;
      travelData = newTripData;
      ensureFoodListsExist();
      
      // Register in local myTripsList
      myTripsList.unshift({
        id: roomId,
        title: travelData.title,
        cityCode: travelData.cityCode,
        startDate: travelData.startDate,
        endDate: travelData.endDate,
        memberCount: travelData.memberCount
      });
      localStorage.setItem("sapo_trips_list", JSON.stringify(myTripsList));
      
      // Sync to Firestore
      setDoc(doc(db, "rooms", roomId), travelData).then(() => {
        let cityEmoji = "❄️";
        if (selectedCityCode === "tokyo") cityEmoji = "🗼";
        else if (selectedCityCode === "osaka") cityEmoji = "🐙";
        
        // Change URL and Sync
        const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        window.history.replaceState({}, document.title, newUrl);
        
        startFirestoreSync();
        
        // 3초간 웰컴 로딩 화면 노출 후 상세 뷰로 전환
        setTimeout(() => {
          showToast(`${cityEmoji} 새로운 여행 계획 방이 성공적으로 개설되었습니다!`, "success");
          currentView = "detail";
          activeBottomTab = "timeline";
          activeTab = "day1";
          renderApp();
          calculateDday();
          
          // Fade out splash
          const splash = document.getElementById("splashIntro");
          if (splash) {
            splash.style.opacity = "0";
            splash.style.transform = "translateY(-30px)";
            splash.style.pointerEvents = "none";
            setTimeout(() => {
              splash.style.display = "none";
            }, 800);
          }
        }, 3000);
      }).catch(err => {
        console.error("New trip creation setDoc failed:", err);
        showToast("⚠️ 일정 생성 과정에서 오류가 발생했습니다.", "error");
        const splash = document.getElementById("splashIntro");
        if (splash) {
          splash.style.display = "none";
        }
      });
    });
  }

  // Handle Trip Edit Submit (Dynamic Date Scale & Update Local/Firestore)
  if (elements.formTripEdit) {
    elements.formTripEdit.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const id = elements.inputEditTripId.value;
      const titleVal = elements.inputEditTripTitle.value.trim();
      const startDateVal = elements.inputEditTripStartDate.value;
      const endDateVal = elements.inputEditTripEndDate.value;
      const memberCountVal = parseInt(elements.inputEditTripMember.value) || 2;
      
      if (!titleVal || !startDateVal || !endDateVal) {
        showToast("⚠️ 모든 입력 항목을 작성해 주세요.", "error");
        return;
      }
      
      const start = new Date(startDateVal);
      const end = new Date(endDateVal);
      
      if (end < start) {
        showToast("⚠️ 도착일은 출발일보다 빠를 수 없습니다.", "error");
        return;
      }
      
      // Calculate N days duration
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > 30) {
        showToast("⚠️ 최대 30일 이하의 일정만 수정 가능합니다.", "error");
        return;
      }
      
      // Hide modal
      elements.modalTripEdit.classList.add("hidden");
      showToast("⏳ 일정 변경사항을 동기화하고 있습니다...", "info");
      
      try {
        // Fetch current room doc to get current days state
        const docRef = doc(db, "rooms", id);
        const roomSnap = await getDoc(docRef);
        if (!roomSnap.exists()) {
          showToast("⚠️ 수정할 수 없는 일정입니다.", "error");
          return;
        }
        
        const currentData = roomSnap.data();
        
        // Re-scale days dynamic algorithm based on currentData.days
        const currentDays = currentData.days || {};
        const currentDaysCount = Object.keys(currentDays).length;
        const newDays = {};
        
        for (let i = 1; i <= diffDays; i++) {
          newDays[`day${i}`] = [];
        }
        
        if (diffDays >= currentDaysCount) {
          // Expand days
          for (let i = 1; i <= diffDays; i++) {
            if (i <= currentDaysCount) {
              newDays[`day${i}`] = JSON.parse(JSON.stringify(currentDays[`day${i}`] || []));
            } else {
              newDays[`day${i}`] = [];
            }
          }
        } else {
          // Compress days: merge overflowed days into the last day (diffDays)
          for (let i = 1; i <= currentDaysCount; i++) {
            const items = JSON.parse(JSON.stringify(currentDays[`day${i}`] || []));
            if (i < diffDays) {
              newDays[`day${i}`] = items;
            } else {
              newDays[`day${diffDays}`] = newDays[`day${diffDays}`].concat(items);
            }
          }
        }
        
        // Normalize ids to prevent duplicate item keys
        let currentId = 1;
        for (let i = 1; i <= diffDays; i++) {
          newDays[`day${i}`].forEach(item => {
            item.id = currentId++;
          });
        }
        
        // Update document object
        currentData.title = titleVal;
        currentData.startDate = startDateVal;
        currentData.endDate = endDateVal;
        currentData.memberCount = memberCountVal;
        currentData.days = newDays;
        
        // Sync to Firestore
        await setDoc(docRef, currentData);
        
        // Sync cache to local myTripsList
        const localIdx = myTripsList.findIndex(t => t.id === id);
        if (localIdx !== -1) {
          myTripsList[localIdx].title = titleVal;
          myTripsList[localIdx].startDate = startDateVal;
          myTripsList[localIdx].endDate = endDateVal;
          myTripsList[localIdx].memberCount = memberCountVal;
          localStorage.setItem("sapo_trips_list", JSON.stringify(myTripsList));
        }
        
        // If this edited trip is the currently active trip, sync local state
        if (id === roomId) {
          travelData = currentData;
          ensureFoodListsExist();
          calculateDday();
          renderApp();
        }
        
        renderHomeTripsGrid();
        showToast("✏️ 일정이 성공적으로 수정되었습니다!", "success");
      } catch(err) {
        console.error("Update trip failed:", err);
        showToast("⚠️ 일정 수정 중 오류가 발생했습니다.", "error");
      }
    });
  }
  
  // Close / Cancel edit modal
  if (elements.btnTripEditClose) {
    elements.btnTripEditClose.addEventListener("click", () => {
      elements.modalTripEdit.classList.add("hidden");
    });
  }
  if (elements.btnTripEditCancel) {
    elements.btnTripEditCancel.addEventListener("click", () => {
      elements.modalTripEdit.classList.add("hidden");
    });
  }

  // Explore View City Cards Clicks (Toast demo)
  document.querySelectorAll(".city-explore-card").forEach(card => {
    card.addEventListener("click", () => {
      const cityName = card.querySelector("h4").innerText;
      showToast(`🧭 '${cityName}' 가이드 서비스는 현재 삿포로/오타루 위주로 제공 중입니다!`, "info");
    });
  });

  // Explore View Affiliate Deal Cards Clicks
  document.querySelectorAll(".deal-card").forEach((card, idx) => {
    card.addEventListener("click", () => {
      if (idx === 0) {
        showToast(`🛍️ 돈키호테 할인 쿠폰 페이지(제휴 링크)로 연결을 준비 중입니다!`, "success");
      } else {
        showToast(`🚌 JR 홋카이도 레일패스 구매 페이지(제휴 링크)로 연결을 준비 중입니다!`, "success");
      }
    });
  });

  // Toggle Map Accordion via Arrow Icon
  if (elements.btnToggleMap) {
    elements.btnToggleMap.addEventListener("click", () => {
      isMapVisible = !isMapVisible;
      localStorage.setItem("sapo_map_visible", isMapVisible ? "true" : "false");
      applyMapVisibilityState();
      
      if (isMapVisible) {
        // Wait for CSS transition height to finish, then invalidate leaflet map size
        setTimeout(() => {
          if (leafletMap) {
            leafletMap.invalidateSize();
            // Re-render map path sequentially based on active day
            if (activeTab.startsWith("day")) {
              updateInAppMap(activeTab);
            }
          }
        }, 300); // 300ms matches style.css animation time
      }
    });
  }

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
  if (typeof L === 'undefined') {
    console.warn("Leaflet Map library is not loaded. Skipping map update.");
    return;
  }
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  const items = travelData.days[dayKey] || [];
  const template = CITY_TEMPLATES[travelData.cityCode || "sapporo"] || CITY_TEMPLATES.sapporo;
  const center = template.mapCenter || [43.0686, 141.3508];
  const zoom = template.mapZoom || 10;

  // 1. Initialize map if not already done
  if (!leafletMap) {
    try {
      leafletMap = L.map('map', {
        zoomControl: false,
        attributionControl: false
      }).setView(center, zoom);
      
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
    // Zoom back to general city view if no mappable items
    leafletMap.setView(center, zoom);
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
    
    // Fallback Safeguard: If geocoding failed, generate a sequential offset near city center so it ALWAYS displays!
    if (!finalCoords) {
      finalCoords = [center[0] - 0.006 + (idx * 0.003), center[1] - 0.006 + (idx * 0.003)];
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
  // 1. 등록된 일정이 하나라도 있는지 확인
  let hasAnyItem = false;
  Object.keys(travelData.days).forEach(dayKey => {
    if (travelData.days[dayKey] && travelData.days[dayKey].length > 0) {
      hasAnyItem = true;
    }
  });

  if (!hasAnyItem) {
    showToast("캡처할 일정이 없습니다! 장소를 먼저 추가해 주세요.", "error");
    return;
  }
  
  showToast("📄 전 일정 통합 PDF를 생성하고 있습니다. 잠시만 기다려 주세요...", "info");
  
  // 2. 가상 PDF 문서용 보이지 않는 절대위치(absolute) 래퍼 컨테이너 생성
  // 가로폭을 720px로 명시적으로 지정하여 A4 인쇄 가로 영역(마진 제외 약 720px)에 완벽히 정렬되도록 합니다.
  const wrapper = document.createElement("div");
  wrapper.id = "pdf-export-wrapper";
  wrapper.style.position = "absolute";
  wrapper.style.left = "0";
  wrapper.style.top = "0";
  wrapper.style.width = "720px";
  wrapper.style.height = "0";
  wrapper.style.overflow = "hidden";
  wrapper.style.zIndex = "-99999";
  
  const pdfContainer = document.createElement("div");
  pdfContainer.className = "pdf-export-container";
  
  // 3. 인쇄용 깔끔한 스타일 정의
  pdfContainer.style.fontFamily = "'Outfit', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif";
  pdfContainer.style.color = "#2c3e50";
  pdfContainer.style.background = "#ffffff";
  pdfContainer.style.width = "720px"; // A4 가로폭 해상도 최적화
  pdfContainer.style.padding = "40px";
  pdfContainer.style.boxSizing = "border-box";
  pdfContainer.style.display = "block";
  
  // 4. 인쇄용 스타일 재정의 및 헤더 추가 (여행 제목 & 기본 정보)
  const tripTitle = travelData.title || "삿포로 & 오타루 초여름 여행 ✈️";
  const tripDates = `${travelData.startDate} ~ ${travelData.endDate}`;
  const memberText = `${travelData.memberCount || 2}명`;
  
  let styleHtml = `
    <style>
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        width: 720px !important;
      }
      .pdf-export-container {
        margin: 0 auto !important;
        width: 720px !important;
        box-sizing: border-box !important;
        background: #ffffff !important;
      }
      * {
        box-shadow: none !important;
        text-shadow: none !important;
      }
    </style>
  `;
  
  let headerHtml = `
    <div style="border-bottom: 3px solid #6c5ce7; padding-bottom: 16px; margin-bottom: 24px; text-align: center; width: 100%;">
      <h1 style="font-size: 1.8rem; font-weight: 800; color: #2c3e50; margin: 0 0 8px 0; letter-spacing: -0.5px; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">✈️ ${escapeHTML(tripTitle)}</h1>
      <p style="font-size: 0.95rem; color: #7f8c8d; font-weight: 600; margin: 0; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">여행 기간: ${tripDates} | 여행 인원: ${memberText}</p>
    </div>
  `;
  pdfContainer.innerHTML = styleHtml + headerHtml;
  
  // 5. 일차별 루프 (Day 1 ~ Day 4)
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
  
  const dayKeys = Object.keys(travelData.days || {}).sort((a, b) => parseInt(a.replace("day", "")) - parseInt(b.replace("day", "")));
  
  dayKeys.forEach(dayKey => {
    const items = travelData.days[dayKey] || [];
    if (items.length === 0) return;
    
    const dayIndex = dayKey.replace("day", "");
    const dateStr = getDayDateString(dayIndex);
    
    // 일차별 타이틀 헤더 추가
    let dayHeaderHtml = `
      <div style="margin-top: 28px; margin-bottom: 14px; border-bottom: 1.5px solid rgba(108, 92, 231, 0.25); padding-bottom: 6px; text-align: left; width: 100%;">
        <h2 style="font-size: 1.25rem; font-weight: 800; color: #6c5ce7; margin: 0; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">Day ${dayIndex} <span style="font-size: 0.9rem; font-weight: 600; color: #7f8c8d; margin-left: 6px;">(${dateStr})</span></h2>
      </div>
    `;
    pdfContainer.innerHTML += dayHeaderHtml;
    
    // 시간 순으로 정렬
    const sortedItems = [...items].sort((a, b) => a.time.localeCompare(b.time));
    
    // 일정 카드 루프 추가 (html2canvas Flexbox collapse 버그를 방지하기 위해 100% 호환되는 Table 레이아웃 사용)
    sortedItems.forEach((item, index) => {
      const catLabel = categoryLabels[item.category] || "기타";
      
      const costText = item.cost > 0 
        ? (item.currency === "JPY" ? `¥ ${formatNumber(item.cost)} (1인)` : `₩ ${formatNumber(item.cost)} (1인)`)
        : "비용 없음/무료";
        
      let itemHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; background: #fdfdfd; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.01); page-break-inside: avoid; box-sizing: border-box;">
          <tr>
            <!-- 시간 & 분류 버블 (고정폭) -->
            <td style="width: 62px; padding: 12px; vertical-align: top;">
              <div style="width: 62px; background: rgba(108, 92, 231, 0.08); border-radius: 8px; padding: 6px 4px; text-align: center; box-sizing: border-box;">
                <span style="font-size: 0.75rem; font-weight: 800; color: #6c5ce7; line-height: 1.2; display: block; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">${item.time}</span>
                <span style="font-size: 0.62rem; color: #7f8c8d; font-weight: 700; margin-top: 2px; display: block; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">${catLabel}</span>
              </div>
            </td>
            
            <!-- 상세 내용 (남은 공간 모두 차지) -->
            <td style="padding: 12px 16px 12px 6px; vertical-align: top; text-align: left;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: left; vertical-align: top;">
                    <h3 style="font-size: 1rem; font-weight: 700; color: #2c3e50; margin: 0; padding: 0; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">${escapeHTML(item.name)}</h3>
                  </td>
                  <td style="text-align: right; vertical-align: top; width: 140px; padding-left: 10px;">
                    <span style="font-size: 0.78rem; color: #2ecc71; font-weight: 700; white-space: nowrap; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">${costText}</span>
                  </td>
                </tr>
                ${item.memo ? `
                <tr>
                  <td colspan="2" style="padding-top: 6px;">
                    <p style="font-size: 0.8rem; color: #7f8c8d; margin: 0; white-space: pre-line; background: rgba(0,0,0,0.01); padding: 6px 10px; border-radius: 6px; border-left: 3px solid rgba(108, 92, 231, 0.4); line-height: 1.4; text-align: left; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">${escapeHTML(item.memo)}</p>
                  </td>
                </tr>
                ` : ""}
              </table>
            </td>
          </tr>
        </table>
      `;
      pdfContainer.innerHTML += itemHtml;
    });
  });

  // 6. 가상 노드를 body에 임시 삽입
  wrapper.appendChild(pdfContainer);
  document.body.appendChild(wrapper);
  
  // 7. 모바일 렌더링 성능 고려 300ms 대기 후 PDF 생성 트리거
  setTimeout(() => {
    if (typeof html2pdf === 'undefined') {
      showToast("PDF 생성 라이브러리가 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.", "error");
      document.body.removeChild(wrapper);
      return;
    }

    const fileName = "sapo_travel_full_schedule.pdf";
    
    const options = {
      margin: [10, 10, 20, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: 720,        // html2canvas가 렌더링할 가상 가로폭 강제 지정 (모바일 뷰포트 잘림 해결)
        windowWidth: 720  // 모바일 기기 너비가 아닌 720px를 브라우저 너비로 인식하여 렌더링하게 함
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css'] }
    };
    
    // 8. PDF 생성 및 저장
    html2pdf().from(pdfContainer).set(options).save().then(() => {
      // 9. 완료 후 가상 요소 안전하게 제거
      document.body.removeChild(wrapper);
      showToast("🎉 전 일정 PDF 저장이 완료되었습니다!", "success");
    }).catch(err => {
      console.error("PDF 생성 실패:", err);
      if (document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }
      showToast("PDF 생성 중 오류가 발생했습니다.", "error");
    });
  }, 300);
};

// ==========================================
// 14. BUDGET & SETTLEMENT PDF REPORT SYSTEM
// ==========================================
window.exportBudgetToPDF = function() {
  // 1. 등록된 일정 또는 체크된 쇼핑이 하나라도 있는지 확인
  let hasAnyDayItem = false;
  Object.keys(travelData.days).forEach(dayKey => {
    if (travelData.days[dayKey] && travelData.days[dayKey].length > 0) {
      hasAnyDayItem = true;
    }
  });

  const shoppingList = travelData.shoppingList || [];
  const hasAnyShoppingItem = shoppingList.some(item => item.checked);

  if (!hasAnyDayItem && !hasAnyShoppingItem) {
    showToast("정산할 일정 정보가 없습니다. 장소나 쇼핑 항목을 추가해 주세요.", "error");
    return;
  }

  showToast("📄 예산 및 정산 보고서 PDF를 생성하고 있습니다...", "info");

  // 2. 가상 PDF 문서용 절대위치 래퍼 컨테이너 생성
  const wrapper = document.createElement("div");
  wrapper.id = "pdf-budget-export-wrapper";
  wrapper.style.position = "absolute";
  wrapper.style.left = "0";
  wrapper.style.top = "0";
  wrapper.style.width = "720px";
  wrapper.style.height = "0";
  wrapper.style.overflow = "hidden";
  wrapper.style.zIndex = "-99999";

  const pdfContainer = document.createElement("div");
  pdfContainer.className = "pdf-export-container";

  // 3. 스타일 및 헤더 세팅
  pdfContainer.style.fontFamily = "'Outfit', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif";
  pdfContainer.style.color = "#2c3e50";
  pdfContainer.style.background = "#ffffff";
  pdfContainer.style.width = "720px";
  pdfContainer.style.padding = "40px";
  pdfContainer.style.boxSizing = "border-box";
  pdfContainer.style.display = "block";

  const tripTitle = travelData.title || "삿포로 & 오타루 초여름 여행 ✈️";
  const mCount = parseInt(travelData.memberCount) || 2;

  let styleHtml = `
    <style>
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        width: 720px !important;
      }
      .pdf-export-container {
        margin: 0 auto !important;
        width: 720px !important;
        box-sizing: border-box !important;
        background: #ffffff !important;
      }
      * {
        box-shadow: none !important;
        text-shadow: none !important;
      }
    </style>
  `;

  let headerHtml = `
    <div style="border-bottom: 3px solid #2ecc71; padding-bottom: 16px; margin-bottom: 24px; text-align: center; width: 100%;">
      <h1 style="font-size: 1.8rem; font-weight: 800; color: #2c3e50; margin: 0 0 8px 0; letter-spacing: -0.5px; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">💰 여행 예산 & 정산 보고서</h1>
      <p style="font-size: 0.95rem; color: #7f8c8d; font-weight: 600; margin: 0; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">여행 계획: ${escapeHTML(tripTitle)} | 인원: ${mCount}명</p>
    </div>
  `;
  pdfContainer.innerHTML = styleHtml + headerHtml;

  // 4. 예산 및 지출 집계 연산
  let jointCostKRW = 0;          // N분의 1할 공동 지출 합계
  let personalShoppingCostKRW = 0; // 정산 제외할 개인 쇼핑 합계

  const catCosts = { flight: 0, meal: 0, cafe: 0, sightseeing: 0, shopping: 0, lodging: 0, transport: 0, etc: 0 };
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

  const jointDetailedList = [];
  const personalShoppingList = [];

  // A. 공동 일정 지출 집계
  const dayKeys = Object.keys(travelData.days || {}).sort((a, b) => parseInt(a.replace("day", "")) - parseInt(b.replace("day", "")));
  dayKeys.forEach(dayKey => {
    const items = travelData.days[dayKey] || [];
    const dayIndex = dayKey.replace("day", "");
    const sortedItems = [...items].sort((a, b) => a.time.localeCompare(b.time));

    sortedItems.forEach(item => {
      if (item.cost > 0) {
        const totalItemCost = item.cost * mCount;
        const krwVal = getCostInKRW(totalItemCost, item.currency);
        jointCostKRW += krwVal;

        if (catCosts.hasOwnProperty(item.category)) {
          catCosts[item.category] += krwVal;
        } else {
          catCosts.etc += krwVal;
        }

        const costString = item.currency === "JPY" ? `¥ ${formatNumber(item.cost)}` : `₩ ${formatNumber(item.cost)}`;

        jointDetailedList.push({
          name: item.name,
          categoryName: `Day ${dayIndex} - ${categoryLabels[item.category] || "기타"}`,
          costPerUnit: costString,
          qtyText: `${mCount}명`,
          totalKRW: krwVal
        });
      }
    });
  });

  // B. 개인 쇼핑 지출 집계
  shoppingList.forEach(item => {
    if (item.checked && item.cost > 0) {
      const itemQty = parseInt(item.qty) || 1;
      const totalItemCost = item.cost * itemQty;
      const krwVal = getCostInKRW(totalItemCost, item.currency);
      personalShoppingCostKRW += krwVal;

      // 쇼핑 카테고리 누적
      catCosts.shopping += krwVal;

      const costString = item.currency === "JPY" ? `¥ ${formatNumber(item.cost)}` : `₩ ${formatNumber(item.cost)}`;

      personalShoppingList.push({
        name: item.name,
        categoryName: "개인 쇼핑",
        costPerUnit: costString,
        qtyText: `${itemQty}개`,
        totalKRW: krwVal
      });
    }
  });

  const costPerMember = Math.round(jointCostKRW / mCount);

  // 5. 마크업 조립
  let budgetHtml = `
    <!-- 1. 정산 요약 구역 (공동 경비 vs 개인 소비) -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; box-sizing: border-box;">
      <tr>
        <!-- 공동 경비 요약 -->
        <td style="width: 60%; padding-right: 15px; vertical-align: top;">
          <div style="background: #fafdfb; border: 1.5px solid rgba(46, 204, 113, 0.25); border-radius: 12px; padding: 18px; box-sizing: border-box; text-align: left; height: 100%;">
            <h3 style="margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 800; color: #27ae60; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">👥 공동 경비 정산 요약</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="height: 28px;">
                <td style="font-size: 0.8rem; color: #7f8c8d; font-weight: 600;">총 공동 지출액</td>
                <td style="font-size: 1rem; color: #2c3e50; font-weight: 800; text-align: right;">${formatNumber(jointCostKRW)}원</td>
              </tr>
              <tr style="height: 28px;">
                <td style="font-size: 0.8rem; color: #7f8c8d; font-weight: 600;">정산 인원</td>
                <td style="font-size: 1rem; color: #2c3e50; font-weight: 800; text-align: right;">${mCount}명</td>
              </tr>
              <tr style="height: 32px; border-top: 1px solid rgba(46, 204, 113, 0.15);">
                <td style="font-size: 0.85rem; color: #27ae60; font-weight: 800; padding-top: 4px;">1인당 정산 금액</td>
                <td style="font-size: 1.15rem; color: #27ae60; font-weight: 900; text-align: right; padding-top: 4px;">${formatNumber(costPerMember)}원</td>
              </tr>
            </table>
          </div>
        </td>
        <!-- 개인 소비 요약 -->
        <td style="width: 40%; vertical-align: top;">
          <div style="background: #fdfaf5; border: 1.5px solid rgba(225, 112, 85, 0.25); border-radius: 12px; padding: 18px; box-sizing: border-box; text-align: left; height: 100%;">
            <h3 style="margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 800; color: #d35400; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">🛍️ 개인 지출 요약 (정산 제외)</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="height: 28px;">
                <td style="font-size: 0.8rem; color: #7f8c8d; font-weight: 600;">총 쇼핑 실지출</td>
                <td style="font-size: 1rem; color: #2c3e50; font-weight: 800; text-align: right;">${formatNumber(personalShoppingCostKRW)}원</td>
              </tr>
              <tr style="height: 28px;">
                <td style="font-size: 0.72rem; color: #7f8c8d;" colspan="2">※ 쇼핑 목록은 개인 지출로 취급되며 N분의 1 정산 대상에서 제외됩니다.</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>

    <!-- 2. 공동 경비 카테고리별 지출 분포 -->
    <h3 style="font-size: 1.1rem; font-weight: 800; color: #2c3e50; margin: 0 0 14px 0; text-align: left; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">📊 공동 경비 카테고리별 지출 분포</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
  `;

  const catNames = { flight: "✈️ 항공", meal: "🍴 맛집", cafe: "☕ 카페", sightseeing: "🏔️ 명소", shopping: "🛍️ 쇼핑", lodging: "🏨 숙소", transport: "🚌 교통", etc: "✨ 기타" };
  const catColors = { flight: "#3498db", meal: "#ff7675", cafe: "#e17055", sightseeing: "#fdcb6e", shopping: "#2ecc71", lodging: "#9b59b6", transport: "#1abc9c", etc: "#95a5a6" };

  const jointCatCosts = { ...catCosts };
  jointCatCosts.shopping = 0; 

  Object.keys(jointCatCosts).forEach(cat => {
    const amount = jointCatCosts[cat];
    const percentage = jointCostKRW > 0 ? Math.round((amount / jointCostKRW) * 100) : 0;
    if (amount > 0 || cat === "flight" || cat === "meal" || cat === "lodging" || cat === "transport") {
      budgetHtml += `
        <tr style="height: 36px;">
          <td style="width: 120px; font-size: 0.85rem; font-weight: 700; color: #2c3e50; vertical-align: middle;">${catNames[cat] || cat}</td>
          <td style="padding: 0 10px; vertical-align: middle;">
            <div style="width: 100%; height: 10px; background: rgba(0,0,0,0.04); border-radius: 5px; overflow: hidden;">
              <div style="width: ${percentage}%; height: 100%; background: ${catColors[cat] || "#6c5ce7"}; border-radius: 5px;"></div>
            </div>
          </td>
          <td style="width: 150px; font-size: 0.85rem; font-weight: 700; text-align: right; color: #2c3e50;">
            ${formatNumber(amount)}원 <span style="font-size: 0.75rem; color: #7f8c8d; font-weight: 600; margin-left: 4px;">(${percentage}%)</span>
          </td>
        </tr>
      `;
    }
  });

  budgetHtml += `</table>
    <h3 style="font-size: 1.1rem; font-weight: 800; color: #2c3e50; margin: 0 0 14px 0; text-align: left; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">📝 공동 경비 상세 내역</h3>
    <table style="width: 100%; border-collapse: collapse; border: 1px solid rgba(0,0,0,0.06); font-family: 'Outfit', 'Noto Sans KR', sans-serif; margin-bottom: 35px; box-sizing: border-box;">
      <thead>
        <tr style="background: rgba(46, 204, 113, 0.06); border-bottom: 1.5px solid rgba(46, 204, 113, 0.25);">
          <th style="padding: 10px; font-size: 0.8rem; font-weight: 800; color: #2c3e50; text-align: left;">항목명</th>
          <th style="padding: 10px; font-size: 0.8rem; font-weight: 800; color: #2c3e50; text-align: left; width: 130px;">분류</th>
          <th style="padding: 10px; font-size: 0.8rem; font-weight: 800; color: #2c3e50; text-align: right; width: 100px;">단가</th>
          <th style="padding: 10px; font-size: 0.8rem; font-weight: 800; color: #2c3e50; text-align: right; width: 70px;">인원</th>
          <th style="padding: 10px; font-size: 0.8rem; font-weight: 800; color: #2c3e50; text-align: right; width: 140px;">총 예상 금액</th>
        </tr>
      </thead>
      <tbody>`;

  jointDetailedList.forEach((exp, idx) => {
    budgetHtml += `<tr style="border-bottom: 1px solid rgba(0,0,0,0.04); background-color: ${idx % 2 === 1 ? "rgba(0,0,0,0.01)" : "#ffffff"}; page-break-inside: avoid; break-inside: avoid;">
        <td style="padding: 10px; font-size: 0.8rem; color: #2c3e50; font-weight: 600;">${escapeHTML(exp.name)}</td>
        <td style="padding: 10px; font-size: 0.78rem; color: #7f8c8d; font-weight: 600;">${exp.categoryName}</td>
        <td style="padding: 10px; font-size: 0.8rem; color: #2c3e50; font-weight: 700; text-align: right;">${exp.costPerUnit}</td>
        <td style="padding: 10px; font-size: 0.78rem; color: #7f8c8d; font-weight: 600; text-align: right;">${exp.qtyText}</td>
        <td style="padding: 10px; font-size: 0.8rem; color: #27ae60; font-weight: 800; text-align: right;">${formatNumber(exp.totalKRW)}원</td>
      </tr>`;
  });

  budgetHtml += `<tr style="background: rgba(46, 204, 113, 0.04); border-top: 1.5px solid rgba(46, 204, 113, 0.25); font-weight: 800;">
          <td colspan="4" style="padding: 12px 10px; font-size: 0.85rem; color: #2c3e50; text-align: left;">공동 경비 합계 금액</td>
          <td style="padding: 12px 10px; font-size: 0.95rem; color: #27ae60; font-weight: 900; text-align: right;">${formatNumber(jointCostKRW)}원</td>
        </tr>
      </tbody>
    </table>

    <h3 style="font-size: 1.1rem; font-weight: 800; color: #2c3e50; margin: 0 0 14px 0; text-align: left; font-family: 'Outfit', 'Noto Sans KR', sans-serif;">📝 개인 쇼핑 지출 내역</h3>
    <table style="width: 100%; border-collapse: collapse; border: 1px solid rgba(0,0,0,0.06); font-family: 'Outfit', 'Noto Sans KR', sans-serif; box-sizing: border-box;">
      <thead>
        <tr style="background: rgba(225, 112, 85, 0.06); border-bottom: 1.5px solid rgba(225, 112, 85, 0.25);">
          <th style="padding: 10px; font-size: 0.8rem; font-weight: 800; color: #2c3e50; text-align: left;">쇼핑 항목명</th>
          <th style="padding: 10px; font-size: 0.8rem; font-weight: 800; color: #2c3e50; text-align: left; width: 130px;">분류</th>
          <th style="padding: 10px; font-size: 0.8rem; font-weight: 800; color: #2c3e50; text-align: right; width: 100px;">단가</th>
          <th style="padding: 10px; font-size: 0.8rem; font-weight: 800; color: #2c3e50; text-align: right; width: 70px;">수량</th>
          <th style="padding: 10px; font-size: 0.8rem; font-weight: 800; color: #2c3e50; text-align: right; width: 140px;">총 지출 금액</th>
        </tr>
      </thead>
      <tbody>`;

  personalShoppingList.forEach((exp, idx) => {
    budgetHtml += `<tr style="border-bottom: 1px solid rgba(0,0,0,0.04); background-color: ${idx % 2 === 1 ? "rgba(0,0,0,0.01)" : "#ffffff"}; page-break-inside: avoid; break-inside: avoid;">
        <td style="padding: 10px; font-size: 0.8rem; color: #2c3e50; font-weight: 600;">🛒 ${escapeHTML(exp.name)}</td>
        <td style="padding: 10px; font-size: 0.78rem; color: #7f8c8d; font-weight: 600;">${exp.categoryName}</td>
        <td style="padding: 10px; font-size: 0.8rem; color: #2c3e50; font-weight: 700; text-align: right;">${exp.costPerUnit}</td>
        <td style="padding: 10px; font-size: 0.78rem; color: #7f8c8d; font-weight: 600; text-align: right;">${exp.qtyText}</td>
        <td style="padding: 10px; font-size: 0.8rem; color: #d35400; font-weight: 800; text-align: right;">${formatNumber(exp.totalKRW)}원</td>
      </tr>`;
  });

  budgetHtml += `<tr style="background: rgba(225, 112, 85, 0.04); border-top: 1.5px solid rgba(225, 112, 85, 0.25); font-weight: 800;">
          <td colspan="4" style="padding: 12px 10px; font-size: 0.85rem; color: #2c3e50; text-align: left;">개인 소비 합계 금액</td>
          <td style="padding: 12px 10px; font-size: 0.95rem; color: #e17055; font-weight: 900; text-align: right;">${formatNumber(personalShoppingCostKRW)}원</td>
        </tr>
      </tbody>
    </table>`;

  pdfContainer.innerHTML += budgetHtml;

  wrapper.appendChild(pdfContainer);
  document.body.appendChild(wrapper);

  // 7. PDF 생성 트리거
  setTimeout(() => {
    if (typeof html2pdf === 'undefined') {
      showToast("PDF 생성 라이브러리가 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.", "error");
      document.body.removeChild(wrapper);
      return;
    }

    const fileName = "sapo_travel_budget_report.pdf";
    const options = {
      margin: [10, 10, 20, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: 720,
        windowWidth: 720
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css'] }
    };

    html2pdf().from(pdfContainer).set(options).save().then(() => {
      document.body.removeChild(wrapper);
      showToast("🎉 예산 & 정산 보고서 PDF 저장이 완료되었습니다!", "success");
    }).catch(err => {
      console.error("PDF 생성 실패:", err);
      if (document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }
      showToast("PDF 생성 중 오류가 발생했습니다.", "error");
    });
  }, 300);
};



