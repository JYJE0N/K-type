"use client";

import { useEffect, useState } from "react";
import { ghostModeManager, type GhostProgress, type GhostComparison } from "@/utils/ghostMode";
import { useTypingStore } from "@/stores/typingStore";
import { useStatsStore } from "@/stores/statsStore";
import { Ghost, TrendingUp, TrendingDown } from "lucide-react";

interface GhostIndicatorProps {
  className?: string;
}

export function GhostIndicator({ className = "" }: GhostIndicatorProps) {
  const { isActive, startTime, currentIndex } = useTypingStore();
  const { liveStats } = useStatsStore();
  const [ghostProgress, setGhostProgress] = useState<GhostProgress | null>(null);
  const [comparison, setComparison] = useState<GhostComparison | null>(null);
  
  // 고스트 활성화 상태 체크
  const isGhostActive = ghostModeManager.isActive();
  const currentGhost = ghostModeManager.getCurrentGhost();

  // 실시간 고스트 진행률 업데이트
  useEffect(() => {
    if (!isGhostActive || !isActive || !startTime) {
      setGhostProgress(null);
      setComparison(null);
      return;
    }

    const updateGhostProgress = () => {
      const elapsed = (Date.now() - startTime.getTime()) / 1000;
      
      // 고스트 진행률 계산
      const progress = ghostModeManager.calculateGhostProgress(elapsed);
      setGhostProgress(progress);
      
      // 사용자와 비교
      const comp = ghostModeManager.compareWithUser(
        currentIndex,
        elapsed,
        liveStats.cpm,
        liveStats.accuracy
      );
      setComparison(comp);
    };

    // 250ms마다 업데이트
    const interval = setInterval(updateGhostProgress, 250);
    updateGhostProgress(); // 즉시 실행

    return () => clearInterval(interval);
  }, [isGhostActive, isActive, startTime, currentIndex, liveStats]);

  // 고스트 모드가 비활성화된 경우 렌더링하지 않음
  if (!isGhostActive || !currentGhost) {
    return null;
  }

  return (
    <div className={`ghost-indicator ${className}`}>
      {/* 고스트 모드 헤더 */}
      <div className="flex items-center justify-between mb-4 p-3 bg-background-secondary rounded-lg border border-purple-400/20">
        <div className="flex items-center gap-2">
          <Ghost className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-medium text-text-primary">
            고스트 모드
          </span>
        </div>
        <div className="text-xs text-text-secondary">
          목표: {currentGhost.cpm} CPM · {currentGhost.accuracy.toFixed(1)}%
        </div>
      </div>

      {/* 진행률 비교 표시 */}
      {ghostProgress && comparison && isActive && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* 사용자 현재 상태 */}
          <div className="bg-background rounded-lg p-3 border border-blue-400/20">
            <div className="text-xs text-text-secondary mb-1">당신</div>
            <div className="text-lg font-bold text-blue-500 mb-1">
              {liveStats.cpm} CPM
            </div>
            <div className="text-xs text-text-secondary">
              {liveStats.accuracy.toFixed(1)}% · {currentIndex}자
            </div>
          </div>

          {/* 고스트 현재 상태 */}
          <div className="bg-background rounded-lg p-3 border border-purple-400/20">
            <div className="text-xs text-text-secondary mb-1">고스트</div>
            <div className="text-lg font-bold text-purple-500 mb-1">
              {ghostProgress.cpm} CPM
            </div>
            <div className="text-xs text-text-secondary">
              {ghostProgress.accuracy.toFixed(1)}% · {ghostProgress.position}자
            </div>
          </div>
        </div>
      )}

      {/* 경쟁 상태 표시 */}
      {comparison && (
        <div className="mb-4">
          {/* 위치 비교 */}
          <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-text-tertiary border-opacity-20">
            <div className="flex items-center gap-2">
              {comparison.userAhead ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">
                    앞서고 있습니다
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500 font-medium">
                    뒤처져 있습니다
                  </span>
                </>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-sm font-semibold">
                {comparison.positionDiff > 0 ? '+' : ''}{comparison.positionDiff}자
              </div>
              <div className="text-xs text-text-secondary">
                차이
              </div>
            </div>
          </div>

          {/* CPM 비교 */}
          <div className="mt-2 p-2 bg-background-secondary rounded text-center">
            <div className="text-xs text-text-secondary mb-1">속도 차이</div>
            <div className={`text-sm font-semibold ${
              comparison.cpmDiff > 0 ? 'text-green-500' : 
              comparison.cpmDiff < 0 ? 'text-red-500' : 
              'text-text-secondary'
            }`}>
              {comparison.cpmDiff > 0 ? '+' : ''}{comparison.cpmDiff} CPM
            </div>
          </div>
        </div>
      )}

      {/* 고스트 진행률 바 */}
      {ghostProgress && currentGhost && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-text-secondary mb-2">
            <span>진행률</span>
            <span>{Math.round((ghostProgress.position / currentGhost.completedText.length) * 100)}%</span>
          </div>
          
          <div className="relative h-2 bg-background-secondary rounded-full overflow-hidden">
            {/* 고스트 진행률 */}
            <div 
              className="absolute top-0 left-0 h-full bg-purple-500 transition-all duration-200 opacity-60"
              style={{ 
                width: `${Math.min(100, (ghostProgress.position / currentGhost.completedText.length) * 100)}%` 
              }}
            />
            
            {/* 사용자 진행률 */}
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-200"
              style={{ 
                width: `${Math.min(100, (currentIndex / currentGhost.completedText.length) * 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* 고스트 기록 정보 */}
      <div className="text-xs text-text-tertiary text-center">
        기록 달성일: {new Date(currentGhost.date).toLocaleDateString('ko-KR')} 
        ({currentGhost.language} · {currentGhost.textType})
      </div>
    </div>
  );
}