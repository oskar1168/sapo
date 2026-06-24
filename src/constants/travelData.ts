import { CITY_TEMPLATES } from '../data/city-templates';

export type {
  ActivityItem,
  AffiliateDealItem,
  ChecklistItem,
  CityExploreItem,
  CityTemplate,
  GuidebookItem,
  ShoppingItem,
  SpotItem,
} from '../types/travelData';

export { CITY_TEMPLATES };

export const SPOT_CATEGORIES: {
  [key: string]: { label: string; shortLabel: string; icon: string; dbCategories?: string[] };
} = {
  content: { label: "📺 방송·유튜브", shortLabel: "화제", icon: "play-circle" },
  spot: { label: "🏞️ 명소 / 관광지", shortLabel: "명소", icon: "landscape", dbCategories: ["spot"] },
  food: { label: "🍽️ 맛집 / 식당", shortLabel: "맛집", icon: "restaurant", dbCategories: ["meat", "seafood", "noodle"] },
  dessert: { label: "🍰 디저트 / 카페", shortLabel: "카페", icon: "cafe", dbCategories: ["dessert", "cafe"] },
  shopping: { label: "🛍️ 쇼핑 / 소품샵", shortLabel: "쇼핑", icon: "bag", dbCategories: ["shopping"] }
};

export const DETAILED_CATEGORIES: { [key: string]: { label: string; icon: string } } = {
  spot: { label: "🏞️ 명소 / 관광지", icon: "landscape" },
  meat: { label: "🥩 고기 / 육류", icon: "restaurant" },
  seafood: { label: "🐟 해산물 / 스시", icon: "water" },
  noodle: { label: "🍛 면 / 스프카레", icon: "soup" },
  dessert: { label: "🍰 디저트 / 카페", icon: "cafe" },
  cafe: { label: "☕ 카페 / 음료", icon: "cafe" },
  shopping: { label: "🛍️ 쇼핑 / 소품샵", icon: "bag" },
  etc: { label: "⚙️ 기타", icon: "ellipsis" }
};

export { SAPPORO_FOOD_LIST } from '../data/spots/sapporo';
export { OTARU_FOOD_LIST } from '../data/spots/otaru';
export { TOKYO_FOOD_LIST } from '../data/spots/tokyo';
export { OSAKA_FOOD_LIST } from '../data/spots/osaka';

export const LOCATION_COORDINATES: { [key: string]: [number, number] } = {
  "도쿄역": [35.6812, 139.7671],
  "신주쿠역": [35.6896, 139.6917],
  "시부야 스카이": [35.6585, 139.7023],
  "도쿄 디즈니랜드": [35.6329, 139.8804],
  "아사쿠사 센소지": [35.7148, 139.7967],
  "도쿄 타워": [35.6586, 139.7454],
  "오사카역": [34.7024, 135.4959],
  "도톤보리": [34.6687, 135.5013],
  "유니버설 스튜디오 재팬": [34.6654, 135.4323],
  "오사카성": [34.6873, 135.5262],
  "우메다 공중정원": [34.7053, 135.4902],
  "교토역": [34.9858, 135.7588],
  "신치토세 공항": [42.7874, 141.6811],
  "삿포로역": [43.0686, 141.3508],
  "머큐어 호텔 삿포로": [43.0560, 141.3556],
  "스스키노": [43.0556, 141.3538],
  "오도리 공원": [43.0601, 141.3491],
  "징기스칸 다루마": [43.0545, 141.3533],
  "스프카레 가라쿠": [43.0570, 141.3552],
  "스프카레 스아게플러스": [43.0558, 141.3527],
  "오타루 운하": [43.2014, 141.0022],
  "오타루역": [43.1970, 140.9942],
  "오타루 마사즈시": [43.1931, 141.0006],
  "사카이마치 거리": [43.1918, 141.0076],
  "오타루 오르골당": [43.1903, 141.0078],
  "오타루 르타오 본점": [43.1908, 141.0076],
  "비에이역": [43.5902, 142.4578],
  "준페이": [43.5900, 142.4415],
  "청의 호수": [43.4936, 142.6144],
  "흰수염 폭포": [43.4735, 142.6393],
  "후라노": [43.3421, 142.3831],
  "팜 도미타": [43.4181, 142.4278],
  "닝글테라스": [43.3232, 142.3582]
};
