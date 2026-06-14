import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import useRescueStore from '@/store/useRescueStore';
import StatusStep from '@/components/StatusStep';
import type { RescueOrder, RescueStatus } from '@/types';
import { getFaultTypeLabel, getStatusLabel, formatDate } from '@/utils';
import { mockServicePoints } from '@/data/mockServicePoints';

const mockRescuer = {
  id: 'r001',
  name: '张师傅',
  phone: '13800138000',
  avatar: '',
  rating: 4.9,
  orderCount: 328,
  vehicle: '救援拖车',
  plateNumber: '豫A·12345救'
};

const stepList: { key: RescueStatus; label: string }[] = [
  { key: 'pending', label: '提交申请' },
  { key: 'assigned', label: '系统派单' },
  { key: 'onTheWay', label: '救援出发' },
  { key: 'arrived', label: '到达现场' },
  { key: 'repairing', label: '维修中' },
  { key: 'completed', label: '维修完成' }
];

const ProgressPage: React.FC = () => {
  const { currentOrder, updateOrderStatus, rateOrder, toggleFleetShare } = useRescueStore();
  const [order, setOrder] = useState<RescueOrder | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    console.log('[Progress] 页面初始化');
    if (currentOrder) {
      setOrder(currentOrder);
    } else {
      loadMockOrder();
    }
  }, [currentOrder]);

  const loadMockOrder = () => {
    const mockOrder: RescueOrder = {
      id: 'mock001',
      orderNo: 'R20240620001',
      status: 'onTheWay',
      faultType: 'tire',
      faultDesc: '右后轮胎爆胎，需要更换新轮胎',
      photos: ['https://picsum.photos/id/101/300/300'],
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
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      servicePoint: mockServicePoints[0],
      rescuer: mockRescuer,
      estimatedArrivalTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      fleetShared: false
    };
    setOrder(mockOrder);
  };

  const getCurrentStepIndex = (status: RescueStatus): number => {
    return stepList.findIndex(s => s.key === status);
  };

  const getStepStatus = (index: number, currentIndex: number): 'done' | 'active' | 'pending' => {
    if (index < currentIndex) return 'done';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  const handleCallRescuer = () => {
    console.log('[Progress] 拨打救援员电话');
    if (order?.rescuer?.phone) {
      Taro.makePhoneCall({
        phoneNumber: order.rescuer.phone,
        fail: (err) => {
          console.error('[Progress] 拨打电话失败:', err);
        }
      });
    }
  };

  const handleCallService = () => {
    console.log('[Progress] 拨打服务点电话');
    if (order?.servicePoint?.phone) {
      Taro.makePhoneCall({
        phoneNumber: order.servicePoint.phone,
        fail: (err) => {
          console.error('[Progress] 拨打服务点电话失败:', err);
        }
      });
    }
  };

  const handleConfirmComplete = () => {
    console.log('[Progress] 确认完成');
    Taro.showModal({
      title: '确认完成',
      content: '请确认救援服务已完成',
      confirmText: '确认完成',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          updateOrderStatus('completed');
          setOrder(prev => prev ? { ...prev, status: 'completed', completedAt: new Date().toISOString() } : null);
          setShowRating(true);
          Taro.showToast({ title: '已确认完成', icon: 'success' });
        }
      }
    });
  };

  const handleSubmitRating = () => {
    console.log('[Progress] 提交评价:', rating, comment);
    if (order) {
      rateOrder(order.id, rating, comment);
      setOrder(prev => prev ? { ...prev, rating, comment } : null);
    }
    setShowRating(false);
    Taro.showToast({ title: '评价成功', icon: 'success' });
  };

  const handleShareFleet = () => {
    console.log('[Progress] 分享给车队');
    if (order) {
      toggleFleetShare(order.id);
      setOrder(prev => prev ? { ...prev, fleetShared: !prev.fleetShared } : null);
      Taro.showToast({
        title: order.fleetShared ? '已取消分享' : '已分享给车队',
        icon: 'success'
      });
    }
  };

  const handleGoReport = () => {
    Taro.switchTab({
      url: '/pages/report/index',
      fail: (err) => {
        console.error('[Progress] 跳转失败:', err);
      }
    });
  };

  const getEtaText = (): string => {
    if (!order?.estimatedArrivalTime) return '--';
    const eta = new Date(order.estimatedArrivalTime).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((eta - now) / 60000));
    if (diff > 60) {
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return `${hours}小时${mins}分钟`;
    }
    return `${diff}分钟`;
  };

  if (!order) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🚛</Text>
          <Text className={styles.emptyText}>暂无进行中的救援订单</Text>
          <Button className={styles.emptyBtn} onClick={handleGoReport}>
            发起救援
          </Button>
        </View>
      </View>
    );
  }

  const currentStepIndex = getCurrentStepIndex(order.status);
  const isCompleted = order.status === 'completed';

  return (
    <View className={styles.page}>
      <View className={styles.statusCard}>
        <View className={styles.statusBadge}>
          {getStatusLabel(order.status)}
        </View>
        <Text className={styles.statusTitle}>
          {isCompleted ? '救援已完成' : '救援进行中'}
        </Text>
        <Text className={styles.statusDesc}>
          {order.servicePoint?.name || '正在匹配服务点...'}
        </Text>

        {!isCompleted && order.estimatedArrivalTime && (
          <View className={styles.etaInfo}>
            <Text className={styles.etaLabel}>预计到达</Text>
            <Text className={styles.etaTime}>{getEtaText()}</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📊</Text>
          救援进度
        </Text>
        <StatusStep currentStatus={order.status} title="" />
      </View>

      {order.rescuer && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>👷</Text>
            救援人员
          </Text>
          <View className={styles.rescuerCard}>
            <View className={styles.avatar}>
              <Text>👨‍🔧</Text>
            </View>
            <View className={styles.rescuerInfo}>
              <Text className={styles.rescuerName}>{order.rescuer.name}</Text>
              <View className={styles.rescuerMeta}>
                <Text className={styles.rating}>⭐ {order.rescuer.rating}</Text>
                <Text>{order.rescuer.orderCount}单</Text>
              </View>
              <Text className={styles.rescuerVehicle}>
                {order.rescuer.vehicle} · {order.rescuer.plateNumber}
              </Text>
            </View>
            <Button className={styles.callBtn} onClick={handleCallRescuer}>
              📞
            </Button>
          </View>
        </View>
      )}

      {order.servicePoint && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>🏪</Text>
            服务网点
          </Text>
          <View className={styles.servicePointInfo}>
            <Text className={styles.pointIcon}>📍</Text>
            <View className={styles.pointContent}>
              <Text className={styles.pointName}>{order.servicePoint.name}</Text>
              <Text className={styles.pointAddress}>{order.servicePoint.address}</Text>
              <View className={styles.pointMeta}>
                <Text className={styles.distance}>
                  {order.servicePoint.distance}km
                </Text>
                <Text>⭐ {order.servicePoint.rating}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📋</Text>
          订单信息
        </Text>
        <View className={styles.orderInfo}>
          <View className={styles.orderRow}>
            <Text className={styles.orderLabel}>订单编号</Text>
            <Text className={styles.orderValue}>{order.orderNo}</Text>
          </View>
          <View className={styles.orderRow}>
            <Text className={styles.orderLabel}>故障类型</Text>
            <Text className={styles.orderValue}>
              {getFaultTypeLabel(order.faultType)}
              <Text className={styles.vehicleTag}>
                {order.vehicle.vehicleType}
              </Text>
            </Text>
          </View>
          <View className={styles.orderRow}>
            <Text className={styles.orderLabel}>车牌号</Text>
            <Text className={styles.orderValue}>{order.vehicle.plateNumber}</Text>
          </View>
          <View className={styles.orderRow}>
            <Text className={styles.orderLabel}>载重/货物</Text>
            <Text className={styles.orderValue}>
              {order.vehicle.loadWeight} / {order.vehicle.cargoType}
            </Text>
          </View>
          <View className={styles.orderRow}>
            <Text className={styles.orderLabel}>提交时间</Text>
            <Text className={styles.orderValue}>{formatDate(order.createdAt)}</Text>
          </View>
          <View className={styles.orderRow}>
            <Text className={styles.orderLabel}>故障描述</Text>
            <Text className={styles.orderValue}>{order.faultDesc || '无'}</Text>
          </View>
        </View>
      </View>

      {order.rating && order.status === 'completed' && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>⭐</Text>
            我的评价
          </Text>
          <View className={styles.ratingSection}>
            <Text className={styles.stars}>
              {'⭐'.repeat(order.rating)}
            </Text>
            {order.comment && (
              <Text className={styles.comment}>
                {order.comment}
              </Text>
            )}
          </View>
        </View>
      )}

      <View className={styles.bottomBar}>
        {!isCompleted ? (
          <>
            <Button
              className={classnames(styles.btn, styles.btnSecondary)}
              onClick={handleCallService}
            >
              联系服务点
            </Button>
            <Button
              className={classnames(styles.btn, styles.btnPrimary)}
              onClick={handleCallRescuer}
            >
              联系救援员
            </Button>
          </>
        ) : (
          <>
            <Button
              className={classnames(styles.btn, styles.btnSecondary)}
              onClick={handleShareFleet}
            >
              {order.fleetShared ? '取消分享' : '分享车队'}
            </Button>
            {!order.rating && (
              <Button
                className={classnames(styles.btn, styles.btnSuccess)}
                onClick={() => setShowRating(true)}
              >
                评价服务
              </Button>
            )}
          </>
        )}
      </View>

      {showRating && (
        <View
          className={styles.modalOverlay}
          onClick={() => setShowRating(false)}
        >
          <View
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Text className={styles.modalTitle}>评价服务</Text>
            <View className={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  className={classnames(styles.star, {
                    [styles.active]: star <= rating
                  })}
                  onClick={() => setRating(star)}
                >
                  ⭐
                </Text>
              ))}
            </View>
            <Input
              placeholder="请输入评价内容（选填）"
              value={comment}
              onInput={(e) => setComment(e.detail.value)}
              className={styles.modalInput}
            />
            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnCancel)}
                onClick={() => setShowRating(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnConfirm)}
                onClick={handleSubmitRating}
              >
                提交评价
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProgressPage;
