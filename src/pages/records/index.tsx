import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import useRescueStore from '@/store/useRescueStore';
import type { RepairRecord } from '@/types';
import { getFaultTypeLabel, formatDate } from '@/utils';

type FilterType = 'all' | 'completed' | 'inProgress';

const RecordsPage: React.FC = () => {
  const { repairRecords, initRepairRecords, rateOrder } = useRescueStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showDetail, setShowDetail] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<RepairRecord | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFaultReport, setShowFaultReport] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  useEffect(() => {
    console.log('[Records] 页面初始化');
    initRepairRecords();
  }, [initRepairRecords]);

  useEffect(() => {
    if (showDetail && currentRecord) {
      const updated = repairRecords.find(r => r.id === currentRecord.id);
      if (updated) {
        setCurrentRecord(updated);
      }
    }
  }, [repairRecords, showDetail, currentRecord?.id]);

  const tabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'completed', label: '已完成' },
    { key: 'inProgress', label: '进行中' }
  ];

  const filteredRecords = repairRecords.filter((record) => {
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
      rateOrder(currentRecord.id, rating, comment);
      Taro.showToast({ title: '评价成功', icon: 'success' });
    }
    setShowRating(false);
  };

  const handleShareFleet = () => {
    console.log('[Records] 查看故障单');
    if (currentRecord) {
      setShowFaultReport(true);
    }
  };

  const handlePlayFaultReportVoice = () => {
    console.log('[Records] 播放故障单语音');
    setIsVoicePlaying(true);
    Taro.showToast({ title: '正在播放语音...', icon: 'none' });
    setTimeout(() => {
      setIsVoicePlaying(false);
    }, 3000);
  };

  const handleGoReport = () => {
    Taro.switchTab({
      url: '/pages/report/index',
      fail: (err) => {
        console.error('[Records] 跳转失败:', err);
      }
    });
  };

  const handlePlayVoice = () => {
    console.log('[Records] 播放语音');
    setIsPlaying(true);
    Taro.showToast({ title: '正在播放语音...', icon: 'none' });
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  const formatVoiceDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                        setCurrentRecord(record);
                        setShowFaultReport(true);
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
                <Text className={styles.detailSectionTitle}>语音描述</Text>
                {currentRecord.voiceUrl ? (
                  <View className={styles.detailVoice}>
                    <Button
                      className={styles.detailVoicePlayBtn}
                      onClick={handlePlayVoice}
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </Button>
                    <View className={styles.detailVoiceInfo}>
                      <Text className={styles.detailVoiceLabel}>故障语音描述</Text>
                      <Text className={styles.detailVoiceDuration}>
                        {formatVoiceDuration(currentRecord.voiceDuration || 0)}
                      </Text>
                      <View className={styles.detailVoiceWave}>
                        {[...Array(8)].map((_, i) => (
                          <View
                            key={i}
                            className={classnames(styles.detailVoiceWaveBar, {
                              [styles.active]: isPlaying && i % 2 === 0
                            })}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text className={styles.detailVoiceEmpty}>无语音描述</Text>
                )}
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

      {showFaultReport && currentRecord && (
        <View
          className={styles.faultReportModal}
          onClick={() => setShowFaultReport(false)}
        >
          <View
            className={styles.faultReportContent}
            onClick={(e) => e.stopPropagation()}
          >
            <View className={styles.faultReportHeader}>
              <View>
                <Text className={styles.faultReportTitle}>故障维修单</Text>
                <Text className={styles.faultReportOrderNo}>订单号：{currentRecord.orderNo}</Text>
              </View>
              <Button
                className={styles.faultReportClose}
                onClick={() => setShowFaultReport(false)}
              >
                ✕
              </Button>
            </View>

            <ScrollView scrollY className={styles.faultReportBody}>
              <View className={styles.faultReportSection}>
                <Text className={styles.faultReportSectionTitle}>故障信息</Text>
                <View className={styles.faultReportRow}>
                  <Text className={styles.faultReportLabel}>故障类型</Text>
                  <Text className={styles.faultReportValue}>
                    {getFaultTypeLabel(currentRecord.faultType)}
                  </Text>
                </View>
                <View className={styles.faultReportRow}>
                  <Text className={styles.faultReportLabel}>故障描述</Text>
                  <Text className={styles.faultReportValue}>{currentRecord.faultDesc}</Text>
                </View>
                <View className={styles.faultReportRow}>
                  <Text className={styles.faultReportLabel}>发生时间</Text>
                  <Text className={styles.faultReportValue}>
                    {formatDate(currentRecord.date)}
                  </Text>
                </View>
                <View className={styles.faultReportRow}>
                  <Text className={styles.faultReportLabel}>发生地点</Text>
                  <Text className={styles.faultReportValue}>
                    {currentRecord.location.address}
                  </Text>
                </View>
              </View>

              {currentRecord.voiceUrl && (
                <View className={styles.faultReportSection}>
                  <Text className={styles.faultReportSectionTitle}>语音描述</Text>
                  <View className={styles.faultReportVoice}>
                    <Button
                      className={styles.faultReportVoiceBtn}
                      onClick={handlePlayFaultReportVoice}
                    >
                      {isVoicePlaying ? '⏸' : '▶'}
                    </Button>
                    <View className={styles.faultReportVoiceInfo}>
                      <Text className={styles.faultReportVoiceText}>故障语音描述</Text>
                      <Text className={styles.faultReportVoiceDuration}>
                        时长 {formatVoiceDuration(currentRecord.voiceDuration || 0)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View className={styles.faultReportSection}>
                <Text className={styles.faultReportSectionTitle}>车辆信息</Text>
                <View className={styles.faultReportRow}>
                  <Text className={styles.faultReportLabel}>车牌号</Text>
                  <Text className={styles.faultReportValue}>
                    {currentRecord.vehicle.plateNumber}
                  </Text>
                </View>
                <View className={styles.faultReportRow}>
                  <Text className={styles.faultReportLabel}>车型</Text>
                  <Text className={styles.faultReportValue}>
                    {currentRecord.vehicle.vehicleType}
                  </Text>
                </View>
                <View className={styles.faultReportRow}>
                  <Text className={styles.faultReportLabel}>载重/货物</Text>
                  <Text className={styles.faultReportValue}>
                    {currentRecord.vehicle.loadWeight} / {currentRecord.vehicle.cargoType}
                  </Text>
                </View>
              </View>

              <View className={styles.faultReportSection}>
                <Text className={styles.faultReportSectionTitle}>服务信息</Text>
                <View className={styles.faultReportRow}>
                  <Text className={styles.faultReportLabel}>服务网点</Text>
                  <Text className={styles.faultReportValue}>
                    {currentRecord.servicePoint}
                  </Text>
                </View>
                <View className={styles.faultReportRow}>
                  <Text className={styles.faultReportLabel}>救援人员</Text>
                  <Text className={styles.faultReportValue}>
                    {currentRecord.rescuer || '已安排'}
                  </Text>
                </View>
                <View className={styles.faultReportRow}>
                  <Text className={styles.faultReportLabel}>维修费用</Text>
                  <Text className={styles.faultReportValue}>¥{currentRecord.cost}</Text>
                </View>
                {currentRecord.rating > 0 && (
                  <View className={styles.faultReportRow}>
                    <Text className={styles.faultReportLabel}>服务评分</Text>
                    <Text className={styles.faultReportValue}>
                      {renderStars(currentRecord.rating)}
                    </Text>
                  </View>
                )}
              </View>

              {currentRecord.photos.length > 0 && (
                <View className={styles.faultReportSection}>
                  <Text className={styles.faultReportSectionTitle}>故障照片</Text>
                  <View className={styles.faultReportPhotoList}>
                    {currentRecord.photos.map((photo, index) => (
                      <View key={index} className={styles.faultReportPhoto}>
                        <Image
                          className={styles.img}
                          src={photo}
                          mode="aspectFill"
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View className={styles.faultReportFooter}>
              <Button
                className={styles.faultReportShareBtn}
                onClick={() => {
                  Taro.showToast({
                    title: '已分享给车队',
                    icon: 'success'
                  });
                }}
              >
                分享给车队
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RecordsPage;
