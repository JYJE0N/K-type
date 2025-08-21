/**
 * 터치 제스처 및 모바일 이벤트 처리 시스템
 * 스와이프, 핀치, 탭 등 다양한 제스처 지원
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 제스처 타입 정의
 */
export enum GestureType {
  TAP = 'tap',
  DOUBLE_TAP = 'double_tap',
  LONG_PRESS = 'long_press',
  SWIPE_LEFT = 'swipe_left',
  SWIPE_RIGHT = 'swipe_right',
  SWIPE_UP = 'swipe_up',
  SWIPE_DOWN = 'swipe_down',
  PINCH_IN = 'pinch_in',
  PINCH_OUT = 'pinch_out',
  PAN = 'pan',
  ROTATE = 'rotate',
}

/**
 * 터치 포인트 정보
 */
export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
  pressure?: number;
  radiusX?: number;
  radiusY?: number;
}

/**
 * 제스처 이벤트 정보
 */
export interface GestureEvent {
  type: GestureType;
  target: HTMLElement;
  touches: TouchPoint[];
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  deltaX: number;
  deltaY: number;
  distance: number;
  scale?: number;
  rotation?: number;
  velocity: number;
  duration: number;
  preventDefault: () => void;
  stopPropagation: () => void;
}

/**
 * 제스처 설정
 */
export interface GestureConfig {
  // 탭 설정
  tapTimeout: number;          // 탭 최대 시간 (ms)
  doubleTapTimeout: number;    // 더블탭 간격 (ms)
  tapMaxDistance: number;      // 탭으로 인정할 최대 이동 거리 (px)
  
  // 롱프레스 설정
  longPressTimeout: number;    // 롱프레스 최소 시간 (ms)
  longPressMaxDistance: number; // 롱프레스 최대 이동 거리 (px)
  
  // 스와이프 설정
  swipeMinDistance: number;    // 스와이프 최소 거리 (px)
  swipeMaxTime: number;        // 스와이프 최대 시간 (ms)
  swipeVelocityThreshold: number; // 스와이프 최소 속도 (px/ms)
  
  // 핀치 설정
  pinchMinScale: number;       // 핀치 최소 배율 변화
  
  // 기타
  passiveEvents: boolean;      // passive 이벤트 사용
  preventDefaults: string[];   // preventDefault할 제스처 목록
}

/**
 * 기본 제스처 설정
 */
export const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  tapTimeout: 300,
  doubleTapTimeout: 300,
  tapMaxDistance: 10,
  longPressTimeout: 500,
  longPressMaxDistance: 10,
  swipeMinDistance: 50,
  swipeMaxTime: 1000,
  swipeVelocityThreshold: 0.1,
  pinchMinScale: 0.1,
  passiveEvents: false,
  preventDefaults: ['swipe_left', 'swipe_right', 'swipe_up', 'swipe_down'],
};

/**
 * 제스처 인식기 클래스
 */
export class GestureRecognizer {
  private element: HTMLElement;
  private config: GestureConfig;
  private listeners: Map<GestureType, ((event: GestureEvent) => void)[]> = new Map();
  
  // 터치 상태 추적
  private touches: Map<number, TouchPoint> = new Map();
  private startTouches: Map<number, TouchPoint> = new Map();
  private startTime: number = 0;
  private lastTapTime: number = 0;
  private tapCount: number = 0;
  
  // 타이머
  private longPressTimer: NodeJS.Timeout | null = null;
  private doubleTapTimer: NodeJS.Timeout | null = null;

  constructor(element: HTMLElement, config: Partial<GestureConfig> = {}) {
    this.element = element;
    this.config = { ...DEFAULT_GESTURE_CONFIG, ...config };
    this.setupEventListeners();
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    const options = { 
      passive: this.config.passiveEvents,
      capture: true 
    };

    // 터치 이벤트
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), options);
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), options);
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), options);
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), options);

    // 마우스 이벤트 (터치 장치에서도 발생할 수 있음)
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this), options);
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this), options);
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this), options);
    
    // 포인터 이벤트 (최신 브라우저)
    if ('PointerEvent' in window) {
      this.element.addEventListener('pointerdown', this.handlePointerDown.bind(this), options);
      this.element.addEventListener('pointermove', this.handlePointerMove.bind(this), options);
      this.element.addEventListener('pointerup', this.handlePointerUp.bind(this), options);
    }
  }

  /**
   * 터치 시작 핸들러
   */
  private handleTouchStart(event: TouchEvent): void {
    const touches = Array.from(event.touches);
    this.startTime = Date.now();
    
    touches.forEach(touch => {
      const touchPoint: TouchPoint = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        timestamp: this.startTime,
        pressure: touch.force,
        radiusX: touch.radiusX,
        radiusY: touch.radiusY,
      };
      
      this.touches.set(touch.identifier, touchPoint);
      this.startTouches.set(touch.identifier, { ...touchPoint });
    });

    // 롱프레스 타이머 시작 (단일 터치만)
    if (touches.length === 1) {
      this.longPressTimer = setTimeout(() => {
        this.recognizeLongPress();
      }, this.config.longPressTimeout);
    }
  }

  /**
   * 터치 이동 핸들러
   */
  private handleTouchMove(event: TouchEvent): void {
    const touches = Array.from(event.touches);
    
    touches.forEach(touch => {
      if (this.touches.has(touch.identifier)) {
        const touchPoint: TouchPoint = {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now(),
          pressure: touch.force,
          radiusX: touch.radiusX,
          radiusY: touch.radiusY,
        };
        
        this.touches.set(touch.identifier, touchPoint);
      }
    });

    // 이동이 많으면 롱프레스 취소
    if (this.longPressTimer && touches.length === 1) {
      const touch = touches[0];
      const startTouch = this.startTouches.get(touch.identifier);
      if (startTouch) {
        const distance = this.calculateDistance(
          startTouch.x, startTouch.y,
          touch.clientX, touch.clientY
        );
        
        if (distance > this.config.longPressMaxDistance) {
          this.clearLongPressTimer();
        }
      }
    }

    // 멀티터치 제스처 인식
    if (touches.length === 2) {
      this.recognizePinchAndRotation();
    }

    // 팬 제스처
    if (touches.length === 1) {
      this.recognizePan();
    }
  }

  /**
   * 터치 종료 핸들러
   */
  private handleTouchEnd(event: TouchEvent): void {
    const changedTouches = Array.from(event.changedTouches);
    
    changedTouches.forEach(touch => {
      this.touches.delete(touch.identifier);
    });

    // 모든 터치가 끝났을 때
    if (this.touches.size === 0) {
      this.recognizeSwipe();
      this.recognizeTap();
      this.cleanup();
    }
  }

  /**
   * 터치 취소 핸들러
   */
  private handleTouchCancel(event: TouchEvent): void {
    this.cleanup();
  }

  /**
   * 마우스 이벤트 핸들러들 (터치와 유사하게 처리)
   */
  private handleMouseDown(event: MouseEvent): void {
    // 마우스를 가상의 터치로 처리
    const virtualTouch: TouchPoint = {
      id: 0,
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    };
    
    this.touches.set(0, virtualTouch);
    this.startTouches.set(0, { ...virtualTouch });
    this.startTime = virtualTouch.timestamp;
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.touches.has(0)) {
      const touchPoint: TouchPoint = {
        id: 0,
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now(),
      };
      
      this.touches.set(0, touchPoint);
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    this.recognizeSwipe();
    this.recognizeTap();
    this.cleanup();
  }

  /**
   * 포인터 이벤트 핸들러들
   */
  private handlePointerDown(event: PointerEvent): void {
    // 포인터를 터치로 처리
    const touchPoint: TouchPoint = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
      pressure: event.pressure,
    };
    
    this.touches.set(event.pointerId, touchPoint);
    this.startTouches.set(event.pointerId, { ...touchPoint });
    
    if (this.touches.size === 1) {
      this.startTime = touchPoint.timestamp;
    }
  }

  private handlePointerMove(event: PointerEvent): void {
    if (this.touches.has(event.pointerId)) {
      const touchPoint: TouchPoint = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now(),
        pressure: event.pressure,
      };
      
      this.touches.set(event.pointerId, touchPoint);
    }
  }

  private handlePointerUp(event: PointerEvent): void {
    this.touches.delete(event.pointerId);
    
    if (this.touches.size === 0) {
      this.recognizeSwipe();
      this.recognizeTap();
      this.cleanup();
    }
  }

  /**
   * 탭 제스처 인식
   */
  private recognizeTap(): void {
    const now = Date.now();
    const duration = now - this.startTime;
    
    if (duration > this.config.tapTimeout) return;
    
    // 첫 번째 터치만 검사
    const firstTouch = this.startTouches.values().next().value;
    if (!firstTouch) return;
    
    const currentTouch = Array.from(this.touches.values())[0];
    if (!currentTouch) return;
    
    const distance = this.calculateDistance(
      firstTouch.x, firstTouch.y,
      currentTouch.x, currentTouch.y
    );
    
    if (distance > this.config.tapMaxDistance) return;
    
    // 더블탭 검사
    if (now - this.lastTapTime < this.config.doubleTapTimeout) {
      this.tapCount++;
    } else {
      this.tapCount = 1;
    }
    
    this.lastTapTime = now;
    
    if (this.tapCount === 2) {
      this.emitGesture(GestureType.DOUBLE_TAP, {
        startPosition: { x: firstTouch.x, y: firstTouch.y },
        currentPosition: { x: currentTouch.x, y: currentTouch.y },
        duration,
      });
      this.tapCount = 0;
    } else {
      // 더블탭 대기 시간 후 단일 탭으로 처리
      this.doubleTapTimer = setTimeout(() => {
        if (this.tapCount === 1) {
          this.emitGesture(GestureType.TAP, {
            startPosition: { x: firstTouch.x, y: firstTouch.y },
            currentPosition: { x: currentTouch.x, y: currentTouch.y },
            duration,
          });
        }
        this.tapCount = 0;
      }, this.config.doubleTapTimeout);
    }
  }

  /**
   * 롱프레스 제스처 인식
   */
  private recognizeLongPress(): void {
    if (this.touches.size !== 1) return;
    
    const firstTouch = this.startTouches.values().next().value;
    const currentTouch = this.touches.values().next().value;
    
    if (!firstTouch || !currentTouch) return;
    
    const distance = this.calculateDistance(
      firstTouch.x, firstTouch.y,
      currentTouch.x, currentTouch.y
    );
    
    if (distance <= this.config.longPressMaxDistance) {
      this.emitGesture(GestureType.LONG_PRESS, {
        startPosition: { x: firstTouch.x, y: firstTouch.y },
        currentPosition: { x: currentTouch.x, y: currentTouch.y },
        duration: Date.now() - this.startTime,
      });
    }
  }

  /**
   * 스와이프 제스처 인식
   */
  private recognizeSwipe(): void {
    const duration = Date.now() - this.startTime;
    
    if (duration > this.config.swipeMaxTime) return;
    if (this.startTouches.size !== 1) return;
    
    const firstTouch = this.startTouches.values().next().value;
    const currentTouch = Array.from(this.touches.values())[0];
    
    if (!firstTouch || !currentTouch) return;
    
    const deltaX = currentTouch.x - firstTouch.x;
    const deltaY = currentTouch.y - firstTouch.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < this.config.swipeMinDistance) return;
    
    const velocity = distance / duration;
    if (velocity < this.config.swipeVelocityThreshold) return;
    
    // 스와이프 방향 결정
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    let gestureType: GestureType;
    
    if (angle >= -45 && angle < 45) {
      gestureType = GestureType.SWIPE_RIGHT;
    } else if (angle >= 45 && angle < 135) {
      gestureType = GestureType.SWIPE_DOWN;
    } else if (angle >= 135 || angle < -135) {
      gestureType = GestureType.SWIPE_LEFT;
    } else {
      gestureType = GestureType.SWIPE_UP;
    }
    
    this.emitGesture(gestureType, {
      startPosition: { x: firstTouch.x, y: firstTouch.y },
      currentPosition: { x: currentTouch.x, y: currentTouch.y },
      deltaX,
      deltaY,
      distance,
      velocity,
      duration,
    });
  }

  /**
   * 팬 제스처 인식
   */
  private recognizePan(): void {
    if (this.touches.size !== 1) return;
    
    const firstTouch = this.startTouches.values().next().value;
    const currentTouch = this.touches.values().next().value;
    
    if (!firstTouch || !currentTouch) return;
    
    const deltaX = currentTouch.x - firstTouch.x;
    const deltaY = currentTouch.y - firstTouch.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - this.startTime;
    const velocity = distance / Math.max(duration, 1);
    
    this.emitGesture(GestureType.PAN, {
      startPosition: { x: firstTouch.x, y: firstTouch.y },
      currentPosition: { x: currentTouch.x, y: currentTouch.y },
      deltaX,
      deltaY,
      distance,
      velocity,
      duration,
    });
  }

  /**
   * 핀치와 회전 제스처 인식
   */
  private recognizePinchAndRotation(): void {
    if (this.touches.size !== 2) return;
    
    const touchArray = Array.from(this.touches.values());
    const startTouchArray = Array.from(this.startTouches.values());
    
    if (touchArray.length !== 2 || startTouchArray.length !== 2) return;
    
    const [touch1, touch2] = touchArray;
    const [startTouch1, startTouch2] = startTouchArray;
    
    // 현재 거리와 시작 거리
    const currentDistance = this.calculateDistance(touch1.x, touch1.y, touch2.x, touch2.y);
    const startDistance = this.calculateDistance(startTouch1.x, startTouch1.y, startTouch2.x, startTouch2.y);
    
    // 스케일 계산
    const scale = currentDistance / startDistance;
    
    if (Math.abs(scale - 1) > this.config.pinchMinScale) {
      const gestureType = scale > 1 ? GestureType.PINCH_OUT : GestureType.PINCH_IN;
      
      this.emitGesture(gestureType, {
        startPosition: { 
          x: (startTouch1.x + startTouch2.x) / 2, 
          y: (startTouch1.y + startTouch2.y) / 2 
        },
        currentPosition: { 
          x: (touch1.x + touch2.x) / 2, 
          y: (touch1.y + touch2.y) / 2 
        },
        scale,
        distance: currentDistance,
        duration: Date.now() - this.startTime,
      });
    }
    
    // 회전 계산
    const startAngle = Math.atan2(startTouch2.y - startTouch1.y, startTouch2.x - startTouch1.x);
    const currentAngle = Math.atan2(touch2.y - touch1.y, touch2.x - touch1.x);
    const rotation = (currentAngle - startAngle) * 180 / Math.PI;
    
    if (Math.abs(rotation) > 10) { // 10도 이상 회전
      this.emitGesture(GestureType.ROTATE, {
        startPosition: { 
          x: (startTouch1.x + startTouch2.x) / 2, 
          y: (startTouch1.y + startTouch2.y) / 2 
        },
        currentPosition: { 
          x: (touch1.x + touch2.x) / 2, 
          y: (touch1.y + touch2.y) / 2 
        },
        rotation,
        duration: Date.now() - this.startTime,
      });
    }
  }

  /**
   * 제스처 이벤트 발생
   */
  private emitGesture(type: GestureType, data: Partial<GestureEvent>): void {
    const listeners = this.listeners.get(type);
    if (!listeners) return;
    
    const touches = Array.from(this.touches.values());
    const event: GestureEvent = {
      type,
      target: this.element,
      touches,
      startPosition: data.startPosition || { x: 0, y: 0 },
      currentPosition: data.currentPosition || { x: 0, y: 0 },
      deltaX: data.deltaX || 0,
      deltaY: data.deltaY || 0,
      distance: data.distance || 0,
      scale: data.scale,
      rotation: data.rotation,
      velocity: data.velocity || 0,
      duration: data.duration || 0,
      preventDefault: () => {},
      stopPropagation: () => {},
    };
    
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Gesture listener error:', error);
      }
    });

    // preventDefault 처리
    if (this.config.preventDefaults.includes(type)) {
      // 실제 이벤트에 대한 preventDefault 처리는 
      // 이벤트 리스너에서 수행해야 함
    }
  }

  /**
   * 거리 계산 유틸리티
   */
  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 롱프레스 타이머 정리
   */
  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * 더블탭 타이머 정리
   */
  private clearDoubleTapTimer(): void {
    if (this.doubleTapTimer) {
      clearTimeout(this.doubleTapTimer);
      this.doubleTapTimer = null;
    }
  }

  /**
   * 상태 정리
   */
  private cleanup(): void {
    this.touches.clear();
    this.startTouches.clear();
    this.clearLongPressTimer();
    // 더블탭 타이머는 유지 (더블탭 감지를 위해)
  }

  /**
   * 제스처 리스너 등록
   */
  on(type: GestureType, listener: (event: GestureEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  /**
   * 제스처 리스너 제거
   */
  off(type: GestureType, listener: (event: GestureEvent) => void): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 제스처 인식기 정리
   */
  destroy(): void {
    this.cleanup();
    this.clearDoubleTapTimer();
    this.listeners.clear();
    // 이벤트 리스너 제거는 브라우저가 자동으로 처리
  }
}

/**
 * React Hook: 제스처 사용
 */
export function useGestures(
  ref: React.RefObject<HTMLElement>,
  config: Partial<GestureConfig> = {}
) {
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const listenersRef = useRef<Map<GestureType, (event: GestureEvent) => void>>(new Map());

  useEffect(() => {
    if (ref.current && !recognizerRef.current) {
      recognizerRef.current = new GestureRecognizer(ref.current, config);
      
      // 등록된 리스너들을 새 인식기에 적용
      listenersRef.current.forEach((listener, type) => {
        recognizerRef.current!.on(type, listener);
      });
    }

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.destroy();
        recognizerRef.current = null;
      }
    };
  }, [ref, config]);

  const on = useCallback((type: GestureType, listener: (event: GestureEvent) => void) => {
    listenersRef.current.set(type, listener);
    if (recognizerRef.current) {
      recognizerRef.current.on(type, listener);
    }
  }, []);

  const off = useCallback((type: GestureType, listener: (event: GestureEvent) => void) => {
    listenersRef.current.delete(type);
    if (recognizerRef.current) {
      recognizerRef.current.off(type, listener);
    }
  }, []);

  return { on, off };
}