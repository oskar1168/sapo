import { useState } from 'react';

import { translateText } from '../utils/translator';

export function useTripTranslationTool() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [transSourceLang, setTransSourceLang] = useState('ko');
  const [transTargetLang, setTransTargetLang] = useState('ja');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    const result = await translateText(sourceText, transSourceLang, transTargetLang);
    setTargetText(result);
    setIsTranslating(false);
  };

  const swapTranslationLanguages = () => {
    setTransSourceLang(transTargetLang);
    setTransTargetLang(transSourceLang);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  return {
    sourceText,
    targetText,
    transSourceLang,
    transTargetLang,
    isTranslating,
    setSourceText,
    setTargetText,
    handleTranslate,
    swapTranslationLanguages,
  };
}
