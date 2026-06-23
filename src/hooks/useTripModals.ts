import { useState } from 'react';

import { ActivityItem, ShoppingItem, SpotItem } from '../constants/travelData';
import { createRecommendedSpotPlaceData } from '../services/tripPlanning';

export function useTripModals() {
  const [placeModalVisible, setPlaceModalVisible] = useState(false);
  const [editingPlace, setEditingPlace] = useState<ActivityItem | null>(null);
  const [isRecommendedSpotAdd, setIsRecommendedSpotAdd] = useState(false);
  const [recommendedSpotData, setRecommendedSpotData] = useState<any>(null);
  const [shoppingModalVisible, setShoppingModalVisible] = useState(false);
  const [editingShopping, setEditingShopping] = useState<ShoppingItem | null>(null);

  const openAddPlace = () => {
    setIsRecommendedSpotAdd(false);
    setEditingPlace(null);
    setPlaceModalVisible(true);
  };

  const openEditPlace = (item: ActivityItem) => {
    setEditingPlace(item);
    setIsRecommendedSpotAdd(false);
    setPlaceModalVisible(true);
  };

  const openRecommendedSpotPlace = (spot: SpotItem) => {
    setRecommendedSpotData(createRecommendedSpotPlaceData(spot));
    setIsRecommendedSpotAdd(true);
    setEditingPlace(null);
    setPlaceModalVisible(true);
  };

  const closePlaceModal = () => {
    setPlaceModalVisible(false);
  };

  const openAddShopping = () => {
    setEditingShopping(null);
    setShoppingModalVisible(true);
  };

  const openEditShopping = (item: ShoppingItem) => {
    setEditingShopping(item);
    setShoppingModalVisible(true);
  };

  const closeShoppingModal = () => {
    setShoppingModalVisible(false);
  };

  return {
    placeModalVisible,
    editingPlace,
    isRecommendedSpotAdd,
    recommendedSpotData,
    shoppingModalVisible,
    editingShopping,
    openAddPlace,
    openEditPlace,
    openRecommendedSpotPlace,
    closePlaceModal,
    openAddShopping,
    openEditShopping,
    closeShoppingModal,
  };
}
