/**
 * 🃏 Card Component - Single Responsibility
 * 콘텐츠를 담는 카드 컴포넌트
 */

import React from 'react';
import { createCardStyles, CardVariant } from '../components';
import { spacing } from '../tokens';

interface CardProps {
  variant?: CardVariant;
  padding?: keyof typeof spacing;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = '6',
  children,
  className = '',
  onClick
}) => {
  const cardStyles = createCardStyles(variant, padding);
  const combinedClassName = `${cardStyles} ${className}`.trim();
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component 
      className={combinedClassName}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  );
};