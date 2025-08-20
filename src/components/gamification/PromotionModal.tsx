"use client";

import { useEffect, useState } from "react";
import { getTierColor, generatePromotionMessage, type TierConfig } from "@/utils/tierSystem";
import { Trophy, Star, Sparkles, Gift, X } from "lucide-react";

interface PromotionModalProps {
  isOpen: boolean;
  fromTier: TierConfig;
  toTier: TierConfig;
  onClose: () => void;
  onComplete?: () => void;
}

export function PromotionModal({
  isOpen,
  fromTier,
  toTier,
  onClose,
  onComplete
}: PromotionModalProps) {
  const [animationStep, setAnimationStep] = useState<'entering' | 'celebrating' | 'revealing' | 'complete'>('entering');
  const [showConfetti, setShowConfetti] = useState(false);

  const promotion = generatePromotionMessage(fromTier, toTier);

  useEffect(() => {
    if (isOpen) {
      const sequence = async () => {
        // 1. 입장 애니메이션
        setAnimationStep('entering');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 2. 축하 애니메이션
        setAnimationStep('celebrating');
        setShowConfetti(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 3. 새 티어 공개
        setAnimationStep('revealing');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 4. 완료
        setAnimationStep('complete');
        
        // 5초 후 자동 닫기 (선택사항)
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 5000);
      };
      
      sequence();
    }
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-background bg-opacity-90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 메인 모달 */}
      <div className={`relative bg-background-secondary rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl border border-interactive-primary border-opacity-20 transform transition-all duration-500 ${
        animationStep === 'entering' ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-text-tertiary bg-opacity-20 hover:bg-opacity-30 transition-colors"
        >
          <X className="w-4 h-4 text-text-secondary" />
        </button>

        {/* 콘페티 애니메이션 */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <Sparkles className="w-4 h-4 text-interactive-primary opacity-60" />
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          {/* 1단계: 기존 티어 */}
          {animationStep === 'entering' && (
            <div className={`transform transition-all duration-500 ${
              animationStep !== 'entering' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
            }`}>
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl border-4 mb-4"
                style={{
                  background: getTierColor(fromTier, 'gradient'),
                  borderColor: fromTier.color
                }}
              >
                {fromTier.icon}
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: fromTier.color }}>
                {fromTier.name}
              </h3>
            </div>
          )}

          {/* 2단계: 축하 메시지 */}
          {animationStep === 'celebrating' && (
            <div className="animate-pulse">
              <Trophy className="w-16 h-16 mx-auto text-interactive-primary mb-4" />
              <h2 className="text-2xl font-bold text-interactive-primary mb-4">
                축하합니다!
              </h2>
              <p className="text-secondary">
                티어 승급 조건을 만족했습니다!
              </p>
            </div>
          )}

          {/* 3단계: 새 티어 공개 */}
          {(animationStep === 'revealing' || animationStep === 'complete') && (
            <div className={`transform transition-all duration-700 ${
              animationStep === 'revealing' ? 'animate-bounce' : ''
            }`}>
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl border-4 mb-6 shadow-lg"
                style={{
                  background: getTierColor(toTier, 'gradient'),
                  borderColor: toTier.color,
                  boxShadow: `0 0 20px ${toTier.color}40`
                }}
              >
                {toTier.icon}
              </div>
              
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2" style={{ color: toTier.color }}>
                  {promotion.title}
                </h2>
                <p className="text-lg text-secondary mb-2">
                  {toTier.rewards.title}
                </p>
                <p className="text-sm text-muted">
                  {toTier.description}
                </p>
              </div>

              {/* 보상 정보 */}
              {animationStep === 'complete' && (
                <div className="bg-background-elevated rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-interactive-primary" />
                    <span className="font-semibold text-primary">승급 보상</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary">새로운 타이틀</span>
                      <span className="text-sm font-medium text-primary">
                        {toTier.rewards.title}
                      </span>
                    </div>
                    
                    {toTier.rewards.badge && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary">배지</span>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-interactive-primary" />
                          <span className="text-sm font-medium text-primary">
                            새 배지 획득
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {toTier.rewards.theme && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary">전용 테마</span>
                        <span className="text-sm font-medium text-primary">
                          잠금 해제
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 액션 버튼 */}
              {animationStep === 'complete' && (
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 btn btn-secondary"
                  >
                    계속하기
                  </button>
                  <button
                    onClick={() => {
                      // 통계 페이지로 이동하거나 다른 액션
                      onClose();
                    }}
                    className="flex-1 btn btn-primary"
                  >
                    자세히 보기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti-fall 3s ease-in-out infinite;
        }
        
        @keyframes tier-glow {
          0%, 100% {
            filter: drop-shadow(0 0 8px currentColor);
          }
          50% {
            filter: drop-shadow(0 0 16px currentColor);
          }
        }
        
        .animate-tier-glow {
          animation: tier-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}