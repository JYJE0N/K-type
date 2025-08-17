'use client'

import { useSettingsStore } from '@/stores/settingsStore'
import { languagePacks } from '@/modules/languages'

export function LanguageSelector() {
  const { language, setLanguage } = useSettingsStore()

  const currentLanguagePack = languagePacks[language]

  return (
    <div className="language-selector">
      {/* 현재 언어 표시 */}
      <div className="hidden sm:flex items-center space-x-2">
        <span className="text-sm text-text-secondary">언어:</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="appearance-none bg-surface border border-text-secondary border-opacity-20 rounded px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-typing-accent transition-colors"
        >
          {Object.values(languagePacks).map((pack) => (
            <option 
              key={pack.id} 
              value={pack.id}
              className="bg-surface text-text-primary"
            >
              {pack.name}
            </option>
          ))}
        </select>
        
        {/* 커스텀 화살표 */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 모바일용 간단 표시 */}
      <div className="sm:hidden">
        <button
          className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded"
          title={`현재 언어: ${currentLanguagePack?.name || language}`}
        >
          {language === 'korean' ? '한' : language === 'english' ? 'EN' : '🌐'}
        </button>
      </div>
    </div>
  )
}