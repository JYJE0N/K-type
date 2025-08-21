/**
 * 모바일 기기 감지 및 관련 유틸리티
 */

/**
 * 디바이스 타입 열거형
 */
export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet'
}

/**
 * 운영체제 타입
 */
export enum OSType {
  IOS = 'ios',
  ANDROID = 'android',
  WINDOWS = 'windows',
  MAC = 'mac',
  LINUX = 'linux',
  UNKNOWN = 'unknown'
}

/**
 * 브라우저 타입
 */
export enum BrowserType {
  CHROME = 'chrome',
  SAFARI = 'safari',
  FIREFOX = 'firefox',
  EDGE = 'edge',
  SAMSUNG = 'samsung',
  OPERA = 'opera',
  UNKNOWN = 'unknown'
}

/**
 * 디바이스 정보 인터페이스
 */
export interface DeviceInfo {
  type: DeviceType;
  os: OSType;
  browser: BrowserType;
  isTouchDevice: boolean;
  hasVirtualKeyboard: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
}

/**
 * 모바일 기기 감지 클래스
 */
export class MobileDetector {
  private static instance: MobileDetector;
  private deviceInfo: DeviceInfo | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.detectDevice();
      this.setupListeners();
    }
  }

  static getInstance(): MobileDetector {
    if (!MobileDetector.instance) {
      MobileDetector.instance = new MobileDetector();
    }
    return MobileDetector.instance;
  }

  /**
   * 디바이스 감지
   */
  private detectDevice(): void {
    const ua = navigator.userAgent.toLowerCase();
    
    this.deviceInfo = {
      type: this.detectDeviceType(ua),
      os: this.detectOS(ua),
      browser: this.detectBrowser(ua),
      isTouchDevice: this.detectTouch(),
      hasVirtualKeyboard: this.hasVirtualKeyboard(),
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      pixelRatio: window.devicePixelRatio || 1,
      orientation: this.getOrientation()
    };
  }

  /**
   * 디바이스 타입 감지
   */
  private detectDeviceType(ua: string): DeviceType {
    // 태블릿 먼저 체크 (태블릿도 모바일 UA를 포함할 수 있음)
    if (/ipad|android.*tablet|tablet.*android|android.*pad|pad.*android/i.test(ua)) {
      return DeviceType.TABLET;
    }
    
    // 모바일 체크
    if (/android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      return DeviceType.MOBILE;
    }
    
    // 화면 크기로 추가 판단
    const width = window.innerWidth;
    if (width <= 768 && this.detectTouch()) {
      return width <= 480 ? DeviceType.MOBILE : DeviceType.TABLET;
    }
    
    return DeviceType.DESKTOP;
  }

  /**
   * 운영체제 감지
   */
  private detectOS(ua: string): OSType {
    if (/iphone|ipad|ipod/i.test(ua)) return OSType.IOS;
    if (/android/i.test(ua)) return OSType.ANDROID;
    if (/windows/i.test(ua)) return OSType.WINDOWS;
    if (/mac/i.test(ua)) return OSType.MAC;
    if (/linux/i.test(ua)) return OSType.LINUX;
    return OSType.UNKNOWN;
  }

  /**
   * 브라우저 감지
   */
  private detectBrowser(ua: string): BrowserType {
    if (/edg/i.test(ua)) return BrowserType.EDGE;
    if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) return BrowserType.CHROME;
    if (/firefox|fxios/i.test(ua)) return BrowserType.FIREFOX;
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return BrowserType.SAFARI;
    if (/samsungbrowser/i.test(ua)) return BrowserType.SAMSUNG;
    if (/opera|opr/i.test(ua)) return BrowserType.OPERA;
    return BrowserType.UNKNOWN;
  }

  /**
   * 터치 디바이스 감지
   */
  private detectTouch(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
    );
  }

  /**
   * 가상 키보드 존재 여부
   */
  private hasVirtualKeyboard(): boolean {
    const type = this.detectDeviceType(navigator.userAgent.toLowerCase());
    const os = this.detectOS(navigator.userAgent.toLowerCase());
    
    return (
      type === DeviceType.MOBILE ||
      type === DeviceType.TABLET ||
      os === OSType.IOS ||
      os === OSType.ANDROID
    );
  }

  /**
   * 화면 방향 감지
   */
  private getOrientation(): 'portrait' | 'landscape' {
    if (window.matchMedia) {
      if (window.matchMedia('(orientation: portrait)').matches) {
        return 'portrait';
      }
      if (window.matchMedia('(orientation: landscape)').matches) {
        return 'landscape';
      }
    }
    
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupListeners(): void {
    // 화면 크기 변경 감지
    window.addEventListener('resize', () => {
      if (this.deviceInfo) {
        this.deviceInfo.viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        };
        this.deviceInfo.orientation = this.getOrientation();
      }
    });

    // 화면 방향 변경 감지
    if ('orientation' in window) {
      window.addEventListener('orientationchange', () => {
        if (this.deviceInfo) {
          this.deviceInfo.orientation = this.getOrientation();
          this.deviceInfo.viewport = {
            width: window.innerWidth,
            height: window.innerHeight
          };
        }
      });
    }
  }

  /**
   * 현재 디바이스 정보 반환
   */
  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  /**
   * 모바일인지 확인
   */
  isMobile(): boolean {
    return this.deviceInfo?.type === DeviceType.MOBILE;
  }

  /**
   * 태블릿인지 확인
   */
  isTablet(): boolean {
    return this.deviceInfo?.type === DeviceType.TABLET;
  }

  /**
   * 데스크톱인지 확인
   */
  isDesktop(): boolean {
    return this.deviceInfo?.type === DeviceType.DESKTOP;
  }

  /**
   * 터치 디바이스인지 확인
   */
  isTouchDevice(): boolean {
    return this.deviceInfo?.isTouchDevice || false;
  }

  /**
   * iOS인지 확인
   */
  isIOS(): boolean {
    return this.deviceInfo?.os === OSType.IOS;
  }

  /**
   * Android인지 확인
   */
  isAndroid(): boolean {
    return this.deviceInfo?.os === OSType.ANDROID;
  }

  /**
   * 가상 키보드 높이 추정 (픽셀)
   */
  getVirtualKeyboardHeight(): number {
    if (!this.hasVirtualKeyboard()) return 0;
    
    // 기기별 평균 가상 키보드 높이
    const baseHeight = this.isTablet() ? 300 : 250;
    const ratio = this.deviceInfo?.pixelRatio || 1;
    
    return Math.round(baseHeight * ratio);
  }

  /**
   * 안전 영역 계산 (노치, 상태바 등)
   */
  getSafeAreaInsets(): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } {
    const styles = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(styles.getPropertyValue('--sat') || '0'),
      right: parseInt(styles.getPropertyValue('--sar') || '0'),
      bottom: parseInt(styles.getPropertyValue('--sab') || '0'),
      left: parseInt(styles.getPropertyValue('--sal') || '0')
    };
  }
}

/**
 * 전역 인스턴스 내보내기
 */
export const mobileDetector = MobileDetector.getInstance();

/**
 * React Hook: 디바이스 정보 사용
 */
export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    const detector = MobileDetector.getInstance();
    setDeviceInfo(detector.getDeviceInfo());

    const handleResize = () => {
      setDeviceInfo(detector.getDeviceInfo());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}

// TypeScript를 위한 import 문 추가
import { useState, useEffect } from 'react';