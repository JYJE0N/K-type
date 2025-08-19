"use client";

import { useEffect, useState } from "react";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { useStatsStore } from "@/stores/statsStore";
import { useTypingStore } from "@/stores/typingStore";
import { ImprovementSuggestions } from "@/components/stats/ImprovementSuggestions";
import { Layout } from "@/components/ui/Layout";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import dynamic from "next/dynamic";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Hash,
  Trophy,
  BarChart3,
} from "lucide-react";

// 차트 컴포넌트를 동적으로 로드 (SSR 문제 방지)
const DynamicHistoryGraph = dynamic(
  () =>
    import("@/components/stats/HistoryGraph").then((mod) => ({
      default: mod.HistoryGraph,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-background rounded animate-pulse"></div>
    ),
  }
);

export default function StatsPage() {
  const router = useRouter();
  const { isCompleted } = useTypingStore();
  const { liveStats } = useStatsStore();
  const [showLatestResult, setShowLatestResult] = useState(false);
  const [hasRecentTests, setHasRecentTests] = useState(false);
  const [primaryMetric, setPrimaryMetric] = useState<"cpm" | "wpm">("cpm");
  const [mounted, setMounted] = useState(false);
  
  const {
    bestWPM,
    bestCPM,
    totalTests,
    totalTime,
    totalWords,
    averageWPM,
    averageCPM,
    averageAccuracy,
    currentStreak,
    longestStreak,
    recentTests,
    getImprovementRate,
    initializeUser,
    fetchProgress,
  } = useUserProgressStore();
  
  // 현재 테스트의 데이터를 가져오기 (여러 소스에서 확인)
  const getDisplayStats = () => {
    // 1. liveStats에서 확인 (진행 중이거나 방금 완료한 경우)
    if (liveStats.cpm > 0 || liveStats.timeElapsed > 0) {
      return {
        cpm: liveStats.cpm,
        wpm: liveStats.wpm,
        accuracy: liveStats.accuracy,
        timeElapsed: liveStats.timeElapsed,
        source: 'liveStats'
      };
    }
    
    // 2. 최근 테스트 기록에서 확인
    const latestTest = recentTests[0];
    if (latestTest) {
      return {
        cpm: latestTest.cpm || Math.round(latestTest.wpm * 5),
        wpm: latestTest.wpm || Math.round(latestTest.cpm / 5),
        accuracy: latestTest.accuracy || 0,
        timeElapsed: latestTest.duration || 0,
        source: 'recentTests'
      };
    }
    
    return null;
  };
  
  const displayStats = getDisplayStats();
  const hasStatsData = displayStats !== null;
  
  // 디버깅 로그
  useEffect(() => {
    console.log('🔍 Stats source check:', {
      liveStats: {
        cpm: liveStats.cpm,
        accuracy: liveStats.accuracy,
        timeElapsed: liveStats.timeElapsed
      },
      recentTestsCount: recentTests.length,
      latestTest: recentTests[0],
      displayStats,
      hasStatsData
    });
  }, [liveStats, recentTests]);

  useEffect(() => {
    initializeUser().then(() => {
      fetchProgress();
    });
  }, [initializeUser, fetchProgress]);

  const improvementRate = getImprovementRate ? getImprovementRate() : 0;
  const totalHours = Math.floor(totalTime / 3600);
  const totalMinutes = Math.floor((totalTime % 3600) / 60);

  // 마운트 상태 설정
  useEffect(() => {
    setMounted(true);
  }, []);



  // 클라이언트에서만 조건부 렌더링 상태 결정
  useEffect(() => {
    if (mounted) {
      console.log("📊 Stats Debug (mounted):", {
        isCompleted,
        displayStats,
        hasStatsData,
        showLatestResult: hasStatsData,
      });
      setShowLatestResult(hasStatsData);
      setHasRecentTests(recentTests.length > 0);
    }
  }, [mounted, isCompleted, hasStatsData, liveStats, improvementRate, recentTests.length]);

  // 재도전 핸들러
  const handleRestart = useCallback(() => {
    console.log('🔄 Starting new test');
    router.push("/");
  }, [router]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Shift + Tab 또는 Shift + Enter로 연습 계속하기
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
    <>
      <ThemeInitializer />
      <Layout>
        <div className="w-full max-w-6xl mx-auto px-4 py-8 lg:px-8 font-korean">

          {/* 헤더 */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary">
              통계 및 분석
            </h1>
            <Link
              href="/"
              className="px-4 py-2 bg-typing-accent text-background rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              title="Shift + Tab 또는 Shift + Enter"
            >
              연습 계속하기
              <span className="text-xs opacity-70">
                <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">
                  Shift
                </kbd>
                +
                <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">
                  Tab
                </kbd>
              </span>
            </Link>
          </div>

          {/* 기록 요약 섹션 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-text-primary">
                기록 요약
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 현재 기록 */}
              <div className="bg-surface rounded-lg p-6 shadow-lg border border-blue-400/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-text-secondary text-sm">현재 기록</div>
                  <button
                    onClick={() =>
                      setPrimaryMetric(primaryMetric === "cpm" ? "wpm" : "cpm")
                    }
                    className="text-xs text-typing-accent hover:opacity-80 transition-opacity px-2 py-1 rounded border border-typing-accent border-opacity-30"
                  >
                    {primaryMetric === "cpm" ? "WPM" : "CPM"}
                  </button>
                </div>
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {!mounted ? (
                    "—"
                  ) : showLatestResult && displayStats ? (
                    primaryMetric === "cpm" ? displayStats.cpm : displayStats.wpm
                  ) : (
                    <span title={`Debug: hasStatsData=${hasStatsData}, displayStats=${JSON.stringify(displayStats)}`}>
                      —
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-secondary">
                  {!mounted
                    ? "테스트를 완료해보세요"
                    : showLatestResult
                    ? primaryMetric.toUpperCase()
                    : "테스트를 완료해보세요"}
                </div>
              </div>

              {/* 정확도 */}
              <div className="bg-surface rounded-lg p-6 shadow-lg border border-green-400/20">
                <div className="text-text-secondary text-sm mb-2">정확도</div>
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {!mounted ? (
                    "—"
                  ) : showLatestResult && displayStats ? (
                    `${displayStats.accuracy.toFixed(1)}%`
                  ) : (
                    <span title={`Debug: displayStats=${JSON.stringify(displayStats)}`}>
                      —
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-secondary">
                  평균: {(averageAccuracy || 0).toFixed(1)}%
                </div>
              </div>

              {/* 성과 향상도 */}
              <div className="bg-surface rounded-lg p-6 shadow-lg border border-cyan-400/20">
                <div className="text-text-secondary text-sm mb-2">
                  성과 향상도
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`text-2xl font-bold ${
                      !mounted
                        ? "text-gray-500"
                        : improvementRate > 0
                        ? "text-green-500"
                        : improvementRate < 0
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {!mounted ? "0.0" : improvementRate.toFixed(1)}%
                  </div>
                  {!mounted ? (
                    <span className="w-6 h-6 flex items-center justify-center text-gray-500">
                      —
                    </span>
                  ) : improvementRate > 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  ) : improvementRate < 0 ? (
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  ) : (
                    <span className="w-6 h-6 flex items-center justify-center text-gray-500">
                      —
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-secondary">
                  최근 5회 vs 이전 5회
                </div>
              </div>

              {/* 연습 통계 */}
              <div className="bg-surface rounded-lg p-6 shadow-lg border border-purple-400/20">
                <div className="text-text-secondary text-sm mb-2">
                  연습 통계
                </div>
                <div className="text-2xl font-bold text-purple-500 mb-1">
                  {totalTests}회
                </div>
                <div className="text-xs text-text-secondary">
                  연속: {currentStreak}일 (최고: {longestStreak}일)
                </div>
              </div>

              {/* 최고 기록 */}
              <div className="bg-surface rounded-lg p-6 shadow-lg border border-yellow-400/20">
                <div className="text-text-secondary text-sm mb-2">
                  최고 기록
                </div>
                <div className="text-2xl font-bold text-yellow-500 mb-1">
                  {primaryMetric === "cpm" ? bestCPM || 0 : bestWPM || 0}
                </div>
                <div className="text-xs text-text-secondary">
                  {primaryMetric.toUpperCase()} · 평균:{" "}
                  {primaryMetric === "cpm"
                    ? (averageCPM || 0).toFixed(0)
                    : (averageWPM || 0).toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 성과 추이 그래프 */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">성과 추이</h2>
              </div>
              <div
                className="card-content"
                style={{ minHeight: "320px" }}
              >
                <DynamicHistoryGraph />
              </div>
            </div>

            {/* 최근 테스트 기록 */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">최근 기록</h2>
              </div>
              <div className="card-content">
                {hasRecentTests ? (
                  <div
                    className="max-h-96 overflow-y-auto"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-md)",
                    }}
                  >
                    {recentTests.slice(0, 10).map((test, index) => (
                      <div
                        key={test.id || index}
                        className="bg-background rounded-lg"
                        style={{ padding: "var(--spacing-md)" }}
                      >
                        <div
                          className="flex justify-between items-start"
                          style={{ marginBottom: "var(--spacing-sm)" }}
                        >
                          <div className="text-sm text-secondary">
                            {new Date(test.date).toLocaleDateString("ko-KR", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Seoul",
                            })}
                          </div>
                          <div className="caption text-secondary">
                            {test.mode === "time" ? (
                              <span className="px-2 py-1 bg-surface rounded text-xs border border-text-secondary border-opacity-20">
                                {test.duration}초
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-surface rounded text-xs border border-text-secondary border-opacity-20">
                                {(() => {
                                  // textType 기반으로 구분
                                  if (
                                    test.textType &&
                                    (test.textType.includes("sentence") ||
                                      test.textType.includes("문장"))
                                  ) {
                                    return `${test.wordsTyped || 0}문장`;
                                  } else {
                                    return `${test.wordsTyped || 0}단어`;
                                  }
                                })()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-secondary">CPM:</span>
                            <span className="ml-1 font-semibold text-primary">
                              {test.cpm || Math.round(test.wpm * 5)}
                            </span>
                          </div>
                          <div>
                            <span className="text-secondary">정확도:</span>
                            <span className="ml-1 font-semibold text-primary">
                              {(test.accuracy || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-secondary">실수:</span>
                            <span className="ml-1 font-semibold text-primary">
                              {test.mistakes}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="text-center"
                    style={{ padding: "var(--spacing-2xl) 0" }}
                  >
                    <p className="text-secondary">
                      아직 테스트 기록이 없습니다
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 개선 제안 섹션 */}
          <div className="mt-8">
            <ImprovementSuggestions />
          </div>

          {/* 전체 통계 - 인포그래픽 스타일 */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-text-primary">
                전체 통계
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 총 연습 시간 */}
              <div className="bg-surface rounded-xl p-6 shadow-lg border border-orange-400/20">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-orange-500" />
                  <div className="text-sm text-text-secondary">
                    총 연습 시간
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-500 mb-2">
                  {totalHours}h {totalMinutes}m
                </div>
                <div className="w-full bg-orange-100 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, (totalHours / 100) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* 평균 CPM */}
              <div className="bg-surface rounded-xl p-6 shadow-lg border border-green-400/20">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-green-500" />
                  <div className="text-sm text-text-secondary">평균 CPM</div>
                </div>
                <div className="text-2xl font-bold text-green-500 mb-2">
                  {(averageCPM || 0).toFixed(0)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-green-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, (averageCPM / 200) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-green-600">
                    {Math.round((averageCPM / 200) * 100)}%
                  </span>
                </div>
              </div>

              {/* 총 타수 */}
              <div className="bg-surface rounded-xl p-6 shadow-lg border border-cyan-400/20">
                <div className="flex items-center gap-3 mb-3">
                  <Hash className="w-6 h-6 text-cyan-500" />
                  <div className="text-sm text-text-secondary">총 타수</div>
                </div>
                <div className="text-2xl font-bold text-cyan-500 mb-2">
                  {(totalWords * 5).toLocaleString()}
                </div>
                <div className="text-xs text-cyan-600">
                  {totalWords.toLocaleString()} 단어 완료
                </div>
              </div>

              {/* 레벨 */}
              <div className="bg-surface rounded-xl p-6 shadow-lg border border-purple-400/20">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="w-6 h-6 text-purple-500" />
                  <div className="text-sm text-text-secondary">현재 레벨</div>
                </div>
                <div className="text-2xl font-bold text-purple-500 mb-2">
                  {averageWPM < 20
                    ? "초급"
                    : averageWPM < 40
                    ? "중급"
                    : averageWPM < 60
                    ? "고급"
                    : averageWPM < 80
                    ? "전문가"
                    : "마스터"}
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`w-3 h-3 rounded-full ${
                        star <= Math.ceil(averageWPM / 20)
                          ? "bg-purple-500"
                          : "bg-purple-200"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
