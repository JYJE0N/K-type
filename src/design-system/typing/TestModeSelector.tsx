/**
 * 🎯 TestModeSelector - Single Responsibility
 * 테스트 모드 선택 (시간/단어) 전용 컴포넌트
 */

import React from 'react';
import { Clock, Hash } from 'lucide-react';
import { Button, ButtonGroup } from '@/design-system/ui';
import { useSettingsStore } from '@/stores/settingsStore';

interface TestModeSelectorProps {
  className?: string;
}

export const TestModeSelector: React.FC<TestModeSelectorProps> = ({ 
  className = '' 
}) => {
  const { testMode, setTestMode } = useSettingsStore();
  
  return (
    <div className={`flex gap-1 ${className}`}>
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all font-medium"
        style={{
          backgroundColor: testMode === "time" 
            ? 'var(--color-interactive-primary)' 
            : 'transparent',
          color: testMode === "time" 
            ? 'var(--color-text-inverse)' 
            : 'var(--color-text-secondary)',
          border: `1px solid ${testMode === "time" 
            ? 'var(--color-interactive-primary)' 
            : 'var(--color-border)'}`
        }}
        onMouseEnter={(e) => {
          if (testMode !== "time") {
            e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (testMode !== "time") {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }
        }}
        onClick={() => setTestMode("time")}
      >
        <Clock className="w-4 h-4" />
        시간
      </button>
      
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all font-medium"
        style={{
          backgroundColor: testMode === "words" 
            ? 'var(--color-interactive-primary)' 
            : 'transparent',
          color: testMode === "words" 
            ? 'var(--color-text-inverse)' 
            : 'var(--color-text-secondary)',
          border: `1px solid ${testMode === "words" 
            ? 'var(--color-interactive-primary)' 
            : 'var(--color-border)'}`
        }}
        onMouseEnter={(e) => {
          if (testMode !== "words") {
            e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (testMode !== "words") {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }
        }}
        onClick={() => setTestMode("words")}
      >
        <Hash className="w-4 h-4" />
        단어
      </button>
    </div>
  );
};