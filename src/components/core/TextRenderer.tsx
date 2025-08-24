"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import {
  calculateCharacterStates,
  groupCharactersByWords,
} from "@/utils/textState";
import { CharacterRenderer } from "./CharacterRenderer";
import { SpaceRenderer } from "./SpaceRenderer";
import { useDeviceContext, getTypingTextClassName } from "@/utils/deviceDetection";

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
export function TextRenderer({
  text,
  currentIndex,
  userInput,
  mistakes,
  isPaused = false,
  className = "",
}: TextRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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
      const targetIndex = currentIndex < 0 ? 0 : currentIndex;
      const currentElement = document.querySelector(
        `[data-index="${targetIndex}"]`
      );
      const textContainer = containerRef.current?.querySelector(
        ".typing-text-container"
      );

      if (currentElement && textContainer) {
        if (isMobile) {
          // 모바일: 성능 최적화된 스크롤링
          const windowHeight = 192;
          const windowCenter = windowHeight / 2;

          // requestAnimationFrame으로 성능 최적화
          rafId = requestAnimationFrame(() => {
            const textContainerRect = textContainer.getBoundingClientRect();
            const elementRect = (currentElement as HTMLElement).getBoundingClientRect();

            const relativeTop = elementRect.top - textContainerRect.top + textContainer.scrollTop;
            const targetScrollTop = relativeTop - windowCenter;

            if (currentIndex <= 0 && !isPaused) {
              textContainer.scrollTo({
                top: Math.max(0, targetScrollTop),
                behavior: "instant",
              });
            } else {
              // 모바일에서는 더 부드러운 스크롤을 위해 직접 설정
              textContainer.scrollTop = Math.max(0, targetScrollTop);
            }
          });
        } else {
          // PC: 기존 로직 유지
          rafId = requestAnimationFrame(() => {
            const containerHeight = textContainer.clientHeight;
            const targetPosition = containerHeight * 0.33;

            const textContainerRect = textContainer.getBoundingClientRect();
            const elementRect = (currentElement as HTMLElement).getBoundingClientRect();

            const relativeTop = elementRect.top - textContainerRect.top + textContainer.scrollTop;
            const targetScrollTop = relativeTop - targetPosition;

            if (currentIndex <= 0) {
              textContainer.scrollTo({
                top: 0,
                behavior: "instant",
              });
            } else {
              (textContainer as HTMLElement).style.scrollBehavior = isPaused ? "instant" : "smooth";
              textContainer.scrollTop = Math.max(0, targetScrollTop);
            }
          });
        }
      }
    };

    // 모바일에서는 더 적극적인 쓰로틀링 적용 (성능 향상)
    const throttleDelay = isMobile ? 33 : 16; // 모바일 30fps, PC 60fps
    
    const throttledScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (rafId) cancelAnimationFrame(rafId);
      
      scrollTimeout = setTimeout(scrollToCurrentPosition, throttleDelay);
    };

    throttledScroll();

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [currentIndex, isPaused, text.length, isMobile]);

  // 메인 렌더링
  const renderContent = () => {
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
  };

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
          {/* 위쪽 블러 그라데이션 마스크 - 외층 (강한 블러) */}
          <div
            className="blur-mask-top-outer"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "var(--blur-height)",
              background: `linear-gradient(to bottom, 
                var(--color-background) 0%, 
                color-mix(in srgb, var(--color-background) 95%, transparent) 30%,
                color-mix(in srgb, var(--color-background) 80%, transparent) 50%,
                color-mix(in srgb, var(--color-background) 50%, transparent) 70%,
                color-mix(in srgb, var(--color-background) 20%, transparent) 85%, 
                transparent 100%)`,
              backdropFilter: "blur(12px)",
              zIndex: 12,
              pointerEvents: "none",
            }}
          />
          
          {/* 위쪽 블러 그라데이션 마스크 - 내층 (부드러운 블러) */}
          <div
            className="blur-mask-top-inner"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "calc(var(--blur-height) * 0.7)",
              background: `linear-gradient(to bottom, 
                var(--color-background) 0%, 
                color-mix(in srgb, var(--color-background) 90%, transparent) 40%,
                color-mix(in srgb, var(--color-background) 60%, transparent) 70%, 
                transparent 100%)`,
              backdropFilter: "blur(4px)",
              zIndex: 11,
              pointerEvents: "none",
            }}
          />
          
          {/* 아래쪽 블러 그라데이션 마스크 - 외층 (강한 블러) */}
          <div
            className="blur-mask-bottom-outer"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "var(--blur-height)",
              background: `linear-gradient(to top, 
                var(--color-background) 0%, 
                color-mix(in srgb, var(--color-background) 95%, transparent) 30%,
                color-mix(in srgb, var(--color-background) 80%, transparent) 50%,
                color-mix(in srgb, var(--color-background) 50%, transparent) 70%,
                color-mix(in srgb, var(--color-background) 20%, transparent) 85%, 
                transparent 100%)`,
              backdropFilter: "blur(12px)",
              zIndex: 12,
              pointerEvents: "none",
            }}
          />
          
          {/* 아래쪽 블러 그라데이션 마스크 - 내층 (부드러운 블러) */}
          <div
            className="blur-mask-bottom-inner"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "calc(var(--blur-height) * 0.7)",
              background: `linear-gradient(to top, 
                var(--color-background) 0%, 
                color-mix(in srgb, var(--color-background) 90%, transparent) 40%,
                color-mix(in srgb, var(--color-background) 60%, transparent) 70%, 
                transparent 100%)`,
              backdropFilter: "blur(4px)",
              zIndex: 11,
              pointerEvents: "none",
            }}
          />

          <div
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
}

