import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Settings, TestMode, TextType } from '@/types'
import { applyTheme, getTheme } from '@/modules/themes'

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
  
  // 설정 리셋
  resetToDefaults: () => void
  
  // 테마 토글
  toggleTheme: () => void
}

const defaultSettings: Settings = {
  language: 'korean',
  theme: 'dark',
  testMode: 'time',
  testTarget: 60,          // 60초 기본
  textType: 'words',
  soundEnabled: false,
  showKeyboard: true,
  fontSize: 24
}

const defaultUISettings = {
  showSentences: false  // 기본적으로 문장 옵션 숨김
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // 기본 설정 값
      ...defaultSettings,
      ...defaultUISettings,

      // 언어 설정
      setLanguage: (language: string) => set({ language }),

      // 테마 설정
      setTheme: (theme: string) => {
        console.log('🎨 Setting theme:', theme)
        set({ theme })
        // DOM에 테마 적용
        if (typeof document !== 'undefined') {
          const themeData = getTheme(theme)
          console.log('🎨 Theme data:', themeData)
          if (themeData) {
            applyTheme(themeData)
            console.log('🎨 Theme applied successfully')
          } else {
            console.error('🎨 Theme not found:', theme)
          }
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

      // 기본값으로 리셋
      resetToDefaults: () => {
        set({ ...defaultSettings, ...defaultUISettings })
        if (typeof document !== 'undefined') {
          const themeData = getTheme(defaultSettings.theme)
          if (themeData) {
            applyTheme(themeData)
          }
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
      name: 'key-types-settings', // localStorage 키
    }
  )
)

// 클라이언트에서만 테마 적용
export const initializeTheme = () => {
  if (typeof window !== 'undefined') {
    const theme = useSettingsStore.getState().theme
    const themeData = getTheme(theme)
    if (themeData) {
      applyTheme(themeData)
    }
  }
}