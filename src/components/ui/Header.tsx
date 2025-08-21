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
    <header className={`${className} flex justify-center`} style={{ backgroundColor: '#212229' }}>
      <div className="w-full max-w-4xl px-6 py-6">
        {/* 메인 타이틀 */}
        <div className="text-center mb-6">
          <TypingTitle text="월루 타자기" />
        </div>

        {/* 기본 설정 - 테스트 모드와 목표값만 */}
        <div className="flex justify-center">
          <div className="flex items-center bg-background-elevated/60 backdrop-blur-sm rounded-lg p-2 gap-4">
            {/* 테스트 모드 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => useSettingsStore.getState().setTestMode("time")}
                className={`flex items-center gap-2 px-4 py-2 text-lg rounded-md transition-all duration-200 font-medium ${
                  testMode === "time"
                    ? "shadow-sm"
                    : "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary"
                }`}
                style={testMode === "time" ? { backgroundColor: '#ff79c6', color: '#282a36' } : {}}
              >
                <IoTime className="w-5 h-5" />
                시간
              </button>
              <button
                onClick={() => useSettingsStore.getState().setTestMode("words")}
                className={`flex items-center gap-2 px-4 py-2 text-lg rounded-md transition-all duration-200 font-medium ${
                  testMode === "words"
                    ? "shadow-sm"
                    : "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary"
                }`}
                style={testMode === "words" ? { backgroundColor: '#ff79c6', color: '#282a36' } : {}}
              >
                <IoText className="w-5 h-5" />
                단어
              </button>
            </div>

            {/* 구분선 */}
            <div className="w-px h-8 bg-text-tertiary/40"></div>

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
                          ? "shadow-sm"
                          : "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary"
                      }`}
                      style={testTarget === time ? { backgroundColor: '#ff79c6', color: '#282a36' } : {}}
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
                          ? "shadow-sm"
                          : "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary"
                      }`}
                      style={testTarget === words ? { backgroundColor: '#ff79c6', color: '#282a36' } : {}}
                    >
                      {words}단어
                    </button>
                  ))}
            </div>

            {/* 구분선 */}
            <div className="w-px h-8 bg-text-tertiary/40"></div>

            {/* 고급 설정 토글 */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-4 py-2 text-md rounded-md font-medium transition-all duration-200 ${
                showAdvanced
                  ? "shadow-sm"
                  : "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary"
              }`}
              style={showAdvanced ? { backgroundColor: '#bd93f9', color: '#f8f8f2' } : {}}
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
          className={`overflow-hidden transition-all duration-400 ${
            showAdvanced ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {showAdvanced && (
            <div className="flex flex-col items-center mt-6 gap-4 bg-background-elevated/80 backdrop-blur-md rounded-xl p-6 shadow-lg">
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
                      ? "bg-interactive-primary/20 text-interactive-primary border border-interactive-primary/30"
                      : "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary border border-transparent"
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
                      ? "bg-interactive-primary/20 text-interactive-primary border border-interactive-primary/30"
                      : "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary border border-transparent"
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
                      ? "bg-interactive-primary/20 text-interactive-primary border border-interactive-primary/30"
                      : "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary border border-transparent"
                  }`}
                >
                  숫자
                </button>

                {/* 문장 옵션 */}
                {showSentences && (
                  <>
                    <span className="w-px h-4 bg-text-tertiary/40 mx-1"></span>
                    <button
                      onClick={() =>
                        useSettingsStore
                          .getState()
                          .setTextType("short-sentences")
                      }
                      className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                        textType === "short-sentences"
                          ? "bg-interactive-primary/20 text-interactive-primary border border-interactive-primary/30"
                          : "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary border border-transparent"
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
                          ? "bg-interactive-primary/20 text-interactive-primary border border-interactive-primary/30"
                          : "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary border border-transparent"
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
                          ? "bg-interactive-primary/20 text-interactive-primary border border-interactive-primary/30"
                          : "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary border border-transparent"
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
                      ? "bg-interactive-primary/20 text-interactive-primary border border-interactive-primary/30"
                      : "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary border border-transparent"
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
