"use client";

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  ReferenceLine, 
  Area, 
  AreaChart,
  Tooltip,
  Legend,
  ComposedChart,
  Bar
} from 'recharts';
import { Share2, Trophy, Target, Clock, Zap } from 'lucide-react';
import { IoPlay, IoAnalyticsSharp, IoSparkles } from 'react-icons/io5';
import { FaKeyboard } from "react-icons/fa6";
import { TbTargetArrow } from "react-icons/tb";
import { IoCalendarOutline } from "react-icons/io5";
import { useUserProgressStore } from '@/stores/userProgressStore';

import type { Mistake } from '@/types';

interface TestResultData {
  cpm: number;
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  mistakes: Mistake[];
  targetText: string;
  userInput: string;
}

interface TestResultChartProps {
  data: TestResultData;
  className?: string;
  primaryMetric: 'cpm' | 'wpm';
  onMetricToggle: (metric: 'cpm' | 'wpm') => void;
}

export function TestResultChart({ 
  data, 
  className = '', 
  primaryMetric, 
  onMetricToggle 
}: TestResultChartProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  
  // 사용자 진행률 데이터 가져오기
  const { bestCPM, bestWPM, initializeUser, fetchProgress } = useUserProgressStore();
  
  // 데이터 로드 확인
  useEffect(() => {
    console.log('💾 UserProgressStore Debug:', {
      bestCPM,
      bestWPM,
      timestamp: new Date().toISOString()
    });
    
    // 데이터가 없으면 초기화 시도
    if (!bestCPM && !bestWPM) {
      console.log('🔄 Initializing user data...');
      initializeUser().then(() => {
        fetchProgress();
      });
    }
  }, [bestCPM, bestWPM, initializeUser, fetchProgress]);
  
  // 테마 색상 동적 로드 (드라큐라 테마 지원)
  const getThemeColors = () => {
    if (typeof window === 'undefined') {
      // SSR 대비 기본값
      return {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#f59e0b',
        muted: '#6b7280',
        border: '#e5e7eb',
        background: '#ffffff'
      };
    }
    
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      primary: computedStyle.getPropertyValue('--color-interactive-primary').trim() || '#3b82f6',
      secondary: computedStyle.getPropertyValue('--color-interactive-secondary').trim() || '#8b5cf6',
      accent: computedStyle.getPropertyValue('--color-feedback-warning').trim() || '#f59e0b',
      muted: computedStyle.getPropertyValue('--color-text-tertiary').trim() || '#6b7280',
      border: computedStyle.getPropertyValue('--color-border').trim() || '#e5e7eb',
      background: computedStyle.getPropertyValue('--color-background').trim() || '#ffffff'
    };
  };
  
  const themeColors = getThemeColors();

  // 애니메이션 효과
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animationStep < 100) {
        setAnimationStep(prev => Math.min(prev + 5, 100));
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [animationStep]);

  // 스트로크 속도와 함께 더 역동적인 차트 데이터 생성 (장문 대응 최적화)
  const generateChartData = () => {
    const textLength = Math.max(data.targetText.length, 100);
    const testDuration = data.timeElapsed; // 테스트 소요 시간(초)
    
    // 테스트 시간에 따른 적응적 포인트 수 결정
    let points: number;
    if (testDuration <= 60) {
      points = 30; // 1분 이하: 30 포인트
    } else if (testDuration <= 180) {
      points = 45; // 1-3분: 45 포인트
    } else if (testDuration <= 300) {
      points = 60; // 3-5분: 60 포인트
    } else {
      points = Math.min(90, Math.max(60, Math.floor(testDuration / 5))); // 5분 초과: 최대 90 포인트
    }
    
    const finalMetric = primaryMetric === 'cpm' ? data.cpm : data.wpm;
    const chartData = [];
    
    // 데이터 밀도 계산 (차트 성능 최적화용)
    const dataDensity = points / testDuration;
    
    // 스트로크 패턴 생성 (실제 타이핑의 리듬감 모방)
    const strokePattern = [];
    for (let i = 0; i <= points; i++) {
      const progress = i / points;
      
      // 타이핑 리듬: 처음엔 느리게, 중간에 빨라지고, 끝에 약간 느려짐
      let baseStrokeRate = 1.0;
      
      if (progress < 0.2) {
        // 초반: 워밍업 구간 (천천히 가속)
        baseStrokeRate = 0.4 + (progress / 0.2) * 0.4;
      } else if (progress < 0.7) {
        // 중반: 고속 구간 (안정적인 고속)
        baseStrokeRate = 0.8 + Math.sin((progress - 0.2) * 4 * Math.PI) * 0.3;
      } else {
        // 후반: 피로 구간 (약간 느려짐)
        baseStrokeRate = 1.0 - (progress - 0.7) * 0.3;
      }
      
      // 실수 지점에서 스트로크 속도 급격히 변화
      const mistakesUpToHere = data.mistakes.filter(mistake => mistake.position <= progress * textLength).length;
      if (mistakesUpToHere > strokePattern.filter(p => p.mistakes > 0).length) {
        baseStrokeRate *= 0.3; // 실수 시 급격히 느려짐
      }
      
      // 랜덤 변동성 추가 (실제 타이핑의 불규칙성)
      const variation = (Math.random() - 0.5) * 0.4;
      const strokeRate = Math.max(0.1, Math.min(2.0, baseStrokeRate + variation));
      
      strokePattern.push({
        progress,
        strokeRate,
        mistakes: mistakesUpToHere
      });
    }

    for (let i = 0; i <= points; i++) {
      const progress = i / points;
      const currentChar = Math.floor(progress * textLength);
      
      // 정확도 계산 (이제 좀 더 안정적)
      const mistakesUpToHere = data.mistakes.filter(mistake => mistake.position <= currentChar).length;
      let accuracy = currentChar > 0 ? ((currentChar - mistakesUpToHere) / currentChar) * 100 : 100;
      
      // 정확도는 실수 지점에서만 변화하고 나머지는 안정적
      if (mistakesUpToHere > 0) {
        accuracy = Math.max(88 - mistakesUpToHere * 3, 75); // 실수마다 3% 감소
      }
      
      // 타이핑 속도 (S자 곡선)
      const speedMultiplier = 1 / (1 + Math.exp(-8 * (progress - 0.5)));
      let speed = finalMetric * speedMultiplier;
      
      // 중간 변동성
      if (progress > 0.1 && progress < 0.9) {
        const variation = (Math.random() - 0.5) * finalMetric * 0.12;
        speed = Math.max(speed + variation, 0);
      }
      
      // 스트로크 속도 계산 (키/초)
      const currentStrokePattern = strokePattern[i];
      const baseStrokeSpeed = finalMetric / 5; // CPM을 키/초로 변환하는 기본값
      const strokeSpeed = baseStrokeSpeed * currentStrokePattern.strokeRate;
      
      // 마지막 포인트는 정확한 결과값
      if (i === points) {
        speed = finalMetric;
        accuracy = data.accuracy;
      }
      
      // 애니메이션 적용
      const isVisible = progress <= animationStep / 100;
      
      chartData.push({
        time: Math.round(progress * data.timeElapsed),
        speed: isVisible ? Math.round(speed) : 0,
        accuracy: isVisible ? Math.round(accuracy) : 100,
        strokeSpeed: isVisible ? Math.round(strokeSpeed * 10) / 10 : 0, // 키/초 (소수점 1자리)
        progress: Math.round(progress * 100),
        mistakes: mistakesUpToHere,
        rhythm: isVisible ? Math.round(currentStrokePattern.strokeRate * 100) : 100, // 리듬 지수 (100 = 정상)
        flow: isVisible ? Math.round(speed * (accuracy / 100)) : 0, // 플로우 점수
        intensity: isVisible ? Math.round(strokeSpeed * (accuracy / 100)) : 0 // 타이핑 강도
      });
    }

    return chartData;
  };

  const chartData = generateChartData();
  const maxSpeed = Math.max(...chartData.map(d => d.speed)) * 1.1;
  const maxStrokeSpeed = Math.max(...chartData.map(d => d.strokeSpeed)) * 1.1;

  // 사용자 최고기록 기반 성과 영역 정의
  const getPerformanceZones = () => {
    const userScore = primaryMetric === 'cpm' ? data.cpm : data.wpm;
    const actualPersonalBest = primaryMetric === 'cpm' ? (bestCPM || 0) : (bestWPM || 0);
    
    // 디버깅 로그 추가
    console.log('🎯 Performance Zone Debug:', {
      primaryMetric,
      userScore,
      bestCPM,
      bestWPM,
      actualPersonalBest
    });
    
    // 현재 테스트 기록과 기존 최고기록 비교
    const personalBest = Math.max(actualPersonalBest, userScore);
    const isNewRecord = userScore > actualPersonalBest;
    
    // 최고기록이 너무 낮으면 최소값 설정
    const baseBest = Math.max(personalBest, userScore * 0.9);
    
    console.log('📊 Final zones:', {
      personalBest,
      baseBest,
      isNewRecord
    });
    
    return {
      excellent: baseBest * 1.2,       // 최고기록의 120%
      good: baseBest * 1.05,           // 최고기록의 105%
      current: userScore,              // 사용자 현재 기록
      personalBest: baseBest,          // 사용자 최고기록 (구분선)
      baseline: baseBest * 0.8,        // 기본 기준
      isNewRecord: isNewRecord         // 신기록 여부
    };
  };

  const zones = getPerformanceZones();
  
  // X축 틱 간격 최적화 함수
  const getOptimalTickInterval = (dataLength: number) => {
    if (dataLength <= 30) return 0; // 모든 틱 표시
    if (dataLength <= 60) return 1; // 2개 중 1개 표시
    if (dataLength <= 90) return 2; // 3개 중 1개 표시
    return Math.floor(dataLength / 15); // 최대 15개 틱 표시
  };

  // 티어 계산 (WPM 기준)
  const wpm = primaryMetric === 'wpm' ? data.wpm : data.cpm * 0.2;
  const getTier = () => {
    if (wpm >= 80) return { name: '마스터', color: '#b9f2ff', icon: '💎', current: 80, next: null };
    if (wpm >= 60) return { name: '전문가', color: '#e5e4e2', icon: '🏆', current: 60, next: 80 };
    if (wpm >= 40) return { name: '고급', color: '#ffd700', icon: '🥇', current: 40, next: 60 };
    if (wpm >= 20) return { name: '중급', color: '#c0c0c0', icon: '🥈', current: 20, next: 40 };
    return { name: '초급', color: '#cd7f32', icon: '🥉', current: 0, next: 20 };
  };
  
  // 레벨업 진행률 계산
  const getLevelProgress = () => {
    const tier = getTier();
    if (!tier.next) return 100; // 최고 레벨
    
    const progress = ((wpm - tier.current) / (tier.next - tier.current)) * 100;
    return Math.max(0, Math.min(100, Math.round(progress)));
  };

  const tier = getTier();

  // 고급 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="stats-card-compact" 
             style={{ 
               border: '1px solid var(--color-border)',
               borderRadius: '12px',
               padding: '16px',
               minWidth: '200px',
               boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
               backdropFilter: 'blur(8px)'
             }}>
          <div className="stats-description font-semibold mb-3 flex items-center gap-2" 
               style={{ color: 'var(--color-text-primary)' }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColors.primary }}></div>
            {Math.floor(label / 60) > 0 ? 
              `${Math.floor(label / 60)}:${String(label % 60).padStart(2, '0')}` : 
              `${label}초`} 지점
          </div>
          
          <div className="space-y-3">
            {payload.map((entry: any, index: number) => {
              let suffix = '';
              let color = entry.color;
              
              if (entry.dataKey === 'speed') {
                suffix = ` ${primaryMetric.toUpperCase()}`;
                color = themeColors.primary;
              } else if (entry.dataKey === 'strokeSpeed') {
                suffix = ' 키/초';
                color = themeColors.secondary;
              }
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="stats-caption">
                    <span style={{ fontWeight: '500' }}>{entry.name}</span>
                  </span>
                  <span className="stats-body font-bold" style={{ color }}>
                    {entry.value}{suffix}
                  </span>
                </div>
              );
            })}
            
            {/* 성과 평가 */}
            {data && (
              <div className="border-t pt-3 mt-3" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="stats-caption">성과 수준</span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" 
                        style={{ 
                          backgroundColor: data.speed >= zones.excellent ? themeColors.primary : 
                                         data.speed >= zones.good ? themeColors.secondary : themeColors.accent,
                          color: 'white'
                        }}>
                    {data.speed >= zones.excellent ? '우수' : 
                     data.speed >= zones.good ? '양호' : '개선 필요'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // 그라디언트 정의
  const gradientOffset = () => {
    const dataMax = Math.max(...chartData.map(d => d.speed));
    const dataMin = Math.min(...chartData.map(d => d.speed));
    
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    
    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  const handleShare = async () => {
    const shareText = `🎯 타이핑 테스트 완료!\n\n📊 ${primaryMetric.toUpperCase()}: ${primaryMetric === 'cpm' ? data.cpm : data.wpm}\n🎯 정확도: ${data.accuracy.toFixed(1)}%\n⏱️ 시간: ${Math.floor(data.timeElapsed / 60)}:${String(data.timeElapsed % 60).padStart(2, '0')}\n🏆 티어: ${tier.name}\n\n#타이핑연습 #한글타이핑`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '타이핑 테스트 결과',
          text: shareText,
        });
      } catch (err) {
        console.log('공유 취소됨');
      }
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(shareText);
      setShowShareModal(true);
      setTimeout(() => setShowShareModal(false), 2000);
    }
  };

  return (
    <div className={`stats-modal-container ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="stats-subtitle mb-2">테스트 결과</h2>
          <div className="flex items-center gap-2">
            <IoCalendarOutline className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            <p className="stats-description">
              {new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit',
                timeZone: 'Asia/Seoul'
              }).replace(/\./g, '-').replace(/-$/, '')} 방금 전
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 티어 배지 */}
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold"
            style={{ 
              backgroundColor: tier.color + '20',
              color: tier.color,
              border: `1px solid ${tier.color}40`
            }}
          >
            <span className="text-lg">{tier.icon}</span>
            <span>{tier.name}</span>
          </div>
          
          {/* 메트릭 토글 - iOS 스타일 */}
          <button
            onClick={() => onMetricToggle(primaryMetric === 'cpm' ? 'wpm' : 'cpm')}
            className="relative flex items-center px-1 py-1 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            style={{
              width: 'var(--chart-toggle-width)',
              height: 'var(--chart-toggle-height)',
              backgroundColor: primaryMetric === 'cpm' ? themeColors.primary : themeColors.secondary,
              boxShadow: 'var(--chart-inset-shadow)'
            }}
            aria-label={`메트릭 변경: 현재 ${primaryMetric.toUpperCase()}`}
          >
            {/* 배경 라벨들 */}
            <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-bold pointer-events-none">
              <span 
                className={`transition-all duration-300 ${primaryMetric === 'cpm' ? 'text-white opacity-100' : 'text-white/40'}`}
              >
                CPM
              </span>
              <span 
                className={`transition-all duration-300 ${primaryMetric === 'wpm' ? 'text-white opacity-100' : 'text-white/40'}`}
              >
                WPM
              </span>
            </div>

            {/* 슬라이더 */}
            <div
              className="absolute bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center"
              style={{
                width: 'var(--chart-toggle-slider-width)',
                height: 'var(--chart-toggle-slider-height)',
                left: primaryMetric === 'cpm' ? '4%' : '46%',
                boxShadow: 'var(--chart-shadow-medium)'
              }}
            >
              <span 
                className="text-xs font-bold transition-colors duration-300"
                style={{ 
                  color: primaryMetric === 'cpm' ? themeColors.primary : themeColors.secondary
                }}
              >
                {primaryMetric.toUpperCase()}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="w-full">
          
          <div className="w-full" style={{ height: 'var(--chart-container-height)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={chartData} 
                margin={{ 
                  top: 10, 
                  right: 0, 
                  left: 0, 
                  bottom: 20 
                }}
              >
                <defs>
                  {/* 차트 배경 수직 그라디언트 (테마 백그라운드 컬러 + 투명도 조절) */}
                  <linearGradient id="chartBackground" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={themeColors.background} stopOpacity={0}/>
                    <stop offset="30%" stopColor={themeColors.background} stopOpacity={0.2}/>
                    <stop offset="70%" stopColor={themeColors.background} stopOpacity={0.6}/>
                    <stop offset="100%" stopColor={themeColors.background} stopOpacity={0.9}/>
                  </linearGradient>
                  
                  {/* 성과 칩 샤도우 */}
                  <filter id="chipShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15"/>
                  </filter>
                </defs>
                
                {/* 차트 배경 그라디언트 */}
                <Area
                  yAxisId="speed"
                  dataKey={() => maxSpeed}
                  fill="url(#chartBackground)"
                  stroke="none"
                  isAnimationActive={false}
                />
                
                {/* 바둑판 격자 - 촬촘한 수직/수평 점선 (차트 영역 내부만) */}
                <CartesianGrid 
                  strokeDasharray="2 2" 
                  stroke={themeColors.muted} 
                  opacity={0.15}
                  vertical={true}
                  horizontal={true}
                />
                
                <XAxis 
                  dataKey="time" 
                  stroke={themeColors.muted}
                  fontSize={11}
                  tickFormatter={(value) => {
                    const minutes = Math.floor(value / 60);
                    const seconds = value % 60;
                    return minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${value}s`;
                  }}
                  interval={Math.max(Math.floor(chartData.length / 8), 3)}
                  axisLine={{ stroke: themeColors.muted, strokeWidth: 1 }}
                  tickLine={false}
                />
                
                <YAxis 
                  yAxisId="speed"
                  stroke={themeColors.muted}
                  fontSize={11}
                  domain={[0, maxSpeed]}
                  tickFormatter={(value) => String(Math.round(value / 5) * 5)}
                  interval={0}
                  tickCount={6}
                  axisLine={{ stroke: themeColors.muted, strokeWidth: 1 }}
                  tickLine={false}
                />
                
                <YAxis 
                  yAxisId="stroke"
                  orientation="right"
                  stroke={themeColors.muted}
                  fontSize={11}
                  domain={[0, maxStrokeSpeed]}
                  tickFormatter={(value) => String(Math.round(value * 2) / 2)}
                  interval={0}
                  tickCount={4}
                  axisLine={{ stroke: themeColors.muted, strokeWidth: 1 }}
                  tickLine={false}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                {/* 최고기록 구분선 - 유효한 값이 있을 때만 표시 */}
                {zones.personalBest > 0 && (
                  <ReferenceLine 
                    yAxisId="speed" 
                    y={zones.personalBest} 
                    stroke={themeColors.accent} 
                    strokeWidth={2}
                    opacity={1}
                    strokeDasharray="4 4"
                    name="개인 최고기록"
                  />
                )}
                
                {/* 메인 타이핑 속도 라인 (테마 메인 색상) */}
                <Line
                  yAxisId="speed"
                  type="monotone"
                  dataKey="speed"
                  stroke={themeColors.primary}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={chartData.length <= 60}
                  animationDuration={chartData.length <= 30 ? 2000 : 1200}
                  activeDot={{ 
                    r: 5, 
                    fill: themeColors.primary,
                    stroke: themeColors.background,
                    strokeWidth: 2
                  }}
                  name="타이핑 속도"
                />
                
                {/* 세컨더리 스트로크 속도 라인 (테마 세컨더리 색상) */}
                <Line
                  yAxisId="stroke"
                  type="monotone"
                  dataKey="strokeSpeed"
                  stroke={themeColors.secondary}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={chartData.length <= 60}
                  animationDuration={chartData.length <= 30 ? 1500 : 800}
                  activeDot={{ 
                    r: 4, 
                    fill: themeColors.secondary,
                    stroke: themeColors.background,
                    strokeWidth: 2
                  }}
                  name="스트로크 빈도"
                />
                
                {/* 통합 성과 칩 컴포넌트 - 최고기록 라인에 따라 동적 배치 */}
                {/* 
                <g>
                  <g>
                    <defs>
                      <filter id="personalBestChipShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={themeColors.accent} floodOpacity="0.25"/>
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="black" floodOpacity="0.15"/>
                      </filter>
                    </defs>
                    
                    <rect
                      x={180}
                      y={120}
                      width={120}
                      height={24}
                      rx={12}
                      fill={themeColors.accent}
                      fillOpacity={1}
                      stroke={themeColors.background}
                      strokeWidth={3}
                      filter="url(#personalBestChipShadow)"
                    />
                    
                    <rect
                      x={182}
                      y={122}
                      width={116}
                      height={20}
                      rx={10}
                      fill="url(#chipGlow)"
                      opacity={0.3}
                    />
                    
                    <text
                      x={240}
                      y={134}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="800"
                      textShadow="0 1px 2px rgba(0,0,0,0.5)"
                    >
                      개인최고 {Math.round(zones.personalBest)}
                    </text>
                    
                    <polygon
                      points="235,144 245,144 240,154"
                      fill={themeColors.accent}
                      stroke={themeColors.background}
                      strokeWidth={1}
                      filter="url(#personalBestChipShadow)"
                    />
                  </g>
                </g>
                */}
                
                {/* 칩 글로우 그라디언트 정의 */}
                <defs>
                  <linearGradient id="chipGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: "white", stopOpacity: 0.8}} />
                    <stop offset="50%" style={{stopColor: "white", stopOpacity: 0.3}} />
                    <stop offset="100%" style={{stopColor: "white", stopOpacity: 0.1}} />
                  </linearGradient>
                </defs>
                
              </ComposedChart>
            </ResponsiveContainer>
            
            
            {/* 애니메이션 오버레이 */}
            {animationStep < 100 && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent ${animationStep}%, var(--color-background) ${animationStep + 2}%)`,
                  zIndex: 10
                }}
              />
            )}
          </div>
      </div>
      
      {/* 커스텀 범례 섹션 - 차트와 분리 */}
      <div className="w-full flex justify-center">
        <div 
          className="flex items-center justify-center gap-6"
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            backgroundColor: `${themeColors.background}f0`,
            borderRadius: 'var(--chart-border-radius-sm)',
            maxWidth: 'fit-content',
            boxShadow: 'var(--chart-shadow-light)',
            border: `1px solid ${themeColors.border}`
          }}
        >
          {/* 타이핑 속도 */}
          <div className="flex items-center gap-2">
            <div 
              style={{
                width: 'var(--chart-legend-line-width)',
                height: 'var(--chart-legend-line-height)',
                backgroundColor: themeColors.primary
              }}
            />
            <span 
              style={{ 
                color: themeColors.primary, 
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              타이핑 속도
            </span>
          </div>
          
          {/* 스트로크 빈도 */}
          <div className="flex items-center gap-2">
            <div 
              style={{
                width: 'var(--chart-legend-line-width)',
                height: 'var(--chart-legend-line-height)',
                backgroundColor: themeColors.secondary
              }}
            />
            <span 
              style={{ 
                color: themeColors.secondary, 
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              스트로크 빈도
            </span>
          </div>
          
          {/* 개인 최고기록 - 유효한 값이 있을 때만 표시 */}
          {zones.personalBest > 0 && (
            <div className="flex items-center gap-2">
              <div 
                style={{
                  width: 'var(--chart-legend-line-width)',
                  height: 'var(--chart-legend-line-height)',
                  backgroundColor: themeColors.accent,
                  backgroundImage: `repeating-linear-gradient(
                    90deg,
                    ${themeColors.accent} 0px,
                    ${themeColors.accent} 4px,
                    transparent 4px,
                    transparent 8px
                  )`
                }}
              />
              <span 
                style={{ 
                  color: themeColors.accent, 
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                개인 최고기록{zones.isNewRecord && ' (신기록!)'}
              </span>
            </div>
          )}
        </div>
      </div>
          
      {/* 결과값 카드 섹션 */}
      <div className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* CPM */}
              <div className="flex flex-col items-center p-4 rounded-xl text-center" 
                   style={{ 
                     backgroundColor: 'var(--color-background)', 
                     border: '1px solid var(--color-border)',
                     boxShadow: 'var(--chart-shadow-light)'
                   }}>
                <FaKeyboard className="w-6 h-6 mb-2" style={{ color: themeColors.primary }} />
                <div className="text-2xl font-bold mb-1" style={{ color: themeColors.primary }}>
                  {Math.round(data.cpm)}
                </div>
                <div className="text-sm font-medium" style={{ color: themeColors.muted }}>
                  CPM
                </div>
              </div>

              {/* 정확도 */}
              <div className="flex flex-col items-center p-4 rounded-xl text-center" 
                   style={{ 
                     backgroundColor: 'var(--color-background)', 
                     border: '1px solid var(--color-border)',
                     boxShadow: 'var(--chart-shadow-light)'
                   }}>
                <TbTargetArrow className="w-6 h-6 mb-2" style={{ color: themeColors.primary }} />
                <div className="text-2xl font-bold mb-1" style={{ color: themeColors.primary }}>
                  {data.accuracy.toFixed(1)}<span className="text-sm">%</span>
                </div>
                <div className="text-sm font-medium" style={{ color: themeColors.muted }}>
                  정확도
                </div>
              </div>
              
              {/* 평균 스트로크/초 */}
              <div className="flex flex-col items-center p-4 rounded-xl text-center" 
                   style={{ 
                     backgroundColor: 'var(--color-background)', 
                     border: '1px solid var(--color-border)',
                     boxShadow: 'var(--chart-shadow-light)'
                   }}>
                <IoAnalyticsSharp className="w-6 h-6 mb-2" style={{ color: themeColors.primary }} />
                <div className="text-2xl font-bold mb-1" style={{ color: themeColors.primary }}>
                  {(data.cpm / 60).toFixed(1)}
                </div>
                <div className="text-sm font-medium" style={{ color: themeColors.muted }}>
                  키/초
                </div>
              </div>

              {/* 소요시간 */}
              <div className="flex flex-col items-center p-4 rounded-xl text-center" 
                   style={{ 
                     backgroundColor: 'var(--color-background)', 
                     border: '1px solid var(--color-border)',
                     boxShadow: 'var(--chart-shadow-light)'
                   }}>
                <Clock className="w-6 h-6 mb-2" style={{ color: themeColors.primary }} />
                <div className="text-2xl font-bold mb-1" style={{ color: themeColors.primary }}>
                  {Math.floor(data.timeElapsed / 60)}:{String(Math.floor(data.timeElapsed % 60)).padStart(2, '0')}
                </div>
                <div className="text-sm font-medium" style={{ color: themeColors.muted }}>
                  소요시간
                </div>
              </div>

              {/* 최고성적 달성률 */}
              <div className="flex flex-col items-center p-4 rounded-xl text-center" 
                   style={{ 
                     backgroundColor: 'var(--color-background)', 
                     border: '1px solid var(--color-border)',
                     boxShadow: 'var(--chart-shadow-light)'
                   }}>
                <Trophy className="w-6 h-6 mb-2" style={{ color: themeColors.primary }} />
                <div className="text-2xl font-bold mb-1" style={{ color: themeColors.primary }}>
                  {Math.round((data.cpm / zones.personalBest) * 100)}<span className="text-sm">%</span>
                </div>
                <div className="text-sm font-medium" style={{ color: themeColors.muted }}>
                  최고기록
                </div>
              </div>

              {/* 레벨업까지 */}
              <div className="flex flex-col items-center p-4 rounded-xl text-center" 
                   style={{ 
                     backgroundColor: 'var(--color-background)', 
                     border: '1px solid var(--color-border)',
                     boxShadow: 'var(--chart-shadow-light)'
                   }}>
                <IoSparkles className="w-6 h-6 mb-2" style={{ color: themeColors.primary }} />
                <div className="text-2xl font-bold mb-1" style={{ color: themeColors.primary }}>
                  {getLevelProgress()}<span className="text-sm">%</span>
                </div>
                <div className="text-sm font-medium" style={{ color: themeColors.muted }}>
                  레벨업까지
                </div>
              </div>
            </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {/* 재도전 버튼 */}
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: themeColors.primary,
                color: 'white',
                boxShadow: 'var(--chart-shadow-heavy)'
              }}
            >
              <IoPlay className="w-5 h-5" />
              재도전하기
            </button>
            
            {/* 공유 버튼 */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'transparent',
                color: themeColors.primary,
                border: `2px solid ${themeColors.primary}`,
                boxShadow: 'var(--chart-shadow-medium)'
              }}
            >
              <Share2 className="w-5 h-5" />
              결과 공유하기
            </button>
      </div>

      {/* 공유 성공 모달 */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black bg-opacity-50 absolute inset-0"></div>
          <div className="stats-card relative z-10 text-center">
            <div className="stats-body">클립보드에 복사되었습니다!</div>
          </div>
        </div>
      )}
    </div>
  );
}