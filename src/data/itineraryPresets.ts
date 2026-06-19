import { ActivityItem } from '../types/travelData';

type PresetActivity = Omit<ActivityItem, 'id'>;
type CityPreset = PresetActivity[][];

const itineraryPresets: Record<string, CityPreset> = {
  sapporo: [
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
  ],
  tokyo: [
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
  ],
  osaka: [
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
  ],
  fukuoka: [
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
  ],
  okinawa: [
    [
      { type: 'transport', name: '나하공항 도착', time: '11:30', memo: '렌터카 수령 또는 유이레일로 숙소 이동', address: 'Naha Airport' },
      { type: 'lodging', name: '호텔 체크인', time: '15:00', memo: '첫날은 나하 중심으로 부담 없이 시작', address: 'Kokusai Dori, Naha' },
      { type: 'shopping', name: '국제거리 산책', time: '17:00', memo: '기념품, 간식, 저녁 식당을 함께 보기 좋음', address: 'Kokusai Dori, Naha' },
      { type: 'meal', name: '오키나와 요리 저녁', time: '19:00', memo: '고야참푸루, 아구돼지, 오키나와 소바 추천', address: 'Naha, Okinawa' },
    ],
    [
      { type: 'sightseeing', name: '슈리성 공원', time: '10:00', memo: '복원 구역과 전망 포인트 산책', address: 'Shurijo Castle Park' },
      { type: 'meal', name: '나하 점심', time: '12:30', memo: '오키나와 소바나 정식으로 가볍게', address: 'Naha, Okinawa' },
      { type: 'sightseeing', name: '세나가지마 우미카지테라스', time: '16:00', memo: '공항 근처 바다 전망과 카페 코스', address: 'Senagajima Umikaji Terrace' },
      { type: 'meal', name: '국제거리 저녁', time: '19:00', memo: '라이브 이자카야나 현지 식당 선택', address: 'Kokusai Dori, Naha' },
    ],
    [
      { type: 'transport', name: '차탄 이동', time: '09:30', memo: '렌터카 또는 버스로 중부 해안 이동', address: 'Chatan, Okinawa' },
      { type: 'sightseeing', name: '아메리칸 빌리지', time: '10:30', memo: '상점, 카페, 바다 전망을 함께 보기', address: 'American Village, Chatan' },
      { type: 'meal', name: '차탄 브런치', time: '12:30', memo: '버거, 타코라이스, 카페 메뉴 추천', address: 'American Village, Chatan' },
      { type: 'sightseeing', name: '선셋비치', time: '17:30', memo: '일몰 시간에 맞춰 산책', address: 'Sunset Beach, Chatan' },
    ],
    [
      { type: 'transport', name: '온나손 해안 드라이브', time: '09:00', memo: '푸른 동굴/만좌모 동선을 날씨에 맞춰 선택', address: 'Onna, Okinawa' },
      { type: 'sightseeing', name: '만좌모', time: '10:30', memo: '짧게 보기 좋은 대표 해안 절경', address: 'Cape Manzamo' },
      { type: 'meal', name: '온나손 점심', time: '12:30', memo: '해변 카페나 오키나와 정식', address: 'Onna, Okinawa' },
      { type: 'sightseeing', name: '푸른 동굴/마에다곶', time: '14:30', memo: '해양 액티비티는 사전 예약 권장', address: 'Cape Maeda' },
    ],
    [
      { type: 'transport', name: '북부 모토부 이동', time: '08:30', memo: '장거리 이동이라 출발 시간을 여유 있게', address: 'Motobu, Okinawa' },
      { type: 'sightseeing', name: '츄라우미 수족관', time: '10:30', memo: '고래상어 수조와 해양박공원을 함께 보기', address: 'Okinawa Churaumi Aquarium' },
      { type: 'meal', name: '모토부 점심', time: '13:00', memo: '오키나와 소바나 해산물 추천', address: 'Motobu, Okinawa' },
      { type: 'sightseeing', name: '비세 후쿠기 가로수길', time: '15:00', memo: '자전거 또는 산책으로 느긋하게', address: 'Bise Fukugi Tree Road' },
      { type: 'transport', name: '나하/중부 복귀', time: '18:30', memo: '운전 피로를 감안해 저녁은 간단히', address: 'Naha, Okinawa' },
    ],
    [
      { type: 'sightseeing', name: '남부 평화기념공원', time: '10:00', memo: '오키나와 역사와 바다 전망을 함께 보는 코스', address: 'Okinawa Peace Memorial Park' },
      { type: 'meal', name: '남부 카페 점심', time: '12:30', memo: '바다 전망 카페나 현지 식당 선택', address: 'Nanjo, Okinawa' },
      { type: 'sightseeing', name: '니라이카나이 다리', time: '15:00', memo: '드라이브 전망 포인트', address: 'Nirai Kanai Bridge' },
      { type: 'sightseeing', name: '세이화우타키', time: '16:00', memo: '시간과 체력에 맞춰 짧게 산책', address: 'Sefa-Utaki' },
    ],
    [
      { type: 'shopping', name: '국제거리 마지막 쇼핑', time: '10:00', memo: '블루씰, 베니이모타르트, 기념품 체크', address: 'Kokusai Dori, Naha' },
      { type: 'transport', name: '나하공항 이동', time: '13:00', memo: '렌터카 반납 시간이 있으면 더 여유 있게', address: 'Naha Airport' },
      { type: 'meal', name: '공항 식사/면세', time: '15:00', memo: '출국 전 오키나와 메뉴로 마무리', address: 'Naha Airport' },
    ],
  ],
  nagoya: [
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
  ],
};

export function buildPresetTripDays(cityCode: string, dayCount: number) {
  const preset = itineraryPresets[cityCode] || [];
  const finalDayActivities = preset[preset.length - 1] || [];
  const regularDays = preset.slice(0, -1);

  return Array.from({ length: dayCount }).reduce<Record<string, ActivityItem[]>>((days, _, index) => {
    const dayKey = `day${index + 1}`;
    const isFinalTripDay = index === dayCount - 1;
    const activities = isFinalTripDay ? finalDayActivities : regularDays[index] || [];
    days[dayKey] = activities.map((activity, activityIndex) => ({
      id: (index + 1) * 100 + activityIndex + 1,
      ...activity,
    }));
    return days;
  }, {});
}

export function hasItineraryPreset(cityCode: string) {
  return Boolean(itineraryPresets[cityCode]);
}
