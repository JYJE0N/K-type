/**
 * 🔘 Button Component - Single Responsibility
 * 모든 버튼의 기본이 되는 컴포넌트
 */

import React from 'react';
import { createButtonStyles, ButtonVariant, ButtonSize } from '../components';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isActive?: boolean;
  isLoading?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      variant = 'default', 
      size = 'base', 
      isActive = false,
      isLoading = false,
      asChild = false,
      className = '',
      disabled,
      children, 
      ...props 
    },
    ref
  ) => {
    const buttonStyles = createButtonStyles(variant, size, isActive);
    const combinedClassName = `${buttonStyles} ${className}`.trim();
    
    if (asChild) {
      // asChild가 true면 children을 복제하고 스타일을 적용
      return React.cloneElement(children as React.ReactElement, {
        className: combinedClassName,
        ref,
        ...props
      });
    }
    
    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';