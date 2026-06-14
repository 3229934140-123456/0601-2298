import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import useRescueStore from '@/store/useRescueStore';
import type { FaultType, LocationInfo, VehicleInfo } from '@/types';
import { getFaultTypeLabel } from '@/utils';
import { mockServicePoints } from '@/data/mockServicePoints';

interface FaultTypeOption {
  key: FaultType;
  label: string;
  icon: string;
}

const faultTypes: FaultTypeOption[] = [
  { key: 'tire', label: '轮胎故障', icon: '🛞' },
  { key: 'fuel', label: '缺油/送油', icon: '⛽' },
  { key: 'engine', label: '发动机故障', icon: '⚙️' },
  { key: 'brake', label: '刹车系统', icon: '🛑' },
  { key: 'electrical', label: '电路故障', icon: '⚡' },
  { key: 'other', label: '其他故障', icon: '🔧' }
];

const ReportPage: React.FC = () => {
  const { currentLocation, createRescueOrder, setCurrentOrder } = useRescueStore();
  const [faultType, setFaultType] = useState<FaultType | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [hasVoice, setHasVoice] = useState(false);
  const [faultDesc, setFaultDesc] = useState('');
  const [vehicle, setVehicle] = useState<VehicleInfo>({
    plateNumber: '',
    vehicleType: '重型卡车',
    loadWeight: '',
    cargoType: ''
  });
  const [location, setLocation] = useState<LocationInfo | null>(null);

  useEffect(() => {
    console.log('[Report] 页面初始化');
    if (currentLocation) {
      setLocation(currentLocation);
    } else {
      getLocation();
    }
  }, [currentLocation]);

  const getLocation = async () => {
    try {
      const res = await Taro.getLocation({
        type: 'gcj02',
        isHighAccuracy: true
      });
      const mockLoc: LocationInfo = {
        latitude: res.latitude || 34.7466,
        longitude: res.longitude || 113.6253,
        address: '河南省郑州市中原区G30连霍高速出口东500米',
        province: '河南省',
        city: '郑州市',
        district: '中原区',
        roadName: 'G30连霍高速'
      };
      setLocation(mockLoc);
    } catch (err) {
      console.error('[Report] 获取位置失败:', err);
      const mockLoc: LocationInfo = {
        latitude: 34.7466,
        longitude: 113.6253,
        address: '河南省郑州市中原区G30连霍高速出口东500米',
        province: '河南省',
        city: '郑州市',
        district: '中原区',
        roadName: 'G30连霍高速'
      };
      setLocation(mockLoc);
    }
  };

  const handleSelectFaultType = (type: FaultType) => {
    console.log('[Report] 选择故障类型:', type);
    setFaultType(type);
  };

  const handleChooseImage = async () => {
    console.log('[Report] 选择照片');
    const remainCount = 9 - photos.length;
    if (remainCount <= 0) {
      Taro.showToast({ title: '最多上传9张照片', icon: 'none' });
      return;
    }

    try {
      const res = await Taro.chooseImage({
        count: remainCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      const newPhotos = [...photos, ...res.tempFilePaths];
      setPhotos(newPhotos.slice(0, 9));
    } catch (err) {
      console.error('[Report] 选择照片失败:', err);
      const mockPhotos = [
        `https://picsum.photos/id/${200 + photos.length}/300/300`
      ];
      setPhotos([...photos, ...mockPhotos].slice(0, 9));
    }
  };

  const handleRemovePhoto = (index: number) => {
    console.log('[Report] 删除照片:', index);
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleToggleRecord = () => {
    console.log('[Report] 切换录音状态:', !isRecording);
    if (isRecording) {
      setIsRecording(false);
      if (recordTime > 0) {
        setHasVoice(true);
      }
    } else {
      setIsRecording(true);
      setRecordTime(0);
      startTimer();
    }
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setRecordTime((prev) => {
        if (prev >= 60) {
          clearInterval(timer);
          setIsRecording(false);
          setHasVoice(true);
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
    setTimeout(() => {
      if (!isRecording) return;
    }, 100);
  };

  const formatRecordTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (field: keyof VehicleInfo, value: string) => {
    setVehicle({ ...vehicle, [field]: value });
  };

  const canSubmit = faultType && location && vehicle.plateNumber;

  const handleSubmit = () => {
    console.log('[Report] 提交救援申请');
    if (!canSubmit) {
      Taro.showToast({
        title: '请完善故障信息',
        icon: 'none'
      });
      return;
    }

    Taro.showLoading({ title: '提交中...' });

    setTimeout(() => {
      const order = createRescueOrder({
        faultType: faultType!,
        faultDesc,
        photos,
        vehicle,
        location: location!,
        voiceUrl: hasVoice ? 'voice://record_' + Date.now() + '.mp3' : undefined,
        voiceDuration: hasVoice ? recordTime || 30 : undefined
      });

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

      const assignedOrder = {
        ...order,
        status: 'assigned' as const,
        servicePoint: mockServicePoints[0],
        rescuer: mockRescuer,
        estimatedArrivalTime: new Date(Date.now() + 25 * 60 * 1000).toISOString()
      };
      setCurrentOrder(assignedOrder);

      Taro.hideLoading();
      Taro.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 1500
      });

      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/progress/index',
          fail: (err) => {
            console.error('[Report] 跳转到救援进度页失败:', err);
          }
        });
      }, 1500);
    }, 1000);
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📍</Text>
          当前位置
        </Text>
        <View className={styles.locationCard}>
          <Text className={styles.locationIcon}>📍</Text>
          <View className={styles.locationInfo}>
            <Text className={styles.locationLabel}>救援位置</Text>
            <Text className={styles.locationAddress}>
              {location?.address || '正在获取位置...'}
            </Text>
          </View>
          <Button className={styles.changeBtn} onClick={getLocation}>
            刷新
          </Button>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🚨</Text>
          故障类型
        </Text>
        <View className={styles.faultTypes}>
          {faultTypes.map((type) => (
            <View
              key={type.key}
              className={classnames(styles.faultType, {
                [styles.selected]: faultType === type.key
              })}
              onClick={() => handleSelectFaultType(type.key)}
            >
              <Text className={styles.typeIcon}>{type.icon}</Text>
              <Text className={styles.typeText}>{type.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📷</Text>
          故障照片 ({photos.length}/9)
        </Text>
        <View className={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={index} className={styles.photoItem}>
              <Image className={styles.photoImg} src={photo} mode="aspectFill" />
              <Button
                className={styles.removeBtn}
                onClick={() => handleRemovePhoto(index)}
              >
                ×
              </Button>
            </View>
          ))}
          {photos.length < 9 && (
            <View className={styles.photoItem} onClick={handleChooseImage}>
              <View className={styles.addPhoto}>
                <Text className={styles.icon}>＋</Text>
                <Text className={styles.text}>添加照片</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🎤</Text>
          语音描述
        </Text>
        <View className={styles.voiceRecorder}>
          <Button
            className={classnames(styles.recordBtn, {
              [styles.recording]: isRecording
            })}
            onClick={handleToggleRecord}
          >
            {isRecording ? '🔴' : '🎤'}
          </Button>
          <View className={styles.voiceInfo}>
            <Text className={styles.voiceStatus}>
              {isRecording ? '正在录音...' : hasVoice ? '已录制语音' : '点击录制语音描述'}
            </Text>
            <Text className={styles.voiceTime}>
              {isRecording
                ? formatRecordTime(recordTime)
                : hasVoice
                ? '时长 00:30'
                : '最长可录制60秒'}
            </Text>
            {isRecording && (
              <View className={styles.waveform}>
                {[...Array(10)].map((_, i) => (
                  <View key={i} className={styles.waveBar} />
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🚚</Text>
          车辆信息
        </Text>
        <View className={styles.formSection}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>车牌号</Text>
            <Input
              className={styles.formInput}
              placeholder="请输入车牌号"
              placeholderClass={styles.formPlaceholder}
              value={vehicle.plateNumber}
              onInput={(e) => handleInputChange('plateNumber', e.detail.value)}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>车型</Text>
            <Input
              className={styles.formInput}
              placeholder="请选择车型"
              placeholderClass={styles.formPlaceholder}
              value={vehicle.vehicleType}
              onInput={(e) => handleInputChange('vehicleType', e.detail.value)}
            />
            <Text className={styles.formArrow}>›</Text>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>载重</Text>
            <Input
              className={styles.formInput}
              placeholder="请输入载重"
              placeholderClass={styles.formPlaceholder}
              value={vehicle.loadWeight}
              onInput={(e) => handleInputChange('loadWeight', e.detail.value)}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>货物类型</Text>
            <Input
              className={styles.formInput}
              placeholder="请输入货物类型"
              placeholderClass={styles.formPlaceholder}
              value={vehicle.cargoType}
              onInput={(e) => handleInputChange('cargoType', e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📝</Text>
          故障描述
        </Text>
        <Textarea
          className={styles.descTextarea}
          placeholder="请简要描述故障情况..."
          placeholderClass={styles.formPlaceholder}
          value={faultDesc}
          maxlength={200}
          onInput={(e) => setFaultDesc(e.detail.value)}
        />
        <Text className={styles.descCount}>{faultDesc.length}/200</Text>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={styles.submitBtn}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          提交救援申请
        </Button>
      </View>
    </View>
  );
};

export default ReportPage;
