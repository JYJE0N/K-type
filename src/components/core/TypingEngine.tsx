"use client";

import { useEffect } from "react";
import { TypingTestUI } from "./TypingTestUI";
import { useTypingTestController } from "./TypingTestController";
import { useTypingTimer } from "./TypingTimer";
import { useTestCompletionHandler } from "./TestCompletionHandler";
import { useTypingStore } from "@/stores/typingStore";

interface TypingEngineProps {
  className?: string;
}

/**
 * 타이핑 엔진 오케스트레이터 - 모든 로직을 조합하는 메인 컴포넌트
 * 책임: 컨트롤러들을 조합하고 UI에 props 전달
 */
export function TypingEngine({ className = "" }: TypingEngineProps) {
  
  // 핵심 컨트롤러들
  const controller = useTypingTestController();
  const { 
    showPromotionModal, 
    promotionData, 
    closePromotionModal, 
    handleContinueTest,
    handleViewStats,
    getWordProgress,
    handleTestCompletion 
  } = useTestCompletionHandler();
  
  const timer = useTypingTimer(handleTestCompletion);

  // 초기 텍스트 생성
  useEffect(() => {
    if (!controller.targetText) {
      controller.handleRestart();
    }
  }, [controller.targetText, controller.handleRestart]);

  // 테스트 완료 시 처리는 TestCompletionHandler에서 담당
  // (중복 제거: controller.handleTestCompletion은 더 이상 호출하지 않음)

  // 글로벌 키보드 단축키 처리
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // ESC 키: 일시정지
      if (event.key === 'Escape') {
        event.preventDefault();
        if (controller.isActive && !controller.isPaused) {
          controller.pauseTest();
        }
        return;
      }

      // Shift + Enter: 새로고침
      if (event.shiftKey && event.key === 'Enter') {
        event.preventDefault();
        controller.handleRestart();
        return;
      }

      // 테스트 시작 (아무 키)
      if (!controller.isActive && !controller.isCompleted && !controller.isCountingDown) {
        // 특수키는 제외 (Shift, Ctrl, Alt, Meta, Tab, F1-F12 등)
        if (!event.ctrlKey && !event.altKey && !event.metaKey && 
            !['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock', 'ContextMenu'].includes(event.key) &&
            !event.key.startsWith('F')) {
          event.preventDefault();
          controller.handleStart();
          return;
        }
      }

      // 일시정지 상태에서 아무 키로 재개
      if (controller.isPaused) {
        if (!event.ctrlKey && !event.altKey && !event.metaKey && 
            !['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock', 'ContextMenu'].includes(event.key) &&
            !event.key.startsWith('F')) {
          event.preventDefault();
          controller.resumeTest();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [controller]);

  return (
    <TypingTestUI
      // 상태 전달
      targetText={controller.targetText}
      currentIndex={controller.currentIndex}
      userInput={controller.userInput}
      mistakes={controller.mistakes.map(m => m.position)}
      
      // 타이머 관련
      currentTime={timer.currentTime}
      getRemainingTime={timer.getRemainingTime}
      getTimeProgress={timer.getTimeProgress}
      getFormattedTime={timer.getFormattedTime}
      
      // 완료 처리 관련
      getWordProgress={getWordProgress}
      showPromotionModal={showPromotionModal}
      promotionData={promotionData}
      closePromotionModal={closePromotionModal}
      handleContinueTest={handleContinueTest}
      handleViewStats={handleViewStats}
      
      // 액션 핸들러 전달
      onStart={controller.handleStart}
      onRestart={controller.handleRestart}
      onKeyPress={controller.handleKeyPress}
      onBackspace={controller.handleBackspace}
      onPause={controller.pauseTest}
      onResume={controller.resumeTest}
      onStop={controller.stopTest}
      onTestStart={controller.handleStart}
      
      className={className}
    />
  );
}