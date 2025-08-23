"use client";

import { useCallback } from "react";
import { useTypingStore } from "@/stores/typingStore";
import { useStatsStore } from "@/stores/statsStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { getLanguagePack } from "@/modules/languages";
import { TextGenerator } from "@/utils/textGenerator";
import { ghostModeManager } from "@/utils/ghostMode";
import { typingEffectsManager } from "@/utils/typingEffects";

/**
 * 타이핑 테스트의 비즈니스 로직을 관리하는 컨트롤러
 * 책임: 텍스트 생성, 테스트 시작/재시작, 키 입력 처리, 진행률 관리
 */
export function useTypingTestController() {
  // Store 훅들
  const {
    targetText,
    currentIndex,
    userInput,
    mistakes,
    keystrokes,
    startTime,
    firstKeystrokeTime,
    isActive,
    isPaused,
    isCompleted,
    isCountingDown,
    resetTest,
    setTargetText,
    startCountdown,
    pauseTest,
    resumeTest,
    stopTest,
    getCurrentChar,
  } = useTypingStore();

  const { calculateStats, resetStats, liveStats } = useStatsStore();
  const { language, textType, testMode, testTarget, ghostModeEnabled, typingEffectsEnabled, countdownEnabled } = useSettingsStore();
  const { recordTest, updateCharacterStats, updateMistakePattern, recentTests } = useUserProgressStore();

  // 새로운 텍스트 생성
  const generateNewText = useCallback(() => {
    const languagePack = getLanguagePack(language);
    if (!languagePack) return "";

    const textGenerator = new TextGenerator(languagePack);

    let finalTextType = textType;
    let wordCount = testTarget;

    if (testMode === "sentences") {
      // 문장 모드일 때는 목표값에 따라 텍스트 타입 결정
      if (testTarget === 1) {
        finalTextType = "short-sentences"; // 단문: 15-20자 한 문장
        wordCount = 1; // 한 문장
      } else if (testTarget === 3) {
        finalTextType = "medium-sentences"; // 중문
        wordCount = 3;
      } else {
        finalTextType = "long-sentences"; // 장문
        wordCount = 5;
      }
    }

    const newText = textGenerator.generateText(finalTextType, {
      wordCount,
    });

    return newText;
  }, [language, textType, testMode, testTarget]);

  // 테스트 재시작
  const handleRestart = useCallback(() => {
    const newText = generateNewText();
    if (!newText) return;

    resetTest();
    setTargetText(newText);
    resetStats();

    // 고스트 모드 설정
    if (ghostModeEnabled && recentTests && Array.isArray(recentTests)) {
      const bestRecord = ghostModeManager.findBestRecord(
        recentTests,
        language,
        textType,
        testMode,
        testTarget
      );
      
      if (bestRecord) {
        ghostModeManager.startGhostMode(bestRecord);
      }
    }

    // 이펙트 시스템 초기화
    if (typingEffectsEnabled) {
      typingEffectsManager.resetCombo();
    }
  }, [generateNewText, resetTest, setTargetText, resetStats, ghostModeEnabled, testMode, testTarget, typingEffectsEnabled]);

  // 테스트 시작
  const handleStart = useCallback(() => {
    if (!targetText) {
      handleRestart();
      return;
    }
    
    // 카운트다운 설정에 따라 시작 방식 결정
    if (countdownEnabled) {
      startCountdown();
    } else {
      // 카운트다운 없이 바로 시작
      const startTest = useTypingStore.getState().startTest;
      startTest();
    }
  }, [targetText, handleRestart, startCountdown, countdownEnabled]);

  // 키 입력 처리
  const handleKeyPress = useCallback((key: string) => {
    // 타이핑 스토어의 handleKeyPress 호출 (상태 업데이트)
    const storeHandleKeyPress = useTypingStore.getState().handleKeyPress;
    storeHandleKeyPress(key);

    const currentChar = getCurrentChar();
    if (!currentChar) return;

    // 통계 업데이트
    calculateStats(keystrokes, mistakes, startTime, currentIndex, new Date(), textType, targetText, userInput, firstKeystrokeTime);

    // 문자별 통계 업데이트
    if (currentChar) {
      updateCharacterStats(currentChar, key === currentChar, Date.now());
    }

    // 실수 패턴 업데이트
    if (key !== currentChar) {
      updateMistakePattern(currentChar, key);
    }

    // 이펙트 시스템은 이미 타이핑 스토어에서 처리됨
  }, [getCurrentChar, calculateStats, updateCharacterStats, updateMistakePattern]);

  // 백스페이스 처리
  const handleBackspace = useCallback(() => {
    calculateStats(keystrokes, mistakes, startTime, currentIndex, new Date(), textType, targetText, userInput, firstKeystrokeTime);
  }, [calculateStats, keystrokes, mistakes, startTime, currentIndex, textType, targetText, userInput, firstKeystrokeTime]);

  // 테스트 완료 처리 (🚨 recordTest 제거 - TestCompletionHandler에서만 처리)
  const handleTestCompletion = useCallback(() => {
    if (!isCompleted || !firstKeystrokeTime) return;

    // 통계 계산만 수행 (저장은 TestCompletionHandler에서)
    calculateStats(keystrokes, mistakes, startTime, currentIndex, new Date(), textType, targetText, userInput, firstKeystrokeTime);
    
    console.log('📊 TypingTestController: 통계 계산 완료 (저장 제외)');

    return liveStats;
  }, [isCompleted, firstKeystrokeTime, calculateStats, keystrokes, mistakes.length, startTime, currentIndex, textType, targetText, userInput, liveStats]);

  return {
    // 상태
    targetText,
    currentIndex,
    userInput,
    mistakes,
    isActive,
    isPaused,
    isCompleted,
    isCountingDown,
    
    // 액션
    handleRestart,
    handleStart,
    handleKeyPress,
    handleBackspace,
    handleTestCompletion,
    pauseTest,
    resumeTest,
    stopTest,
    
    // 유틸리티
    generateNewText,
  };
}