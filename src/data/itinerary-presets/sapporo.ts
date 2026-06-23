import { CityPreset } from './types';

export const sapporoItineraryPreset: CityPreset = [
    [
      { type: 'transport', name: '신치토세 공항 도착', time: '11:30', memo: 'JR 또는 공항버스로 삿포로 시내 이동', address: 'New Chitose Airport' },
      { type: 'meal', name: '삿포로역 점심', time: '13:30', memo: '역 주변 라멘이나 수프카레로 가볍게 시작', address: 'Sapporo Station' },
      { type: 'lodging', name: '호텔 체크인', time: '15:00', memo: '짐을 맡기고 오도리/스스키노 산책 준비', address: 'Sapporo Station' },
      { type: 'sightseeing', name: '오도리공원 & TV타워', time: '17:00', memo: '첫날 동선이 짧고 사진 찍기 좋은 중심 코스', address: 'Odori Park, Sapporo' },
      { type: 'meal', name: '스스키노 저녁', time: '19:00', memo: '징기스칸, 라멘, 이자카야 중 취향대로 선택', address: 'Susukino, Sapporo' },
    ],
    [
      { type: 'transport', name: '오타루 이동', time: '09:30', memo: 'JR로 약 35~45분 이동', address: 'Otaru Station' },
      { type: 'sightseeing', name: '오타루 운하', time: '10:30', memo: '운하 산책과 창고 거리 사진 코스', address: 'Otaru Canal, Otaru' },
      { type: 'meal', name: '오타루 초밥 점심', time: '12:30', memo: '해산물과 초밥을 메인으로 잡기 좋은 날', address: 'Otaru Sushi Street' },
      { type: 'sightseeing', name: '사카이마치 거리', time: '14:00', memo: '오르골당, 르타오, 기타카로를 천천히 둘러보기', address: 'Sakaimachi Street, Otaru' },
      { type: 'transport', name: '삿포로 복귀', time: '18:00', memo: '저녁은 삿포로 시내에서 여유롭게', address: 'Sapporo Station' },
    ],
    [
      { type: 'transport', name: '비에이/후라노 출발', time: '08:30', memo: '버스투어 또는 렌터카 추천', address: 'Biei Station' },
      { type: 'sightseeing', name: '패치워크 로드', time: '10:30', memo: '언덕길과 목가적인 풍경을 둘러보는 코스', address: 'Patchwork Road, Biei' },
      { type: 'sightseeing', name: '청의 호수', time: '13:30', memo: '날씨가 좋을수록 색감이 살아나는 대표 스팟', address: 'Shirogane Blue Pond' },
      { type: 'sightseeing', name: '흰수염폭포', time: '15:00', memo: '청의 호수와 묶어서 보기 좋은 짧은 코스', address: 'Shirahige Waterfall' },
      { type: 'transport', name: '삿포로 복귀', time: '18:30', memo: '장거리 이동 후 저녁은 가볍게', address: 'Sapporo Station' },
    ],
    [
      { type: 'sightseeing', name: '모이와야마 전망대', time: '10:30', memo: '날씨가 좋으면 낮 전망, 흐리면 오후 쇼핑으로 대체', address: 'Mt. Moiwa Ropeway, Sapporo' },
      { type: 'meal', name: '수프카레 점심', time: '13:00', memo: '삿포로 대표 메뉴를 여유 있게 즐기기', address: 'Suage+, Sapporo' },
      { type: 'shopping', name: '타누키코지 쇼핑', time: '15:00', memo: '드럭스토어, 기념품, 간식 쇼핑', address: 'Tanukikoji Shopping Street' },
      { type: 'meal', name: '징기스칸 저녁', time: '19:00', memo: '인기점은 예약 또는 이른 방문 추천', address: 'Susukino, Sapporo' },
    ],
    [
      { type: 'transport', name: '하코다테 이동', time: '08:30', memo: '장거리 이동일. JR 또는 렌터카 계획을 여유 있게', address: 'Hakodate Station' },
      { type: 'meal', name: '하코다테 아침시장/해산물', time: '12:30', memo: '도착 후 해산물 덮밥 코스 추천', address: 'Hakodate Morning Market' },
      { type: 'sightseeing', name: '베이 에어리어', time: '15:00', memo: '붉은 벽돌 창고와 항구 산책', address: 'Kanemori Red Brick Warehouse' },
      { type: 'sightseeing', name: '하코다테산 야경', time: '19:00', memo: '날씨 확인 후 로프웨이 이동', address: 'Mt. Hakodate Ropeway' },
    ],
    [
      { type: 'sightseeing', name: '나카지마공원 산책', time: '10:00', memo: '여행 중반 숨 고르기 좋은 가벼운 산책', address: 'Nakajima Park, Sapporo' },
      { type: 'meal', name: '라멘 골목', time: '12:30', memo: '미소라멘 또는 현지 인기점 선택', address: 'Ganso Sapporo Ramen Yokocho' },
      { type: 'shopping', name: '삿포로 팩토리/스텔라플레이스', time: '15:00', memo: '실내 쇼핑과 카페 휴식', address: 'Sapporo Factory' },
      { type: 'meal', name: '이자카야 저녁', time: '19:00', memo: '마지막 전날이라면 예약 식당으로 마무리', address: 'Susukino, Sapporo' },
    ],
    [
      { type: 'shopping', name: '마지막 쇼핑', time: '10:00', memo: '기념품, 드럭스토어, 공항 면세 전 체크', address: 'Sapporo Station' },
      { type: 'transport', name: '신치토세 공항 이동', time: '13:00', memo: '국제선은 여유 있게 이동', address: 'New Chitose Airport' },
      { type: 'meal', name: '공항 식사/기념품', time: '15:00', memo: '공항 상점가에서 로이스, 르타오, 라멘 마무리', address: 'New Chitose Airport' },
    ],
  ];
