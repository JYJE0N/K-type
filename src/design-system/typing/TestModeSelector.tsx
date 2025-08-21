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
    <ButtonGroup className={className} spacing="1">
      <Button
        variant={testMode === "time" ? "primary" : "outline"}
        size="lg"
        onClick={() => setTestMode("time")}
        className="flex items-center gap-2"
      >
        <Clock className="w-5 h-5" />
        시간
      </Button>
      
      <Button
        variant={testMode === "words" ? "primary" : "outline"}
        size="lg" 
        onClick={() => setTestMode("words")}
        className="flex items-center gap-2"
      >
        <Hash className="w-5 h-5" />
        단어
      </Button>
    </ButtonGroup>
  );
};