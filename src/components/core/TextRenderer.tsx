"use client";

import { useMemo, useEffect, useRef, memo, useCallback } from "react";
import {
  calculateCharacterStates,
  groupCharactersByWords,
} from "@/utils/textState";
import { CharacterRenderer } from "./CharacterRenderer";
import { SpaceRenderer } from "./SpaceRenderer";
import { useDeviceContext, getTypingTextClassName } from "@/utils/deviceDetection";
import { usePerformanceMonitor } from "@/utils/performanceMonitor";

interface TextRendererProps {
  text: string;
  currentIndex: number;
  userInput: string;
  mistakes: number[];
  isPaused?: boolean;
  className?: string;
}

/**
 * 최적화된 텍스트 렌더러
 * 책임: 텍스트 레이아웃, 상태 계산 조합, 성능 최적화
 */
export const TextRenderer = memo(function TextRenderer({
  text,
  currentIndex,
  userInput,
  mistakes,
  isPaused = false,
  className = "",
}: TextRendererProps) {
  // 성능 모니터링
  usePerformanceMonitor('TextRenderer');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const currentElementRef = useRef<HTMLElement | null>(null);
  const textContainerRef = useRef<HTMLElement | null>(null);
  const deviceContext = useDeviceContext();
  const { isMobile } = deviceContext;

  // 문자별 상태 계산 (메모이제이션)
  const characterStates = useMemo(() => {
    return calculateCharacterStates(text, currentIndex, userInput, mistakes);
  }, [text, currentIndex, userInput, mistakes]);

  // 단어별 그룹화 (렌더링 최적화)
  const wordGroups = useMemo(() => {
    return groupCharactersByWords(text, characterStates);
  }, [text, characterStates]);

  // 자동 스크롤 처리 - 모바일과 PC 다르게 처리 (성능 최적화)
  useEffect(() => {
    // 텍스트가 완료된 경우 스크롤링 비활성화 (무한 루프 방지)
    if (currentIndex >= text.length) {
      return;
    }

    let scrollTimeout: NodeJS.Timeout;
    let rafId: number;

    const scrollToCurrentPosition = () => {
      if (!textContainerRef.current) return;
      
      const targetIndex = currentIndex < 0 ? 0 : currentIndex;
      
      // DOM 선택자 최적화: ref 사용
      if (!currentElementRef.current || currentElementRef.current.getAttribute('data-index') !== targetIndex.toString()) {
        currentElementRef.current = textContainerRef.current.querySelector(`[data-index="${targetIndex}"]`) as HTMLElement;
      }
      
      const currentElement = currentElementRef.current;
      const textContainer = textContainerRef.current;

      if (currentElement && textContainer) {
        if (isMobile) {
          // 모바일: RAF 없이 직접 스크롤 (성능 최적화)
          const windowHeight = 192;
          const windowCenter = windowHeight / 2;

          const textContainerRect = textContainer.getBoundingClientRect();
          const elementRect = currentElement.getBoundingClientRect();

          const relativeTop = elementRect.top - textContainerRect.top + textContainer.scrollTop;
          const targetScrollTop = relativeTop - windowCenter;

          textContainer.scrollTop = Math.max(0, targetScrollTop);
        } else {
          // PC: 단순화된 스크롤링
          const containerHeight = textContainer.clientHeight;
          const targetPosition = containerHeight * 0.33;

          const textContainerRect = textContainer.getBoundingClientRect();
          const elementRect = currentElement.getBoundingClientRect();

          const relativeTop = elementRect.top - textContainerRect.top + textContainer.scrollTop;
          const targetScrollTop = relativeTop - targetPosition;

          if (currentIndex <= 0) {
            textContainer.scrollTop = 0;
          } else {
            textContainer.scrollTop = Math.max(0, targetScrollTop);
          }
        }
      }
    };

    // 쓰로틀링 최적화 (RAF 제거)
    const throttleDelay = isMobile ? 16 : 8; // 성능 향상된 지연시간
    
    const throttledScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(scrollToCurrentPosition, throttleDelay);
    };

    throttledScroll();

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [currentIndex, isPaused, isMobile]); // text 의존성 제거로 성능 향상

  // 메인 렌더링 (메모이제이션 최적화)
  const renderContent = useCallback(() => {
    if (!text) {
      return (
        <div className="text-text-secondary italic text-lg">
          텍스트를 로드하는 중...
        </div>
      );
    }

    return (
      <>
        {wordGroups.map((group, wordIndex) => (
          <span
            key={wordIndex}
            className="word-group"
          >
            {/* 단어 내 문자들 */}
            {group.wordChars.map((charState) => (
              <CharacterRenderer
                key={charState.index}
                state={charState}
                showCursor={charState.status === "current"}
                data-index={charState.index}
              />
            ))}

            {/* 스페이스 문자 */}
            {group.spaceChar && (
              <SpaceRenderer
                key={group.spaceChar.index}
                state={group.spaceChar}
                showCursor={group.spaceChar.status === "current"}
                data-index={group.spaceChar.index}
              />
            )}
          </span>
        ))}

        {/* 텍스트 끝 세로 커서 (타이핑 완료 시) */}
        {currentIndex >= text.length && (
          <span 
            className="end-cursor inline-block w-0.5 ml-1 rounded-sm" 
            style={{ backgroundColor: 'var(--color-typing-cursor)' }}
          />
        )}
      </>
    );
  }, [text, wordGroups, currentIndex]); // wordGroups와 currentIndex만 의존성으로 사용

  return (
    <div
      className={`text-renderer ${className}`}
      ref={containerRef}
    >
      {isMobile ? (
        // 모바일: 고정 윈도우 방식
        <div
          className="fixed-text-window"
          style={{
            position: "fixed",
            top: "calc(var(--header-height) + 6.5rem)", /* 헤더 + 언어 토글 + 충분한 여유 공간 */
            left: "1rem",
            right: "1rem",
            minHeight: "8rem", /* 최소 높이 */
            maxHeight: "calc(100vh - var(--header-height) - var(--footer-height) - 16rem)", /* 컨트롤 버튼 영역 고려 */
            overflow: "hidden",
            zIndex: 40, /* 고정 타이핑 윈도우 */
            backgroundColor: "var(--color-surface)",
            borderRadius: "0.75rem",
            border: "2px solid var(--color-border-primary)",
            boxShadow:
              "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            ref={(el) => { textContainerRef.current = el; }}
            className="typing-text-container font-korean text-xl text-center"
            style={{
              overflow: "auto", // 스크롤 가능
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              padding: "1rem",
              minHeight: "6rem", // 최소 내부 높이
            }}
          >
            {/* 실제 스크롤되는 텍스트 컨테이너 */}
            <div
              className={`${getTypingTextClassName(deviceContext)} mobile-typing-container`}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      ) : (
        // PC/태블릿: 적응형 구멍뚫린 창
        <div
          className="desktop-text-window"
          style={{
            position: "relative",
            width: "70%", // 뷰포트의 70%만 사용
            maxWidth: "800px", // 최대 너비 제한
            margin: "0 auto", // 중앙 정렬
            // CSS 변수를 사용한 적응형 높이
            height: "var(--window-height)",
            overflow: "hidden",
            backgroundColor: "transparent",
            marginTop: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* 단순화된 블러 효과 - 성능 최적화 */}
          <div
            className="blur-mask-top"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4rem",
              background: `linear-gradient(to bottom, var(--color-background) 0%, transparent 100%)`,
              zIndex: 10,
              pointerEvents: "none",
            }}
          />
          
          <div
            className="blur-mask-bottom"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "4rem",
              background: `linear-gradient(to top, var(--color-background) 0%, transparent 100%)`,
              zIndex: 10,
              pointerEvents: "none",
            }}
          />

          <div
            ref={(el) => { if (!textContainerRef.current) textContainerRef.current = el; }}
            className="typing-text-container font-korean text-2xl text-center"
            style={{
              overflow: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              // CSS 변수를 사용한 적응형 패딩
              padding: "var(--text-container-padding-vertical) 2rem",
              height: "100%",
              // 텍스트 크기도 CSS 변수로 통일
              fontSize: "var(--typing-font-size)",
            }}
          >
            <div 
              className="flex flex-wrap justify-center items-baseline min-h-full"
              style={{
                // CSS 변수를 사용한 라인 높이
                lineHeight: "var(--typing-line-height)",
                letterSpacing: "0.02em", // 자간도 약간 추가
                // 영화 크레딧 스타일을 위한 추가 스타일
                textAlign: "center",
              }}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

