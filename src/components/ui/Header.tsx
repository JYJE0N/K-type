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
      <div className="w-full max-w-5xl px-6 py-6">
        {/* 메인 타이틀 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-typing-accent mb-2">K-Types</h1>
          <p className="text-sm text-text-secondary">한국어 타자연습</p>
        </div>

        {/* 간단한 설정 패널 */}
        <div className="flex justify-center">
          <div className="relative inline-flex items-center gap-4 px-6 py-3 bg-background bg-opacity-50 backdrop-blur-sm border border-white border-opacity-10 rounded-full">
            {/* 모드 토글 */}
            <div className="relative bg-background bg-opacity-30 rounded-full p-1 border border-white border-opacity-10">
              <div className="flex">
                <button
                  onClick={() => useSettingsStore.getState().setTestMode('time')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    testMode === 'time'
                      ? 'bg-typing-accent text-background shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  시간
                </button>
                <button
                  onClick={() => useSettingsStore.getState().setTestMode('words')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    testMode === 'words'
                      ? 'bg-typing-accent text-background shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
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
                            className={`px-3 py-1 text-xs rounded transition-colors ${
                              testTarget === time
                                ? 'bg-typing-accent text-background'
                                : 'text-text-secondary hover:text-text-primary hover:bg-white hover:bg-opacity-5'
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
                            className={`px-3 py-1 text-xs rounded transition-colors ${
                              testTarget === words
                                ? 'bg-typing-accent text-background'
                                : 'text-text-secondary hover:text-text-primary hover:bg-white hover:bg-opacity-5'
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
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        language === 'korean'
                          ? 'bg-typing-accent text-background'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white hover:bg-opacity-5'
                      }`}
                    >
                      한국어
                    </button>
                    <button
                      onClick={() => useSettingsStore.getState().setLanguage('english')}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        language === 'english'
                          ? 'bg-typing-accent text-background'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white hover:bg-opacity-5'
                      }`}
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
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        textType === 'words'
                          ? 'bg-typing-accent text-background'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white hover:bg-opacity-5'
                      }`}
                    >
                      단어
                    </button>
                    <button
                      onClick={() => useSettingsStore.getState().setTextType('punctuation')}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        textType === 'punctuation'
                          ? 'bg-typing-accent text-background'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white hover:bg-opacity-5'
                      }`}
                    >
                      구두점
                    </button>
                    <button
                      onClick={() => useSettingsStore.getState().setTextType('numbers')}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        textType === 'numbers'
                          ? 'bg-typing-accent text-background'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white hover:bg-opacity-5'
                      }`}
                    >
                      숫자
                    </button>
                    <button
                      onClick={() => useSettingsStore.getState().setTextType('sentences')}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        textType === 'sentences'
                          ? 'bg-typing-accent text-background'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white hover:bg-opacity-5'
                      }`}
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
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        theme === 'dark'
                          ? 'bg-typing-accent text-background'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white hover:bg-opacity-5'
                      }`}
                    >
                      다크
                    </button>
                    <button
                      onClick={() => useSettingsStore.getState().setTheme('light')}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        theme === 'light'
                          ? 'bg-typing-accent text-background'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white hover:bg-opacity-5'
                      }`}
                    >
                      라이트
                    </button>
                    <button
                      onClick={() => useSettingsStore.getState().setTheme('high-contrast')}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        theme === 'high-contrast'
                          ? 'bg-typing-accent text-background'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white hover:bg-opacity-5'
                      }`}
                    >
                      고대비
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 통계 링크 */}
            <Link 
              href="/stats"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-all duration-200"
            >
              <BarChart3 className="w-4 h-4 text-typing-accent" />
              <span className="text-sm font-medium text-text-primary">통계</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}