export interface WeatherInfo {
  temp: number;
  desc: string;
  icon: string;
}

export interface ForecastInfo {
  day: string;
  temp: number;
  desc: string;
  icon: string;
}

export interface SeasonGuide {
  seasonName: string;
  temp: number;
  desc: string;
  icon: string;
  tips: string;
}

export const CITY_SEASON_WEATHER: {
  [city: string]: {
    [season: string]: { temp: number; desc: string; icon: string; tips: string };
  };
} = {
  sapporo: {
    spring: { temp: 10, desc: "선선하고 맑음", icon: "🌤️", tips: "낮에는 선선하지만 아침저녁으로는 쌀쌀하니 얇은 코트나 자켓을 챙기세요." },
    summer: { temp: 21, desc: "상쾌하고 쾌청", icon: "☀️", tips: "일본 다른 지역에 비해 습도가 낮고 선선해 여행하기 아주 좋습니다. 반팔 옷에 얇은 겉옷(가디건 등)을 하나 챙기는 편이 좋습니다." },
    autumn: { temp: 12, desc: "선선함, 낙엽", icon: "🍁", tips: "일교차가 큽니다. 가을 자켓이나 트렌치 코트를 준비하고 겹쳐 입는 스타일을 추천합니다." },
    winter: { temp: -2, desc: "눈 내림, 추움", icon: "❄️", tips: "눈이 매우 많이 내리며 영하권 기온입니다. 두꺼운 다운 패딩, 목도리, 장갑, 미끄럼 방지 방한 부츠는 필수입니다." }
  },
  tokyo: {
    spring: { temp: 15, desc: "따뜻하고 화창", icon: "🌸", tips: "벚꽃이 피는 기분 좋은 봄 날씨입니다. 가벼운 가디건이나 자켓이면 충분합니다." },
    summer: { temp: 27, desc: "덥고 습함", icon: "☀️", tips: "매우 덥고 습하므로 통풍이 잘 되는 얇은 옷과 자외선 차단 선글라스, 양산 등을 추천합니다. 실내 에어컨에 대비해 얇은 셔츠도 좋습니다." },
    autumn: { temp: 18, desc: "선선하고 맑음", icon: "🍁", tips: "선선하고 여행하기 가장 좋은 계절입니다. 긴소매 셔츠나 얇은 니트, 가디건이 적절합니다." },
    winter: { temp: 6, desc: "맑고 쌀쌀함", icon: "🧣", tips: "쌀쌀하지만 한국보다는 덜 춥습니다. 코트나 경량 패딩에 가벼운 목도리를 매치하세요." }
  },
  osaka: {
    spring: { temp: 14, desc: "따뜻하고 온화", icon: "🌸", tips: "야외 활동하기 최적인 온화한 날씨입니다. 얇은 아우터나 니트를 활용해 코디하세요." },
    summer: { temp: 28, desc: "무덥고 습함", icon: "☀️", tips: "한국의 한여름과 비슷하게 매우 고온다습합니다. 땀 흡수가 잘 되는 얇은 반팔과 잦은 수분 섭취가 필수적입니다." },
    autumn: { temp: 19, desc: "선선하고 청명", icon: "🍁", tips: "가을 단풍과 함께 선선한 바람이 붑니다. 자켓이나 맨투맨, 셔츠 차림이 어울립니다." },
    winter: { temp: 7, desc: "추운 바람", icon: "❄️", tips: "바람이 불어 체감 온도가 낮을 수 있습니다. 따뜻한 울 코트나 패딩자켓을 착용하세요." }
  }
};

export function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export async function getWeatherData(cityCode: string): Promise<WeatherInfo> {
  const OPENWEATHER_API_KEY = ""; // OpenWeather API Key
  
  if (!OPENWEATHER_API_KEY) {
    // Return dummy data in case API key is empty
    return new Promise((resolve) => {
      setTimeout(() => {
        let dummy = { temp: 18, desc: "구름 조금", icon: "☁️" };
        if (cityCode === "tokyo") dummy = { temp: 22, desc: "대체로 맑음", icon: "☀️" };
        else if (cityCode === "osaka") dummy = { temp: 24, desc: "한때 소나기", icon: "🌦️" };
        resolve(dummy);
      }, 150);
    });
  }

  const cityCoords: { [key: string]: { lat: number; lon: number } } = {
    sapporo: { lat: 43.06, lon: 141.35 },
    tokyo: { lat: 35.6812, lon: 139.7671 },
    osaka: { lat: 34.6937, lon: 135.5023 }
  };
  const coords = cityCoords[cityCode] || cityCoords.sapporo;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=kr`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API failed");
    const data = await res.json();
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const iconCode = data.weather[0].icon;

    let icon = "☀️";
    if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04")) icon = "☁️";
    else if (iconCode.includes("09") || iconCode.includes("10")) icon = "🌦️";
    else if (iconCode.includes("11")) icon = "⚡";
    else if (iconCode.includes("13")) icon = "❄️";
    else if (iconCode.includes("50")) icon = "🌫️";

    return { temp, desc, icon };
  } catch (err) {
    console.warn("Weather fetch failed, fallback to dummy:", err);
    let dummy = { temp: 18, desc: "구름 조금", icon: "☁️" };
    if (cityCode === "tokyo") dummy = { temp: 22, desc: "맑음", icon: "☀️" };
    else if (cityCode === "osaka") dummy = { temp: 24, desc: "소나기", icon: "🌦️" };
    return dummy;
  }
}

export async function getForecastData(cityCode: string): Promise<ForecastInfo[]> {
  const OPENWEATHER_API_KEY = "";
  
  if (!OPENWEATHER_API_KEY) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dummyForecast = [
          { day: "내일", temp: 19, desc: "맑음", icon: "☀️" },
          { day: "모레", temp: 17, desc: "흐림", icon: "☁️" },
          { day: "글쎄", temp: 20, desc: "구름조금", icon: "🌤️" },
          { day: "그글쎄", temp: 18, desc: "소나기", icon: "🌦️" }
        ];
        resolve(dummyForecast);
      }, 150);
    });
  }

  const cityCoords: { [key: string]: { lat: number; lon: number } } = {
    sapporo: { lat: 43.06, lon: 141.35 },
    tokyo: { lat: 35.6812, lon: 139.7671 },
    osaka: { lat: 34.6937, lon: 135.5023 }
  };
  const coords = cityCoords[cityCode] || cityCoords.sapporo;
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=kr`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Forecast API failed");
    const data = await res.json();
    
    // Extract 12:00:00 forecast points
    interface ForecastItem {
      dt: number;
      dt_txt: string;
      main: { temp: number };
      weather: { description: string; icon: string }[];
    }
    const list = data.list.filter((item: ForecastItem) => item.dt_txt.includes("12:00:00")).slice(0, 4);
    return list.map((item: ForecastItem) => {
      const date = new Date(item.dt * 1000);
      const dayName = date.toLocaleDateString("ko-KR", { weekday: "short" });
      const temp = Math.round(item.main.temp);
      const desc = item.weather[0].description;
      const iconCode = item.weather[0].icon;

      let icon = "☀️";
      if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04")) icon = "☁️";
      else if (iconCode.includes("09") || iconCode.includes("10")) icon = "🌦️";
      else if (iconCode.includes("11")) icon = "⚡";
      else if (iconCode.includes("13")) icon = "❄️";
      
      return { day: `${date.getMonth()+1}/${date.getDate()}(${dayName})`, temp, desc, icon };
    });
  } catch (err) {
    console.warn("Forecast fetch failed, fallback to dummy:", err);
    return [
      { day: "내일", temp: 19, desc: "맑음", icon: "☀️" },
      { day: "모레", temp: 17, desc: "흐림", icon: "☁️" },
      { day: "글쎄", temp: 20, desc: "구름조금", icon: "🌤️" },
      { day: "그글쎄", temp: 18, desc: "소나기", icon: "🌦️" }
    ];
  }
}

export function getSeasonGuide(cityCode: string, month: number): SeasonGuide {
  const season = getSeason(month);
  const data = CITY_SEASON_WEATHER[cityCode]?.[season] || CITY_SEASON_WEATHER.sapporo.summer;
  const seasonKoreanMap: { [key: string]: string } = {
    spring: "봄 🌸",
    summer: "여름 ☀️",
    autumn: "가을 🍁",
    winter: "겨울 ❄️"
  };
  return {
    seasonName: seasonKoreanMap[season] || "여름 ☀️",
    ...data
  };
}
