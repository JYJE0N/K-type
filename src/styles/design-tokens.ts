/**
 * 월급루팡 타자기 - Design Token System
 * Cascade 문제 해결 및 중복 제거를 위한 토큰 기반 시스템
 */

// ===============================
// 1. 기본 컬러 팔레트 (브랜드 중립적)
// ===============================

export const colorPalette = {
  // 그레이 스케일
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6', 
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },

  // 브랜드 컬러
  brand: {
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff', 
      200: '#e9d5ff',
      300: '#d946ef',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87'
    },
    
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8', 
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843'
    },

    navy: {
      50: '#f0f4ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc', 
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#1a1b3a', // 다크 테마 메인
      800: '#1e1b4b',
      900: '#312e81'
    }
  },

  // 기능적 컬러
  semantic: {
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d'
    },
    
    warning: {
      50: '#fffbeb', 
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309'
    },
    
    error: {
      50: '#fef2f2',
      500: '#ef4444', 
      600: '#dc2626',
      700: '#b91c1c'
    }
  },

  // 은밀모드 전용 컬러 (실제 업무용 툴 색상)
  stealth: {
    trello: {
      background: '#f7f8fc',
      surface: '#ffffff',
      primary: '#0052cc',
      text: '#172b4d',
      textSecondary: '#5e6c84',
      success: '#00875a',
      error: '#de350b'
    },
    
    google: {
      background: '#ffffff',
      surface: '#f8f9fa', 
      primary: '#1a73e8',
      text: '#202124',
      textSecondary: '#5f6368',
      success: '#34a853',
      error: '#ea4335'
    },
    
    slack: {
      background: '#f8f8f8',
      surface: '#ffffff',
      primary: '#1264a3', 
      text: '#1d1c1d',
      textSecondary: '#616061',
      success: '#2eb67d',
      error: '#e01e5a'
    }
  }
} as const

// ===============================
// 2. 타이포그래피 시스템 토큰
// ===============================

export const typography = {
  fontFamily: {
    sans: ['Pretendard', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    korean: ['Pretendard', 'Noto Sans KR', 'Malgun Gothic', 'sans-serif']
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'  // 36px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  },

  // 의미론적 텍스트 스타일 정의
  textStyles: {
    headline: {
      fontSize: '2.25rem',    // 36px
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.02em'
    },
    title: {
      fontSize: '1.875rem',   // 30px
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.01em'
    },
    subtitle: {
      fontSize: '1.5rem',     // 24px
      fontWeight: 500,
      lineHeight: 1.35,
      letterSpacing: '0em'
    },
    body: {
      fontSize: '1rem',       // 16px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0em'
    },
    description: {
      fontSize: '0.875rem',   // 14px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0em'
    },
    caption: {
      fontSize: '0.75rem',    // 12px
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: '0.01em'
    },
    accent: {
      fontSize: '1rem',       // 16px
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.02em',
      textTransform: 'uppercase' as const
    }
  }
} as const

// ===============================
// 3. 스페이싱 토큰
// ===============================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem'      // 96px
} as const

// ===============================
// 4. 그림자 토큰
// ===============================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  
  // 컬러별 그림자
  purple: '0 4px 14px 0 rgb(168 85 247 / 0.39)',
  pink: '0 4px 14px 0 rgb(244 114 182 / 0.39)',
  blue: '0 4px 14px 0 rgb(99 102 241 / 0.39)'
} as const

// ===============================
// 5. 보더 토큰
// ===============================

export const borders = {
  width: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px'
  },
  
  radius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem', 
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  }
} as const

// ===============================
// 6. 애니메이션 토큰
// ===============================

export const animations = {
  duration: {
    fast: '150ms',
    base: '200ms', 
    slow: '300ms',
    slower: '500ms'
  },
  
  easing: {
    linear: 'linear',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
} as const

// ===============================
// 7. 컴포넌트 상태 토큰
// ===============================

export const componentStates = {
  // 버튼 상태별 토큰
  button: {
    primary: {
      default: {
        background: 'var(--color-interactive-primary)',
        text: 'var(--color-text-inverse)',
        border: 'var(--color-interactive-primary)',
        shadow: 'var(--shadow-sm)'
      },
      hover: {
        background: 'var(--color-interactive-primary-hover)', 
        text: 'var(--color-text-inverse)',
        border: 'var(--color-interactive-primary-hover)',
        shadow: 'var(--shadow-md)',
        transform: 'translateY(-1px)'
      },
      active: {
        background: 'var(--color-interactive-primary)',
        text: 'var(--color-text-inverse)', 
        border: 'var(--color-interactive-primary)',
        shadow: 'var(--shadow-sm)',
        transform: 'translateY(0px)'
      },
      disabled: {
        background: 'var(--color-interactive-disabled)',
        text: 'var(--color-text-tertiary)',
        border: 'var(--color-interactive-disabled)',
        shadow: 'none',
        cursor: 'not-allowed'
      }
    },
    secondary: {
      default: {
        background: 'transparent',
        text: 'var(--color-interactive-primary)',
        border: 'var(--color-interactive-primary)',
        shadow: 'var(--shadow-sm)'
      },
      hover: {
        background: 'var(--color-interactive-primary)',
        text: 'var(--color-text-inverse)',
        border: 'var(--color-interactive-primary)',
        shadow: 'var(--shadow-md)',
        transform: 'translateY(-1px)'
      },
      active: {
        background: 'var(--color-interactive-primary-hover)',
        text: 'var(--color-text-inverse)',
        border: 'var(--color-interactive-primary-hover)',
        shadow: 'var(--shadow-sm)',
        transform: 'translateY(0px)'
      },
      disabled: {
        background: 'transparent',
        text: 'var(--color-interactive-disabled)',
        border: 'var(--color-interactive-disabled)', 
        shadow: 'none',
        cursor: 'not-allowed'
      }
    },
    ghost: {
      default: {
        background: 'transparent',
        text: 'var(--color-interactive-primary)',
        border: 'transparent',
        shadow: 'none'
      },
      hover: {
        background: 'var(--color-background-secondary)',
        text: 'var(--color-interactive-primary-hover)',
        border: 'transparent',
        shadow: 'none'
      },
      active: {
        background: 'var(--color-background-elevated)',
        text: 'var(--color-interactive-primary)',
        border: 'transparent',
        shadow: 'none'
      },
      disabled: {
        background: 'transparent',
        text: 'var(--color-interactive-disabled)',
        border: 'transparent',
        shadow: 'none',
        cursor: 'not-allowed'
      }
    }
  },

  // 입력 필드 상태
  input: {
    default: {
      background: 'var(--color-background-primary)',
      text: 'var(--color-text-primary)', 
      border: 'var(--color-text-tertiary)',
      shadow: 'none'
    },
    focus: {
      background: 'var(--color-background-primary)',
      text: 'var(--color-text-primary)',
      border: 'var(--color-interactive-primary)',
      shadow: '0 0 0 3px var(--color-interactive-primary)25',
      outline: 'none'
    },
    error: {
      background: 'var(--color-background-primary)',
      text: 'var(--color-text-primary)',
      border: 'var(--color-feedback-error)',
      shadow: '0 0 0 3px var(--color-feedback-error)25'
    },
    disabled: {
      background: 'var(--color-background-secondary)',
      text: 'var(--color-text-tertiary)',
      border: 'var(--color-interactive-disabled)',
      shadow: 'none',
      cursor: 'not-allowed'
    }
  }
} as const

// ===============================
// 8. 테마별 시맨틱 토큰 매핑
// ===============================

export type ThemeTokens = {
  background: {
    primary: string
    secondary: string
    elevated: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
  }
  interactive: {
    primary: string
    primaryHover: string
    secondary: string 
    secondaryHover: string
    disabled: string
  }
  feedback: {
    success: string
    warning: string
    error: string
    info: string
  }
  typing: {
    correct: string
    incorrect: string
    current: string
    cursor: string
  }
}

// 다크 테마 토큰 (드라큘라 스타일 - 눈의 피로도 최소화)
export const darkTokens: ThemeTokens = {
  background: {
    primary: '#282a36',    // 드라큘라 배경 - 부드러운 어두운 보라빛 회색
    secondary: '#44475a',  // 드라큘라 selection - 밝은 회색
    elevated: '#6272a4'    // 드라큘라 comment - 연한 파란빛 회색
  },
  text: {
    primary: '#f8f8f2',    // 드라큘라 foreground - 부드러운 흰색
    secondary: '#bd93f9',   // 드라큘라 purple - 연한 보라색
    tertiary: '#8be9fd',    // 드라큘라 cyan - 밝은 청록색
    inverse: '#282a36'      // 반전 시 배경색 사용
  },
  interactive: {
    primary: '#ff79c6',     // 드라큘라 pink - 부드러운 핑크
    primaryHover: '#ffb3d9', // 더 밝은 핑크
    secondary: '#bd93f9',   // 드라큘라 purple
    secondaryHover: '#d4b5fd', // 더 밝은 보라색
    disabled: '#6272a4'     // 비활성화는 comment 색상
  },
  feedback: {
    success: '#50fa7b',     // 드라큘라 green - 밝은 연두색
    warning: '#ffb86c',     // 드라큘라 orange - 부드러운 주황색
    error: '#ff5555',       // 드라큘라 red - 부드러운 빨간색
    info: '#8be9fd'         // 드라큘라 cyan - 정보용 청록색
  },
  typing: {
    correct: '#50fa7b',     // 올바른 타이핑 - 초록색
    incorrect: '#ff5555',   // 틀린 타이핑 - 빨간색
    current: '#f1fa8c',     // 드라큘라 yellow - 현재 위치
    cursor: '#ff79c6'       // 커서 - 핑크색
  }
}

// 라이트 테마 토큰
export const lightTokens: ThemeTokens = {
  background: {
    primary: '#f8faf9',
    secondary: '#e8f5f0',
    elevated: colorPalette.gray[50]
  },
  text: {
    primary: '#2d5a41',
    secondary: colorPalette.gray[600],
    tertiary: colorPalette.gray[500],
    inverse: colorPalette.gray[50]
  },
  interactive: {
    primary: colorPalette.brand.pink[500],
    primaryHover: colorPalette.brand.pink[600],
    secondary: colorPalette.brand.purple[500],
    secondaryHover: colorPalette.brand.purple[600], 
    disabled: colorPalette.gray[400]
  },
  feedback: {
    success: '#10b981',
    warning: colorPalette.semantic.warning[600],
    error: '#f472b6',
    info: colorPalette.brand.navy[500]
  },
  typing: {
    correct: '#10b981',
    incorrect: '#f472b6',
    current: '#2d5a41',
    cursor: colorPalette.brand.pink[500]
  }
}

// 고대비 테마 토큰
export const highContrastTokens: ThemeTokens = {
  background: {
    primary: '#0a0a0a',
    secondary: '#1c1c1e',
    elevated: colorPalette.gray[800]
  },
  text: {
    primary: '#ffffff',
    secondary: colorPalette.brand.purple[200], 
    tertiary: colorPalette.gray[300],
    inverse: colorPalette.gray[900]
  },
  interactive: {
    primary: '#ff9f0a',
    primaryHover: '#ffb442',
    secondary: colorPalette.gray[300],
    secondaryHover: colorPalette.gray[200],
    disabled: colorPalette.gray[600]
  },
  feedback: {
    success: '#32d74b',
    warning: '#ff9f0a',
    error: '#ff453a',
    info: colorPalette.brand.navy[400]
  },
  typing: {
    correct: '#32d74b',
    incorrect: '#ff453a',
    current: '#ffffff',
    cursor: '#ff9f0a'
  }
}

// 은밀모드 토큰들
export const stealthTokens = {
  kanban: {
    background: {
      primary: colorPalette.stealth.trello.background,
      secondary: colorPalette.stealth.trello.surface,
      elevated: colorPalette.gray[50]
    },
    text: {
      primary: colorPalette.stealth.trello.text,
      secondary: colorPalette.stealth.trello.textSecondary,
      tertiary: colorPalette.gray[500],
      inverse: colorPalette.gray[50]
    },
    interactive: {
      primary: colorPalette.stealth.trello.primary,
      primaryHover: '#0052cc',
      secondary: colorPalette.gray[500],
      secondaryHover: colorPalette.gray[600],
      disabled: colorPalette.gray[300]
    },
    feedback: {
      success: colorPalette.stealth.trello.success,
      warning: colorPalette.semantic.warning[600],
      error: colorPalette.stealth.trello.error,
      info: colorPalette.stealth.trello.primary
    },
    typing: {
      correct: colorPalette.stealth.trello.success,
      incorrect: colorPalette.stealth.trello.error,
      current: colorPalette.stealth.trello.primary,
      cursor: colorPalette.stealth.trello.primary
    }
  },
  
  docs: {
    background: {
      primary: colorPalette.stealth.google.background,
      secondary: colorPalette.stealth.google.surface,
      elevated: colorPalette.gray[50]
    },
    text: {
      primary: colorPalette.stealth.google.text,
      secondary: colorPalette.stealth.google.textSecondary,
      tertiary: colorPalette.gray[500],
      inverse: colorPalette.gray[50]
    },
    interactive: {
      primary: colorPalette.stealth.google.primary,
      primaryHover: '#1557c2',
      secondary: colorPalette.gray[500],
      secondaryHover: colorPalette.gray[600],
      disabled: colorPalette.gray[300]
    },
    feedback: {
      success: colorPalette.stealth.google.success,
      warning: colorPalette.semantic.warning[600],
      error: colorPalette.stealth.google.error,
      info: colorPalette.stealth.google.primary
    },
    typing: {
      correct: colorPalette.stealth.google.success,
      incorrect: colorPalette.stealth.google.error,
      current: colorPalette.stealth.google.primary,
      cursor: colorPalette.stealth.google.primary
    }
  },
  
  slack: {
    background: {
      primary: colorPalette.stealth.slack.background,
      secondary: colorPalette.stealth.slack.surface,
      elevated: colorPalette.gray[50]
    },
    text: {
      primary: colorPalette.stealth.slack.text,
      secondary: colorPalette.stealth.slack.textSecondary,
      tertiary: colorPalette.gray[500], 
      inverse: colorPalette.gray[50]
    },
    interactive: {
      primary: colorPalette.stealth.slack.primary,
      primaryHover: '#0f4c75',
      secondary: colorPalette.gray[500],
      secondaryHover: colorPalette.gray[600],
      disabled: colorPalette.gray[300]
    },
    feedback: {
      success: colorPalette.stealth.slack.success,
      warning: colorPalette.semantic.warning[600], 
      error: colorPalette.stealth.slack.error,
      info: colorPalette.stealth.slack.primary
    },
    typing: {
      correct: colorPalette.stealth.slack.success,
      incorrect: colorPalette.stealth.slack.error,
      current: colorPalette.stealth.slack.primary,
      cursor: colorPalette.stealth.slack.primary
    }
  }
} satisfies Record<string, ThemeTokens>

// ===============================
// 8. 테마 토큰 맵
// ===============================

export const themeTokenMap = {
  dark: darkTokens,
  light: lightTokens,
  'high-contrast': highContrastTokens,
  stealth: stealthTokens.kanban,
  'stealth-docs': stealthTokens.docs,
  'stealth-slack': stealthTokens.slack,
  'stealth-notion': {
    background: {
      primary: '#ffffff',
      secondary: '#f7f6f3',
      elevated: '#f1f1ef'
    },
    text: {
      primary: '#37352f',
      secondary: '#6f6e69',
      tertiary: '#9b9a97',
      inverse: '#ffffff'
    },
    interactive: {
      primary: '#2383e2',
      primaryHover: '#1a6bb8',
      secondary: '#6f6e69',
      secondaryHover: '#57564f',
      disabled: '#e9e9e7'
    },
    feedback: {
      success: '#0f7b6c',
      warning: '#f79009',
      error: '#d83b01',
      info: '#2383e2'
    },
    typing: {
      correct: '#0f7b6c',
      incorrect: '#d83b01',
      current: '#37352f',
      cursor: '#2383e2'
    }
  },
  // 새로운 프리셋 테마들 (나중에 추가될 예정)
  // sakura: sakuraTheme,
  // ocean: oceanTheme, 
  // fire: fireTheme
} as const

export type ThemeId = keyof typeof themeTokenMap

// ===============================
// 9. 테마 복제 및 생성 유틸리티
// ===============================

/**
 * 기존 테마를 복제하여 새로운 테마 생성
 * @param baseThemeId 기반이 될 테마 ID
 * @param overrides 변경할 토큰들
 * @returns 새로운 테마 토큰
 */
export function createThemeFromBase(
  baseThemeId: ThemeId,
  overrides: Partial<ThemeTokens>
): ThemeTokens {
  const baseTokens = themeTokenMap[baseThemeId]
  if (!baseTokens) {
    throw new Error(`Base theme "${baseThemeId}" not found`)
  }

  return {
    background: { ...baseTokens.background, ...overrides.background },
    text: { ...baseTokens.text, ...overrides.text },
    interactive: { ...baseTokens.interactive, ...overrides.interactive },
    feedback: { ...baseTokens.feedback, ...overrides.feedback },
    typing: { ...baseTokens.typing, ...overrides.typing }
  }
}

/**
 * 팔레트를 사용하여 새로운 테마 생성
 * @param name 테마 이름
 * @param palette 컬러 팔레트
 * @returns 새로운 테마 토큰
 */
export function createThemeFromPalette(
  name: string,
  palette: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
  }
): ThemeTokens {
  return {
    background: {
      primary: palette.background,
      secondary: palette.surface,
      elevated: palette.surface
    },
    text: {
      primary: palette.text,
      secondary: palette.textSecondary,
      tertiary: adjustOpacity(palette.textSecondary, 0.7),
      inverse: getContrastColor(palette.primary)
    },
    interactive: {
      primary: palette.primary,
      primaryHover: adjustBrightness(palette.primary, 10),
      secondary: palette.secondary,
      secondaryHover: adjustBrightness(palette.secondary, 10),
      disabled: adjustOpacity(palette.text, 0.4)
    },
    feedback: {
      success: colorPalette.semantic.success[500],
      warning: colorPalette.semantic.warning[500],
      error: colorPalette.semantic.error[500],
      info: palette.accent
    },
    typing: {
      correct: colorPalette.semantic.success[500],
      incorrect: colorPalette.semantic.error[500],
      current: palette.text,
      cursor: palette.accent
    }
  }
}

// 색상 유틸리티 함수들
function adjustOpacity(color: string, opacity: number): string {
  // 간단한 구현 - 실제로는 더 정교한 색상 조작 라이브러리 사용 권장
  if (color.startsWith('#')) {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0')
  }
  return `${color}${Math.round(opacity * 100)}%`
}

function adjustBrightness(color: string, amount: number): string {
  // 간단한 구현 - 실제 프로덕션에서는 색상 라이브러리 사용 권장
  return color // 일단 원본 반환
}

function getContrastColor(color: string): string {
  // 간단한 구현 - 색상의 밝기에 따라 흰색 또는 검은색 반환
  return color.includes('f') ? '#000000' : '#ffffff'
}

// ===============================
// 10. 프리셋 테마 예제들
// ===============================

// 🌸 사쿠라 테마 예제
export const sakuraTheme = createThemeFromPalette('sakura', {
  primary: '#ff6b9d',
  secondary: '#c44569', 
  accent: '#f8b500',
  background: '#fff5f8',
  surface: '#ffffff',
  text: '#2c2c2c',
  textSecondary: '#666666'
})

// 🌊 오션 테마 예제  
export const oceanTheme = createThemeFromPalette('ocean', {
  primary: '#0066cc',
  secondary: '#4a90e2',
  accent: '#00d4aa', 
  background: '#f0f8ff',
  surface: '#ffffff',
  text: '#1a365d',
  textSecondary: '#4a5568'
})

// 🔥 파이어 테마 예제
export const fireTheme = createThemeFromBase('dark', {
  background: {
    primary: '#1a0f0a',
    secondary: '#2d1408', 
    elevated: '#441f0f'
  },
  interactive: {
    primary: '#ff4500',
    primaryHover: '#ff6b33',
    secondary: '#ff8c00',
    secondaryHover: '#ffa533', 
    disabled: '#666666'
  },
  typing: {
    correct: '#32cd32',
    incorrect: '#ff1744', 
    current: '#ffdd44',
    cursor: '#ff4500'
  }
})