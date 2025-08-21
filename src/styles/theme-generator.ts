/**
 * 테마 생성 도구
 * 새로운 테마를 쉽게 만들고 관리하는 유틸리티
 */

import { 
  ThemeTokens, 
  themeTokenMap, 
  createThemeFromBase, 
  createThemeFromPalette 
} from './design-tokens';
import { applyThemeVariables } from './theme-provider';

/**
 * 테마 생성 도구 클래스
 */
export class ThemeGenerator {
  private customThemes: Map<string, ThemeTokens> = new Map();
  
  /**
   * 색상 팔레트로 테마 생성
   */
  createFromPalette(name: string, palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  }): ThemeTokens {
    const theme = createThemeFromPalette(name, palette);
    this.customThemes.set(name, theme);
    return theme;
  }
  
  /**
   * 기존 테마 복제하여 생성
   */
  createFromBase(name: string, baseTheme: keyof typeof themeTokenMap, overrides: Partial<ThemeTokens>): ThemeTokens {
    const theme = createThemeFromBase(baseTheme, overrides);
    this.customThemes.set(name, theme);
    return theme;
  }
  
  /**
   * JSON에서 테마 가져오기
   */
  createFromJSON(name: string, json: string): ThemeTokens {
    try {
      const parsed = JSON.parse(json);
      const theme = this.validateThemeTokens(parsed);
      this.customThemes.set(name, theme);
      return theme;
    } catch (error) {
      throw new Error(`Invalid theme JSON: ${error}`);
    }
  }
  
  /**
   * 테마 검증
   */
  private validateThemeTokens(tokens: any): ThemeTokens {
    const required = ['background', 'text', 'interactive', 'feedback', 'typing'];
    
    for (const key of required) {
      if (!tokens[key]) {
        throw new Error(`Missing required theme section: ${key}`);
      }
    }
    
    return tokens as ThemeTokens;
  }
  
  /**
   * 테마 미리보기 생성
   */
  generatePreview(theme: ThemeTokens): string {
    return `
      <div style="
        padding: 20px;
        background: ${theme.background.primary};
        color: ${theme.text.primary};
        border-radius: 8px;
        font-family: system-ui;
      ">
        <h3 style="color: ${theme.interactive.primary}; margin: 0 0 10px 0;">Theme Preview</h3>
        <p style="color: ${theme.text.secondary}; margin: 0 0 10px 0;">Secondary text example</p>
        <button style="
          background: ${theme.interactive.primary};
          color: ${theme.text.inverse};
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          margin-right: 8px;
        ">Primary Button</button>
        <button style="
          background: transparent;
          color: ${theme.interactive.primary};
          border: 1px solid ${theme.interactive.primary};
          padding: 8px 16px;
          border-radius: 4px;
        ">Secondary Button</button>
        <div style="margin-top: 10px;">
          <span style="color: ${theme.typing.correct};">✓ Correct</span> |
          <span style="color: ${theme.typing.incorrect};">✗ Incorrect</span> |
          <span style="color: ${theme.typing.current};">Current</span>
        </div>
      </div>
    `;
  }
  
  /**
   * 테마 내보내기 (JSON)
   */
  exportTheme(themeName: string): string {
    const theme = this.customThemes.get(themeName);
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`);
    }
    
    return JSON.stringify(theme, null, 2);
  }
  
  /**
   * 모든 커스텀 테마 목록
   */
  getCustomThemes(): string[] {
    return Array.from(this.customThemes.keys());
  }
  
  /**
   * 테마 삭제
   */
  deleteTheme(name: string): boolean {
    return this.customThemes.delete(name);
  }
  
  /**
   * 색상 접근성 검사
   */
  checkAccessibility(theme: ThemeTokens): {
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // 간단한 접근성 검사 (실제로는 더 정교한 계산 필요)
    const contrastRatio = this.calculateContrastRatio(
      theme.text.primary, 
      theme.background.primary
    );
    
    if (contrastRatio < 4.5) {
      issues.push('Primary text contrast ratio is below WCAG AA standard');
      suggestions.push('Increase contrast between primary text and background');
    }
    
    const buttonContrast = this.calculateContrastRatio(
      theme.text.inverse,
      theme.interactive.primary
    );
    
    if (buttonContrast < 3) {
      issues.push('Button text contrast is too low');
      suggestions.push('Use darker or lighter button background');
    }
    
    const score = Math.max(0, 100 - (issues.length * 20));
    
    return { score, issues, suggestions };
  }
  
  /**
   * 대비 비율 계산 (간단한 구현)
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    // 실제 구현에서는 정확한 색상 대비 계산 필요
    // 여기서는 간단한 추정값 반환
    return 4.5; // 임시값
  }
  
  /**
   * 자동 다크모드 생성
   */
  generateDarkVariant(lightTheme: ThemeTokens): ThemeTokens {
    return {
      background: {
        primary: this.invertColor(lightTheme.background.primary),
        secondary: this.invertColor(lightTheme.background.secondary),
        elevated: this.adjustBrightness(this.invertColor(lightTheme.background.elevated), 10),
      },
      text: {
        primary: this.invertColor(lightTheme.text.primary),
        secondary: this.invertColor(lightTheme.text.secondary),
        tertiary: this.invertColor(lightTheme.text.tertiary),
        inverse: lightTheme.text.primary,
      },
      interactive: {
        primary: lightTheme.interactive.primary, // 브랜드 색상은 유지
        primaryHover: this.adjustBrightness(lightTheme.interactive.primary, 10),
        secondary: lightTheme.interactive.secondary,
        secondaryHover: this.adjustBrightness(lightTheme.interactive.secondary, 10),
        disabled: this.adjustOpacity(lightTheme.interactive.disabled, 0.5),
      },
      feedback: lightTheme.feedback, // 피드백 색상은 일반적으로 유지
      typing: lightTheme.typing,
    };
  }
  
  /**
   * 색상 반전 (간단한 구현)
   */
  private invertColor(color: string): string {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const num = parseInt(hex, 16);
      const inverted = (0xFFFFFF ^ num).toString(16).padStart(6, '0');
      return `#${inverted}`;
    }
    return color; // RGB, HSL 등은 별도 처리 필요
  }
  
  /**
   * 밝기 조정
   */
  private adjustBrightness(color: string, amount: number): string {
    // 실제 구현 필요
    return color;
  }
  
  /**
   * 투명도 조정  
   */
  private adjustOpacity(color: string, opacity: number): string {
    if (color.startsWith('#')) {
      return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
    }
    return color;
  }
}

/**
 * 프리셋 테마 템플릿들
 */
export const THEME_PRESETS = {
  // 🌸 자연 테마들
  sakura: {
    primary: '#ff6b9d',
    secondary: '#c44569',
    accent: '#f8b500',
    background: '#fff5f8',
    surface: '#ffffff',
    text: '#2c2c2c',
    textSecondary: '#666666'
  },
  
  forest: {
    primary: '#27ae60',
    secondary: '#2ecc71',
    accent: '#f39c12',
    background: '#f8fbf8',
    surface: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#7f8c8d'
  },
  
  ocean: {
    primary: '#3498db',
    secondary: '#2980b9',
    accent: '#1abc9c',
    background: '#f0f8ff',
    surface: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#7f8c8d'
  },
  
  // 🎨 감정 테마들
  passion: {
    primary: '#e74c3c',
    secondary: '#c0392b',
    accent: '#f39c12',
    background: '#fdf2f2',
    surface: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#7f8c8d'
  },
  
  calm: {
    primary: '#6c7ce7',
    secondary: '#5a6fd8',
    accent: '#a29bfe',
    background: '#f6f7ff',
    surface: '#ffffff',
    text: '#2d3436',
    textSecondary: '#636e72'
  },
  
  // 🌙 특수 테마들
  midnight: {
    primary: '#9b59b6',
    secondary: '#8e44ad',
    accent: '#e67e22',
    background: '#0c0c0c',
    surface: '#1a1a1a',
    text: '#ecf0f1',
    textSecondary: '#bdc3c7'
  },
  
  neon: {
    primary: '#00ff88',
    secondary: '#00cc66',
    accent: '#ff0080',
    background: '#0a0a0a',
    surface: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#cccccc'
  }
} as const;

/**
 * 테마 생성 헬퍼 함수들
 */
export function generateSeasonalTheme(season: 'spring' | 'summer' | 'autumn' | 'winter'): ThemeTokens {
  const generator = new ThemeGenerator();
  
  const seasonPalettes = {
    spring: THEME_PRESETS.sakura,
    summer: THEME_PRESETS.ocean,
    autumn: THEME_PRESETS.forest,
    winter: THEME_PRESETS.calm,
  };
  
  return generator.createFromPalette(season, seasonPalettes[season]);
}

/**
 * 브랜드 컬러로 테마 생성
 */
export function generateBrandTheme(brandColor: string, isLight = true): ThemeTokens {
  const generator = new ThemeGenerator();
  
  const palette = {
    primary: brandColor,
    secondary: generator['adjustBrightness'](brandColor, 20),
    accent: generator['adjustBrightness'](brandColor, -20),
    background: isLight ? '#ffffff' : '#000000',
    surface: isLight ? '#f8f9fa' : '#1a1a1a',
    text: isLight ? '#2c3e50' : '#ecf0f1',
    textSecondary: isLight ? '#7f8c8d' : '#bdc3c7'
  };
  
  return generator.createFromPalette('brand', palette);
}

/**
 * 접근성 우선 테마 생성
 */
export function generateAccessibleTheme(baseColor: string): ThemeTokens {
  // 높은 대비와 접근성을 보장하는 테마 생성
  return createThemeFromPalette('accessible', {
    primary: baseColor,
    secondary: '#6c757d',
    accent: '#ffc107',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#212529',
    textSecondary: '#495057'
  });
}

/**
 * 전역 테마 생성기 인스턴스
 */
export const themeGenerator = new ThemeGenerator();