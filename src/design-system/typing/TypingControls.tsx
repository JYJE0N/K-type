/**
 * 🎮 TypingControls - Single Responsibility
 * 타이핑 테스트 제어 버튼들 (시작, 일시정지, 중단 등)
 */

import React from 'react';
import { PlayCircle, PauseCircle, StopCircle } from 'lucide-react';
import { Button, ButtonGroup } from '@/design-system/ui';

interface TypingControlsProps {
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isCountingDown: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  className?: string;
}

export const TypingControls: React.FC<TypingControlsProps> = ({
  isActive,
  isPaused,
  isCompleted,
  isCountingDown,
  onStart,
  onPause, 
  onResume,
  onStop,
  className = ''
}) => {
  // 시작 전 상태
  if (!isActive && !isCompleted && !isCountingDown) {
    return (
      <div className={`flex justify-center ${className}`}>
        <Button
          variant="primary"
          size="xl"
          onClick={onStart}
          className="hover:scale-105 active:scale-95"
        >
          시작하기
        </Button>
      </div>
    );
  }
  
  // 활성 상태 (타이핑 중)
  if (isActive && !isPaused && !isCompleted) {
    return (
      <ButtonGroup className={`justify-center ${className}`} spacing={4}>
        <Button
          variant="secondary"
          size="lg"
          onClick={onPause}
          className="flex items-center gap-2"
        >
          <PauseCircle className="w-5 h-5" />
          일시정지
        </Button>
        
        <Button
          variant="ghost"
          size="lg"
          onClick={onStop}
          className="flex items-center gap-2"
        >
          <StopCircle className="w-5 h-5" />
          중단
        </Button>
      </ButtonGroup>
    );
  }
  
  // 일시정지 상태
  if (isPaused) {
    return (
      <ButtonGroup className={`justify-center ${className}`} spacing={4}>
        <Button
          variant="primary"
          size="lg"
          onClick={onResume}
          className="flex items-center gap-2"
        >
          <PlayCircle className="w-5 h-5" />
          계속
        </Button>
        
        <Button
          variant="ghost"
          size="lg"
          onClick={onStop}
          className="flex items-center gap-2"
        >
          <StopCircle className="w-5 h-5" />
          중단
        </Button>
      </ButtonGroup>
    );
  }
  
  // 기본적으로 아무것도 렌더링하지 않음 (완료 상태 등)
  return null;
};