"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { Palette } from "lucide-react";

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className = "" }: ThemeSelectorProps) {
  const { theme } = useSettingsStore();
  const [isHovered, setIsHovered] = useState(false);

  const themes = [
    { id: "dark", label: "다크" },
    { id: "light", label: "라이트" },
    { id: "high-contrast", label: "고대비" },
  ] as const;

  return (
    <div
      className={`fixed top-6 right-6 z-50 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center bg-surface/80 backdrop-blur-sm rounded-lg overflow-hidden">
        {/* 테마 아이콘 (항상 표시) */}
        <div className="flex items-center px-3 py-2">
          <Palette className="w-4 h-4 text-text-secondary" />
        </div>

        {/* 테마 옵션들 (호버시 슬라이드) */}
        <div
          className={`flex items-center transition-all duration-300 ease-in-out ${
            isHovered ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
          style={{ 
            width: isHovered ? "auto" : "0",
            overflow: "hidden"
          }}
        >
          <div className="flex items-center gap-1 px-2">
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => useSettingsStore.getState().setTheme(themeOption.id as any)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors whitespace-nowrap ${
                  theme === themeOption.id ? "header-secondary-active" : "header-secondary-inactive"
                }`}
              >
                {themeOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}