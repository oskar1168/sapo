import { PartnerProduct } from './types';
import { myRealTripSearchUrl } from './providers';

export const FUKUOKA_PARTNER_PRODUCTS: PartnerProduct[] = [
  {
      id: 'myrealtrip-fukuoka-dazaifu-tour',
      provider: 'myrealtrip',
      cityCode: 'fukuoka',
      category: 'tour',
      title: '다자이후/유후인 근교투어',
      desc: '후쿠오카 근교 핵심 코스를 하루에 편하게 이동',
      keyword: '후쿠오카 다자이후 유후인 일일투어',
      icon: 'bus-outline',
      color: '#00b894',
      targetUrl: myRealTripSearchUrl('후쿠오카 다자이후 유후인 일일투어'),
    },
  {
      id: 'myrealtrip-fukuoka-itohima-tour',
      provider: 'myrealtrip',
      cityCode: 'fukuoka',
      category: 'tour',
      title: '이토시마 해안 투어',
      desc: '렌터카 없이 바다, 카페, 포토스팟을 묶기',
      keyword: '후쿠오카 이토시마 투어',
      icon: 'camera-outline',
      color: '#0984e3',
      targetUrl: myRealTripSearchUrl('후쿠오카 이토시마 투어'),
    },
  {
      id: 'myrealtrip-fukuoka-airport-transfer',
      provider: 'myrealtrip',
      cityCode: 'fukuoka',
      category: 'transport',
      title: '후쿠오카 공항 이동',
      desc: '가족/짐 많은 일정이면 픽업 이동을 미리 확인',
      keyword: '후쿠오카 공항 픽업 이동',
      icon: 'car-outline',
      color: '#27ae60',
      targetUrl: myRealTripSearchUrl('후쿠오카 공항 픽업 이동'),
    },
  {
      id: 'myrealtrip-fukuoka-restaurant',
      provider: 'myrealtrip',
      cityCode: 'fukuoka',
      category: 'restaurant',
      title: '후쿠오카 맛집 예약',
      desc: '모츠나베, 야타이, 하카타 인기 맛집은 미리 잡아두면 좋아요',
      keyword: '후쿠오카 맛집 예약 모츠나베 야타이',
      icon: 'restaurant-outline',
      color: '#e17055',
      targetUrl: myRealTripSearchUrl('후쿠오카 맛집 예약 모츠나베 야타이'),
    }
];
