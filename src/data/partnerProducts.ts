export type PartnerProduct = {
  id: string;
  provider: 'myrealtrip';
  cityCode: string;
  category: 'tour' | 'ticket' | 'transport' | 'pass';
  title: string;
  desc: string;
  keyword: string;
  icon: string;
  color: string;
  imageUrl?: string;
  targetUrl: string;
};

const myRealTripSearchUrl = (keyword: string) =>
  `https://www.myrealtrip.com/search?keyword=${encodeURIComponent(keyword)}`;

export const PARTNER_PRODUCTS: PartnerProduct[] = [
  {
    id: 'myrealtrip-japan-donki-coupon',
    provider: 'myrealtrip',
    cityCode: 'japan',
    category: 'pass',
    title: '돈키호테 할인쿠폰',
    desc: '일본 쇼핑 전에 미리 받아두면 좋은 쿠폰',
    keyword: '돈키호테 할인쿠폰 일본',
    icon: 'pricetag-outline',
    color: '#f39c12',
    targetUrl: 'https://myrealt.rip/c0ZXb8',
  },
  {
    id: 'myrealtrip-sapporo-biei-furano',
    provider: 'myrealtrip',
    cityCode: 'sapporo',
    category: 'tour',
    title: '비에이/후라노 일일투어',
    desc: '렌터카 없이 인기 코스를 하루에 둘러보기',
    keyword: '삿포로 비에이 후라노 일일투어',
    icon: 'bus-outline',
    color: '#4a90e2',
    imageUrl:
      'https://dry7pvlp22cox.cloudfront.net/mrt-images-prod/2024/06/27/tJqk/NLTULKHS59.jpg?width=480&height=360&operation=crop&quality=99',
    targetUrl: 'https://myrealt.rip/c0N90a',
  },
  {
    id: 'myrealtrip-sapporo-airport-transfer',
    provider: 'myrealtrip',
    cityCode: 'sapporo',
    category: 'transport',
    title: '신치토세 공항 이동',
    desc: '도착 첫날 이동 동선을 미리 정리하기',
    keyword: '신치토세 공항 삿포로 이동 픽업',
    icon: 'car-outline',
    color: '#27ae60',
    targetUrl: myRealTripSearchUrl('신치토세 공항 삿포로 이동 픽업'),
  },
  {
    id: 'myrealtrip-sapporo-otaru-tour',
    provider: 'myrealtrip',
    cityCode: 'sapporo',
    category: 'tour',
    title: '오타루 근교 투어',
    desc: '운하, 오르골당, 근교 명소를 편하게 연결',
    keyword: '오타루 일일투어 삿포로 출발',
    icon: 'map-outline',
    color: '#6c5ce7',
    targetUrl: myRealTripSearchUrl('오타루 일일투어 삿포로 출발'),
  },
  {
    id: 'myrealtrip-tokyo-disney',
    provider: 'myrealtrip',
    cityCode: 'tokyo',
    category: 'ticket',
    title: '도쿄 디즈니 티켓',
    desc: '디즈니랜드/디즈니씨 방문 전 예약',
    keyword: '도쿄 디즈니랜드 디즈니씨 티켓',
    icon: 'ticket-outline',
    color: '#ff7675',
    targetUrl: myRealTripSearchUrl('도쿄 디즈니랜드 디즈니씨 티켓'),
  },
  {
    id: 'myrealtrip-tokyo-skytree',
    provider: 'myrealtrip',
    cityCode: 'tokyo',
    category: 'ticket',
    title: '스카이트리 입장권',
    desc: '도쿄 전망 명소를 일정에 맞춰 예약',
    keyword: '도쿄 스카이트리 입장권',
    icon: 'business-outline',
    color: '#4a90e2',
    targetUrl: myRealTripSearchUrl('도쿄 스카이트리 입장권'),
  },
  {
    id: 'myrealtrip-tokyo-fuji-hakone',
    provider: 'myrealtrip',
    cityCode: 'tokyo',
    category: 'tour',
    title: '후지산/하코네 투어',
    desc: '도쿄 근교 대표 코스를 당일로 다녀오기',
    keyword: '도쿄 후지산 하코네 일일투어',
    icon: 'trail-sign-outline',
    color: '#27ae60',
    targetUrl: myRealTripSearchUrl('도쿄 후지산 하코네 일일투어'),
  },
  {
    id: 'myrealtrip-osaka-usj',
    provider: 'myrealtrip',
    cityCode: 'osaka',
    category: 'ticket',
    title: 'USJ 입장권/익스프레스',
    desc: '닌텐도 월드, 해리포터 일정 전 미리 확인',
    keyword: '오사카 유니버설 스튜디오 재팬 USJ 익스프레스',
    icon: 'ticket-outline',
    color: '#fd79a8',
    targetUrl: myRealTripSearchUrl('오사카 유니버설 스튜디오 재팬 USJ 익스프레스'),
  },
  {
    id: 'myrealtrip-osaka-kyoto-tour',
    provider: 'myrealtrip',
    cityCode: 'osaka',
    category: 'tour',
    title: '교토 일일투어',
    desc: '청수사, 아라시야마, 후시미이나리 동선 정리',
    keyword: '오사카 출발 교토 일일투어',
    icon: 'map-outline',
    color: '#6c5ce7',
    targetUrl: myRealTripSearchUrl('오사카 출발 교토 일일투어'),
  },
  {
    id: 'myrealtrip-osaka-kansai-pass',
    provider: 'myrealtrip',
    cityCode: 'osaka',
    category: 'pass',
    title: '간사이 교통패스',
    desc: '오사카, 교토, 공항 이동비를 미리 비교',
    keyword: '간사이 패스 오사카 교토 라피트',
    icon: 'train-outline',
    color: '#f39c12',
    targetUrl: myRealTripSearchUrl('간사이 패스 오사카 교토 라피트'),
  },
];

export function getPartnerProductsForCity(cityCode: string) {
  const cityProducts = PARTNER_PRODUCTS.filter((product) => product.cityCode === cityCode);
  const commonProducts = PARTNER_PRODUCTS.filter((product) => product.cityCode === 'japan');

  return [...cityProducts, ...commonProducts];
}
