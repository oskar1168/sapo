export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  if (!text || text.trim() === "") return "";
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Translation API Response Error");
    const data = await res.json();
    
    if (data && data[0]) {
      let translated = "";
      data[0].forEach((item: any) => {
        if (item[0]) translated += item[0];
      });
      return translated;
    }
    return "번역 결과를 가져오지 못했습니다.";
  } catch (err) {
    console.error("Failed to translate:", err);
    return "번역 중 오류가 발생했습니다. 다시 시도해 주세요.";
  }
}
