"use client";

import React, { useEffect, useRef, useState, memo, useCallback } from 'react';
import { TouchKeyboard, useVirtualKeyboardHeight } from './TouchKeyboard';
import { ResponsiveLayout, ResponsiveContainer, useMediaQuery } from './ResponsiveLayout';
import { useAdaptiveUI, UIMode } from '@/utils/adaptiveUI';
import { useGestures, GestureType } from '@/utils/touchGestures';
import { useDeviceInfo } from '@/utils/mobileDetection';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTypingStore } from '@/stores/typingStore';
import { TextRenderer } from '../core/TextRenderer';
import { StatsCalculator } from '../core/StatsCalculator';
import { ChevronUp, ChevronDown, Settings, Maximize2, Minimize2 } from 'lucide-react';

/**
 * 모바일 전용 타이핑 인터페이스
 */

interface MobileTypingInterfaceProps {
  className?: string;
}

export const MobileTypingInterface = memo<MobileTypingInterfaceProps>(({
  className = ''
}) => {
  const deviceInfo = useDeviceInfo();
  const adaptiveUI = useAdaptiveUI();
  const { keyboardHeight, isKeyboardVisible } = useVirtualKeyboardHeight();
  
  // 상태 관리
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [gestureMode, setGestureMode] = useState<'typing' | 'navigation'>('typing');
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLDivElement>(null);
  
  // 스토어 상태
  const { language, typingEffectsEnabled } = useSettingsStore();
  const { 
    targetText, 
    currentIndex, 
    userInput, 
    mistakes, 
    isActive,
    isPaused,
    isCompleted 
  } = useTypingStore();
  
  // 제스처 설정
  const gestures = useGestures(containerRef as React.RefObject<HTMLElement>, {
    swipeMinDistance: 100,
    longPressTimeout: 600,
  });

  // 반응형 체크
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isLandscape = useMediaQuery('(orientation: landscape)');

  // 적응형 UI 정보
  const shouldShowVirtualKeyboard = adaptiveUI?.shouldShowVirtualKeyboard ?? true;
  const hasPhysicalKeyboard = adaptiveUI?.hasPhysicalKeyboard ?? false;
  const uiMode = adaptiveUI?.uiMode ?? UIMode.MOBILE;

  /**
   * 제스처 이벤트 핸들러 설정
   */
  useEffect(() => {
    if (!gestures) return;

    // 스와이프 제스처
    gestures.on(GestureType.SWIPE_UP, () => {
      if (gestureMode === 'navigation') {
        setShowStats(true);
      } else {
        setShowVirtualKeyboard(false);
      }
    });

    gestures.on(GestureType.SWIPE_DOWN, () => {
      if (gestureMode === 'navigation') {
        setShowStats(false);
      } else {
        setShowVirtualKeyboard(true);
      }
    });

    gestures.on(GestureType.SWIPE_LEFT, () => {
      if (gestureMode === 'navigation') {
        // 이전 텍스트로 이동 (구현 필요)
      }
    });

    gestures.on(GestureType.SWIPE_RIGHT, () => {
      if (gestureMode === 'navigation') {
        // 다음 텍스트로 이동 (구현 필요)
      }
    });

    // 더블탭으로 모드 전환
    gestures.on(GestureType.DOUBLE_TAP, () => {
      setGestureMode(prev => prev === 'typing' ? 'navigation' : 'typing');
    });

    // 롱프레스로 풀스크린 토글
    gestures.on(GestureType.LONG_PRESS, () => {
      handleFullscreenToggle();
    });

    // 핀치로 폰트 크기 조절
    gestures.on(GestureType.PINCH_IN, (event) => {
      if (event.scale && event.scale < 0.8) {
        const currentSize = useSettingsStore.getState().fontSize;
        useSettingsStore.getState().setFontSize(Math.max(12, currentSize - 2));
      }
    });

    gestures.on(GestureType.PINCH_OUT, (event) => {
      if (event.scale && event.scale > 1.2) {
        const currentSize = useSettingsStore.getState().fontSize;
        useSettingsStore.getState().setFontSize(Math.min(32, currentSize + 2));
      }
    });

  }, [gestures, gestureMode]);

  /**
   * 키 입력 핸들러
   */
  const handleKeyPress = useCallback((key: string) => {
    const { handleKeyPress } = useTypingStore.getState();
    handleKeyPress(key);
    
    // 햅틱 피드백
    if ('vibrate' in navigator && typingEffectsEnabled) {
      navigator.vibrate(10);
    }
  }, [typingEffectsEnabled]);

  const handleBackspace = useCallback(() => {
    const { handleBackspace } = useTypingStore.getState();
    handleBackspace();
    
    // 햅틱 피드백
    if ('vibrate' in navigator && typingEffectsEnabled) {
      navigator.vibrate(15);
    }
  }, [typingEffectsEnabled]);

  /**
   * 풀스크린 토글
   */
  const handleFullscreenToggle = useCallback(async () => {
    try {
      if (!isFullscreen && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else if (isFullscreen && document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [isFullscreen]);

  /**
   * 자동 스크롤 처리
   */
  useEffect(() => {
    if (textAreaRef.current && currentIndex > 0) {
      // 현재 타이핑 위치가 뷰포트 중앙에 오도록 스크롤
      const textElement = textAreaRef.current.querySelector(`[data-char-index="${currentIndex}"]`) as HTMLElement;
      if (textElement) {
        textElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [currentIndex]);

  /**
   * 키보드 높이에 따른 레이아웃 조정
   */
  const getLayoutStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    
    // 가상 키보드가 표시될 때 컨텐츠 영역 조정
    if (isKeyboardVisible && keyboardHeight > 0) {
      styles.paddingBottom = `${keyboardHeight}px`;
      styles.transition = 'padding-bottom 0.3s ease-in-out';
    }
    
    // 풀스크린 모드 스타일
    if (isFullscreen) {
      styles.position = 'fixed';
      styles.top = 0;
      styles.left = 0;
      styles.right = 0;
      styles.bottom = 0;
      styles.zIndex = 9999;
      styles.backgroundColor = 'var(--color-background-primary)';
    }
    
    return styles;
  };

  /**
   * 모바일이 아닌 경우 렌더링하지 않음
   */
  if (!isMobile || !deviceInfo?.isTouchDevice) {
    return null;
  }

  return (
    <ResponsiveLayout className={className}>
      <div
        ref={containerRef}
        className={`mobile-typing-interface flex flex-col min-h-screen ${gestureMode === 'navigation' ? 'navigation-mode' : 'typing-mode'}`}
        style={getLayoutStyles()}
        data-ui-mode={uiMode}
        data-gesture-mode={gestureMode}
        data-fullscreen={isFullscreen}
      >
        {/* 상단 헤더 */}
        <header className="flex items-center justify-between p-4 bg-background-secondary border-b border-text-tertiary border-opacity-20">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold text-text-primary">
              K-Type Mobile
            </div>
            {gestureMode === 'navigation' && (
              <div className="px-2 py-1 text-xs bg-accent-primary text-text-inverse rounded">
                네비게이션 모드
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* 통계 토글 */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 rounded-lg bg-background-elevated hover:bg-background-secondary"
              aria-label="통계 표시/숨김"
            >
              {showStats ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
            
            {/* 풀스크린 토글 */}
            <button
              onClick={handleFullscreenToggle}
              className="p-2 rounded-lg bg-background-elevated hover:bg-background-secondary"
              aria-label={isFullscreen ? '풀스크린 해제' : '풀스크린 모드'}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            
            {/* 설정 */}
            <button
              className="p-2 rounded-lg bg-background-elevated hover:bg-background-secondary"
              aria-label="설정"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* 통계 영역 (조건부 표시) */}
        {showStats && (
          <div className="stats-section p-4 bg-background-elevated border-b border-text-tertiary border-opacity-20">
            <StatsCalculator />
          </div>
        )}

        {/* 메인 타이핑 영역 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ResponsiveContainer className="flex-1 flex flex-col py-4">
            {/* 텍스트 렌더러 */}
            <div
              ref={textAreaRef}
              className="text-renderer-container flex-1 overflow-y-auto scroll-smooth"
              style={{
                fontSize: `${useSettingsStore.getState().fontSize}px`,
                lineHeight: 1.6,
                // 모바일 최적화된 패딩
                padding: isLandscape ? '1rem' : '1.5rem 1rem',
              }}
            >
              <TextRenderer
                text={targetText}
                currentIndex={currentIndex}
                userInput={userInput}
                mistakes={mistakes.map(m => m.position)}
                className="mobile-text-renderer"
              />
            </div>

            {/* 진행률 표시 */}
            <div className="progress-indicator mt-4 p-3 bg-background-secondary rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">진행률</span>
                <span className="text-sm font-medium text-text-primary">
                  {Math.round((currentIndex / targetText.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-background-elevated rounded-full h-2">
                <div
                  className="bg-interactive-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(currentIndex / targetText.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* 제스처 힌트 */}
            <div className="gesture-hints mt-3 p-2 bg-background-elevated rounded-lg">
              <div className="text-xs text-text-tertiary text-center">
                {gestureMode === 'typing' ? (
                  <>
                    더블탭: 네비게이션 모드 | 위로 스와이프: 키보드 숨김 | 길게 누르기: 풀스크린
                  </>
                ) : (
                  <>
                    더블탭: 타이핑 모드 | 위로 스와이프: 통계 표시 | 좌우 스와이프: 텍스트 변경
                  </>
                )}
              </div>
            </div>
          </ResponsiveContainer>
        </main>

        {/* 가상 키보드 영역 */}
        {shouldShowVirtualKeyboard && showVirtualKeyboard && !hasPhysicalKeyboard && (
          <div className="virtual-keyboard-container bg-background-primary border-t border-text-tertiary border-opacity-20">
            <TouchKeyboard
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
              currentChar={targetText[currentIndex] || ''}
              language={language as 'korean' | 'english'}
              disabled={!isActive || isPaused || isCompleted}
              compact={isLandscape}
            />
          </div>
        )}

        {/* 키보드 토글 버튼 (물리 키보드가 없고 가상 키보드가 숨겨진 경우) */}
        {shouldShowVirtualKeyboard && !showVirtualKeyboard && !hasPhysicalKeyboard && (
          <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={() => setShowVirtualKeyboard(true)}
              className="p-3 bg-interactive-primary text-text-inverse rounded-full shadow-lg hover:bg-interactive-secondary transition-colors"
              aria-label="가상 키보드 표시"
            >
              <ChevronUp size={24} />
            </button>
          </div>
        )}

        {/* 디버그 정보 (개발 모드에서만) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-4 left-4 z-50 text-xs bg-black bg-opacity-75 text-white p-2 rounded">
            <div>Mode: {uiMode}</div>
            <div>Keyboard: {keyboardHeight}px</div>
            <div>Gesture: {gestureMode}</div>
            <div>Fullscreen: {isFullscreen ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
});

MobileTypingInterface.displayName = 'MobileTypingInterface';

/**
 * 모바일 최적화된 통계 컴포넌트
 */
interface MobileStatsProps {
  compact?: boolean;
  className?: string;
}

const MobileStats = memo<MobileStatsProps>(({
  compact = false,
  className = ''
}) => {
  const { language } = useSettingsStore();
  
  return (
    <div className={`mobile-stats grid gap-3 ${compact ? 'grid-cols-4' : 'grid-cols-2'} ${className}`}>
      {/* 통계 항목들을 모바일에 최적화하여 표시 */}
      <div className="stat-item text-center p-3 bg-background-secondary rounded-lg">
        <div className="text-lg font-bold text-interactive-primary">120</div>
        <div className="text-xs text-text-secondary">CPM</div>
      </div>
      
      <div className="stat-item text-center p-3 bg-background-secondary rounded-lg">
        <div className="text-lg font-bold text-accent-primary">95%</div>
        <div className="text-xs text-text-secondary">정확도</div>
      </div>
      
      {!compact && (
        <>
          <div className="stat-item text-center p-3 bg-background-secondary rounded-lg">
            <div className="text-lg font-bold text-text-primary">24</div>
            <div className="text-xs text-text-secondary">WPM</div>
          </div>
          
          <div className="stat-item text-center p-3 bg-background-secondary rounded-lg">
            <div className="text-lg font-bold text-text-primary">85%</div>
            <div className="text-xs text-text-secondary">일관성</div>
          </div>
        </>
      )}
    </div>
  );
});

MobileStats.displayName = 'MobileStats';