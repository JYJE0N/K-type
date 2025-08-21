/**
 * 🎨 Design Tokens - Single Source of Truth
 * 모든 디자인 결정의 단일 진실 공급원
 */

// 🎯 색상 팔레트 (명확하고 의미있는 네이밍)
export const colors = {
  // 베이스 컬러
  white: '#ffffff',
  black: '#000000',
  
  // 그레이 스케일 (다크 테마 친화적)
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9', 
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // 브랜드 컬러 (타이핑 앱 특화)
  primary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899', // 메인 핑크
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // 메인 블루
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  accent: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe', 
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6', // 메인 퍼플
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  
  // 시맨틱 컬러
  success: {
    500: '#10b981',
    600: '#059669',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    500: '#ef4444',
    600: '#dc2626',
  },
  
  // 타이핑 특화 컬러
  typing: {
    correct: '#10b981',
    incorrect: '#ef4444',
    current: '#f59e0b',
    cursor: '#ec4899',
  }
} as const;

// 📏 스페이싱 시스템 (8px 기반 그리드)
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px  
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
} as const;

// 🔤 타이포그래피 시스템
export const typography = {
  fontFamily: {
    sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500', 
    semibold: '600',
    bold: '700',
  },
} as const;

// 🌑 그림자 시스템
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// 🔳 보더 시스템  
export const borders = {
  width: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
  },
  radius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },
} as const;

// ⚡ 애니메이션 시스템
export const animations = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  easing: {
    linear: 'linear',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)', 
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// 📱 브레이크포인트
export const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// 🎯 컴포넌트별 토큰 (의미론적 토큰)
export const componentTokens = {
  button: {
    // 크기별 패딩
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,
      base: `${spacing[2]} ${spacing[4]}`, 
      lg: `${spacing[3]} ${spacing[6]}`,
      xl: `${spacing[4]} ${spacing[8]}`,
    },
    
    // 상태별 색상 조합
    variants: {
      primary: {
        bg: colors.primary[500],
        text: colors.white,
        hover: colors.primary[600],
      },
      secondary: {
        bg: colors.gray[100],
        text: colors.gray[900],
        hover: colors.gray[200],
      },
      accent: {
        bg: colors.accent[500], 
        text: colors.white,
        hover: colors.accent[600],
      },
      ghost: {
        bg: 'transparent',
        text: colors.gray[600],
        hover: colors.gray[100],
      },
      outline: {
        bg: 'transparent',
        text: colors.primary[500],
        border: colors.primary[500],
        hover: colors.primary[500],
        hoverText: colors.white,
      }
    }
  },
  
  card: {
    bg: colors.white,
    border: colors.gray[200],
    shadow: shadows.base,
    radius: borders.radius.lg,
  },
  
  input: {
    bg: colors.white,
    border: colors.gray[300],
    focus: colors.primary[500],
    text: colors.gray[900],
    placeholder: colors.gray[400],
  }
} as const;

// 🌙 다크 테마 오버라이드
export const darkTheme = {
  colors: {
    ...colors,
    gray: {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155', 
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    }
  },
  
  componentTokens: {
    ...componentTokens,
    card: {
      bg: colors.gray[800],
      border: colors.gray[700],
      shadow: shadows.lg,
      radius: borders.radius.lg,
    },
    
    input: {
      bg: colors.gray[800],
      border: colors.gray[600],
      focus: colors.primary[400],
      text: colors.gray[100],
      placeholder: colors.gray[400],
    }
  }
} as const;