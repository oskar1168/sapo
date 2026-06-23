import { sapporoCityTemplate } from './sapporo';
import { tokyoCityTemplate } from './tokyo';
import { osakaCityTemplate } from './osaka';
import type { CityTemplate } from '../../types/travelData';

export const CITY_TEMPLATES: { [key: string]: CityTemplate } = {
  sapporo: sapporoCityTemplate,
  tokyo: tokyoCityTemplate,
  osaka: osakaCityTemplate,
};
