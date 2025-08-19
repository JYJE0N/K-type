"use client";

import { useEffect, useState } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { Lightbulb, TrendingUp, Target, Zap } from "lucide-react";

interface Suggestion {
  type: "speed" | "accuracy" | "finger" | "posture";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: React.ComponentType<any>;
}

export function ImprovementSuggestions() {
  const { liveStats } = useStatsStore();
  const { bestWPM, bestAccuracy, averageWPM, averageAccuracy, recentTests } =
    useUserProgressStore();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const newSuggestions: Suggestion[] = [];

    // 속도 개선 제안
    if (averageWPM < 30) {
      newSuggestions.push({
        type: "speed",
        title: "기본 자세 연습",
        description:
          "홈로우 자세(ASDF JKLÑ)를 익혀 타이핑 속도를 향상시키세요. 매일 10분씩 기본 연습을 추천합니다.",
        priority: "high",
        icon: Target,
      });
    } else if (averageWPM < 50) {
      newSuggestions.push({
        type: "speed",
        title: "단어 단위 연습",
        description:
          "자주 사용하는 단어들을 반복 연습하여 근육 기억을 늘려보세요.",
        priority: "medium",
        icon: TrendingUp,
      });
    }

    // 정확도 개선 제안
    if (averageAccuracy < 90) {
      newSuggestions.push({
        type: "accuracy",
        title: "정확도 우선 연습",
        description:
          "속도보다는 정확성에 집중하세요. 천천히 정확하게 타이핑하는 습관을 기르면 속도는 자연히 향상됩니다.",
        priority: "high",
        icon: Target,
      });
    } else if (averageAccuracy < 95) {
      newSuggestions.push({
        type: "accuracy",
        title: "실수 패턴 분석",
        description: "자주 틀리는 글자 조합을 파악하고 집중 연습하세요.",
        priority: "medium",
        icon: Lightbulb,
      });
    }

    // 손가락별 개선 제안 (한글 키보드 기준)
    const fingerSuggestions = [
      {
        condition: () => averageWPM > 0, // 기본 조건
        title: "왼손 약지 강화",
        description:
          'ㅂ, ㅍ, ㅃ 글자 연습으로 왼손 약지의 독립성을 키워보세요. "밥", "빵", "뿌리" 같은 단어로 연습하면 효과적입니다.',
        priority: "medium" as const,
      },
      {
        condition: () => averageWPM > 20,
        title: "오른손 새끼손가락 연습",
        description:
          "ㅣ, ㅔ, ㅖ 모음 연습을 통해 오른손 새끼손가락의 정확성을 높여보세요.",
        priority: "medium" as const,
      },
      {
        condition: () => averageWPM > 35,
        title: "중지 활용도 증대",
        description:
          'ㄷ, ㅌ, ㄸ과 ㅗ, ㅛ 조합 연습으로 중지의 활용도를 높여보세요. "도토리", "또또" 같은 반복 연습이 도움됩니다.',
        priority: "low" as const,
      },
    ];

    // 조건에 맞는 손가락 제안 추가
    const validFingerSuggestion = fingerSuggestions.find((s) => s.condition());
    if (validFingerSuggestion) {
      newSuggestions.push({
        type: "finger",
        title: validFingerSuggestion.title,
        description: validFingerSuggestion.description,
        priority: validFingerSuggestion.priority,
        icon: Zap,
      });
    }

    // 자세 개선 제안
    if (averageWPM > 40 && averageAccuracy > 95) {
      newSuggestions.push({
        type: "posture",
        title: "고급 기법 연습",
        description:
          "특수문자와 숫자 조합 연습으로 실무 타이핑 능력을 향상시켜보세요.",
        priority: "low",
        icon: TrendingUp,
      });
    }

    // 우선순위별 정렬 (high > medium > low)
    newSuggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    setSuggestions(newSuggestions.slice(0, 3)); // 최대 3개만 표시
  }, [averageWPM, averageAccuracy, liveStats]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-text-secondary";
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-200";
      case "medium":
        return "bg-yellow-50 border-yellow-200";
      case "low":
        return "bg-green-50 border-green-200";
      default:
        return "bg-surface";
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">개선 제안</h2>
        </div>
        <div className="card-content text-center py-8">
          <div className="text-accent text-4xl mb-4">🎉</div>
          <p className="title-sm text-primary">훌륭합니다!</p>
          <p
            className="text-sm text-secondary"
            style={{ marginTop: "var(--spacing-sm)" }}
          >
            현재 실력이 매우 좋습니다. 꾸준히 연습을 계속하세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">개선 제안</h2>
      </div>

      <div className="card-content space-y-4">
        {suggestions.map((suggestion, index) => {
          const IconComponent = suggestion.icon;
          return (
            <div
              key={index}
              className="card border-none"
              style={{
                padding: "var(--spacing-md)",
                backgroundColor:
                  suggestion.priority === "high"
                    ? "rgba(239, 68, 68, 0.05)"
                    : suggestion.priority === "medium"
                    ? "rgba(245, 158, 11, 0.05)"
                    : "rgba(34, 197, 94, 0.05)",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-surface">
                  <IconComponent
                    className={`w-4 h-4 ${getPriorityColor(
                      suggestion.priority
                    )}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="title-sm text-primary">
                      {suggestion.title}
                    </h3>
                    <span
                      className={`caption px-2 py-1 rounded-full bg-surface ${getPriorityColor(
                        suggestion.priority
                      )}`}
                    >
                      {suggestion.priority === "high"
                        ? "높음"
                        : suggestion.priority === "medium"
                        ? "보통"
                        : "낮음"}
                    </span>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{ marginTop: "var(--spacing-lg)", padding: "var(--spacing-md)" }}
        className="bg-background rounded-lg border border-opacity-10"
      >
        <p className="text-sm text-muted text-center">
          개선 제안은 통계를 기반으로 제공됩니다.
        </p>
      </div>
    </div>
  );
}
