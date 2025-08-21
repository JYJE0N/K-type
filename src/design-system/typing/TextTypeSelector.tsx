/**
 * 📝 TextTypeSelector - Single Responsibility
 * 텍스트 타입 선택 (일반, 구두점, 숫자 등) 전용 컴포넌트  
 */

import React from 'react';
import { FileText, Target, Hash } from 'lucide-react';
import { Button, ButtonGroup } from '@/design-system/ui';
import { useSettingsStore } from '@/stores/settingsStore';

interface TextTypeSelectorProps {
  layout?: 'horizontal' | 'vertical';
  showIcons?: boolean;
  className?: string;
}

export const TextTypeSelector: React.FC<TextTypeSelectorProps> = ({ 
  layout = 'horizontal',
  showIcons = true,
  className = '' 
}) => {
  const { textType, setTextType } = useSettingsStore();
  
  const textTypes = [
    { value: 'words', label: '일반', icon: FileText },
    { value: 'punctuation', label: '구두점', icon: Target },
    { value: 'numbers', label: '숫자', icon: Hash },
  ] as const;
  
  return (
    <ButtonGroup 
      orientation={layout} 
      className={className} 
      spacing="1"
    >
      {textTypes.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={textType === value ? "primary" : "outline"}
          size="sm"
          onClick={() => setTextType(value as any)}
          className="flex items-center gap-2"
        >
          {showIcons && <Icon className="w-4 h-4" />}
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );
};