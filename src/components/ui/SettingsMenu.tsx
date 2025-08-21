"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Settings, Ghost, Sparkles } from 'lucide-react';
import { Button } from '@/design-system/ui';
import { TypingSettingsPanel, TestModeSelector, TestTargetSelector, TextTypeSelector } from '@/design-system/typing';
import { ThemeSelector } from './ThemeSelector';
import { useSettingsStore } from '@/stores/settingsStore';

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
        <div className="absolute right-0 top-full mt-2 p-4 min-w-80 z-[9999] shadow-2xl bg-gray-800 border border-gray-700 rounded-lg backdrop-blur-sm">
          <div className="space-y-6">
            {/* 기본 설정 */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                기본 설정
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    테스트 모드
                  </label>
                  <TestModeSelector />
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    목표값
                  </label>
                  <TestTargetSelector />
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    텍스트 타입
                  </label>
                  <TextTypeSelector layout="horizontal" showIcons />
                </div>
              </div>
            </div>

            {/* 테마 설정 */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                테마
              </h3>
              <ThemeSelector />
            </div>

            {/* 고급 기능 */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                고급 기능
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ghost className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">고스트 모드</span>
                  </div>
                  <Button
                    variant={ghostModeEnabled ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setGhostModeEnabled(!ghostModeEnabled)}
                  >
                    {ghostModeEnabled ? "ON" : "OFF"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">타이핑 이펙트</span>
                  </div>
                  <Button
                    variant={typingEffectsEnabled ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setTypingEffectsEnabled(!typingEffectsEnabled)}
                  >
                    {typingEffectsEnabled ? "ON" : "OFF"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}