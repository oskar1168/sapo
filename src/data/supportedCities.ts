export type SupportedCity = {
  code: string;
  name: string;
  shortName: string;
  desc: string;
  emoji: string;
  bg: string;
  exploreLabel: string;
  regions: string[];
};

export const SUPPORTED_CITIES: SupportedCity[] = [
  {
    code: 'sapporo',
    name: '홋카이도',
    shortName: '홋카이도',
    desc: '홋카이도 도심, 운하, 자연 코스를 묶은 감성 여행',
    emoji: '❄️',
    bg: '#6c5ce7',
    exploreLabel: '홋카이도',
    regions: ['삿포로', '오타루', '비에이/후라노', '하코다테'],
  },
  {
    code: 'tokyo',
    name: '도쿄',
    shortName: '도쿄',
    desc: '쇼핑, 미식, 전망, 근교까지 한 번에',
    emoji: '🗼',
    bg: '#ff7675',
    exploreLabel: '도쿄',
    regions: ['신주쿠/시부야', '아사쿠사', '디즈니', '긴자', '근교'],
  },
  {
    code: 'osaka',
    name: '오사카',
    shortName: '오사카',
    desc: '간사이 먹거리, USJ, 교토 당일치기 코스',
    emoji: '🐙',
    bg: '#fdcb6e',
    exploreLabel: '오사카',
    regions: ['오사카', '교토', '나라', '고베', 'USJ'],
  },
  {
    code: 'fukuoka',
    name: '후쿠오카',
    shortName: '후쿠오카',
    desc: '하카타 미식, 다자이후, 이토시마 근교 여행',
    emoji: '🍜',
    bg: '#00b894',
    exploreLabel: '후쿠오카',
    regions: ['하카타/텐진', '다자이후', '이토시마', '기타큐슈', '유후인/벳푸'],
  },
  {
    code: 'okinawa',
    name: '오키나와',
    shortName: '오키나와',
    desc: '나하, 차탄, 온나손, 북부 드라이브 휴양 여행',
    emoji: '🌺',
    bg: '#0984e3',
    exploreLabel: '오키나와',
    regions: ['나하', '차탄', '온나손', '나고/모토부', '남부'],
  },
  {
    code: 'nagoya',
    name: '나고야',
    shortName: '나고야',
    desc: '중부 미식, 지브리파크, 다카야마 확장 코스',
    emoji: '🏯',
    bg: '#a29bfe',
    exploreLabel: '중부',
    regions: ['나고야', '지브리파크', '이누야마', '다카야마', '시라카와고'],
  },
];

export function getSupportedCity(cityCode: string) {
  return SUPPORTED_CITIES.find((city) => city.code === cityCode) || SUPPORTED_CITIES[0];
}
