"use client";

import React, { useState, useEffect, useRef, memo } from 'react';
import { useDeviceInfo, OSType } from '@/utils/mobileDetection';
import { useVirtualKeyboardHeight } from './TouchKeyboard';

/**
 * 반응형 레이아웃 관리 컴포넌트
 */

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 브레이크포인트 정의
 */
export const BREAKPOINTS = {
  xs: 0,     // 0px+
  sm: 640,   // 640px+
  md: 768,   // 768px+
  lg: 1024,  // 1024px+
  xl: 1280,  // 1280px+
  xxl: 1536, // 1536px+
} as const;

/**
 * 뷰포트 크기 타입
 */
export type ViewportSize = keyof typeof BREAKPOINTS;

/**
 * 반응형 메인 레이아웃
 */
export const ResponsiveLayout = memo<ResponsiveLayoutProps>(({
  children,
  className = ''
}) => {
  const deviceInfo = useDeviceInfo();
  const { keyboardHeight, isKeyboardVisible } = useVirtualKeyboardHeight();
  const [viewportSize, setViewportSize] = useState<ViewportSize>('md');
  const [isLandscape, setIsLandscape] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);

  // 뷰포트 크기 계산
  const calculateViewportSize = (width: number): ViewportSize => {
    if (width >= BREAKPOINTS.xxl) return 'xxl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  };

  // 리사이즈 이벤트 핸들러
  useEffect(() => {
    const handleResize = () => {
      const newSize = calculateViewportSize(window.innerWidth);
      const newOrientation = window.innerWidth > window.innerHeight;
      
      setViewportSize(newSize);
      setIsLandscape(newOrientation);
    };

    // 초기 설정
    handleResize();

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Intersection Observer로 뷰포트 변화 감지 (더 정확한 감지)
    if (layoutRef.current) {
      const observer = new ResizeObserver(handleResize);
      observer.observe(layoutRef.current);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        observer.disconnect();
      };
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // 레이아웃 클래스 생성
  const getLayoutClasses = () => {
    const classes = ['responsive-layout', 'min-h-screen', 'flex', 'flex-col'];
    
    // 디바이스별 클래스
    if (deviceInfo?.type === 'mobile') {
      classes.push('mobile-layout');
    } else if (deviceInfo?.type === 'tablet') {
      classes.push('tablet-layout');
    } else {
      classes.push('desktop-layout');
    }
    
    // 뷰포트 크기별 클래스
    classes.push(`viewport-${viewportSize}`);
    
    // 방향별 클래스
    classes.push(isLandscape ? 'landscape' : 'portrait');
    
    // 키보드 상태별 클래스
    if (isKeyboardVisible) {
      classes.push('keyboard-visible');
    }
    
    // 터치 디바이스 클래스
    if (deviceInfo?.isTouchDevice) {
      classes.push('touch-device');
    }
    
    return classes.join(' ');
  };

  // 스타일 계산
  const getLayoutStyles = () => {
    const styles: React.CSSProperties = {};
    
    // 키보드가 보일 때 하단 여백 조정
    if (isKeyboardVisible && keyboardHeight > 0) {
      styles.paddingBottom = `${keyboardHeight}px`;
      styles.transition = 'padding-bottom 0.3s ease-in-out';
    }
    
    // 안전 영역 고려 (iOS 노치 등)
    if (deviceInfo?.os === OSType.IOS) {
      styles.paddingTop = 'env(safe-area-inset-top)';
      styles.paddingLeft = 'env(safe-area-inset-left)';
      styles.paddingRight = 'env(safe-area-inset-right)';
    }
    
    return styles;
  };

  return (
    <div
      ref={layoutRef}
      className={`${getLayoutClasses()} ${className}`}
      style={getLayoutStyles()}
      data-device-type={deviceInfo?.type}
      data-viewport-size={viewportSize}
      data-orientation={isLandscape ? 'landscape' : 'portrait'}
      data-keyboard-visible={isKeyboardVisible}
    >
      {children}
    </div>
  );
});

ResponsiveLayout.displayName = 'ResponsiveLayout';

/**
 * 반응형 컨테이너 컴포넌트
 */
interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: ViewportSize | 'full';
  padding?: boolean;
  className?: string;
}

export const ResponsiveContainer = memo<ResponsiveContainerProps>(({
  children,
  maxWidth = 'xl',
  padding = true,
  className = ''
}) => {
  const getContainerClasses = () => {
    const classes = ['responsive-container', 'mx-auto', 'w-full'];
    
    // 최대 너비 설정
    if (maxWidth !== 'full') {
      const maxWidthMap = {
        xs: 'max-w-none',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        xxl: 'max-w-2xl'
      };
      classes.push(maxWidthMap[maxWidth]);
    }
    
    // 패딩 설정
    if (padding) {
      classes.push('px-4', 'sm:px-6', 'lg:px-8');
    }
    
    return classes.join(' ');
  };

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {children}
    </div>
  );
});

ResponsiveContainer.displayName = 'ResponsiveContainer';

/**
 * 반응형 그리드 컴포넌트
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  gap?: number | string;
  className?: string;
}

export const ResponsiveGrid = memo<ResponsiveGridProps>(({
  children,
  cols = { xs: 1, sm: 2, lg: 3 },
  gap = 4,
  className = ''
}) => {
  const getGridClasses = () => {
    const classes = ['responsive-grid', 'grid'];
    
    // 컬럼 수 설정
    Object.entries(cols).forEach(([breakpoint, colCount]) => {
      if (colCount) {
        const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
        classes.push(`${prefix}grid-cols-${colCount}`);
      }
    });
    
    // 간격 설정
    classes.push(`gap-${gap}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {children}
    </div>
  );
});

ResponsiveGrid.displayName = 'ResponsiveGrid';

/**
 * 반응형 스택 컴포넌트 (수직 배치)
 */
interface ResponsiveStackProps {
  children: React.ReactNode;
  spacing?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

export const ResponsiveStack = memo<ResponsiveStackProps>(({
  children,
  spacing = 4,
  align = 'stretch',
  className = ''
}) => {
  const getStackClasses = () => {
    const classes = ['responsive-stack', 'flex', 'flex-col'];
    
    // 정렬 설정
    const alignMap = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    };
    classes.push(alignMap[align]);
    
    // 간격 설정
    classes.push(`space-y-${spacing}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getStackClasses()} ${className}`}>
      {children}
    </div>
  );
});

ResponsiveStack.displayName = 'ResponsiveStack';

/**
 * 미디어 쿼리 Hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

/**
 * 반응형 값 Hook
 */
export function useResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  xxl?: T;
}): T | undefined {
  const isXS = useMediaQuery('(max-width: 639px)');
  const isSM = useMediaQuery('(min-width: 640px) and (max-width: 767px)');
  const isMD = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isLG = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const isXL = useMediaQuery('(min-width: 1280px) and (max-width: 1535px)');
  const isXXL = useMediaQuery('(min-width: 1536px)');

  if (isXXL && values.xxl !== undefined) return values.xxl;
  if (isXL && values.xl !== undefined) return values.xl;
  if (isLG && values.lg !== undefined) return values.lg;
  if (isMD && values.md !== undefined) return values.md;
  if (isSM && values.sm !== undefined) return values.sm;
  if (isXS && values.xs !== undefined) return values.xs;

  // 폴백 값 찾기 (가장 작은 정의된 값)
  return values.xs || values.sm || values.md || values.lg || values.xl || values.xxl;
}

/**
 * 뷰포트 정보 Hook
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    size: 'md' as ViewportSize,
    isLandscape: false
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        size: calculateViewportSize(width),
        isLandscape: width > height
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
}

// 유틸리티 함수 내보내기
function calculateViewportSize(width: number): ViewportSize {
  if (width >= BREAKPOINTS.xxl) return 'xxl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}