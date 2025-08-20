"use client";

import { useState, useEffect } from "react";

interface TypingLogoProps {
  className?: string;
}

export function TypingLogo({ className = '' }: TypingLogoProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "월루 타자기";
  const typingSpeed = 150; // ms per character
  const cursorBlinkSpeed = 500; // ms

  // 타이핑 애니메이션 효과
  useEffect(() => {
    let currentIndex = 0;
    
    const typeNextCharacter = () => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextCharacter, typingSpeed);
      }
    };

    // 컴포넌트 마운트 후 잠시 대기 후 타이핑 시작
    const startTimeout = setTimeout(() => {
      typeNextCharacter();
    }, 1000);

    return () => {
      clearTimeout(startTimeout);
    };
  }, []);

  // 커서 깜빡임 효과
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, cursorBlinkSpeed);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className={`flex items-center ${className}`}>
      <h1 className="text-title font-bold text-text-primary">
        {displayedText}
        <span 
          className={`inline-block w-0.5 ml-1 bg-interactive-primary transition-opacity duration-150 ${
            showCursor ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ height: '1.2em' }}
          aria-hidden="true"
        />
      </h1>
    </div>
  );
}