"use client";

import { useEffect, useState } from "react";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { useStatsStore } from "@/stores/statsStore";
import { useTypingStore } from "@/stores/typingStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { useCallback } from "react";
import { IoPlay } from "react-icons/io5";

// 섹션 컴포넌트들 임포트
import { StatsHeader } from "./StatsHeader";
import { TestResultSection } from "./TestResultSection";
import { TierSection } from "./TierSection";
import { RecentRecordsSection } from "./RecentRecordsSection";
import { InsightsSection } from "./InsightsSection";

export function StatsPage() {
  const { isCompleted } = useTypingStore();
  const { liveStats } = useStatsStore();
  const { language, testMode, testTarget, sentenceLength, sentenceStyle } =
    useSettingsStore();
  const {
    bestWPM,
    bestCPM,
    recentTests,
    improvementRate,
    totalTests,
    totalPracticeTime,
    averageSpeed,
    totalKeystrokes,
    ranking,
  } = useUserProgressStore();

  const [mounted, setMounted] = useState(false);
  const [hasRecentTests, setHasRecentTests] = useState(false);
  const [primaryMetric, setPrimaryMetric] = useState<"cpm" | "wpm">("cpm");

  // 클라이언트 사이드 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 테스트 결과 데이터 확인
  const hasStatsData =
    liveStats &&
    typeof liveStats.cpm === "number" &&
    typeof liveStats.wpm === "number" &&
    typeof liveStats.accuracy === "number" &&
    liveStats.cpm > 0;

  // 상태 업데이트
  useEffect(() => {
    if (mounted) {
      setHasRecentTests(recentTests.length > 0);
    }
  }, [
    mounted,
    isCompleted,
    hasStatsData,
    liveStats,
    improvementRate,
    recentTests.length,
  ]);

  // 재도전 핸들러
  const handleRestart = useCallback(() => {
    console.log("🔄 Starting new test");

    const { resetTest } = useTypingStore.getState();
    const { resetStats } = useStatsStore.getState();

    resetTest();
    resetStats();

    window.location.href = "/";
  }, []);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && (event.key === "Tab" || event.key === "Enter")) {
        event.preventDefault();
        handleRestart();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleRestart]);

  return (
    <div
      className="w-full max-w-6xl mx-auto px-4 lg:px-8 font-korean"
      style={{
        paddingTop: "var(--spacing-8)",
        paddingBottom: "var(--spacing-8)",
      }}
    >
      {/* 타이틀 및 컨텍스트 */}
      <StatsHeader
        language={language as "korean" | "english"}
        testMode={testMode as "words" | "sentences"}
        testTarget={testTarget}
        sentenceLength={sentenceLength}
        sentenceStyle={
          sentenceStyle as "plain" | "punctuation" | "numbers" | "mixed"
        }
      />

      {/* 섹션 1: 테스트 결과 */}
      <TestResultSection
        className="mb-8"
        primaryMetric={primaryMetric}
        onMetricChange={setPrimaryMetric}
      />

      {/* 섹션 2: 티어 안내 */}
      <TierSection
        className="mb-8"
        bestCPM={bestCPM}
        bestWPM={bestWPM}
        improvementRate={improvementRate}
        totalTests={totalTests}
        primaryMetric={primaryMetric}
        mounted={mounted}
      />

      {/* 섹션 3: 최근 기록 및 AI 개선 제안 */}
      <RecentRecordsSection
        className="mb-8"
        hasRecentTests={hasRecentTests}
        primaryMetric={primaryMetric}
      />

      {/* 섹션 4: 인사이트 통계 */}
      <InsightsSection
        className="mb-8"
        totalPracticeTime={totalPracticeTime}
        averageSpeed={averageSpeed}
        totalKeystrokes={totalKeystrokes}
        ranking={ranking}
        mounted={mounted}
        primaryMetric={primaryMetric}
      />

      {/* 하단 액션 버튼 */}
      <div className="flex justify-center items-center mt-12">
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: "var(--color-interactive-primary)",
            color: "white",
            boxShadow: "var(--chart-shadow-heavy)",
          }}
        >
          <IoPlay className="w-5 h-5" />
          연습 계속하기
        </button>
      </div>

      {/* 키보드 단축키 안내 */}
      <div className="flex justify-center mt-6">
        <KeyboardShortcuts
          showRestart={true}
          showContinue={true}
        />
      </div>
    </div>
  );
}
