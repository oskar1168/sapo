import { PartnerProduct } from './types';
import { myRealTripSearchUrl } from './providers';

export const OKINAWA_PARTNER_PRODUCTS: PartnerProduct[] = [
  {
      id: 'myrealtrip-okinawa-rentcar',
      provider: 'myrealtrip',
      cityCode: 'okinawa',
      category: 'transport',
      title: '오키나와 렌터카',
      desc: '북부와 해안 드라이브 일정은 렌터카 확인 필수',
      keyword: '오키나와 렌터카 나하공항',
      icon: 'car-sport-outline',
      color: '#0984e3',
      targetUrl: myRealTripSearchUrl('오키나와 렌터카 나하공항'),
    },
  {
      id: 'myrealtrip-okinawa-churaumi-tour',
      provider: 'myrealtrip',
      cityCode: 'okinawa',
      category: 'tour',
      title: '츄라우미/북부 투어',
      desc: '장거리 운전 없이 북부 대표 코스를 하루에 보기',
      keyword: '오키나와 츄라우미 수족관 북부 일일투어',
      icon: 'bus-outline',
      color: '#00bcd4',
      targetUrl: myRealTripSearchUrl('오키나와 츄라우미 수족관 북부 일일투어'),
    },
  {
      id: 'myrealtrip-okinawa-marine',
      provider: 'myrealtrip',
      cityCode: 'okinawa',
      category: 'ticket',
      title: '푸른동굴 스노클링',
      desc: '온나손 해양 액티비티는 날씨와 예약 확인이 중요',
      keyword: '오키나와 푸른동굴 스노클링',
      icon: 'water-outline',
      color: '#00b894',
      targetUrl: myRealTripSearchUrl('오키나와 푸른동굴 스노클링'),
    },
  {
      id: 'myrealtrip-okinawa-restaurant',
      provider: 'myrealtrip',
      cityCode: 'okinawa',
      category: 'restaurant',
      title: '오키나와 맛집 예약',
      desc: '아구돼지, 민요 이자카야, 바다 전망 식당을 미리 확인하세요',
      keyword: '오키나와 맛집 예약 아구돼지 이자카야',
      icon: 'restaurant-outline',
      color: '#e17055',
      targetUrl: myRealTripSearchUrl('오키나와 맛집 예약 아구돼지 이자카야'),
    }
];
