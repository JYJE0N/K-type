"use client";

import React, { memo } from 'react';
import { TextRenderer } from './TextRenderer';
import { StatsCalculator } from './StatsCalculator';
import { InputHandler } from './InputHandler';
import { TypingVisualizer } from './TypingVisualizer';
import { GhostIndicator } from './GhostIndicator';
import { VirtualKeyboard } from './VirtualKeyboard';

/**
 * 최적화된 컴포넌트 모음
 * React.memo를 사용하여 불필요한 리렌더링 방지
 */

// TextRenderer 최적화 - props가 변경될 때만 리렌더링
export const MemoizedTextRenderer = memo(TextRenderer, (prevProps, nextProps) => {
  return (
    prevProps.text === nextProps.text &&
    prevProps.currentIndex === nextProps.currentIndex &&
    prevProps.userInput === nextProps.userInput &&
    JSON.stringify(prevProps.mistakes) === JSON.stringify(nextProps.mistakes)
  );
});

// StatsCalculator 최적화 - 통계가 변경될 때만 리렌더링
export const MemoizedStatsCalculator = memo(StatsCalculator, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.isPaused === nextProps.isPaused &&
    prevProps.isCompleted === nextProps.isCompleted
  );
});

// InputHandler 최적화 - 핸들러 함수가 변경될 때만 리렌더링
export const MemoizedInputHandler = memo(InputHandler, (prevProps, nextProps) => {
  return (
    prevProps.disabled === nextProps.disabled &&
    prevProps.onKeyPress === nextProps.onKeyPress &&
    prevProps.onBackspace === nextProps.onBackspace &&
    prevProps.onTestStart === nextProps.onTestStart &&
    prevProps.onCompositionChange === nextProps.onCompositionChange
  );
});

// TypingVisualizer 최적화
export const MemoizedTypingVisualizer = memo(TypingVisualizer, (prevProps, nextProps) => {
  return (
    prevProps.text === nextProps.text &&
    prevProps.currentIndex === nextProps.currentIndex
  );
});

// GhostIndicator 최적화 - 클래스명이 변경될 때만 리렌더링
export const MemoizedGhostIndicator = memo(GhostIndicator, (prevProps, nextProps) => {
  return prevProps.className === nextProps.className;
});

// VirtualKeyboard 최적화
export const MemoizedVirtualKeyboard = memo(VirtualKeyboard, (prevProps, nextProps) => {
  return (
    prevProps.currentChar === nextProps.currentChar &&
    prevProps.language === nextProps.language &&
    prevProps.isActive === nextProps.isActive
  );
});

// 재사용 가능한 버튼 컴포넌트
interface ButtonProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const MemoizedButton = memo<ButtonProps>(({
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  className = '',
  icon
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim()}
    >
      {icon && <span className="inline-flex items-center gap-2">{icon}</span>}
      {children}
    </button>
  );
});

MemoizedButton.displayName = 'MemoizedButton';

// 재사용 가능한 카드 컴포넌트
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const MemoizedCard = memo<CardProps>(({
  title,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-background-secondary rounded-xl p-6 border border-text-tertiary border-opacity-20 ${className}`.trim()}>
      {title && (
        <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
});

MemoizedCard.displayName = 'MemoizedCard';

// 재사용 가능한 토글 스위치 컴포넌트
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  disabled?: boolean;
}

export const MemoizedToggleSwitch = memo<ToggleSwitchProps>(({
  checked,
  onChange,
  label,
  icon,
  color = 'bg-interactive-primary',
  disabled = false
}) => {
  return (
    <label className={`flex items-center justify-between p-2 rounded-md hover:bg-background-elevated transition-colors cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-text-primary">{label}</span>
      </div>
      <div 
        className={`
          relative inline-flex w-10 h-5 items-center rounded-full 
          transition-colors duration-200
          ${checked ? color : 'bg-text-tertiary bg-opacity-30'}
        `}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          aria-label={label}
        />
        <span
          className={`
            inline-block w-3 h-3 bg-white rounded-full 
            transform transition-transform duration-200
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </div>
    </label>
  );
});

MemoizedToggleSwitch.displayName = 'MemoizedToggleSwitch';

// 재사용 가능한 진행률 바 컴포넌트
interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  className?: string;
}

export const MemoizedProgressBar = memo<ProgressBarProps>(({
  value,
  max,
  label,
  showPercentage = false,
  color = 'bg-interactive-primary',
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={`w-full ${className}`.trim()}>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-2">
          {label && <span className="text-sm text-text-secondary">{label}</span>}
          {showPercentage && <span className="text-sm text-text-primary">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full bg-background-elevated rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
});

MemoizedProgressBar.displayName = 'MemoizedProgressBar';