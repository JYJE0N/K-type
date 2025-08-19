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

export function HistoryGraph() {
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-secondary">
          <div className="text-4xl mb-4">Graph</div>
          <p className="text-sm">아직 테스트 기록이 없습니다</p>
          <p className="caption text-muted mt-2">
            테스트를 완료하면 여기에 성과 추이가 표시됩니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--text-secondary)"
            opacity={0.2}
          />
          <XAxis
            dataKey="testNumber"
            stroke="var(--text-secondary)"
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            tickFormatter={(value) => `#${value}`}
          />
          <YAxis
            stroke="var(--text-secondary)"
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--text-secondary)",
              borderRadius: "8px",
              padding: "8px",
            }}
            labelStyle={{ color: "var(--text-primary)" }}
            itemStyle={{ color: "var(--text-primary)" }}
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
            stroke="var(--color-accent)"
            strokeWidth={3}
            dot={{ fill: "var(--color-accent)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "var(--color-accent)", strokeWidth: 2 }}
            connectNulls={true}
            name="cpm"
          />

          <Line
            type="monotone"
            dataKey="wpm"
            stroke="var(--text-secondary)"
            strokeWidth={2}
            dot={{ fill: "var(--text-secondary)", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: "var(--text-secondary)", strokeWidth: 2 }}
            connectNulls={true}
            name="wpm"
          />

          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="var(--text-muted)"
            strokeWidth={2}
            dot={{ fill: "var(--text-muted)", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: "var(--text-muted)", strokeWidth: 2 }}
            connectNulls={true}
            name="accuracy"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* 범례 */}
      <div className="flex justify-center items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: "var(--color-accent)" }}
          ></div>
          <span className="text-sm text-primary font-medium">CPM</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: "var(--text-secondary)" }}
          ></div>
          <span className="text-sm text-primary font-medium">WPM</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: "var(--text-muted)" }}
          ></div>
          <span className="text-sm text-primary font-medium">정확도 (%)</span>
        </div>
      </div>
    </div>
  );
}
