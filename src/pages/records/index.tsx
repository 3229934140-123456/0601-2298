import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockRepairRecords } from '@/data/mockRecords';
import type { RepairRecord } from '@/types';
import { getFaultTypeLabel, formatDate } from '@/utils';

type FilterType = 'all' | 'completed' | 'inProgress';

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<RepairRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showDetail, setShowDetail] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<RepairRecord | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    console.log('[Records] 页面初始化');
    setRecords(mockRepairRecords);
  }, []);

  const tabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'completed', label: '已完成' },
    { key: 'inProgress', label: '进行中' }
  ];

  const filteredRecords = records.filter((record) => {
    if (filter === 'all') return true;
    return record.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      completed: { label: '已完成', className: styles.statusCompleted },
      inProgress: { label: '进行中', className: styles.statusInProgress },
      cancelled: { label: '已取消', className: styles.statusCancelled }
    };
    return map[status] || { label: status, className: styles.statusCancelled };
  };

  const handleViewDetail = (record: RepairRecord) => {
    console.log('[Records] 查看详情:', record.id);
    setCurrentRecord(record);
    setShowDetail(true);
  };

  const handleRate = (record: RepairRecord) => {
    console.log('[Records] 评价:', record.id);
    setCurrentRecord(record);
    setRating(record.rating || 5);
    setComment(record.comment || '');
    setShowRating(true);
  };

  const handleSubmitRating = () => {
    console.log('[Records] 提交评价:', rating, comment);
    if (currentRecord) {
      const updated = records.map(r =>
        r.id === currentRecord.id
          ? { ...r, rating, comment, status: 'completed' as const }
          : r
      );
      setRecords(updated);
      setCurrentRecord(prev => prev ? { ...prev, rating, comment } : null);
    }
    setShowRating(false);
    Taro.showToast({ title: '评价成功', icon: 'success' });
  };

  const handleShareFleet = () => {
    console.log('[Records] 分享给车队');
    Taro.showToast({
      title: '已生成故障单分享给车队',
      icon: 'success'
    });
  };

  const handleGoReport = () => {
    Taro.switchTab({
      url: '/pages/report/index',
      fail: (err) => {
        console.error('[Records] 跳转失败:', err);
      }
    });
  };

  const renderStars = (count: number) => {
    return '⭐'.repeat(count) + '☆'.repeat(5 - count);
  };

  return (
    <View className={styles.page}>
      <View className={styles.filterTabs}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, {
              [styles.active]: filter === tab.key
            })}
            onClick={() => setFilter(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {filteredRecords.length > 0 ? (
        <ScrollView scrollY className={styles.recordList}>
          {filteredRecords.map((record) => {
            const statusBadge = getStatusBadge(record.status);
            return (
              <View
                key={record.id}
                className={styles.recordCard}
                onClick={() => handleViewDetail(record)}
              >
                <View className={styles.recordHeader}>
                  <View className={styles.recordLeft}>
                    <Text className={styles.recordTitle}>
                      {getFaultTypeLabel(record.faultType)}
                    </Text>
                    <View className={styles.recordMeta}>
                      <Text>{record.date}</Text>
                      <Text>·</Text>
                      <Text>{record.servicePoint}</Text>
                    </View>
                  </View>
                  <View
                    className={classnames(styles.statusBadge, statusBadge.className)}
                  >
                    {statusBadge.label}
                  </View>
                </View>

                <View className={styles.recordBody}>
                  <Text className={styles.recordDesc}>{record.faultDesc}</Text>
                  {record.photos.length > 0 && (
                    <View className={styles.photoList}>
                      {record.photos.slice(0, 3).map((photo, index) => (
                        <View key={index} className={styles.photoItem}>
                          <Image
                            className={styles.photoImg}
                            src={photo}
                            mode="aspectFill"
                          />
                        </View>
                      ))}
                      {record.photos.length > 3 && (
                        <View className={styles.morePhotos}>
                          <Text>+{record.photos.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                <View className={styles.recordFooter}>
                  <View className={styles.recordInfo}>
                    <Text className={styles.cost}>¥{record.cost}</Text>
                    {record.rating > 0 && (
                      <Text className={styles.rating}>
                        {renderStars(record.rating)}
                      </Text>
                    )}
                  </View>
                  <View className={styles.recordActions}>
                    {record.status === 'completed' && !record.rating && (
                      <Button
                        className={classnames(styles.actionBtn, styles.primaryBtn)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRate(record);
                        }}
                      >
                        去评价
                      </Button>
                    )}
                    <Button
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareFleet();
                      }}
                    >
                      故障单
                    </Button>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>暂无维修记录</Text>
          <Button className={styles.emptyBtn} onClick={handleGoReport}>
            发起救援
          </Button>
        </View>
      )}

      {showDetail && currentRecord && (
        <View
          className={styles.detailModal}
          onClick={() => setShowDetail(false)}
        >
          <View
            className={styles.detailContent}
            onClick={(e) => e.stopPropagation()}
          >
            <View className={styles.detailHeader}>
              <Text className={styles.detailTitle}>维修详情</Text>
              <Button
                className={styles.closeBtn}
                onClick={() => setShowDetail(false)}
              >
                ✕
              </Button>
            </View>
            <ScrollView scrollY className={styles.detailBody}>
              <View className={styles.detailSection}>
                <Text className={styles.detailSectionTitle}>基本信息</Text>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>订单编号</Text>
                  <Text className={styles.detailValue}>{currentRecord.orderNo}</Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>故障类型</Text>
                  <Text className={styles.detailValue}>
                    {getFaultTypeLabel(currentRecord.faultType)}
                  </Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>维修时间</Text>
                  <Text className={styles.detailValue}>{currentRecord.date}</Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>服务网点</Text>
                  <Text className={styles.detailValue}>
                    {currentRecord.servicePoint}
                  </Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>维修费用</Text>
                  <Text className={styles.detailValue}>¥{currentRecord.cost}</Text>
                </View>
              </View>

              <View className={styles.detailSection}>
                <Text className={styles.detailSectionTitle}>故障描述</Text>
                <Text className={styles.faultDescText}>
                  {currentRecord.faultDesc}
                </Text>
              </View>

              <View className={styles.detailSection}>
                <Text className={styles.detailSectionTitle}>
                  车辆信息
                </Text>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>车牌号</Text>
                  <Text className={styles.detailValue}>
                    {currentRecord.vehicle.plateNumber}
                  </Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>车型</Text>
                  <Text className={styles.detailValue}>
                    {currentRecord.vehicle.vehicleType}
                  </Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>载重/货物</Text>
                  <Text className={styles.detailValue}>
                    {currentRecord.vehicle.loadWeight} / {currentRecord.vehicle.cargoType}
                  </Text>
                </View>
              </View>

              <View className={styles.detailSection}>
                <Text className={styles.detailSectionTitle}>故障照片</Text>
                {currentRecord.photos.length > 0 ? (
                  <View className={styles.detailPhotos}>
                    {currentRecord.photos.map((photo, index) => (
                      <View key={index} className={styles.detailPhoto}>
                        <Image
                          className={styles.detailPhotoImg}
                          src={photo}
                          mode="aspectFill"
                        />
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className={styles.emptyPhotoText}>暂无照片</Text>
                )}
              </View>

              {currentRecord.rating > 0 && (
                <View className={styles.detailSection}>
                  <Text className={styles.detailSectionTitle}>我的评价</Text>
                  <View>
                    <Text className={styles.ratingStars}>
                      {renderStars(currentRecord.rating)}
                    </Text>
                    {currentRecord.comment && (
                      <Text className={styles.ratingComment}>
                        {currentRecord.comment}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              <Button className={styles.shareBtn} onClick={handleShareFleet}>
                生成故障单给车队查看
              </Button>
            </ScrollView>
          </View>
        </View>
      )}

      {showRating && (
        <View
          className={styles.ratingModalOverlay}
          onClick={() => setShowRating(false)}
        >
          <View
            className={styles.ratingModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Text className={styles.ratingModalTitle}>评价服务</Text>
            <View className={styles.starList}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  className={classnames(styles.starItem, {
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
              className={styles.ratingInput}
            />
            <View className={styles.ratingModalActions}>
              <Button
                className={classnames(styles.ratingModalBtn, styles.ratingModalBtnCancel)}
                onClick={() => setShowRating(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.ratingModalBtn, styles.ratingModalBtnConfirm)}
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

export default RecordsPage;
