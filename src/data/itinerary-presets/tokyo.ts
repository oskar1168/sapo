import { CityPreset } from './types';

export const tokyoItineraryPreset: CityPreset = [
    [
      { type: 'transport', name: '도쿄 도착', time: '11:30', memo: '나리타/하네다에서 숙소 지역으로 이동', address: 'Tokyo Station' },
      { type: 'lodging', name: '호텔 체크인', time: '15:00', memo: '짐 정리 후 첫날은 중심지 위주로 가볍게', address: 'Shinjuku Station' },
      { type: 'sightseeing', name: '신주쿠 산책', time: '17:00', memo: '도청 전망대, 가부키초, 오모이데요코초 중 선택', address: 'Shinjuku, Tokyo' },
      { type: 'meal', name: '신주쿠 저녁', time: '19:00', memo: '라멘, 이자카야, 야키니쿠 중 취향대로', address: 'Shinjuku, Tokyo' },
    ],
    [
      { type: 'sightseeing', name: '아사쿠사 센소지', time: '10:00', memo: '나카미세도리 간식과 함께 둘러보기', address: 'Sensoji Temple, Tokyo' },
      { type: 'meal', name: '아사쿠사 점심', time: '12:30', memo: '텐동, 소바, 장어덮밥 중 선택', address: 'Asakusa, Tokyo' },
      { type: 'sightseeing', name: '스미다강 산책', time: '14:30', memo: '스카이트리 방향으로 이동하기 좋은 코스', address: 'Sumida River, Tokyo' },
      { type: 'sightseeing', name: '도쿄 스카이트리', time: '17:00', memo: '전망대 예약이 있으면 일몰 시간대 추천', address: 'Tokyo Skytree' },
    ],
    [
      { type: 'sightseeing', name: '시부야 스크램블', time: '10:30', memo: '하치코, 스크램블 교차로, 미야시타파크', address: 'Shibuya Crossing' },
      { type: 'meal', name: '시부야 점심', time: '12:30', memo: '카페 또는 캐주얼 맛집으로 동선 짧게', address: 'Shibuya, Tokyo' },
      { type: 'shopping', name: '하라주쿠/오모테산도', time: '14:30', memo: '쇼핑, 디저트, 거리 산책', address: 'Harajuku, Tokyo' },
      { type: 'sightseeing', name: '시부야스카이', time: '18:00', memo: '일몰 시간 예약 추천', address: 'Shibuya Sky' },
    ],
    [
      { type: 'sightseeing', name: '도쿄 디즈니 리조트', time: '08:30', memo: '랜드/씨 중 선택. 입장 직후 인기 어트랙션부터', address: 'Tokyo Disney Resort' },
      { type: 'meal', name: '파크 내 점심', time: '12:30', memo: '모바일 오더나 혼잡 시간 회피', address: 'Tokyo Disney Resort' },
      { type: 'sightseeing', name: '퍼레이드/야간 쇼', time: '19:00', memo: '체력 안배가 중요한 종일 코스', address: 'Tokyo Disney Resort' },
    ],
    [
      { type: 'sightseeing', name: '긴자/도쿄역', time: '10:30', memo: '마루노우치, 도쿄역, 긴자를 묶는 도심 코스', address: 'Ginza, Tokyo' },
      { type: 'meal', name: '츠키지 또는 긴자 점심', time: '12:30', memo: '초밥, 카이센동, 백화점 식품관도 선택지', address: 'Tsukiji Outer Market' },
      { type: 'shopping', name: '긴자 쇼핑', time: '15:00', memo: '백화점, 편집숍, 기념품 구매', address: 'Ginza, Tokyo' },
      { type: 'sightseeing', name: '도쿄타워 야경', time: '18:30', memo: '시바공원과 함께 사진 코스', address: 'Tokyo Tower' },
    ],
    [
      { type: 'transport', name: '근교 당일치기 출발', time: '08:30', memo: '하코네/가마쿠라/요코하마 중 선택', address: 'Tokyo Station' },
      { type: 'sightseeing', name: '가마쿠라 또는 하코네', time: '11:00', memo: '날씨와 이동 피로도에 맞춰 선택', address: 'Kamakura Station' },
      { type: 'meal', name: '근교 점심', time: '13:00', memo: '현지 상점가에서 가볍게', address: 'Kamakura Station' },
      { type: 'transport', name: '도쿄 복귀', time: '18:00', memo: '저녁은 숙소 근처에서 여유롭게', address: 'Tokyo Station' },
    ],
    [
      { type: 'shopping', name: '마지막 쇼핑', time: '10:00', memo: '돈키호테, 백화점, 역 상가에서 누락품 체크', address: 'Tokyo Station' },
      { type: 'transport', name: '공항 이동', time: '13:00', memo: '나리타/하네다 이동 시간을 넉넉하게 잡기', address: 'Haneda Airport' },
      { type: 'meal', name: '공항 식사', time: '15:00', memo: '면세 쇼핑과 출국 준비', address: 'Haneda Airport' },
    ],
  ];
