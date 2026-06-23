import type { CityTemplate } from '../../types/travelData';

export const sapporoCityTemplate: CityTemplate = {
    cityCode: "sapporo",
    title: "홋카이도 초여름 여행 ✈️",
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
        { emoji: "🌸", name: "비에이/후라노", desc: "청의 호수 & 패치워크", filter: "biei" },
        { emoji: "♨️", name: "노보리베츠/도야", desc: "온천 & 호수 드라이브", filter: "noboribetsu" },
        { emoji: "🐧", name: "아사히카와", desc: "동물원 & 라멘", filter: "asahikawa" }
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
  };
