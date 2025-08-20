"use client";

import { TypingLogo } from "./TypingLogo";
import { ThemeSelector } from "./ThemeSelector";
import { SettingsMenu } from "./SettingsMenu";
import { TierDisplay } from "@/components/gamification/TierDisplay";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { useStatsStore } from "@/stores/statsStore";
import { BarChart3, Trophy } from "lucide-react";
import Link from "next/link";

interface GlobalHeaderProps {
  className?: string;
}

export function GlobalHeader({ className = '' }: GlobalHeaderProps) {
  const { averageCPM, averageAccuracy, totalTests } = useUserProgressStore();
  const { liveStats } = useStatsStore();

  // 현재 세션의 통계 표시 (진행 중인 경우)
  const hasLiveStats = liveStats.cpm > 0 || liveStats.timeElapsed > 0;

  return (
    <header className={`
      w-full border-b border-text-tertiary border-opacity-10 
      bg-background-primary bg-opacity-95 backdrop-blur-sm
      sticky top-0 z-40
      ${className}
    `}>
      <div className="w-full max-w-7xl mx-auto px-4 py-4">
        {/* 메인 헤더 라인 */}
        <div className="flex items-center justify-between">
          {/* 좌측: 테마 */}
          <ThemeSelector />

          {/* 중앙: 로고 */}
          <div className="flex-1 flex justify-center">
            <TypingLogo />
          </div>

          {/* 우측: 통계 & 설정 & 티어 */}
          <div className="flex items-center gap-3">
            {/* 통계 버튼 */}
            <Link
              href="/stats"
              className="flex items-center gap-2 p-2 rounded-lg text-text-secondary hover:text-interactive-primary hover:bg-background-secondary transition-colors"
              title="통계 보기"
            >
              <BarChart3 className="w-5 h-5" />
              {hasLiveStats && (
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <span className="font-semibold text-interactive-primary">{liveStats.cpm}</span>
                  <span className="text-text-tertiary">CPM</span>
                </div>
              )}
            </Link>

            {/* 설정 메뉴 */}
            <SettingsMenu />

            {/* 티어 표시 */}
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background-secondary border border-text-tertiary border-opacity-20">
              <TierDisplay compact={true} showProgress={false} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}