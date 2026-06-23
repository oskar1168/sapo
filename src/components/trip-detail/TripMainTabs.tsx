import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type TripMainTabKey = 'timeline' | 'spots' | 'shopping' | 'extra';

const MAIN_TABS: { key: TripMainTabKey; label: string; icon: string }[] = [
  { key: 'timeline', label: '일정', icon: 'map' },
  { key: 'spots', label: '추천스팟', icon: 'compass' },
  { key: 'shopping', label: '쇼핑리스트', icon: 'cart' },
  { key: 'extra', label: '더보기', icon: 'ellipsis-horizontal' },
];

type TripMainTabsProps = {
  activeTab: TripMainTabKey;
  onChangeTab: (tab: TripMainTabKey) => void;
};

export default function TripMainTabs({ activeTab, onChangeTab }: TripMainTabsProps) {
  return (
    <View style={styles.tabBar}>
      {MAIN_TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
          onPress={() => onChangeTab(tab.key)}
        >
          <Ionicons
            name={activeTab === tab.key ? (tab.icon as any) : `${tab.icon}-outline` as any}
            size={20}
            color={activeTab === tab.key ? '#6c5ce7' : '#64748b'}
          />
          <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    height: 52,
  },
  tabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6c5ce7',
  },
  tabBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#6c5ce7',
  },
});
