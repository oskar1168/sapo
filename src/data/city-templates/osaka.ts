import type { CityTemplate } from '../../types/travelData';

export const osakaCityTemplate: CityTemplate = {
    cityCode: "osaka",
    title: "오사카 먹방 여행 🐙",
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
        { emoji: "🎢", name: "USJ", desc: "닌텐도 월드 & 익스프레스", filter: "usj" },
        { emoji: "🦌", name: "나라", desc: "사슴공원 & 도다이지", filter: "nara" },
        { emoji: "🌃", name: "고베", desc: "항구 야경 & 아리마온천", filter: "kobe" },
        { emoji: "🌿", name: "팀랩/나가이", desc: "야간 전시 & 공원 산책", filter: "teamlab" }
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
  };
