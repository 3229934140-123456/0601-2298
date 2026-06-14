import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { ServicePoint } from '@/types';
import { formatDistance } from '@/utils';

interface ServicePointCardProps {
  point: ServicePoint;
  showTags?: boolean;
  onCall?: () => void;
}

const statusMap = {
  online: { label: '在线', className: styles.online },
  busy: { label: '繁忙', className: styles.busy },
  offline: { label: '离线', className: styles.offline }
};

const ServicePointCard: React.FC<ServicePointCardProps> = ({ point, showTags = false, onCall }) => {
  const status = statusMap[point.status] || statusMap.offline;

  const handleCall = () => {
    if (onCall) {
      onCall();
    } else {
      Taro.makePhoneCall({
        phoneNumber: point.phone,
        fail: (err) => {
          console.error('[ServicePointCard] 拨打电话失败:', err);
        }
      });
    }
  };

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.name}>{point.name}</Text>
        <View className={classnames(styles.status, status.className)}>{status.label}</View>
      </View>

      <View className={styles.address}>
        <Text className={styles.icon}>📍</Text>
        <Text className={styles.text}>{point.address}</Text>
      </View>

      {showTags && (
        <View className={styles.tags}>
          {point.serviceTypes.slice(0, 4).map((tag, index) => (
            <Text key={index} className={styles.tag}>{tag}</Text>
          ))}
        </View>
      )}

      <View className={styles.info}>
        <View className={styles.left}>
          <View className={classnames(styles.infoItem, styles.distance)}>
            <Text className={styles.icon}>🚗</Text>
            <Text>{formatDistance(point.distance)}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.icon}>⭐</Text>
            <Text>{point.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Button className={styles.phoneBtn} onClick={handleCall}>
          电话
        </Button>
      </View>
    </View>
  );
};

export default ServicePointCard;
