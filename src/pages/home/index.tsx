import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import useRescueStore from '@/store/useRescueStore';
import ServicePointCard from '@/components/ServicePointCard';
import type { LocationInfo, Reminder, ServicePoint } from '@/types';
import { mockServicePoints } from '@/data/mockServicePoints';
import { mockReminders } from '@/data/mockVehicles';

const HomePage: React.FC = () => {
  const { setCurrentLocation, setServicePoints, setReminders, isLocationLoading, setIsLocationLoading } = useRescueStore();
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [servicePoints, setServicePointsState] = useState<ServicePoint[]>([]);
  const [reminders, setRemindersState] = useState<Reminder[]>([]);

  useEffect(() => {
    console.log('[Home] 页面初始化');
    getLocation();
    loadMockData();
  }, []);

  const loadMockData = () => {
    setServicePointsState(mockServicePoints.slice(0, 3));
    setServicePoints(mockServicePoints);
    setRemindersState(mockReminders);
    setReminders(mockReminders);
  };

  const getLocation = useCallback(async () => {
    setLoading(true);
    setIsLocationLoading(true);
    console.log('[Home] 开始获取位置...');

    try {
      const res = await Taro.getLocation({
        type: 'gcj02',
        isHighAccuracy: true
      });
      console.log('[Home] 获取位置成功:', res);

      const mockLocation: LocationInfo = {
        latitude: res.latitude || 34.7466,
        longitude: res.longitude || 113.6253,
        address: '河南省郑州市中原区G30连霍高速出口东500米',
        province: '河南省',
        city: '郑州市',
        district: '中原区',
        roadName: 'G30连霍高速'
      };

      setLocation(mockLocation);
      setCurrentLocation(mockLocation);
    } catch (err) {
      console.error('[Home] 获取位置失败:', err);
      const mockLocation: LocationInfo = {
        latitude: 34.7466,
        longitude: 113.6253,
        address: '河南省郑州市中原区G30连霍高速出口东500米',
        province: '河南省',
        city: '郑州市',
        district: '中原区',
        roadName: 'G30连霍高速'
      };
      setLocation(mockLocation);
      setCurrentLocation(mockLocation);
    } finally {
      setLoading(false);
      setIsLocationLoading(false);
    }
  }, [setCurrentLocation, setIsLocationLoading]);

  const handleQuickRescue = () => {
    console.log('[Home] 一键救援');
    Taro.showModal({
      title: '发起救援',
      content: '确认使用当前位置发起紧急救援？',
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({
            url: '/pages/report/index',
            fail: (err) => {
              console.error('[Home] 跳转到故障上报页失败:', err);
            }
          });
        }
      }
    });
  };

  const handleAction = (index: number) => {
    console.log('[Home] 点击快捷功能:', index);
    const tabMap: Record<number, string> = {
      0: '/pages/report/index',
      1: '/pages/progress/index',
      2: '/pages/records/index',
      3: '/pages/info/index'
    };
    const url = tabMap[index];
    if (url) {
      Taro.switchTab({
        url,
        fail: (err) => {
          console.error('[Home] 页面跳转失败:', err);
        }
      });
    }
  };

  const handlePullDownRefresh = () => {
    console.log('[Home] 下拉刷新');
    Promise.all([getLocation()]).then(() => {
      Taro.stopPullDownRefresh();
    });
  };

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage) {
      (currentPage as any).onPullDownRefresh = handlePullDownRefresh;
    }
  }, []);

  const actions = [
    { icon: '🚨', text: '故障上报', className: styles.action1 },
    { icon: '🚗', text: '救援进度', className: styles.action2 },
    { icon: '📋', text: '维修记录', className: styles.action3 },
    { icon: '📁', text: '常用资料', className: styles.action4 }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerContent}>
          <Text className={styles.title}>公路救援</Text>
          <Text className={styles.subtitle}>24小时道路救援服务</Text>

          <View className={styles.locationCard}>
            <View className={styles.locationHeader}>
              <Text className={styles.locationIcon}>📍</Text>
              <Text className={styles.locationLabel}>当前位置</Text>
              <Button className={styles.refreshBtn} onClick={getLocation}>
                {loading ? '定位中...' : '刷新'}
              </Button>
            </View>
            <Text className={styles.locationAddress}>
              {loading ? (
                <Text className={styles.loading}>正在获取位置...</Text>
              ) : (
                location?.address || '位置获取失败'
              )}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.main}>
        <View className={styles.rescueBtnWrapper}>
          <Button className={styles.rescueBtn} onClick={handleQuickRescue}>
            <Text className={styles.icon}>🆘</Text>
            <Text>一键救援</Text>
          </Button>
        </View>

        <View className={styles.quickActions}>
          <Text className={styles.sectionTitle}>快捷功能</Text>
          <View className={styles.actionGrid}>
            {actions.map((action, index) => (
              <View
                key={index}
                className={styles.actionItem}
                onClick={() => handleAction(index)}
              >
                <View className={`${styles.actionIcon} ${action.className}`}>
                  <Text>{action.icon}</Text>
                </View>
                <Text className={styles.actionText}>{action.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {reminders.length > 0 && (
          <View className={styles.reminderSection}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>重要提醒</Text>
              <Button
                className={styles.moreBtn}
                onClick={() => Taro.switchTab({ url: '/pages/info/index' })}
              >
                查看全部
              </Button>
            </View>
            {reminders.slice(0, 2).map((reminder) => (
              <View key={reminder.id} className={styles.reminderCard}>
                <View className={styles.reminderIcon}>
                  <Text>{reminder.type === 'insurance' ? '🛡️' : reminder.type === 'annualInspection' ? '🔍' : '🔧'}</Text>
                </View>
                <View className={styles.reminderContent}>
                  <Text className={styles.reminderTitle}>{reminder.title}</Text>
                  <View className={styles.reminderDesc}>
                    <Text>{reminder.vehiclePlate}</Text>
                    <Text>·</Text>
                    <Text>{reminder.date}</Text>
                    <Text className={styles.daysLeft}>还有{reminder.daysLeft}天</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className={styles.serviceSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>附近服务点</Text>
            <Button
              className={styles.moreBtn}
              onClick={() => Taro.switchTab({ url: '/pages/info/index' })}
            >
              查看更多
            </Button>
          </View>
          <ScrollView scrollY className={styles.serviceList}>
            {servicePoints.length > 0 ? (
              servicePoints.map((point) => (
                <ServicePointCard key={point.id} point={point} showTags />
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text>暂无附近服务点</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      <Button className={styles.fab} onClick={handleQuickRescue}>
        <Text>🆘</Text>
      </Button>
    </View>
  );
};

export default HomePage;
