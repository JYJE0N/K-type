/**
 * 🎨 K-Type Design System
 * 통합 스타일 시스템 - 모든 스타일 관련 유틸리티의 단일 진입점
 */

// 디자인 시스템 컴포넌트들
export * from './button-system';
export * from './layout-system';
export * from './performance-optimizations';
export * from './design-tokens';

// 통합 스타일 헬퍼 함수들
import { createButtonClasses, typingButtonStyles } from './button-system';
import { createFlexClasses, createCardClasses, typingLayoutStyles } from './layout-system';
import { combineClasses, conditionalClasses, typingPerformanceClasses } from './performance-optimizations';

/**
 * 🎯 타이핑 앱 전용 통합 스타일 시스템
 */
export const TypingStyles = {
  // 버튼 관련
  buttons: typingButtonStyles,
  createButton: createButtonClasses,
  
  // 레이아웃 관련
  layouts: typingLayoutStyles,
  createFlex: createFlexClasses,
  createCard: createCardClasses,
  
  // 성능 최적화
  performance: typingPerformanceClasses,
  
  // 유틸리티
  combine: combineClasses,
  conditional: conditionalClasses,
  
  // 특화된 컴포넌트 스타일들
  components: {
    // 헤더 컴포넌트
    header: {
      container: combineClasses(
        typingLayoutStyles.header,
        'sticky top-0 z-50'
      ),
      title: 'text-center mb-6',
      settingsPanel: combineClasses(
        createCardClasses('elevated', 'sm'),
        createFlexClasses('row', 'center', 'center'),
        'gap-4'
      ),
    },
    
    // 타이핑 엔진 컴포넌트
    typingEngine: {
      container: combineClasses(
        'typing-engine-container relative py-8',
        typingPerformanceClasses.textRenderer
      ),
      languageSelector: combineClasses(
        createCardClasses('base', 'xs'),
        createFlexClasses('row', 'start', 'center'),
        'mb-6'
      ),
      timer: combineClasses(
        'text-center mb-6',
        'inline-flex items-center bg-background-secondary rounded-lg px-4 py-2 cursor-default'
      ),
      typingArea: combineClasses(
        typingLayoutStyles.typingArea,
        typingPerformanceClasses.keyboardInput
      ),
    },
    
    // 설정 메뉴 컴포넌트
    settingsMenu: {
      trigger: 'flex items-center gap-2 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-all duration-200',
      dropdown: combineClasses(
        'absolute top-full right-0 mt-2 w-56',
        'bg-background-elevated rounded-lg',
        'border border-text-tertiary/30',
        'shadow-xl shadow-black/40 z-[9999]'
      ),
      section: 'mb-4',
      sectionTitle: 'text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2',
    },
    
    // 통계 관련 컴포넌트
    stats: {
      card: combineClasses(
        typingLayoutStyles.statsCard,
        typingPerformanceClasses.statsDisplay
      ),
      progressRing: combineClasses(
        typingPerformanceClasses.progressIndicator,
        'transition-all duration-300'
      ),
    },
  },
  
  // 테마 전환 애니메이션
  animations: {
    themeTransition: 'transition-all duration-300 ease-out',
    buttonHover: 'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
    cardHover: 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
    fadeIn: 'animate-in fade-in duration-200',
    slideIn: 'animate-in slide-in-from-bottom-2 duration-300',
  },
  
  // 반응형 헬퍼
  responsive: {
    mobile: 'block md:hidden',
    tablet: 'hidden md:block lg:hidden',
    desktop: 'hidden lg:block',
    mobileUp: 'block',
    tabletUp: 'md:block',
    desktopUp: 'lg:block',
  },
} as const;

/**
 * 타이핑 관련 스타일 상수들
 */
export const TYPING_CONSTANTS = {
  CURSOR_BLINK_DURATION: '1s',
  TEXT_TRANSITION_DURATION: '150ms',
  KEYSTROKE_FEEDBACK_DURATION: '100ms',
  THEME_TRANSITION_DURATION: '300ms',
  ANIMATION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/**
 * 빠른 스타일 적용을 위한 alias 함수들
 */
export const quickStyles = {
  // 자주 사용되는 버튼 조합
  primaryButton: (isActive: boolean) => 
    TypingStyles.buttons.testMode(isActive),
  
  secondaryButton: (isActive: boolean) => 
    TypingStyles.buttons.testTarget(isActive),
  
  ghostButton: (isActive: boolean) => 
    TypingStyles.buttons.settings(isActive),
  
  // 자주 사용되는 레이아웃 조합
  centerFlex: () => 
    TypingStyles.createFlex('row', 'center', 'center'),
  
  spaceBetweenFlex: () => 
    TypingStyles.createFlex('row', 'between', 'center'),
  
  verticalFlex: () => 
    TypingStyles.createFlex('col', 'start', 'stretch'),
  
  // 카드 레이아웃
  elevatedCard: () => 
    TypingStyles.createCard('elevated', 'md'),
  
  interactiveCard: () => 
    TypingStyles.createCard('interactive', 'md'),
} as const;

// 기본 export
export default TypingStyles;