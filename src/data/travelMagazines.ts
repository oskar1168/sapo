import type { PartnerProduct } from './partnerProducts';
import type { RegionItineraryItem } from './region-guides/types';

export type MagazineContentBlock = {
  title: string;
  body: string;
  icon: string;
};

export type TravelMagazine = {
  id: string;
  cityCode: string;
  title: string;
  subtitle: string;
  summary: string;
  coverImageUrl: string;
  tags: string[];
  seasonLabel: string;
  readTime: string;
  articleLead: string;
  enjoyments: MagazineContentBlock[];
  infoBlocks: MagazineContentBlock[];
  nearbyPlaces: MagazineContentBlock[];
  route: string[];
  itineraryItems: RegionItineraryItem[];
  bookingProductIds: string[];
  tips: string[];
};

export const TRAVEL_MAGAZINES: TravelMagazine[] = [
  {
    id: 'sapporo-summer-beer-garden',
    cityCode: 'sapporo',
    title: '삿포로 맥주가든 시즌',
    subtitle: '오도리 공원에서 즐기는 삿포로의 여름 밤',
    summary: '축제 분위기, 맥주 부스, 야경 산책까지 한 번에 즐기는 훗카이도 여름 매거진',
    coverImageUrl:
      'https://images.unsplash.com/photo-1532635235-54f54f2a0f4c?auto=format&fit=crop&w=900&q=80',
    tags: ['시즌', '축제', '맥주', '야경'],
    seasonLabel: '7~8월 추천',
    readTime: '3분',
    articleLead:
      '여름 삿포로는 오도리 공원 일대가 가장 활기차요. 낮에는 공원과 전망대를 가볍게 보고, 해가 지기 시작하면 맥주가든 분위기와 스스키노 야경으로 이어가는 흐름이 잘 맞습니다.',
    enjoyments: [
      {
        title: '오도리 공원 맥주 부스',
        body: '공원 구역마다 분위기가 달라서 한 곳에 오래 머무르기보다 천천히 걸으며 마음에 드는 부스를 고르는 재미가 있어요.',
        icon: 'beer-outline',
      },
      {
        title: '축제 푸드와 간단한 안주',
        body: '징기스칸, 해산물, 감자 요리처럼 훗카이도 느낌이 나는 메뉴를 곁들이면 축제 감성이 더 살아납니다.',
        icon: 'restaurant-outline',
      },
      {
        title: 'TV타워와 오도리 야경',
        body: '밝을 때 공원을 걷고 해가 진 뒤 전망을 보면 같은 장소도 전혀 다른 분위기로 느껴져요.',
        icon: 'moon-outline',
      },
    ],
    infoBlocks: [
      {
        title: '혼잡 시간',
        body: '저녁 식사 시간대는 대기가 길어질 수 있어요. 여유롭게 즐기려면 이른 저녁이나 늦은 시간대를 노리는 편이 좋아요.',
        icon: 'time-outline',
      },
      {
        title: '동선 팁',
        body: '오도리 공원, 다누키코지, 스스키노는 도보로 묶기 좋지만 짐이 많다면 숙소 위치를 먼저 확인해두세요.',
        icon: 'walk-outline',
      },
    ],
    nearbyPlaces: [
      {
        title: '삿포로 TV타워',
        body: '오도리 공원을 위에서 내려다보기 좋은 전망 포인트예요.',
        icon: 'telescope-outline',
      },
      {
        title: '스스키노',
        body: '축제 이후 저녁 식사나 야경 산책으로 이어가기 좋은 번화가예요.',
        icon: 'sparkles-outline',
      },
    ],
    route: ['오도리 공원', '삿포로 TV타워', '다누키코지', '스스키노'],
    itineraryItems: [
      {
        type: 'sightseeing',
        name: '오도리 공원',
        time: '16:00',
        memo: '삿포로 맥주가든 분위기를 즐기기 좋은 중심지',
        latitude: 43.059981,
        longitude: 141.347898,
      },
      {
        type: 'sightseeing',
        name: '삿포로 TV타워',
        time: '17:20',
        memo: '오도리 공원 전경을 보기 좋은 전망 포인트',
        latitude: 43.061028,
        longitude: 141.356368,
      },
      {
        type: 'food',
        name: '스스키노',
        time: '19:30',
        memo: '축제 이후 저녁 식사와 야경을 함께 즐기기 좋은 번화가',
        latitude: 43.055357,
        longitude: 141.35328,
      },
    ],
    bookingProductIds: [
      'myrealtrip-sapporo-airport-transfer',
      'myrealtrip-sapporo-restaurant',
      'myrealtrip-sapporo-jr-pass',
    ],
    tips: ['축제 일정은 매년 달라질 수 있으니 출발 전 공식 일정과 운영 시간을 한 번 더 확인해 주세요.'],
  },
  {
    id: 'tokyo-rainy-day-indoor',
    cityCode: 'tokyo',
    title: '비 오는 날 도쿄 실내 여행',
    subtitle: '날씨가 흐려도 만족도가 높은 전시, 쇼핑, 전망 스팟',
    summary: '팀랩, 긴자, 시부야 스카이를 중심으로 비 오는 날에도 무너지지 않는 도쿄 콘텐츠',
    coverImageUrl:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
    tags: ['실내', '비오는날', '전시', '쇼핑'],
    seasonLabel: '연중 추천',
    readTime: '3분',
    articleLead:
      '도쿄 여행에서 비가 오면 이동 피로가 확 올라가요. 그래서 이 매거진은 실내 체류 시간이 길고 예약으로 대기 리스크를 줄일 수 있는 즐길거리 중심으로 묶었습니다.',
    enjoyments: [
      {
        title: '팀랩 전시 몰입감',
        body: '비 오는 날에도 날씨 영향을 거의 받지 않고, 사진과 영상으로 남기기 좋은 체험형 전시예요.',
        icon: 'color-palette-outline',
      },
      {
        title: '긴자 백화점과 카페',
        body: '쇼핑, 디저트, 식사를 실내 동선으로 해결하기 좋아서 우산을 오래 들고 다니지 않아도 됩니다.',
        icon: 'bag-outline',
      },
      {
        title: '날씨가 풀릴 때 전망대',
        body: '구름이 걷히는 시간대에 맞추면 비 온 뒤의 도시 전망을 볼 수 있어요.',
        icon: 'partly-sunny-outline',
      },
    ],
    infoBlocks: [
      {
        title: '예약 우선순위',
        body: '전시와 전망대는 당일 매진이 생길 수 있으니 여행 전 후보 시간을 2개 정도 잡아두면 좋아요.',
        icon: 'ticket-outline',
      },
      {
        title: '이동 팁',
        body: '비 오는 날은 지하철 출구와 실내 연결 통로를 기준으로 움직이면 체력 소모를 줄일 수 있어요.',
        icon: 'subway-outline',
      },
    ],
    nearbyPlaces: [
      {
        title: '긴자',
        body: '비 오는 날 쇼핑과 카페를 묶기 좋은 대표 지역이에요.',
        icon: 'storefront-outline',
      },
      {
        title: '시부야',
        body: '전망대, 쇼핑몰, 식사를 한 번에 이어가기 좋은 지역이에요.',
        icon: 'business-outline',
      },
    ],
    route: ['팀랩 플래닛', '긴자', '시부야 스카이'],
    itineraryItems: [
      {
        type: 'sightseeing',
        name: '팀랩 플래닛 도쿄',
        time: '11:00',
        memo: '날씨 영향을 덜 받는 예약형 실내 전시',
        latitude: 35.648613,
        longitude: 139.789928,
      },
      {
        type: 'shopping',
        name: '긴자',
        time: '14:00',
        memo: '쇼핑, 카페, 식사를 실내 중심으로 해결하기 좋은 지역',
        latitude: 35.671989,
        longitude: 139.765839,
      },
      {
        type: 'sightseeing',
        name: '시부야 스카이',
        time: '18:30',
        memo: '날씨가 괜찮아지는 시간대에 맞춰 넣기 좋은 전망 명소',
        latitude: 35.658447,
        longitude: 139.702164,
      },
    ],
    bookingProductIds: ['myrealtrip-tokyo-teamlab', 'myrealtrip-tokyo-shibuya-sky', 'myrealtrip-tokyo-metro-pass'],
    tips: ['전망대는 날씨 영향을 받으니, 당일 구름 상태를 보고 시간대를 조정하면 좋아요.'],
  },
  {
    id: 'osaka-first-trip-food-walk',
    cityCode: 'osaka',
    title: '오사카 첫 여행 먹방 가이드',
    subtitle: '난바와 도톤보리에서 무엇을 먹고 어떻게 즐길지',
    summary: '처음 가는 오사카에서 가장 오사카답게 느껴지는 먹거리와 밤 산책 포인트',
    coverImageUrl:
      'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=900&q=80',
    tags: ['첫여행', '먹방', '도톤보리', '쇼핑'],
    seasonLabel: '연중 추천',
    readTime: '2분',
    articleLead:
      '오사카 첫 여행은 멀리 벌리는 것보다 난바 주변을 촘촘하게 즐기는 편이 만족도가 높아요. 도톤보리의 간판, 길거리 음식, 쇼핑 거리를 하나의 경험으로 보면 더 재미있습니다.',
    enjoyments: [
      {
        title: '도톤보리 간판과 강변 분위기',
        body: '글리코상 주변은 낮보다 밤에 더 분위기가 살아나요. 사진을 찍고 강변을 따라 천천히 걸어보세요.',
        icon: 'camera-outline',
      },
      {
        title: '타코야키와 오코노미야키',
        body: '유명 가게만 고집하기보다 대기 시간과 동선을 보고 한 끼를 정하는 편이 여행 피로가 적어요.',
        icon: 'restaurant-outline',
      },
      {
        title: '신사이바시 쇼핑',
        body: '드럭스토어, 패션, 기념품을 한 번에 보기 좋아서 마지막에 쇼핑 시간을 붙이기 좋습니다.',
        icon: 'bag-handle-outline',
      },
    ],
    infoBlocks: [
      {
        title: '혼잡 구간',
        body: '도톤보리 중심부는 저녁에 매우 붐비니 어린이 동반이나 큰 짐이 있다면 시간을 조금 앞당기는 편이 좋아요.',
        icon: 'people-outline',
      },
      {
        title: '쿠폰 활용',
        body: '쇼핑을 할 계획이라면 돈키호테나 드럭스토어 쿠폰을 미리 열어둘 수 있게 안내하면 좋아요.',
        icon: 'pricetag-outline',
      },
    ],
    nearbyPlaces: [
      {
        title: '구로몬시장',
        body: '낮 시간대에 간단히 먹고 구경하기 좋은 시장이에요.',
        icon: 'fish-outline',
      },
      {
        title: '신사이바시',
        body: '도톤보리와 붙어 있어 쇼핑 동선으로 이어가기 좋아요.',
        icon: 'storefront-outline',
      },
    ],
    route: ['구로몬시장', '도톤보리', '신사이바시'],
    itineraryItems: [
      {
        type: 'shopping',
        name: '구로몬시장',
        time: '11:00',
        memo: '오사카 먹거리로 가볍게 시작하기 좋은 시장',
        latitude: 34.665467,
        longitude: 135.506359,
      },
      {
        type: 'sightseeing',
        name: '도톤보리',
        time: '15:00',
        memo: '간판, 간식, 강변 산책을 함께 보기 좋은 대표 지역',
        latitude: 34.668724,
        longitude: 135.501308,
      },
      {
        type: 'shopping',
        name: '신사이바시',
        time: '17:00',
        memo: '쇼핑과 드럭스토어 쿠폰 활용을 함께 보기 좋은 거리',
        latitude: 34.674491,
        longitude: 135.500959,
      },
    ],
    bookingProductIds: ['myrealtrip-osaka-rapit-haruka', 'myrealtrip-osaka-restaurant', 'myrealtrip-japan-donki-coupon'],
    tips: ['난바 숙소라면 첫날이나 마지막 전날에 넣기 좋아요.'],
  },
  {
    id: 'fukuoka-hakata-tenjin-food',
    cityCode: 'fukuoka',
    title: '후쿠오카 도심 먹방 매거진',
    subtitle: '하카타, 텐진, 나카스에서 즐기는 짧고 진한 미식 여행',
    summary: '짧은 이동 거리 안에서 라멘, 쇼핑, 야타이 분위기를 즐기는 후쿠오카 도심 콘텐츠',
    coverImageUrl:
      'https://images.unsplash.com/photo-1554797589-7241bb691973?auto=format&fit=crop&w=900&q=80',
    tags: ['먹방', '야타이', '도심', '쇼핑'],
    seasonLabel: '연중 추천',
    readTime: '2분',
    articleLead:
      '후쿠오카는 공항과 도심이 가까워 짧은 여행에도 여유가 있어요. 이 매거진은 이동을 줄이고 먹거리와 밤 분위기를 진하게 느끼는 데 초점을 맞췄습니다.',
    enjoyments: [
      {
        title: '하카타 라멘과 현지 맛집',
        body: '하카타역 주변은 이동 전후로 식사를 넣기 좋아요. 대기 시간이 긴 곳은 애매한 시간대를 노리면 편합니다.',
        icon: 'restaurant-outline',
      },
      {
        title: '텐진 쇼핑과 카페',
        body: '쇼핑몰과 지하상가가 이어져 있어 비가 와도 움직이기 좋은 지역이에요.',
        icon: 'cafe-outline',
      },
      {
        title: '나카스 야타이 분위기',
        body: '후쿠오카의 밤을 가장 쉽게 느낄 수 있는 경험이에요. 날씨와 대기 상황은 꼭 감안하세요.',
        icon: 'moon-outline',
      },
    ],
    infoBlocks: [
      {
        title: '공항 접근성',
        body: '마지막 날에도 도심에서 공항 이동이 비교적 쉬워서 오전 쇼핑이나 식사를 넣기 좋습니다.',
        icon: 'airplane-outline',
      },
      {
        title: '야타이 주의점',
        body: '영업 여부가 날씨와 요일에 영향을 받을 수 있으니 대체 식당을 하나 준비해두면 안전해요.',
        icon: 'umbrella-outline',
      },
    ],
    nearbyPlaces: [
      {
        title: '캐널시티 하카타',
        body: '식사, 쇼핑, 실내 이동을 한 번에 해결하기 좋은 복합몰이에요.',
        icon: 'business-outline',
      },
      {
        title: '나카스',
        body: '야타이와 강변 밤 분위기를 함께 느낄 수 있는 지역이에요.',
        icon: 'water-outline',
      },
    ],
    route: ['하카타역', '캐널시티 하카타', '텐진', '나카스 야타이'],
    itineraryItems: [
      {
        type: 'sightseeing',
        name: '하카타역',
        time: '11:00',
        memo: '교통과 쇼핑을 함께 보기 좋은 후쿠오카 시작점',
        latitude: 33.590183,
        longitude: 130.420685,
      },
      {
        type: 'shopping',
        name: '캐널시티 하카타',
        time: '14:00',
        memo: '실내 쇼핑과 식사를 함께 해결하기 좋은 복합몰',
        latitude: 33.589728,
        longitude: 130.411674,
      },
      {
        type: 'food',
        name: '나카스 야타이',
        time: '19:00',
        memo: '후쿠오카 밤 분위기를 느끼기 좋은 포장마차 거리',
        latitude: 33.591152,
        longitude: 130.406548,
      },
    ],
    bookingProductIds: ['myrealtrip-fukuoka-airport-transfer', 'myrealtrip-fukuoka-restaurant'],
    tips: ['야타이는 날씨와 대기 영향을 받으니 저녁 식사 대안도 하나 잡아두면 좋아요.'],
  },
  {
    id: 'okinawa-rentcar-north-drive',
    cityCode: 'okinawa',
    title: '오키나와 북부 드라이브 매거진',
    subtitle: '렌터카로 즐기는 바다, 수족관, 해안 도로의 하루',
    summary: '츄라우미 수족관과 코우리대교를 중심으로 북부의 바다 감성을 즐기는 드라이브 콘텐츠',
    coverImageUrl:
      'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?auto=format&fit=crop&w=900&q=80',
    tags: ['렌터카', '바다', '가족여행', '드라이브'],
    seasonLabel: '봄~가을 추천',
    readTime: '3분',
    articleLead:
      '오키나와는 목적지만큼 이동 중 풍경이 큰 매력이에요. 북부 드라이브는 수족관, 바다 전망, 해안 도로를 하루 안에 묶어 즐기기 좋습니다.',
    enjoyments: [
      {
        title: '츄라우미 수족관',
        body: '가족 여행 만족도가 높은 대표 명소예요. 수족관 관람 전후로 해양박공원 산책까지 묶으면 좋아요.',
        icon: 'fish-outline',
      },
      {
        title: '코우리대교 드라이브',
        body: '바다 위를 달리는 느낌이 강한 구간이라 날씨가 좋은 날 사진 포인트로도 좋아요.',
        icon: 'car-sport-outline',
      },
      {
        title: '해변 카페와 전망',
        body: '북부는 이동 시간이 길기 때문에 중간에 전망 좋은 카페를 넣으면 피로가 줄어듭니다.',
        icon: 'cafe-outline',
      },
    ],
    infoBlocks: [
      {
        title: '운전 거리',
        body: '나하 기준 북부 왕복은 긴 편이에요. 저녁 예약을 너무 촘촘하게 잡지 않는 게 좋습니다.',
        icon: 'speedometer-outline',
      },
      {
        title: '렌터카 체크',
        body: '보험, 주차, 반납 시간을 미리 확인해두면 마지막 일정이 훨씬 편해져요.',
        icon: 'key-outline',
      },
    ],
    nearbyPlaces: [
      {
        title: '해양박공원',
        body: '수족관과 함께 산책하기 좋은 넓은 공원이에요.',
        icon: 'leaf-outline',
      },
      {
        title: '아메리칸 빌리지',
        body: '나하로 돌아오는 길에 저녁과 쇼핑을 넣기 좋은 곳이에요.',
        icon: 'storefront-outline',
      },
    ],
    route: ['나하 렌터카 픽업', '츄라우미 수족관', '코우리대교'],
    itineraryItems: [
      {
        type: 'transport',
        name: '나하 렌터카 픽업',
        time: '09:00',
        memo: '북부 이동 전 렌터카 수령과 보험 확인',
        latitude: 26.212401,
        longitude: 127.679187,
      },
      {
        type: 'sightseeing',
        name: '츄라우미 수족관',
        time: '11:30',
        memo: '오키나와 북부 대표 명소',
        latitude: 26.694237,
        longitude: 127.878014,
      },
      {
        type: 'sightseeing',
        name: '코우리대교',
        time: '15:30',
        memo: '바다 드라이브와 사진 스팟으로 좋은 코스',
        latitude: 26.691882,
        longitude: 128.021616,
      },
    ],
    bookingProductIds: ['myrealtrip-okinawa-rentcar', 'myrealtrip-okinawa-churaumi-tour', 'myrealtrip-okinawa-restaurant'],
    tips: ['북부 왕복은 이동 거리가 길어 같은 날 저녁 예약을 너무 촘촘히 잡지 않는 게 좋아요.'],
  },
  {
    id: 'nagoya-ghibli-park-day',
    cityCode: 'nagoya',
    title: '지브리파크 즐길거리 가이드',
    subtitle: '구역별 포인트와 예약 전 알아둘 것',
    summary: '지브리파크 안에서 무엇을 보고 어떻게 시간을 써야 할지 정리한 나고야 핵심 매거진',
    coverImageUrl:
      'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=900&q=80',
    tags: ['지브리', '가족여행', '예약필수', '테마파크'],
    seasonLabel: '연중 추천',
    readTime: '3분',
    articleLead:
      '지브리파크는 단순히 들르는 장소라기보다 예약 시간과 구역별 관람 흐름이 중요한 테마형 여행지예요. 좋아하는 작품과 동행자 취향에 맞춰 즐길 포인트를 먼저 잡아두면 만족도가 올라갑니다.',
    enjoyments: [
      {
        title: '지브리의 대창고',
        body: '실내 전시와 포토 포인트가 많아 처음 방문자에게 가장 핵심이 되는 구역이에요.',
        icon: 'albums-outline',
      },
      {
        title: '청춘의 언덕',
        body: '작품 속 분위기를 천천히 감상하기 좋은 구역이라 사진을 좋아하는 여행자에게 잘 맞아요.',
        icon: 'camera-outline',
      },
      {
        title: '마녀의 계곡',
        body: '테마성이 강한 공간이라 아이 동반이나 지브리 팬이라면 시간을 넉넉히 잡는 편이 좋아요.',
        icon: 'sparkles-outline',
      },
    ],
    infoBlocks: [
      {
        title: '티켓과 입장 시간',
        body: '구역별 티켓과 입장 시간이 달라질 수 있어요. 예약 내역을 기준으로 하루 흐름을 먼저 정해야 합니다.',
        icon: 'ticket-outline',
      },
      {
        title: '나고야에서 이동',
        body: '대중교통으로 이동 가능하지만 환승과 도보 시간이 있어 출발 시간을 넉넉히 잡아야 해요.',
        icon: 'train-outline',
      },
    ],
    nearbyPlaces: [
      {
        title: '나고야역',
        body: '교통과 숙소 기준점으로 잡기 좋은 출발지예요.',
        icon: 'train-outline',
      },
      {
        title: '사카에',
        body: '지브리파크 방문 후 저녁 식사와 쇼핑을 이어가기 좋은 번화가예요.',
        icon: 'restaurant-outline',
      },
    ],
    route: ['나고야역', '지브리파크', '사카에'],
    itineraryItems: [
      {
        type: 'transport',
        name: '나고야역',
        time: '09:00',
        memo: '지브리파크 이동 전 교통 동선 확인',
        latitude: 35.170915,
        longitude: 136.881537,
      },
      {
        type: 'sightseeing',
        name: '지브리파크',
        time: '11:00',
        memo: '예약 시간에 맞춰 여유 있게 이동해야 하는 핵심 일정',
        latitude: 35.173489,
        longitude: 137.089899,
      },
      {
        type: 'food',
        name: '사카에',
        time: '18:30',
        memo: '나고야 저녁 식사와 쇼핑을 함께 보기 좋은 번화가',
        latitude: 35.167706,
        longitude: 136.907301,
      },
    ],
    bookingProductIds: ['myrealtrip-nagoya-ghibli', 'myrealtrip-nagoya-transport-pass', 'myrealtrip-nagoya-restaurant'],
    tips: ['지브리파크 입장 시간에 따라 앞뒤 일정을 넉넉하게 조정하는 게 좋아요.'],
  },
];

export function getTravelMagazinesForCity(cityCode: string) {
  return TRAVEL_MAGAZINES.filter((magazine) => magazine.cityCode === cityCode);
}

export function getMagazineBookingProducts(magazine: TravelMagazine, products: PartnerProduct[]) {
  return magazine.bookingProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is PartnerProduct => Boolean(product));
}
