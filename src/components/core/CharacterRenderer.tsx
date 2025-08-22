/**
 * 개별 문자 렌더링 컴포넌트
 * 책임: 단일 문자의 시각적 표현, 특수 키 처리, 커서 표시
 */

import { memo } from "react";
import { CharacterState } from "@/utils/textState";

interface CharacterRendererProps {
  state: CharacterState;
  showCursor: boolean;
}

/**
 * 특수 키를 시각적으로 표시하는 함수
 */
function renderSpecialKey(char: string, specialKey: string, status: string) {
  const getKeyDisplay = () => {
    switch (specialKey) {
      case "enter":
        return "⏎";
      case "tab":
        return "⇥";
      case "space":
        // 공백 표시를 상태별로 구분
        if (status === "current") {
          return "⎵"; // 현재 타이핑할 공백
        } else if (status === "incorrect") {
          return "⎵"; // 실수한 공백
        } else if (status === "correct") {
          return "·"; // 올바르게 타이핑한 공백
        } else {
          return "·"; // 아직 타이핑하지 않은 공백
        }
      default:
        return char;
    }
  };

  const getKeyLabel = () => {
    switch (specialKey) {
      case "enter":
        return "Enter";
      case "tab":
        return "Tab";
      case "space":
        return "Space";
      default:
        return null;
    }
  };

  const keyDisplay = getKeyDisplay();
  const keyLabel = getKeyLabel();

  // Enter와 Tab은 특별한 스타일로 표시
  if (specialKey === "enter" || specialKey === "tab") {
    return (
      <span className="special-key-wrapper relative">
        {keyDisplay}
        {status === "current" && keyLabel && (
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <kbd>{keyLabel}</kbd>
          </span>
        )}
      </span>
    );
  }

  return keyDisplay;
}

/**
 * 문자별 스타일 클래스 생성
 */
function getCharacterClass(status: string, specialKey?: string | null) {
  const baseClass = "inline-block transition-colors duration-150 relative";

  // 스페이스에 대한 특별한 스타일
  const isSpace = specialKey === "space";
  
  // 특수 키에 대한 추가 클래스 (스페이스는 테두리 제거)
  const specialKeyClass =
    specialKey && !isSpace
      ? "special-key border border-typing-accent border-opacity-50 rounded px-1"
      : "";

  switch (status) {
    case "correct":
      return `${baseClass} ${specialKeyClass} ${isSpace ? 'opacity-50' : 'transition-all duration-300 transform scale-105 typing-success'} typing-correct-text`;
    case "incorrect":
      return `${baseClass} ${specialKeyClass} font-bold rounded px-1 shake-animation typing-incorrect-text typing-incorrect-bg`;
    case "current":
      return `${baseClass} ${specialKeyClass} typing-current-text`;
    case "pending":
    default:
      return `${baseClass} ${specialKeyClass} ${isSpace ? 'opacity-20' : 'opacity-70 hover:opacity-90 transition-opacity'} typing-pending-text`;
  }
}

export const CharacterRenderer = memo(function CharacterRenderer({ 
  state, 
  showCursor 
}: CharacterRendererProps) {
  const { char, status, index, specialKey } = state;

  return (
    <span key={index} className="relative">
      <span
        className={getCharacterClass(status, specialKey)}
        data-index={index}
      >
        {specialKey
          ? renderSpecialKey(char, specialKey, status)
          : char}
        
        {/* 현재 문자 아래 커서 */}
        {showCursor && status === "current" && (
          <span className="typing-cursor absolute left-0 w-full h-0.5 rounded-sm transition-all duration-150" />
        )}
      </span>
    </span>
  );
});