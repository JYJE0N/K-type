/**
 * 적응형 UI 시스템
 * 폴더블 폰, 태블릿+외부 키보드 등 다양한 환경에 대응
 */

import { useState, useEffect, useCallback } from 'react';
import { DeviceInfo, mobileDetector } from './mobileDetection';

/**
 * UI 모드 정의
 */
export enum UIMode {
  // 기본 모드
  DESKTOP = 'desktop',           // 데스크톱
  MOBILE = 'mobile',             // 일반 모바일
  TABLET = 'tablet',             // 일반 태블릿
  
  // 특수 모드
  TABLET_WITH_KEYBOARD = 'tablet_keyboard',  // 태블릿 + 블루투스 키보드
  FOLDABLE_FOLDED = 'foldable_folded',      // 폴더블 접힌 상태
  FOLDABLE_UNFOLDED = 'foldable_unfolded',  // 폴더블 펼친 상태
  DESKTOP_TOUCH = 'desktop_touch',          // 터치스크린 데스크톱
}

/**
 * 폴더블 상태
 */
export enum FoldableState {
  UNKNOWN = 'unknown',
  FOLDED = 'folded',
  UNFOLDED = 'unfolded',
  HALF_FOLDED = 'half-folded',   // 90도 각도 등
}

/**
 * 키보드 연결 상태
 */
export enum KeyboardConnection {
  NONE = 'none',              // 키보드 없음
  VIRTUAL = 'virtual',        // 가상 키보드만
  PHYSICAL = 'physical',      // 물리 키보드 (내장)
  BLUETOOTH = 'bluetooth',    // 블루투스 키보드
  USB = 'usb',               // USB 키보드
}

/**
 * 향상된 브레이크포인트 (폴더블 고려)
 */
export const ADAPTIVE_BREAKPOINTS = {
  // 일반 브레이크포인트
  xs: { min: 0, max: 479 },        // 작은 폰
  sm: { min: 480, max: 767 },      // 큰 폰, 접힌 폴더블
  md: { min: 768, max: 1023 },     // 태블릿, 펼친 폴더블
  lg: { min: 1024, max: 1439 },    // 큰 태블릿, 작은 노트북
  xl: { min: 1440, max: 1919 },    // 노트북
  xxl: { min: 1920, max: Infinity }, // 큰 화면
  
  // 폴더블 전용 브레이크포인트
  foldable_inner: { min: 600, max: 900 },   // 폴더블 내부 화면
  foldable_outer: { min: 300, max: 600 },   // 폴더블 외부 화면
  foldable_unfolded: { min: 900, max: 1400 }, // 폴더블 펼친 상태
  
  // 특수 비율
  ultra_wide: { aspectRatio: { min: 2.5 } },  // 매우 긴 화면
  square: { aspectRatio: { min: 0.8, max: 1.2 } }, // 정사각형에 가까운 화면
} as const;

/**
 * 적응형 UI 정보 인터페이스
 */
export interface AdaptiveUIInfo {
  uiMode: UIMode;
  foldableState: FoldableState;
  keyboardConnection: KeyboardConnection;
  hasPhysicalKeyboard: boolean;
  shouldShowVirtualKeyboard: boolean;
  optimalLayout: 'single-column' | 'two-column' | 'multi-column';
  recommendedFontSize: number;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  flexibleLayout: boolean; // 레이아웃이 자주 바뀔 수 있는지
}

/**
 * 적응형 UI 감지 클래스
 */
export class AdaptiveUIDetector {
  private static instance: AdaptiveUIDetector;
  private currentInfo: AdaptiveUIInfo | null = null;
  private listeners: Array<(info: AdaptiveUIInfo) => void> = [];
  private keyboardDetectionTimer: NodeJS.Timeout | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.detectUI();
      this.setupListeners();
    }
  }

  static getInstance(): AdaptiveUIDetector {
    if (!AdaptiveUIDetector.instance) {
      AdaptiveUIDetector.instance = new AdaptiveUIDetector();
    }
    return AdaptiveUIDetector.instance;
  }

  /**
   * UI 모드 감지
   */
  private detectUI(): void {
    const deviceInfo = mobileDetector.getDeviceInfo();
    if (!deviceInfo) return;

    const uiMode = this.detectUIMode(deviceInfo);
    const foldableState = this.detectFoldableState();
    const keyboardConnection = this.detectKeyboardConnection();
    const hasPhysicalKeyboard = keyboardConnection === KeyboardConnection.PHYSICAL || 
                               keyboardConnection === KeyboardConnection.BLUETOOTH ||
                               keyboardConnection === KeyboardConnection.USB;

    this.currentInfo = {
      uiMode,
      foldableState,
      keyboardConnection,
      hasPhysicalKeyboard,
      shouldShowVirtualKeyboard: this.shouldShowVirtualKeyboard(uiMode, hasPhysicalKeyboard),
      optimalLayout: this.getOptimalLayout(uiMode, deviceInfo),
      recommendedFontSize: this.getRecommendedFontSize(uiMode, deviceInfo),
      safeAreaInsets: this.getSafeAreaInsets(),
      flexibleLayout: this.isFlexibleLayout(uiMode, foldableState)
    };

    this.notifyListeners();
  }

  /**
   * UI 모드 감지
   */
  private detectUIMode(deviceInfo: DeviceInfo): UIMode {
    const { type, isTouchDevice } = deviceInfo;
    const { width, height } = deviceInfo.viewport;
    const aspectRatio = width / height;

    // 데스크톱 터치스크린
    if (type === 'desktop' && isTouchDevice) {
      return UIMode.DESKTOP_TOUCH;
    }

    // 일반 데스크톱
    if (type === 'desktop') {
      return UIMode.DESKTOP;
    }

    // 폴더블 감지 (화면 비율과 크기로 추정)
    if (this.isProbablyFoldable(width, height, aspectRatio)) {
      const foldableState = this.detectFoldableState();
      return foldableState === FoldableState.FOLDED 
        ? UIMode.FOLDABLE_FOLDED 
        : UIMode.FOLDABLE_UNFOLDED;
    }

    // 태블릿 + 키보드 조합 감지
    if (type === 'tablet' && this.hasExternalKeyboard()) {
      return UIMode.TABLET_WITH_KEYBOARD;
    }

    // 기본 모바일/태블릿
    return type === 'mobile' ? UIMode.MOBILE : UIMode.TABLET;
  }

  /**
   * 폴더블 기기 감지 (휴리스틱)
   */
  private isProbablyFoldable(width: number, height: number, aspectRatio: number): boolean {
    // CSS env() 지원 확인
    if (typeof CSS !== 'undefined' && CSS.supports) {
      // 폴더블 관련 CSS 환경 변수 확인
      const hasFoldableEnv = CSS.supports('(--fold-left: env(fold-left))') ||
                           CSS.supports('(--fold-right: env(fold-right))') ||
                           CSS.supports('(--fold-top: env(fold-top))') ||
                           CSS.supports('(--fold-bottom: env(fold-bottom))');
      if (hasFoldableEnv) return true;
    }

    // 화면 비율로 폴더블 추정
    // Galaxy Z Fold: 832×2268 (접힌 상태), 1768×2208 (펼친 상태)
    // Galaxy Z Flip: 1080×2636 (접힌 상태), 1080×2640 (펼친 상태)
    const isUltraTall = aspectRatio < 0.6; // 매우 긴 화면
    const isUltraWide = aspectRatio > 1.8;  // 매우 넓은 화면
    const isLargeScreen = width > 1600 || height > 2200;

    return (isUltraTall && width < 900) || (isUltraWide && isLargeScreen);
  }

  /**
   * 폴더블 상태 감지
   */
  private detectFoldableState(): FoldableState {
    // Visual Viewport API 활용
    if (window.screen && window.visualViewport) {
      const screenWidth = window.screen.width;
      const viewportWidth = window.visualViewport.width;
      
      // 화면과 뷰포트 크기 차이로 접힌 상태 추정
      if (Math.abs(screenWidth - viewportWidth) > 100) {
        return FoldableState.HALF_FOLDED;
      }
    }

    // CSS Media Query 활용 (실험적)
    if (window.matchMedia) {
      if (window.matchMedia('(spanning: single-fold-vertical)').matches) {
        return FoldableState.UNFOLDED;
      }
      if (window.matchMedia('(spanning: single-fold-horizontal)').matches) {
        return FoldableState.HALF_FOLDED;
      }
    }

    // 화면 비율로 추정
    const aspectRatio = window.innerWidth / window.innerHeight;
    if (aspectRatio > 1.5) {
      return FoldableState.UNFOLDED;
    }

    return FoldableState.UNKNOWN;
  }

  /**
   * 키보드 연결 감지
   */
  private detectKeyboardConnection(): KeyboardConnection {
    // Keyboard API 확인 (실험적)
    if ('keyboard' in navigator) {
      // 물리 키보드 존재 감지 (미래 API)
      return KeyboardConnection.PHYSICAL;
    }

    // InputDeviceInfo API 확인 (실험적)
    if ('mediaDevices' in navigator && 'enumerateDevices' in navigator.mediaDevices) {
      // USB/Bluetooth 키보드 감지 시도 (제한적)
    }

    // 휴리스틱 감지
    const hasPhysical = this.hasExternalKeyboard();
    const deviceInfo = mobileDetector.getDeviceInfo();
    
    if (hasPhysical) {
      // 블루투스인지 USB인지 구분하기 어려우므로 블루투스로 추정
      return deviceInfo?.type === 'tablet' || deviceInfo?.type === 'mobile' 
        ? KeyboardConnection.BLUETOOTH 
        : KeyboardConnection.PHYSICAL;
    }

    return deviceInfo?.hasVirtualKeyboard 
      ? KeyboardConnection.VIRTUAL 
      : KeyboardConnection.NONE;
  }

  /**
   * 외부 키보드 존재 감지 (휴리스틱)
   */
  private hasExternalKeyboard(): boolean {
    // 키 입력 패턴 분석을 통한 감지
    let physicalKeyDetected = false;

    const detectPhysicalKey = (event: KeyboardEvent) => {
      // 물리 키보드 특징: repeat 이벤트, 정확한 타이밍 등
      if (event.repeat && event.key.length === 1) {
        physicalKeyDetected = true;
      }
      
      // 가상 키보드에서는 드물게 발생하는 키들
      const physicalOnlyKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Insert', 'Home', 'End', 'PageUp', 'PageDown'];
      if (physicalOnlyKeys.includes(event.key)) {
        physicalKeyDetected = true;
      }
    };

    // 임시 리스너로 감지
    document.addEventListener('keydown', detectPhysicalKey, { once: true });

    // 타이머로 감지 종료
    setTimeout(() => {
      document.removeEventListener('keydown', detectPhysicalKey);
    }, 1000);

    return physicalKeyDetected;
  }

  /**
   * 가상 키보드 표시 여부 결정
   */
  private shouldShowVirtualKeyboard(uiMode: UIMode, hasPhysicalKeyboard: boolean): boolean {
    // 물리 키보드가 있으면 가상 키보드 숨김
    if (hasPhysicalKeyboard) return false;

    // 모드별 결정
    switch (uiMode) {
      case UIMode.DESKTOP:
      case UIMode.DESKTOP_TOUCH:
        return false;
      
      case UIMode.TABLET_WITH_KEYBOARD:
        return false;
      
      case UIMode.MOBILE:
      case UIMode.TABLET:
      case UIMode.FOLDABLE_FOLDED:
      case UIMode.FOLDABLE_UNFOLDED:
        return true;
      
      default:
        return true;
    }
  }

  /**
   * 최적 레이아웃 결정
   */
  private getOptimalLayout(uiMode: UIMode, deviceInfo: DeviceInfo): 'single-column' | 'two-column' | 'multi-column' {
    const { viewport } = deviceInfo;
    
    switch (uiMode) {
      case UIMode.DESKTOP:
      case UIMode.DESKTOP_TOUCH:
        return viewport.width > 1200 ? 'multi-column' : 'two-column';
      
      case UIMode.TABLET_WITH_KEYBOARD:
      case UIMode.FOLDABLE_UNFOLDED:
        return 'two-column';
      
      case UIMode.TABLET:
        return viewport.width > 900 ? 'two-column' : 'single-column';
      
      case UIMode.MOBILE:
      case UIMode.FOLDABLE_FOLDED:
        return 'single-column';
      
      default:
        return 'single-column';
    }
  }

  /**
   * 권장 폰트 크기 계산
   */
  private getRecommendedFontSize(uiMode: UIMode, deviceInfo: DeviceInfo): number {
    const baseFontSize = 16; // 기본 16px
    const { pixelRatio } = deviceInfo;

    switch (uiMode) {
      case UIMode.MOBILE:
        return Math.round(baseFontSize * Math.min(pixelRatio, 2));
      
      case UIMode.FOLDABLE_FOLDED:
        return Math.round(baseFontSize * 1.1);
      
      case UIMode.TABLET:
      case UIMode.FOLDABLE_UNFOLDED:
        return Math.round(baseFontSize * 1.2);
      
      case UIMode.TABLET_WITH_KEYBOARD:
        return Math.round(baseFontSize * 1.1); // 키보드가 있으면 조금 작게
      
      default:
        return baseFontSize;
    }
  }

  /**
   * 안전 영역 계산
   */
  private getSafeAreaInsets() {
    const style = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(style.getPropertyValue('--sait') || style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(style.getPropertyValue('--sair') || style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(style.getPropertyValue('--saib') || style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('--sail') || style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    };
  }

  /**
   * 유연한 레이아웃 여부 (자주 바뀌는지)
   */
  private isFlexibleLayout(uiMode: UIMode, foldableState: FoldableState): boolean {
    return uiMode.includes('foldable') || 
           foldableState !== FoldableState.UNKNOWN ||
           uiMode === UIMode.TABLET_WITH_KEYBOARD;
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupListeners(): void {
    // 화면 크기 변경 감지
    window.addEventListener('resize', () => {
      this.debounceDetection();
    });

    // 방향 변경 감지
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.detectUI(), 300); // 방향 전환 후 약간 대기
    });

    // Visual Viewport 변경 감지 (키보드 등)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        this.debounceDetection();
      });
    }

    // 키보드 이벤트 감지
    document.addEventListener('keydown', (event) => {
      // 물리 키보드 감지 시 즉시 업데이트
      const physicalOnlyKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
      if (physicalOnlyKeys.includes(event.key)) {
        this.detectUI();
      }
    });
  }

  /**
   * 감지 디바운스
   */
  private debounceDetection(): void {
    if (this.keyboardDetectionTimer) {
      clearTimeout(this.keyboardDetectionTimer);
    }
    
    this.keyboardDetectionTimer = setTimeout(() => {
      this.detectUI();
    }, 150);
  }

  /**
   * 리스너 등록
   */
  addListener(callback: (info: AdaptiveUIInfo) => void): void {
    this.listeners.push(callback);
  }

  /**
   * 리스너 제거
   */
  removeListener(callback: (info: AdaptiveUIInfo) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * 리스너에게 알림
   */
  private notifyListeners(): void {
    if (this.currentInfo) {
      this.listeners.forEach(listener => listener(this.currentInfo!));
    }
  }

  /**
   * 현재 UI 정보 반환
   */
  getCurrentInfo(): AdaptiveUIInfo | null {
    return this.currentInfo;
  }
}

/**
 * React Hook: 적응형 UI 정보 사용
 */
export function useAdaptiveUI(): AdaptiveUIInfo | null {
  const [uiInfo, setUIInfo] = useState<AdaptiveUIInfo | null>(null);

  useEffect(() => {
    const detector = AdaptiveUIDetector.getInstance();
    
    // 초기 정보 설정
    setUIInfo(detector.getCurrentInfo());
    
    // 리스너 등록
    const handleUIChange = (info: AdaptiveUIInfo) => {
      setUIInfo(info);
    };
    
    detector.addListener(handleUIChange);
    
    return () => {
      detector.removeListener(handleUIChange);
    };
  }, []);

  return uiInfo;
}

/**
 * 전역 인스턴스
 */
export const adaptiveUIDetector = AdaptiveUIDetector.getInstance();