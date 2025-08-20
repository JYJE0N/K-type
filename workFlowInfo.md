# 월급 루팡 타자기 - 프로젝트 명세서

## 🎯 프로젝트 개요
직장인을 위한 은밀하고 재미있는 타자연습 플랫폼. "합법적으로 시간을 훔쳐서" 실력을 키우는 컨셉의 타이핑 게임.

**패키지 매니저**: Yarn  
**기반 프로젝트**: K-Types (기존 타자연습 웹앱)

---

## 🎨 1. 테마 시스템 (UI/UX Design)

### 1.1 다크모드
- **컬러 팔레트**: 네이비-퍼플 베이스, 핑크/오렌지 액센트
- **특징**: 눈의 피로 최소화, 집중력 향상
- **대상**: 장시간 사용자, 야간 근무자

### 1.2 라이트모드  
- **컬러 팔레트**: 민트-화이트 베이스, 소프트 블루 액센트
- **특징**: 깔끔하고 밝은 인터페이스
- **대상**: 일반 사무환경 사용자

### 1.3 은밀모드 (Stealth Mode) ⭐
- **컬러 팔레트**: Microsoft Word 스타일 화이트 베이스
- **특징**: 일반 문서 작업처럼 보이는 UI
- **핵심 기능**: 
  - 상사가 와도 자연스러운 인터페이스
  - 통계창 즉시 숨김 기능 (ESC 키 등)
  - 가짜 문서 헤더/푸터 표시
  - "문서 작성 중..." 같은 위장 텍스트

### 1.4 디자인 토큰 시스템
```typescript
interface DesignTokens {
  colors: {
    [themeName: string]: {
      background: string
      surface: string
      text: string
      textSecondary: string
      correct: string
      incorrect: string
      current: string
      accent: string
    }
  }
  typography: FontSystem
  spacing: SpacingScale
  animations: AnimationTokens
}
```

---

## ⚔️ 2. 대결모드 시스템

### 2.1 성적 계산 시스템 (CPM/WPM)

**언어별 성적 기준**:
- **한글**: CPM (Characters Per Minute) 기본 표시
- **영문**: WPM (Words Per Minute) 기본 표시
- 두 지표 모두 제공하되, 언어에 따라 주/부 표시 구분

**한글 CPM 판정 로직** (관대한 기준):
```typescript
// 한글 조합형 문자 처리
interface KoreanStroke {
  초성: number  // ㄱ,ㄴ,ㄷ... (19개)
  중성: number  // ㅏ,ㅑ,ㅓ... (21개) 
  종성?: number // ㄱ,ㄴ,ㄷ... (27개, 선택적)
}

// 관대한 CPM 계산 (사용자 친화적)
function calculateKoreanCPM(input: string, timeInMinutes: number): number {
  let totalStrokes = 0
  
  for (const char of input) {
    if (isKorean(char)) {
      // 한글 조합: 초성(1) + 중성(1) + 종성(0~1) = 2~3타로 계산
      const strokes = hasJongseong(char) ? 3 : 2
      totalStrokes += strokes
    } else if (char === ' ') {
      totalStrokes += 1  // 스페이스
    } else {
      totalStrokes += 1  // 기타 문자 (숫자, 구두점 등)
    }
  }
  
  return Math.round(totalStrokes / timeInMinutes)
}
```

**관대한 판정 기준 적용 이유**:
- 사용자 동기부여 및 재방문율 향상
- 학습 초기 좌절감 방지
- 점진적 실력 향상 체감도 증대
- 경쟁보다는 개인 발전에 집중

### 2.2 디테일한 통계 & 생산적 조언 시스템
**오타 분석 기능**:
- 자주 틀리는 문자/단어 패턴 분석
- 손가락별 정확도 추적 (키보드 히트맵)
- 시간대별 실력 변화 그래프
- 타이핑 리듬 분석 (일정한 속도 vs 들쑥날쑥)

**AI 기반 조언 시스템**:
- 개인 약점 기반 맞춤 연습 문제 생성
- "왼손 새끼손가락 연습이 필요해요" 같은 구체적 피드백
- 단계별 개선 커리큘럼 제공

### 2.3 티어 시스템 (언어별 기준)
**한글 기준 (CPM)**:
```
플래티넘 (500+ CPM) - 타자의 신
골드 (400-499 CPM) - 키보드 마스터  
실버 (300-399 CPM) - 능숙한 타이피스트
브론즈 (200-299 CPM) - 연습 중인 직장인
아무개 (0-199 CPM) - 타자 입문자
```

**영문 기준 (WPM)**:
```
플래티넘 (100+ WPM) - 타자의 신
골드 (80-99 WPM) - 키보드 마스터
실버 (60-79 WPM) - 능숙한 타이피스트  
브론즈 (40-59 WPM) - 연습 중인 직장인
아무개 (0-39 WPM) - 타자 입문자
```

### 2.4 승급전 시스템
- **주기**: 월 2회 (매월 1일, 15일)
- **승급 조건**: 
  - 해당 티어 기준 3회 연속 달성
  - 최소 10회 이상 게임 참여
  - 정확도 95% 이상 유지
  - **언어별 기준 적용** (한글은 CPM, 영문은 WPM)
- **강등 방지**: 승급 후 1주일 강등 보호기간

### 2.4 고스트 모드 (자기 기록 경신)
- **개념**: 자신의 이전 최고 기록과 실시간 대결
- **시각화**: 
  - 반투명 진행률 바로 과거 기록 표시
  - "현재 기록보다 5타 빠름!" 같은 실시간 피드백
- **동기부여**: 남과의 경쟁이 아닌 자기 발전에 집중

### 2.5 근로왕 시스템
- **출석 포인트**: 일일 접속 시 포인트 적립
- **근로왕 선발**: 월간 최다 출석자 (단순 시간이 아닌 의미있는 연습 기준)
- **보상 시스템**: 
  - 특별 테마 잠금 해제
  - 한정 타이틀 및 뱃지
  - "이달의 근로왕" 명예의 전당

---

## ✨ 3. 타이핑 애니메이션 시스템

### 3.1 시그니처 애니메이션 (삼성 갤럭시 키카페 벤치마킹)
**기본 피드백**:
- 키 입력 시 부드러운 리플 이펙트
- 정확한 타이핑 시 은은한 파티클 효과
- 오타 시 부드러운 shake 애니메이션

**연속 타이핑 피드백**:
- 10타 연속 정확 → 작은 스파크
- 30타 연속 정확 → 콤보 카운터 + 색상 변화
- 50타 연속 정확 → 화면 가장자리 글로우 효과

### 3.2 300타 이상 화려한 효과
```typescript
// 실시간 통계 계산
interface LiveStats {
  // 언어별 주요 지표
  cpm: number              // Characters Per Minute (한글 기본)
  wpm: number              // Words Per Minute (영문 기본)
  rawCpm: number           // 오타 포함 CPM
  rawWpm: number           // 오타 포함 WPM
  
  // 공통 지표
  accuracy: number         // 정확도 (%)
  consistency: number      // 타이핑 리듬 일관성
  timeElapsed: number      // 경과 시간 (초)
  charactersTyped: number  // 입력한 총 문자 수
  errorsCount: number      // 오타 횟수
  
  // 한글 특화 통계
  koreanStrokes?: number   // 한글 조합 스트로크 수
  jongseongAccuracy?: number // 받침 정확도
}

// 관대한 정확도 계산 (한글 특화)
function calculateKoreanAccuracy(
  target: string, 
  input: string, 
  isLenient: boolean = true
): number {
  if (isLenient) {
    // 조합 과정의 중간 상태는 오타로 계산하지 않음
    // 최종 완성된 글자만 비교
    return calculateFinalCharacterAccuracy(target, input)
  } else {
    // 엄격한 기준: 모든 키스트로크 검증
    return calculateStrictAccuracy(target, input)
  }
}
```
  300: {
    name: "스파크 모드",
    particles: "작은 별 파티클",
    color: "골드"
  },
  400: {
    name: "번개 모드", 
    particles: "전기 효과",
    color: "일렉트릭 블루"
  },
  500: {
    name: "화염 모드",
    particles: "불꽃 파티클",
    color: "오렌지-레드 그라데이션"
  },
  600: {
    name: "오로라 모드",
    particles: "무지개 파티클",
    color: "홀로그래픽 효과"
  }
}
```

**성능 고려사항**:
```typescript
const SPEED_EFFECTS = {
- 60fps 보장을 위한 GPU 가속 사용
- 파티클 수 자동 조절 (디바이스 성능에 따라)
- 애니메이션 비활성화 옵션 제공

---

## 📝 4. 풍성한 타이핑 스킴

### 4.1 문장/단어 제너레이터
**데이터 소스 확보**:
- 퍼블릭 도메인 문학 작품 (구텐베르크 프로젝트 등)
- 속담, 격언 데이터베이스
- 신문 사설 (저작권 클리어된 것)
- K-pop 가사 (퍼블릭 도메인 또는 라이선스)
- 직장인 관련 문장 (회의, 이메일, 보고서 스타일)

### 4.2 카테고리 시스템
```typescript
enum TextCategory {
  PROVERBS = "속담",      // "가는 말이 고와야 오는 말이 곱다"
  QUOTES = "격언",        // "시간은 금이다"
  NEWS = "사설",         // 신문 사설 스타일
  LYRICS = "가사",       // 퍼블릭 도메인 노래 가사
  LITERATURE = "문학",    // 고전 문학 작품
  BUSINESS = "비즈니스",  // "회의 일정을 조율하겠습니다"
  DAILY = "일상",        // 일상 대화체
  TECHNICAL = "전문용어"  // IT, 의학 등 전문 분야
}
```

### 4.3 난이도 시스템 (구두점, 숫자 기반)
```typescript
interface DifficultyLevel {
  level: 1 | 2 | 3 | 4 | 5
  name: string
  punctuation: boolean    // 구두점 포함 여부
  numbers: boolean       // 숫자 포함 여부
  allowedPunctuation: string[]  // 허용된 구두점만 (특수문자/이모지 금지)
}

const DIFFICULTY_LEVELS = {
  1: { name: "입문", punctuation: false, numbers: false },
  2: { name: "초급", punctuation: true, numbers: false, allowedPunctuation: [".", ","] },
  3: { name: "중급", punctuation: true, numbers: true, allowedPunctuation: [".", ",", "!", "?"] },
  4: { name: "고급", punctuation: true, numbers: true, allowedPunctuation: [".", ",", "!", "?", ";", ":"] },
  5: { name: "마스터", punctuation: true, numbers: true, allowedPunctuation: [".", ",", "!", "?", ";", ":", "'", '"', "(", ")"] }
}
```

**특수문자/이모지 제한 이유**: 타이핑 연습의 핵심은 일반적인 문자 입력 속도 향상이므로, 접근성이 떨어지는 특수 기호는 제외

---

## 🏗️ 5. 아키텍처 설계 (SoC & 관심사 분리)

### 5.1 기술 스택
```yaml
Frontend: Next.js 15, React 19, TypeScript
Styling: Tailwind CSS + CSS Variables (테마 시스템)
State Management: Zustand
Animation: Framer Motion
Icons: Lucide React
Package Manager: Yarn
Build Tool: Next.js built-in (Turbopack)
```

### 5.2 모듈식 설계 구조
```
src/
├── modules/                    # 독립적인 기능 모듈
│   ├── themes/                # 테마 관리 (다크/라이트/은밀)
│   │   ├── ThemeProvider.tsx
│   │   ├── themeTokens.ts
│   │   └── stealthMode.ts
│   ├── languages/             # 다국어 및 텍스트 생성
│   │   ├── korean.ts
│   │   ├── english.ts
│   │   └── textGenerator.ts
│   ├── battles/               # 대결모드 관련
│   │   ├── tierSystem.ts
│   │   ├── ghostMode.ts
│   │   └── leaderboard.ts
│   ├── analytics/             # 통계 및 분석
│   │   ├── mistakeAnalyzer.ts
│   │   ├── progressTracker.ts
│   │   └── aiAdviser.ts
│   └── effects/               # 시각 효과
│       ├── typingEffects.ts
│       ├── particleSystem.ts
│       └── soundEffects.ts
├── components/                 # React 컴포넌트
│   ├── core/                  # 핵심 타이핑 엔진
│   │   ├── TypingEngine.tsx
│   │   ├── TextRenderer.tsx
│   │   ├── InputHandler.tsx
│   │   └── StatsCalculator.tsx
│   ├── battle/                # 대결 관련 컴포넌트
│   │   ├── TierDisplay.tsx
│   │   ├── GhostRace.tsx
│   │   └── LeaderBoard.tsx
│   ├── stealth/               # 은밀모드 전용
│   │   ├── StealthWrapper.tsx
│   │   ├── FakeDocument.tsx
│   │   └── QuickHide.tsx
│   ├── mobile/                # 모바일 최적화
│   │   ├── TouchKeyboard.tsx
│   │   └── MobileLayout.tsx
│   └── ui/                    # 공통 UI 컴포넌트
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── ProgressBar.tsx
├── stores/                    # 상태 관리 (Zustand)
│   ├── typingStore.ts        # 타이핑 상태
│   ├── battleStore.ts        # 대결모드 상태
│   ├── themeStore.ts         # 테마 상태
│   └── userStore.ts          # 사용자 설정
├── utils/                     # 유틸리티 함수
│   ├── calculations.ts       # WPM, CPM, 정확도 계산
│   │   ├── koreanCPM.ts     # 한글 특화 CPM 계산
│   │   ├── englishWPM.ts    # 영문 WPM 계산  
│   │   └── accuracy.ts      # 관대한 정확도 판정
│   ├── storage.ts           # 로컬스토리지 관리
│   └── performance.ts       # 성능 최적화 헬퍼
├── types/                     # TypeScript 타입 정의
│   ├── typing.ts
│   ├── battle.ts
│   └── theme.ts
└── hooks/                     # 커스텀 훅
    ├── useTypingEngine.ts
    ├── useKeyboardInput.ts
    └── usePerformanceMonitor.ts
```

### 5.3 성능 최적화 전략
**번들 최적화**:
- 기능별 코드 스플리팅 (은밀모드, 대결모드 등)
- 지연 로딩으로 초기 로딩 속도 개선
- Tree shaking으로 미사용 코드 제거

**렌더링 최적화**:
- React.memo로 불필요한 리렌더링 방지
- useMemo/useCallback로 계산 비용 최소화
- 가상화로 긴 텍스트 렌더링 최적화

**애니메이션 최적화**:
- CSS transform 사용으로 GPU 가속
- will-change 속성으로 최적화 힌트 제공
- 60fps 보장을 위한 성능 모니터링

---

## 📱 6. 반응형 설계 & 점진적 모바일 지원

### 6.1 반응형 브레이크포인트 (Tailwind 기준)
```css
/* 모바일 우선 설계 */
sm: 640px   /* 큰 모바일/작은 태블릿 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 와이드 데스크톱 */
2xl: 1536px /* 초대형 모니터 */
```

### 6.2 모바일 최적화 로드맵
**Phase 1 (MVP)**: 
- 기본 타이핑 기능 모바일 대응
- 터치 친화적 UI/UX
- 세로/가로 모드 대응

**Phase 2**: 
- 모바일 전용 가상 키보드
- 스와이프 제스처 지원
- 햅틱 피드백

**Phase 3**: 
- 모바일 특화 게임 모드
- PWA 기능 (오프라인 지원)
- 푸시 알림 (연습 리마인더)

### 6.3 모듈식 모바일 설계
```typescript
// 디바이스별 컴포넌트 분기
const TypingInterface = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return isMobile ? (
    <MobileTypingEngine />
  ) : (
    <DesktopTypingEngine />
  )
}
```

---

## 🎪 7. 핵심 차별화 포인트

### 7.1 "월급 루팡" 컨셉 구현
**은밀함의 기술**:
- 업무용 소프트웨어로 위장하는 스킨
- 빠른 화면 전환 (Alt+Tab 대응)
- "보고서 작성 중" 같은 가짜 상태 표시

**직장인 친화적 설계**:
- 1-5분 단위의 짧은 세션
- 점심시간, 쉬는 시간 최적화
- 업무 스트레스 해소 요소

### 7.2 삼성 키카페 수준의 UX
**부드러운 인터랙션**:
- 60fps 보장하는 애니메이션
- 지연시간 최소화 (< 16ms)
- 자연스러운 피드백 루프

**직관적 학습 곡선**:
- 튜토리얼 없이도 바로 사용 가능
- 점진적 기능 노출
- 사용자 실수 예방 설계

---

## 🔮 8. 확장성 고려사항

### 8.1 사용자 커스터마이징 마이그레이션 준비
```typescript
// 미래 확장을 위한 인터페이스 설계
interface CustomTheme {
  userId: string
  themeName: string
  isPublic: boolean
  colorPalette: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  typography: {
    fontFamily: string
    fontSize: number
    fontWeight: string
  }
  animations: {
    speed: 'slow' | 'normal' | 'fast'
    intensity: 'minimal' | 'normal' | 'intense'
  }
}
```

### 8.2 데이터 지속성 & 확장성
**현재 (로컬 퍼스트)**:
- localStorage로 사용자 설정 저장
- IndexedDB로 상세 통계 저장
- 오프라인 우선 설계

**미래 (클라우드 확장)**:
- 계정 시스템 연동 준비
- 다기기 동기화 지원
- 소셜 기능 (친구와 대결)

### 8.3 Progressive Web App (PWA) 준비
```typescript
// PWA 매니페스트 준비
{
  "name": "월급 루팡 타자기",
  "short_name": "타자루팡",
  "description": "직장인을 위한 은밀한 타자연습",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "icons": [
    // 앱 아이콘들
  ]
}
```

---

## 🎯 MVP 구현 우선순위

### Phase 1 (핵심 기능)
1. ✅ 기본 타이핑 엔진
2. ✅ 3가지 테마 시스템 (다크/라이트/은밀)
3. ✅ 기본 통계 (WPM, 정확도, CPM)
4. ✅ 텍스트 제너레이터 (기본 카테고리)

### Phase 2 (게임 요소)
1. 🔄 티어 시스템 구현
2. 🔄 고스트 모드
3. 🔄 기본 타이핑 애니메이션
4. 🔄 오타 분석 시스템

### Phase 3 (고급 기능)
1. ⏳ 대결모드 (실시간)
2. ⏳ 화려한 시각 효과 (300타+)
3. ⏳ AI 기반 조언 시스템
4. ⏳ 모바일 최적화

### Phase 4 (확장 기능)
1. ⏳ 커스터마이징 시스템
2. ⏳ PWA 기능
3. ⏳ 소셜 기능
4. ⏳ 클라우드 동기화

---

## 📋 개발 가이드라인

### 코드 품질
- **TypeScript Strict Mode**: 타입 안정성 보장
- **ESLint + Prettier**: 코드 스타일 일관성
- **테스트**: Jest + Testing Library로 핵심 로직 테스트
- **성능 모니터링**: Web Vitals 추적

### 접근성 (a11y)
- **키보드 네비게이션**: 모든 기능 키보드로 접근 가능
- **스크린 리더**: ARIA 라벨 및 시맨틱 HTML
- **색상 대비**: WCAG 2.1 AA 기준 준수
- **애니메이션 제어**: prefers-reduced-motion 지원

### 브라우저 지원
- **모던 브라우저**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **폴리필**: 필요한 경우만 선택적 폴리필
- **Progressive Enhancement**: 기본 기능부터 점진적 향상

---

이 명세서는 "월급 루팡 타자기"의 독특한 컨셉을 구현하기 위한 구체적인 기술 요구사항과 설계 방향을 제시합니다. 기존 K-Types의 견고한 기반 위에 직장인을 위한 특화 기능들을 추가하여, 재미있으면서도 실용적인 타자연습 플랫폼을 만드는 것이 목표입니다.