"use client";

import React from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { language, setLanguage } = useSettingsStore();
  const isKorean = language === 'korean';

  const toggleLanguage = () => {
    setLanguage(isKorean ? 'english' : 'korean');
  };

  return (
    <div className={`${className}`}>
      {/* iOS 스타일 토글 스위치 */}
      <button
        onClick={toggleLanguage}
        className="relative flex items-center px-1 py-1 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        style={{
          width: '120px',
          height: '40px',
          backgroundColor: isKorean ? 'var(--color-interactive-primary)' : 'var(--color-interactive-secondary)',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        aria-label={`언어 변경: 현재 ${isKorean ? '한국어' : 'English'}`}
      >
        {/* 배경 라벨들 */}
        <div className="absolute inset-0 flex items-center justify-between px-4 text-sm font-bold pointer-events-none">
          <span 
            className={`transition-all duration-300 ${isKorean ? 'opacity-30' : 'opacity-100'}`}
            style={{ color: 'white' }}
          >
            한글
          </span>
          <span 
            className={`transition-all duration-300 ${!isKorean ? 'opacity-30' : 'opacity-100'}`}
            style={{ color: 'white' }}
          >
            ENG
          </span>
        </div>

        {/* 슬라이더 (완전한 원형) */}
        <div
          className="absolute w-8 h-8 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center"
          style={{
            transform: isKorean ? 'translateX(4px)' : 'translateX(76px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Globe 
            className="w-4 h-4 transition-colors duration-300" 
            style={{ 
              color: isKorean ? 'var(--color-interactive-primary)' : 'var(--color-interactive-secondary)'
            }} 
          />
        </div>
      </button>
    </div>
  );
}