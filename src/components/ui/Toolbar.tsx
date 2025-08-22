"use client";

import React, { useState } from 'react';
import { ThemeMenu } from './ThemeMenu';
import { SettingsMenu } from './SettingsMenu';
import { IoStatsChart, IoSettingsSharp } from "react-icons/io5";
import Link from 'next/link';

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className = "" }: ToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className={`flex items-center gap-1 ${className}`}>
        {/* 통계 버튼 */}
        <Link
          href="/stats"
          className="p-2 rounded-lg transition-colors text-text-secondary hover:bg-background-elevated hover:text-interactive-primary"
          title="통계 보기"
        >
          <IoStatsChart className="w-5 h-5" />
        </Link>

        {/* 설정 버튼 */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${
            showSettings 
              ? 'bg-background-elevated text-interactive-primary' 
              : 'text-text-secondary hover:bg-background-elevated hover:text-interactive-primary'
          }`}
          title="설정"
        >
          <IoSettingsSharp className="w-5 h-5" />
        </button>

        {/* 테마 메뉴 */}
        <ThemeMenu />
      </div>
      
      {/* 설정 패널 */}
      {showSettings && (
        <SettingsMenu isOpen={showSettings} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}