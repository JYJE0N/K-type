"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTypingStore } from '@/stores/typingStore'
import { useStatsStore } from '@/stores/statsStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { 
  FileText, 
  Share, 
  Download, 
  MoreVertical, 
  Edit3, 
  Eye,
  MessageCircle,
  Clock,
  BarChart3,
  Settings
} from 'lucide-react'

interface StealthDocsProps {
  className?: string
}

export function StealthDocs({ className = "" }: StealthDocsProps) {
  const router = useRouter()
  const { isActive, isCompleted, targetText, currentIndex, mistakes } = useTypingStore()
  const { liveStats } = useStatsStore()
  const { theme } = useSettingsStore()
  
  const [currentTime, setCurrentTime] = useState('')
  const [cursorBlink, setCursorBlink] = useState(true)
  
  // 실시간 시간 업데이트
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // 커서 깜박임 효과
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorBlink(prev => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])
  
  // 진행률 계산
  const completionRate = targetText.length > 0 ? (currentIndex / targetText.length) * 100 : 0
  
  // 홈으로 돌아가기 핸들러
  const handleHomeNavigation = () => {
    router.push('/')
  }
  
  // 가짜 문서 내용
  const documentTitle = isActive || isCompleted 
    ? "2024년 4분기 사업계획서" 
    : "마케팅 전략 기획안"
    
  const fakeDocumentContent = `
회의록: 팀 프로젝트 진행사항 논의

일시: 2024년 8월 20일 ${currentTime}
참석자: 김철수, 박영희, 이민수, 정수진

1. 주요 안건
   - 3분기 목표 달성률 검토
   - 신규 프로젝트 일정 조율
   - 클라이언트 피드백 반영 사항

2. 논의 내용
   현재 진행 중인 프로젝트의 완료율은 ${Math.round(completionRate)}%입니다.
   
   팀원들의 작업 효율성이 크게 향상되었으며, 특히 문서 작성 속도가 
   분당 ${liveStats.cpm}자로 측정되어 목표치를 상회하고 있습니다.
   
   정확도 또한 ${liveStats.accuracy}%로 매우 우수한 수준을 유지하고 있어,
   품질 관리 측면에서도 긍정적인 결과를 보이고 있습니다.

3. 다음 액션 아이템
   - 프로젝트 일정 재검토
   - 품질 관리 프로세스 개선
   - 팀 협업 도구 업그레이드

`.trim()

  // 실제 타이핑 텍스트를 문서에 자연스럽게 삽입
  const renderDocumentWithTyping = () => {
    if (!isActive && !isCompleted) {
      return fakeDocumentContent.split('\n').map((line, index) => (
        <p key={index} className="mb-4 leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
          {line}
        </p>
      ))
    }

    // 타이핑 중이거나 완료된 경우
    const lines = fakeDocumentContent.split('\n')
    const typingInsertIndex = 12 // "팀원들의 작업 효율성..." 라인 다음

    return lines.map((line, index) => {
      if (index === typingInsertIndex) {
        return (
          <div key={index} className="mb-4">
            <p className="leading-relaxed mb-2" style={{ color: 'var(--color-text-primary)' }}>{line}</p>
            <div className="border-l-4 p-4 my-4 rounded-r" 
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-interactive-primary) 5%, transparent)',
                borderColor: 'var(--color-interactive-primary)' 
              }}>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-interactive-primary)' }}>
                [실시간 입력 중인 내용]
              </p>
              <div className="font-mono text-sm p-3 rounded leading-relaxed" 
                style={{ backgroundColor: 'var(--color-background-elevated)', border: '1px solid var(--color-border)' }}>
                {targetText.split('').map((char, charIndex) => {
                  const isCurrentChar = charIndex === currentIndex
                  const isTyped = charIndex < currentIndex
                  const isIncorrect = mistakes.some(m => m.position === charIndex)
                  
                  return (
                    <span
                      key={charIndex}
                      className={
                        isTyped
                          ? isIncorrect 
                            ? 'text-red-600 bg-red-50 border-b border-red-300'
                            : 'text-gray-900'
                          : isCurrentChar
                          ? `bg-blue-500 text-white ${cursorBlink ? 'opacity-100' : 'opacity-70'} px-0.5 rounded`
                          : 'text-gray-400'
                      }
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  )
                })}
                {currentIndex >= targetText.length && (
                  <span className={`inline-block w-0.5 h-5 bg-blue-500 ml-1 ${cursorBlink ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                )}
              </div>
            </div>
          </div>
        )
      }
      
      return (
        <p key={index} className="mb-4 leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
          {line}
        </p>
      )
    })
  }

  return (
    <div className={`min-h-screen ${className}`} style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Google Docs 스타일 헤더 */}
      <div style={{ backgroundColor: 'var(--color-background-secondary)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div 
                className="cursor-pointer transition-opacity hover:opacity-80" 
                onClick={handleHomeNavigation}
                title="홈으로 돌아가기"
              >
                <FileText 
                  className="w-8 h-8" 
                  style={{ color: 'var(--color-interactive-primary)' }}
                />
              </div>
              <div>
                <h1 
                  className="text-lg font-normal cursor-pointer transition-opacity hover:opacity-80" 
                  style={{ color: 'var(--color-text-primary)' }}
                  onClick={handleHomeNavigation}
                  title="홈으로 돌아가기"
                >
                  {documentTitle}
                </h1>
                <div className="flex items-center space-x-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  <Clock size={12} />
                  <span>마지막 수정: 방금 전</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded transition-colors" 
              style={{ backgroundColor: 'var(--color-interactive-primary)', color: 'var(--color-text-inverse)' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-interactive-primary-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-interactive-primary)'}>
              <Share size={14} />
              <span>공유</span>
            </button>
            {/* 숨겨진 통계 버튼 */}
            <button 
              className="p-2 rounded transition-colors" 
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => router.push('/stats')}
              title="통계 보기"
            >
              <BarChart3 size={16} />
            </button>
            
            <button className="p-2 rounded transition-colors" 
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <Download size={16} />
            </button>
            
            {/* 숨겨진 설정 버튼 */}
            <button className="p-2 rounded transition-colors" 
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="설정"
            >
              <Settings size={16} />
            </button>
            
            <button className="p-2 rounded transition-colors" 
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <MoreVertical size={16} />
            </button>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              김
            </div>
          </div>
        </div>
        
        {/* 툴바 */}
        <div className="flex items-center space-x-1 px-4 py-2" 
          style={{ borderTop: '1px solid var(--color-border-light)', backgroundColor: 'var(--color-surface)' }}>
          <button className="flex items-center space-x-1 px-2 py-1 text-sm rounded transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <Edit3 size={14} />
            <span>편집</span>
          </button>
          <button className="flex items-center space-x-1 px-2 py-1 text-sm rounded transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <Eye size={14} />
            <span>보기</span>
          </button>
          <button className="flex items-center space-x-1 px-2 py-1 text-sm rounded transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <MessageCircle size={14} />
            <span>댓글</span>
          </button>
          
          <div className="flex-1" />
          
          {/* 실시간 상태 */}
          {isActive && (
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>편집 중...</span>
            </div>
          )}
        </div>
      </div>

      {/* 문서 본문 */}
      <div className="max-w-4xl mx-auto py-8 px-8 min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="shadow-sm rounded-lg p-12 min-h-[800px]" 
          style={{ backgroundColor: 'var(--color-background-elevated)', border: '1px solid var(--color-border)' }}>
          {renderDocumentWithTyping()}
          
          {/* 페이지 번호 */}
          <div className="text-center text-sm mt-8 pt-4" 
            style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border-light)' }}>
            페이지 1
          </div>
        </div>
        
        {/* 사이드바 - 통계 (숨김) */}
        {(isActive || isCompleted) && (
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-64 rounded-lg shadow-lg p-4" 
            style={{ backgroundColor: 'var(--color-background-elevated)', border: '1px solid var(--color-border)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>문서 작성 통계</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-text-secondary)' }}>작성 속도</span>
                <span className="font-medium" style={{ color: 'var(--color-interactive-primary)' }}>{liveStats.cpm} CPM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-text-secondary)' }}>정확도</span>
                <span className="font-medium" style={{ color: 'var(--color-feedback-success)' }}>{liveStats.accuracy}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-text-secondary)' }}>경과 시간</span>
                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{Math.round(liveStats.timeElapsed)}초</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-text-secondary)' }}>진행률</span>
                <span className="font-medium" style={{ color: 'var(--color-interactive-secondary)' }}>{Math.round(completionRate)}%</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                실시간 문서 협업 중
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}