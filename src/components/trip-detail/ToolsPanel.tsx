import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ForecastInfo, SeasonGuide, WeatherInfo } from '../../utils/weather';

interface ToolsPanelProps {
  weather: WeatherInfo | null;
  forecast: ForecastInfo[];
  clothingTips: SeasonGuide | null;
  exchangeRate: number;
  exchangeUpdateTime: string;
  sourceText: string;
  targetText: string;
  transSourceLang: string;
  transTargetLang: string;
  isTranslating: boolean;
  onChangeSourceText: (value: string) => void;
  onClearSourceText: () => void;
  onTranslate: () => void;
  onSwapLanguages: () => void;
  onCopyTranslation: () => void;
}

export default function ToolsPanel({
  weather,
  forecast,
  clothingTips,
  exchangeRate,
  exchangeUpdateTime,
  sourceText,
  targetText,
  transSourceLang,
  transTargetLang,
  isTranslating,
  onChangeSourceText,
  onClearSourceText,
  onTranslate,
  onSwapLanguages,
  onCopyTranslation,
}: ToolsPanelProps) {
  return (
    <View style={styles.toolsContainer}>
      <View style={styles.card}>
        <View style={styles.weatherHeader}>
          <Text style={styles.weatherIcon}>{weather?.icon || 'Cloud'}</Text>
          <View>
            <Text style={styles.toolTitle}>실시간 날씨 정보</Text>
            <View style={styles.weatherTempRow}>
              <Text style={styles.weatherTemp}>{weather?.temp !== undefined ? `${weather.temp}°C` : '--°C'}</Text>
              <Text style={styles.weatherDesc}>{weather?.desc || '로딩 중...'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.subSectionTitle}>일정별 날씨 예보</Text>
        <View style={styles.forecastGrid}>
          {forecast.map((item, index) => (
            <View key={index} style={styles.forecastCard}>
              <Text style={styles.forecastDay}>{item.day}</Text>
              <Text style={styles.forecastIcon}>{item.icon}</Text>
              <Text style={styles.forecastTemp}>{item.temp}°C</Text>
              <Text style={styles.forecastDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>

        {clothingTips ? (
          <View style={styles.clothingTipsBox}>
            <Text style={styles.clothingTipsTitle}>의상 추천 ({clothingTips.seasonName})</Text>
            <Text style={styles.clothingTipsText}>{clothingTips.tips}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <View style={styles.exchangeHeader}>
          <View style={styles.exchangeIconBox}>
            <Text style={styles.exchangeIconEmoji}>JPY</Text>
          </View>
          <View>
            <Text style={styles.toolTitle}>실시간 환율 (100 JPY)</Text>
            <View style={styles.rateValueRow}>
              <Text style={styles.rateValue}>{Math.round(exchangeRate * 100 * 100) / 100}원</Text>
              <Text style={styles.rateTime}>({exchangeUpdateTime || '인터넷 연결 필요'})</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.toolTitle}>여행 번역기</Text>

        <View style={styles.transLangRow}>
          <Text style={styles.langLabel}>{transSourceLang === 'ko' ? '한국어' : '일본어'}</Text>
          <TouchableOpacity onPress={onSwapLanguages} style={styles.btnSwap}>
            <Ionicons name="swap-horizontal" size={16} color="#6c5ce7" />
          </TouchableOpacity>
          <Text style={styles.langLabel}>{transTargetLang === 'ko' ? '한국어' : '일본어'}</Text>
        </View>

        <TextInput
          style={[styles.input, styles.transInput]}
          value={sourceText}
          onChangeText={onChangeSourceText}
          placeholder="번역할 내용을 입력해 주세요..."
          multiline
        />

        <View style={styles.transActionRow}>
          <TouchableOpacity onPress={onClearSourceText} style={styles.btnTransClear}>
            <Text style={styles.btnTransClearText}>지우기</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onTranslate} style={styles.btnTransSubmit}>
            <Text style={styles.btnTransSubmitText}>
              {isTranslating ? '번역 중...' : '번역하기'}
            </Text>
          </TouchableOpacity>
        </View>

        {targetText ? (
          <View style={styles.transResultPanel}>
            <View style={styles.transResultHeader}>
              <Text style={styles.transResultLabel}>번역 결과</Text>
              <TouchableOpacity onPress={onCopyTranslation}>
                <Ionicons name="copy-outline" size={16} color="#6c5ce7" />
              </TouchableOpacity>
            </View>
            <Text style={styles.transResultText}>{targetText}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherIcon: {
    fontSize: 16,
    backgroundColor: '#f1f5f9',
    width: 50,
    height: 50,
    borderRadius: 25,
    textAlign: 'center',
    lineHeight: 50,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  weatherTempRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  weatherTemp: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  weatherDesc: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  subSectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 10,
  },
  forecastGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  forecastCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
  },
  forecastDay: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '600',
  },
  forecastIcon: {
    fontSize: 18,
    marginVertical: 4,
  },
  forecastTemp: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  forecastDesc: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },
  clothingTipsBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.08)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  clothingTipsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4a90e2',
    marginBottom: 4,
  },
  clothingTipsText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  exchangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exchangeIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exchangeIconEmoji: {
    fontSize: 12,
    fontWeight: '900',
    color: '#475569',
  },
  rateValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  rateTime: {
    fontSize: 10,
    color: '#64748b',
  },
  transLangRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 10,
  },
  langLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  btnSwap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: '#f8fafc',
  },
  transInput: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
    fontSize: 13.5,
  },
  transActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  btnTransClear: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  btnTransClearText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  btnTransSubmit: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    backgroundColor: '#6c5ce7',
  },
  btnTransSubmitText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  transResultPanel: {
    marginTop: 14,
    padding: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.05)',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(108, 92, 231, 0.2)',
    gap: 4,
  },
  transResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transResultLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6c5ce7',
  },
  transResultText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 18,
  },
});

