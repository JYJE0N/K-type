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
    <ButtonGroup className={className} spacing="1">
      {targets.map((target) => (
        <Button
          key={target}
          variant={testTarget === target ? "accent" : "outline"}
          size="base"
          onClick={() => setTestTarget(target)}
        >
          {target}{unit}
        </Button>
      ))}
    </ButtonGroup>
  );
};