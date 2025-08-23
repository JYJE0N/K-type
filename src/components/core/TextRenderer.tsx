"use client";

import { useMemo, useEffect, useRef } from "react";
import { calculateCharacterStates, groupCharactersByWords } from "@/utils/textState";
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  // 문자별 상태 계산 (메모이제이션)
  const characterStates = useMemo(() => {
    return calculateCharacterStates(text, currentIndex, userInput, mistakes);
  }, [text, currentIndex, userInput, mistakes]);

  // 단어별 그룹화 (렌더링 최적화)
  const wordGroups = useMemo(() => {
    return groupCharactersByWords(text, characterStates);
  }, [text, characterStates]);

  // 모바일에서 현재 위치 자동 스크롤
  useEffect(() => {
    if (!isMobile || currentIndex < 0) return;
    
    const scrollToCurrentPosition = () => {
      const currentElement = document.querySelector(`[data-index="${currentIndex}"]`);
      if (currentElement && containerRef.current) {
        // 가상키보드 고려하여 스크롤 위치 조정
        const rect = currentElement.getBoundingClientRect();
        
        // 화면 높이의 30% 지점에 현재 위치가 오도록 조정 (가상키보드 공간 확보)
        const targetY = window.innerHeight * 0.3;
        const scrollY = rect.top - targetY;
        
        if (Math.abs(scrollY) > 50) { // 50px 이상 차이날 때만 스크롤
          window.scrollBy({
            top: scrollY,
            behavior: 'smooth'
          });
        }
      }
    };
    
    // 약간의 지연 후 스크롤 (렌더링 완료 대기)
    const timer = setTimeout(scrollToCurrentPosition, 100);
    
    return () => clearTimeout(timer);
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
          <span key={wordIndex} className="word-group">
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
          <span className="end-cursor inline-block w-0.5 bg-typing-accent ml-1 rounded-sm" />
        )}
      </>
    );
  };

  return (
    <div className={`text-renderer ${className}`} ref={containerRef}>
      {/* 최적화된 타이핑 영역 */}
      <div className={`typing-text-container font-korean leading-relaxed p-6 bg-transparent rounded-lg border-2 border-transparent text-center flex flex-wrap justify-center items-baseline transition-all duration-300 ease-in-out ${
        isMobile ? 'text-xl px-4 py-8' : 'text-2xl px-6'
      }`}>
        {renderContent()}
      </div>
    </div>
  );
}

// 스크롤 유틸리티 (별도 유지)
export function scrollToCurrentCharacter(currentIndex: number) {
  const currentChar = document.querySelector(`[data-index="${currentIndex}"]`);
  if (currentChar) {
    currentChar.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }
}