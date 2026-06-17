export type CityDetails = {
  code: string;
  name: string;
  desc: string;
  emoji: string;
  bg: string;
};

export const CITY_OPTIONS: CityDetails[] = [
  {
    code: 'sapporo',
    name: '삿포로 & 오타루',
    desc: '초여름 운하와 야경이 있는 감성 여행',
    emoji: '✈️',
    bg: '#6c5ce7',
  },
  {
    code: 'tokyo',
    name: '도쿄',
    desc: '쇼핑, 미식, 도시 감성을 한 번에',
    emoji: '🗼',
    bg: '#ff7675',
  },
  {
    code: 'osaka',
    name: '오사카 & 교토',
    desc: '먹거리와 천년 고도 산책 코스',
    emoji: '🏯',
    bg: '#fdcb6e',
  },
];

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
  return CITY_OPTIONS.find((city) => city.code === cityCode) || CITY_OPTIONS[0];
};

export const buildDefaultTripTitle = (cityName: string) => {
  return `${cityName} 힐링 여행`;
};

export const isTripMetadataFormValid = (title: string, startDate: string, endDate: string) => {
  return Boolean(title.trim() && startDate && endDate && endDate > startDate);
};
