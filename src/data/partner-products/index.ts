import { PartnerProduct } from './types';
import { COMMON_PARTNER_PRODUCTS } from './common';
import { SAPPORO_PARTNER_PRODUCTS } from './sapporo';
import { TOKYO_PARTNER_PRODUCTS } from './tokyo';
import { OSAKA_PARTNER_PRODUCTS } from './osaka';
import { FUKUOKA_PARTNER_PRODUCTS } from './fukuoka';
import { OKINAWA_PARTNER_PRODUCTS } from './okinawa';
import { NAGOYA_PARTNER_PRODUCTS } from './nagoya';

export * from './types';
export { myRealTripSearchUrl } from './providers';

export const PARTNER_PRODUCTS: PartnerProduct[] = [
  ...COMMON_PARTNER_PRODUCTS,
  ...SAPPORO_PARTNER_PRODUCTS,
  ...TOKYO_PARTNER_PRODUCTS,
  ...OSAKA_PARTNER_PRODUCTS,
  ...FUKUOKA_PARTNER_PRODUCTS,
  ...OKINAWA_PARTNER_PRODUCTS,
  ...NAGOYA_PARTNER_PRODUCTS,
];

export function getPartnerProductsForCity(cityCode: string) {
  const cityProducts = PARTNER_PRODUCTS.filter((product) => product.cityCode === cityCode);
  const commonProducts = PARTNER_PRODUCTS.filter((product) => product.cityCode === 'japan');

  return [...cityProducts, ...commonProducts];
}
