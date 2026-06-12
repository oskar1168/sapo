export interface ActivityItem {
  id: number;
  type: string;
  name: string;
  time: string;
  memo: string;
  cost?: number;
  currency?: string;
  address?: string;
}

export interface ChecklistItem {
  id: number;
  text: string;
  checked: boolean;
}

export interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  qty: number;
  cost: number;
  currency: string;
  memo: string;
  checked: boolean;
}

export interface CityExploreItem {
  emoji: string;
  name: string;
  desc: string;
  filter: string;
}

export interface AffiliateDealItem {
  emoji: string;
  color: string;
  title: string;
  desc: string;
}

export interface GuidebookItem {
  emoji: string;
  title: string;
  content: string;
}

export interface CityTemplate {
  cityCode: string;
  title: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  mapCenter: [number, number];
  mapZoom: number;
  days: {
    [key: string]: ActivityItem[];
  };
  checklist: ChecklistItem[];
  shoppingList: ShoppingItem[];
  explore: {
    welcomeSubtitle: string;
    bannerTitle: string;
    bannerDesc: string;
    cities: CityExploreItem[];
    deals: AffiliateDealItem[];
    guidebook: GuidebookItem[];
  };
}

export const CITY_TEMPLATES: { [key: string]: CityTemplate } = {
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
      bannerDesc: "현지인들만 아는 주차 명소 and 웨이팅 없는 맛집 리스트 대공개",
      cities: [
        { emoji: "🧭", name: "삿포로", desc: "식당 & 도심 야경", filter: "sapporo" },
        { emoji: "🌊", name: "오타루", desc: "오르골 & 감성 운하", filter: "otaru" },
        { emoji: "✨", name: "하코다테", desc: "세계 3대 로프웨이 야경", filter: "hakodate" },
        { emoji: "🌸", name: "비에이/후라노", desc: "청의 호수 & 패치워크", filter: "biei" }
      ],
      deals: [
        { emoji: "coupon", color: "#fd79a8", title: "돈키호테 할인 쿠폰 15% 받기", desc: "10% 면세 + 최대 5% 추가 즉시할인 바코드 연동" },
        { emoji: "train", color: "#4a90e2", title: "JR 홋카이도 레일패스 (재팬 레일패스)", desc: "삿포로-오타루-하코다테 전 노선 자유 탑승권 예약" }
      ],
      guidebook: [
        {
          emoji: "💡",
          title: "비에이 버스 투어 vs 렌터카 완벽 비교",
          content: "[VS] 비에이 일일 버스 투어 | 렌터카 셀프 로드 트립\n- **장점**: 대중교통 배차가 드물어 하루 만에 가기 힘든 비에이/후라노의 핵심 코스(청의 호수, 팜 도미타 등)를 편하게 전용 버스로 일주 가능. 가성비 최고.\n- **단점**: 엄격한 단체 가이드 동선으로 인한 시간 제한과 사진 촬영 시 인파 집중이 심함.\n| - **장점**: 고속도로 톨게이트 비용을 줄여주는 `HEP(홋카이도 익스프레스웨이 패스)` 옵션을 넣어 오타루, 하코다테까지 나만의 자유로운 동선으로 여정 조율 가능.\n- **단점**: 장거리 누적 피로, 비에이 산간 지역 초행길 운전 집중 요구."
        },
        {
          emoji: "🚗",
          title: "청의 호수 & 팜 도미타 주차 및 대기 꿀팁",
          content: "- 라벤더가 만개하는 성수기(6월 말~7월 중순)의 `팜 도미타`와 `청의 호수`는 단체 버스들이 많이 오는 오전 10시~오후 3시에 극심한 정체로 악명이 높습니다.\n- **해결책**: 단체 관광객이 없는 오전 8시 30분 '오픈런'을 노려 방문하시거나, 반대로 해 질 녘인 오후 4시 30분 이후 늦은 시간대를 활용하시면 대기 시간 0초로 여유로운 주차 및 인생샷 건지기가 가능합니다."
        },
        {
          emoji: "🍛",
          title: "스프카레 & 징기스칸 인기 맛집 웨이팅 최소화",
          content: "[VS] 인기 원조 맛집 (가라쿠, 다루마) | 로컬 대체 맛집 (TREASURE, Alco)\n- **맛**: 검증된 원조 맛이나 2시간 대기 필수.\n- **웨이팅**: 모바일 예약 불가 시 극단적으로 오래 걸림.\n| - **맛**: 원조와 같은 베이스로 로컬 단골들이 애용하는 깊은 맛.\n- **웨이팅**: 줄이 훨씬 짧거나 분점들이 많아 30분 이내 입장 가능."
        }
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
        { id: 4, type: "spot", name: "아사쿠사 센소지", time: "10:00", memo: "전통 사찰 산책 및 신주쿠 상점가 구경" },
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
        { emoji: "coupon", color: "#fd79a8", title: "도쿄 메가 돈키호테 할인 쿠폰 15%", desc: "면세 10% + 시부야/신주쿠점 추가 5% 혜택" },
        { emoji: "subway", color: "#4a90e2", title: "도쿄 서브웨이 티켓 (24/48/72시간권)", desc: "도쿄 전역 지하철 노선 무제한 탑승권 예약" }
      ],
      guidebook: [
        {
          emoji: "🎢",
          title: "디즈니랜드 vs 디즈니씨 완벽 비교",
          content: "[VS] 디즈니랜드 (Disneyland) | 디즈니씨 (DisneySea)\n- **타겟**: 아기자기한 동화 나라 테마, 가족 동반 및 오리지널 성 선호.\n- **어트랙션**: 퍼레이드 위주, 비교적 무난한 난이도의 어트랙션.\n| - **타겟**: 전 세계 유일 바다 테마, 성인 및 커플층 선호.\n- **어트랙션**: 타워 오브 테러, 스릴 중심의 강렬한 놀이기구 많음."
        },
        {
          emoji: "🗼",
          title: "도쿄 전망대 (시부야 스카이 vs 도쿄 타워)",
          content: "[VS] 시부야 스카이 야외 루프탑 | 롯폰기 힐즈 도쿄 시티 뷰\n- **뷰**: 탁 트인 야외 전망, 시부야 스크램블 교차로 직관 가능.\n- **예약**: 방문 4주 전 정각 예약 필수, 날씨 영향 심함.\n| - **뷰**: 도쿄 타워가 가장 예쁘게 보이는 상징적인 실내 뷰.\n- **예약**: 현장 발권 가능성이 상대적으로 높으며 날씨 영향 없음."
        }
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
        { emoji: "coupon", color: "#fd79a8", title: "오사카 돈키호테 난바점 15% 쿠폰", desc: "10% 면세 + 5% 현장 추가 쿠폰 링크" },
        { emoji: "passport", color: "#4a90e2", title: "오사카 주유패스 1일권 / 2일권 예약", desc: "전철 무제한 및 40곳 이상 주요 관광지 무료 입장" }
      ],
      guidebook: [
        {
          emoji: "🎢",
          title: "USJ 익스프레스 vs 오픈런 정리권 비교",
          content: "[VS] 익스프레스 패스 (자본주의 꿀팁) | 오픈런 정리권 (가성비 공략)\n- **비용**: 1인 10만 원~20만 원 이상 추가 예산 필요.\n- **대기**: 해리포터/마리오 닌텐도 월드 대기 없이 즉시 확약 입장.\n| - **비용**: 입장권 비용만 들며 100% 무료.\n- **대기**: 아침 7시 30분 파크 도착 필수. 입장 직후 어플로 닌텐도 정리권 예약 선점."
        },
        {
          emoji: "⛩️",
          title: "교토 버스 투어 vs 한큐 전철 개별 자유 여행",
          content: "[VS] 교토 일일 버스 투어 (아라시야마+청수사) | 한큐/게이한 전철 자유 투어\n- **이동**: 전용 버스로 교토 주요 거리를 환승 없이 일주.\n- **일정**: 정해진 단체 시간 가이드에 맞춰 움직여야 함.\n| - **이동**: 걷는 걸음과 환승이 많아 피로도가 높음.\n- **일정**: 기온거리나 골목 상점에서 내 맘대로 머무르는 자유 투어 가능."
        }
      ]
    }
  }
};

export const FOOD_CATEGORIES: { [key: string]: { label: string; icon: string } } = {
  spot: { label: "🏞️ 명소 / 관광지", icon: "landscape" },
  meat: { label: "🥩 고기 / 육류", icon: "restaurant" },
  seafood: { label: "🐟 해산물 / 스시", icon: "water" },
  noodle: { label: "🍛 면 / 스프카레", icon: "soup" },
  dessert: { label: "🍰 디저트 / 카페", icon: "cafe" }
};

export interface SpotItem {
  name: string;
  category: string;
  rating: string;
  menu: string;
  tips: string;
  address: string;
  openTime: string;
  closeTime: string;
}

export const SAPPORO_FOOD_LIST: SpotItem[] = [
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

export const OTARU_FOOD_LIST: SpotItem[] = [
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

export const TOKYO_FOOD_LIST: SpotItem[] = [
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

export const OSAKA_FOOD_LIST: SpotItem[] = [
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

export const LOCATION_COORDINATES: { [key: string]: [number, number] } = {
  "도쿄역": [35.6812, 139.7671],
  "신주쿠역": [35.6896, 139.6917],
  "시부야 스카이": [35.6585, 139.7023],
  "도쿄 디즈니랜드": [35.6329, 139.8804],
  "아사쿠사 센소지": [35.7148, 139.7967],
  "도쿄 타워": [35.6586, 139.7454],
  "오사카역": [34.7024, 135.4959],
  "도톤보리": [34.6687, 135.5013],
  "유니버설 스튜디오 재팬": [34.6654, 135.4323],
  "오사카성": [34.6873, 135.5262],
  "우메다 공중정원": [34.7053, 135.4902],
  "교토역": [34.9858, 135.7588],
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
  "청의 호수": [43.4936, 142.6144],
  "흰수염 폭포": [43.4735, 142.6393],
  "후라노": [43.3421, 142.3831],
  "팜 도미타": [43.4181, 142.4278],
  "닝글테라스": [43.3232, 142.3582]
};
