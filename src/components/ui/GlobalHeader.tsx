"use client";

import { TypingLogo } from "./TypingLogo";
import { SettingsMenu } from "./SettingsMenu";
import { ThemeMenu } from "./ThemeMenu";
import { FaChartColumn } from "react-icons/fa6";
import { TbSettings } from "react-icons/tb";
import Link from "next/link";
import { useState } from "react";

interface GlobalHeaderProps {
  className?: string;
}

export function GlobalHeader({ className = "" }: GlobalHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header
      className={`
      w-full
      sticky top-0 z-40
      backdrop-blur-sm border-b
      ${className}
    `}
      style={{
        backgroundColor: 'var(--color-background-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="w-full max-w-4xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* 좌측: 로고 */}
          <TypingLogo />

          {/* 우측: MUI 스타일 툴바 (통계 / 설정 / 더보기) */}
          <div className="flex items-center gap-1">
            {/* 통계 버튼 */}
            <Link
              href="/stats"
              className="p-2 rounded-lg transition-colors"
              style={{ 
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)';
                e.currentTarget.style.color = 'var(--color-interactive-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
              title="통계 보기"
            >
              <FaChartColumn className="w-5 h-5" />
            </Link>

            {/* 설정 버튼 */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                color: showSettings ? 'var(--color-interactive-primary)' : 'var(--color-text-secondary)',
                backgroundColor: showSettings ? 'var(--color-background-elevated)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!showSettings) {
                  e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)';
                  e.currentTarget.style.color = 'var(--color-interactive-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showSettings) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
              title="설정"
            >
              <TbSettings className="w-5 h-5" />
            </button>

            {/* 더보기 메뉴 (테마 선택) */}
            <ThemeMenu />
          </div>
        </div>
      </div>

      {/* 설정 패널 */}
      {showSettings && (
        <SettingsMenu isOpen={showSettings} onClose={() => setShowSettings(false)} />
      )}
    </header>
  );
}
