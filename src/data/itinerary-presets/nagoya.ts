import { CityPreset } from './types';

export const nagoyaItineraryPreset: CityPreset = [
    [
      { type: 'transport', name: '주부국제공항 도착', time: '11:30', memo: '뮤스카이 또는 공항철도로 나고야역 이동', address: 'Chubu Centrair International Airport' },
      { type: 'lodging', name: '호텔 체크인', time: '15:00', memo: '나고야역이나 사카에 숙소 기준으로 짐 정리', address: 'Nagoya Station' },
      { type: 'sightseeing', name: '사카에/오아시스21', time: '17:00', memo: '첫날 야경과 쇼핑을 함께 보기 좋음', address: 'Oasis 21, Nagoya' },
      { type: 'meal', name: '히츠마부시 저녁', time: '19:00', memo: '나고야 대표 메뉴로 여행 시작', address: 'Sakae, Nagoya' },
    ],
    [
      { type: 'sightseeing', name: '나고야성', time: '10:00', memo: '혼마루어전과 성 주변 공원 산책', address: 'Nagoya Castle' },
      { type: 'meal', name: '나고야 메시 점심', time: '12:30', memo: '미소카츠, 키시멘, 테바사키 중 선택', address: 'Nagoya, Aichi' },
      { type: 'sightseeing', name: '도요타 산업기술기념관', time: '15:00', memo: '실내 관람이라 날씨 영향이 적은 코스', address: 'Toyota Commemorative Museum of Industry and Technology' },
      { type: 'shopping', name: '나고야역 쇼핑', time: '18:00', memo: '타카시마야와 지하상가 둘러보기', address: 'Nagoya Station' },
    ],
    [
      { type: 'transport', name: '지브리파크 이동', time: '09:00', memo: '예약 시간에 맞춰 리니모 동선 확인', address: 'Ghibli Park' },
      { type: 'sightseeing', name: '지브리파크 관람', time: '10:30', memo: '구역별 입장 시간을 미리 체크', address: 'Ghibli Park, Aichi' },
      { type: 'meal', name: '파크/나가쿠테 점심', time: '13:00', memo: '혼잡하면 간단한 식사로 시간 확보', address: 'Nagakute, Aichi' },
      { type: 'transport', name: '나고야 복귀', time: '17:30', memo: '저녁은 사카에나 나고야역에서 여유롭게', address: 'Nagoya Station' },
    ],
    [
      { type: 'transport', name: '이누야마 이동', time: '09:30', memo: '메이테쓰 전철로 부담 적은 근교 이동', address: 'Inuyama Station' },
      { type: 'sightseeing', name: '이누야마성', time: '10:30', memo: '목조 천수와 강변 전망이 좋은 코스', address: 'Inuyama Castle' },
      { type: 'meal', name: '성하마을 점심', time: '12:30', memo: '꼬치 간식과 상점가 식사', address: 'Inuyama Castle Town' },
      { type: 'sightseeing', name: '메이지무라 또는 리틀월드', time: '14:30', memo: '취향에 따라 테마파크형 근교 일정 선택', address: 'Meiji Mura' },
      { type: 'transport', name: '나고야 복귀', time: '18:00', memo: '저녁은 테바사키나 이자카야 추천', address: 'Nagoya Station' },
    ],
    [
      { type: 'transport', name: '다카야마 이동', time: '08:30', memo: '특급 히다 또는 고속버스 예약 권장', address: 'Takayama Station' },
      { type: 'sightseeing', name: '산마치 거리', time: '12:00', memo: '전통 거리와 간식 산책', address: 'Sanmachi Suji, Takayama' },
      { type: 'meal', name: '히다규 점심', time: '13:00', memo: '히다규 초밥이나 정식 추천', address: 'Takayama, Gifu' },
      { type: 'sightseeing', name: '다카야마 진야', time: '15:00', memo: '짧게 보기 좋은 역사 코스', address: 'Takayama Jinya' },
      { type: 'lodging', name: '다카야마 숙박 또는 나고야 복귀', time: '18:00', memo: '여행 스타일에 따라 1박 또는 당일 복귀 선택', address: 'Takayama Station' },
    ],
    [
      { type: 'transport', name: '시라카와고 이동', time: '08:30', memo: '버스 예약 필수에 가깝고 계절별 소요시간 확인', address: 'Shirakawa-go' },
      { type: 'sightseeing', name: '오기마치 합장촌', time: '11:00', memo: '전망대와 마을 산책을 함께 보기', address: 'Shirakawa-go, Gifu' },
      { type: 'meal', name: '시라카와고 점심', time: '13:00', memo: '향토 정식이나 소바로 가볍게', address: 'Shirakawa-go' },
      { type: 'transport', name: '나고야 복귀', time: '16:30', memo: '장거리 버스 시간표를 기준으로 일정 조정', address: 'Nagoya Station' },
    ],
    [
      { type: 'shopping', name: '나고야역 마지막 쇼핑', time: '10:00', memo: '나고야 과자, 드럭스토어, 역 도시락 체크', address: 'Nagoya Station' },
      { type: 'transport', name: '주부국제공항 이동', time: '13:00', memo: '공항철도 시간 확인 후 여유 있게 이동', address: 'Chubu Centrair International Airport' },
      { type: 'meal', name: '공항 식사/면세', time: '15:00', memo: '출국 전 식사와 기념품 마무리', address: 'Chubu Centrair International Airport' },
    ],
  ];
