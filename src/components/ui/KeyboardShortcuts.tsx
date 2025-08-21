"use client";

import React from 'react';

interface KeyChipProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

function KeyChip({ children, variant = 'primary' }: KeyChipProps) {
  return (
    <div 
      className="px-3 py-1.5 rounded-full text-sm font-medium"
      style={{ 
        backgroundColor: variant === 'primary' 
          ? 'var(--color-interactive-primary)' 
          : 'var(--color-interactive-secondary)',
        color: 'var(--color-text-inverse)'
      }}
    >
      {children}
    </div>
  );
}

interface ShortcutRowProps {
  label: string;
  keys: string[];
  variant?: 'primary' | 'secondary';
}

function ShortcutRow({ label, keys, variant = 'primary' }: ShortcutRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {label}:
      </span>
      <div className="flex items-center gap-2">
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            {index > 0 && (
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {key === '또는' ? '또는' : '+'}
              </span>
            )}
            {key !== '또는' && (
              <KeyChip variant={variant}>{key}</KeyChip>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

interface KeyboardShortcutsProps {
  showStart?: boolean;
  showRestart?: boolean;
  className?: string;
}

export function KeyboardShortcuts({ 
  showStart = false, 
  showRestart = false, 
  className = '' 
}: KeyboardShortcutsProps) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        {showStart && (
          <ShortcutRow 
            label="시작하기"
            keys={['클릭', '또는', '아무키']}
            variant="primary"
          />
        )}
        {showRestart && (
          <ShortcutRow 
            label="다시 시작"
            keys={['Shift', 'Enter']}
            variant="secondary"
          />
        )}
      </div>
    </div>
  );
}