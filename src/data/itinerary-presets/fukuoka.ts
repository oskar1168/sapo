import { CityPreset } from './types';

export const fukuokaItineraryPreset: CityPreset = [
    [
      { type: 'transport', name: '후쿠오카 공항 도착', time: '11:30', memo: '지하철로 하카타/텐진 숙소까지 짧게 이동', address: 'Fukuoka Airport' },
      { type: 'lodging', name: '호텔 체크인', time: '15:00', memo: '짐을 맡기고 하카타역 주변부터 가볍게 시작', address: 'Hakata Station' },
      { type: 'sightseeing', name: '캐널시티 하카타', time: '17:00', memo: '쇼핑, 분수쇼, 식사를 한 번에 보기 좋은 첫날 코스', address: 'Canal City Hakata' },
      { type: 'meal', name: '나카스 포장마차 저녁', time: '19:30', memo: '라멘이나 야키토리로 후쿠오카 분위기 즐기기', address: 'Nakasu, Fukuoka' },
    ],
    [
      { type: 'sightseeing', name: '오호리공원 산책', time: '10:00', memo: '도심에서 쉬어가기 좋은 호수 산책 코스', address: 'Ohori Park, Fukuoka' },
      { type: 'meal', name: '텐진 점심', time: '12:30', memo: '모츠나베, 고마사바, 라멘 중 선택', address: 'Tenjin, Fukuoka' },
      { type: 'shopping', name: '텐진 지하상가', time: '15:00', memo: '날씨와 상관없이 쇼핑하기 좋은 구간', address: 'Tenjin Underground Mall' },
      { type: 'meal', name: '하카타역 저녁', time: '19:00', memo: '역 빌딩 식당가나 이자카야로 마무리', address: 'Hakata Station' },
    ],
    [
      { type: 'transport', name: '다자이후 이동', time: '09:30', memo: '니시테쓰 전철로 당일치기 이동', address: 'Dazaifu Station' },
      { type: 'sightseeing', name: '다자이후 텐만구', time: '10:30', memo: '참배길 간식과 함께 천천히 둘러보기', address: 'Dazaifu Tenmangu' },
      { type: 'meal', name: '우메가에모치 간식/점심', time: '12:30', memo: '상점가에서 가볍게 식사와 디저트', address: 'Dazaifu Tenmangu Approach' },
      { type: 'sightseeing', name: '규슈국립박물관', time: '14:30', memo: '비 오는 날에도 좋은 실내 코스', address: 'Kyushu National Museum' },
      { type: 'transport', name: '후쿠오카 복귀', time: '17:30', memo: '저녁은 텐진이나 하카타에서 여유롭게', address: 'Tenjin, Fukuoka' },
    ],
    [
      { type: 'transport', name: '이토시마 출발', time: '09:00', memo: '렌터카 또는 버스 동선을 미리 확인', address: 'Itoshima, Fukuoka' },
      { type: 'sightseeing', name: '사쿠라이 후타미가우라', time: '10:30', memo: '바다와 부부바위 사진 코스', address: 'Sakurai Futamigaura, Itoshima' },
      { type: 'meal', name: '이토시마 해변 카페', time: '12:30', memo: '오션뷰 카페나 해산물 식당 추천', address: 'Itoshima Beach' },
      { type: 'sightseeing', name: '해안 드라이브', time: '15:00', memo: '날씨 좋은 날 가장 만족도가 높은 근교 코스', address: 'Itoshima, Fukuoka' },
      { type: 'transport', name: '후쿠오카 복귀', time: '18:00', memo: '저녁은 숙소 근처에서 가볍게', address: 'Hakata Station' },
    ],
    [
      { type: 'transport', name: '기타큐슈 이동', time: '09:00', memo: 'JR로 고쿠라/모지코 방향 이동', address: 'Kokura Station' },
      { type: 'sightseeing', name: '고쿠라성', time: '10:30', memo: '도심 산책과 함께 보기 좋은 짧은 코스', address: 'Kokura Castle' },
      { type: 'meal', name: '고쿠라 점심', time: '12:30', memo: '야키우동이나 현지 정식 추천', address: 'Kokura, Kitakyushu' },
      { type: 'sightseeing', name: '모지코 레트로', time: '15:00', memo: '항구 풍경과 레트로 건축 산책', address: 'Mojiko Retro' },
      { type: 'transport', name: '후쿠오카 복귀', time: '18:30', memo: '돌아와서 야식이나 온천 휴식', address: 'Hakata Station' },
    ],
    [
      { type: 'transport', name: '유후인/벳푸 출발', time: '08:30', memo: '고속버스나 특급열차 예약 권장', address: 'Yufuin Station' },
      { type: 'sightseeing', name: '유후인 긴린코', time: '11:30', memo: '호수와 상점가를 묶어 걷기', address: 'Kinrin Lake, Yufuin' },
      { type: 'meal', name: '유후인 점심', time: '13:00', memo: '토리텐, 분고규, 디저트 카페 중 선택', address: 'Yufuin Floral Village' },
      { type: 'sightseeing', name: '벳푸 온천', time: '16:00', memo: '시간이 되면 지옥온천 일부만 선택해서 보기', address: 'Beppu Onsen' },
      { type: 'transport', name: '후쿠오카 복귀', time: '19:00', memo: '장거리 이동일이라 저녁은 간단히', address: 'Hakata Station' },
    ],
    [
      { type: 'shopping', name: '하카타역 마지막 쇼핑', time: '10:00', memo: '명란, 과자, 드럭스토어 쇼핑 체크', address: 'Hakata Station' },
      { type: 'transport', name: '후쿠오카 공항 이동', time: '13:00', memo: '공항이 가까워도 국제선은 여유 있게 이동', address: 'Fukuoka Airport' },
      { type: 'meal', name: '공항 식사/면세', time: '15:00', memo: '라멘 활주로나 면세 쇼핑으로 마무리', address: 'Fukuoka Airport' },
    ],
  ];
