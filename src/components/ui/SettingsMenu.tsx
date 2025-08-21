"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Settings, Ghost, Sparkles } from 'lucide-react';
import { Button } from '@/design-system/ui';
import { TypingSettingsPanel, TestModeSelector, TestTargetSelector, TextTypeSelector } from '@/design-system/typing';
import { ThemeSelector } from './ThemeSelector';
import { useSettingsStore } from '@/stores/settingsStore';

function TextTypeButtons() {
  const { textType, setTextType } = useSettingsStore();
  
  const basicTypes = [
    { value: 'words', label: '일반' },
    { value: 'punctuation', label: '구두점' },
    { value: 'numbers', label: '숫자' }
  ];
  
  const sentenceTypes = [
    { value: 'short-sentences', label: '단문' },
    { value: 'medium-sentences', label: '중문' },
    { value: 'long-sentences', label: '장문' }
  ];
  
  const renderButton = (type: string, label: string) => {
    const isActive = textType === type;
    
    return (
      <button
        key={type}
        className="px-2 py-1 text-xs rounded-md transition-all"
        style={{
          backgroundColor: isActive 
            ? 'var(--color-interactive-primary)' 
            : 'transparent',
          color: isActive 
            ? 'var(--color-text-inverse)' 
            : 'var(--color-text-secondary)',
          border: `1px solid ${isActive 
            ? 'var(--color-interactive-primary)' 
            : 'var(--color-border)'}`
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }
        }}
        onClick={() => setTextType(type as any)}
      >
        {label}
      </button>
    );
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {basicTypes.map(({value, label}) => renderButton(value, label))}
      </div>
      <div className="flex flex-wrap gap-1">
        {sentenceTypes.map(({value, label}) => renderButton(value, label))}
      </div>
    </div>
  );
}

interface SettingsMenuProps {
  className?: string;
}

export function SettingsMenu({ className = '' }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    ghostModeEnabled,
    typingEffectsEnabled,
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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 설정 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        설정
      </Button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 p-4 min-w-80 z-[9999] shadow-2xl rounded-lg backdrop-blur-sm"
          style={{ 
            backgroundColor: 'var(--color-background-elevated)', 
            borderColor: 'var(--color-border)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div className="space-y-6">
            {/* 기본 설정 */}
            <div>
              <h3 
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                기본 설정
              </h3>
              <div className="space-y-4">
                <div>
                  <label 
                    className="text-xs mb-2 block font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    모드
                  </label>
                  <TestModeSelector />
                </div>
                
                <div>
                  <label 
                    className="text-xs mb-2 block font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    목표값
                  </label>
                  <TestTargetSelector />
                </div>
                
                <div>
                  <label 
                    className="text-xs mb-2 block font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    텍스트 타입
                  </label>
                  <TextTypeButtons />
                </div>
              </div>
            </div>

            {/* 테마 설정 */}
            <div>
              <h3 
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                테마 선택
              </h3>
              <ThemeSelector />
            </div>

            {/* 고급 기능 */}
            <div>
              <h3 
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                고급 기능
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ghost 
                      className="w-4 h-4" 
                      style={{ color: 'var(--color-text-tertiary)' }}
                    />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      고스트 모드
                    </span>
                  </div>
                  <button
                    className={`px-3 py-1 text-xs rounded-full transition-all font-medium ${
                      ghostModeEnabled ? 'shadow-sm' : ''
                    }`}
                    style={{
                      backgroundColor: ghostModeEnabled 
                        ? 'var(--color-interactive-primary)' 
                        : 'transparent',
                      color: ghostModeEnabled 
                        ? 'var(--color-text-inverse)' 
                        : 'var(--color-text-secondary)',
                      border: `1px solid ${ghostModeEnabled 
                        ? 'var(--color-interactive-primary)' 
                        : 'var(--color-border)'}`
                    }}
                    onClick={() => setGhostModeEnabled(!ghostModeEnabled)}
                  >
                    {ghostModeEnabled ? "ON" : "OFF"}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles 
                      className="w-4 h-4" 
                      style={{ color: 'var(--color-text-tertiary)' }}
                    />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      타이핑 이펙트
                    </span>
                  </div>
                  <button
                    className={`px-3 py-1 text-xs rounded-full transition-all font-medium ${
                      typingEffectsEnabled ? 'shadow-sm' : ''
                    }`}
                    style={{
                      backgroundColor: typingEffectsEnabled 
                        ? 'var(--color-interactive-primary)' 
                        : 'transparent',
                      color: typingEffectsEnabled 
                        ? 'var(--color-text-inverse)' 
                        : 'var(--color-text-secondary)',
                      border: `1px solid ${typingEffectsEnabled 
                        ? 'var(--color-interactive-primary)' 
                        : 'var(--color-border)'}`
                    }}
                    onClick={() => setTypingEffectsEnabled(!typingEffectsEnabled)}
                  >
                    {typingEffectsEnabled ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}