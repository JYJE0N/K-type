"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Info, AlertTriangle } from "lucide-react";

interface LanguageMismatchAlertProps {
  show: boolean;
  message: string;
  severity: 'info' | 'warning' | 'error';
  onDismiss?: () => void;
  autoHideDelay?: number; // 자동 숨김 시간 (ms)
}

export function LanguageMismatchAlert({
  show,
  message,
  severity,
  onDismiss,
  autoHideDelay = 3000
}: LanguageMismatchAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  // 표시/숨김 애니메이션 관리
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // 자동 숨김 타이머
      if (autoHideDelay > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [show, autoHideDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300); // 애니메이션 완료 대기
  };

  if (!show) return null;

  // 심각도별 스타일
  const getSeverityStyle = () => {
    switch (severity) {
      case 'error':
        return {
          bgColor: 'var(--color-feedback-error)',
          textColor: 'white',
          borderColor: 'var(--color-feedback-error)',
          icon: AlertCircle
        };
      case 'warning':
        return {
          bgColor: 'var(--color-feedback-warning)',
          textColor: 'var(--color-text-primary)',
          borderColor: 'var(--color-feedback-warning)',
          icon: AlertTriangle
        };
      default: // info
        return {
          bgColor: 'var(--color-feedback-info)',
          textColor: 'white',
          borderColor: 'var(--color-feedback-info)',
          icon: Info
        };
    }
  };

  const style = getSeverityStyle();
  const IconComponent = style.icon;

  return (
    <div 
      className={`language-mismatch-alert fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      style={{
        maxWidth: '90vw',
        width: 'fit-content',
        minWidth: '300px'
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-2"
        style={{
          backgroundColor: style.bgColor,
          color: style.textColor,
          borderColor: style.borderColor,
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* 아이콘 */}
        <IconComponent 
          className="flex-shrink-0" 
          size={20}
          style={{ color: style.textColor }}
        />
        
        {/* 메시지 */}
        <div className="flex-1 text-sm font-medium leading-tight">
          {message}
        </div>
        
        {/* 닫기 버튼 */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-full hover:opacity-70 transition-opacity"
          style={{ color: style.textColor }}
          aria-label="알림 닫기"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {/* 진행률 바 (자동 숨김 시각화) */}
      {autoHideDelay > 0 && (
        <div 
          className="h-1 rounded-b-lg overflow-hidden"
          style={{ backgroundColor: `${style.bgColor}20` }}
        >
          <div
            className="h-full transition-all ease-linear"
            style={{
              backgroundColor: style.bgColor,
              width: isVisible ? '0%' : '100%',
              transitionDuration: `${autoHideDelay}ms`
            }}
          />
        </div>
      )}
    </div>
  );
}

// 언어 전환 힌트 컴포넌트
interface LanguageSwitchHintProps {
  targetLanguage: 'korean' | 'english';
  show: boolean;
  className?: string;
}

export function LanguageSwitchHint({ 
  targetLanguage, 
  show, 
  className = "" 
}: LanguageSwitchHintProps) {
  if (!show) return null;

  const getHintText = () => {
    if (targetLanguage === 'korean') {
      return (
        <>
          <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs">한/영</kbd>
          키를 눌러 한글 모드로 전환하세요
        </>
      );
    } else {
      return (
        <>
          <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs">한/영</kbd>
          키를 눌러 영문 모드로 전환하세요
        </>
      );
    }
  };

  return (
    <div className={`language-switch-hint flex items-center gap-2 text-sm text-text-secondary ${className}`}>
      <Info size={16} className="text-feedback-info" />
      {getHintText()}
    </div>
  );
}