import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CITY_TEMPLATES, GuidebookItem } from '../constants/travelData';

interface ExploreGuideModalProps {
  visible: boolean;
  cityCode: string;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const isTablet = width > 600;

export default function ExploreGuideModal({ visible, cityCode, onClose }: ExploreGuideModalProps) {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const template = CITY_TEMPLATES[cityCode] || CITY_TEMPLATES.sapporo;
  const guidebook: GuidebookItem[] = template.explore.guidebook || [];

  let cityName = "삿포로 & 오타루";
  if (cityCode === "tokyo") cityName = "도쿄";
  else if (cityCode === "osaka") cityName = "오사카 & 교토";

  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // Parses inline highlights: **bold**, `badgeA`, 'badgeB'
  const renderInlineStyles = (text: string) => {
    // Regular expression to extract tokens
    const regex = /(\*\*.*?\*\*|`.*?`|'.*?')/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <Text key={index} style={[styles.badgeText, styles.badgeTextPrimary]}>
            {` ${part.slice(1, -1)} `}
          </Text>
        );
      }
      if (part.startsWith("'") && part.endsWith("'")) {
        return (
          <Text key={index} style={[styles.badgeText, styles.badgeTextSecondary]}>
            {` ${part.slice(1, -1)} `}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  // Parses lines for [VS] container and bullet items
  const renderParsedContent = (content: string) => {
    const lines = content.replace(/\\n/g, '\n').split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // 1. [VS] Compare Layout
      if (trimmedLine.startsWith('[VS]')) {
        const vsContent = trimmedLine.substring(4).trim();
        const parts = vsContent.split('|');

        if (parts.length >= 2) {
          const leftOption = parts[0].trim();
          const rightOption = parts[1].trim();

          elements.push(
            <View key={`vs-${index}`} style={styles.vsContainer}>
              <View style={[styles.vsCard, styles.vsCardLeft]}>
                <View style={[styles.vsRibbon, { backgroundColor: '#4a90e2' }]}>
                  <Text style={styles.vsRibbonText}>OPTION A</Text>
                </View>
                <Text style={styles.vsCardText}>{renderInlineStyles(leftOption)}</Text>
              </View>
              <View style={[styles.vsCard, styles.vsCardRight]}>
                <View style={[styles.vsRibbon, { backgroundColor: '#6c5ce7' }]}>
                  <Text style={styles.vsRibbonText}>OPTION B</Text>
                </View>
                <Text style={styles.vsCardText}>{renderInlineStyles(rightOption)}</Text>
              </View>
            </View>
          );
        } else {
          elements.push(
            <View key={`vs-divider-${index}`} style={styles.vsDividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.vsDividerTitle}>{renderInlineStyles('⚖️ ' + vsContent)}</Text>
              <View style={styles.dividerLine} />
            </View>
          );
        }
      }
      // 2. Bullet list item (-)
      else if (trimmedLine.startsWith('-')) {
        const listContent = trimmedLine.substring(1).trim();
        elements.push(
          <View key={`bullet-${index}`} style={styles.bulletItem}>
            <Ionicons name="checkmark-circle" size={16} color="#2ecc71" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{renderInlineStyles(listContent)}</Text>
          </View>
        );
      }
      // 3. Regular paragraph
      else {
        elements.push(
          <Text key={`para-${index}`} style={styles.paragraphText}>
            {renderInlineStyles(trimmedLine)}
          </Text>
        );
      }
    });

    return elements;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💡 {cityName} 추천 가이드</Text>
          <TouchableOpacity onPress={onClose} style={styles.btnClose}>
            <Ionicons name="close-circle" size={28} color="#b0b4ba" />
          </TouchableOpacity>
        </View>

        {/* Accordion List */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {guidebook.length === 0 ? (
            <Text style={styles.emptyText}>가이드북 콘텐츠가 비어 있습니다.</Text>
          ) : (
            guidebook.map((item, index) => {
              const isOpen = activeAccordion === index;
              return (
                <View key={index} style={[styles.accordionItem, isOpen && styles.accordionItemActive]}>
                  {/* Header */}
                  <TouchableOpacity
                    onPress={() => toggleAccordion(index)}
                    activeOpacity={0.7}
                    style={styles.accordionHeader}
                  >
                    <View style={styles.accordionTitleGroup}>
                      <Text style={styles.accordionEmoji}>{item.emoji || '💡'}</Text>
                      <Text style={styles.accordionTitle}>{item.title}</Text>
                    </View>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#60646c"
                    />
                  </TouchableOpacity>

                  {/* Body Content */}
                  {isOpen && (
                    <View style={styles.accordionContent}>
                      {renderParsedContent(item.content)}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  btnClose: {
    padding: 2,
  },
  scrollContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#60646c',
    marginVertical: 40,
    fontSize: 15,
  },
  accordionItem: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  accordionItemActive: {
    borderColor: '#a29bfe',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  accordionEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fafafb',
  },
  paragraphText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginVertical: 6,
  },
  boldText: {
    fontWeight: '800',
    color: '#0f172a',
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    borderRadius: 4,
    paddingHorizontal: 4,
    marginHorizontal: 2,
    overflow: 'hidden',
  },
  badgeTextPrimary: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    color: '#4a90e2',
    borderWidth: 0.5,
    borderColor: 'rgba(74, 144, 226, 0.25)',
  },
  badgeTextSecondary: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    color: '#6c5ce7',
    borderWidth: 0.5,
    borderColor: 'rgba(108, 92, 231, 0.25)',
  },
  vsContainer: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 12,
    marginVertical: 12,
    width: '100%',
  },
  vsCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    paddingTop: 20,
    position: 'relative',
    minHeight: 80,
  },
  vsCardLeft: {
    borderColor: 'rgba(74, 144, 226, 0.2)',
    backgroundColor: 'rgba(74, 144, 226, 0.02)',
  },
  vsCardRight: {
    borderColor: 'rgba(108, 92, 231, 0.2)',
    backgroundColor: 'rgba(108, 92, 231, 0.02)',
  },
  vsRibbon: {
    position: 'absolute',
    top: 0,
    left: 10,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  vsRibbonText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  vsCardText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginTop: 4,
  },
  vsDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  vsDividerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    paddingHorizontal: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    paddingRight: 15,
  },
  bulletIcon: {
    marginTop: 3,
    marginRight: 6,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    flex: 1,
  },
});
