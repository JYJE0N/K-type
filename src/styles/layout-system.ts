/**
 * 🏗️ Layout Design System
 * 일관된 레이아웃을 위한 타입 안전한 클래스 시스템
 */

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type FlexDirection = 'row' | 'col' | 'row-reverse' | 'col-reverse';
export type JustifyContent = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
export type AlignItems = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

interface LayoutStyleConfig {
  containers: Record<ContainerSize, string>;
  spacing: Record<SpacingSize, string>;
  flexbox: {
    direction: Record<FlexDirection, string>;
    justify: Record<JustifyContent, string>;
    align: Record<AlignItems, string>;
  };
  cards: {
    base: string;
    elevated: string;
    interactive: string;
  };
}

export const layoutStyles: LayoutStyleConfig = {
  // 📦 컨테이너 크기
  containers: {
    sm: 'max-w-sm mx-auto',
    md: 'max-w-2xl mx-auto',
    lg: 'max-w-4xl mx-auto',
    xl: 'max-w-6xl mx-auto',
    full: 'w-full'
  },

  // 📏 간격 시스템 (CSS 변수 기반)
  spacing: {
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
    '2xl': 'p-16'
  },

  // 🔧 Flexbox 유틸리티
  flexbox: {
    direction: {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse'
    },
    justify: {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    },
    align: {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch'
    }
  },

  // 🎴 카드 컴포넌트
  cards: {
    base: [
      'bg-background-secondary',
      'rounded-lg',
      'border border-text-tertiary border-opacity-10',
      'shadow-md'
    ].join(' '),
    
    elevated: [
      'bg-background-elevated',
      'rounded-xl',
      'border border-interactive-primary border-opacity-20',
      'shadow-lg',
      'backdrop-blur-sm'
    ].join(' '),
    
    interactive: [
      'bg-background-secondary',
      'rounded-lg',
      'border border-text-tertiary border-opacity-20',
      'shadow-md hover:shadow-lg',
      'transition-all duration-200',
      'hover:border-opacity-40',
      'cursor-pointer'
    ].join(' ')
  }
};

/**
 * Flexbox 컨테이너 클래스 생성
 */
export function createFlexClasses(
  direction: FlexDirection = 'row',
  justify: JustifyContent = 'start',
  align: AlignItems = 'stretch',
  additionalClasses: string = ''
): string {
  return [
    'flex',
    layoutStyles.flexbox.direction[direction],
    layoutStyles.flexbox.justify[justify],
    layoutStyles.flexbox.align[align],
    additionalClasses
  ].filter(Boolean).join(' ');
}

/**
 * 컨테이너 클래스 생성
 */
export function createContainerClasses(
  size: ContainerSize = 'lg',
  spacing: SpacingSize = 'md',
  additionalClasses: string = ''
): string {
  return [
    layoutStyles.containers[size],
    layoutStyles.spacing[spacing],
    additionalClasses
  ].filter(Boolean).join(' ');
}

/**
 * 카드 클래스 생성
 */
export function createCardClasses(
  variant: keyof typeof layoutStyles.cards = 'base',
  spacing: SpacingSize = 'md',
  additionalClasses: string = ''
): string {
  return [
    layoutStyles.cards[variant],
    layoutStyles.spacing[spacing],
    additionalClasses
  ].filter(Boolean).join(' ');
}

// 🎯 타이핑 앱 특화 레이아웃 헬퍼
export const typingLayoutStyles = {
  // 헤더 스타일
  header: [
    'bg-background-primary',
    'border-b border-text-tertiary border-opacity-10',
    'backdrop-blur-sm'
  ].join(' '),

  // 메인 타이핑 영역
  typingArea: [
    'relative',
    'min-h-[300px]',
    'p-8',
    'rounded-xl',
    'bg-background-secondary',
    'border border-text-tertiary border-opacity-10',
    'shadow-inner'
  ].join(' '),

  // 설정 패널
  settingsPanel: [
    'bg-background-elevated',
    'rounded-lg',
    'border border-interactive-primary border-opacity-20',
    'shadow-lg',
    'backdrop-blur-md'
  ].join(' '),

  // 통계 카드
  statsCard: [
    'bg-background-secondary',
    'rounded-xl',
    'border border-interactive-primary border-opacity-10',
    'shadow-lg',
    'p-6'
  ].join(' ')
};