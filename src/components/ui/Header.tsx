'use client'

import { useState } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { ThemeSelector } from '../settings/ThemeSelector'
import { LanguageSelector } from '../settings/LanguageSelector'
import { TestModeSelector } from '../settings/TestModeSelector'
import { TierBadge } from '../gamification/TierBadge'
import { Clock, Globe, Palette, FileText, BarChart3, User, Medal } from 'lucide-react'
import { calculateTier, calculateTierPoints, calculateLevel } from '@/utils/gamification'
import Link from 'next/link'

interface HeaderProps {
  className?: string
}

export function Header({ className = '' }: HeaderProps) {
  const { language, theme, testMode, testTarget, textType } = useSettingsStore()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  
  // 임시 사용자 데이터 (나중에 실제 데이터로 교체)
  const bestCPM = 280
  const currentTier = calculateTier(bestCPM)
  const tierPoints = calculateTierPoints(bestCPM, currentTier)
  const level = calculateLevel(1500)
  const badgeCount = 3

  // 언어 이름 매핑
  const getLanguageName = (lang: string) => {
    switch (lang) {
      case 'korean': return '한국어'
      case 'english': return 'English'
      default: return lang
    }
  }

  // 테마 이름 매핑
  const getThemeName = (themeId: string) => {
    switch (themeId) {
      case 'dark': return '다크'
      case 'light': return '라이트'
      case 'high-contrast': return '고대비'
      default: return themeId
    }
  }

  // 텍스트 타입 이름 매핑
  const getTextTypeName = (type: string) => {
    switch (type) {
      case 'words': return '단어'
      case 'punctuation': return '구두점'
      case 'numbers': return '숫자'
      case 'sentences': return '문장'
      default: return type
    }
  }

  return (
    <header className={`header ${className} bg-surface border-b border-text-secondary border-opacity-20 flex justify-center`}>
      <div className="w-full max-w-5xl" style={{ padding: 'var(--spacing-lg) var(--spacing-xl)' }}>
        {/* 메인 타이틀 */}
        <div className="text-center" style={{ marginBottom: 'var(--spacing-md)' }}>
          <h1 className="title-lg text-typing-accent font-korean">한글타입</h1>
        </div>

        {/* 간단한 설정 패널 */}
        <div className="flex justify-center">
          <div className="relative inline-flex items-center gap-4 px-6 py-3 bg-background bg-opacity-50 backdrop-blur-sm border border-white border-opacity-10 rounded-full">
            {/* 모드 토글 */}
            <div className="relative bg-background bg-opacity-30 rounded-full p-1 border border-white border-opacity-10">
              <div className="flex">
                <button
                  onClick={() => useSettingsStore.getState().setTestMode('time')}
                  className={`btn btn-sm ${
                    testMode === 'time'
                      ? 'btn-primary'
                      : 'btn-ghost'
                  }`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  시간
                </button>
                <button
                  onClick={() => useSettingsStore.getState().setTestMode('words')}
                  className={`btn btn-sm ${
                    testMode === 'words'
                      ? 'btn-primary'
                      : 'btn-ghost'
                  }`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  단어
                </button>
              </div>
            </div>

            {/* 목표 설정 */}
            <div className="relative">
              <div 
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredItem('target')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {testMode === 'time' ? (
                  <Clock className="w-4 h-4 text-typing-accent" />
                ) : (
                  <FileText className="w-4 h-4 text-typing-accent" />
                )}
                <span className="text-sm font-medium text-text-primary">
                  {testTarget}{testMode === 'time' ? '초' : '단어'}
                </span>
                
                {/* 호버 시 슬라이드 옵션들 */}
                <div className={`absolute top-1/2 left-full ml-2 -translate-y-1/2 transition-all duration-300 z-50 whitespace-nowrap ${
                  hoveredItem === 'target' 
                    ? 'opacity-100 visible translate-x-0' 
                    : 'opacity-0 invisible translate-x-2'
                }`}>
                  <div className="flex items-center gap-1 px-3 py-2 bg-surface bg-opacity-95 backdrop-blur-md border border-white border-opacity-20 rounded-lg shadow-xl">
                    {testMode === 'time' ? (
                      <>
                        {[15, 30, 60, 120].map(time => (
                          <button
                            key={time}
                            onClick={() => useSettingsStore.getState().setTestTarget(time)}
                            className={`btn btn-sm ${
                              testTarget === time
                                ? 'btn-primary'
                                : 'btn-ghost'
                            }`}
                          >
                            {time}초
                          </button>
                        ))}
                      </>
                    ) : (
                      <>
                        {[10, 25, 50, 100].map(words => (
                          <button
                            key={words}
                            onClick={() => useSettingsStore.getState().setTestTarget(words)}
                            className={`btn btn-sm ${
                              testTarget === words
                                ? 'btn-primary'
                                : 'btn-ghost'
                            }`}
                          >
                            {words}단어
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 언어 설정 */}
            <div className="relative">
              <div 
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredItem('language')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Globe className="w-4 h-4 text-typing-accent" />
                <span className="text-sm font-medium text-text-primary">
                  {getLanguageName(language)}
                </span>
                
                {/* 호버 시 슬라이드 옵션들 */}
                <div className={`absolute top-1/2 left-full ml-2 -translate-y-1/2 transition-all duration-300 z-50 whitespace-nowrap ${
                  hoveredItem === 'language' 
                    ? 'opacity-100 visible translate-x-0' 
                    : 'opacity-0 invisible translate-x-2'
                }`}>
                  <div className="flex items-center gap-1 px-3 py-2 bg-surface bg-opacity-95 backdrop-blur-md border border-white border-opacity-20 rounded-lg shadow-xl">
                    <button
                      onClick={() => useSettingsStore.getState().setLanguage('korean')}
                      className={`btn btn-sm ${
                        language === 'korean'
                          ? 'btn-primary'
                          : 'btn-ghost text-secondary'
                      }`}
                      style={{ fontWeight: language === 'korean' ? '600' : '400' }}
                    >
                      한국어
                    </button>
                    <button
                      onClick={() => useSettingsStore.getState().setLanguage('english')}
                      className={`btn btn-sm ${
                        language === 'english'
                          ? 'btn-primary'
                          : 'btn-ghost text-secondary'
                      }`}
                      style={{ fontWeight: language === 'english' ? '600' : '400' }}
                    >
                      English
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 텍스트 타입 설정 */}
            <div className="relative">
              <div 
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredItem('texttype')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <FileText className="w-4 h-4 text-typing-accent" />
                <span className="text-sm font-medium text-text-primary">
                  {getTextTypeName(textType)}
                </span>
                
                {/* 호버 시 슬라이드 옵션들 */}
                <div className={`absolute top-1/2 left-full ml-2 -translate-y-1/2 transition-all duration-300 z-50 whitespace-nowrap ${
                  hoveredItem === 'texttype' 
                    ? 'opacity-100 visible translate-x-0' 
                    : 'opacity-0 invisible translate-x-2'
                }`}>
                  <div className="flex items-center gap-1 px-3 py-2 bg-surface bg-opacity-95 backdrop-blur-md border border-white border-opacity-20 rounded-lg shadow-xl">
                    <button
                      onClick={() => useSettingsStore.getState().setTextType('words')}
                      className={`btn btn-sm ${
                        textType === 'words'
                          ? 'btn-primary'
                          : 'btn-ghost text-secondary'
                      }`}
                      style={{ fontWeight: textType === 'words' ? '600' : '400' }}
                    >
                      단어
                    </button>
                    <button
                      onClick={() => useSettingsStore.getState().setTextType('punctuation')}
                      className={`btn btn-sm ${
                        textType === 'punctuation'
                          ? 'btn-primary'
                          : 'btn-ghost text-secondary'
                      }`}
                      style={{ fontWeight: textType === 'punctuation' ? '600' : '400' }}
                    >
                      구두점
                    </button>
                    <button
                      onClick={() => useSettingsStore.getState().setTextType('numbers')}
                      className={`btn btn-sm ${
                        textType === 'numbers'
                          ? 'btn-primary'
                          : 'btn-ghost text-secondary'
                      }`}
                      style={{ fontWeight: textType === 'numbers' ? '600' : '400' }}
                    >
                      숫자
                    </button>
                    <button
                      onClick={() => useSettingsStore.getState().setTextType('sentences')}
                      className={`btn btn-sm ${
                        textType === 'sentences'
                          ? 'btn-primary'
                          : 'btn-ghost text-secondary'
                      }`}
                      style={{ fontWeight: textType === 'sentences' ? '600' : '400' }}
                    >
                      문장
                    </button>
                  </div>
                </div>
              </div>
            </div>


            {/* 테마 설정 */}
            <div className="relative">
              <div 
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredItem('theme')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Palette className="w-4 h-4 text-typing-accent" />
                <span className="text-sm font-medium text-text-primary">
                  {getThemeName(theme)}
                </span>
                
                {/* 호버 시 슬라이드 옵션들 */}
                <div className={`absolute top-1/2 left-full ml-2 -translate-y-1/2 transition-all duration-300 z-50 whitespace-nowrap ${
                  hoveredItem === 'theme' 
                    ? 'opacity-100 visible translate-x-0' 
                    : 'opacity-0 invisible translate-x-2'
                }`}>
                  <div className="flex items-center gap-1 px-3 py-2 bg-surface bg-opacity-95 backdrop-blur-md border border-white border-opacity-20 rounded-lg shadow-xl">
                    <button
                      onClick={() => useSettingsStore.getState().setTheme('dark')}
                      className={`btn btn-sm ${
                        theme === 'dark'
                          ? 'btn-primary'
                          : 'btn-ghost text-secondary'
                      }`}
                      style={{ fontWeight: theme === 'dark' ? '600' : '400' }}
                    >
                      다크
                    </button>
                    <button
                      onClick={() => useSettingsStore.getState().setTheme('light')}
                      className={`btn btn-sm ${
                        theme === 'light'
                          ? 'btn-primary'
                          : 'btn-ghost text-secondary'
                      }`}
                      style={{ fontWeight: theme === 'light' ? '600' : '400' }}
                    >
                      라이트
                    </button>
                    <button
                      onClick={() => useSettingsStore.getState().setTheme('high-contrast')}
                      className={`btn btn-sm ${
                        theme === 'high-contrast'
                          ? 'btn-primary'
                          : 'btn-ghost text-secondary'
                      }`}
                      style={{ fontWeight: theme === 'high-contrast' ? '600' : '400' }}
                    >
                      고대비
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </header>
  )
}