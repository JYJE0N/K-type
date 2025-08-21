"use client";

import React from 'react';

interface ButtonGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function ButtonGroup({ 
  options, 
  value, 
  onChange, 
  size = 'md',
  variant = 'primary',
  className = '' 
}: ButtonGroupProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  const sizeClass = sizeClasses[size];

  return (
    <div className={`inline-flex rounded-lg overflow-hidden ${className}`} 
         style={{ 
           border: '1px solid var(--color-border)',
           backgroundColor: 'var(--color-background)'
         }}>
      {options.map((option, index) => {
        const isActive = value === option.value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;
        
        return (
          <button
            key={option.value}
            disabled={option.disabled}
            onClick={() => !option.disabled && onChange(option.value)}
            className={`
              ${sizeClass} 
              font-medium transition-all duration-150 ease-in-out
              focus:outline-none focus:z-10 relative
              ${!isFirst ? '-ml-px' : ''}
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              whitespace-nowrap
            `}
            style={{
              backgroundColor: isActive 
                ? 'var(--color-interactive-primary)' 
                : 'var(--color-button-group-default)',
              color: isActive 
                ? 'var(--color-text-inverse)' 
                : 'var(--color-text-secondary)',
              borderLeft: !isFirst ? '1px solid var(--color-border)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!isActive && !option.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--color-button-group-default)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive && !option.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--color-button-group-default)';
              }
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}