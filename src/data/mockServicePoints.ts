import type { ServicePoint } from '@/types';

export const mockServicePoints: ServicePoint[] = [
  {
    id: 'sp001',
    name: '国道维修服务中心',
    address: '河南省郑州市中原区G30连霍高速出口东500米',
    distance: 2.3,
    phone: '0371-88888001',
    rating: 4.8,
    serviceTypes: ['轮胎更换', '紧急补胎', '送油服务', '拖车服务'],
    latitude: 34.7466,
    longitude: 113.6253,
    status: 'online'
  },
  {
    id: 'sp002',
    name: '顺丰汽车维修站',
    address: '河南省郑州市金水区花园路与三全路交叉口北200米',
    distance: 5.8,
    phone: '0371-88888002',
    rating: 4.6,
    serviceTypes: ['发动机维修', '电路检修', '刹车系统', '空调维修'],
    latitude: 34.7856,
    longitude: 113.6682,
    status: 'online'
  },
  {
    id: 'sp003',
    name: '路通重型车辆维修',
    address: '河南省郑州市管城回族区南三环与文治路交叉口',
    distance: 8.2,
    phone: '0371-88888003',
    rating: 4.9,
    serviceTypes: ['重卡维修', '底盘维修', '变速箱维修', '拖车服务'],
    latitude: 34.7125,
    longitude: 113.6958,
    status: 'busy'
  },
  {
    id: 'sp004',
    name: '快捷道路救援',
    address: '河南省郑州市惠济区江山路与大河路交叉口',
    distance: 12.5,
    phone: '0371-88888004',
    rating: 4.5,
    serviceTypes: ['紧急救援', '拖车服务', '搭电启动', '送油服务'],
    latitude: 34.8562,
    longitude: 113.5869,
    status: 'online'
  },
  {
    id: 'sp005',
    name: '老兵汽修服务部',
    address: '河南省郑州市二七区航海路与大学路交叉口西300米',
    distance: 15.0,
    phone: '0371-88888005',
    rating: 4.7,
    serviceTypes: ['轮胎服务', '发动机维修', '常规保养', '空调维修'],
    latitude: 34.7128,
    longitude: 113.6256,
    status: 'offline'
  }
];

export default mockServicePoints;
