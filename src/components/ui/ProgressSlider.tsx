"use client";

import { useMemo } from "react";

interface ProgressSliderProps {
  value: number; // 0-100 사이의 값
  className?: string;
  showLabel?: boolean;
  customLabel?: string; // 커스텀 라벨 (퍼센테이지 대신)
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'info';
}

/**
 * 진행율 슬라이더 컴포넌트
 * 슬라이더 위에 진행율 %가 따라 움직이는 UI
 */
export function ProgressSlider({ 
  value, 
  className = "",
  showLabel = true,
  customLabel,
  size = 'md',
  variant = 'primary'
}: ProgressSliderProps) {
  
  // 값 범위 제한 (0-100)
  const normalizedValue = useMemo(() => {
    return Math.min(100, Math.max(0, value));
  }, [value]);

  // 크기별 스타일
  const sizeClasses = {
    sm: {
      track: "h-1",
      thumb: "w-3 h-3",
      label: "text-xs -top-6"
    },
    md: {
      track: "h-2", 
      thumb: "w-4 h-4",
      label: "text-sm -top-8"
    },
    lg: {
      track: "h-3",
      thumb: "w-5 h-5", 
      label: "text-base -top-10"
    }
  };

  // 색상별 스타일
  const variantClasses = {
    primary: {
      fill: "bg-interactive-primary",
      thumb: "bg-white border-white"
    },
    success: {
      fill: "bg-feedback-success",
      thumb: "bg-white border-white"
    },
    warning: {
      fill: "bg-feedback-warning", 
      thumb: "bg-white border-white"
    },
    info: {
      fill: "bg-feedback-info",
      thumb: "bg-white border-white"
    }
  };

  const sizeStyle = sizeClasses[size];
  const variantStyle = variantClasses[variant];

  return (
    <div className={`progress-slider relative mx-auto ${className}`} style={{ width: '45%', minWidth: '200px', maxWidth: '300px' }}>
      {/* 슬라이더 트랙 */}
      <div className={`slider-track relative w-full ${sizeStyle.track} bg-border rounded-full`}>
        {/* 진행 바 */}
        <div 
          className={`slider-fill ${sizeStyle.track} ${variantStyle.fill} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      
      {/* 슬라이더 썸 (동그란 핸들) - 트랙 위에 별도 레이어 */}
      <div 
        className={`slider-thumb absolute top-1/2 ${sizeStyle.thumb} ${variantStyle.thumb} border-2 rounded-full shadow-lg transition-all duration-300 ease-out z-10`}
        style={{ 
          left: `${normalizedValue}%`,
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* 진행율 라벨 (썸과 중앙정렬) */}
      {showLabel && (
        <div 
          className={`progress-label absolute ${sizeStyle.label} font-mono font-bold text-text-primary bg-surface px-3 py-2 rounded shadow-md border border-border transition-all duration-300 ease-out z-20`}
          style={{ 
            left: `${normalizedValue}%`,
            transform: 'translateX(-50%)',
            top: '-48px'
          }}
        >
          {customLabel || `${Math.round(normalizedValue)}%`}
        </div>
      )}
    </div>
  );
}

/**
 * 시간 기반 진행율 슬라이더
 */
interface TimeProgressSliderProps extends Omit<ProgressSliderProps, 'value'> {
  elapsed: number;
  total: number;
  showTime?: boolean;
}

export function TimeProgressSlider({ 
  elapsed, 
  total, 
  showTime = false,
  ...props 
}: TimeProgressSliderProps) {
  const progress = total > 0 ? (elapsed / total) * 100 : 0;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 남은 시간 계산
  const remainingTime = Math.max(0, total - elapsed);

  return (
    <div className="space-y-2">
      <ProgressSlider 
        value={progress} 
        {...props} 
        showLabel={true}
        customLabel={formatTime(remainingTime)}
      />
      {showTime && (
        <div className="flex justify-between text-xs text-text-secondary">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(total)}</span>
        </div>
      )}
    </div>
  );
}

/**
 * 단어 기반 진행율 슬라이더  
 */
interface WordProgressSliderProps extends Omit<ProgressSliderProps, 'value'> {
  currentWords: number;
  totalWords: number;
  showCount?: boolean;
  elapsedTime?: number; // 경과 시간 (초)
}

export function WordProgressSlider({ 
  currentWords, 
  totalWords, 
  showCount = false,
  elapsedTime = 0,
  ...props 
}: WordProgressSliderProps) {
  const progress = totalWords > 0 ? (currentWords / totalWords) * 100 : 0;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <ProgressSlider 
        value={progress} 
        {...props} 
        showLabel={true}
        customLabel={formatTime(elapsedTime)}
      />
      {showCount && (
        <div className="flex justify-between text-xs text-text-secondary">
          <span>{currentWords} 단어</span>
          <span>{totalWords} 단어</span>
        </div>
      )}
    </div>
  );
}