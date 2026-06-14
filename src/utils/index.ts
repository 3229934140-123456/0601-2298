import type { FaultType, RescueStatus } from '@/types';

export const getFaultTypeLabel = (type: FaultType): string => {
  const map: Record<FaultType, string> = {
    tire: '轮胎故障',
    fuel: '缺油/送油',
    engine: '发动机故障',
    brake: '刹车系统',
    electrical: '电路故障',
    other: '其他故障'
  };
  return map[type] || '未知故障';
};

export const getStatusLabel = (status: RescueStatus): string => {
  const map: Record<RescueStatus, string> = {
    pending: '等待派单',
    assigned: '已派单',
    onTheWay: '救援中',
    arrived: '已到达',
    repairing: '维修中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return map[status] || '未知状态';
};

export const getStatusColor = (status: RescueStatus): string => {
  const map: Record<RescueStatus, string> = {
    pending: '#FF7D00',
    assigned: '#1E6FFF',
    onTheWay: '#1E6FFF',
    arrived: '#00B42A',
    repairing: '#00B42A',
    completed: '#86909C',
    cancelled: '#C9CDD4'
  };
  return map[status] || '#86909C';
};

export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}米`;
  }
  return `${km.toFixed(1)}公里`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
};

export const generateOrderNo = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `R${timestamp}${random}`;
};

export const getReminderTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    annualInspection: '年检',
    insurance: '保险',
    maintenance: '保养'
  };
  return map[type] || '其他';
};

export const getReminderTypeColor = (type: string): string => {
  const map: Record<string, string> = {
    annualInspection: '#FF7A00',
    insurance: '#1E6FFF',
    maintenance: '#00B42A'
  };
  return map[type] || '#86909C';
};
