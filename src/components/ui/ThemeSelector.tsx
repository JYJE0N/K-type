"use client";

import { useState, useRef, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { ChevronDown, Palette, Check } from "lucide-react";

// 테마 정보 정의
const themeConfigs = {
  dark: {
    id: 'dark' as const,
    name: '다크',
    description: '깔끔한 어두운 테마',
    preview: '#1a1b3a',
    category: 'standard'
  },
  light: {
    id: 'light' as const,
    name: '라이트',
    description: '밝고 깨끗한 테마',
    preview: '#f8faf9',
    category: 'standard'
  },
  'high-contrast': {
    id: 'high-contrast' as const,
    name: '고대비',
    description: '높은 대비의 접근성 테마',
    preview: '#0a0a0a',
    category: 'accessibility'
  },
  stealth: {
    id: 'stealth' as const,
    name: '은밀 (트렐로)',
    description: '업무용 칸반 스타일',
    preview: '#f7f8fc',
    category: 'stealth'
  },
  'stealth-docs': {
    id: 'stealth-docs' as const,
    name: '은밀 (문서)',
    description: '구글 문서 스타일',
    preview: '#ffffff',
    category: 'stealth'
  },
  'stealth-slack': {
    id: 'stealth-slack' as const,
    name: '은밀 (슬랙)',
    description: '팀 협업 툴 스타일',
    preview: '#f8f8f8',
    category: 'stealth'
  }
} as const;

type ThemeId = keyof typeof themeConfigs;

const categoryLabels = {
  standard: '기본 테마',
  accessibility: '접근성',
  stealth: '은밀 모드'
} as const;

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { theme, setTheme } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const currentTheme = themeConfigs[theme as ThemeId] || themeConfigs.dark;

  const handleThemeSelect = (themeId: ThemeId) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  // 카테고리별로 테마 그룹핑
  const groupedThemes = Object.values(themeConfigs).reduce((acc, theme) => {
    if (!acc[theme.category]) {
      acc[theme.category] = [];
    }
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<string, typeof themeConfigs[ThemeId][]>);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-background-secondary hover:bg-background-elevated
          border border-text-tertiary border-opacity-20
          text-text-primary text-sm font-medium
          transition-all duration-200
          hover:shadow-md hover:border-opacity-40
          focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:ring-opacity-50
          ${isOpen ? 'bg-background-elevated border-opacity-40 shadow-md' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">{currentTheme.name}</span>
        <div 
          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: currentTheme.preview }}
          aria-label={`현재 테마: ${currentTheme.name}`}
        />
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className={`
          absolute top-full left-0 mt-2 w-72 
          bg-background-secondary rounded-lg 
          border border-text-tertiary border-opacity-20
          shadow-xl shadow-black/10
          backdrop-blur-sm
          z-50
          animate-in slide-in-from-top-2 duration-200
        `}>
          <div className="p-2">
            {Object.entries(groupedThemes).map(([category, themes]) => (
              <div key={category} className="mb-3 last:mb-0">
                <h3 className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
                <div className="space-y-1">
                  {themes.map((themeOption) => (
                    <button
                      key={themeOption.id}
                      onClick={() => handleThemeSelect(themeOption.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-md
                        text-left transition-all duration-150
                        hover:bg-background-elevated
                        focus:outline-none focus:bg-background-elevated
                        ${theme === themeOption.id 
                          ? 'bg-interactive-primary bg-opacity-10 text-interactive-primary' 
                          : 'text-text-primary hover:text-interactive-primary'
                        }
                      `}
                    >
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: themeOption.preview }}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{themeOption.name}</div>
                        <div className="text-xs text-text-secondary truncate">
                          {themeOption.description}
                        </div>
                      </div>
                      {theme === themeOption.id && (
                        <Check className="w-4 h-4 text-interactive-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}