// 故障类型
export type FaultType = 'tire' | 'fuel' | 'engine' | 'brake' | 'electrical' | 'other';

export interface FaultTypeOption {
  key: FaultType;
  label: string;
  icon: string;
}

// 救援状态
export type RescueStatus = 'pending' | 'assigned' | 'onTheWay' | 'arrived' | 'repairing' | 'completed' | 'cancelled';

export interface StatusStep {
  key: RescueStatus;
  label: string;
  desc: string;
}

// 车辆信息
export interface VehicleInfo {
  plateNumber: string;
  vehicleType: string;
  loadWeight: string;
  cargoType: string;
}

// 位置信息
export interface LocationInfo {
  latitude: number;
  longitude: number;
  address: string;
  province: string;
  city: string;
  district: string;
  roadName: string;
}

// 服务点信息
export interface ServicePoint {
  id: string;
  name: string;
  address: string;
  distance: number;
  phone: string;
  rating: number;
  serviceTypes: string[];
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'busy';
}

// 救援员信息
export interface Rescuer {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  orderCount: number;
  vehicle: string;
  plateNumber: string;
}

// 救援订单
export interface RescueOrder {
  id: string;
  orderNo: string;
  status: RescueStatus;
  faultType: FaultType;
  faultDesc: string;
  photos: string[];
  voiceUrl?: string;
  voiceDuration?: number;
  vehicle: VehicleInfo;
  location: LocationInfo;
  createdAt: string;
  updatedAt: string;
  servicePoint?: ServicePoint;
  rescuer?: Rescuer;
  estimatedArrivalTime?: string;
  arrivedAt?: string;
  completedAt?: string;
  cost?: number;
  rating?: number;
  comment?: string;
  fleetShared: boolean;
}

// 维修记录
export interface RepairRecord {
  id: string;
  orderNo: string;
  faultType: FaultType;
  faultDesc: string;
  date: string;
  servicePoint: string;
  cost: number;
  rating: number;
  status: 'completed' | 'inProgress' | 'cancelled';
  photos: string[];
  vehicle: VehicleInfo;
  location: LocationInfo;
  rescuer?: string;
  comment?: string;
}

// 车辆档案
export interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  buyDate: string;
  mileage: number;
  annualInspectionDate: string;
  insuranceDate: string;
  loadWeight: string;
}

// 提醒项
export interface Reminder {
  id: string;
  type: 'annualInspection' | 'insurance' | 'maintenance';
  title: string;
  date: string;
  daysLeft: number;
  vehiclePlate: string;
}

// 常用资料
export interface HelpDoc {
  id: string;
  title: string;
  category: string;
  content: string;
}
