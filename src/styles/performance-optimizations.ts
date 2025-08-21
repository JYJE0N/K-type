/**
 * 🚀 Performance Optimization Utilities
 * CSS-in-JS 최적화 및 렌더링 성능 향상을 위한 시스템
 */

// CSS 변수 기반 동적 스타일 생성 (하드코딩 방지)
export const createDynamicStyle = (property: string, variable: string, fallback?: string) => {
  return {
    [property]: `var(--${variable}${fallback ? `, ${fallback}` : ''})`
  };
};

// Memoized 스타일 캐시
const styleCache = new Map<string, string>();

export const getCachedStyle = (key: string, generator: () => string): string => {
  if (styleCache.has(key)) {
    return styleCache.get(key)!;
  }
  
  const style = generator();
  styleCache.set(key, style);
  return style;
};

// CSS-in-JS를 CSS 변수로 변환하는 유틸리티
export const toCssVariables = (styles: Record<string, any>, prefix = ''): Record<string, string> => {
  const cssVars: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'object' && value !== null) {
      Object.assign(cssVars, toCssVariables(value, `${prefix}${key}-`));
    } else {
      cssVars[`--${prefix}${key}`] = String(value);
    }
  }
  
  return cssVars;
};

// 테마 기반 스타일 변환기
export const createThemeAwareStyles = (
  lightStyles: Record<string, string>,
  darkStyles: Record<string, string>
) => {
  return {
    light: toCssVariables(lightStyles, 'light-'),
    dark: toCssVariables(darkStyles, 'dark-'),
  };
};

// GPU 가속 최적화 클래스들
export const gpuAcceleratedClasses = {
  transform3d: 'transform-gpu',
  willChange: 'will-change-transform',
  backfaceHidden: 'backface-visibility-hidden',
  perspective: 'perspective-1000',
};

// 반응형 스타일 헬퍼
export const createResponsiveClasses = (
  mobile: string,
  tablet: string,
  desktop: string
) => {
  return `${mobile} md:${tablet} lg:${desktop}`;
};

// 동적 클래스 결합 최적화
export const combineClasses = (...classes: (string | undefined | false | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// 조건부 클래스 적용
export const conditionalClasses = (
  condition: boolean,
  trueClasses: string,
  falseClasses?: string
): string => {
  return condition ? trueClasses : (falseClasses || '');
};

// CSS 변수 인젝션 헬퍼
export const injectCssVariables = (
  element: HTMLElement,
  variables: Record<string, string | number>
): void => {
  for (const [key, value] of Object.entries(variables)) {
    element.style.setProperty(
      key.startsWith('--') ? key : `--${key}`,
      String(value)
    );
  }
};

// 스타일 우선순위 관리
export const createPriorityClasses = (
  base: string,
  priority: string,
  important?: boolean
) => {
  const importantSuffix = important ? ' !important' : '';
  return `${base} ${priority}${importantSuffix}`;
};

// 성능 최적화된 애니메이션 클래스
export const animationClasses = {
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-200',
  slideIn: 'animate-in slide-in-from-bottom-2 duration-300',
  slideOut: 'animate-out slide-out-to-bottom-2 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-200',
  bounceIn: 'animate-bounce',
  pulseIn: 'animate-pulse',
};

// 스타일 캐시 관리
export const clearStyleCache = (): void => {
  styleCache.clear();
};

export const getStyleCacheSize = (): number => {
  return styleCache.size;
};

// 타이핑 앱 특화 성능 최적화
export const typingPerformanceClasses = {
  // 키스트로크 처리 최적화
  keyboardInput: combineClasses(
    'transform-gpu',
    'will-change-transform',
    'transition-none', // 키 입력 중엔 transition 비활성화
  ),
  
  // 텍스트 렌더링 최적화
  textRenderer: combineClasses(
    'contain-layout contain-style', // CSS Containment
    'text-rendering-optimizeSpeed',
    'font-feature-settings-none',
  ),
  
  // 통계 업데이트 최적화
  statsDisplay: combineClasses(
    'will-change-contents',
    'transform-gpu',
  ),
  
  // 실시간 진행률 최적화
  progressIndicator: combineClasses(
    'transform-gpu',
    'will-change-transform',
    'backface-visibility-hidden',
  ),
};