import type { SpotItem } from '../../types/travelData';

export const TOKYO_FOOD_LIST: SpotItem[] = [
  {
    id: "tokyo-001",
    name: "도쿄 타워 (Tokyo Tower)",
    category: "spot",
    rating: "4.7",
    menu: "도쿄의 상징 전망대 관람 🗼",
    tips: "도쿄의 오랜 랜드마크입니다. 시바 공원에서 도쿄 타워를 배경으로 돗자리를 펴고 피크닉 사진을 찍으면 인생샷을 쉽게 남길 수 있습니다.",
    address: "Tokyo Tower, Tokyo",
    openTime: "09:00",
    closeTime: "23:00",
    tags: ["가족", "연인"]
  },
  {
    id: "tokyo-002",
    name: "아사쿠사 센소지 (Senso-ji)",
    category: "spot",
    rating: "4.6",
    menu: "전통 사찰 산책 & 나카미세도리 길거리 간식",
    tips: "도쿄에서 가장 오래된 절입니다. 입구의 붉은 거대 등(카미나리몬) 아래서 인증샷을 찍고 사찰 앞 상점가에서 화과자와 모찌를 즐겨보세요.",
    address: "Sensoji Temple, Tokyo",
    openTime: "06:00",
    closeTime: "17:00",
    tags: ["가족", "혼자"]
  },
  {
    id: "tokyo-003",
    name: "시부야 스카이 (Shibuya Sky)",
    category: "spot",
    rating: "4.8",
    menu: "전망대 옥상 시부야 스크램블 뷰",
    tips: "시부야 스크램블 스퀘어 빌딩 옥상에 있는 전망대입니다. 일몰 시간대 예약이 가장 인기가 많으며, 바람을 맞으며 360도로 펼쳐진 야경은 장관입니다.",
    address: "Shibuya Sky, Tokyo",
    openTime: "10:00",
    closeTime: "22:30",
    tags: ["연인"]
  },
  {
    id: "tokyo-004",
    name: "이치란 라멘 신주쿠점",
    category: "noodle",
    rating: "4.3",
    menu: "천연 돈코츠 라멘 (약 980엔)",
    tips: "한국인 입맛에 가장 잘 맞는 1인 독서실 형태의 유명 돈코츠 라멘집입니다. 매운맛 소스 레벨을 4~5단계 정도로 올리면 느끼함 없이 맛있게 드실 수 있습니다.",
    address: "Ichiran Shinjuku, Tokyo",
    openTime: "10:00",
    closeTime: "23:00",
    tags: ["혼자"]
  }
];
