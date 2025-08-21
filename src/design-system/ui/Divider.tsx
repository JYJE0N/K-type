/**
 * ➖ Divider Component - Single Responsibility  
 * 요소들 사이의 구분선
 */

import React from 'react';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'vertical',
  className = ''
}) => {
  const orientationStyles = orientation === 'vertical' 
    ? 'w-px h-8 bg-gray-300'
    : 'h-px w-full bg-gray-300';
  
  const combinedClassName = `${orientationStyles} ${className}`.trim();
  
  return (
    <div 
      className={combinedClassName}
      role="separator"
      aria-orientation={orientation}
    />
  );
};