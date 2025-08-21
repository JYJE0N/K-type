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
  },
  'stealth-notion': {
    id: 'stealth-notion' as const,
    name: '은밀 (노션)',
    description: '노션 문서 스타일',
    preview: '#ffffff',
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
  
  // 디버깅 정보
  console.log('Current theme:', theme);
  console.log('data-theme attribute:', document.documentElement.getAttribute('data-theme'));
  console.log('Computed background:', getComputedStyle(document.documentElement).getPropertyValue('--color-background'));

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
          flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
          transition-all duration-200
          focus:outline-none
        `}
        style={{
          backgroundColor: isOpen 
            ? 'var(--color-background-elevated)' 
            : 'transparent',
          color: 'var(--color-text-primary)',
          border: `1px solid var(--color-border)`,
          boxShadow: isOpen ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
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
        <div 
          className={`
            absolute top-full left-0 mt-2 w-72 max-h-80
            rounded-lg shadow-xl
            z-[9999]
            animate-in slide-in-from-top-2 duration-200
            overflow-y-auto scrollbar-hide
          `}
          style={{
            backgroundColor: 'var(--color-background-elevated)',
            borderColor: 'var(--color-border)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="p-2">
            {Object.entries(groupedThemes).map(([category, themes]) => (
              <div key={category} className="mb-3 last:mb-0">
                <h3 
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
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
                        focus:outline-none
                      `}
                      style={{
                        backgroundColor: theme === themeOption.id 
                          ? 'var(--color-interactive-primary)' 
                          : 'transparent',
                        color: theme === themeOption.id 
                          ? 'var(--color-text-inverse)' 
                          : 'var(--color-text-primary)',
                        '--hover-bg': 'var(--color-background-elevated)',
                        '--hover-color': 'var(--color-interactive-primary)'
                      } as React.CSSProperties & { '--hover-bg': string; '--hover-color': string }}
                      onMouseEnter={(e) => {
                        if (theme !== themeOption.id) {
                          e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)';
                          e.currentTarget.style.color = 'var(--color-interactive-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (theme !== themeOption.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--color-text-primary)';
                        }
                      }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: themeOption.preview }}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{themeOption.name}</div>
                        <div 
                          className="text-xs truncate"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          {themeOption.description}
                        </div>
                      </div>
                      {theme === themeOption.id && (
                        <Check 
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: 'var(--color-text-inverse)' }}
                        />
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