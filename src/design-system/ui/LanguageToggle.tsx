"use client";

import React from 'react';
import { Globe } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';

interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  className = '' 
}) => {
  const { language, setLanguage } = useSettingsStore();
  const isKorean = language === 'korean';

  const handleToggle = () => {
    setLanguage(isKorean ? 'english' : 'korean');
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* 토글 스위치 */}
        <button
          onClick={handleToggle}
          className={`
            relative w-20 h-10 rounded-full transition-all duration-500 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:ring-offset-2 focus:ring-offset-background
            hover:scale-105 active:scale-98 transform-gpu overflow-hidden
            ${isKorean 
              ? 'bg-interactive-primary shadow-lg shadow-interactive-primary/20 border-2 border-interactive-primary' 
              : 'bg-interactive-secondary shadow-lg shadow-interactive-secondary/20 border-2 border-interactive-secondary'
            }
          `}
          aria-label={`언어 변경: 현재 ${isKorean ? '한국어' : '영어'}`}
        >
          {/* 슬라이더 원 with 지구본 아이콘 */}
          <div
            className="absolute w-8 h-8 bg-white rounded-full shadow-lg transform-gpu will-change-transform z-10 flex items-center justify-center"
            style={{
              top: '50%',
              transform: isKorean ? 'translateX(44px) translateY(-50%)' : 'translateX(4px) translateY(-50%)',
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <Globe 
              className={`w-4 h-4 transition-all duration-300 ${
                isKorean ? 'text-interactive-primary' : 'text-interactive-secondary'
              }`} 
            />
          </div>
          
          {/* 텍스트 라벨들 - 슬라이더 반대편에 표시 */}
          <div className="absolute inset-0 flex items-center justify-between px-2 z-0">
            <span 
              className={`text-xs font-bold transition-all duration-400 ease-out ${
                !isKorean 
                  ? 'opacity-0 scale-0' 
                  : 'opacity-100 scale-100'
              }`}
              style={{
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                color: 'white'
              }}
            >
              한글
            </span>
            <span 
              className={`text-xs font-bold transition-all duration-400 ease-out ${
                isKorean 
                  ? 'opacity-0 scale-0' 
                  : 'opacity-100 scale-100'
              }`}
              style={{
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                color: 'white'
              }}
            >
              ENG
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};