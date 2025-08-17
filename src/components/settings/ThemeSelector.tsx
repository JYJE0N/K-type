'use client'

import { useSettingsStore } from '@/stores/settingsStore'
import { themes } from '@/modules/themes'

export function ThemeSelector() {
  const { theme, setTheme } = useSettingsStore()

  // 테마별 그라데이션 및 스타일 정의
  const getThemeStyle = (themeId: string) => {
    switch (themeId) {
      case 'dark': 
        return {
          background: 'linear-gradient(135deg, #1a1b3a 0%, #ff69b4 100%)',
          border: '#ff69b4',
          shadow: '0 2px 8px rgba(255, 105, 180, 0.3)'
        }
      case 'light': 
        return {
          background: 'linear-gradient(135deg, #f8faf9 0%, #f472b6 100%)',
          border: '#f472b6',
          shadow: '0 2px 8px rgba(244, 114, 182, 0.3)'
        }
      case 'high-contrast': 
        return {
          background: 'linear-gradient(135deg, #0a0a0a 0%, #ff9f0a 100%)',
          border: '#ff9f0a',
          shadow: '0 2px 8px rgba(255, 159, 10, 0.4)'
        }
      default: 
        return {
          background: 'linear-gradient(135deg, #323437 0%, #e2b714 100%)',
          border: '#e2b714',
          shadow: '0 2px 8px rgba(226, 183, 20, 0.3)'
        }
    }
  }

  return (
    <div className="theme-selector">
      {/* 컴팩트 스와치 선택기 */}
      <div className="flex items-center gap-1 bg-background rounded-full p-1 border border-text-secondary border-opacity-20">
        {Object.values(themes).map((themeOption) => {
          const themeStyle = getThemeStyle(themeOption.id)
          const isSelected = theme === themeOption.id
          
          return (
            <button
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className={`
                relative w-8 h-8 rounded-full transition-all duration-200 ease-out
                ${isSelected 
                  ? 'scale-110 ring-2 ring-white ring-opacity-80' 
                  : 'hover:scale-105'
                }
              `}
              style={{
                background: themeStyle.background,
                boxShadow: isSelected ? themeStyle.shadow : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              title={themeOption.name}
              aria-label={`${themeOption.name} 테마로 변경`}
            >
              {/* 선택 상태 체크마크 */}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg 
                    className="w-3 h-3 text-white drop-shadow-sm" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}