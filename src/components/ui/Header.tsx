"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { TypingTitle } from "./TypingTitle";
import {
  Clock,
  Type,
  Hash,
  AtSign,
  Palette,
  Globe,
  FileText,
  Settings,
} from "lucide-react";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const { language, theme, testMode, testTarget, textType, showSentences } =
    useSettingsStore();

  return (
    <header className={`header ${className} bg-surface flex justify-center`}>
      <div className="w-full max-w-4xl px-6 py-6">
        {/* 메인 타이틀 */}
        <div className="text-center mb-6">
          <TypingTitle text="한글 타자기" />
        </div>

        {/* MonkeyType 스타일 설정 바 */}
        <div className="flex justify-center">
          <div className="flex items-center bg-surface/60 backdrop-blur-sm rounded-lg p-2 gap-4">
            {/* 텍스트 타입 (왼쪽) */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  useSettingsStore.getState().setTextType("punctuation")
                }
                className={`flex items-center gap-2 px-3 py-2 text-m rounded-md transition-all duration-200 font-medium ${
                  textType === "punctuation"
                    ? "header-menu-active"
                    : "header-menu-inactive"
                }`}
              >
                <AtSign className="w-4.5 h-4.5" />
                구두점
              </button>
              <button
                onClick={() =>
                  useSettingsStore.getState().setTextType("numbers")
                }
                className={`flex items-center gap-2 px-3 py-2 text-m rounded-md transition-all duration-200 font-medium ${
                  textType === "numbers"
                    ? "header-menu-active"
                    : "header-menu-inactive"
                }`}
              >
                <Hash className="w-4.5 h-4.5" />
                숫자
              </button>
            </div>

            {/* 구분선 */}
            <div className="w-px h-6 bg-surface/50"></div>

            {/* 테스트 모드 (가운데) */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => useSettingsStore.getState().setTestMode("time")}
                className={`flex items-center gap-2 px-3 py-2 text-m rounded-md transition-all duration-200 font-medium ${
                  testMode === "time"
                    ? "header-menu-active"
                    : "header-menu-inactive"
                }`}
              >
                <Clock className="w-4.5 h-4.5" />
                시간
              </button>
              <button
                onClick={() => useSettingsStore.getState().setTextType("words")}
                className={`flex items-center gap-2 px-3 py-2 text-m rounded-md transition-all duration-200 font-medium ${
                  textType === "words"
                    ? "header-menu-active"
                    : "header-menu-inactive"
                }`}
              >
                <Type className="w-4.5 h-4.5" />
                단어
              </button>
              {showSentences && (
                <>
                  <button
                    onClick={() =>
                      useSettingsStore.getState().setTextType("short-sentences")
                    }
                    className={`flex items-center gap-2 px-3 py-2 text-m rounded-md transition-all duration-200 font-medium ${
                      textType === "short-sentences"
                        ? "header-menu-active"
                        : "header-menu-inactive"
                    }`}
                  >
                    <FileText className="w-4.5 h-4.5" />
                    단문
                  </button>
                  <button
                    onClick={() =>
                      useSettingsStore.getState().setTextType("medium-sentences")
                    }
                    className={`flex items-center gap-2 px-3 py-2 text-m rounded-md transition-all duration-200 font-medium ${
                      textType === "medium-sentences"
                        ? "header-menu-active"
                        : "header-menu-inactive"
                    }`}
                  >
                    <FileText className="w-4.5 h-4.5" />
                    중문
                  </button>
                  <button
                    onClick={() =>
                      useSettingsStore.getState().setTextType("long-sentences")
                    }
                    className={`flex items-center gap-2 px-3 py-2 text-m rounded-md transition-all duration-200 font-medium ${
                      textType === "long-sentences"
                        ? "header-menu-active"
                        : "header-menu-inactive"
                    }`}
                  >
                    <FileText className="w-4.5 h-4.5" />
                    장문
                  </button>
                </>
              )}
            </div>

            {/* 구분선 */}
            <div className="w-px h-6 bg-surface/50"></div>

            {/* 목표값 (오른쪽) */}
            <div className="flex items-center gap-1">
              {testMode === "time"
                ? [15, 30, 60, 120].map((time) => (
                    <button
                      key={time}
                      onClick={() =>
                        useSettingsStore.getState().setTestTarget(time)
                      }
                      className={`px-3 py-2 text-sm rounded-md transition-all duration-200 font-medium ${
                        testTarget === time
                          ? "header-menu-active"
                          : "header-menu-inactive"
                      }`}
                    >
                      {time}
                    </button>
                  ))
                : [10, 25, 50, 100].map((words) => (
                    <button
                      key={words}
                      onClick={() =>
                        useSettingsStore.getState().setTestTarget(words)
                      }
                      className={`px-3 py-2 text-sm rounded-md transition-all duration-200 font-medium ${
                        testTarget === words
                          ? "header-menu-active"
                          : "header-menu-inactive"
                      }`}
                    >
                      {words}
                    </button>
                  ))}
            </div>
          </div>
        </div>

        {/* 보조 설정 (언어, 테마) */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-4">
            {/* 언어 선택 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  useSettingsStore.getState().setLanguage("korean")
                }
                className={`flex items-center gap-2 px-3 py-1.5 text-s rounded-md transition-all duration-200 font-medium ${
                  language === "korean"
                    ? "header-secondary-active"
                    : "header-secondary-inactive"
                }`}
              >
                <Globe className="w-4 h-4" />
                한국어
              </button>
              <button
                onClick={() =>
                  useSettingsStore.getState().setLanguage("english")
                }
                className={`px-3 py-1.5 text-s rounded-md transition-all duration-200 font-medium ${
                  language === "english"
                    ? "header-secondary-active"
                    : "header-secondary-inactive"
                }`}
              >
                English
              </button>
            </div>

            {/* 테마 선택 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => useSettingsStore.getState().setTheme("dark")}
                className={`flex items-center gap-2 px-3 py-1.5 text-s rounded-md transition-all duration-200 font-medium ${
                  theme === "dark"
                    ? "header-secondary-active"
                    : "header-secondary-inactive"
                }`}
              >
                <Palette className="w-4 h-4" />
                다크
              </button>
              <button
                onClick={() => useSettingsStore.getState().setTheme("light")}
                className={`px-3 py-1.5 text-s rounded-md transition-all duration-200 font-medium ${
                  theme === "light"
                    ? "header-secondary-active"
                    : "header-secondary-inactive"
                }`}
              >
                라이트
              </button>
              <button
                onClick={() =>
                  useSettingsStore.getState().setTheme("high-contrast")
                }
                className={`px-3 py-1.5 text-s rounded-md transition-all duration-200 font-medium ${
                  theme === "high-contrast"
                    ? "header-secondary-active"
                    : "header-secondary-inactive"
                }`}
              >
                고대비
              </button>
            </div>

            {/* 설정 옵션 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  useSettingsStore.getState().setShowSentences(!showSentences)
                }
                className={`flex items-center gap-2 px-3 py-1.5 text-s rounded-md transition-all duration-200 font-medium ${
                  showSentences
                    ? "header-secondary-active"
                    : "header-secondary-inactive"
                }`}
                title="문장 옵션 표시/숨기기"
              >
                <Settings className="w-4 h-4" />
                문장
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
