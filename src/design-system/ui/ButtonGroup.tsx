/**
 * 🔘 ButtonGroup Component - Single Responsibility
 * 관련된 버튼들을 그룹화하는 컴포넌트
 */

import React from 'react';
import { createFlexStyles } from '../components';
import { spacing } from '../tokens';

interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: keyof typeof spacing;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 2,
  className = ''
}) => {
  const direction = orientation === 'horizontal' ? 'row' : 'col';
  const groupStyles = createFlexStyles(direction, 'start', 'center', spacing);
  const combinedClassName = `${groupStyles} ${className}`.trim();
  
  return (
    <div className={combinedClassName} role="group">
      {children}
    </div>
  );
};