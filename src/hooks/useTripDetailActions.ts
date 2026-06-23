import { Alert, Platform } from 'react-native';

import { ActivityItem, CITY_TEMPLATES, ShoppingItem } from '../constants/travelData';
import {
  addChecklistItem,
  deleteActivityItem,
  deleteShoppingItem,
  toggleChecklistItem,
  toggleShoppingItemChecked,
  upsertActivityItem,
  upsertShoppingItem,
} from '../services/tripPlanning';

type UseTripDetailActionsParams = {
  travelData: any;
  activeDay: string;
  setActiveDay: (dayKey: string) => void;
  onUpdateTripData: (updatedData: any) => void;
  closePlaceModal: () => void;
  closeShoppingModal: () => void;
  newChecklistText: string;
  setNewChecklistText: (text: string) => void;
};

export function useTripDetailActions({
  travelData,
  activeDay,
  setActiveDay,
  onUpdateTripData,
  closePlaceModal,
  closeShoppingModal,
  newChecklistText,
  setNewChecklistText,
}: UseTripDetailActionsParams) {
  const handlePlaceSubmit = (place: Omit<ActivityItem, 'id'> & { id?: number }, targetDay?: string) => {
    const result = upsertActivityItem(travelData, place, targetDay || activeDay, activeDay);
    onUpdateTripData(result.updatedData);
    closePlaceModal();
    setActiveDay(result.activeDay);
  };

  const handlePlaceDelete = (dayKey: string, itemId: number) => {
    const performDelete = () => {
      onUpdateTripData(deleteActivityItem(travelData, dayKey, itemId));
    };

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm('일정 항목을 삭제하시겠습니까?');
      if (confirmDelete) {
        performDelete();
      }
      return;
    }

    Alert.alert('삭제 확인', '일정 항목을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: performDelete,
      },
    ]);
  };

  const handleShoppingSubmit = (item: Omit<ShoppingItem, 'id'> & { id?: number }) => {
    onUpdateTripData(upsertShoppingItem(travelData, item));
    closeShoppingModal();
  };

  const handleShoppingCheckToggle = (itemId: number) => {
    onUpdateTripData(toggleShoppingItemChecked(travelData, itemId));
  };

  const handleShoppingDelete = (itemId: number) => {
    Alert.alert('삭제 확인', '쇼핑 항목을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => onUpdateTripData(deleteShoppingItem(travelData, itemId)),
      },
    ]);
  };

  const handleAddChecklist = () => {
    const updatedData = addChecklistItem(travelData, newChecklistText);
    onUpdateTripData(updatedData);
    setNewChecklistText('');
  };

  const handleChecklistToggle = (itemId: number) => {
    onUpdateTripData(toggleChecklistItem(travelData, itemId));
  };

  const handleResetChecklist = () => {
    Alert.alert('체크리스트 초기화', '기본 준비물 목록으로 되돌릴까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        onPress: () => {
          const template = CITY_TEMPLATES[travelData.cityCode] || CITY_TEMPLATES.sapporo;
          onUpdateTripData({ ...travelData, checklist: template.checklist });
        },
      },
    ]);
  };

  const handleMemberCountChange = (memberCount: number) => {
    onUpdateTripData({ ...travelData, memberCount });
  };

  return {
    handlePlaceSubmit,
    handlePlaceDelete,
    handleShoppingSubmit,
    handleShoppingCheckToggle,
    handleShoppingDelete,
    handleAddChecklist,
    handleChecklistToggle,
    handleResetChecklist,
    handleMemberCountChange,
  };
}
