"use client";

import { IoStop, IoPauseSharp, IoPlay, IoReloadCircle } from "react-icons/io5";
import { LuAlarmClockCheck } from "react-icons/lu";
import { FaKeyboard } from "react-icons/fa6";
import { TextRenderer } from "./TextRenderer";
import { InputHandler } from "./InputHandler";
import { TypingVisualizer } from "./TypingVisualizer";
import { GhostIndicator } from "./GhostIndicator";
import { PromotionModal } from "@/components/gamification/PromotionModal";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { TimeProgressSlider, WordProgressSlider } from "@/components/ui/ProgressSlider";
import { useTypingStore } from "@/stores/typingStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { TierConfig } from "@/utils/tierSystem";

interface TypingTestUIProps {
  // 상태
  targetText: string;
  currentIndex: number;
  userInput: string;
  mistakes: number[];
  
  // 타이머 관련
  currentTime: number;
  getRemainingTime: () => number | null;
  getTimeProgress: () => number | null;
  getFormattedTime: (seconds: number) => string;
  
  // 완료 처리 관련
  getWordProgress: () => number;
  showPromotionModal: boolean;
  promotionData: { fromTier: TierConfig; toTier: TierConfig } | null;
  closePromotionModal: () => void;
  
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
  getRemainingTime,
  getTimeProgress,
  getFormattedTime,
  getWordProgress,
  showPromotionModal,
  promotionData,
  closePromotionModal,
  onStart,
  onRestart,
  onKeyPress,
  onBackspace,
  onPause,
  onResume,
  onStop,
  onTestStart,
  className = ""
}: TypingTestUIProps) {
  
  const {
    isActive,
    isPaused,
    isCompleted,
    isCountingDown,
    countdownValue,
  } = useTypingStore();

  const { testMode, testTarget } = useSettingsStore();

  // 남은 시간 표시
  const remainingTime = getRemainingTime();
  const timeProgress = getTimeProgress();
  const wordProgress = getWordProgress();

  return (
    <div className={`typing-test-container ${className}`}>
      {/* 카운트다운 오버레이 */}
      {isCountingDown && (
        <div 
          className="countdown-overlay fixed inset-0 flex flex-col items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)',
            zIndex: 9999
          }}
        >
          {/* 준비 텍스트 */}
          <div 
            className="text-lg font-medium mb-8 animate-pulse"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            준비하세요...
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
                  transformOrigin: 'center'
                }}
                key={countdownValue} // 키 변경으로 애니메이션 재시작
              />
            </svg>
            
            {/* 중앙 텍스트/아이콘 */}
            <div className="text-xl font-bold text-center flex items-center justify-center"
                 style={{ 
                   color: 'var(--color-text-primary)',
                   textShadow: '0 2px 8px rgba(0,0,0,0.1)'
                 }}>
              {countdownValue === 3 && "준비"}
              {countdownValue === 2 && "시작"}
              {countdownValue === 1 && <FaKeyboard className="w-6 h-6" />}
            </div>
          </div>
          
          {/* 시작 힌트 */}
          <div 
            className="text-sm mt-8 opacity-70"
            style={{ color: 'var(--color-text-tertiary)' }}
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
              {false && remainingTime !== null && ( // 시간 모드 제거됨
                <div className="time-display flex items-center gap-2">
                  <LuAlarmClockCheck className="w-5 h-5 text-interactive-primary" />
                  <span className="text-lg font-mono text-text-primary">
                    {getFormattedTime(remainingTime || 0)}
                  </span>
                </div>
              )}
            </div>
            
            {/* 고스트 인디케이터 */}
            <GhostIndicator />
          </div>

          {/* 진행률 슬라이더 */}
          <div className="progress-slider-container">
            {false && remainingTime !== null && ( // 시간 모드 제거됨
              <TimeProgressSlider
                elapsed={currentTime}
                total={testTarget}
                variant="primary"
                size="md"
                className="w-full"
                showTime={false}
              />
            )}
            
            {testMode === "words" && (
              <WordProgressSlider
                currentWords={Math.floor((currentIndex / targetText.length) * testTarget)}
                totalWords={testTarget}
                elapsedTime={currentTime}
                variant="success"
                size="md"
                className="w-full"
                showCount={false}
              />
            )}
          </div>
        </div>

        {/* 타이핑 시각화 (활성 상태일 때만) */}
        {isActive && !isPaused && (
          <div className="typing-visualizer-container mb-4">
            <TypingVisualizer 
              text={targetText} 
              currentIndex={currentIndex}
            />
          </div>
        )}

        {/* 텍스트 렌더러와 입력 핸들러 */}
        <div 
          className="typing-area relative mb-8 cursor-pointer"
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
            className="mb-4"
          />
          
          <InputHandler
            onKeyPress={onKeyPress}
            onBackspace={onBackspace}
            onTestStart={onTestStart}
            onResume={isPaused ? onResume : undefined}
            disabled={isCompleted}
            className="typing-input"
          />
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="controls-container flex justify-center items-center gap-4 mb-6">
          {!isActive && !isCompleted && !isCountingDown && (
            <>
              <button
                onClick={onStart}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-white hover:opacity-90 hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-interactive-primary)' }}
              >
                <IoPlay className="w-5 h-5" />
                시작하기
              </button>
              
              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-white hover:opacity-90 hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-interactive-secondary)' }}
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
                className="typing-button-secondary flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-opacity-10 hover:scale-105 active:scale-95"
              >
                <IoPauseSharp className="w-5 h-5" />
                일시정지
              </button>
              
              <button
                onClick={onStop}
                className="typing-button-restart flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-opacity-10 hover:scale-105 active:scale-95"
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
                className="typing-button-primary flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
              >
                <IoPlay className="w-5 h-5" />
                재개하기
              </button>
              
              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-white hover:opacity-90 hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-interactive-secondary)' }}
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
            showRestart={isActive || isPaused || isCompleted}
          />
        </div>
      </div>

      {/* 승급 모달 */}
      {showPromotionModal && promotionData && (
        <PromotionModal
          isOpen={showPromotionModal}
          fromTier={promotionData.fromTier}
          toTier={promotionData.toTier}
          onClose={closePromotionModal}
        />
      )}
    </div>
  );
}