"use client";

import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";

interface StatsButtonProps {
  className?: string;
}

export function StatsButton({ className = "" }: StatsButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/stats");
  };

  return (
    <div
      className={`fixed top-6 right-48 z-40 ${className}`}
    >
      <button
        onClick={handleClick}
        className="flex items-center bg-surface/80 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-surface/90 transition-all duration-200 border border-white/10 hover:border-white/20"
        title="통계 보기"
      >
        <BarChart3 className="w-4 h-4 text-text-secondary" />
        <span className="ml-2 text-sm text-text-secondary font-medium">통계</span>
      </button>
    </div>
  );
}