"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Settings, Ghost, Sparkles, Clock, Hash, Type } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { useSettingsStore } from '@/stores/settingsStore';
import { overlayStyles, textStyles, cn } from '@/utils/styles';


interface SettingsMenuProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function SettingsMenu({ className = '', isOpen: externalIsOpen, onClose }: SettingsMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 외부에서 isOpen을 제어하는지 내부에서 제어하는지 결정
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onClose ? onClose : (open: boolean) => setInternalIsOpen(open);
  
  const { 
    ghostModeEnabled,
    typingEffectsEnabled,
    setGhostModeEnabled,
    setTypingEffectsEnabled,
    testMode,
    setTestMode,
    testTarget,
    setTestTarget,
    textType,
    setTextType
  } = useSettingsStore();

  // 외부 클릭시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (onClose) {
          onClose();
        } else {
          setInternalIsOpen(false);
        }
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // 설정 옵션 정의
  const testModeOptions = [
    { value: 'time', label: '시간' },
    { value: 'words', label: '단어' }
  ];

  const getTestTargetOptions = () => {
    if (testMode === 'time') {
      return [
        { value: '15', label: '15초' },
        { value: '30', label: '30초' },
        { value: '60', label: '1분' },
        { value: '120', label: '2분' }
      ];
    } else {
      return [
        { value: '10', label: '10단어' },
        { value: '25', label: '25단어' },
        { value: '50', label: '50단어' },
        { value: '100', label: '100단어' }
      ];
    }
  };

  const basicTextTypeOptions = [
    { value: 'words', label: '일반' },
    { value: 'punctuation', label: '구두점' },
    { value: 'numbers', label: '숫자' }
  ];

  const sentenceTextTypeOptions = [
    { value: 'short-sentences', label: '단문' },
    { value: 'medium-sentences', label: '중문' },
    { value: 'long-sentences', label: '장문' }
  ];

  // 설정 컨텐츠 렌더링 함수
  const renderSettingsContent = () => (
    <div className="space-y-6">
      {/* 테스트 설정 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4" style={{ color: 'var(--color-interactive-primary)' }} />
          <h3 
            className="text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            기본 설정
          </h3>
        </div>
        
        <div className="space-y-5">
          {/* 테스트 모드 */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label 
                className="text-sm font-medium block mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                모드
              </label>
              <p 
                className="text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                시간 또는 단어 기준 선택
              </p>
            </div>
            <div className="flex-shrink-0">
              <ButtonGroup
                options={testModeOptions}
                value={testMode}
                onChange={(value) => setTestMode(value as 'time' | 'words')}
                size="md"
              />
            </div>
          </div>

          {/* 목표값 */}
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <label 
                className="text-sm font-medium block mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                목표
              </label>
              <p 
                className="text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                테스트 {testMode === 'time' ? '시간' : '단어 수'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <ButtonGroup
                options={getTestTargetOptions()}
                value={testTarget.toString()}
                onChange={(value) => setTestTarget(parseInt(value))}
                size="md"
              />
            </div>
          </div>

          {/* 텍스트 타입 */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label 
                className="text-sm font-medium block mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                텍스트 타입
              </label>
              <p 
                className="text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                일반 · 구두점 · 숫자
              </p>
            </div>
            <div className="flex-shrink-0">
              <ButtonGroup
                options={basicTextTypeOptions}
                value={basicTextTypeOptions.some(option => option.value === textType) ? textType : ''}
                onChange={(value) => setTextType(value as any)}
                size="md"
              />
            </div>
          </div>

          {/* 문장 타입 */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label 
                className="text-sm font-medium block mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                문장 타입
              </label>
              <p 
                className="text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                단문 · 중문 · 장문
              </p>
            </div>
            <div className="flex-shrink-0">
              <ButtonGroup
                options={sentenceTextTypeOptions}
                value={sentenceTextTypeOptions.some(option => option.value === textType) ? textType : ''}
                onChange={(value) => setTextType(value as any)}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div 
        className="border-t opacity-50"
        style={{ borderColor: 'var(--color-text-tertiary)' }}
      />

      {/* 고급 기능 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--color-interactive-primary)' }} />
          <h3 
            className="text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            고급 설정
          </h3>
        </div>
        
        <div className="space-y-4">
          {/* 고스트 모드 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background-elevated">
                <Ghost className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <span className="text-sm font-medium block text-text-primary">
                  고스트 모드
                </span>
                <p className="text-xs text-text-tertiary">
                  이전 기록과 비교
                </p>
              </div>
            </div>
            <Switch
              checked={ghostModeEnabled}
              onChange={setGhostModeEnabled}
              size="md"
            />
          </div>
          
          {/* 타이핑 이펙트 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background-elevated">
                <Type className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <span className="text-sm font-medium block text-text-primary">
                  타이핑 이펙트
                </span>
                <p className="text-xs text-text-tertiary">
                  시각적 효과 활성화
                </p>
              </div>
            </div>
            <Switch
              checked={typingEffectsEnabled}
              onChange={setTypingEffectsEnabled}
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // 외부에서 제어하는 경우 버튼을 렌더링하지 않음
  if (externalIsOpen !== undefined) {
    return isOpen ? (
      <div 
        ref={dropdownRef}
        className="absolute right-6 top-full mt-2 p-6 min-w-96 z-[9999] shadow-2xl rounded-xl backdrop-blur-sm"
        style={{ 
          backgroundColor: 'var(--color-background)', 
          borderColor: 'var(--color-border)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {renderSettingsContent()}
      </div>
    ) : null;
  }

  // 내부에서 제어하는 기존 방식
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 설정 버튼 */}
      <button
        onClick={() => setInternalIsOpen(!internalIsOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        style={{
          backgroundColor: internalIsOpen ? 'var(--color-background-elevated)' : 'transparent',
          color: 'var(--color-text-secondary)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)';
        }}
        onMouseLeave={(e) => {
          if (!internalIsOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <Settings className="w-4 h-4" />
        설정
      </button>

      {/* 드롭다운 메뉴 */}
      {internalIsOpen && (
        <div 
          className="absolute right-0 top-full mt-2 p-6 min-w-96 z-[9999] shadow-2xl rounded-xl backdrop-blur-sm"
          style={{ 
            backgroundColor: 'var(--color-background)', 
            borderColor: 'var(--color-border)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {renderSettingsContent()}
        </div>
      )}
    </div>
  );
}