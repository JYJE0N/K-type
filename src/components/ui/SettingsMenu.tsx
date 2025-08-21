"use client";

import { useState, useRef, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { ThemeSelector } from "./ThemeSelector";
import { Settings, Clock, Hash, FileText, Target, Ghost, Sparkles } from "lucide-react";

interface SettingsMenuProps {
  className?: string;
}

export function SettingsMenu({ className = '' }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    testMode, 
    testTarget, 
    textType,
    ghostModeEnabled,
    typingEffectsEnabled,
    setTestMode, 
    setTestTarget, 
    setTextType,
    setGhostModeEnabled,
    setTypingEffectsEnabled
  } = useSettingsStore();

  // 외부 클릭시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const testModeOptions = [
    { value: 'time', label: '시간 모드', icon: Clock },
    { value: 'words', label: '단어 모드', icon: Hash }
  ];

  const timeTargets = [15, 30, 60, 120];
  const wordTargets = [10, 25, 50, 100];

  const textTypeOptions = [
    { value: 'words', label: '일반 단어', icon: FileText },
    { value: 'punctuation', label: '구두점 포함', icon: Target },
    { value: 'numbers', label: '숫자 포함', icon: Hash },
    { value: 'sentences', label: '문장 연습', icon: FileText }
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 p-2 rounded-lg
          text-text-secondary hover:text-text-primary
          hover:bg-background-secondary
          transition-all duration-200
          ${isOpen ? 'bg-background-secondary text-text-primary' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className={`
          absolute top-full right-0 mt-2 w-56
          bg-background-elevated rounded-lg 
          border border-text-tertiary/30
          shadow-xl shadow-black/40
          z-[9999]
          animate-in slide-in-from-top-2 duration-200
        `}>
          <div className="p-3">
            {/* 테스트 모드 선택 */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                테스트 모드
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {testModeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTestMode(option.value as any)}
                      className={`
                        flex items-center gap-2 p-2 rounded-md text-sm
                        transition-all duration-150
                        ${testMode === option.value
                          ? 'bg-interactive-primary bg-opacity-10 text-interactive-primary border border-interactive-primary border-opacity-30'
                          : 'text-text-secondary hover:text-text-primary hover:bg-background-elevated'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 목표값 선택 */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                {testMode === 'time' ? '시간 (초)' : '단어 수'}
              </h3>
              <div className="grid grid-cols-4 gap-1">
                {(testMode === 'time' ? timeTargets : wordTargets).map((target) => (
                  <button
                    key={target}
                    onClick={() => setTestTarget(target)}
                    className={`
                      p-2 rounded-md text-sm text-center
                      transition-all duration-150
                      ${testTarget === target
                        ? 'bg-interactive-primary text-text-inverse'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-elevated'
                      }
                    `}
                  >
                    {target}
                  </button>
                ))}
              </div>
            </div>

            {/* 텍스트 종류 선택 */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                텍스트 종류
              </h3>
              <div className="space-y-1">
                {textTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTextType(option.value as any)}
                      className={`
                        w-full flex items-center gap-3 p-2 rounded-md text-sm
                        transition-all duration-150 text-left
                        ${textType === option.value
                          ? 'bg-interactive-primary bg-opacity-10 text-interactive-primary'
                          : 'text-text-secondary hover:text-text-primary hover:bg-background-elevated'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 테마 및 고급 옵션 */}
            <div className="border-t border-text-tertiary border-opacity-10 pt-3">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                기타 설정
              </h3>
              <div className="space-y-3">
                {/* 테마 선택 */}
                <div>
                  <span className="text-sm text-text-primary mb-2 block">테마</span>
                  <ThemeSelector />
                </div>
                
                {/* 고스트 모드 토글 */}
                <label className="flex items-center justify-between p-2 rounded-md hover:bg-background-elevated transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Ghost className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-text-primary">고스트 모드</span>
                  </div>
                  <div 
                    className={`
                      relative inline-flex w-10 h-5 items-center rounded-full 
                      transition-colors duration-200
                      ${ghostModeEnabled ? 'bg-purple-500' : 'bg-text-tertiary bg-opacity-30'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={ghostModeEnabled}
                      onChange={(e) => setGhostModeEnabled(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`
                        inline-block w-3 h-3 bg-white rounded-full 
                        transform transition-transform duration-200
                        ${ghostModeEnabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </div>
                </label>
                
                {/* 타이핑 이펙트 토글 */}
                <label className="flex items-center justify-between p-2 rounded-md hover:bg-background-elevated transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-text-primary">타이핑 이펙트</span>
                  </div>
                  <div 
                    className={`
                      relative inline-flex w-10 h-5 items-center rounded-full 
                      transition-colors duration-200
                      ${typingEffectsEnabled ? 'bg-yellow-500' : 'bg-text-tertiary bg-opacity-30'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={typingEffectsEnabled}
                      onChange={(e) => setTypingEffectsEnabled(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`
                        inline-block w-3 h-3 bg-white rounded-full 
                        transform transition-transform duration-200
                        ${typingEffectsEnabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}