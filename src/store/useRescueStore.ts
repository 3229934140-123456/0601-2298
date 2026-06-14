import { create } from 'zustand';
import type { RescueOrder, LocationInfo, VehicleInfo, FaultType, ServicePoint, RepairRecord, Reminder, Vehicle } from '@/types';
import { mockRepairRecords } from '@/data/mockRecords';

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

const useRescueStore = create<RescueState>((set, get) => ({
  currentLocation: null,
  currentOrder: null,
  repairRecords: [],
  servicePoints: [],
  vehicles: [],
  reminders: [],
  isLocationLoading: false,

  setCurrentLocation: (location) => set({ currentLocation: location }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setRepairRecords: (records) => set({ repairRecords: records }),
  setServicePoints: (points) => set({ servicePoints: points }),
  setVehicles: (vehicles) => set({ vehicles }),
  setReminders: (reminders) => set({ reminders }),
  setIsLocationLoading: (loading) => set({ isLocationLoading: loading }),

  initRepairRecords: () => {
    const { repairRecords } = get();
    if (repairRecords.length === 0) {
      set({ repairRecords: mockRepairRecords });
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
      ? repairRecords.map(r => r.id === orderId ? { ...r, status: 'completed' } : r)
      : [newRecord, ...repairRecords];

    set({
      currentOrder: completedOrder,
      repairRecords: updatedRecords
    });
  },

  rateOrder: (orderId, rating, comment) => {
    const { currentOrder, repairRecords } = get();
    if (currentOrder && currentOrder.id === orderId) {
      const updated = { ...currentOrder, rating, comment };
      set({ currentOrder: updated });
    }
    const updatedRecords = repairRecords.map(r =>
      r.id === orderId ? { ...r, rating, comment } : r
    );
    set({ repairRecords: updatedRecords });
  },

  toggleFleetShare: (orderId) => {
    const { currentOrder, repairRecords } = get();
    if (currentOrder && currentOrder.id === orderId) {
      const updated = { ...currentOrder, fleetShared: !currentOrder.fleetShared };
      set({ currentOrder: updated });
    }
  }
}));

export default useRescueStore;
