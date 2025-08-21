/**
 * 🎨 K-Type 테마 시스템 통합 인덱스
 * 
 * 완전한 토큰 기반 테마 시스템:
 * - 하나의 레이아웃 ✅
 * - 하나의 컴포넌트 세트 ✅  
 * - 여러 테마 = 여러 토큰 세트 ✅
 */

// 📦 핵심 모듈 내보내기
export * from './design-tokens';
export * from './theme-provider';
export * from './theme-generator';

// 🎯 주요 타입들
export type {
  ThemeTokens,
  ThemeId
} from './design-tokens';

// 🎨 주요 함수들
export {
  applyThemeVariables,
  getThemeTokens,
  getAvailableThemes,
  getThemesByCategory,
  themeMetadata
} from './theme-provider';

export {
  themeGenerator,
  THEME_PRESETS,
  generateSeasonalTheme,
  generateBrandTheme,
  generateAccessibleTheme
} from './theme-generator';

/**
 * 🚀 빠른 시작 가이드
 * 
 * 1. 기존 테마 사용:
 * ```ts
 * import { applyThemeVariables } from '@/styles';
 * applyThemeVariables('dark'); // 다크 테마 적용
 * ```
 * 
 * 2. 새 테마 생성:
 * ```ts
 * import { themeGenerator } from '@/styles';
 * 
 * const myTheme = themeGenerator.createFromPalette('myTheme', {
 *   primary: '#ff6b9d',
 *   secondary: '#c44569',
 *   accent: '#f8b500',
 *   background: '#fff5f8',
 *   surface: '#ffffff',
 *   text: '#2c2c2c',
 *   textSecondary: '#666666'
 * });
 * ```
 * 
 * 3. 컴포넌트에서 사용:
 * ```tsx
 * <div className="bg-background text-text-primary">
 *   <button className="bg-interactive-primary text-text-inverse">
 *     Button
 *   </button>
 * </div>
 * ```
 */

/**
 * 🎨 테마 카테고리
 */
export const THEME_CATEGORIES = {
  STANDARD: 'standard',
  STEALTH: 'stealth',
  SEASONAL: 'seasonal',
  ACCESSIBILITY: 'accessibility',
  CUSTOM: 'custom'
} as const;

/**
 * 📋 사용 가능한 토큰 목록
 */
export const AVAILABLE_TOKENS = {
  // 🎯 배경 색상
  BACKGROUND: [
    'bg-background',           // 기본 배경
    'bg-background-secondary', // 보조 배경  
    'bg-background-elevated',  // 높은 배경 (카드, 모달)
    'bg-surface',             // 표면
    'bg-elevated'             // 승격된 표면
  ],
  
  // ✏️ 텍스트 색상
  TEXT: [
    'text-text-primary',      // 주요 텍스트
    'text-text-secondary',    // 보조 텍스트
    'text-text-tertiary',     // 3차 텍스트
    'text-text-inverse'       // 반전 텍스트 (버튼 안 등)
  ],
  
  // 🔗 상호작용 색상
  INTERACTIVE: [
    'bg-interactive-primary',           // 주요 버튼
    'bg-interactive-primary-hover',     // 주요 버튼 호버
    'text-interactive-primary',         // 주요 인터랙티브 텍스트
    'text-interactive-primary-hover',   // 주요 인터랙티브 텍스트 호버
    'bg-interactive-secondary',         // 보조 버튼  
    'bg-interactive-secondary-hover',   // 보조 버튼 호버
    'bg-interactive-disabled',          // 비활성화
    'text-interactive-disabled'         // 비활성화 텍스트
  ],
  
  // 📢 피드백 색상
  FEEDBACK: [
    'text-feedback-success',    // 성공
    'text-feedback-warning',    // 경고
    'text-feedback-error',      // 에러
    'text-feedback-info',       // 정보
    'bg-feedback-success',      // 성공 배경
    'bg-feedback-warning',      // 경고 배경
    'bg-feedback-error',        // 에러 배경
    'bg-feedback-info'          // 정보 배경
  ],
  
  // ⌨️ 타이핑 특화 색상
  TYPING: [
    'text-typing-correct',      // 정확한 글자
    'text-typing-incorrect',    // 틀린 글자
    'text-typing-current',      // 현재 글자
    'text-typing-cursor',       // 커서
    'bg-typing-correct',        // 정확한 글자 배경
    'bg-typing-incorrect',      // 틀린 글자 배경
    'bg-typing-current'         // 현재 글자 배경
  ]
} as const;

/**
 * 🔧 테마 관리 유틸리티
 */
export class ThemeManager {
  private currentTheme: ThemeId = 'dark';
  private listeners: Set<(theme: ThemeId) => void> = new Set();
  
  /**
   * 현재 테마 가져오기
   */
  getCurrentTheme(): ThemeId {
    return this.currentTheme;
  }
  
  /**
   * 테마 변경
   */
  setTheme(themeId: ThemeId): void {
    this.currentTheme = themeId;
    applyThemeVariables(themeId);
    this.notifyListeners(themeId);
    
    // 로컬스토리지에 저장
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('k-type-theme', themeId);
    }
  }
  
  /**
   * 테마 변경 리스너 등록
   */
  onThemeChange(callback: (theme: ThemeId) => void): () => void {
    this.listeners.add(callback);
    
    // 언등록 함수 반환
    return () => {
      this.listeners.delete(callback);
    };
  }
  
  /**
   * 저장된 테마 불러오기
   */
  loadSavedTheme(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('k-type-theme') as ThemeId;
      if (saved && getAvailableThemes().includes(saved)) {
        this.setTheme(saved);
      }
    }
  }
  
  /**
   * 테마 토글 (다크 ↔ 라이트)
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
  
  /**
   * 시스템 테마 따르기
   */
  followSystemTheme(): void {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    this.setTheme(systemTheme);
    
    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      this.setTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
  
  private notifyListeners(theme: ThemeId): void {
    this.listeners.forEach(callback => callback(theme));
  }
}

/**
 * 🌐 전역 테마 매니저 인스턴스
 */
export const themeManager = new ThemeManager();

/**
 * 🎯 React Hook: 테마 사용
 */
export function useTheme() {
  const [currentTheme, setCurrentTheme] = React.useState<ThemeId>(themeManager.getCurrentTheme());
  
  React.useEffect(() => {
    const unsubscribe = themeManager.onThemeChange(setCurrentTheme);
    return unsubscribe;
  }, []);
  
  return {
    theme: currentTheme,
    setTheme: themeManager.setTheme.bind(themeManager),
    toggleTheme: themeManager.toggleTheme.bind(themeManager),
    followSystemTheme: themeManager.followSystemTheme.bind(themeManager),
    availableThemes: getAvailableThemes(),
    themesByCategory: getThemesByCategory()
  };
}

// React import (조건부)
let React: any;
try {
  React = require('react');
} catch {
  // React가 없는 환경에서는 useTheme 훅 비활성화
}

/**
 * 📚 사용 예제들
 */
export const USAGE_EXAMPLES = {
  /**
   * 기본 테마 적용
   */
  basic: `
    import { themeManager } from '@/styles';
    
    // 테마 변경
    themeManager.setTheme('dark');
    themeManager.setTheme('stealth-docs');
    
    // 토글
    themeManager.toggleTheme();
  `,
  
  /**
   * React 컴포넌트에서 사용
   */
  react: `
    import { useTheme } from '@/styles';
    
    function ThemeSelector() {
      const { theme, setTheme, availableThemes } = useTheme();
      
      return (
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          {availableThemes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      );
    }
  `,
  
  /**
   * 새 테마 생성
   */
  createTheme: `
    import { themeGenerator } from '@/styles';
    
    // 팔레트로 생성
    const myTheme = themeGenerator.createFromPalette('purple-rain', {
      primary: '#8b5cf6',
      secondary: '#a78bfa', 
      accent: '#06b6d4',
      background: '#1e1b4b',
      surface: '#312e81',
      text: '#e0e7ff',
      textSecondary: '#c7d2fe'
    });
    
    // 기존 테마 기반으로 생성
    const darkVariant = themeGenerator.createFromBase('myDark', 'light', {
      background: {
        primary: '#0f172a',
        secondary: '#1e293b',
        elevated: '#334155'
      }
    });
  `,
  
  /**
   * CSS 클래스 사용
   */
  css: `
    <!-- 배경과 텍스트 -->
    <div class="bg-background text-text-primary">
      
      <!-- 버튼들 -->
      <button class="bg-interactive-primary text-text-inverse">
        Primary Button
      </button>
      
      <button class="border border-interactive-primary text-interactive-primary">
        Secondary Button  
      </button>
      
      <!-- 피드백 -->
      <span class="text-feedback-success">Success message</span>
      <span class="text-feedback-error">Error message</span>
      
      <!-- 타이핑 영역 -->
      <span class="text-typing-correct">correct</span>
      <span class="text-typing-incorrect">wrong</span>
      <span class="text-typing-current bg-typing-cursor">|</span>
    </div>
  `
};

/**
 * 🎨 테마 시스템 요약
 * 
 * ✅ 장점:
 * - 하나의 컴포넌트로 모든 테마 지원
 * - 토큰만 추가하면 새 테마 생성
 * - 런타임 테마 변경 가능
 * - 타입 안전성 보장
 * - CSS 변수로 성능 최적화
 * 
 * 🔧 확장 방법:
 * 1. design-tokens.ts에 새 테마 토큰 추가
 * 2. 자동으로 모든 컴포넌트에 적용됨
 * 3. 추가 CSS 클래스 없이 작동
 * 
 * 🎯 사용법:
 * - 컴포넌트: CSS 클래스 (bg-background, text-text-primary 등)
 * - JavaScript: themeManager.setTheme('themeName')
 * - React: useTheme() 훅
 */