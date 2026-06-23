import { CityPreset } from './types';

export const osakaItineraryPreset: CityPreset = [
    [
      { type: 'transport', name: '간사이공항 도착', time: '11:30', memo: '난바 또는 우메다 숙소로 이동', address: 'Kansai International Airport' },
      { type: 'lodging', name: '호텔 체크인', time: '15:00', memo: '짐 정리 후 난바 중심으로 가볍게 시작', address: 'Namba, Osaka' },
      { type: 'sightseeing', name: '도톤보리', time: '17:00', memo: '글리코상, 강변 산책, 먹거리 탐색', address: 'Dotonbori, Osaka' },
      { type: 'meal', name: '난바 저녁', time: '19:00', memo: '오코노미야키, 타코야키, 야키니쿠 중 선택', address: 'Namba, Osaka' },
    ],
    [
      { type: 'sightseeing', name: '오사카성', time: '10:00', memo: '공원 산책과 천수각 코스', address: 'Osaka Castle' },
      { type: 'meal', name: '모리노미야/덴마바시 점심', time: '12:30', memo: '오사카성 주변에서 가볍게', address: 'Morinomiya Station' },
      { type: 'sightseeing', name: '우메다 스카이빌딩', time: '16:00', memo: '해 질 무렵 전망대 추천', address: 'Umeda Sky Building' },
      { type: 'shopping', name: '우메다 쇼핑', time: '18:00', memo: '백화점과 지하상가 둘러보기', address: 'Umeda, Osaka' },
    ],
    [
      { type: 'sightseeing', name: 'USJ 입장', time: '08:30', memo: '입장 직후 정리권/앱 확인', address: 'Universal Studios Japan, Osaka' },
      { type: 'meal', name: '파크 내 점심', time: '12:30', memo: '혼잡 시간 피해서 간단히', address: 'Universal Studios Japan, Osaka' },
      { type: 'sightseeing', name: '닌텐도 월드/인기 어트랙션', time: '14:00', memo: '익스프레스 또는 정리권 시간에 맞춰 이동', address: 'Universal Studios Japan, Osaka' },
      { type: 'sightseeing', name: '야간 쇼', time: '19:00', memo: '체력 안배가 필요한 종일 코스', address: 'Universal Studios Japan, Osaka' },
    ],
    [
      { type: 'transport', name: '교토 이동', time: '08:30', memo: 'JR/게이한/한큐 중 숙소 위치에 맞춰 선택', address: 'Kyoto Station' },
      { type: 'sightseeing', name: '청수사', time: '10:00', memo: '니넨자카/산넨자카 산책과 함께', address: 'Kiyomizu-dera, Kyoto' },
      { type: 'meal', name: '기온 점심', time: '12:30', memo: '소바, 오반자이, 말차 디저트', address: 'Gion, Kyoto' },
      { type: 'sightseeing', name: '후시미이나리', time: '15:00', memo: '붉은 도리이 길을 짧게라도 걸어보기', address: 'Fushimi Inari Taisha' },
      { type: 'transport', name: '오사카 복귀', time: '18:30', memo: '저녁은 난바나 우메다에서', address: 'Osaka Station' },
    ],
    [
      { type: 'sightseeing', name: '신세카이/츠텐카쿠', time: '10:00', memo: '레트로 오사카 분위기와 쿠시카츠 코스', address: 'Shinsekai, Osaka' },
      { type: 'meal', name: '쿠시카츠 점심', time: '12:00', memo: '신세카이 대표 메뉴', address: 'Shinsekai, Osaka' },
      { type: 'sightseeing', name: '아베노 하루카스', time: '15:00', memo: '전망대 또는 쇼핑몰 휴식', address: 'Abeno Harukas' },
      { type: 'shopping', name: '덴노지/난바 쇼핑', time: '17:00', memo: '마지막 전날 쇼핑을 나눠서 진행', address: 'Tennoji, Osaka' },
    ],
    [
      { type: 'transport', name: '나라 당일치기', time: '09:00', memo: '오사카에서 부담 적은 근교 코스', address: 'Nara Station' },
      { type: 'sightseeing', name: '나라공원/도다이지', time: '10:30', memo: '사슴공원과 대불전 산책', address: 'Nara Park' },
      { type: 'meal', name: '나라 점심', time: '13:00', memo: '상점가에서 간단히', address: 'Naramachi, Nara' },
      { type: 'transport', name: '오사카 복귀', time: '17:00', memo: '저녁은 숙소 근처에서 여유롭게', address: 'Namba, Osaka' },
    ],
    [
      { type: 'shopping', name: '구로몬시장/난바 마지막 쇼핑', time: '10:00', memo: '먹거리와 기념품을 마지막으로 체크', address: 'Kuromon Market, Osaka' },
      { type: 'transport', name: '간사이공항 이동', time: '13:00', memo: '라피트/공항급행 시간 확인', address: 'Kansai International Airport' },
      { type: 'meal', name: '공항 식사/면세', time: '15:00', memo: '출국 전 식사와 쇼핑 마무리', address: 'Kansai International Airport' },
    ],
  ];
