"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTypingStore } from "@/stores/typingStore";
import { useSettingsStore } from "@/stores/settingsStore";

/**
 * 타이핑 테스트의 타이머 로직을 관리
 * 책임: 카운트다운, 테스트 시간 측정, 시간 기반 테스트 완료 처리
 */
export function useTypingTimer(onTestComplete?: () => void) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const {
    isActive,
    isPaused,
    isCompleted,
    isCountingDown,
    countdownValue,
    startTime,
    firstKeystrokeTime,
  } = useTypingStore();

  const { testMode, testTarget } = useSettingsStore();

  // 카운트다운 관리
  useEffect(() => {
    if (isCountingDown && countdownValue > 0) {
      timerRef.current = setTimeout(() => {
        // 카운트다운이 끝나면 테스트 시작
        if (countdownValue === 1) {
          // setTestActive(); // 제거됨
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isCountingDown, countdownValue]);

  // 활성 테스트 시간 관리
  useEffect(() => {
    if (isActive && !isPaused && !isCompleted) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = firstKeystrokeTime 
          ? (now - firstKeystrokeTime.getTime()) / 1000
          : startTime 
            ? (now - startTime.getTime()) / 1000 
            : 0;
        
        setCurrentTime(elapsed);

        // 시간 모드 제거됨 - 타이머 기능 비활성화
        // if (testMode === "time" && elapsed >= testTarget) {
        //   onTestComplete?.();
        // }
      }, 100); // 100ms마다 업데이트
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, isCompleted, firstKeystrokeTime, startTime, testMode, testTarget, onTestComplete]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 남은 시간 계산 (시간 모드일 때)
  const getRemainingTime = useCallback(() => {
    // 시간 모드 제거됨
    return null;
  }, []);

  // 진행률 계산 (시간 모드일 때)
  const getTimeProgress = useCallback(() => {
    // 시간 모드 제거됨
    return null;
  }, []);

  // 포맷된 시간 문자열
  const getFormattedTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    currentTime,
    getRemainingTime,
    getTimeProgress,
    getFormattedTime,
  };
}