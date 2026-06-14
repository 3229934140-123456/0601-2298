import type { Vehicle, Reminder } from '@/types';

export const mockVehicles: Vehicle[] = [
  {
    id: 'v001',
    plateNumber: '豫A88888',
    vehicleType: '重型卡车',
    brand: '解放',
    model: 'J7 牵引车',
    buyDate: '2022-03-15',
    mileage: 285000,
    annualInspectionDate: '2024-09-20',
    insuranceDate: '2024-07-15',
    loadWeight: '30吨'
  },
  {
    id: 'v002',
    plateNumber: '豫A66666',
    vehicleType: '中型货车',
    brand: '东风',
    model: '天锦',
    buyDate: '2023-01-10',
    mileage: 120000,
    annualInspectionDate: '2025-01-20',
    insuranceDate: '2024-12-30',
    loadWeight: '10吨'
  }
];

export const mockReminders: Reminder[] = [
  {
    id: 'rem001',
    type: 'insurance',
    title: '交强险即将到期',
    date: '2024-07-15',
    daysLeft: 31,
    vehiclePlate: '豫A88888'
  },
  {
    id: 'rem002',
    type: 'annualInspection',
    title: '年检即将到期',
    date: '2024-09-20',
    daysLeft: 98,
    vehiclePlate: '豫A88888'
  },
  {
    id: 'rem003',
    type: 'maintenance',
    title: '定期保养提醒',
    date: '2024-06-30',
    daysLeft: 16,
    vehiclePlate: '豫A88888'
  }
];

export default mockVehicles;
