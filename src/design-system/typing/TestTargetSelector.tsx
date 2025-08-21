/**
 * 🎯 TestTargetSelector - Single Responsibility  
 * 테스트 목표값 선택 (15초, 30초 등) 전용 컴포넌트
 */

import React from 'react';
import { Button, ButtonGroup } from '@/design-system/ui';
import { useSettingsStore } from '@/stores/settingsStore';

interface TestTargetSelectorProps {
  className?: string;
}

export const TestTargetSelector: React.FC<TestTargetSelectorProps> = ({ 
  className = '' 
}) => {
  const { testMode, testTarget, setTestTarget } = useSettingsStore();
  
  const timeTargets = [15, 30, 60, 120];
  const wordTargets = [10, 25, 50, 100];
  const targets = testMode === "time" ? timeTargets : wordTargets;
  const unit = testMode === "time" ? "초" : "단어";
  
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {targets.map((target) => {
        const isActive = testTarget === target;
        
        return (
          <button
            key={target}
            className="px-3 py-2 text-sm rounded-md transition-all font-medium"
            style={{
              backgroundColor: isActive 
                ? 'var(--color-interactive-secondary)' 
                : 'transparent',
              color: isActive 
                ? 'var(--color-text-inverse)' 
                : 'var(--color-text-secondary)',
              border: `1px solid ${isActive 
                ? 'var(--color-interactive-secondary)' 
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
            onClick={() => setTestTarget(target)}
          >
            {target}{unit}
          </button>
        );
      })}
    </div>
  );
};