import type { RepairRecord } from '@/types';

export const mockRepairRecords: RepairRecord[] = [
  {
    id: 'r001',
    orderNo: 'R20240615001',
    faultType: 'tire',
    faultDesc: '右后轮胎爆胎，需要更换新轮胎',
    date: '2024-06-15 14:30',
    servicePoint: '国道维修服务中心',
    cost: 850,
    rating: 5,
    status: 'completed',
    photos: [
      'https://picsum.photos/id/101/300/300',
      'https://picsum.photos/id/102/300/300'
    ],
    vehicle: {
      plateNumber: '豫A88888',
      vehicleType: '重型卡车',
      loadWeight: '30吨',
      cargoType: '建材'
    },
    location: {
      latitude: 34.7466,
      longitude: 113.6253,
      address: '河南省郑州市中原区G30连霍高速出口东500米',
      province: '河南省',
      city: '郑州市',
      district: '中原区',
      roadName: 'G30连霍高速'
    },
    rescuer: '张师傅',
    comment: '师傅到达很快，服务态度好，技术专业'
  },
  {
    id: 'r002',
    orderNo: 'R20240528002',
    faultType: 'fuel',
    faultDesc: '燃油耗尽，需要送油服务',
    date: '2024-05-28 09:15',
    servicePoint: '快捷道路救援',
    cost: 300,
    rating: 4,
    status: 'completed',
    photos: [
      'https://picsum.photos/id/103/300/300'
    ],
    vehicle: {
      plateNumber: '豫A88888',
      vehicleType: '重型卡车',
      loadWeight: '25吨',
      cargoType: '食品'
    },
    location: {
      latitude: 34.8562,
      longitude: 113.5869,
      address: '河南省郑州市惠济区江山路与大河路交叉口',
      province: '河南省',
      city: '郑州市',
      district: '惠济区',
      roadName: '江山路'
    },
    rescuer: '李师傅',
    comment: '送油速度还行，就是价格有点贵'
  },
  {
    id: 'r003',
    orderNo: 'R20240410003',
    faultType: 'engine',
    faultDesc: '发动机故障灯亮，动力不足',
    date: '2024-04-10 16:45',
    servicePoint: '顺丰汽车维修站',
    cost: 2800,
    rating: 5,
    status: 'completed',
    photos: [
      'https://picsum.photos/id/104/300/300',
      'https://picsum.photos/id/105/300/300',
      'https://picsum.photos/id/106/300/300'
    ],
    vehicle: {
      plateNumber: '豫A88888',
      vehicleType: '重型卡车',
      loadWeight: '20吨',
      cargoType: '电子产品'
    },
    location: {
      latitude: 34.7856,
      longitude: 113.6682,
      address: '河南省郑州市金水区花园路与三全路交叉口北200米',
      province: '河南省',
      city: '郑州市',
      district: '金水区',
      roadName: '花园路'
    },
    rescuer: '王师傅',
    comment: '专业技术强，问题诊断准确，维修后一直没有问题'
  },
  {
    id: 'r004',
    orderNo: 'R20240305004',
    faultType: 'brake',
    faultDesc: '刹车系统异响，制动效果变差',
    date: '2024-03-05 11:20',
    servicePoint: '路通重型车辆维修',
    cost: 1500,
    rating: 4,
    status: 'completed',
    photos: [
      'https://picsum.photos/id/107/300/300',
      'https://picsum.photos/id/108/300/300'
    ],
    vehicle: {
      plateNumber: '豫A88888',
      vehicleType: '重型卡车',
      loadWeight: '28吨',
      cargoType: '家具'
    },
    location: {
      latitude: 34.7125,
      longitude: 113.6958,
      address: '河南省郑州市管城回族区南三环与文治路交叉口',
      province: '河南省',
      city: '郑州市',
      district: '管城回族区',
      roadName: '南三环'
    },
    rescuer: '赵师傅',
    comment: '维修质量不错，价格合理'
  },
  {
    id: 'r005',
    orderNo: 'R20240218005',
    faultType: 'electrical',
    faultDesc: '电瓶亏电，无法启动',
    date: '2024-02-18 07:30',
    servicePoint: '老兵汽修服务部',
    cost: 200,
    rating: 5,
    status: 'completed',
    photos: [
      'https://picsum.photos/id/109/300/300'
    ],
    vehicle: {
      plateNumber: '豫A88888',
      vehicleType: '重型卡车',
      loadWeight: '0吨',
      cargoType: '空车'
    },
    location: {
      latitude: 34.7128,
      longitude: 113.6256,
      address: '河南省郑州市二七区航海路与大学路交叉口西300米',
      province: '河南省',
      city: '郑州市',
      district: '二七区',
      roadName: '航海路'
    },
    rescuer: '刘师傅',
    comment: '师傅来得特别快，一大早也能及时赶到，非常感谢'
  },
  {
    id: 'r006',
    orderNo: 'R20240620006',
    faultType: 'other',
    faultDesc: '车厢门锁损坏，无法关闭',
    date: '2024-06-20 13:00',
    servicePoint: '国道维修服务中心',
    cost: 450,
    rating: 0,
    status: 'inProgress',
    photos: [
      'https://picsum.photos/id/110/300/300'
    ],
    vehicle: {
      plateNumber: '豫A66666',
      vehicleType: '中型货车',
      loadWeight: '10吨',
      cargoType: '日用品'
    },
    location: {
      latitude: 34.7466,
      longitude: 113.6253,
      address: '河南省郑州市中原区G30连霍高速出口东500米',
      province: '河南省',
      city: '郑州市',
      district: '中原区',
      roadName: 'G30连霍高速'
    }
  }
];

export default mockRepairRecords;
