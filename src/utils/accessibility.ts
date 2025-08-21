/**
 * 접근성 유틸리티 모음
 * ARIA 속성 및 스크린 리더 지원
 */

/**
 * 스크린 리더를 위한 실시간 알림 생성
 */
export class ScreenReaderAnnouncer {
  private container: HTMLElement | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.createContainer();
    }
  }

  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.id = 'sr-announcer';
    this.container.className = 'sr-only';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');
    this.container.setAttribute('role', 'status');
    document.body.appendChild(this.container);
  }

  /**
   * 스크린 리더에 메시지 알림
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.container) return;
    
    this.container.setAttribute('aria-live', priority);
    this.container.textContent = message;
    
    // 메시지를 잠시 후 지워서 다음 알림이 가능하도록 함
    setTimeout(() => {
      if (this.container) {
        this.container.textContent = '';
      }
    }, 1000);
  }

  /**
   * 타이핑 통계 알림
   */
  announceStats(cpm: number, accuracy: number): void {
    const message = `현재 분당 타수 ${cpm}, 정확도 ${accuracy}퍼센트`;
    this.announce(message);
  }

  /**
   * 테스트 상태 알림
   */
  announceTestStatus(status: 'started' | 'paused' | 'resumed' | 'completed'): void {
    const messages = {
      started: '타이핑 테스트가 시작되었습니다',
      paused: '테스트가 일시정지되었습니다',
      resumed: '테스트를 계속합니다',
      completed: '테스트가 완료되었습니다'
    };
    this.announce(messages[status], 'assertive');
  }

  /**
   * 실수 알림
   */
  announceMistake(char: string): void {
    this.announce(`오타: ${char}`, 'polite');
  }

  /**
   * 카운트다운 알림
   */
  announceCountdown(count: number): void {
    if (count === 0) {
      this.announce('시작!', 'assertive');
    } else {
      this.announce(`${count}`, 'assertive');
    }
  }

  /**
   * 정리
   */
  destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  }
}

/**
 * ARIA 속성 헬퍼
 */
export const ariaProps = {
  /**
   * 버튼 ARIA 속성
   */
  button: (label: string, pressed?: boolean, expanded?: boolean) => ({
    'aria-label': label,
    'aria-pressed': pressed,
    'aria-expanded': expanded,
    role: 'button'
  }),

  /**
   * 입력 필드 ARIA 속성
   */
  input: (label: string, description?: string, invalid?: boolean) => ({
    'aria-label': label,
    'aria-describedby': description ? `${label}-description` : undefined,
    'aria-invalid': invalid,
    role: 'textbox'
  }),

  /**
   * 진행률 ARIA 속성
   */
  progress: (current: number, max: number, label?: string) => ({
    role: 'progressbar',
    'aria-valuenow': current,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-label': label || `진행률 ${Math.round((current / max) * 100)}%`
  }),

  /**
   * 탭 ARIA 속성
   */
  tab: (selected: boolean, controls: string, index: number) => ({
    role: 'tab',
    'aria-selected': selected,
    'aria-controls': controls,
    tabIndex: selected ? 0 : -1,
    id: `tab-${index}`
  }),

  /**
   * 탭 패널 ARIA 속성
   */
  tabPanel: (labelledBy: string, hidden: boolean) => ({
    role: 'tabpanel',
    'aria-labelledby': labelledBy,
    hidden: hidden,
    tabIndex: 0
  }),

  /**
   * 토글 스위치 ARIA 속성
   */
  switch: (label: string, checked: boolean) => ({
    role: 'switch',
    'aria-label': label,
    'aria-checked': checked,
    tabIndex: 0
  }),

  /**
   * 알림 영역 ARIA 속성
   */
  alert: (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => ({
    role: type === 'error' ? 'alert' : 'status',
    'aria-live': type === 'error' ? 'assertive' : 'polite',
    'aria-atomic': true
  }),

  /**
   * 메뉴 ARIA 속성
   */
  menu: (label: string, orientation: 'horizontal' | 'vertical' = 'vertical') => ({
    role: 'menu',
    'aria-label': label,
    'aria-orientation': orientation
  }),

  /**
   * 메뉴 아이템 ARIA 속성
   */
  menuItem: (label: string, disabled?: boolean, hasSubmenu?: boolean) => ({
    role: 'menuitem',
    'aria-label': label,
    'aria-disabled': disabled,
    'aria-haspopup': hasSubmenu,
    tabIndex: disabled ? -1 : 0
  })
};

/**
 * 키보드 네비게이션 헬퍼
 */
export const keyboardNavigation = {
  /**
   * 화살표 키 네비게이션
   */
  handleArrowKeys: (
    event: KeyboardEvent,
    currentIndex: number,
    maxIndex: number,
    onChange: (index: number) => void,
    orientation: 'horizontal' | 'vertical' = 'horizontal'
  ) => {
    const { key } = event;
    let newIndex = currentIndex;

    if (orientation === 'horizontal') {
      if (key === 'ArrowLeft') newIndex = Math.max(0, currentIndex - 1);
      if (key === 'ArrowRight') newIndex = Math.min(maxIndex, currentIndex + 1);
    } else {
      if (key === 'ArrowUp') newIndex = Math.max(0, currentIndex - 1);
      if (key === 'ArrowDown') newIndex = Math.min(maxIndex, currentIndex + 1);
    }

    if (key === 'Home') newIndex = 0;
    if (key === 'End') newIndex = maxIndex;

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onChange(newIndex);
    }
  },

  /**
   * Tab 트랩 (모달 등에서 사용)
   */
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
};

/**
 * 색상 대비 체크
 */
export const colorContrast = {
  /**
   * WCAG AA 기준 체크 (4.5:1 일반 텍스트, 3:1 큰 텍스트)
   */
  meetsWCAG_AA: (foreground: string, background: string, isLargeText = false): boolean => {
    const ratio = colorContrast.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  },

  /**
   * WCAG AAA 기준 체크 (7:1 일반 텍스트, 4.5:1 큰 텍스트)
   */
  meetsWCAG_AAA: (foreground: string, background: string, isLargeText = false): boolean => {
    const ratio = colorContrast.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  },

  /**
   * 색상 대비 비율 계산
   */
  getContrastRatio: (foreground: string, background: string): number => {
    const l1 = colorContrast.getRelativeLuminance(foreground);
    const l2 = colorContrast.getRelativeLuminance(background);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * 상대 휘도 계산
   */
  getRelativeLuminance: (color: string): number => {
    // 간단한 구현 (실제로는 더 복잡한 계산 필요)
    // RGB 값 추출 및 sRGB 변환 필요
    return 0.5; // 임시 값
  }
};

// 전역 스크린 리더 알림 인스턴스
export const screenReaderAnnouncer = new ScreenReaderAnnouncer();