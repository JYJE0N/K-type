"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import {
  calculateCharacterStates,
  groupCharactersByWords,
} from "@/utils/textState";
import { CharacterRenderer } from "./CharacterRenderer";
import { SpaceRenderer } from "./SpaceRenderer";

interface TextRendererProps {
  text: string;
  currentIndex: number;
  userInput: string;
  mistakes: number[];
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
  className = "",
}: TextRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  // SSR 안전한 모바일 감지 (hydration 차단 방지)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // 초기 설정은 mount 후에만
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 문자별 상태 계산 (메모이제이션)
  const characterStates = useMemo(() => {
    return calculateCharacterStates(text, currentIndex, userInput, mistakes);
  }, [text, currentIndex, userInput, mistakes]);

  // 단어별 그룹화 (렌더링 최적화)
  const wordGroups = useMemo(() => {
    return groupCharactersByWords(text, characterStates);
  }, [text, characterStates]);

  // 모바일 고정 윈도우 내부 스크롤 - "구멍뚫은 종이" 방식
  useEffect(() => {
    if (!isMobile) return;

    let scrollTimeout: NodeJS.Timeout;

    const scrollToCurrentPosition = () => {
      const targetIndex = currentIndex < 0 ? 0 : currentIndex;
      const currentElement = document.querySelector(
        `[data-index="${targetIndex}"]`
      );
      const textContainer = containerRef.current?.querySelector(
        ".typing-text-container"
      );


      if (currentElement && textContainer) {
        // 고정 윈도우의 높이를 CSS 변수에서 가져오기 (12rem = 192px)
        const windowHeight = 192; // TODO: CSS 변수로 동적 계산 가능
        const windowCenter = windowHeight / 2; // 72px - 가운데 줄

        // 현재 요소의 절대 위치를 텍스트 컨테이너 기준으로 계산
        const textContainerRect = textContainer.getBoundingClientRect();
        const elementRect = (
          currentElement as HTMLElement
        ).getBoundingClientRect();

        // 텍스트 컨테이너 내에서 현재 요소의 상대적 위치
        const relativeTop =
          elementRect.top - textContainerRect.top + textContainer.scrollTop;

        // 현재 타이핑 위치가 윈도우 가운데 줄에 오도록 스크롤 계산
        const targetScrollTop = relativeTop - windowCenter;


        // 부드러운 내부 스크롤 - 더 자연스러운 곡선 애니메이션
        if (currentIndex <= 0) {
          textContainer.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: "instant",
          });
        } else {
          // CSS transition으로 더 부드러운 스크롤
          (textContainer as HTMLElement).style.scrollBehavior = "smooth";
          textContainer.scrollTop = Math.max(0, targetScrollTop);
        }

      }
    };

    // 쓰로틀링 적용 - 더 부드러운 모션을 위해 딜레이 줄임
    const throttledScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(
        scrollToCurrentPosition,
        currentIndex <= 0 ? 0 : 16
      ); // 60fps에 맞춰 16ms
    };

    throttledScroll();

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [currentIndex, isMobile]);

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
            top: "var(--mobile-window-top)",
            left: "1rem",
            right: "1rem",
            height: "var(--mobile-window-height)",
            overflow: "hidden",
            zIndex: 10,
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
              height: "100%", // 부모 높이에 맞춤
              overflow: "auto", // 스크롤 가능
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              padding: "1rem",
            }}
          >
            {/* 실제 스크롤되는 텍스트 컨테이너 */}
            <div
              className="mobile-typing-text"
              style={{
                minHeight: "300vh", // 더 넉넉한 높이로 맥락 확보
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "flex-start",
                paddingTop: "3rem", // 더 많은 위쪽 여백으로 맥락 표시
                paddingBottom: "3rem", // 더 많은 아래쪽 여백으로 맥락 표시
              }}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      ) : (
        // PC: 기존 방식
        <div className="typing-text-container desktop-typing-text font-korean text-2xl px-6 py-6 bg-transparent rounded-lg border-2 border-transparent text-center flex flex-wrap justify-center items-baseline transition-all duration-300 ease-in-out">
          {renderContent()}
        </div>
      )}
    </div>
  );
}

