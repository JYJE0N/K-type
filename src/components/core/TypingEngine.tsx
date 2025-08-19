"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useTypingStore } from "@/stores/typingStore";
import { useStatsStore } from "@/stores/statsStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { TextRenderer } from "./TextRenderer";
import { InputHandler } from "./InputHandler";
import { getLanguagePack } from "@/modules/languages";
import { TextGenerator } from "@/utils/textGenerator";
import { useRouter } from "next/navigation";
import { PlayCircle, PauseCircle, StopCircle, Globe } from "lucide-react";

interface TypingEngineProps {
  className?: string;
}

export function TypingEngine({ className = "" }: TypingEngineProps) {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isComposing = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Store 상태
  const {
    isActive,
    isPaused,
    isCompleted,
    isCountingDown,
    countdownValue,
    targetText,
    currentIndex,
    userInput,
    keystrokes,
    mistakes,
    startTime,
    resetTest,
    setTargetText,
    startCountdown,
    pauseTest,
    resumeTest,
    stopTest,
    getCurrentChar,
  } = useTypingStore();

  const { calculateStats, resetStats } = useStatsStore();
  const { language, textType, testMode, testTarget } = useSettingsStore();
  const {
    initializeUser,
    recordTest,
    updateCharacterStats,
    updateMistakePattern,
  } = useUserProgressStore();

  // 테스트 재시작 핸들러 (새로운 텍스트 생성)
  const handleRestart = useCallback(() => {
    const languagePack = getLanguagePack(language);
    if (!languagePack) return;

    const textGenerator = new TextGenerator(languagePack);

    // 단어 수 계산 (시간 모드의 경우 예상 WPM 기반)
    let wordCount = testTarget;
    if (testMode === "time") {
      // 평균 WPM 40 기준으로 단어 수 계산
      wordCount = Math.max(50, Math.floor((testTarget / 60) * 40));
    }

    const newText = textGenerator.generateText(textType, { wordCount });
    console.log("🔄 Generated new text via Shift+Enter:", {
      newText: newText.substring(0, 50) + "...",
      length: newText.length,
      language,
      textType,
      wordCount,
    });

    setTargetText(newText);
    resetTest();
    resetStats();
  }, [
    language,
    textType,
    testMode,
    testTarget,
    setTargetText,
    resetTest,
    resetStats,
  ]);

  // IME 조합 상태 변경 핸들러
  const handleCompositionChange = useCallback((composing: boolean) => {
    isComposing.current = composing;
    console.log("🎭 Composition state changed:", composing);
  }, []);

  // 타이머 업데이트
  useEffect(() => {
    if (isActive && !isPaused && !isCompleted && startTime) {
      timerRef.current = setInterval(() => {
        setCurrentTime((Date.now() - startTime.getTime()) / 1000);
      }, 100); // 100ms마다 업데이트
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isPaused, isCompleted, startTime]);

  // 실시간 통계 업데이트 (IME 상태와 무관하게 항상 업데이트)
  useEffect(() => {
    if (isActive && !isPaused && !isCompleted) {
      intervalRef.current = setInterval(() => {
        calculateStats(keystrokes, mistakes, startTime, currentIndex, undefined, textType);
      }, 250); // 250ms마다 더 자주 업데이트
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isActive,
    isPaused,
    isCompleted,
    keystrokes,
    mistakes,
    startTime,
    calculateStats,
    currentIndex,
  ]);

  // 컴포넌트 초기화 - 사용자 초기화만
  useEffect(() => {
    initializeUser();
  }, []);

  // 테스트 완료 시 MongoDB에 저장 및 stats 페이지로 이동
  useEffect(() => {
    if (isCompleted && startTime && keystrokes.length > 0) {
      // 약간의 지연을 주어 최종 통계가 계산되도록 함
      setTimeout(() => {
        const duration = (Date.now() - startTime.getTime()) / 1000;
        const wordsTyped = Math.floor(currentIndex / 5);

        // 현재 통계 store에서 최신 값 가져오기
        const currentStats = useStatsStore.getState().liveStats;

        console.log("📊 테스트 완료 통계:", {
          duration,
          wordsTyped,
          currentIndex,
          cpm: currentStats.cpm,
          wpm: currentStats.wpm,
          accuracy: currentStats.accuracy,
          consistency: currentStats.consistency,
          mistakes: mistakes.length,
        });

        // NaN 체크 및 기본값 설정
        const validCPM =
          isNaN(currentStats.cpm) || !isFinite(currentStats.cpm)
            ? Math.round(currentIndex / (duration / 60))
            : currentStats.cpm;
        const validWPM =
          isNaN(currentStats.wpm) || !isFinite(currentStats.wpm)
            ? Math.round(wordsTyped / (duration / 60))
            : currentStats.wpm;
        const validAccuracy =
          isNaN(currentStats.accuracy) || !isFinite(currentStats.accuracy)
            ? keystrokes.length > 0
              ? Math.round(
                  (keystrokes.filter((k) => k.correct).length /
                    keystrokes.length) *
                    100
                )
              : 100
            : currentStats.accuracy;
        const validConsistency =
          isNaN(currentStats.consistency) || !isFinite(currentStats.consistency)
            ? 0
            : currentStats.consistency;

        // 최소한의 데이터가 있을 때만 저장
        if (duration > 0 && currentIndex > 0) {
          console.log("📊 테스트 결과 저장:", {
            cpm: validCPM,
            wpm: validWPM,
            accuracy: validAccuracy,
            duration,
            currentIndex,
            mistakes: mistakes.length,
          });

          // MongoDB에 테스트 결과 저장
          recordTest({
            id: `test-${Date.now()}`,
            mode: testMode,
            target: testTarget,
            textType,
            language,
            device: "desktop",
            duration,
            cpm: validCPM,
            wpm: validWPM,
            rawWpm: validWPM,
            rawCpm: validCPM,
            accuracy: validAccuracy,
            consistency: validConsistency,
            mistakes,
            keystrokes,
          });

          // 약점 분석 데이터 업데이트
          mistakes.forEach((mistake) => {
            const wrongChar = userInput[mistake.position] || "";
            const correctChar = targetText[mistake.position] || "";
            if (correctChar) {
              updateMistakePattern(wrongChar, correctChar);
              updateCharacterStats(correctChar, false, 0);
            }
          });
        }

        // stats 페이지로 이동 (데이터 저장 후)
        setTimeout(() => {
          router.push("/stats");
        }, 1000);
      }, 500); // 500ms 지연
    }
  }, [isCompleted, router]);

  // 테스트 모드에 따른 완료 조건 확인
  useEffect(() => {
    if (!isActive || isPaused || isCompleted) return;

    // 텍스트를 모두 완성한 경우
    if (currentIndex >= targetText.length) {
      console.log("🏁 텍스트 완성으로 테스트 완료");
      useTypingStore.getState().completeTest();
      return;
    }

    if (testMode === "time" && startTime) {
      const elapsed = (Date.now() - startTime.getTime()) / 1000;
      if (elapsed >= testTarget) {
        console.log("🏁 시간 초과로 테스트 완료");
        useTypingStore.getState().completeTest();
      }
    } else if (testMode === "words") {
      const wordsTyped = Math.floor(currentIndex / 5); // 5문자 = 1단어
      if (wordsTyped >= testTarget) {
        console.log("🏁 목표 단어 수 달성으로 테스트 완료");
        useTypingStore.getState().completeTest();
      }
    }
  }, [
    isActive,
    isPaused,
    isCompleted,
    currentIndex,
    startTime,
    testMode,
    testTarget,
    targetText.length,
  ]);

  // Shift+Enter 단축키 처리
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      console.log("🔍 Global keydown:", {
        key: event.key,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
      });

      // Shift+Enter 조합 감지
      if (event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        console.log("🚀 Shift+Enter detected - Restarting test");

        // 테스트 재시작
        handleRestart();
        return false; // 이벤트 처리 완전 중단
      }
    };

    // 전역 키보드 이벤트 리스너 등록 (capture phase에서 먼저 처리)
    document.addEventListener("keydown", handleGlobalKeyDown, {
      capture: true,
    });

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, {
        capture: true,
      });
    };
  }, [handleRestart]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      resetStats();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [resetStats]);

  // 진행률 계산
  // const progress = getProgress() // 미사용으로 주석 처리
  // const currentChar = getCurrentChar(); // 미사용으로 주석 처리

  return (
    <div
      className={`typing-engine ${className}`}
      style={{
        paddingTop: "var(--spacing-lg)",
        paddingBottom: "var(--spacing-lg)",
      }}
    >

      {/* 언어 선택 (인풋 필드 위) */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-3 bg-surface/60 backdrop-blur-sm rounded-lg p-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-text-secondary" />
            <span className="text-sm text-text-secondary font-medium">언어</span>
          </div>
          <button
            onClick={() => useSettingsStore.getState().setLanguage("korean")}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              language === "korean" ? "header-menu-active" : "header-menu-inactive"
            }`}
          >
            한국어
          </button>
          <button
            onClick={() => useSettingsStore.getState().setLanguage("english")}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              language === "english" ? "header-menu-active" : "header-menu-inactive"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* 메인 타이핑 영역 */}
      <div className="relative">
        {/* 시간 표시 (인풋 필드 위) */}
        {isActive && !isPaused && !isCompleted && (
          <div
            className="text-center"
            style={{ marginBottom: "var(--spacing-md)" }}
          >
            <div
              className="inline-flex items-center btn btn-sm btn-secondary"
              style={{ cursor: "default" }}
            >
              <div className="text-md font-mono text-typing-accent">
                {(() => {
                  const mins = Math.floor(currentTime / 60);
                  const secs = Math.floor(currentTime % 60);
                  return `${mins.toString().padStart(2, "0")}:${secs
                    .toString()
                    .padStart(2, "0")}`;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* 텍스트 렌더러와 입력 핸들러를 감싸는 컨테이너 */}
        <div className="relative mb-4">
          {/* 텍스트 렌더러 */}
          <TextRenderer
            text={targetText}
            currentIndex={currentIndex}
            userInput={userInput}
            mistakes={mistakes.map((m) => m.position)}
            className={`transition-all duration-300 ${isCountingDown ? 'blur-sm opacity-50' : ''}`}
          />

          {/* 입력 핸들러 (숨겨진 인풋) - TextRenderer 위에 투명하게 */}
          <InputHandler
            onKeyPress={useTypingStore.getState().handleKeyPress}
            onBackspace={useTypingStore.getState().handleBackspace}
            onTestStart={startCountdown} // 카운트다운으로 변경
            onCompositionChange={handleCompositionChange}
            disabled={isCountingDown} // 카운트다운 중에는 비활성화
            className="absolute inset-0 cursor-text z-5"
          />
        </div>

        {/* 카운트다운 오버레이 */}
        {isCountingDown && (
          <div 
            className="absolute inset-0 flex items-center justify-center rounded-lg z-30 bg-surface/90 backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="text-6xl font-bold mb-4 animate-pulse text-typing-accent">
                {countdownValue === 0 ? '시작!' : countdownValue}
              </div>
              <p className="text-lg text-text-secondary">
                준비하세요...
              </p>
            </div>
          </div>
        )}

        {/* 컨트롤 버튼들 */}
        <div className="flex justify-center gap-4 mt-6 relative z-40">
          {!isActive && !isCompleted && !isCountingDown && (
            <button
              onClick={startCountdown}
              className="btn btn-primary px-6 py-2"
            >
              시작하기
            </button>
          )}
          
          {isActive && !isPaused && !isCompleted && (
            <>
              <button
                onClick={pauseTest}
                className="btn btn-secondary px-4 py-2 flex items-center gap-2"
              >
                <PauseCircle className="w-5 h-5" />
                일시정지
              </button>
              <button
                onClick={stopTest}
                className="btn btn-outline px-4 py-2 flex items-center gap-2"
              >
                <StopCircle className="w-5 h-5" />
                중단
              </button>
            </>
          )}
          
          {isPaused && (
            <>
              <button
                onClick={resumeTest}
                className="btn btn-primary px-4 py-2 flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                계속
              </button>
              <button
                onClick={stopTest}
                className="btn btn-outline px-4 py-2 flex items-center gap-2"
              >
                <StopCircle className="w-5 h-5" />
                중단
              </button>
            </>
          )}
        </div>

        {/* 안내문구 - 텍스트박스 아래 */}
        <div
          className="text-center"
          style={{ marginTop: "var(--spacing-lg)" }}
        >
          {!isActive && !isCompleted && !isCountingDown && (
            <p className="text-md text-muted">
              <kbd>클릭</kbd> or <kbd>키</kbd>입력으로 시작
            </p>
          )}
          {!isCompleted && (
            <p
              className="text-sm text-muted"
              style={{ marginTop: "var(--spacing-xs)" }}
            >
              새로 시작 <kbd>Shift</kbd> + <kbd>Enter</kbd>
            </p>
          )}
        </div>

        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg z-20">
            <div className="text-center bg-surface bg-opacity-98 p-6 rounded-lg shadow-2xl border border-typing-accent border-opacity-30">
              <p className="text-lg mb-2 text-typing-accent">일시정지됨</p>
              <p className="text-sm text-text-secondary">
                계속하려면 아무 키나 누르세요
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 테스트 완료 시 stats 페이지로 자동 이동 */}
      {isCompleted && (
        <div className="mt-6 text-center">
          <div className="card">
            <div className="card-content py-8">
              <div className="animate-pulse text-accent title-md">
                결과를 분석하고 있습니다
              </div>
              <div className="text-sm text-secondary mt-2">
                잠시 후 통계 페이지로 이동합니다
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
