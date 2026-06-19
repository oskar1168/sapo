import { SUPPORTED_CITIES, getSupportedCity } from '../data/supportedCities';

export type CityDetails = {
  code: string;
  name: string;
  desc: string;
  emoji: string;
  bg: string;
};

export const CITY_OPTIONS: CityDetails[] = SUPPORTED_CITIES.map((city) => ({
  code: city.code,
  name: city.name,
  desc: city.desc,
  emoji: city.emoji,
  bg: city.bg,
}));

export const getDday = (startDateStr: string) => {
  if (!startDateStr) return 'D-??';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);

  const diffTime = start.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'D-Day';
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
};

export const getCityDetails = (cityCode: string) => {
  const city = getSupportedCity(cityCode);
  return {
    code: city.code,
    name: city.name,
    desc: city.desc,
    emoji: city.emoji,
    bg: city.bg,
  };
};

export const buildDefaultTripTitle = (cityName: string) => {
  return `${cityName} 여행`;
};

export const isTripMetadataFormValid = (title: string, startDate: string, endDate: string) => {
  return Boolean(title.trim() && startDate && endDate && endDate > startDate);
};
