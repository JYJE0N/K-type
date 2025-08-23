"use client";

import { Layout } from "@/components/ui/Layout";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { ImprovementSuggestions } from "@/components/stats/ImprovementSuggestions";
import { TierBadge } from "@/components/ui/TierBadge";
import { DEFAULT_TIERS } from "@/utils/tierSystem";
import { useState } from "react";
import {
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
  Flame,
  AlertCircle,
  Info,
} from "lucide-react";

// 더미 제안 컴포넌트
interface DummySuggestionProps {
  type: "high" | "medium" | "low";
  title: string;
  description: string;
}

function DummySuggestion({ type, title, description }: DummySuggestionProps) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          backgroundColor: "var(--transparent)",
          color: "var(--color-text-primary)",
          borderColor: "var(--color-feedback-error)",
          opacity: "0.9",
        };
      case "medium":
        return {
          backgroundColor: "var(--transparent)",
          color: "var(--color-text-primary)",
          borderColor: "var(--color-interactive-primary)",
          opacity: "0.9",
        };
      case "low":
        return {
          backgroundColor: "var(--transparent)",
          color: "var(--color-text-primary)",
          borderColor: "var(--color-interactive-secondary)",
          opacity: "0.9",
        };
      default:
        return {
          backgroundColor: "var(--color-text-tertiary)",
          color: "var(--color-text-inverse)",
          borderColor: "var(--color-text-tertiary)",
          opacity: "0.9",
        };
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "중요";
      case "medium":
        return "권장";
      case "low":
        return "참고";
      default:
        return "";
    }
  };

  const getIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return Target;
      case "medium":
        return TrendingUp;
      case "low":
        return Lightbulb;
      default:
        return Info;
    }
  };

  const IconComponent = getIcon(type);

  return (
    <div
      className="flex items-start gap-4 rounded-lg p-4 border transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center border"
          style={{
            backgroundColor: "var(--color-elevated)",
            borderColor: "var(--color-border)",
          }}
        >
          <IconComponent
            className="w-5 h-5"
            style={{ color: "var(--color-text-primary)" }}
          />
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-medium border"
          style={getPriorityStyle(type)}
        >
          {getPriorityLabel(type)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {title}
          </h3>
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default function UIShowcasePage() {
  const [theme, setTheme] = useState<"light" | "dark" | "high-contrast">(
    "light"
  );

  // 샘플 티어 데이터 (DEFAULT_TIERS에서 직접 사용)
  const sampleTiers = DEFAULT_TIERS;

  const toggleTheme = () => {
    const themes: Array<"light" | "dark" | "high-contrast"> = [
      "light",
      "dark",
      "high-contrast",
    ];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <>
      <ThemeInitializer />
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                UI Showcase
              </h1>
              <p style={{ color: "var(--color-text-secondary)" }}>
                프로젝트의 UI 컴포넌트들을 확인할 수 있습니다.
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-lg border font-medium transition-colors"
              style={{
                backgroundColor: "var(--color-interactive-primary)",
                color: "var(--color-text-inverse)",
                borderColor: "var(--color-interactive-primary)",
              }}
            >
              {theme === "light"
                ? "🌙 다크모드"
                : theme === "dark"
                ? "🔆 고대비모드"
                : "☀️ 라이트모드"}
            </button>
          </div>

          <div className="space-y-12">
            {/* 개선 제안 섹션 */}
            <section>
              <h2
                className="text-2xl font-semibold mb-6"
                style={{ color: "var(--color-text-primary)" }}
              >
                개선 제안 (ImprovementSuggestions)
              </h2>

              {/* 실제 컴포넌트 */}
              <div className="stats-card mb-6">
                <h3 className="stats-subtitle mb-4">
                  실제 컴포넌트 (사용자 데이터 기반)
                </h3>
                <ImprovementSuggestions />
              </div>

              {/* 더미 데이터로 각 타입별 표시 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 중요 (High Priority) */}
                <div className="stats-card">
                  <h3 className="stats-subtitle mb-4">중요 우선순위</h3>
                  <div className="space-y-3">
                    <DummySuggestion
                      type="high"
                      title="기본 자세 연습"
                      description="홈로우 자세(ASDF JKLÑ)를 익혀 타이핑 속도를 향상시키세요. 매일 10분씩 기본 연습을 추천합니다."
                    />
                    <DummySuggestion
                      type="high"
                      title="정확도 우선 연습"
                      description="속도보다는 정확성에 집중하세요. 천천히 정확하게 타이핑하는 습관을 기르면 속도는 자연히 향상됩니다."
                    />
                  </div>
                </div>

                {/* 권장 (Medium Priority) */}
                <div className="stats-card">
                  <h3 className="stats-subtitle mb-4">권장 우선순위</h3>
                  <div className="space-y-3">
                    <DummySuggestion
                      type="medium"
                      title="단어 단위 연습"
                      description="자주 사용하는 단어들을 반복 연습하여 근육 기억을 늘려보세요."
                    />
                    <DummySuggestion
                      type="medium"
                      title="실수 패턴 분석"
                      description="자주 틀리는 글자 조합을 파악하고 집중 연습하세요."
                    />
                  </div>
                </div>

                {/* 참고 (Low Priority) */}
                <div className="stats-card">
                  <h3 className="stats-subtitle mb-4">참고 우선순위</h3>
                  <div className="space-y-3">
                    <DummySuggestion
                      type="low"
                      title="고급 기법 연습"
                      description="특수문자와 숫자 조합 연습으로 실무 타이핑 능력을 향상시켜보세요."
                    />
                    <DummySuggestion
                      type="low"
                      title="왼손 약지 강화"
                      description='ㅂ, ㅍ, ㅃ 글자 연습으로 왼손 약지의 독립성을 키워보세요. "밥", "빵", "뿌리" 같은 단어로 연습하면 효과적입니다.'
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 티어 배지 섹션 */}
            <section>
              <h2
                className="text-2xl font-semibold mb-6"
                style={{ color: "var(--color-text-primary)" }}
              >
                티어 배지 (TierBadge)
              </h2>

              {/* 사이즈별 */}
              <div className="stats-card mb-6">
                <h3 className="stats-subtitle mb-4">
                  사이즈별 (Small, Medium, Large)
                </h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <TierBadge
                      tier={sampleTiers[2]}
                      size="sm"
                      showLabel
                    />
                    <p
                      className="text-sm mt-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Small
                    </p>
                  </div>
                  <div className="text-center">
                    <TierBadge
                      tier={sampleTiers[2]}
                      size="md"
                      showLabel
                    />
                    <p
                      className="text-sm mt-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Medium
                    </p>
                  </div>
                  <div className="text-center">
                    <TierBadge
                      tier={sampleTiers[2]}
                      size="lg"
                      showLabel
                    />
                    <p
                      className="text-sm mt-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Large
                    </p>
                  </div>
                </div>
              </div>

              {/* 티어별 */}
              <div className="stats-card mb-6">
                <h3 className="stats-subtitle mb-4">티어별</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {sampleTiers.map((tier, index) => (
                    <div
                      key={tier.id}
                      className="text-center"
                    >
                      <TierBadge
                        tier={tier}
                        size="lg"
                        showLabel
                      />
                      <p
                        className="text-sm mt-2"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {tier.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 퍼센타일 표시 */}
              <div className="stats-card">
                <h3 className="stats-subtitle mb-4">퍼센타일 표시</h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <TierBadge
                      tier={sampleTiers[1]}
                      size="lg"
                      showPercentile
                      currentPercentile={25}
                      showLabel
                    />
                    <p
                      className="text-sm mt-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      25%
                    </p>
                  </div>
                  <div className="text-center">
                    <TierBadge
                      tier={sampleTiers[3]}
                      size="lg"
                      showPercentile
                      currentPercentile={75}
                      showLabel
                    />
                    <p
                      className="text-sm mt-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      75%
                    </p>
                  </div>
                  <div className="text-center">
                    <TierBadge
                      tier={sampleTiers[5]}
                      size="lg"
                      showPercentile
                      currentPercentile={99}
                      showLabel
                    />
                    <p
                      className="text-sm mt-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      99%+
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 테마 색상 팔레트 */}
            <section>
              <h2
                className="text-2xl font-semibold mb-6"
                style={{ color: "var(--color-text-primary)" }}
              >
                테마 색상 팔레트
              </h2>
              <div className="stats-card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Primary", var: "--color-text-primary" },
                    { name: "Secondary", var: "--color-text-secondary" },
                    {
                      name: "Interactive Primary",
                      var: "--color-interactive-primary",
                    },
                    {
                      name: "Interactive Secondary",
                      var: "--color-interactive-secondary",
                    },
                    { name: "Success", var: "--color-feedback-success" },
                    { name: "Error", var: "--color-feedback-error" },
                    { name: "Warning", var: "--color-feedback-warning" },
                    { name: "Info", var: "--color-feedback-info" },
                    { name: "Background", var: "--color-background" },
                    { name: "Surface", var: "--color-surface" },
                    { name: "Border", var: "--color-border" },
                    { name: "Elevated", var: "--color-elevated" },
                  ].map((color) => (
                    <div
                      key={color.var}
                      className="text-center"
                    >
                      <div
                        className="w-16 h-16 rounded-lg border mx-auto mb-2"
                        style={{
                          backgroundColor: `var(${color.var})`,
                          borderColor: "var(--color-border)",
                        }}
                      />
                      <p
                        className="text-xs font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {color.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {color.var}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 버튼 샘플 */}
            <section>
              <h2
                className="text-2xl font-semibold mb-6"
                style={{ color: "var(--color-text-primary)" }}
              >
                버튼 스타일
              </h2>
              <div className="stats-card">
                <div className="flex flex-wrap gap-4">
                  <button
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{
                      backgroundColor: "var(--color-interactive-primary)",
                      color: "var(--color-text-inverse)",
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg border font-medium"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--color-interactive-primary)",
                      borderColor: "var(--color-interactive-primary)",
                    }}
                  >
                    Outline Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{
                      backgroundColor: "var(--color-feedback-success)",
                      color: "var(--color-text-inverse)",
                    }}
                  >
                    Success Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{
                      backgroundColor: "var(--color-feedback-error)",
                      color: "var(--color-text-inverse)",
                    }}
                  >
                    Error Button
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
}
