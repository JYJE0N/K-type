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

  // 초기 텍스트 생성은 page.tsx의 useEffect에서 처리됨 (무한루프 방지를 위해 제거)

  // 테스트 완료 시 처리는 TestCompletionHandler에서 담당
  // (중복 제거: controller.handleTestCompletion은 더 이상 호출하지 않음)

  // 전역 이벤트 처리는 InputHandler에서 담당

  return (
    <TypingTestUI
      // 상태 전달
      targetText={controller.targetText}
      currentIndex={controller.currentIndex}
      userInput={controller.userInput}
      mistakes={controller.mistakes.map(m => m.position)}
      
      // 타이머 관련
      currentTime={timer.currentTime}
      
      // 완료 처리 관련
      getWordProgress={getWordProgress}
      showPromotionModal={showPromotionModal}
      promotionData={promotionData}
      closePromotionModal={closePromotionModal}
      handleContinueTest={handleContinueTest}
      handleViewStats={handleViewStats}
      
      // 언어 감지 관련
      languageHint={controller.languageHint}
      setLanguageHint={controller.setLanguageHint}
      
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