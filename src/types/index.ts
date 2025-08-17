// 언어팩 인터페이스
export interface LanguagePack {
  id: string;
  name: string;
  font: string;
  wordLists: {
    common: string[];        // 기본 단어 리스트
    punctuation: string[];   // 구두점 포함
    numbers: string[];       // 숫자 포함
  };
  sentences?: string[];      // 문장 연습용
}

// 테마 인터페이스
export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    correct: string;         // 올바른 타이핑 색상
    incorrect: string;       // 오타 색상
    current: string;         // 현재 문자 커서
    accent: string;
  };
}

// 키스트로크 데이터
export interface Keystroke {
  key: string;
  timestamp: number;
  correct: boolean;
  timeDelta: number;        // 이전 키 입력과의 시간차
}

// 실수 데이터
export interface Mistake {
  position: number;
  expected: string;
  actual: string;
  timestamp: number;
}

// 테스트 모드
export type TestMode = 'time' | 'words';

// 텍스트 타입
export type TextType = 'words' | 'punctuation' | 'numbers' | 'sentences';

// 디바이스 타입
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

// 타이핑 세션 데이터
export interface TypingSession {
  id: string;
  language: string;
  mode: TestMode;           // 시간 기반 vs 단어 수 기반
  target: number;           // 목표 (초 또는 단어 수)
  textType: TextType;
  device: DeviceType;
  
  // 결과 데이터
  wpm: number;              // Words Per Minute
  rawWpm: number;           // 오타 포함 WPM
  cpm: number;              // Characters Per Minute (분당 타수)
  rawCpm: number;           // 오타 포함 CPM
  accuracy: number;         // 정확도 (%)
  consistency: number;      // 일관성 점수
  
  keystrokes: Keystroke[];
  mistakes: Mistake[];
  
  // 시간 정보
  startTime?: Date;
  endTime?: Date;
  duration?: number;        // 실제 소요 시간 (ms)
}

// 타이핑 상태
export interface TypingState {
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  currentIndex: number;
  targetText: string;
  userInput: string;
  startTime: Date | null;
  endTime: Date | null;
}

// 실시간 통계
export interface LiveStats {
  wpm: number;
  rawWpm: number;
  cpm: number;              // Characters Per Minute (분당 타수)
  rawCpm: number;           // 오타 포함 CPM
  accuracy: number;
  consistency: number;
  timeElapsed: number;      // 경과 시간 (초)
  charactersTyped: number;
  errorsCount: number;
}

// 설정 인터페이스
export interface Settings {
  language: string;
  theme: string;
  testMode: TestMode;
  testTarget: number;       // 시간(초) 또는 단어 수
  textType: TextType;
  soundEnabled: boolean;
  showKeyboard: boolean;
  fontSize: number;
}

// 키보드 레이아웃
export interface KeyboardLayout {
  id: string;
  name: string;
  language: string;
  keys: KeyDefinition[][];
}

export interface KeyDefinition {
  key: string;
  display: string;
  width?: number;           // 키 너비 (기본값: 1)
  type?: 'normal' | 'space' | 'modifier';
}

// 콘텐츠 소스 (저작권 추적용)
export interface ContentSource {
  id: string;
  name: string;
  license: 'public-domain' | 'cc0' | 'original';
  source?: string;          // 원본 소스 URL
  attribution?: string;     // 저작자 표시
}

// 성능 메트릭
export interface PerformanceMetrics {
  inputLatency: number;     // 입력 지연시간 (ms)
  renderTime: number;       // 렌더링 시간 (ms)
  memoryUsage: number;      // 메모리 사용량 (MB)
}