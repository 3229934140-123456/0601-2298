import { create } from 'zustand';
import type { RescueOrder, LocationInfo, VehicleInfo, FaultType, ServicePoint, RepairRecord, Reminder, Vehicle } from '@/types';

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
  }) => RescueOrder;

  updateOrderStatus: (status: RescueOrder['status']) => void;
  rateOrder: (orderId: string, rating: number, comment: string) => void;
  toggleFleetShare: (orderId: string) => void;
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

  createRescueOrder: ({ faultType, faultDesc, photos, vehicle, location }) => {
    const order: RescueOrder = {
      id: Date.now().toString(),
      orderNo: 'R' + Date.now().toString().slice(-8),
      status: 'pending',
      faultType,
      faultDesc,
      photos,
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
