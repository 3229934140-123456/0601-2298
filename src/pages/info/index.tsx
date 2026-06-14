import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockVehicles, mockReminders } from '@/data/mockVehicles';
import { mockServicePoints } from '@/data/mockServicePoints';
import type { Vehicle, Reminder, ServicePoint } from '@/types';
import { getReminderTypeLabel, getReminderTypeColor, formatDistance } from '@/utils';

const InfoPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);

  useEffect(() => {
    console.log('[Info] 页面初始化');
    setVehicles(mockVehicles);
    setReminders(mockReminders);
    setServicePoints(mockServicePoints);
  }, []);

  const getDaysColor = (days: number) => {
    if (days <= 15) return styles.urgent;
    if (days <= 30) return styles.warning;
    return styles.normal;
  };

  const getReminderIcon = (type: string) => {
    const map: Record<string, string> = {
      annualInspection: '🔍',
      insurance: '🛡️',
      maintenance: '🔧'
    };
    return map[type] || '📋';
  };

  const getReminderBg = (type: string) => {
    const map: Record<string, string> = {
      annualInspection: 'rgba(255, 122, 0, 0.1)',
      insurance: 'rgba(30, 111, 255, 0.1)',
      maintenance: 'rgba(0, 180, 42, 0.1)'
    };
    return map[type] || '#F7F8FA';
  };

  const handleCallService = (phone: string) => {
    console.log('[Info] 拨打服务点电话:', phone);
    Taro.makePhoneCall({
      phoneNumber: phone,
      fail: (err) => {
        console.error('[Info] 拨打电话失败:', err);
      }
    });
  };

  const handleMenuClick = (menu: string) => {
    console.log('[Info] 点击菜单:', menu);
    Taro.showToast({
      title: `${menu}功能开发中`,
      icon: 'none'
    });
  };

  const menuItems = [
    { icon: '📋', text: '使用帮助', bg: '#E8F3FF', color: '#1E6FFF' },
    { icon: '💬', text: '意见反馈', bg: '#FFF4E6', color: '#FF7A00' },
    { icon: 'ℹ️', text: '关于我们', bg: '#E6FFED', color: '#00B42A' },
    { icon: '⚙️', text: '系统设置', bg: '#F2F3F5', color: '#4E5969' }
  ];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.userCard}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Text>👨‍✈️</Text>
          </View>
          <View className={styles.userDetail}>
            <Text className={styles.userName}>李师傅</Text>
            <Text className={styles.userPhone}>138****8888</Text>
          </View>
        </View>
        <View className={styles.userStats}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>12</Text>
            <Text className={styles.statLabel}>救援次数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>2</Text>
            <Text className={styles.statLabel}>车辆数量</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>4.8</Text>
            <Text className={styles.statLabel}>平均评分</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>⏰</Text>
            重要提醒
          </Text>
          <Button
            className={styles.moreBtn}
            onClick={() => handleMenuClick('更多提醒')}
          >
            更多
          </Button>
        </View>
        <View className={styles.reminderList}>
          {reminders.length > 0 ? (
            reminders.map((reminder) => (
              <View key={reminder.id} className={styles.reminderItem}>
                <View
                  className={styles.reminderIcon}
                  style={{ background: getReminderBg(reminder.type) }}
                >
                  <Text>{getReminderIcon(reminder.type)}</Text>
                </View>
                <View className={styles.reminderInfo}>
                  <Text className={styles.reminderTitle}>{reminder.title}</Text>
                  <View className={styles.reminderDesc}>
                    <Text>{reminder.vehiclePlate}</Text>
                    <Text>·</Text>
                    <Text>{reminder.date}</Text>
                    <Text
                      className={classnames(styles.daysLeft, getDaysColor(reminder.daysLeft))}
                    >
                      还剩{reminder.daysLeft}天
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text>暂无提醒</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>🚚</Text>
            我的车辆
          </Text>
          <Button
            className={styles.moreBtn}
            onClick={() => handleMenuClick('管理车辆')}
          >
            管理
          </Button>
        </View>
        <View className={styles.vehicleList}>
          {vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <View key={vehicle.id} className={styles.vehicleItem}>
                <View className={styles.vehicleIcon}>
                  <Text>🚛</Text>
                </View>
                <View className={styles.vehicleItemInfo}>
                  <Text className={styles.vehicleItemPlate}>
                    {vehicle.plateNumber}
                  </Text>
                  <Text className={styles.vehicleItemDesc}>
                    {vehicle.brand} {vehicle.model} · {vehicle.vehicleType}
                  </Text>
                </View>
                <Text className={styles.arrow}>›</Text>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text>暂无车辆信息</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>🏪</Text>
            附近服务点
          </Text>
          <Button
            className={styles.moreBtn}
            onClick={() => handleMenuClick('更多服务点')}
          >
            全部
          </Button>
        </View>
        <View className={styles.serviceList}>
          {servicePoints.slice(0, 3).map((point) => (
            <View key={point.id} className={styles.serviceItem}>
              <View className={styles.serviceIcon}>
                <Text>🔧</Text>
              </View>
              <View className={styles.serviceInfo}>
                <Text className={styles.serviceName}>{point.name}</Text>
                <View className={styles.serviceDesc}>
                  <Text className={styles.distance}>
                    {formatDistance(point.distance)}
                  </Text>
                  <Text>·</Text>
                  <Text>⭐ {point.rating}</Text>
                </View>
              </View>
              <Button
                className={styles.callBtn}
                onClick={() => handleCallService(point.phone)}
              >
                📞
              </Button>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>📋</Text>
            更多功能
          </Text>
        </View>
        <View className={styles.menuList}>
          {menuItems.map((item, index) => (
            <View
              key={index}
              className={styles.menuItem}
              onClick={() => handleMenuClick(item.text)}
            >
              <View
                className={styles.menuIcon}
                style={{ background: item.bg }}
              >
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.menuText}>{item.text}</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default InfoPage;
