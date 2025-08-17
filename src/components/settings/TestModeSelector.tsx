'use client'

import { useSettingsStore } from '@/stores/settingsStore'
import { TextType } from '@/types'

export function TestModeSelector() {
  const { 
    testMode, 
    setTestMode, 
    testTarget, 
    setTestTarget, 
    textType, 
    setTextType 
  } = useSettingsStore()

  const timeOptions = [15, 30, 60, 120, 300] // 초
  const wordOptions = [10, 25, 50, 100] // 단어
  
  const textTypeOptions: { value: TextType; label: string }[] = [
    { value: 'words', label: '단어' },
    { value: 'punctuation', label: '구두점' },
    { value: 'numbers', label: '숫자' },
    { value: 'sentences', label: '문장' }
  ]

  return (
    <div className="test-mode-selector">
      <div className="flex items-center space-x-2">
        {/* 테스트 모드 선택 */}
        <div className="flex bg-surface rounded-lg p-1">
          <button
            onClick={() => setTestMode('time')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              testMode === 'time' 
                ? 'bg-typing-accent text-background' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            시간
          </button>
          <button
            onClick={() => setTestMode('words')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              testMode === 'words' 
                ? 'bg-typing-accent text-background' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            단어
          </button>
        </div>

        {/* 목표값 선택 */}
        <select
          value={testTarget}
          onChange={(e) => setTestTarget(Number(e.target.value))}
          className="appearance-none bg-surface border border-text-secondary border-opacity-20 rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-typing-accent transition-colors"
        >
          {(testMode === 'time' ? timeOptions : wordOptions).map((option) => (
            <option key={option} value={option} className="bg-surface text-text-primary">
              {option}{testMode === 'time' ? '초' : '단어'}
            </option>
          ))}
        </select>

        {/* 텍스트 타입 선택 (데스크톱에서만) */}
        <select
          value={textType}
          onChange={(e) => setTextType(e.target.value as TextType)}
          className="hidden sm:block appearance-none bg-surface border border-text-secondary border-opacity-20 rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-typing-accent transition-colors"
        >
          {textTypeOptions.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              className="bg-surface text-text-primary"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 모바일용 확장 설정 */}
      <div className="sm:hidden mt-2">
        <details className="group">
          <summary className="cursor-pointer text-xs text-text-secondary hover:text-text-primary transition-colors">
            텍스트 타입: {textTypeOptions.find(t => t.value === textType)?.label}
          </summary>
          <div className="mt-2 flex flex-wrap gap-1">
            {textTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTextType(option.value)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  textType === option.value
                    ? 'bg-typing-accent text-background'
                    : 'bg-surface text-text-secondary hover:text-text-primary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  )
}