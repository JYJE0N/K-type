"use client";

interface StatsHeaderProps {
  className?: string;
  language: 'korean' | 'english';
  testMode: 'words' | 'sentences';
  testTarget: number;
  sentenceLength: 'short' | 'medium' | 'long';
  sentenceStyle: 'plain' | 'punctuation' | 'numbers' | 'mixed';
}

export function StatsHeader({
  className = '',
  language,
  testMode,
  testTarget,
  sentenceLength,
  sentenceStyle
}: StatsHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        통계 및 분석
      </h1>
      
      <div className="flex items-center gap-2 flex-wrap">
        {/* 언어 칩 */}
        <span className="context-chip">
          {language === 'korean' ? '한글' : 'English'}
        </span>
        
        {/* 모드 칩 */}
        <span className="context-chip">
          {testMode === 'words' ? '단어' : '문장'}
        </span>
        
        {/* 목표 칩 */}
        <span className="context-chip">
          {testMode === 'words' ? `${testTarget}단어` : `${testTarget}문장`}
        </span>
        
        {/* 길이 칩 */}
        <span className="context-chip">
          {sentenceLength === 'short' ? '단문' : sentenceLength === 'medium' ? '중문' : '장문'}
        </span>
        
        {/* 스타일 칩 */}
        <span className="context-chip">
          {sentenceStyle === 'plain' ? '일반' : 
           sentenceStyle === 'punctuation' ? '구두점' : 
           sentenceStyle === 'numbers' ? '숫자' : '혼합'}
        </span>
      </div>
    </div>
  );
}