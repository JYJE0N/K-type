"use client";

import { IoStop, IoPauseSharp, IoPlay, IoReloadCircle } from "react-icons/io5";
import { FaKeyboard } from "react-icons/fa6";
import { TextRenderer } from "./TextRenderer";
import { InputHandler } from "./InputHandler";
import { TypingVisualizer } from "./TypingVisualizer";
import { GhostIndicator } from "./GhostIndicator";
import { PromotionModal } from "@/components/gamification/PromotionModal";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { CharacterProgressSlider } from "@/components/ui/ProgressSlider";
import { LanguageMismatchAlert } from "@/components/ui/LanguageMismatchAlert";
import { useTypingStore } from "@/stores/typingStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { TierConfig } from "@/utils/tierSystem";
import { useEffect, useState } from "react";

interface TypingTestUIProps {
  // 상태
  targetText: string;
  currentIndex: number;
  userInput: string;
  mistakes: number[];

  // 타이머 관련
  currentTime: number;

  // 완료 처리 관련
  getWordProgress?: () => number;
  showPromotionModal: boolean;
  promotionData: { fromTier: TierConfig; toTier: TierConfig } | null;
  closePromotionModal: () => void;
  handleContinueTest?: () => void;
  handleViewStats?: () => void;

  // 언어 감지 관련
  languageHint?: {
    show: boolean;
    message: string;
    severity: "info" | "warning" | "error";
  };
  setLanguageHint?: (hint: {
    show: boolean;
    message: string;
    severity: "info" | "warning" | "error";
  }) => void;

  // 액션 핸들러
  onStart: () => void;
  onRestart: () => void;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onTestStart: () => void;

  // 스타일
  className?: string;
}

/**
 * 타이핑 테스트의 순수 UI 렌더링 컴포넌트
 * 책임: UI 렌더링, 이벤트 전달, 레이아웃
 */
export function TypingTestUI({
  targetText,
  currentIndex,
  userInput,
  mistakes,
  currentTime,
  getWordProgress = () => 0,
  showPromotionModal,
  promotionData,
  closePromotionModal,
  handleContinueTest,
  handleViewStats,
  languageHint,
  setLanguageHint,
  onStart,
  onRestart,
  onKeyPress,
  onBackspace,
  onPause,
  onResume,
  onStop,
  onTestStart,
  className = "",
}: TypingTestUIProps) {
  const { isActive, isPaused, isCompleted, isCountingDown, countdownValue } =
    useTypingStore();

  const { testTarget } = useSettingsStore();

  // 가상 키보드 감지
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // 모바일에서만 감지
      if (window.innerWidth <= 768) {
        const viewportHeight =
          window.visualViewport?.height || window.innerHeight;
        const windowHeight = window.innerHeight;
        const keyboardHeight = windowHeight - viewportHeight;

        // 키보드가 100px 이상 올라왔을 때
        const isKeyboardUp = keyboardHeight > 100;
        setKeyboardVisible(isKeyboardUp);

        // CSS 변수 업데이트
        document.documentElement.style.setProperty(
          "--keyboard-height",
          isKeyboardUp ? `${keyboardHeight}px` : "0px"
        );

        // body 클래스 토글
        document.body.classList.toggle("keyboard-visible", isKeyboardUp);
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener("resize", handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return (
    <div className={`typing-test-container mobile-content-container ${className}`}>
      {/* 카운트다운 오버레이 */}
      {isCountingDown && (
        <div
          className="countdown-overlay fixed inset-0 flex flex-col items-center justify-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(12px)",
            zIndex: 90, /* 카운트다운 오버레이 */
          }}
        >
          {/* 준비 텍스트 */}
          <div
            className="text-lg font-medium mb-8 animate-pulse"
            style={{ color: "var(--color-text-secondary)" }}
          >
            한/영키 확인했나요?
          </div>

          {/* 심플한 원형 프로그레스 */}
          <div className="countdown-display relative w-32 h-32 flex items-center justify-center">
            {/* 원형 프로그레스 차트 */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 120 120"
            >
              {/* 배경 원 */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--color-border-primary)"
                strokeWidth="4"
                opacity="0.3"
              />
              {/* 프로그레스 원 */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--color-interactive-primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset="0"
                style={{
                  animation: `spin-progress 1s ease-in-out forwards`,
                  transformOrigin: "center",
                }}
                key={countdownValue} // 키 변경으로 애니메이션 재시작
              />
            </svg>

            {/* 중앙 텍스트/아이콘 */}
            <div
              className="text-xl font-bold text-center flex items-center justify-center"
              style={{
                color: "var(--color-text-primary)",
                textShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {countdownValue === 3 && "3"}
              {countdownValue === 2 && "2"}
              {countdownValue === 1 && <FaKeyboard className="w-6 h-6" />}
            </div>
          </div>

          {/* 시작 힌트 */}
          <div
            className="text-sm mt-8 opacity-70"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            타이핑 시작 준비!
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 영역 */}
      <div className="main-content-area">
        {/* 상단 정보 바 */}
        <div className="info-bar mb-6">
          <div className="flex justify-between items-center mb-4">
            {/* 시간/진행률 표시 */}
            <div className="progress-info flex items-center gap-3">
              {/* 시간 모드 제거됨 - 경과 시간은 프로그레스바에서 확인 */}
            </div>

            {/* 고스트 인디케이터 */}
            <GhostIndicator />
          </div>

          {/* 진행률 슬라이더 - PC용 */}
          <div className="progress-slider-container hidden md:block">
            {/* 글자 기반 프로그레스바 (경과 시간 표시) */}
            <CharacterProgressSlider
              currentIndex={currentIndex}
              totalLength={targetText.length}
              elapsedTime={currentTime}
              variant="success"
              size="md"
              className=""
              showCount={false}
              animated={false}
            />
          </div>
        </div>

        {/* 텍스트 렌더러와 입력 핸들러 - 고정 위치 */}
        <div
          className="typing-area relative cursor-pointer"
          style={{ minHeight: "200px" }}
          onClick={() => {
            if (!isActive && !isCompleted && !isCountingDown) {
              onStart();
            } else if (isPaused && onResume) {
              onResume();
            }
          }}
        >
          <TextRenderer
            text={targetText}
            currentIndex={currentIndex}
            userInput={userInput}
            mistakes={mistakes}
            isPaused={isPaused}
            className="mb-4"
          />

          <InputHandler
            onKeyPress={onKeyPress}
            onBackspace={onBackspace}
            onTestStart={onTestStart}
            onResume={isPaused ? onResume : undefined}
            onPause={onPause}
            onRestart={onRestart}
            disabled={isCompleted}
            className="typing-input"
          />
        </div>

        {/* 타이핑 시각화 컨테이너 - 고정 높이로 위치 안정화 */}
        <div
          className="typing-visualizer-container mb-8 composition-panel md:static md:mb-8"
          style={{ minHeight: "80px" }}
        >
          {isActive && !isPaused && (
            <TypingVisualizer
              text={targetText}
              currentIndex={currentIndex}
            />
          )}
        </div>

        {/* 모바일용 하단 UI 컨테이너 - 헤더/푸터 영역 제외, 가상 키보드 대응 */}
        <div className="md:hidden fixed left-0 right-0 z-30" 
             style={{ 
               bottom: "calc(var(--footer-height) + var(--keyboard-height) + env(safe-area-inset-bottom, 0px) + 0.5rem)",
               maxHeight: "calc(100vh - var(--header-height) - var(--footer-height))"
             }}>
          
          {/* 프로그레스 바 */}
          <div className="mx-4 mb-4">
            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-primary)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <CharacterProgressSlider
                currentIndex={currentIndex}
                totalLength={targetText.length}
                elapsedTime={currentTime}
                variant="success"
                size="sm"
                className="w-full"
                showCount={false}
                animated={false}
              />
            </div>
          </div>

          {/* 컨트롤 버튼들 */}
          <div className="flex justify-center items-center gap-3 px-4">
            {!isActive && !isCompleted && !isCountingDown && (
              <>
                <button
                  onClick={onStart}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-white hover:opacity-90"
                  style={{ backgroundColor: "var(--color-interactive-primary)" }}
                >
                  <IoPlay className="w-4 h-4" />
                  시작
                </button>

                <button
                  onClick={onRestart}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-white hover:opacity-90"
                  style={{
                    backgroundColor: "var(--color-interactive-secondary)",
                  }}
                >
                  <IoReloadCircle className="w-4 h-4" />
                  새로고침
                </button>
              </>
            )}

            {isActive && !isPaused && (
              <>
                <button
                  onClick={onPause}
                  className="typing-button-secondary flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
                >
                  <IoPauseSharp className="w-4 h-4" />
                  일시정지
                </button>

                <button
                  onClick={onStop}
                  className="typing-button-restart flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
                >
                  <IoStop className="w-4 h-4" />
                  중단
                </button>
              </>
            )}

            {isPaused && (
              <>
                <button
                  onClick={onResume}
                  className="typing-button-primary flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
                >
                  <IoPlay className="w-4 h-4" />
                  재개
                </button>

                <button
                  onClick={onRestart}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-white hover:opacity-90"
                  style={{
                    backgroundColor: "var(--color-interactive-secondary)",
                  }}
                >
                  <IoReloadCircle className="w-4 h-4" />
                  새로고침
                </button>
              </>
            )}
          </div>
        </div>

        {/* 데스크톱용 컨트롤 버튼들 */}
        <div className="hidden md:flex justify-center items-center gap-4 mb-6 mt-16">
          {!isActive && !isCompleted && !isCountingDown && (
            <>
              <button
                onClick={onStart}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-white hover:opacity-90 hover:scale-102 active:scale-95"
                style={{ backgroundColor: "var(--color-interactive-primary)" }}
              >
                <IoPlay className="w-5 h-5" />
                시작하기
              </button>

              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-white hover:opacity-90 hover:scale-102 active:scale-95"
                style={{
                  backgroundColor: "var(--color-interactive-secondary)",
                }}
              >
                <IoReloadCircle className="w-5 h-5" />
                새로고침
              </button>
            </>
          )}

          {isActive && !isPaused && (
            <>
              <button
                onClick={onPause}
                className="typing-button-secondary flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-opacity-10 hover:scale-102 active:scale-95"
              >
                <IoPauseSharp className="w-5 h-5" />
                일시정지
              </button>

              <button
                onClick={onStop}
                className="typing-button-restart flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-opacity-10 hover:scale-102 active:scale-95"
              >
                <IoStop className="w-5 h-5" />
                중단
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                onClick={onResume}
                className="typing-button-primary flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:opacity-90 hover:scale-102 active:scale-95"
              >
                <IoPlay className="w-5 h-5" />
                재개하기
              </button>

              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-white hover:opacity-90 hover:scale-102 active:scale-95"
                style={{
                  backgroundColor: "var(--color-interactive-secondary)",
                }}
              >
                <IoReloadCircle className="w-5 h-5" />
                새로고침
              </button>
            </>
          )}
        </div>

        {/* 키보드 숏컷 안내 */}
        <div className="shortcuts-container">
          <KeyboardShortcuts
            showStart={!isActive && !isCompleted && !isCountingDown}
            showPause={isActive && !isPaused}
            showResume={isPaused}
            showRestart={isActive || isPaused || isCompleted}
          />
        </div>
      </div>

      {/* 언어 불일치 알림 */}
      {languageHint && (
        <LanguageMismatchAlert
          show={languageHint.show}
          message={languageHint.message}
          severity={languageHint.severity}
          onDismiss={() =>
            setLanguageHint?.({ show: false, message: "", severity: "info" })
          }
        />
      )}

      {/* 승급 모달 */}
      {showPromotionModal && promotionData && (
        <PromotionModal
          isOpen={showPromotionModal}
          fromTier={promotionData.fromTier}
          toTier={promotionData.toTier}
          onClose={closePromotionModal}
          onContinue={handleContinueTest}
          onViewStats={handleViewStats}
        />
      )}
    </div>
  );
}
