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

  // 테스트 완료 시 처리
  useEffect(() => {
    if (controller.isCompleted) {
      const finalStats = controller.handleTestCompletion();
      if (finalStats) {
        // 최종 통계를 사용한 추가 처리가 필요하다면 여기서
      }
    }
  }, [controller.isCompleted, controller.handleTestCompletion]);

  // Shift+Enter 글로벌 단축키 처리
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Shift+Enter 조합 감지
      if (event.shiftKey && event.key === 'Enter') {
        event.preventDefault();
        console.log("🚀 Shift+Enter detected - Restarting test");
        controller.handleRestart();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, {
      capture: true,
      passive: false
    });

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, {
        capture: true
      });
    };
  }, [controller.handleRestart]);

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