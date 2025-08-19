# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Tasks

### Development
```bash
# Install dependencies (using Yarn)
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run linting
yarn lint

# Type check
yarn type-check
```

## Architecture Overview

This is a Korean/English typing practice web application built with Next.js 15, React 19, and TypeScript. The application focuses on accurate Korean IME (Input Method Editor) handling and real-time typing statistics.

### Key Architecture Components

1. **State Management (Zustand stores)**
   - `typingStore.ts`: Core typing state including current position, keystrokes, mistakes, and test progress. Handles Korean jamo filtering to prevent double-counting during IME composition.
   - `statsStore.ts`: Real-time typing statistics calculation (CPM/WPM, accuracy, consistency)
   - `settingsStore.ts`: User preferences for language, theme, test mode, and test targets

2. **Typing Engine (`src/components/core/`)**
   - `TypingEngine.tsx`: Main orchestrator component managing test lifecycle, timers, and IME composition states
   - `InputHandler.tsx`: Captures keyboard input and handles IME composition events
   - `TextRenderer.tsx`: Visual rendering of text with current position, correct/incorrect highlighting
   - `StatsCalculator.tsx`: Real-time circular progress charts for typing statistics
   - `TestResult.tsx`: Post-test results display

3. **Korean IME Handling**
   - Special logic to filter Korean jamo characters (Unicode ranges 0x3131-0x314F, 0x1100-0x11FF)
   - Composition state tracking to prevent duplicate keystroke registration during Hangul assembly
   - Accurate character comparison considering IME intermediate states

4. **Test Modes**
   - Time-based: Fixed duration tests (15/30/60/120 seconds)
   - Word-based: Fixed word count tests (10/25/50/100 words)
   - Dynamic text generation based on language pack and text type

### Path Aliases
- `@/*` maps to `./src/*` for cleaner imports

### Styling
- Tailwind CSS with custom theme variables for dark/light/high-contrast modes
- CSS variables defined in `globals.css` for consistent theming
- 이모지 사용을 자제하세요

---

## 프로젝트 개발 현황 (Development Status)

### 📁 프로젝트 구조 (Project Structure)

```
K-types/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── page.tsx           # 메인 타이핑 연습 페이지
│   │   ├── stats/page.tsx     # 통계 결과 페이지
│   │   ├── test-db/page.tsx   # 데이터베이스 연결 테스트 페이지
│   │   └── api/               # API Routes
│   ├── components/            # React 컴포넌트
│   │   ├── core/             # 핵심 타이핑 기능 컴포넌트
│   │   ├── ui/               # 공통 UI 컴포넌트
│   │   ├── settings/         # 설정 관련 컴포넌트
│   │   ├── stats/            # 통계 관련 컴포넌트
│   │   ├── gamification/     # 게임화 요소 컴포넌트
│   │   └── debug/            # 디버깅 도구
│   ├── stores/               # Zustand 상태 관리
│   ├── utils/                # 공통 유틸리티 함수
│   ├── modules/              # 언어팩, 테마 모듈
│   ├── data/                 # 정적 데이터 (문장, 단어)
│   ├── types/                # TypeScript 타입 정의
│   └── lib/                  # 외부 라이브러리 설정
```

### 🎯 핵심 기능 구현 현황 (Core Features Status)

#### ✅ 완료된 기능 (Completed Features)

1. **한글 IME 처리**
   - 한글 자모 필터링 (isKoreanJamo)
   - IME 조합 상태 추적
   - 중복 입력 방지
   - 브라우저별 호환성 (Chrome, Firefox, Safari)

2. **타이핑 엔진 코어**
   - 실시간 키스트로크 추적
   - 정확도 계산
   - 실수 위치 기록
   - 카운트다운 시작 (3-2-1)
   - 테스트 완료 처리

3. **텍스트 렌더링**
   - 현재 위치 하이라이트
   - 정확/오타 시각적 표시
   - 특수 키 처리 (스페이스, 엔터, 탭)
   - 스크롤 자동 조정

4. **설정 관리**
   - 언어 선택 (한국어/English)
   - 테마 선택 (다크/라이트/고대비)
   - 테스트 모드 (시간/단어 기반)
   - 텍스트 타입 (일반/구두점/숫자)
   - 로컬 스토리지 영속화

5. **통계 시스템**
   - 실시간 CPM/WPM 계산
   - 정확도 추적
   - 일관성 측정
   - 테스트 결과 저장

6. **데이터베이스 연동**
   - MongoDB 연결
   - 사용자 진행률 저장
   - 테스트 기록 관리
   - 약점 분석 데이터

7. **UI/UX**
   - 미니멀 디자인 적용
   - 반응형 레이아웃
   - 접근성 고려
   - 키보드 단축키 지원

#### 🔄 진행 중인 기능 (In Progress Features)

1. **게임화 시스템**
   - 배지 시스템 구현
   - 티어 시스템
   - 기록 비교
   - 레벨링 시스템

2. **통계 개선**
   - 상세 분석 그래프
   - 약점 분석
   - 개선 제안
   - 히스토리 추적

#### 📋 계획된 기능 (Planned Features)

1. **설정 토글 옵션**
   - 실시간 통계 표시/숨김 토글
   - 최소한의 정보만 표시 옵션
   - 사용자 정의 가능한 UI

2. **추가 언어 지원**
   - 일본어 지원
   - 중국어 지원
   - 기타 언어 확장

3. **고급 분석**
   - 타이핑 패턴 분석
   - 개인화된 연습 추천
   - 진행률 예측

### 🛠️ 기술 스택 (Technology Stack)

#### 프론트엔드
- **Next.js 15** - React 프레임워크
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Tailwind CSS 4** - 스타일링
- **Zustand** - 상태 관리
- **Lucide React** - 아이콘
- **Recharts** - 차트/그래프

#### 백엔드 & 데이터베이스
- **MongoDB** - 데이터베이스
- **Mongoose** - MongoDB ODM
- **Next.js API Routes** - 백엔드 API

#### 개발 도구
- **ESLint** - 코드 린팅
- **Prettier** - 코드 포매팅
- **TypeScript Compiler** - 타입 체크

### 📊 프로젝트 통계 (Project Statistics)

- **총 컴포넌트**: 24개
- **상태 스토어**: 4개 (typing, stats, settings, userProgress)
- **유틸리티 함수**: 8개 모듈
- **언어팩**: 2개 (한국어, 영어)
- **테마**: 3개 (다크, 라이트, 고대비)
- **API 엔드포인트**: 3개

### 🎨 디자인 철학 (Design Philosophy)

1. **기능에 충실한 미니멀 디자인**
   - 불필요한 요소 제거
   - 타이핑에 집중할 수 있는 환경
   - 깔끔한 시각적 피드백

2. **한국어 특화**
   - 한글 IME 완벽 지원
   - 한글 폰트 최적화
   - 문화적 맥락 고려

3. **사용자 경험 우선**
   - 직관적인 인터페이스
   - 빠른 피드백
   - 개인화 가능한 설정

### 🔍 주요 기술적 도전과 해결책

1. **한글 IME 처리**
   - **문제**: 한글 입력 시 자모 분리로 인한 중복 카운팅
   - **해결**: 유니코드 범위 기반 jamo 필터링, 조합 상태 추적

2. **실시간 성능 최적화**
   - **문제**: 키스트로크마다 통계 재계산으로 인한 성능 저하
   - **해결**: 메모이제이션, 배치 처리, 최적화된 상태 업데이트

3. **크로스 브라우저 호환성**
   - **문제**: 브라우저별 IME 동작 차이
   - **해결**: 브라우저 감지 및 개별 대응 로직

4. **카운트다운 중 입력 차단**
   - **문제**: 준비 시간 중 실수 입력 방지
   - **해결**: 이중 차단 (UI 레벨 + 스토어 레벨)

### 📝 코드 품질 기준

- **TypeScript 엄격 모드** 사용
- **ESLint** 규칙 준수
- **함수형 프로그래밍** 원칙 적용
- **관심사 분리** (SoC) 철저히 준수
- **컴포넌트 재사용성** 고려
- **성능 최적화** (메모이제이션, 지연 로딩)

### 🔧 개발 워크플로우

1. **타입 정의** 먼저 작성
2. **컴포넌트** 단위별 개발
3. **상태 관리** 중앙 집중화
4. **테스트** 실행 및 검증
5. **성능** 측정 및 최적화
6. **배포** 준비 및 빌드

### 📈 성능 지표

- **초기 로딩 시간**: < 2초
- **키 입력 응답 시간**: < 16ms (60fps)
- **메모리 사용량**: 최적화됨
- **번들 크기**: 압축 최적화