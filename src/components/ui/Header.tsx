"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { TypingTitle } from "./TypingTitle";
import { Settings, ChevronDown, ChevronUp, Type } from "lucide-react";
import { IoTime, IoText } from "react-icons/io5";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const { testMode, testTarget, textType, showSentences } = useSettingsStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <header className={`header ${className} bg-surface flex justify-center`}>
      <div className="w-full max-w-4xl px-6 py-6">
        {/* 메인 타이틀 */}
        <div className="text-center mb-6">
          <TypingTitle text="월루 타자기" />
        </div>

        {/* 기본 설정 - 테스트 모드와 목표값만 */}
        <div className="flex justify-center">
          <div className="header-main-settings flex items-center bg-surface/60 backdrop-blur-sm rounded-lg p-2 gap-4">
            {/* 테스트 모드 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => useSettingsStore.getState().setTestMode("time")}
                className={`flex items-center gap-2 px-4 py-2 text-lg rounded-md transition-all duration-200 font-medium ${
                  testMode === "time"
                    ? "header-menu-active"
                    : "header-menu-inactive"
                }`}
              >
                <IoTime className="w-5 h-5" />
                시간
              </button>
              <button
                onClick={() => useSettingsStore.getState().setTestMode("words")}
                className={`flex items-center gap-2 px-4 py-2 text-lg rounded-md transition-all duration-200 font-medium ${
                  testMode === "words"
                    ? "header-menu-active"
                    : "header-menu-inactive"
                }`}
              >
                <IoText className="w-5 h-5" />
                단어
              </button>
            </div>

            {/* 구분선 */}
            <div className="w-px h-8 bg-surface/30"></div>

            {/* 목표값 */}
            <div className="flex items-center gap-1">
              {testMode === "time"
                ? [15, 30, 60, 120].map((time) => (
                    <button
                      key={time}
                      onClick={() =>
                        useSettingsStore.getState().setTestTarget(time)
                      }
                      className={`px-4 py-2 text-md rounded-md transition-all duration-200 font-medium ${
                        testTarget === time
                          ? "header-menu-active"
                          : "header-menu-inactive"
                      }`}
                    >
                      {time}초
                    </button>
                  ))
                : [10, 25, 50, 100].map((words) => (
                    <button
                      key={words}
                      onClick={() =>
                        useSettingsStore.getState().setTestTarget(words)
                      }
                      className={`px-4 py-2 text-md rounded-md transition-all duration-200 font-medium ${
                        testTarget === words
                          ? "header-menu-active"
                          : "header-menu-inactive"
                      }`}
                    >
                      {words}단어
                    </button>
                  ))}
            </div>

            {/* 구분선 */}
            <div className="w-px h-8 bg-surface/30"></div>

            {/* 고급 설정 토글 */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-4 py-2 text-md rounded-md font-medium settings-toggle-button ${
                showAdvanced
                  ? "header-secondary-active active"
                  : "header-menu-inactive"
              }`}
              title="고급 설정 토글"
            >
              <Settings className="w-4 h-4" />
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 고급 설정 (조건부 표시) */}
        <div
          className={`advanced-settings-panel overflow-hidden transition-all duration-400 ${
            showAdvanced ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {showAdvanced && (
            <div className="flex flex-col items-center mt-6 gap-4 bg-surface/80 backdrop-blur-md rounded-xl p-6 shadow-lg">
              {/* 텍스트 타입 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-secondary font-medium">
                    텍스트
                  </span>
                </div>
                <button
                  onClick={() =>
                    useSettingsStore.getState().setTextType("words")
                  }
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                    textType === "words"
                      ? "header-secondary-active"
                      : "header-secondary-inactive"
                  }`}
                >
                  일반
                </button>
                <button
                  onClick={() =>
                    useSettingsStore.getState().setTextType("punctuation")
                  }
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                    textType === "punctuation"
                      ? "header-secondary-active"
                      : "header-secondary-inactive"
                  }`}
                >
                  구두점
                </button>
                <button
                  onClick={() =>
                    useSettingsStore.getState().setTextType("numbers")
                  }
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                    textType === "numbers"
                      ? "header-secondary-active"
                      : "header-secondary-inactive"
                  }`}
                >
                  숫자
                </button>

                {/* 문장 옵션 */}
                {showSentences && (
                  <>
                    <span className="w-px h-4 bg-text-secondary opacity-20 mx-1"></span>
                    <button
                      onClick={() =>
                        useSettingsStore
                          .getState()
                          .setTextType("short-sentences")
                      }
                      className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                        textType === "short-sentences"
                          ? "header-secondary-active"
                          : "header-secondary-inactive"
                      }`}
                    >
                      단문
                    </button>
                    <button
                      onClick={() =>
                        useSettingsStore
                          .getState()
                          .setTextType("medium-sentences")
                      }
                      className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                        textType === "medium-sentences"
                          ? "header-secondary-active"
                          : "header-secondary-inactive"
                      }`}
                    >
                      중문
                    </button>
                    <button
                      onClick={() =>
                        useSettingsStore
                          .getState()
                          .setTextType("long-sentences")
                      }
                      className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                        textType === "long-sentences"
                          ? "header-secondary-active"
                          : "header-secondary-inactive"
                      }`}
                    >
                      장문
                    </button>
                  </>
                )}
              </div>

              {/* 추가 옵션 */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() =>
                    useSettingsStore.getState().setShowSentences(!showSentences)
                  }
                  className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                    showSentences
                      ? "header-secondary-active"
                      : "header-secondary-inactive"
                  }`}
                  title="문장 옵션 표시/숨기기"
                >
                  {showSentences ? "문장 숨김" : "문장 표시"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
