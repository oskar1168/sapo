export type PartnerProvider = 'myrealtrip' | 'klook' | 'kkday' | 'official';

export type PartnerProductCategory = 'tour' | 'ticket' | 'transport' | 'pass' | 'restaurant' | 'coupon';

export type PartnerProduct = {
  id: string;
  provider: PartnerProvider;
  cityCode: string;
  category: PartnerProductCategory;
  title: string;
  desc: string;
  keyword?: string;
  icon: string;
  color: string;
  imageUrl?: string;
  targetUrl: string;
  isAffiliate?: boolean;
};

export const partnerProviderLabels: Record<PartnerProvider, string> = {
  myrealtrip: '마이리얼트립',
  klook: '클룩',
  kkday: 'KKday',
  official: '공식',
};
