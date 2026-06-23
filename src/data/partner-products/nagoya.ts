import { PartnerProduct } from './types';
import { myRealTripSearchUrl } from './providers';

export const NAGOYA_PARTNER_PRODUCTS: PartnerProduct[] = [
  {
      id: 'myrealtrip-nagoya-ghibli',
      provider: 'myrealtrip',
      cityCode: 'nagoya',
      category: 'ticket',
      title: '지브리파크 입장권',
      desc: '구역별 예약이 필요한 나고야 핵심 목적지',
      keyword: '나고야 지브리파크 입장권',
      icon: 'ticket-outline',
      color: '#a29bfe',
      targetUrl: myRealTripSearchUrl('나고야 지브리파크 입장권'),
    },
  {
      id: 'myrealtrip-nagoya-shirakawago-tour',
      provider: 'myrealtrip',
      cityCode: 'nagoya',
      category: 'tour',
      title: '다카야마/시라카와고 투어',
      desc: '중부 산악 근교는 버스투어로 동선 부담 줄이기',
      keyword: '나고야 다카야마 시라카와고 일일투어',
      icon: 'trail-sign-outline',
      color: '#6c5ce7',
      targetUrl: myRealTripSearchUrl('나고야 다카야마 시라카와고 일일투어'),
    },
  {
      id: 'myrealtrip-nagoya-transport-pass',
      provider: 'myrealtrip',
      cityCode: 'nagoya',
      category: 'pass',
      title: '나고야/중부 교통패스',
      desc: '공항, 근교, 시내 이동비를 미리 비교',
      keyword: '나고야 중부 교통패스 메이테츠',
      icon: 'train-outline',
      color: '#f39c12',
      targetUrl: myRealTripSearchUrl('나고야 중부 교통패스 메이테츠'),
    },
  {
      id: 'myrealtrip-nagoya-restaurant',
      provider: 'myrealtrip',
      cityCode: 'nagoya',
      category: 'restaurant',
      title: '나고야 맛집 예약',
      desc: '히츠마부시, 나고야메시, 인기 장어 맛집을 미리 찾아보세요',
      keyword: '나고야 맛집 예약 히츠마부시 나고야메시',
      icon: 'restaurant-outline',
      color: '#e17055',
      targetUrl: myRealTripSearchUrl('나고야 맛집 예약 히츠마부시 나고야메시'),
    }
];
