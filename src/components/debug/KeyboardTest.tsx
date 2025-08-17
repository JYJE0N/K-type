'use client'

import { useState, useCallback } from 'react'

export function KeyboardTest() {
  const [logs, setLogs] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key, code, keyCode, which, location } = event
    addLog(`KeyDown - key: "${key}", code: "${code}", keyCode: ${keyCode}, which: ${which}, location: ${location}`)
  }, [addLog])

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    const { key, code, keyCode, which } = event
    addLog(`KeyPress - key: "${key}", code: "${code}", keyCode: ${keyCode}, which: ${which}`)
  }, [addLog])

  const handleInput = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    const value = target.value
    addLog(`Input - value: "${value}", length: ${value.length}`)
    setInputValue(value)
  }, [addLog])

  const handleCompositionStart = useCallback(() => {
    addLog('CompositionStart - IME 조합 시작')
  }, [addLog])

  const handleCompositionUpdate = useCallback((event: React.CompositionEvent) => {
    addLog(`CompositionUpdate - data: "${event.data}"`)
  }, [addLog])

  const handleCompositionEnd = useCallback((event: React.CompositionEvent) => {
    addLog(`CompositionEnd - data: "${event.data}"`)
  }, [addLog])

  const clearLogs = () => setLogs([])
  const clearInput = () => setInputValue('')

  // 키보드 레이아웃 감지
  const detectLayout = useCallback(() => {
    if (typeof navigator !== 'undefined') {
      addLog(`Navigator language: ${navigator.language}`)
      addLog(`Navigator languages: ${navigator.languages?.join(', ')}`)
      addLog(`Platform: ${navigator.platform}`)
      addLog(`User agent: ${navigator.userAgent}`)
      
      // @ts-expect-error - Keyboard API is experimental
      if (navigator.keyboard) {
        // @ts-expect-error - Keyboard API is experimental
        navigator.keyboard.getLayoutMap().then((layoutMap: KeyboardLayoutMap) => {
          addLog(`Keyboard layout detected`)
          addLog(`Q key: ${layoutMap.get('KeyQ')}`)
          addLog(`A key: ${layoutMap.get('KeyA')}`)
        }).catch(() => {
          addLog('Keyboard layout API not supported')
        })
      } else {
        addLog('Keyboard API not supported')
      }
    }
  }, [addLog])

  return (
    <div className="keyboard-test p-6 bg-surface rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-typing-accent">키보드 입력 테스트</h3>
      
      <div className="space-y-4">
        {/* 테스트 입력 필드 */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            여기에 한글을 입력해보세요 (예: 안녕하세요)
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={() => {}} // input 이벤트로만 처리
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onKeyPress={handleKeyPress}
            onCompositionStart={handleCompositionStart}
            onCompositionUpdate={handleCompositionUpdate}
            onCompositionEnd={handleCompositionEnd}
            className="w-full p-3 bg-background border border-text-secondary border-opacity-20 rounded text-text-primary"
            placeholder="한글 입력 테스트..."
          />
          <div className="text-xs text-text-secondary mt-1">
            현재 값: &quot;{inputValue}&quot; (길이: {inputValue.length})
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex space-x-2">
          <button
            onClick={detectLayout}
            className="px-3 py-1 bg-typing-accent text-background rounded text-sm"
          >
            키보드 정보 확인
          </button>
          <button
            onClick={clearInput}
            className="px-3 py-1 bg-surface border border-text-secondary border-opacity-20 rounded text-sm"
          >
            입력 지우기
          </button>
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-surface border border-text-secondary border-opacity-20 rounded text-sm"
          >
            로그 지우기
          </button>
        </div>

        {/* 이벤트 로그 */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-2">이벤트 로그:</h4>
          <div className="bg-background p-3 rounded max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-text-secondary text-sm">아무 키나 입력해보세요</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs text-text-secondary mb-1 font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 도움말 */}
        <div className="text-xs text-text-secondary">
          <p><strong>테스트 방법:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>한글 입력: &quot;안녕&quot;, &quot;하세요&quot; 등을 천천히 입력</li>
            <li>영어 입력: &quot;hello&quot; 등을 입력</li>
            <li>특수문자: &quot;!&quot;, &quot;@&quot;, &quot;#&quot; 등을 입력</li>
            <li>숫자: &quot;123&quot; 등을 입력</li>
          </ul>
          <p className="mt-2"><strong>확인할 점:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>CompositionStart/End 이벤트가 발생하는가?</li>
            <li>Input 이벤트에서 완성된 한글이 나오는가?</li>
            <li>키보드 레이아웃이 2벌식인가 3벌식인가?</li>
          </ul>
        </div>
      </div>
    </div>
  )
}