"use client";

import { Clock, Hash, Zap, Trophy } from 'lucide-react';

interface InsightsSectionProps {
  className?: string;
  totalPracticeTime: number;
  averageSpeed: number;
  totalKeystrokes: number;
  ranking: number;
  mounted: boolean;
}

export function InsightsSection({
  className = '',
  totalPracticeTime,
  averageSpeed,
  totalKeystrokes,
  ranking,
  mounted
}: InsightsSectionProps) {
  // 시간을 분:초 형태로 변환
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    } else if (mins > 0) {
      return `${mins}분 ${secs}초`;
    } else {
      return `${secs}초`;
    }
  };

  // 키스트로크 수를 K 단위로 포맷
  const formatKeystrokes = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const insights = [
    {
      icon: Clock,
      label: '총 연습시간',
      value: mounted ? formatTime(totalPracticeTime) : '0초',
      description: '꾸준한 연습이 실력 향상의 열쇠입니다'
    },
    {
      icon: Zap,
      label: '평균 타수',
      value: mounted ? `${averageSpeed}` : '0',
      unit: 'CPM',
      description: '일관성 있는 속도를 유지하고 있습니다'
    },
    {
      icon: Hash,
      label: '총 타수',
      value: mounted ? formatKeystrokes(totalKeystrokes) : '0',
      description: '매 키스트로크가 발전의 한 걸음입니다'
    },
    {
      icon: Trophy,
      label: '상위 순위',
      value: mounted ? `${ranking}` : '0',
      unit: '%',
      description: '다른 사용자들과 비교한 당신의 위치입니다'
    }
  ];

  return (
    <div className={`stats-card ${className}`}>
      <h3 className="stats-subtitle mb-6">인사이트 & 통계</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          
          return (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <IconComponent 
                  className="w-6 h-6" 
                  style={{ color: 'var(--color-interactive-primary)' }} 
                />
              </div>
              
              <div className="stats-metric-medium mb-1">
                {insight.value}
                {insight.unit && (
                  <span className="stats-metric-unit ml-1">
                    {insight.unit}
                  </span>
                )}
              </div>
              
              <div className="stats-description mb-2">
                {insight.label}
              </div>
              
              <div className="stats-caption">
                {insight.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}