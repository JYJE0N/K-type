/**
 * ⚙️ TypingSettingsPanel - Unified Settings Panel
 * 모든 타이핑 설정을 한 곳에서 관리하는 통합 패널
 * Header와 SettingsMenu의 중복을 제거하고 단일 책임 원칙 적용
 */

import React from 'react';
import { Card } from '@/design-system/ui';
import { 
  TestModeSelector,
  TestTargetSelector, 
  TextTypeSelector
} from './';

interface TypingSettingsPanelProps {
  layout?: 'compact' | 'expanded';
  className?: string;
}

export const TypingSettingsPanel: React.FC<TypingSettingsPanelProps> = ({
  layout = 'compact',
  className = ''
}) => {
  if (layout === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-4 ${className}`}>
        <TestModeSelector />
        <TestTargetSelector />
      </div>
    );
  }

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground-secondary mb-3">
            테스트 모드
          </h3>
          <TestModeSelector />
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground-secondary mb-3">
            목표값
          </h3>
          <TestTargetSelector />
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground-secondary mb-3">
            텍스트 타입
          </h3>
          <TextTypeSelector layout="horizontal" />
        </div>

      </div>
    </Card>
  );
};