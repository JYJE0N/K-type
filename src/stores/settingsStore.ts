import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Settings, TestMode, TextType } from '@/types'
import { applyThemeVariables } from '@/styles/theme-provider'
import type { ThemeId } from '@/styles/design-tokens'

interface SettingsStore extends Settings {
  // 설정 업데이트 액션
  setLanguage: (language: string) => void
  setTheme: (theme: string) => void
  setTestMode: (mode: TestMode) => void
  setTestTarget: (target: number) => void
  setTextType: (type: TextType) => void
  setSoundEnabled: (enabled: boolean) => void
  setShowKeyboard: (show: boolean) => void
  setFontSize: (size: number) => void
  
  // UI 표시 옵션
  showSentences: boolean
  setShowSentences: (show: boolean) => void
  
  // 고스트 모드 설정
  ghostModeEnabled: boolean
  setGhostModeEnabled: (enabled: boolean) => void
  
  // 타이핑 이펙트 설정
  typingEffectsEnabled: boolean
  setTypingEffectsEnabled: (enabled: boolean) => void
  
  // 설정 리셋
  resetToDefaults: () => void
  
  // 테마 토글
  toggleTheme: () => void
}

const defaultSettings: Settings = {
  language: 'korean',
  theme: 'light',
  testMode: 'time',
  testTarget: 60,          // 60초 기본
  textType: 'words',
  soundEnabled: false,
  showKeyboard: true,
  fontSize: 24
}

const defaultUISettings = {
  showSentences: false,  // 기본적으로 문장 옵션 숨김
  ghostModeEnabled: true, // 고스트 모드 기본 활성화
  typingEffectsEnabled: true // 타이핑 이펙트 기본 활성화
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // 기본 설정 값
      ...defaultSettings,
      ...defaultUISettings,

      // 언어 설정
      setLanguage: (language: string) => set({ language }),

      // 테마 설정 (새로운 디자인 토큰 시스템)
      setTheme: (theme: string) => {
        set({ theme })
        // 새로운 CSS Variables 기반 테마 적용
        if (typeof document !== 'undefined') {
          applyThemeVariables(theme as ThemeId)
          document.documentElement.setAttribute('data-theme-loaded', 'true')
        }
      },

      // 테스트 모드 설정
      setTestMode: (mode: TestMode) => {
        set({ 
          testMode: mode,
          // 모드에 따른 기본 목표값 설정
          testTarget: mode === 'time' ? 60 : 50
        })
      },

      // 테스트 목표 설정
      setTestTarget: (target: number) => set({ testTarget: target }),

      // 텍스트 타입 설정
      setTextType: (type: TextType) => set({ textType: type }),

      // 소리 설정
      setSoundEnabled: (enabled: boolean) => set({ soundEnabled: enabled }),

      // 키보드 표시 설정
      setShowKeyboard: (show: boolean) => set({ showKeyboard: show }),

      // 폰트 크기 설정
      setFontSize: (size: number) => {
        const clampedSize = Math.max(16, Math.min(32, size)) // 16-32px 범위
        set({ fontSize: clampedSize })
      },

      // 문장 옵션 표시 설정
      setShowSentences: (show: boolean) => set({ showSentences: show }),

      // 고스트 모드 설정
      setGhostModeEnabled: (enabled: boolean) => set({ ghostModeEnabled: enabled }),

      // 타이핑 이펙트 설정
      setTypingEffectsEnabled: (enabled: boolean) => set({ typingEffectsEnabled: enabled }),

      // 기본값으로 리셋
      resetToDefaults: () => {
        set({ ...defaultSettings, ...defaultUISettings })
        if (typeof document !== 'undefined') {
          applyThemeVariables(defaultSettings.theme as ThemeId)
          document.documentElement.setAttribute('data-theme-loaded', 'true')
        }
      },

      // 테마 토글 (다크 ↔ 라이트)
      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      }
    }),
    {
      name: 'typing-settings', // localStorage 키
    }
  )
)

// 클라이언트에서만 테마 적용
export const initializeTheme = () => {
  if (typeof window !== 'undefined') {
    const theme = useSettingsStore.getState().theme
    applyThemeVariables(theme as ThemeId)
    document.documentElement.setAttribute('data-theme-loaded', 'true')
  }
}