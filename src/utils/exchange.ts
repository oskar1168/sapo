import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_RATE = 9.0; // 1 JPY = 9 KRW

export interface ExchangeRateResult {
  rate: number;
  time: string;
}

export async function getExchangeRate(): Promise<ExchangeRateResult> {
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  
  try {
    const cachedRate = await AsyncStorage.getItem("sapo_exchange_rate");
    const cachedDate = await AsyncStorage.getItem("sapo_exchange_rate_date");
    const cachedTime = await AsyncStorage.getItem("sapo_exchange_rate_time");
    
    if (cachedRate && cachedDate === todayStr) {
      const rateVal = parseFloat(cachedRate);
      if (!isNaN(rateVal)) {
        console.log(`[Exchange Cached] 1 JPY = ${rateVal} KRW`);
        return { rate: rateVal, time: cachedTime || "" };
      }
    }
  } catch (e) {
    console.warn("Exchange rate cache read failed:", e);
  }

  const primaryUrl = "https://api.frankfurter.app/latest?from=JPY&to=KRW";
  const backupUrl = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/jpy.json";
  let rateOneJPY = null;

  try {
    const res = await fetch(primaryUrl);
    if (!res.ok) throw new Error("Primary API Failed");
    const data = await res.json();
    if (data && data.rates && data.rates.KRW) {
      rateOneJPY = parseFloat(data.rates.KRW);
    }
  } catch (primaryErr) {
    console.warn("Primary API failed, trying backup:", primaryErr);
    try {
      const res = await fetch(backupUrl);
      if (!res.ok) throw new Error("Backup API Failed");
      const data = await res.json();
      if (data && data.jpy && data.jpy.krw) {
        rateOneJPY = parseFloat(data.jpy.krw);
      }
    } catch (backupErr) {
      console.error("Backup exchange API also failed:", backupErr);
    }
  }

  if (rateOneJPY && !isNaN(rateOneJPY)) {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${mm}.${dd} ${hh}:${min}`;

    try {
      await AsyncStorage.setItem("sapo_exchange_rate", rateOneJPY.toString());
      await AsyncStorage.setItem("sapo_exchange_rate_date", todayStr);
      await AsyncStorage.setItem("sapo_exchange_rate_time", timeStr);
    } catch (e) {
      console.warn("Failed to cache exchange rate:", e);
    }

    console.log(`[Exchange Synced] 1 JPY = ${rateOneJPY} KRW`);
    return { rate: rateOneJPY, time: timeStr };
  }

  console.log(`[Exchange Fallback] 1 JPY = ${DEFAULT_RATE} KRW`);
  return { rate: DEFAULT_RATE, time: "대체 환율" };
}
