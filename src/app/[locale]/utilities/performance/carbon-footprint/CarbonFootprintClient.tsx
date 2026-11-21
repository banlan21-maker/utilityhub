'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Flame } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './carbon-footprint.module.css';
import { ui } from '@/app/components/ui';

// ── Constants ──────────────────────────────────────
const KWH_PER_GB = 1.805;
const CO2_PER_KWH_GRID = 0.494;
const CO2_PER_KWH_GREEN = 0.031;
const TREE_CO2_PER_YEAR = 21.77;

// ── Utility ────────────────────────────────────────
function formatNumber(value: number, decimals = 2): string {
  if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return value.toFixed(decimals);
}

type Grade = 'A+' | 'A' | 'B' | 'C' | 'D';

function getGrade(co2PerVisitGram: number): Grade {
  if (co2PerVisitGram <= 0.5) return 'A+';
  if (co2PerVisitGram <= 1.0) return 'A';
  if (co2PerVisitGram <= 2.0) return 'B';
  if (co2PerVisitGram <= 4.0) return 'C';
  return 'D';
}

function getGradeLabel(grade: Grade, isKo: boolean): string {
  const labels: Record<Grade, [string, string]> = {
    'A+': ['A+ 친환경', 'A+ Eco-Friendly'],
    'A':  ['A 양호',    'A Good'],
    'B':  ['B 보통',    'B Average'],
    'C':  ['C 개선필요', 'C Needs Improvement'],
    'D':  ['D 위험',    'D High Emission'],
  };
  return isKo ? labels[grade][0] : labels[grade][1];
}

function getGradeCssClass(grade: Grade): string {
  const map: Record<Grade, string> = {
    'A+': ui.green,
    'A':  ui.green,
    'B':  ui.amber,
    'C':  ui.amber,
    'D':  ui.red,
  };
  return map[grade];
}

function getTip(grade: Grade, isKo: boolean): string {
  if (isKo) {
    const tips: Record<Grade, string> = {
      'A+': '매우 친환경적이에요! WebP/AVIF 이미지 형식을 유지하고 불필요한 JS를 계속 제거하세요.',
      'A':  '평균보다 친환경적이에요. 이미지 lazy loading과 CDN 적용으로 A+를 노려보세요.',
      'B':  '이미지를 WebP로 변환하고 사용하지 않는 CSS/JS를 제거하면 30~50% 줄일 수 있어요.',
      'C':  '페이지 크기가 큽니다. 이미지 압축, 폰트 최적화, 동영상 자동재생 제거를 먼저 적용하세요.',
      'D':  '탄소 배출이 매우 높습니다. 그린 호스팅 전환 + 전면적인 성능 최적화가 시급해요.',
    };
    return tips[grade];
  }
  const tips: Record<Grade, string> = {
    'A+': 'Excellent! Keep using WebP/AVIF images and continue removing unused JavaScript.',
    'A':  'Better than average. Try lazy loading images and using a CDN to reach A+.',
    'B':  'Convert images to WebP and remove unused CSS/JS — you can reduce emissions by 30–50%.',
    'C':  'Large page size detected. Start with image compression, font subsetting, and removing autoplay videos.',
    'D':  'Very high emissions. Switching to green hosting and a full performance audit is urgent.',
  };
  return tips[grade];
}

// ── Main Component ─────────────────────────────────
export default function CarbonFootprintClient({ seo }: { seo?: React.ReactNode }) {
  const t = useTranslations('CarbonFootprint');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [pageSizeStr, setPageSizeStr] = useState('');
  const [pageviewsStr, setPageviewsStr] = useState('');
  const [hosting, setHosting] = useState<'conventional' | 'green'>('conventional');
  const [returnRatioStr, setReturnRatioStr] = useState('0.25');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const pageSizeMB = Math.max(0, parseFloat(pageSizeStr) || 0);
  const monthlyPageviews = Math.max(0, parseInt(pageviewsStr, 10) || 0);
  const returnRatio = parseFloat(returnRatioStr);
  const isGreenHosting = hosting === 'green';

  const shouldShowResult = pageSizeMB > 0 && monthlyPageviews > 0;

  const result = useMemo(() => {
    if (!shouldShowResult) return null;

    const sizeGB = pageSizeMB / 1024;
    const annualPageviews = monthlyPageviews * 12;
    const newVisitorRatio = 1 - returnRatio;
    const dataTransferGB = sizeGB * annualPageviews * (newVisitorRatio + returnRatio * 0.02);
    const energyKWh = dataTransferGB * KWH_PER_GB;
    const co2Factor = isGreenHosting ? CO2_PER_KWH_GREEN : CO2_PER_KWH_GRID;
    const co2Annual = Number((energyKWh * co2Factor).toFixed(4));
    const co2Monthly = co2Annual / 12;
    const co2PerVisitGram = annualPageviews > 0 ? (co2Annual / annualPageviews) * 1000 : 0;
    const treesNeeded = Math.ceil(co2Annual / TREE_CO2_PER_YEAR);
    const energyKWhAnnual = energyKWh;

    let simCo2Annual: number;
    let simLabel: 'green' | 'optimize';

    if (!isGreenHosting) {
      simCo2Annual = Number((energyKWh * CO2_PER_KWH_GREEN).toFixed(4));
      simLabel = 'green';
    } else {
      const simSizeGB = sizeGB * 0.5;
      const simDataTransferGB = simSizeGB * annualPageviews * (newVisitorRatio + returnRatio * 0.02);
      const simEnergyKWh = simDataTransferGB * KWH_PER_GB;
      simCo2Annual = Number((simEnergyKWh * CO2_PER_KWH_GREEN).toFixed(4));
      simLabel = 'optimize';
    }

    const simReduction = co2Annual - simCo2Annual;
    const simReductionPercent = co2Annual > 0
      ? ((simReduction / co2Annual) * 100).toFixed(1)
      : '0.0';
    const simTreesNeeded = Math.ceil(simCo2Annual / TREE_CO2_PER_YEAR);
    const grade = getGrade(co2PerVisitGram);

    return {
      co2Annual,
      co2Monthly,
      co2PerVisitGram,
      treesNeeded,
      energyKWhAnnual,
      simCo2Annual,
      simLabel,
      simReduction,
      simReductionPercent,
      simTreesNeeded,
      grade,
    };
  }, [pageSizeMB, monthlyPageviews, returnRatio, isGreenHosting, shouldShowResult]);

  const handleCopy = async () => {
    if (!result) return;
    const gradeLabel = getGradeLabel(result.grade, isKo);
    const text = isKo
      ? `🌍 내 웹사이트 탄소 발자국 결과\n📊 등급: ${gradeLabel}\n🏭 연간 CO₂: ${formatNumber(result.co2Annual)}kg\n🌳 나무 ${result.treesNeeded}그루가 1년간 흡수해야 상쇄\n🔗 측정하기: https://www.theutilhub.com/ko/utilities/performance/carbon-footprint`
      : `🌍 Website Carbon Footprint Result\n📊 Grade: ${gradeLabel}\n🏭 Annual CO₂: ${formatNumber(result.co2Annual)}kg\n🌳 Offset requires ${result.treesNeeded} tree(s) per year\n🔗 Measure yours: https://www.theutilhub.com/en/utilities/performance/carbon-footprint`;

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const treeEmoji = result && result.treesNeeded >= 100 ? '🌳🌳🌳' : '🌳';

  const simTitle = result
    ? result.simLabel === 'green'
      ? (isKo ? '💡 만약 그린 호스팅으로 전환하면?' : '💡 If you switch to green hosting?')
      : (isKo ? '💡 만약 페이지 크기를 50% 줄이면?' : '💡 If you reduce page size by 50%?')
    : '';

  const copyBtnClass = [
    ui.button,
    ui.secondary,
    ui.block,
    copyStatus === 'success' ? ui.green : '',
    copyStatus === 'error' ? ui.red : '',
  ].join(' ').trim();

  const copyBtnText =
    copyStatus === 'success'
      ? (isKo ? '✅ 복사 완료!' : '✅ Copied!')
      : copyStatus === 'error'
      ? (isKo ? '❌ 복사 실패: 브라우저 설정을 확인하세요' : '❌ Copy failed: check browser settings')
      : (isKo ? '📋 결과 카드 복사' : '📋 Copy Result Card');

  return (
    <div className={s.container}>
      <NavigationActions />

      <ToolHeader icon={<Flame />} title={t('title')} subtitle={t('description')} />

      {/* Input Panel */}
      <section className={`${ui.card} ${s.panel}`}>
        <div className={s.input_grid}>
          {/* Page Size */}
          <div className={ui.field}>
            <label className={ui.label}>{isKo ? '페이지 크기 (MB)' : 'Page Size (MB)'}</label>
            <input
              className={ui.input}
              type="number"
              step="0.1"
              min="0"
              placeholder={isKo ? '예: 2.5' : 'e.g. 2.5'}
              value={pageSizeStr}
              onChange={e => {
                const v = e.target.value;
                if (v === '' || parseFloat(v) >= 0) setPageSizeStr(v);
              }}
              aria-label={isKo ? '페이지 크기 (MB)' : 'Page Size in MB'}
            />
            <span className={ui.hint}>
              {isKo
                ? '일반 사이트: 약 2~3MB / 최적화: 0.5~1MB / 쇼핑몰: 5~8MB'
                : 'Typical: ~2–3MB / Optimized: 0.5–1MB / E-commerce: 5–8MB'}
            </span>
          </div>

          {/* Monthly Pageviews */}
          <div className={ui.field}>
            <label className={ui.label}>{isKo ? '월간 페이지뷰 (회)' : 'Monthly Pageviews'}</label>
            <input
              className={ui.input}
              type="number"
              step="1"
              min="0"
              placeholder={isKo ? '예: 10000' : 'e.g. 10000'}
              value={pageviewsStr}
              onChange={e => {
                const v = e.target.value;
                if (v === '' || parseInt(v, 10) >= 0) setPageviewsStr(v);
              }}
              aria-label={isKo ? '월간 페이지뷰' : 'Monthly Pageviews'}
            />
            <span className={ui.hint}>
              {isKo
                ? '소규모 블로그: 1,000~5,000 / 중소기업: 10,000~50,000 / 대형: 100,000+'
                : 'Small blog: 1K–5K / SMB: 10K–50K / Large service: 100K+'}
            </span>
          </div>

          {/* Hosting Type */}
          <div className={ui.field}>
            <label className={ui.label}>{isKo ? '호스팅 에너지 유형' : 'Hosting Energy Type'}</label>
            <select
              className={ui.input}
              value={hosting}
              onChange={e => setHosting(e.target.value as 'conventional' | 'green')}
              aria-label={isKo ? '호스팅 에너지 유형' : 'Hosting Energy Type'}
            >
              <option value="conventional">{isKo ? '일반 호스팅 (기본값)' : 'Conventional Hosting (default)'}</option>
              <option value="green">{isKo ? '그린 호스팅 (재생에너지)' : 'Green Hosting (renewable energy)'}</option>
            </select>
          </div>

          {/* Return Visitor Ratio */}
          <div className={ui.field}>
            <label className={ui.label}>{isKo ? '재방문자 비율' : 'Return Visitor Ratio'}</label>
            <select
              className={ui.input}
              value={returnRatioStr}
              onChange={e => setReturnRatioStr(e.target.value)}
              aria-label={isKo ? '재방문자 비율' : 'Return Visitor Ratio'}
            >
              <option value="0.25">{isKo ? '재방문자 25% (기본)' : '25% returning (default)'}</option>
              <option value="0.50">{isKo ? '재방문자 50%' : '50% returning'}</option>
              <option value="0.90">{isKo ? '재방문자 90%' : '90% returning'}</option>
            </select>
          </div>
        </div>

        {/* Result Area */}
        {shouldShowResult && result && (
          <div className={s.result_wrap}>
            {/* Main CO₂ */}
            <div className={s.result_main}>
              <div className={s.result_co2}>{formatNumber(result.co2Annual)} kg CO₂</div>
              <div className={s.result_co2_label}>{isKo ? '연간 배출량 추정치' : 'Estimated annual emissions'}</div>
              <span className={`${ui.badge} ${getGradeCssClass(result.grade)} ${s.grade_badge}`}>
                {getGradeLabel(result.grade, isKo)}
              </span>
            </div>

            {/* 3 Metric Cards */}
            <div className={s.metrics_grid}>
              <div className={s.metric_card}>
                <span className={s.metric_card_value}>{formatNumber(result.co2Monthly)} kg</span>
                <div className={s.metric_card_label}>{isKo ? 'CO₂/월' : 'CO₂/month'}</div>
              </div>
              <div className={s.metric_card}>
                <span className={s.metric_card_value}>{formatNumber(result.co2PerVisitGram, 3)} g</span>
                <div className={s.metric_card_label}>{isKo ? 'CO₂/방문' : 'CO₂/visit'}</div>
              </div>
              <div className={s.metric_card}>
                <span className={s.metric_card_value}>{formatNumber(result.energyKWhAnnual, 1)} kWh</span>
                <div className={s.metric_card_label}>{isKo ? '연간 전력' : 'Annual energy'}</div>
              </div>
            </div>

            {/* Tree Box */}
            <div className={`${ui.notice} ${ui.green} ${s.tree_box}`}>
              {treeEmoji}{' '}
              {isKo
                ? `나무 ${result.treesNeeded}그루가 1년간 흡수해야 상쇄되는 양이에요`
                : `Offsetting requires ${result.treesNeeded} tree(s) absorbing CO₂ for a year`}
            </div>

            {/* Tip Box */}
            <div className={`${ui.notice} ${result.grade === 'A+' || result.grade === 'A' ? ui.green : ui.amber} ${s.tip_box}`}>
              {getTip(result.grade, isKo)}
            </div>

            {/* Simulation Box */}
            <div className={s.sim_box}>
              <div className={s.sim_title}>{simTitle}</div>
              <div className={s.sim_row}>
                <span className={s.sim_label}>{isKo ? '현재' : 'Current'}:</span>
                <span className={s.sim_value}>{formatNumber(result.co2Annual)} kg CO₂/{isKo ? '년' : 'yr'}</span>
              </div>
              <div className={s.sim_row}>
                <span className={s.sim_label}>
                  {result.simLabel === 'green'
                    ? (isKo ? '전환 후' : 'After switch')
                    : (isKo ? '최적화 후' : 'After optimize')}:
                </span>
                <span className={s.sim_value}>{formatNumber(result.simCo2Annual)} kg CO₂/{isKo ? '년' : 'yr'}</span>
              </div>
              <div className={s.sim_divider} />
              <div className={s.sim_row}>
                <span className={s.sim_label}>{isKo ? '절감량' : 'Reduction'}:</span>
                <span className={s.sim_saving}>
                  {formatNumber(result.simReduction)} kg ({result.simReductionPercent}% {isKo ? '감소' : 'less'})
                </span>
              </div>
              <div className={s.sim_row}>
                <span className={s.sim_label}>{isKo ? '나무 환산' : 'Tree equivalent'}:</span>
                <span className={s.sim_value}>
                  🌳 {result.treesNeeded}{isKo ? '그루' : ''} → {result.simTreesNeeded}{isKo ? '그루' : ''}
                </span>
              </div>
            </div>

            {/* Copy Button */}
            <button
              className={copyBtnClass}
              onClick={handleCopy}
              aria-label={isKo ? '결과 카드 복사' : 'Copy result card'}
            >
              {copyBtnText}
            </button>
          </div>
        )}
      </section>

      {/* Bottom 7 sections */}
      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/performance/carbon-footprint" />
      {seo}
    </div>
  );
}
