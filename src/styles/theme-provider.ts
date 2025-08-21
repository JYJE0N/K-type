/**
 * 테마별 CSS Variables 관리
 * Tailwind와 연동되는 런타임 테마 시스템
 */

import { themeTokenMap, type ThemeId, type ThemeTokens } from './design-tokens'

/**
 * CSS 변수를 DOM에 적용하는 함수
 */
export function applyThemeVariables(themeId: ThemeId) {
  if (typeof document === 'undefined') return

  const tokens = themeTokenMap[themeId]
  if (!tokens) {
    console.warn(`Theme "${themeId}" not found`)
    return
  }

  const root = document.documentElement

  // 🎨 모든 디자인 토큰을 CSS 변수로 적용
  setCSSVariables(root, {
    // 배경 컬러 (토큰 기반)
    '--color-background': tokens.background.primary,
    '--color-background-secondary': tokens.background.secondary,
    '--color-background-elevated': tokens.background.elevated,
    '--color-surface': tokens.background.secondary,
    '--color-elevated': tokens.background.elevated,

    // 텍스트 컬러 (토큰 기반)
    '--color-text-primary': tokens.text.primary,
    '--color-text-secondary': tokens.text.secondary,
    '--color-text-tertiary': tokens.text.tertiary,
    '--color-text-inverse': tokens.text.inverse,

    // 상호작용 컬러 (토큰 기반)
    '--color-interactive-primary': tokens.interactive.primary,
    '--color-interactive-primary-hover': tokens.interactive.primaryHover,
    '--color-interactive-secondary': tokens.interactive.secondary,
    '--color-interactive-secondary-hover': tokens.interactive.secondaryHover,
    '--color-interactive-disabled': tokens.interactive.disabled,

    // 피드백 컬러 (토큰 기반)
    '--color-feedback-success': tokens.feedback.success,
    '--color-feedback-warning': tokens.feedback.warning,
    '--color-feedback-error': tokens.feedback.error,
    '--color-feedback-info': tokens.feedback.info,

    // 타이핑 특화 컬러 (토큰 기반)
    '--color-typing-correct': tokens.typing.correct,
    '--color-typing-incorrect': tokens.typing.incorrect,
    '--color-typing-current': tokens.typing.current,
    '--color-typing-cursor': tokens.typing.cursor,
  })

  // 테마 ID를 데이터 어트리뷰트로 설정 (CSS 선택자용)
  root.setAttribute('data-theme', themeId)
  
  // 은밀모드 여부 설정
  if (themeId.startsWith('stealth')) {
    root.setAttribute('data-stealth', 'true')
  } else {
    root.removeAttribute('data-stealth')
  }

  console.log(`🎨 테마 적용됨: ${themeId}`)
}

/**
 * CSS 변수 헬퍼 함수
 */
function setCSSVariables(element: HTMLElement, variables: Record<string, string>) {
  Object.entries(variables).forEach(([property, value]) => {
    element.style.setProperty(property, value)
  })
}

/**
 * 현재 테마의 토큰 가져오기
 */
export function getThemeTokens(themeId: ThemeId): ThemeTokens | null {
  return themeTokenMap[themeId] || null
}

/**
 * 사용 가능한 모든 테마 ID 목록
 */
export function getAvailableThemes(): ThemeId[] {
  return Object.keys(themeTokenMap) as ThemeId[]
}

/**
 * 테마 그룹별 분류
 */
export function getThemesByCategory() {
  const themes = getAvailableThemes()
  
  return {
    standard: themes.filter(id => !id.startsWith('stealth')),
    stealth: themes.filter(id => id.startsWith('stealth'))
  }
}

/**
 * 테마 메타데이터
 */
export const themeMetadata = {
  dark: {
    name: '🌙 클래식 다크',
    description: '보랏빛 네이비와 핑크 액센트',
    category: 'standard'
  },
  light: {
    name: '☀️ 클린 라이트', 
    description: '민트 그린과 소프트 블루',
    category: 'standard'
  },
  'high-contrast': {
    name: '⚡ 고대비',
    description: '최고 가독성을 위한 대비',
    category: 'standard'
  },
  stealth: {
    name: '📋 업무용 칸반보드',
    description: 'Trello/Monday.com 스타일',
    category: 'stealth'
  },
  'stealth-docs': {
    name: '📝 문서 작성 모드',
    description: 'Google Docs 스타일',
    category: 'stealth'
  },
  'stealth-slack': {
    name: '💬 팀 커뮤니케이션',
    description: 'Slack 메신저 스타일',
    category: 'stealth'
  }
} as const

/**
 * 시스템 테마 감지
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * 시스템 테마 변경 감지
 */
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void) {
  if (typeof window === 'undefined') return () => {}

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light')
  }
  
  mediaQuery.addEventListener('change', handler)
  
  return () => {
    mediaQuery.removeEventListener('change', handler)
  }
}