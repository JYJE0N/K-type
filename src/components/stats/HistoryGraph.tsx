"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useUserProgressStore } from "@/stores/userProgressStore";

interface HistoryDataPoint {
  date: string;
  cpm: number;
  wpm: number;
  accuracy: number;
  testNumber: number;
}

interface HistoryGraphProps {
  primaryMetric?: 'cpm' | 'wpm';
}

export function HistoryGraph({ primaryMetric = 'cpm' }: HistoryGraphProps) {
  const { recentTests } = useUserProgressStore();
  const [data, setData] = useState<HistoryDataPoint[]>([]);

  useEffect(() => {
    if (recentTests.length > 0) {
      // 최근 20개 테스트만 표시 (날짜 순으로 정렬)
      const sortedTests = [...recentTests]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-20);

      const historyData = sortedTests.map((test, index) => ({
        date: new Date(test.date).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
          timeZone: "Asia/Seoul",
        }),
        cpm: test.cpm || 0,
        wpm: test.wpm || 0,
        accuracy: test.accuracy || 0,
        testNumber: index + 1,
      }));

      setData(historyData);
    }
  }, [recentTests]);

  if (data.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-background rounded-lg p-4 h-64 flex items-center justify-center">
          <div className="text-center text-secondary">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-sm">아직 테스트 기록이 없습니다</p>
            <p className="caption text-muted mt-2">
              테스트를 완료하면 여기에 성과 추이가 표시됩니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-64 bg-background rounded-lg p-4 mb-4 flex items-center justify-center">
        <div className="w-full h-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{ top: 15, right: 25, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-text-secondary)"
                opacity={0.3}
              />
              <XAxis
                dataKey="testNumber"
                stroke="var(--color-text-secondary)"
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                tickFormatter={(value) => `#${value}`}
              />
              <YAxis
                stroke="var(--color-text-secondary)"
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                width={50}
                tickFormatter={(value) =>
                  value > 999 ? `${(value / 1000).toFixed(1)}k` : value
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-interactive-primary)",
                  borderRadius: "8px",
                  padding: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "var(--color-text-primary)", fontWeight: "600" }}
                itemStyle={{ color: "var(--color-text-primary)" }}
                formatter={(value: number, name: string) => {
                  if (name === "cpm") return [`${value} CPM`, "CPM"];
                  if (name === "wpm") return [`${value} WPM`, "WPM"];
                  if (name === "accuracy") return [`${value}%`, "정확도"];
                  return [value, name];
                }}
                labelFormatter={(label) => `테스트 #${label}`}
              />

              <Line
                type="monotone"
                dataKey="cpm"
                stroke="var(--color-interactive-primary)"
                strokeWidth={3}
                dot={{ fill: "var(--color-interactive-primary)", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "var(--color-interactive-primary)",
                  strokeWidth: 3,
                  fill: "var(--color-background)",
                }}
                connectNulls={true}
                name="cpm"
              />

              <Line
                type="monotone"
                dataKey="wpm"
                stroke="var(--color-interactive-secondary)"
                strokeWidth={2}
                dot={{ fill: "var(--color-interactive-secondary)", strokeWidth: 2, r: 3 }}
                activeDot={{
                  r: 5,
                  stroke: "var(--color-interactive-secondary)",
                  strokeWidth: 2,
                  fill: "var(--color-background)",
                }}
                connectNulls={true}
                name="wpm"
              />

              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="var(--color-feedback-success)"
                strokeWidth={2}
                dot={{ fill: "var(--color-feedback-success)", strokeWidth: 2, r: 3 }}
                activeDot={{
                  r: 5,
                  stroke: "var(--color-feedback-success)",
                  strokeWidth: 2,
                  fill: "var(--color-background)",
                }}
                connectNulls={true}
                name="accuracy"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 범례 */}
      <div className="bg-surface rounded-lg p-4 border border-opacity-20 border-interactive-primary">
        <div className="flex justify-center items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full shadow-sm bg-interactive-primary"></div>
            <span className="text-sm text-primary font-medium">CPM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full shadow-sm bg-interactive-secondary"></div>
            <span className="text-sm text-primary font-medium">WPM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full shadow-sm bg-feedback-success"></div>
            <span className="text-sm text-primary font-medium">정확도 (%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
