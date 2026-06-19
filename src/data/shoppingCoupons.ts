export type ShoppingCoupon = {
  id: string;
  cityCode: string | 'japan';
  title: string;
  desc: string;
  provider: 'klook' | 'official' | 'myrealtrip';
  icon: string;
  color: string;
  targetUrl: string;
};

const klookSearchUrl = (keyword: string) =>
  `https://www.klook.com/ko/search/result/?query=${encodeURIComponent(keyword)}`;

export const SHOPPING_COUPONS: ShoppingCoupon[] = [
  {
    id: 'klook-japan-donki-coupon',
    cityCode: 'japan',
    title: '돈키호테 할인 쿠폰',
    desc: '기념품, 화장품, 드럭스토어 쇼핑 전에 먼저 확인하기 좋아요.',
    provider: 'klook',
    icon: 'storefront-outline',
    color: '#ff7675',
    targetUrl: klookSearchUrl('일본 돈키호테 할인 쿠폰'),
  },
  {
    id: 'klook-japan-bic-camera-coupon',
    cityCode: 'japan',
    title: '빅카메라 할인 쿠폰',
    desc: '전자제품, 생활가전, 뷰티 디바이스 쇼핑 전에 확인해보세요.',
    provider: 'klook',
    icon: 'camera-outline',
    color: '#4a90e2',
    targetUrl: klookSearchUrl('일본 빅카메라 할인 쿠폰'),
  },
  {
    id: 'klook-sapporo-drugstore-coupon',
    cityCode: 'sapporo',
    title: '삿포로 드럭스토어 쿠폰',
    desc: '사츠도라, 츠루하 등 홋카이도 쇼핑 쿠폰을 찾아볼 수 있어요.',
    provider: 'klook',
    icon: 'medkit-outline',
    color: '#00b894',
    targetUrl: klookSearchUrl('삿포로 드럭스토어 쿠폰 사츠도라'),
  },
  {
    id: 'klook-tokyo-drugstore-coupon',
    cityCode: 'tokyo',
    title: '도쿄 드럭스토어 쿠폰',
    desc: '마츠모토키요시, 선드럭, 코코카라파인 쿠폰을 확인해보세요.',
    provider: 'klook',
    icon: 'medkit-outline',
    color: '#00b894',
    targetUrl: klookSearchUrl('도쿄 드럭스토어 쿠폰 마츠모토키요시'),
  },
  {
    id: 'klook-osaka-drugstore-coupon',
    cityCode: 'osaka',
    title: '오사카 드럭스토어 쿠폰',
    desc: '난바, 도톤보리 쇼핑 전에 드럭스토어 쿠폰을 챙겨보세요.',
    provider: 'klook',
    icon: 'medkit-outline',
    color: '#00b894',
    targetUrl: klookSearchUrl('오사카 드럭스토어 쿠폰 난바'),
  },
  {
    id: 'klook-fukuoka-drugstore-coupon',
    cityCode: 'fukuoka',
    title: '후쿠오카 드럭스토어 쿠폰',
    desc: '하카타, 텐진 근처 드럭스토어 할인 정보를 확인해보세요.',
    provider: 'klook',
    icon: 'medkit-outline',
    color: '#00b894',
    targetUrl: klookSearchUrl('후쿠오카 드럭스토어 쿠폰 하카타 텐진'),
  },
  {
    id: 'klook-okinawa-drugstore-coupon',
    cityCode: 'okinawa',
    title: '오키나와 드럭스토어 쿠폰',
    desc: '국제거리, 나하 쇼핑 전에 사용할 쿠폰을 찾아볼 수 있어요.',
    provider: 'klook',
    icon: 'medkit-outline',
    color: '#00b894',
    targetUrl: klookSearchUrl('오키나와 드럭스토어 쿠폰 나하 국제거리'),
  },
  {
    id: 'klook-nagoya-drugstore-coupon',
    cityCode: 'nagoya',
    title: '나고야 드럭스토어 쿠폰',
    desc: '사카에, 나고야역 주변 쇼핑 전에 쿠폰을 확인해보세요.',
    provider: 'klook',
    icon: 'medkit-outline',
    color: '#00b894',
    targetUrl: klookSearchUrl('나고야 드럭스토어 쿠폰 사카에'),
  },
];

export function getShoppingCouponsForCity(cityCode: string) {
  const cityCoupons = SHOPPING_COUPONS.filter((coupon) => coupon.cityCode === cityCode);
  const commonCoupons = SHOPPING_COUPONS.filter((coupon) => coupon.cityCode === 'japan');

  return [...commonCoupons, ...cityCoupons];
}
