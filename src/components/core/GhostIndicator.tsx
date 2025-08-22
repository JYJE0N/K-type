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
      {/* 간단한 고스트 헤더 */}
      <div className="flex items-center justify-center gap-2 mb-3 text-sm text-text-secondary">
        <Ghost className="w-4 h-4 text-purple-400" />
        <span>vs 개인기록 {currentGhost.cpm} CPM</span>
      </div>

      {/* 간단한 상태 피드백 */}
      {comparison && (
        <div className={`text-center text-sm mb-3 ${
          comparison.userAhead ? 'text-green-400' : 'text-red-400'
        }`}>
          {comparison.userAhead ? (
            <span>{Math.abs(comparison.positionDiff)}자 앞섬</span>
          ) : (
            <span>{Math.abs(comparison.positionDiff)}자 뒤처짐</span>
          )}
        </div>
      )}

      {/* 간단한 진행률 바 */}
      {ghostProgress && currentGhost && (
        <div>
          <div className="relative h-2 bg-background-secondary rounded-full overflow-hidden">
            {/* 고스트 진행률 (반투명) */}
            <div 
              className="ghost-progress-bar absolute top-0 left-0 h-full bg-purple-500/50"
              style={{ width: `${Math.min(100, (ghostProgress.position / currentGhost.completedText.length) * 100)}%` }}
            />
            
            {/* 사용자 진행률 */}
            <div 
              className={`ghost-progress-bar absolute top-0 left-0 h-full ${
                comparison?.userAhead 
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, (currentIndex / currentGhost.completedText.length) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}