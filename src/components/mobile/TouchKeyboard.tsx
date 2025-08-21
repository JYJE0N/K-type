"use client";

import React, { useState, useEffect, useRef, memo } from 'react';
import { useDeviceInfo } from '@/utils/mobileDetection';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * 모바일용 터치 키보드 인터페이스
 */

interface TouchKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  currentChar?: string;
  language: 'korean' | 'english';
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * 키보드 레이아웃 정의
 */
const KEYBOARD_LAYOUTS = {
  korean: [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'],
  ],
  english: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ]
};

const SPECIAL_KEYS = [' ', '.', ',', '?', '!', ':', ';'];

/**
 * 터치 키보드 컴포넌트
 */
export const TouchKeyboard = memo<TouchKeyboardProps>(({
  onKeyPress,
  onBackspace,
  currentChar = '',
  language,
  disabled = false,
  compact = false,
  className = ''
}) => {
  const [isShift, setIsShift] = useState(false);
  const [pressedKey, setPressedKey] = useState<string>('');
  const [showSpecialKeys, setShowSpecialKeys] = useState(false);
  const touchStartTime = useRef<number>(0);
  const deviceInfo = useDeviceInfo();
  
  const keyboardLayout = KEYBOARD_LAYOUTS[language] || KEYBOARD_LAYOUTS.english;

  // 햅틱 피드백
  const hapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const durations = {
        light: 10,
        medium: 20,
        heavy: 50
      };
      navigator.vibrate(durations[intensity]);
    }
  };

  // 키 터치 이벤트 핸들러
  const handleKeyTouch = (key: string) => {
    if (disabled) return;
    
    hapticFeedback('light');
    setPressedKey(key);
    
    // 시프트 상태에 따른 키 처리
    let processedKey = key;
    if (isShift && language === 'english') {
      processedKey = key.toUpperCase();
    }
    
    onKeyPress(processedKey);
    
    // 시프트는 한 번 사용 후 해제 (Sticky Shift)
    if (isShift && key !== 'shift') {
      setIsShift(false);
    }
    
    // 키 하이라이트 해제
    setTimeout(() => setPressedKey(''), 150);
  };

  // 백스페이스 처리
  const handleBackspace = () => {
    if (disabled) return;
    
    hapticFeedback('medium');
    onBackspace();
  };

  // 시프트 토글
  const handleShift = () => {
    if (disabled) return;
    
    hapticFeedback('light');
    setIsShift(!isShift);
  };

  // 스페이스바 처리
  const handleSpace = () => {
    if (disabled) return;
    
    hapticFeedback('light');
    onKeyPress(' ');
  };

  // 롱 프레스 감지
  const handleTouchStart = (key: string) => {
    touchStartTime.current = Date.now();
    setPressedKey(key);
  };

  const handleTouchEnd = (key: string) => {
    const touchDuration = Date.now() - touchStartTime.current;
    setPressedKey('');
    
    // 롱 프레스 (500ms 이상)인 경우 특수 동작
    if (touchDuration >= 500) {
      if (key === 'backspace') {
        // 롱 프레스 백스페이스: 단어 전체 삭제
        hapticFeedback('heavy');
        // TODO: 단어 전체 삭제 구현
      } else if (key === ' ') {
        // 롱 프레스 스페이스: 특수 문자 패널 열기
        setShowSpecialKeys(!showSpecialKeys);
      }
    } else {
      // 일반 터치
      if (key === 'backspace') {
        handleBackspace();
      } else if (key === 'shift') {
        handleShift();
      } else if (key === ' ') {
        handleSpace();
      } else {
        handleKeyTouch(key);
      }
    }
  };

  // 키 스타일 계산
  const getKeyStyle = (key: string) => {
    const isPressed = pressedKey === key;
    const isActive = currentChar === key || (currentChar === ' ' && key === 'space');
    const isSpecial = ['shift', 'backspace', 'space'].includes(key);
    
    let baseClass = `
      flex items-center justify-center
      font-semibold text-lg
      border border-text-tertiary border-opacity-30
      rounded-lg
      transition-all duration-100
      select-none
      touch-manipulation
      active:scale-95
    `;
    
    // 크기 조절
    if (compact) {
      baseClass += ' min-h-[40px] text-base';
    } else {
      baseClass += ' min-h-[48px]';
    }
    
    // 상태별 스타일
    if (isPressed) {
      baseClass += ' bg-interactive-primary text-text-inverse scale-95';
    } else if (isActive) {
      baseClass += ' bg-interactive-primary bg-opacity-20 text-interactive-primary border-interactive-primary';
    } else if (isSpecial) {
      if (key === 'shift' && isShift) {
        baseClass += ' bg-accent-primary text-text-inverse border-accent-primary';
      } else {
        baseClass += ' bg-background-elevated text-text-primary hover:bg-background-secondary';
      }
    } else {
      baseClass += ' bg-background-secondary text-text-primary hover:bg-background-elevated';
    }
    
    // 비활성화 상태
    if (disabled) {
      baseClass += ' opacity-50 pointer-events-none';
    }
    
    return baseClass;
  };

  // 키보드가 필요한 환경인지 확인
  const shouldShowKeyboard = deviceInfo?.isTouchDevice && (deviceInfo?.type === 'mobile' || deviceInfo?.type === 'tablet');

  if (!shouldShowKeyboard) {
    return null;
  }

  return (
    <div className={`touch-keyboard w-full max-w-2xl mx-auto ${className}`}>
      {/* 메인 키보드 */}
      <div className="space-y-2 p-4 bg-background-primary rounded-xl border border-text-tertiary border-opacity-20">
        {/* 키 행들 */}
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {/* 첫 번째 행에만 백스페이스 추가 */}
            {rowIndex === 0 && (
              <button
                className={`${getKeyStyle('backspace')} px-4`}
                onTouchStart={() => handleTouchStart('backspace')}
                onTouchEnd={() => handleTouchEnd('backspace')}
                onMouseDown={() => handleTouchStart('backspace')}
                onMouseUp={() => handleTouchEnd('backspace')}
                disabled={disabled}
                aria-label="백스페이스"
              >
                ⌫
              </button>
            )}
            
            {row.map((key) => (
              <button
                key={key}
                className={`${getKeyStyle(key)} flex-1 max-w-[48px]`}
                onTouchStart={() => handleTouchStart(key)}
                onTouchEnd={() => handleTouchEnd(key)}
                onMouseDown={() => handleTouchStart(key)}
                onMouseUp={() => handleTouchEnd(key)}
                disabled={disabled}
                aria-label={key}
              >
                {isShift && language === 'english' ? key.toUpperCase() : key}
              </button>
            ))}
          </div>
        ))}
        
        {/* 하단 특수 키 행 */}
        <div className="flex justify-center gap-1 mt-3">
          {/* 시프트 키 (영어 모드에만) */}
          {language === 'english' && (
            <button
              className={`${getKeyStyle('shift')} px-4`}
              onTouchStart={() => handleTouchStart('shift')}
              onTouchEnd={() => handleTouchEnd('shift')}
              disabled={disabled}
              aria-label={`시프트 ${isShift ? '활성' : '비활성'}`}
            >
              ⇧
            </button>
          )}
          
          {/* 특수 문자 토글 */}
          <button
            className={`${getKeyStyle('special')} px-3`}
            onClick={() => setShowSpecialKeys(!showSpecialKeys)}
            disabled={disabled}
            aria-label="특수 문자"
          >
            !@#
          </button>
          
          {/* 스페이스바 */}
          <button
            className={`${getKeyStyle('space')} flex-1 mx-2`}
            onTouchStart={() => handleTouchStart(' ')}
            onTouchEnd={() => handleTouchEnd(' ')}
            onMouseDown={() => handleTouchStart(' ')}
            onMouseUp={() => handleTouchEnd(' ')}
            disabled={disabled}
            aria-label="스페이스"
          >
            스페이스
          </button>
          
          {/* 엔터 키 */}
          <button
            className={`${getKeyStyle('enter')} px-4`}
            onClick={() => onKeyPress('\n')}
            disabled={disabled}
            aria-label="엔터"
          >
            ↵
          </button>
        </div>
        
        {/* 특수 문자 패널 */}
        {showSpecialKeys && (
          <div className="flex flex-wrap justify-center gap-1 mt-3 pt-3 border-t border-text-tertiary border-opacity-20">
            {SPECIAL_KEYS.map((key) => (
              <button
                key={key}
                className={`${getKeyStyle(key)} w-12 h-10`}
                onClick={() => handleKeyTouch(key)}
                disabled={disabled}
                aria-label={key === ' ' ? '스페이스' : key}
              >
                {key === ' ' ? '␣' : key}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 키보드 힌트 */}
      {!compact && (
        <div className="text-center mt-2 text-sm text-text-tertiary">
          <p>길게 누르면 추가 기능을 사용할 수 있습니다</p>
        </div>
      )}
    </div>
  );
});

TouchKeyboard.displayName = 'TouchKeyboard';

/**
 * 키보드 높이 조절을 위한 Hook
 */
export function useVirtualKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      const viewport = window.visualViewport;
      if (viewport) {
        const heightDiff = window.innerHeight - viewport.height;
        const threshold = 150; // 키보드로 간주할 최소 높이
        
        if (heightDiff > threshold) {
          setKeyboardHeight(heightDiff);
          setIsKeyboardVisible(true);
        } else {
          setKeyboardHeight(0);
          setIsKeyboardVisible(false);
        }
      }
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
      };
    }
  }, []);
  
  return { keyboardHeight, isKeyboardVisible };
}