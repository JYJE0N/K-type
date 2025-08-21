/**
 * 🧩 Design System Components
 * 재사용 가능한 UI 컴포넌트들의 스타일 정의
 */

import { colors, componentTokens, spacing, borders, shadows, animations } from './tokens';

// 🎯 버튼 변형 타입
export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'base' | 'lg' | 'xl';

// 🎯 버튼 스타일 생성기
export const createButtonStyles = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'base',
  isActive: boolean = false
): { className: string; style: React.CSSProperties } => {
  // 기본 클래스들
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-lg',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95'
  ];
  
  // 크기별 클래스
  const sizeClasses = {
    sm: ['px-3 py-2 text-sm'],
    base: ['px-4 py-2 text-base'],
    lg: ['px-6 py-3 text-lg'],
    xl: ['px-8 py-4 text-xl']
  }[size] || [];
  
  // 변형별 스타일 (CSS 변수 사용)
  const buttonVariantStyles = {
    primary: {
      backgroundColor: 'var(--color-interactive-primary)',
      color: 'var(--color-text-inverse)',
      border: 'none'
    },
    secondary: {
      backgroundColor: 'var(--color-background-secondary)',
      color: 'var(--color-text-primary)',
      border: 'none'
    },
    accent: {
      backgroundColor: 'var(--color-interactive-secondary)',
      color: 'var(--color-text-inverse)',
      border: 'none'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
      border: 'none'
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)'
    },
    default: {
      backgroundColor: 'var(--color-interactive-primary)',
      color: 'var(--color-text-inverse)',
      border: 'none'
    }
  }[variant] || {};
  
  // 액티브 상태 오버라이드
  const activeStyles = isActive ? (
    variant === 'ghost' ? {
      backgroundColor: 'var(--color-background-elevated)',
      color: 'var(--color-text-primary)'
    } : variant === 'outline' ? {
      backgroundColor: 'var(--color-interactive-primary)',
      color: 'var(--color-text-inverse)'
    } : {}
  ) : {};
  
  const classNames = [...baseClasses, ...sizeClasses]
    .filter(Boolean)
    .join(' ');
  
  return {
    className: classNames,
    style: { ...buttonVariantStyles, ...activeStyles }
  };
};

// 🃏 카드 스타일 생성기
export type CardVariant = 'default' | 'elevated' | 'interactive';

export const createCardStyles = (
  variant: CardVariant = 'default',
  padding: keyof typeof spacing = 6
): string => {
  const baseClasses = [
    'rounded-lg border',
    `p-${padding}`
  ];
  
  const variantClasses = {
    default: [
      'bg-gray-800 border-gray-700',
      'shadow-sm'
    ],
    elevated: [
      'bg-gray-800 border-gray-700',
      'shadow-lg'
    ],
    interactive: [
      'bg-gray-800 border-gray-700',
      'shadow-sm hover:shadow-md',
      'transition-shadow duration-200',
      'cursor-pointer'
    ]
  }[variant] || [];
  
  return [...baseClasses, ...variantClasses]
    .filter(Boolean)
    .join(' ');
};

// 🔧 플렉스 유틸리티
export type FlexDirection = 'row' | 'col';
export type JustifyContent = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
export type AlignItems = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

export const createFlexStyles = (
  direction: FlexDirection = 'row',
  justify: JustifyContent = 'start',
  align: AlignItems = 'center',
  gap: keyof typeof spacing = 0
): string => {
  const classes = [
    'flex',
    `flex-${direction}`,
    `justify-${justify}`,
    `items-${align}`,
    gap !== 0 ? `gap-${gap}` : ''
  ].filter(Boolean);
  
  return classes.join(' ');
};

// 📝 텍스트 스타일 
export type TextVariant = 'body' | 'caption' | 'heading' | 'subheading';
export type TextColor = 'primary' | 'secondary' | 'muted' | 'accent';

export const createTextStyles = (
  variant: TextVariant = 'body',
  color: TextColor = 'primary'
): string => {
  const variantClasses = {
    body: ['text-base'],
    caption: ['text-sm'],
    heading: ['text-2xl font-bold'],
    subheading: ['text-lg font-semibold']
  }[variant];
  
  const colorClasses = {
    primary: ['text-gray-900'],
    secondary: ['text-gray-600'], 
    muted: ['text-gray-400'],
    accent: ['text-pink-500']
  }[color];
  
  return [...variantClasses, ...colorClasses].join(' ');
};

// 🏷️ 뱃지 스타일
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error';

export const createBadgeStyles = (variant: BadgeVariant = 'default'): string => {
  const baseClasses = [
    'inline-flex items-center',
    'px-2 py-1 text-xs font-medium',
    'rounded-full'
  ];
  
  const variantClasses = {
    default: ['bg-gray-100 text-gray-800'],
    success: ['bg-green-100 text-green-800'],
    warning: ['bg-yellow-100 text-yellow-800'],
    error: ['bg-red-100 text-red-800']
  }[variant];
  
  return [...baseClasses, ...variantClasses].join(' ');
};

// 📊 진행률 바 스타일
export const createProgressStyles = (
  progress: number,
  variant: 'primary' | 'success' | 'warning' = 'primary'
): { container: string; bar: string; barStyle: React.CSSProperties } => {
  const containerClasses = [
    'w-full bg-gray-200 rounded-full h-2'
  ].join(' ');
  
  const barColorStyles = {
    primary: { backgroundColor: 'var(--color-interactive-primary)' },
    success: { backgroundColor: 'var(--color-feedback-success)' }, 
    warning: { backgroundColor: 'var(--color-feedback-warning)' }
  }[variant];
  
  const barClasses = [
    'h-2 rounded-full transition-all duration-300'
  ].join(' ');
  
  return {
    container: containerClasses,
    bar: barClasses,
    barStyle: { 
      width: `${Math.min(100, Math.max(0, progress))}%`,
      ...barColorStyles
    }
  };
};

// 🎯 타이핑 특화 컴포넌트 스타일
export const typingComponents = {
  // 언어 선택 토글
  languageToggle: (isActive: boolean) => 
    createButtonStyles('ghost', 'sm', isActive),
  
  // 테스트 모드 버튼 (시간/단어)
  testModeButton: (isActive: boolean) =>
    createButtonStyles('primary', 'lg', isActive),
  
  // 목표값 버튼 (15초, 30초 등)
  testTargetButton: (isActive: boolean) =>
    createButtonStyles('accent', 'base', isActive),
  
  // 텍스트 타입 버튼 (일반, 구두점 등)
  textTypeButton: (isActive: boolean) =>
    createButtonStyles('outline', 'sm', isActive),
  
  // 설정 토글 버튼
  settingsButton: (isActive: boolean) =>
    createButtonStyles('secondary', 'base', isActive),
  
  // 주요 액션 버튼 (시작하기, 계속 등)
  primaryAction: () =>
    createButtonStyles('primary', 'xl'),
  
  // 보조 액션 버튼 (일시정지, 중단 등)
  secondaryAction: () =>
    createButtonStyles('secondary', 'lg'),
  
  // 고스트 액션 버튼
  ghostAction: () =>
    createButtonStyles('ghost', 'lg'),
  
  // 설정 패널 카드
  settingsCard: () =>
    createCardStyles('elevated', 6),
  
  // 통계 카드
  statsCard: () =>
    createCardStyles('default', 4),
} as const;

// 🎨 레이아웃 헬퍼
export const layoutHelpers = {
  // 중앙 정렬 컨테이너
  centerContainer: (maxWidth: 'sm' | 'md' | 'lg' | 'xl' = 'lg') => [
    'mx-auto px-4',
    {
      sm: 'max-w-sm',
      md: 'max-w-2xl', 
      lg: 'max-w-4xl',
      xl: 'max-w-6xl'
    }[maxWidth]
  ].join(' '),
  
  // 설정 그룹 레이아웃
  settingsGroup: () =>
    createFlexStyles('row', 'start', 'center', 4),
  
  // 버튼 그룹 레이아웃
  buttonGroup: () =>
    createFlexStyles('row', 'center', 'center', 2),
  
  // 구분선
  divider: () =>
    'w-px h-8 bg-gray-300',
} as const;