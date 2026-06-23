import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { partnerProviderLabels, PartnerProduct } from '../../data/partnerProducts';
import { openPartnerProduct } from '../../services/partnerLinks';

const shoppingCouponProductIds = new Set(['myrealtrip-japan-donki-coupon']);

const productCategoryLabels: Record<PartnerProduct['category'], string> = {
  tour: '투어',
  ticket: '입장권',
  transport: '교통',
  pass: '교통패스',
  restaurant: '맛집',
  coupon: '쿠폰',
};

type BookingSectionProps = {
  activeCity: string;
  products: PartnerProduct[];
};

export default function BookingSection({ activeCity, products }: BookingSectionProps) {
  const [bookingCategorySeed] = useState(() => Math.random());
  const [selectedProductCategory, setSelectedProductCategory] = useState<{
    cityCode: string;
    category: PartnerProduct['category'];
  } | null>(null);

  const mainBookingProducts = products.filter((product) => !shoppingCouponProductIds.has(product.id));
  const productCategories = Array.from(new Set(mainBookingProducts.map((product) => product.category)));
  const seededProductCategory = productCategories.length > 0
    ? productCategories[Math.floor(bookingCategorySeed * productCategories.length) % productCategories.length]
    : null;
  const selectedCategoryForCity =
    selectedProductCategory?.cityCode === activeCity && productCategories.includes(selectedProductCategory.category)
      ? selectedProductCategory.category
      : null;
  const effectiveProductCategory = selectedCategoryForCity || seededProductCategory;
  const visibleBookingProducts =
    effectiveProductCategory
      ? mainBookingProducts.filter((product) => product.category === effectiveProductCategory)
      : mainBookingProducts;

  if (mainBookingProducts.length === 0) {
    return null;
  }

  const handleProductPress = async (product: PartnerProduct) => {
    await openPartnerProduct(product);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderBetween}>
        <View style={styles.sectionTitleGroup}>
          <Text style={[styles.sectionTitleOnly, styles.sectionTitleInline]}>
            🎒 미리 준비하면 편한 예약
          </Text>
          <Text style={styles.sectionDesc}>오늘은 한 가지 준비 카테고리만 먼저 추천해드려요.</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productCategoryContent}
      >
        {productCategories.map((category) => {
          const isActive = effectiveProductCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[styles.productCategoryChip, isActive && styles.productCategoryChipActive]}
              onPress={() => setSelectedProductCategory({ cityCode: activeCity, category })}
              activeOpacity={0.8}
            >
              <Text style={[styles.productCategoryText, isActive && styles.productCategoryTextActive]}>
                {productCategoryLabels[category]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productSliderContent}
      >
        {visibleBookingProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => handleProductPress(product)}
            activeOpacity={0.82}
          >
            {product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
            ) : (
              <View style={[styles.productIconBox, { backgroundColor: `${product.color}1f` }]}>
                <Ionicons name={product.icon as any} size={22} color={product.color} />
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productProvider}>{partnerProviderLabels[product.provider]}</Text>
              <Text style={styles.productTitle} numberOfLines={2}>
                {product.title}
              </Text>
              <Text style={styles.productDesc} numberOfLines={2}>
                {product.desc}
              </Text>
            </View>
            <View style={styles.productCta}>
              <Text style={styles.productCtaText}>보기</Text>
              <Ionicons name="open-outline" size={14} color="#ffffff" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flex: 1,
    gap: 3,
  },
  sectionTitleOnly: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  sectionTitleInline: {
    flex: 1,
    marginBottom: 0,
  },
  sectionDesc: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '600',
    lineHeight: 17,
  },
  productCategoryContent: {
    gap: 8,
    paddingRight: 20,
    marginBottom: 12,
  },
  productCategoryChip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
  },
  productCategoryChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  productCategoryText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748b',
  },
  productCategoryTextActive: {
    color: '#ffffff',
  },
  productSliderContent: {
    gap: 12,
    paddingRight: 20,
  },
  productCard: {
    width: 230,
    minHeight: 180,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  productImage: {
    width: '100%',
    height: 86,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  productIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    gap: 4,
    flex: 1,
  },
  productProvider: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 0,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 18,
  },
  productDesc: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    lineHeight: 16,
  },
  productCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#6c5ce7',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 30,
    gap: 4,
  },
  productCtaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
});
