import { Linking } from 'react-native';

import { PartnerProduct } from '../data/partnerProducts';
import { recordPartnerProductClick } from './partnerTracking';

export async function openPartnerProduct(product: PartnerProduct) {
  void recordPartnerProductClick(product);
  await Linking.openURL(product.targetUrl);
}
