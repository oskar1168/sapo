import type { CityTemplate } from '../../types/travelData';

export const tokyoCityTemplate: CityTemplate = {
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
        { emoji: "🛍️", name: "긴자", desc: "명품관 & 고급 식당", filter: "ginza" },
        { emoji: "🗻", name: "하코네/후지산", desc: "온천 & 후지산 뷰", filter: "fuji_hakone" },
        { emoji: "🌉", name: "요코하마", desc: "항구 야경 & 차이나타운", filter: "yokohama" },
        { emoji: "🚃", name: "가마쿠라/에노시마", desc: "바다 전철 & 사찰", filter: "kamakura" }
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
  };
