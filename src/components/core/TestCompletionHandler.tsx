"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTypingStore } from "@/stores/typingStore";
import { useStatsStore } from "@/stores/statsStore";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { defaultTierSystem, type TierConfig } from "@/utils/tierSystem";

/**
 * 타이핑 테스트 완료 처리 로직
 * 책임: 테스트 완료 감지, 통계 처리, 티어 승급, 결과 페이지 이동
 */
export function useTestCompletionHandler() {
  const router = useRouter();
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionData, setPromotionData] = useState<{
    fromTier: TierConfig;
    toTier: TierConfig;
  } | null>(null);

  const { isCompleted, targetText, currentIndex } = useTypingStore();
  const { liveStats } = useStatsStore();
  const { 
    averageCPM, 
    averageAccuracy, 
    averageConsistency = 0,
    totalTests,
    initializeUser,
    fetchProgress 
  } = useUserProgressStore();

  // 사용자 초기화 (최초 실행시)
  useEffect(() => {
    initializeUser();
    fetchProgress();
  }, [initializeUser, fetchProgress]);

  // 티어 승급 체크
  const checkTierPromotion = useCallback(() => {
    if (totalTests < 5) return; // 최소 5회 테스트 필요

    const currentTier = defaultTierSystem.calculateCurrentTier({
      averageCPM,
      averageAccuracy,
      averageConsistency: averageConsistency || 0,
      totalTests
    });
    const newTier = defaultTierSystem.calculateCurrentTier({
      averageCPM: liveStats.cpm,
      averageAccuracy: liveStats.accuracy,
      averageConsistency: liveStats.consistency || 0,
      totalTests: totalTests + 1
    });

    // 티어가 상승했는지 확인 (minPercentile로 비교)
    if (newTier.minPercentile > currentTier.minPercentile) {
      setPromotionData({
        fromTier: currentTier,
        toTier: newTier
      });
      setShowPromotionModal(true);
    }
  }, [totalTests, averageCPM, averageAccuracy, liveStats.cpm, liveStats.accuracy]);

  // 테스트 완료 처리
  const handleTestCompletion = useCallback(async () => {
    if (!isCompleted) return;

    // 티어 승급 체크
    checkTierPromotion();

    // 약간의 지연 후 통계 페이지로 이동 (상태 정착 시간)
    setTimeout(() => {
      router.push('/stats');
    }, 500);
  }, [isCompleted, checkTierPromotion, router]);

  // 테스트 완료 감지
  useEffect(() => {
    if (isCompleted && targetText && currentIndex >= targetText.length) {
      handleTestCompletion();
    }
  }, [isCompleted, targetText, currentIndex, handleTestCompletion]);

  // 승급 모달 닫기
  const closePromotionModal = useCallback(() => {
    setShowPromotionModal(false);
    setPromotionData(null);
  }, []);

  // 진행률 계산 (단어 모드일 때)
  const getWordProgress = useCallback(() => {
    if (!targetText) return 0;
    const words = targetText.split(' ');
    const currentWords = targetText.slice(0, currentIndex).split(' ');
    return Math.min(100, (currentWords.length / words.length) * 100);
  }, [targetText, currentIndex]);

  return {
    // 승급 모달 상태
    showPromotionModal,
    promotionData,
    closePromotionModal,
    
    // 진행률
    getWordProgress,
    
    // 액션
    handleTestCompletion,
  };
}