import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { RescueOrder, LocationInfo, VehicleInfo, FaultType, ServicePoint, RepairRecord, Reminder, Vehicle } from '@/types';
import { mockRepairRecords } from '@/data/mockRecords';

const STORAGE_KEY_RECORDS = 'rescue_repair_records';
const STORAGE_KEY_CURRENT_ORDER = 'rescue_current_order';

const loadRecordsFromStorage = (): RepairRecord[] | null => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY_RECORDS);
    if (data) {
      return JSON.parse(data) as RepairRecord[];
    }
  } catch (err) {
    console.error('[Store] 读取维修记录失败:', err);
  }
  return null;
};

const saveRecordsToStorage = (records: RepairRecord[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('[Store] 保存维修记录失败:', err);
  }
};

const loadCurrentOrderFromStorage = (): RescueOrder | null => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY_CURRENT_ORDER);
    if (data) {
      return JSON.parse(data) as RescueOrder;
    }
  } catch (err) {
    console.error('[Store] 读取当前订单失败:', err);
  }
  return null;
};

const saveCurrentOrderToStorage = (order: RescueOrder | null) => {
  try {
    if (order) {
      Taro.setStorageSync(STORAGE_KEY_CURRENT_ORDER, JSON.stringify(order));
    } else {
      Taro.removeStorageSync(STORAGE_KEY_CURRENT_ORDER);
    }
  } catch (err) {
    console.error('[Store] 保存当前订单失败:', err);
  }
};

interface RescueState {
  currentLocation: LocationInfo | null;
  currentOrder: RescueOrder | null;
  repairRecords: RepairRecord[];
  servicePoints: ServicePoint[];
  vehicles: Vehicle[];
  reminders: Reminder[];
  isLocationLoading: boolean;

  setCurrentLocation: (location: LocationInfo) => void;
  setCurrentOrder: (order: RescueOrder | null) => void;
  setRepairRecords: (records: RepairRecord[]) => void;
  setServicePoints: (points: ServicePoint[]) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  setReminders: (reminders: Reminder[]) => void;
  setIsLocationLoading: (loading: boolean) => void;

  createRescueOrder: (params: {
    faultType: FaultType;
    faultDesc: string;
    photos: string[];
    vehicle: VehicleInfo;
    location: LocationInfo;
    voiceUrl?: string;
    voiceDuration?: number;
  }) => RescueOrder;

  updateOrderStatus: (status: RescueOrder['status']) => void;
  completeOrder: (orderId: string) => void;
  rateOrder: (orderId: string, rating: number, comment: string) => void;
  toggleFleetShare: (orderId: string) => void;
  initRepairRecords: () => void;
}

const initialRecords = loadRecordsFromStorage();
const initialCurrentOrder = loadCurrentOrderFromStorage();

const useRescueStore = create<RescueState>((set, get) => ({
  currentLocation: null,
  currentOrder: initialCurrentOrder,
  repairRecords: initialRecords || [],
  servicePoints: [],
  vehicles: [],
  reminders: [],
  isLocationLoading: false,

  setCurrentLocation: (location) => set({ currentLocation: location }),

  setCurrentOrder: (order) => {
    set({ currentOrder: order });
    saveCurrentOrderToStorage(order);
  },

  setRepairRecords: (records) => {
    set({ repairRecords: records });
    saveRecordsToStorage(records);
  },

  setServicePoints: (points) => set({ servicePoints: points }),
  setVehicles: (vehicles) => set({ vehicles }),
  setReminders: (reminders) => set({ reminders }),
  setIsLocationLoading: (loading) => set({ isLocationLoading: loading }),

  initRepairRecords: () => {
    const { repairRecords } = get();
    if (repairRecords.length === 0) {
      set({ repairRecords: mockRepairRecords });
      saveRecordsToStorage(mockRepairRecords);
    }
  },

  createRescueOrder: ({ faultType, faultDesc, photos, vehicle, location, voiceUrl, voiceDuration }) => {
    const order: RescueOrder = {
      id: Date.now().toString(),
      orderNo: 'R' + Date.now().toString().slice(-8),
      status: 'pending',
      faultType,
      faultDesc,
      photos,
      voiceUrl,
      voiceDuration,
      vehicle,
      location,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fleetShared: false
    };
    set({ currentOrder: order });
    saveCurrentOrderToStorage(order);
    return order;
  },

  updateOrderStatus: (status) => {
    const { currentOrder } = get();
    if (!currentOrder) return;
    const updated = { ...currentOrder, status, updatedAt: new Date().toISOString() };
    if (status === 'completed') {
      updated.completedAt = new Date().toISOString();
    }
    set({ currentOrder: updated });
    saveCurrentOrderToStorage(updated);
  },

  completeOrder: (orderId) => {
    const { currentOrder, repairRecords } = get();
    if (!currentOrder || currentOrder.id !== orderId) return;

    const completedAt = new Date().toISOString();
    const completedOrder = {
      ...currentOrder,
      status: 'completed' as const,
      completedAt,
      updatedAt: completedAt
    };

    const newRecord: RepairRecord = {
      id: currentOrder.id,
      orderNo: currentOrder.orderNo,
      faultType: currentOrder.faultType,
      faultDesc: currentOrder.faultDesc,
      date: new Date().toISOString(),
      servicePoint: currentOrder.servicePoint?.name || '未知服务点',
      cost: currentOrder.cost || 0,
      rating: currentOrder.rating || 0,
      status: 'completed',
      photos: currentOrder.photos,
      voiceUrl: currentOrder.voiceUrl,
      voiceDuration: currentOrder.voiceDuration,
      vehicle: currentOrder.vehicle,
      location: currentOrder.location,
      rescuer: currentOrder.rescuer?.name,
      comment: currentOrder.comment
    };

    const exists = repairRecords.some(r => r.id === orderId);
    const updatedRecords = exists
      ? repairRecords.map(r => r.id === orderId ? { ...newRecord, rating: r.rating, comment: r.comment } : r)
      : [newRecord, ...repairRecords];

    set({
      currentOrder: completedOrder,
      repairRecords: updatedRecords
    });
    saveCurrentOrderToStorage(completedOrder);
    saveRecordsToStorage(updatedRecords);
  },

  rateOrder: (orderId, rating, comment) => {
    const { currentOrder, repairRecords } = get();
    let updatedCurrentOrder = currentOrder;
    if (currentOrder && currentOrder.id === orderId) {
      updatedCurrentOrder = { ...currentOrder, rating, comment };
      set({ currentOrder: updatedCurrentOrder });
      saveCurrentOrderToStorage(updatedCurrentOrder);
    }
    const updatedRecords = repairRecords.map(r =>
      r.id === orderId ? { ...r, rating, comment } : r
    );
    set({ repairRecords: updatedRecords });
    saveRecordsToStorage(updatedRecords);
  },

  toggleFleetShare: (orderId) => {
    const { currentOrder, repairRecords } = get();
    if (currentOrder && currentOrder.id === orderId) {
      const updated = { ...currentOrder, fleetShared: !currentOrder.fleetShared };
      set({ currentOrder: updated });
      saveCurrentOrderToStorage(updated);
    }
  }
}));

export default useRescueStore;
