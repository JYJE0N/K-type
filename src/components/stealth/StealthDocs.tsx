"use client"

import { useEffect, useState } from 'react'
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
  Clock
} from 'lucide-react'

interface StealthDocsProps {
  className?: string
}

export function StealthDocs({ className = "" }: StealthDocsProps) {
  const { isActive, isCompleted, targetText, currentIndex } = useTypingStore()
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
  
  // 가짜 문서 내용
  const documentTitle = isActive || isCompleted 
    ? "2024년 3분기 프로젝트 진행 보고서" 
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
        <p key={index} className="mb-4 leading-relaxed text-gray-800">
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
            <p className="leading-relaxed text-gray-800 mb-2">{line}</p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 rounded-r">
              <p className="text-sm text-blue-800 font-medium mb-2">
                [실시간 입력 중인 내용]
              </p>
              <div className="font-mono text-sm bg-white p-3 rounded border">
                {targetText.split('').map((char, charIndex) => {
                  const isCurrentChar = charIndex === currentIndex
                  const isTyped = charIndex < currentIndex
                  
                  return (
                    <span
                      key={charIndex}
                      className={
                        isTyped
                          ? 'text-gray-900'
                          : isCurrentChar
                          ? `bg-blue-500 text-white ${cursorBlink ? 'opacity-100' : 'opacity-50'}`
                          : 'text-gray-300'
                      }
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  )
                })}
                {currentIndex >= targetText.length && (
                  <span className={`inline-block w-0.5 h-5 bg-blue-500 ml-1 ${cursorBlink ? 'opacity-100' : 'opacity-0'}`} />
                )}
              </div>
            </div>
          </div>
        )
      }
      
      return (
        <p key={index} className="mb-4 leading-relaxed text-gray-800">
          {line}
        </p>
      )
    })
  }

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {/* Google Docs 스타일 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-lg font-normal text-gray-800">{documentTitle}</h1>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>마지막 수정: 방금 전</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              <Share size={14} />
              <span>공유</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Download size={16} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <MoreVertical size={16} className="text-gray-600" />
            </button>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              김
            </div>
          </div>
        </div>
        
        {/* 툴바 */}
        <div className="flex items-center space-x-1 px-4 py-2 border-t border-gray-100 bg-gray-50">
          <button className="flex items-center space-x-1 px-2 py-1 text-sm hover:bg-gray-200 rounded">
            <Edit3 size={14} />
            <span>편집</span>
          </button>
          <button className="flex items-center space-x-1 px-2 py-1 text-sm hover:bg-gray-200 rounded">
            <Eye size={14} />
            <span>보기</span>
          </button>
          <button className="flex items-center space-x-1 px-2 py-1 text-sm hover:bg-gray-200 rounded">
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
      <div className="max-w-4xl mx-auto py-8 px-8 bg-white min-h-screen">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-12 min-h-[800px]">
          {renderDocumentWithTyping()}
          
          {/* 페이지 번호 */}
          <div className="text-center text-sm text-gray-400 mt-8 pt-4 border-t border-gray-100">
            페이지 1
          </div>
        </div>
        
        {/* 사이드바 - 통계 (숨김) */}
        {(isActive || isCompleted) && (
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">문서 작성 통계</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">작성 속도</span>
                <span className="font-medium text-blue-600">{liveStats.cpm} CPM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">정확도</span>
                <span className="font-medium text-green-600">{liveStats.accuracy}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">경과 시간</span>
                <span className="font-medium">{Math.round(liveStats.timeElapsed)}초</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">진행률</span>
                <span className="font-medium text-purple-600">{Math.round(completionRate)}%</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                실시간 문서 협업 중
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}