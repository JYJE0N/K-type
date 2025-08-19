"use client";

import { useMemo } from "react";

interface TextRendererProps {
  text: string;
  currentIndex: number;
  userInput: string;
  mistakes: number[]; // 실수가 발생한 위치들
  className?: string;
}

export function TextRenderer({
  text,
  currentIndex,
  userInput,
  mistakes,
  className = "",
}: TextRendererProps) {
  // 특수 키 감지 함수
  const getSpecialKeyType = (char: string) => {
    if (char === "\n") return "enter";
    if (char === "\t") return "tab";
    if (char === " ") return "space";
    return null;
  };

  // 문자별 상태 계산 (메모이제이션)
  const characterStates = useMemo(() => {
    return text.split("").map((char, index) => {
      let status: "pending" | "correct" | "incorrect" | "current" = "pending";

      // currentIndex 기준으로 상태 계산
      if (index < currentIndex) {
        // 이미 타이핑한 문자 - userInput과 비교
        const isCorrect = index < userInput.length && userInput[index] === char;
        status = isCorrect ? "correct" : "incorrect";

        // mistakes 배열에서 이 위치의 실수 여부 확인
        const hasMistake = mistakes.includes(index);
        if (hasMistake && !isCorrect) {
          status = "incorrect";
        }
      } else if (index === currentIndex) {
        // 현재 타이핑할 문자
        status = "current";
      }
      // else: 아직 타이핑하지 않은 문자 (pending)

      const specialKey = getSpecialKeyType(char);

      return {
        char,
        status,
        index,
        specialKey,
      };
    });
  }, [text, currentIndex, userInput]);

  // 문자별 스타일 클래스
  const getCharacterClass = (status: string, specialKey?: string | null) => {
    const baseClass = "inline-block transition-colors duration-150 relative";

    // 스페이스에 대한 특별한 스타일
    const isSpace = specialKey === "space";
    const spaceClass = isSpace ? "opacity-60" : "";

    // 특수 키에 대한 추가 클래스 (스페이스는 테두리 제거)
    const specialKeyClass =
      specialKey && !isSpace
        ? "special-key border border-typing-accent border-opacity-50 rounded px-1"
        : "";

    switch (status) {
      case "correct":
        // 올바르게 타이핑한 글자: 파란색 + 페이드 인 효과
        return `${baseClass} ${specialKeyClass} ${isSpace ? 'text-gray-400 opacity-50' : 'text-blue-400 transition-all duration-300 transform scale-105 typing-success'}`;
      case "incorrect":
        // 오타: 빨간색 + 샤키 효과
        return `${baseClass} ${specialKeyClass} text-red-400 font-bold bg-red-500 bg-opacity-10 rounded px-1 border border-red-400 border-opacity-30 shake-animation`;
      case "current":
        // 현재 글자: 보라색 + 글로우 효과 + 언더라인 맥동
        return `${baseClass} ${specialKeyClass} ${isSpace ? 'text-purple-400' : 'text-purple-400 font-semibold'} ${
          specialKey ? "font-bold" : ""
        } current-char-glow pulse-glow`;
      case "pending":
      default:
        // 아직 타이핑하지 않은 글자: 부드러운 회색
        return `${baseClass} ${specialKeyClass} ${isSpace ? 'text-gray-500 opacity-20' : 'text-gray-400 opacity-70 hover:opacity-90 transition-opacity'}`;
    }
  };

  // 특수 키를 시각적으로 표시하는 함수
  const renderSpecialKey = (
    char: string,
    specialKey: string,
    status: string
  ) => {
    const getKeyDisplay = () => {
      switch (specialKey) {
        case "enter":
          return "⏎";
        case "tab":
          return "⇥";
        case "space":
          // 공백 표시를 상태별로 구분하여 더 명확하게
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
  };

  // 단어별로 그룹화하여 렌더링 (줄바꿈 최적화)
  const renderText = () => {
    const words = text.split(" ");
    let charIndex = 0;

    return words.map((word, wordIndex) => {
      const wordChars = word.split("").map((char, localIndex) => {
        const globalIndex = charIndex + localIndex;
        const state = characterStates[globalIndex];

        return (
          <span
            key={globalIndex}
            className="relative"
          >
            <span
              className={getCharacterClass(
                state?.status || "pending",
                state?.specialKey
              )}
              data-index={globalIndex}
            >
              {state?.specialKey
                ? renderSpecialKey(char, state.specialKey, state.status)
                : char}
              {/* 현재 문자 아래 다이내믹 언더바 + 글로우 */}
              {state?.status === "current" && (
                <>
                  <span
                    className="absolute left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-400 opacity-90 rounded-full shadow-lg"
                    style={{
                      bottom: "-3px",
                      animation: "rainbow-pulse 2s ease-in-out infinite, glow-intense 1.5s ease-in-out infinite",
                      filter: "blur(0.5px)",
                      boxShadow: "0 0 10px rgba(168, 85, 247, 0.6), 0 0 20px rgba(168, 85, 247, 0.3)"
                    }}
                  />
                  {/* 글로우 효과 */}
                  <span
                    className="absolute inset-0 rounded transition-all duration-200"
                    style={{
                      background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
                      animation: "char-glow 2s ease-in-out infinite"
                    }}
                  />
                </>
              )}
            </span>
          </span>
        );
      });

      charIndex += word.length + 1; // +1 for space

      // 스페이스 문자 처리
      const spaceIndex = charIndex - 1;
      const spaceState = characterStates[spaceIndex];
      const spaceElement = spaceIndex < text.length && (
        <span
          key={spaceIndex}
          className="relative"
        >
          <span
            className={getCharacterClass(
              spaceState?.status || "pending",
              spaceState?.specialKey
            )}
            data-index={spaceIndex}
          >
            {spaceState?.specialKey
              ? renderSpecialKey(" ", spaceState.specialKey, spaceState.status)
              : " "}
            {/* 현재 스페이스 아래 다이내믹 언더바 */}
            {spaceState?.status === "current" && (
              <>
                <span
                  className="absolute left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-400 opacity-90 rounded-full shadow-lg"
                  style={{
                    bottom: "-3px",
                    animation: "rainbow-pulse 2s ease-in-out infinite, glow-intense 1.5s ease-in-out infinite",
                    filter: "blur(0.5px)",
                    boxShadow: "0 0 10px rgba(168, 85, 247, 0.6), 0 0 20px rgba(168, 85, 247, 0.3)"
                  }}
                />
                <span
                  className="absolute inset-0 rounded transition-all duration-200"
                  style={{
                    background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
                    animation: "char-glow 2s ease-in-out infinite"
                  }}
                />
              </>
            )}
          </span>
        </span>
      );

      return (
        <span
          key={wordIndex}
          className="word-group"
        >
          {wordChars}
          {spaceElement}
        </span>
      );
    });
  };

  return (
    <div className={`text-renderer ${className}`}>
      {/* 표준 타이핑 영역 - 타이핑용 텍스트 */}
      <div
        className="font-korean text-2xl leading-relaxed p-6 bg-transparent rounded-md border-2 border-transparent focus-within:border-typing-accent transition-colors text-center flex flex-wrap justify-center items-baseline"
        style={{
          fontSize: "var(--font-size, 26px)",
          lineHeight: "1.8",
          letterSpacing: "0.05em", // 한글에 적합한 자간
          fontWeight: "500", // 한글 가독성을 위한 적절한 굵기
        }}
      >
        {text ? (
          renderText()
        ) : (
          <div className="text-text-secondary italic text-lg">
            텍스트를 로드하는 중...
          </div>
        )}

        {/* 텍스트 끝 세로 커서 (타이핑 완료 시 깜빡임) */}
        {currentIndex >= text.length && (
          <span
            className="inline-block w-0.5 bg-typing-accent ml-1 rounded-sm cursor-blink"
            style={{
              height: "1.1em", // 폰트 크기에 맞는 높이
              animation: "blink 1s infinite",
              verticalAlign: "text-bottom", // 텍스트 하단 기준 정렬
              position: "relative",
              top: "0.15em", // 더 아래로 내리기
            }}
          />
        )}
      </div>


      {/* 디버그 정보 (삭제됨) */}
      {/* 
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-4 bg-surface rounded-lg">
          <div className="text-sm font-medium text-text-secondary mb-2">
            디버그 정보
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-xs text-text-secondary">
            <div>
              텍스트 길이:{" "}
              <span className="text-text-primary">{text.length}</span>
            </div>
            <div>
              현재 인덱스:{" "}
              <span className="text-text-primary">{currentIndex}</span>
            </div>
            <div>
              사용자 입력 길이:{" "}
              <span className="text-text-primary">{userInput.length}</span>
            </div>
            <div>
              현재 문자:{" "}
              <span className="text-text-primary">
                &quot;{text[currentIndex] || "N/A"}&quot;
              </span>
            </div>
            <div>
              실수 개수:{" "}
              <span className="text-typing-incorrect">{mistakes.length}</span>
            </div>
            <div>
              예상 정확도:{" "}
              <span className="text-typing-correct">
                {Math.round(
                  currentIndex > 0
                    ? ((currentIndex - mistakes.length) / currentIndex) * 100
                    : 100
                )}
                %
              </span>
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  );
}

// 스타일 유틸리티: 문자가 화면에서 벗어나지 않도록 스크롤 조정
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
