import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { RescueStatus } from '@/types';

interface StatusStepProps {
  currentStatus: RescueStatus;
  title?: string;
}

const steps: { key: RescueStatus; label: string; desc: string }[] = [
  { key: 'pending', label: '提交申请', desc: '救援申请已提交，等待系统派单' },
  { key: 'assigned', label: '系统派单', desc: '已为您匹配最近的救援服务点' },
  { key: 'onTheWay', label: '救援出发', desc: '救援人员已出发，正在前往您的位置' },
  { key: 'arrived', label: '到达现场', desc: '救援人员已到达，请准备相关资料' },
  { key: 'repairing', label: '维修中', desc: '正在进行故障维修，请耐心等待' },
  { key: 'completed', label: '维修完成', desc: '维修已完成，感谢您的使用' }
];

const StatusStep: React.FC<StatusStepProps> = ({ currentStatus, title = '救援进度' }) => {
  const currentIndex = steps.findIndex(s => s.key === currentStatus);

  const getStatus = (index: number): 'done' | 'active' | 'pending' => {
    if (index < currentIndex) return 'done';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <View className={styles.statusSteps}>
      {title && <Text className={styles.title}>{title}</Text>}
      <View className={styles.steps}>
        {steps.map((step, index) => {
          const status = getStatus(index);
          return (
            <View
              key={step.key}
              className={classnames(styles.step, {
                [styles.active]: status === 'active',
                [styles.done]: status === 'done'
              })}
            >
              <View className={styles.dot} />
              <View className={styles.line} />
              <View className={styles.content}>
                <Text className={styles.stepTitle}>{step.label}</Text>
                <Text className={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default StatusStep;
