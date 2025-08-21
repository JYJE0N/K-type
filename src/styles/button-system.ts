/**
 * 🎯 Button Design System
 * 일관된 버튼 스타일을 위한 타입 안전한 클래스 시스템
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type ButtonState = 'default' | 'hover' | 'active' | 'disabled' | 'selected';

interface ButtonStyleConfig {
  base: string;
  variants: Record<ButtonVariant, string>;
  sizes: Record<ButtonSize, string>;
  states: Record<ButtonState, string>;
}

export const buttonStyles: ButtonStyleConfig = {
  // 🔧 기본 스타일 (모든 버튼 공통)
  base: [
    'inline-flex items-center justify-center',
    'rounded-lg font-medium',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:ring-opacity-50',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:transform active:scale-[0.98]'
  ].join(' '),

  // 🎨 버튼 변형
  variants: {
    primary: [
      'bg-interactive-primary text-text-inverse',
      'hover:bg-interactive-primary-hover',
      'shadow-md hover:shadow-lg',
      'border border-transparent'
    ].join(' '),
    
    secondary: [
      'bg-background-secondary text-text-primary',
      'hover:bg-background-elevated',
      'border border-text-tertiary border-opacity-20',
      'hover:border-opacity-40'
    ].join(' '),
    
    ghost: [
      'bg-transparent text-text-secondary',
      'hover:bg-background-secondary hover:text-text-primary',
      'border border-transparent'
    ].join(' '),
    
    outline: [
      'bg-transparent text-text-primary',
      'border border-interactive-primary border-opacity-50',
      'hover:bg-interactive-primary hover:text-text-inverse',
      'hover:border-opacity-100'
    ].join(' '),
    
    accent: [
      'bg-interactive-secondary text-text-primary',
      'hover:bg-interactive-secondary-hover',
      'shadow-sm hover:shadow-md',
      'border border-transparent'
    ].join(' ')
  },

  // 📏 버튼 크기
  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  },

  // 🎭 상태별 스타일
  states: {
    default: '',
    hover: 'hover:transform hover:scale-[1.02]',
    active: 'scale-[0.98] shadow-inner',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
    selected: 'ring-2 ring-interactive-primary ring-opacity-50'
  }
};

/**
 * 버튼 클래스 생성 함수
 */
export function createButtonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  state: ButtonState = 'default',
  additionalClasses: string = ''
): string {
  return [
    buttonStyles.base,
    buttonStyles.variants[variant],
    buttonStyles.sizes[size],
    buttonStyles.states[state],
    additionalClasses
  ].filter(Boolean).join(' ');
}

/**
 * 선택된 상태 버튼을 위한 특별 클래스
 */
export function createSelectedButtonClasses(
  isSelected: boolean,
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md'
): string {
  if (isSelected) {
    // 선택된 상태: 명확한 배경색과 대비되는 텍스트 색상
    return createButtonClasses(variant, size, 'default');
  }
  // 비선택 상태: ghost 스타일
  return createButtonClasses('ghost', size, 'default');
}

// 🎯 타이핑 특화 버튼 스타일
export const typingButtonStyles = {
  testMode: (isActive: boolean) => {
    if (isActive) {
      return 'btn btn-lg btn-primary bg-pink-500 text-slate-900';
    }
    return 'btn btn-lg btn-ghost';
  },
  testTarget: (isActive: boolean) => {
    if (isActive) {
      return 'btn btn-md btn-accent bg-purple-500 text-white';
    }
    return 'btn btn-md btn-ghost';
  },
  textType: (isActive: boolean) => {
    if (isActive) {
      return 'btn btn-sm btn-outline border-pink-500 text-pink-500 bg-transparent';
    }
    return 'btn btn-sm btn-ghost';
  },
  settings: (isActive: boolean) => {
    if (isActive) {
      return 'btn btn-md btn-secondary bg-slate-600 text-white';
    }
    return 'btn btn-md btn-ghost';
  }
};