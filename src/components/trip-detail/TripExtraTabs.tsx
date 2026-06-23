import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ChecklistItem } from '../../constants/travelData';
import { ForecastInfo, SeasonGuide, WeatherInfo } from '../../utils/weather';
import ChecklistPanel from './ChecklistPanel';
import ExportPanel from './ExportPanel';
import SettlementPanel from './SettlementPanel';
import ToolsPanel from './ToolsPanel';

export type TripExtraTabKey = 'checklist' | 'settlement' | 'tools' | 'etc';

const EXTRA_TABS: { key: TripExtraTabKey; label: string }[] = [
  { key: 'checklist', label: '📋 준비물' },
  { key: 'settlement', label: '🪙 정산' },
  { key: 'tools', label: '🛠️ 도구' },
  { key: 'etc', label: '⚙️ 기타' },
];

type TripExtraTabsProps = {
  activeTab: TripExtraTabKey;
  onChangeTab: (tab: TripExtraTabKey) => void;
  checklist: ChecklistItem[];
  newChecklistText: string;
  onChangeNewChecklistText: (text: string) => void;
  onAddChecklist: () => void;
  onToggleChecklist: (itemId: number) => void;
  onResetChecklist: () => void;
  memberCount: number;
  totalBudgetKRW: number;
  shoppingTotalCostKRW: number;
  onChangeMemberCount: (memberCount: number) => void;
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
  onChangeSourceText: (text: string) => void;
  onClearSourceText: () => void;
  onTranslate: () => void;
  onSwapLanguages: () => void;
  onCopyTranslation: () => void;
  onExportTimelinePDF: () => void;
  onExportBudgetPDF: () => void;
};

export default function TripExtraTabs({
  activeTab,
  onChangeTab,
  checklist,
  newChecklistText,
  onChangeNewChecklistText,
  onAddChecklist,
  onToggleChecklist,
  onResetChecklist,
  memberCount,
  totalBudgetKRW,
  shoppingTotalCostKRW,
  onChangeMemberCount,
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
  onExportTimelinePDF,
  onExportBudgetPDF,
}: TripExtraTabsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.subTabsContainer}>
        {EXTRA_TABS.map((subTab) => (
          <TouchableOpacity
            key={subTab.key}
            style={[styles.subTabBtn, activeTab === subTab.key && styles.subTabBtnActive]}
            onPress={() => onChangeTab(subTab.key)}
          >
            <Text style={[styles.subTabBtnText, activeTab === subTab.key && styles.subTabBtnTextActive]}>
              {subTab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.extraScroll}>
        {activeTab === 'checklist' && (
          <ChecklistPanel
            checklist={checklist}
            newChecklistText={newChecklistText}
            onChangeNewChecklistText={onChangeNewChecklistText}
            onAddChecklist={onAddChecklist}
            onToggleChecklist={onToggleChecklist}
            onResetChecklist={onResetChecklist}
          />
        )}

        {activeTab === 'settlement' && (
          <SettlementPanel
            memberCount={memberCount}
            totalBudgetKRW={totalBudgetKRW}
            shoppingTotalCostKRW={shoppingTotalCostKRW}
            onChangeMemberCount={onChangeMemberCount}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsPanel
            weather={weather}
            forecast={forecast}
            clothingTips={clothingTips}
            exchangeRate={exchangeRate}
            exchangeUpdateTime={exchangeUpdateTime}
            sourceText={sourceText}
            targetText={targetText}
            transSourceLang={transSourceLang}
            transTargetLang={transTargetLang}
            isTranslating={isTranslating}
            onChangeSourceText={onChangeSourceText}
            onClearSourceText={onClearSourceText}
            onTranslate={onTranslate}
            onSwapLanguages={onSwapLanguages}
            onCopyTranslation={onCopyTranslation}
          />
        )}

        {activeTab === 'etc' && (
          <ExportPanel
            onExportTimelinePDF={onExportTimelinePDF}
            onExportBudgetPDF={onExportBudgetPDF}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    height: 44,
  },
  subTabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6c5ce7',
  },
  subTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  subTabBtnTextActive: {
    color: '#6c5ce7',
  },
  extraScroll: {
    padding: 16,
    paddingBottom: 40,
  },
});
