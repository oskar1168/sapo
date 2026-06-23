import { useEffect, useState } from 'react';

import { getExchangeRate } from '../utils/exchange';
import {
  ForecastInfo,
  getForecastData,
  getSeasonGuide,
  getWeatherData,
  SeasonGuide,
  WeatherInfo,
} from '../utils/weather';

export function useTripDetailResources(cityCode = 'sapporo') {
  const [exchangeRate, setExchangeRate] = useState(9.0);
  const [exchangeUpdateTime, setExchangeUpdateTime] = useState('');
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [forecast, setForecast] = useState<ForecastInfo[]>([]);
  const [clothingTips, setClothingTips] = useState<SeasonGuide | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      const exchangeResult = await getExchangeRate();
      setExchangeRate(exchangeResult.rate);
      setExchangeUpdateTime(exchangeResult.time);

      const weatherResult = await getWeatherData(cityCode);
      setWeather(weatherResult);

      const forecastResult = await getForecastData(cityCode);
      setForecast(forecastResult);

      const currentMonth = new Date().getMonth() + 1;
      setClothingTips(getSeasonGuide(cityCode, currentMonth));
    };

    fetchResources();
  }, [cityCode]);

  return {
    exchangeRate,
    exchangeUpdateTime,
    weather,
    forecast,
    clothingTips,
  };
}
