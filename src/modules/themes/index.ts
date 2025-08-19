import { Theme } from '@/types'

export const themes: Record<string, Theme> = {
  dark: {
    id: 'dark',
    name: 'Classic Dark',
    colors: {
      background: '#1a1b3a',     // 배경 네이비 (보랏빛)
      surface: '#2a2d5a',       // 서피스 조금 더 밝은 네이비
      text: '#c8b5db',          // 일반폰트 옅은 보라
      textSecondary: '#c084fc',  // 서브 컬러 연보라
      correct: '#da70d6',       // 정답 밝은 보라/오키드
      incorrect: '#ff1744',     // 오타 네온 핑크
      current: '#c8b5db',       // 현재 문자 옅은 보라
      accent: '#ff69b4'         // 액센트 핫핑크 (덜 붉음)
    }
  },
  
  light: {
    id: 'light',
    name: 'Clean Light',
    colors: {
      background: '#f8faf9',     // 매우 연한 민트 화이트 배경
      surface: '#e8f5f0',       // 연한 민트 그린 서피스
      text: '#2d5a41',          // 진한 민트 그린 텍스트
      textSecondary: '#a855f7',  // 서브 컬러 연보라
      correct: '#10b981',       // 에메랄드 그린 (정답)
      incorrect: '#f472b6',     // 핑크 (오타)
      current: '#2d5a41',       // 현재 문자 진한 민트
      accent: '#f472b6'         // 핑크 (액센트)
    }
  },
  
  'high-contrast': {
    id: 'high-contrast',
    name: 'High Contrast',
    colors: {
      background: '#0a0a0a',     // 딥 블랙
      surface: '#1c1c1e',       // 다크 그레이 서피스
      text: '#ffffff',          // 순백색 텍스트
      textSecondary: '#e9d5ff',  // 서브 컬러 연보라
      correct: '#32d74b',       // 네온 그린 (정답)
      incorrect: '#ff453a',     // 네온 레드 (오타)
      current: '#ffffff',       // 현재 문자 화이트
      accent: '#ff9f0a'         // 네온 오렌지 (액센트)
    }
  }
}

export const getTheme = (themeId: string): Theme | null => {
  return themes[themeId] || null
}

export const getAvailableThemes = (): string[] => {
  return Object.keys(themes)
}

// 테마를 CSS 변수로 적용하는 함수
export const applyTheme = (theme: Theme): void => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.style.setProperty('--background', theme.colors.background)
  root.style.setProperty('--surface', theme.colors.surface)
  root.style.setProperty('--text-primary', theme.colors.text)
  root.style.setProperty('--text-secondary', theme.colors.textSecondary)
  root.style.setProperty('--color-correct', theme.colors.correct)
  root.style.setProperty('--color-incorrect', theme.colors.incorrect)
  root.style.setProperty('--color-current', theme.colors.current)
  root.style.setProperty('--color-accent', theme.colors.accent)
  
  root.setAttribute('data-theme', theme.id)
}

export type { Theme }