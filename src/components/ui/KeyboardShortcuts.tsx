"use client";

import React from 'react';
import { IoPlay, IoReloadCircle } from "react-icons/io5";

interface KeyChipProps {
  children: React.ReactNode;
}

function KeyChip({ children }: KeyChipProps) {
  return (
    <div 
      className="px-3 py-1 rounded text-sm font-semibold shadow-md border"
      style={{
        backgroundColor: 'var(--color-shortcut-key-bg)',
        color: 'var(--color-shortcut-key-text)',
        borderColor: 'var(--color-shortcut-key-border)'
      }}
    >
      {children}
    </div>
  );
}

interface ShortcutRowProps {
  label: string;
  keys: string[];
  icon?: React.ReactNode;
}

function ShortcutRow({ label, keys, icon }: ShortcutRowProps) {
  return (
    <div 
      className="flex items-center w-full max-w-sm px-4 py-3 rounded-lg gap-6"
      style={{
        backgroundColor: 'var(--color-shortcut-card-bg)'
      }}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span style={{ color: 'var(--color-shortcut-label-text)' }}>
            {icon}
          </span>
        )}
        <span 
          className="text-sm font-medium"
          style={{ color: 'var(--color-shortcut-label-text)' }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {keys.filter(key => key !== '또는').map((key, index) => (
          <KeyChip key={`${key}-${index}`}>{key}</KeyChip>
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
      <div className="flex flex-col items-center gap-2">
        {showStart && (
          <ShortcutRow 
            label="시작하기"
            keys={['클릭', '또는', '아무키']}
            icon={<IoPlay className="w-4 h-4" />}
          />
        )}
        {showRestart && (
          <ShortcutRow 
            label="새로고침"
            keys={['SHIFT', 'ENTER']}
            icon={<IoReloadCircle className="w-4 h-4" />}
          />
        )}
      </div>
    </div>
  );
}