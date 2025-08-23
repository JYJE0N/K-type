/**
 * 개발자 도구 - 테스트 및 디버깅용 함수들
 */

import { defaultTierSystem } from "./tierSystem";

// 전역에서 접근 가능한 개발자 도구
declare global {
  interface Window {
    devTools: {
      showPromotionModal: (fromTierKey?: string, toTierKey?: string) => void;
      listTiers: () => void;
      testPromotion: () => void;
      resetProgress: () => void;
    };
  }
}

// 승급 모달 강제 표시 함수
export function showTestPromotionModal(fromTierKey = 'bronze', toTierKey = 'silver') {
  const fromTier = defaultTierSystem.getTier(fromTierKey);
  const toTier = defaultTierSystem.getTier(toTierKey);
  
  if (!fromTier || !toTier) {
    const availableTiers = defaultTierSystem.getAllTiers().map(tier => tier.id);
    console.error('❌ 유효하지 않은 티어입니다. 사용 가능한 티어:', availableTiers);
    return;
  }

  // 승급 모달을 표시하는 이벤트 발생
  const event = new CustomEvent('test:promotion', {
    detail: { fromTier, toTier }
  });
  
  window.dispatchEvent(event);
  console.log('🎉 승급 모달 테스트:', `${fromTier.name} → ${toTier.name}`);
}

// 개발자 도구 초기화
export function initDevTools() {
  if (typeof window === 'undefined') return;
  
  window.devTools = {
    // 승급 모달 표시
    showPromotionModal: (fromTierKey = 'bronze', toTierKey = 'silver') => {
      showTestPromotionModal(fromTierKey, toTierKey);
    },
    
    // 사용 가능한 티어 목록
    listTiers: () => {
      console.log('📋 사용 가능한 티어들:');
      const allTiers = defaultTierSystem.getAllTiers();
      allTiers.forEach((tier) => {
        console.log(`  ${tier.id}: ${tier.name} (${tier.minPercentile}-${tier.maxPercentile}% 백분위, 최소 ${tier.minTests}회 테스트)`);
      });
      console.log('\n사용 예시: devTools.showPromotionModal("bronze", "silver")');
    },
    
    // 빠른 테스트용 승급 모달
    testPromotion: () => {
      showTestPromotionModal('silver', 'gold');
    },
    
    // 진행률 초기화 (테스트용)
    resetProgress: () => {
      if (confirm('정말로 모든 진행률을 초기화하시겠습니까?')) {
        localStorage.removeItem('user-progress-store');
        localStorage.removeItem('typing-store');
        localStorage.removeItem('stats-store');
        window.location.reload();
        console.log('🔄 모든 진행률이 초기화되었습니다.');
      }
    }
  };

  // 개발 모드에서만 콘솔에 안내 메시지 표시
  if (process.env.NODE_ENV === 'development') {
    console.log('🛠️ K-types 개발자 도구가 활성화되었습니다!');
    console.log('사용법:');
    console.log('  devTools.listTiers()           - 사용 가능한 티어 목록');
    console.log('  devTools.testPromotion()       - 승급 모달 테스트');
    console.log('  devTools.showPromotionModal("bronze", "silver") - 특정 승급 표시');
    console.log('  devTools.resetProgress()       - 진행률 초기화');
  }
}