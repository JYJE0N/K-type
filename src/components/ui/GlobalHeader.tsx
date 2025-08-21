"use client";

import { TypingLogo } from "./TypingLogo";
import { SettingsMenu } from "./SettingsMenu";
import { BarChart3 } from "lucide-react";
import Link from "next/link";

interface GlobalHeaderProps {
  className?: string;
}

export function GlobalHeader({ className = '' }: GlobalHeaderProps) {

  return (
    <header className={`
      w-full bg-gray-900
      sticky top-0 z-40
      ${className}
    `}>
      <div className="w-full max-w-4xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* 좌측: 로고 */}
          <TypingLogo />

          {/* 우측: 간단한 네비게이션 */}
          <div className="flex items-center gap-2">
            {/* 통계 버튼 (아이콘만) */}
            <Link
              href="/stats"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
              title="통계"
            >
              <BarChart3 className="w-4 h-4" />
            </Link>

            {/* 설정 메뉴 */}
            <SettingsMenu />
          </div>
        </div>
      </div>
    </header>
  );
}