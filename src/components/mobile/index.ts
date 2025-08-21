/**
 * 모바일 컴포넌트 통합 인덱스
 * 폴더블 폰, 태블릿+키보드 등 다양한 모바일 환경 지원
 */

// 핵심 모바일 컴포넌트들
export { TouchKeyboard, useVirtualKeyboardHeight } from './TouchKeyboard';
export { MobileTypingInterface } from './MobileTypingInterface';

// 반응형 레이아웃 컴포넌트들
export {
  ResponsiveLayout,
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveStack,
  useMediaQuery,
  useResponsiveValue,
  useViewport,
  BREAKPOINTS
} from './ResponsiveLayout';

// 유틸리티 및 훅들
export * from '@/utils/mobileDetection';
export * from '@/utils/adaptiveUI';
export * from '@/utils/touchGestures';
export * from '@/utils/accessibility';

// 최적화된 컴포넌트들
export {
  MemoizedTextRenderer,
  MemoizedStatsCalculator,
  MemoizedInputHandler,
  MemoizedTypingVisualizer,
  MemoizedGhostIndicator,
  MemoizedVirtualKeyboard,
  MemoizedButton,
  MemoizedCard,
  MemoizedToggleSwitch,
  MemoizedProgressBar
} from '@/components/core/OptimizedComponents';

// 타입 정의들
export type {
  DeviceInfo
} from '@/utils/mobileDetection';

export type {
  UIMode,
  FoldableState,
  KeyboardConnection
} from '@/utils/adaptiveUI';

export type {
  GestureType,
  GestureConfig
} from '@/utils/touchGestures';

/**
 * 모바일 환경 감지 및 자동 컴포넌트 선택
 */
export function getMobileComponents() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;
  
  return {
    shouldUseMobileInterface: isMobile && isTouchDevice,
    recommendedLayout: isMobile ? 'mobile' : 'desktop',
    supportedGestures: isTouchDevice ? [
      'tap', 'double_tap', 'long_press', 'swipe', 'pinch', 'rotate'
    ] : ['click', 'double_click']
  };
}

/**
 * 모바일 최적화 설정
 */
export const MOBILE_OPTIMIZATIONS = {
  // 성능 최적화
  performance: {
    useVirtualScrolling: true,
    debounceInterval: 16, // 60fps
    lazyLoadImages: true,
    preloadCriticalAssets: true,
  },
  
  // UX 최적화
  ux: {
    hapticFeedback: true,
    autoHideVirtualKeyboard: true,
    adaptiveFontSize: true,
    gestureNavigation: true,
  },
  
  // 접근성 최적화
  accessibility: {
    screenReaderOptimized: true,
    highContrastSupport: true,
    voiceOverSupport: true,
    switchControlSupport: true,
  },
  
  // 네트워크 최적화
  network: {
    preconnectHints: true,
    resourcePrioritization: true,
    adaptiveLoading: true,
    offlineSupport: false, // PWA 구현 시 true로 변경
  }
} as const;

/**
 * 모바일 디버깅 도구
 */
export function enableMobileDebugging() {
  if (process.env.NODE_ENV !== 'development') return;
  
  // 터치 이벤트 시각화
  let touchIndicator: HTMLElement | null = null;
  
  document.addEventListener('touchstart', (e) => {
    Array.from(e.touches).forEach((touch) => {
      const indicator = document.createElement('div');
      indicator.style.cssText = `
        position: fixed;
        top: ${touch.clientY - 25}px;
        left: ${touch.clientX - 25}px;
        width: 50px;
        height: 50px;
        border: 2px solid #ff0000;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.1s ease;
      `;
      document.body.appendChild(indicator);
      
      setTimeout(() => {
        document.body.removeChild(indicator);
      }, 1000);
    });
  });
  
  // 디바이스 정보 표시
  const debugInfo = document.createElement('div');
  debugInfo.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    max-width: 200px;
  `;
  
  const updateDebugInfo = () => {
    debugInfo.innerHTML = `
      <div>Screen: ${screen.width}×${screen.height}</div>
      <div>Viewport: ${window.innerWidth}×${window.innerHeight}</div>
      <div>Pixel Ratio: ${window.devicePixelRatio}</div>
      <div>Orientation: ${window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait'}</div>
      <div>Touch: ${'ontouchstart' in window ? 'Yes' : 'No'}</div>
      <div>UA: ${navigator.userAgent.slice(0, 30)}...</div>
    `;
  };
  
  updateDebugInfo();
  window.addEventListener('resize', updateDebugInfo);
  window.addEventListener('orientationchange', updateDebugInfo);
  
  document.body.appendChild(debugInfo);
  
  console.log('🔧 Mobile debugging enabled');
}