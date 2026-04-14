'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Flame } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './carbon-footprint.module.css';

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
    'A+': s.grade_a_plus,
    'A':  s.grade_a,
    'B':  s.grade_b,
    'C':  s.grade_c,
    'D':  s.grade_d,
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
export default function CarbonFootprintClient() {
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
    s.copy_btn,
    copyStatus === 'success' ? s.copy_btn_success : '',
    copyStatus === 'error' ? s.copy_btn_error : '',
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

      <header className={s.header}>
        <div className={s.header_icon}>
          <Flame size={40} color="#059669" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('description')}</p>
      </header>

      {/* Input Panel */}
      <section className={s.panel}>
        <div className={s.input_grid}>
          {/* Page Size */}
          <div className={s.field}>
            <label className={s.label}>{isKo ? '페이지 크기 (MB)' : 'Page Size (MB)'}</label>
            <input
              className={s.input}
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
            <span className={s.field_hint}>
              {isKo
                ? '일반 사이트: 약 2~3MB / 최적화: 0.5~1MB / 쇼핑몰: 5~8MB'
                : 'Typical: ~2–3MB / Optimized: 0.5–1MB / E-commerce: 5–8MB'}
            </span>
          </div>

          {/* Monthly Pageviews */}
          <div className={s.field}>
            <label className={s.label}>{isKo ? '월간 페이지뷰 (회)' : 'Monthly Pageviews'}</label>
            <input
              className={s.input}
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
            <span className={s.field_hint}>
              {isKo
                ? '소규모 블로그: 1,000~5,000 / 중소기업: 10,000~50,000 / 대형: 100,000+'
                : 'Small blog: 1K–5K / SMB: 10K–50K / Large service: 100K+'}
            </span>
          </div>

          {/* Hosting Type */}
          <div className={s.field}>
            <label className={s.label}>{isKo ? '호스팅 에너지 유형' : 'Hosting Energy Type'}</label>
            <select
              className={s.select}
              value={hosting}
              onChange={e => setHosting(e.target.value as 'conventional' | 'green')}
              aria-label={isKo ? '호스팅 에너지 유형' : 'Hosting Energy Type'}
            >
              <option value="conventional">{isKo ? '일반 호스팅 (기본값)' : 'Conventional Hosting (default)'}</option>
              <option value="green">{isKo ? '그린 호스팅 (재생에너지)' : 'Green Hosting (renewable energy)'}</option>
            </select>
          </div>

          {/* Return Visitor Ratio */}
          <div className={s.field}>
            <label className={s.label}>{isKo ? '재방문자 비율' : 'Return Visitor Ratio'}</label>
            <select
              className={s.select}
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
          <div className={s.result_wrap} style={{ marginTop: '1.5rem' }}>
            {/* Main CO₂ */}
            <div className={s.result_main}>
              <div className={s.result_co2}>{formatNumber(result.co2Annual)} kg CO₂</div>
              <div className={s.result_co2_label}>{isKo ? '연간 배출량 추정치' : 'Estimated annual emissions'}</div>
              <span className={`${s.grade_badge} ${getGradeCssClass(result.grade)}`}>
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
            <div className={s.tree_box}>
              {treeEmoji}{' '}
              {isKo
                ? `나무 ${result.treesNeeded}그루가 1년간 흡수해야 상쇄되는 양이에요`
                : `Offsetting requires ${result.treesNeeded} tree(s) absorbing CO₂ for a year`}
            </div>

            {/* Tip Box */}
            <div className={`${s.tip_box} ${result.grade === 'A+' || result.grade === 'A' ? s.tip_box_green : ''}`}>
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
      <RelatedTools toolId="performance/carbon-footprint" />
      <div className="w-full min-h-[90px] bg-slate-100/50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm my-8">
        AD
      </div>
      <SeoSection
        ko={{
          title: '웹사이트 탄소 발자국 계산기란 무엇인가요?',
          description:
            '웹사이트 탄소 발자국 계산기는 내 웹사이트가 운영되면서 발생시키는 연간 이산화탄소(CO₂) 배출량을 추정해주는 도구입니다. 웹사이트는 사용자가 페이지를 방문할 때마다 데이터를 전송하고, 이 과정에서 서버·네트워크·사용자 기기가 전력을 소비합니다. 이 계산기는 websitecarbon.com의 공식 방법론을 기반으로 페이지 크기(MB), 월간 방문자 수, 호스팅 에너지 유형, 재방문자 비율을 입력받아 연간 CO₂ 배출량을 kg 단위로 계산하고, 방문당 탄소량·월간 배출량·연간 소비 전력까지 함께 제공합니다. 또한 배출량을 나무 몇 그루가 1년간 흡수해야 상쇄할 수 있는지로 환산해 직관적으로 이해할 수 있게 합니다. 그린 호스팅 전환 시 예상 절감량을 실시간으로 비교 시뮬레이션할 수 있으며, 결과를 SNS에 바로 공유할 수 있는 카드 복사 기능도 제공합니다. 본 계산기는 보수적인 산정 기준(1.805 kWh/GB)을 적용하여 탄소 배출량을 측정하며, 최신 전력망 효율을 적용한 실제 배출량은 이보다 낮을 수 있습니다. 등급(A+~D)은 업계 평균 데이터를 참고한 자체 기준이며, 공식 탄소 감사가 필요한 경우 전문 기관을 이용하시기 바랍니다.',
          useCases: [
            {
              icon: '🌍',
              title: 'ESG 보고서 자료 수집',
              desc: '기업의 ESG(환경·사회·지배구조) 보고서나 탄소 중립 선언에 필요한 디지털 자산의 탄소 배출 추정치를 빠르게 산출해 자료로 활용할 수 있습니다.',
            },
            {
              icon: '🚀',
              title: '그린 호스팅 전환 시뮬레이션',
              desc: '일반 호스팅과 재생에너지 기반 그린 호스팅 선택 시 CO₂ 배출량 차이를 비교 시뮬레이션으로 직접 확인하고, 전환의 환경적·비용적 효과를 수치로 파악하세요.',
            },
            {
              icon: '📊',
              title: '웹 성능 최적화 우선순위 결정',
              desc: '페이지 크기를 줄였을 때 탄소 배출이 얼마나 감소하는지 시뮬레이션해 이미지 최적화·코드 경량화 작업의 환경적 임팩트를 수치로 파악하세요.',
            },
            {
              icon: '📱',
              title: 'SNS 바이럴 콘텐츠 생성',
              desc: '내 사이트의 탄소 등급과 나무 환산치 결과를 결과 카드 복사 버튼으로 원클릭 복사해 SNS·슬랙·노션 등에 바로 붙여넣기 하세요.',
            },
          ],
          steps: [
            {
              step: '페이지 크기 입력',
              desc: '페이지 크기 입력란에 웹사이트의 평균 페이지 용량을 MB 단위로 입력합니다. 크롬 개발자 도구(F12) → Network 탭에서 페이지 로드 후 하단 전송량으로 확인 가능합니다. 모르겠다면 입력란 아래 참고 수치를 활용하세요.',
            },
            {
              step: '월간 페이지뷰 입력',
              desc: '월간 페이지뷰 수를 입력합니다. Google Analytics 또는 네이버 애널리틱스에서 세션 수 또는 페이지뷰 항목을 확인해 입력하면 됩니다.',
            },
            {
              step: '호스팅 설정 선택',
              desc: '호스팅 에너지 유형(일반/그린)과 재방문자 비율을 선택합니다. 그린 호스팅 사용 여부는 호스팅 업체 공식 페이지에서 확인할 수 있습니다.',
            },
            {
              step: '결과 확인 및 공유',
              desc: '결과에서 연간 CO₂ 배출량, 등급, 나무 환산치를 확인합니다. 비교 시뮬레이션 박스에서 그린 호스팅 전환 또는 페이지 최적화 시 절감 효과도 확인하세요. 결과 카드 복사 버튼으로 SNS에 바로 공유할 수 있습니다.',
            },
          ],
          faqs: [
            {
              q: '계산 결과가 실제 배출량과 정확히 일치하나요?',
              a: '이 계산기는 websitecarbon.com의 공식 방법론을 기반으로 하며, 데이터 전송량 기반의 추정치를 제공합니다. 실제 배출량은 서버 위치, 사용자 기기 종류, 네트워크 환경에 따라 다를 수 있습니다. 등급(A+~D)은 업계 평균 데이터를 참고한 자체 기준이며, 공식 탄소 감사가 필요한 경우 전문 기관의 측정을 권장합니다. 이 툴의 결과는 개선 방향 파악과 상대적 비교 용도로 활용하시기 바랍니다.',
            },
            {
              q: '그린 호스팅을 사용하면 탄소 배출이 얼마나 줄어드나요?',
              a: '재생에너지 기반 그린 호스팅은 일반 전력망 대비 CO₂ 배출계수가 약 94% 낮습니다. (일반: 0.494kg/kWh vs 재생에너지: 0.031kg/kWh) 이 계산기에서 호스팅 유형을 변경하면 실시간으로 그 차이를 확인할 수 있으며, 비교 시뮬레이션 박스에서 전환 전후 절감량을 자동으로 보여줍니다. AWS, Google Cloud, Azure 모두 재생에너지 100% 달성을 공표한 그린 호스팅 옵션을 제공합니다.',
            },
            {
              q: '페이지 크기는 어디서 확인하나요?',
              a: '크롬 브라우저에서 F12(개발자 도구)를 열고 Network 탭을 선택한 뒤, 측정할 페이지를 새로고침하면 하단에 총 전송량이 표시됩니다. 또는 Google PageSpeed Insights, GTmetrix에서도 페이지 크기를 확인할 수 있습니다. 일반적인 웹사이트 평균 페이지 크기는 약 2~3MB이며, 최적화된 사이트는 1MB 미만인 경우도 많습니다.',
            },
            {
              q: '전력 소비 기준(1.805 kWh/GB)은 어떤 근거인가요?',
              a: '본 계산기는 데이터 전송 1GB당 1.805kWh를 소비한다는 보수적인 산정 기준을 적용하고 있습니다. 이는 websitecarbon.com의 공식 방법론에서 채택한 수치로, 데이터센터·네트워크·사용자 기기의 전력 소비를 모두 포함한 값입니다. 최신 Sustainable Web Design(SWD) v3 모델에서는 전력망 효율 개선을 반영해 약 0.81 kWh/GB로 더 낮은 기준을 제시하고 있어, 실제 탄소 배출량은 본 계산기의 결과보다 낮을 수 있습니다.',
            },
            {
              q: '이 툴의 결과를 공식 자료로 사용해도 되나요?',
              a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 정확한 탄소 배출량 측정은 전문가 또는 공인 기관의 공식 측정을 통해 확인하시기 바랍니다.',
            },
          ],
        }}
        en={{
          title: 'What is Website Carbon Footprint Calculator?',
          description:
            'Every time someone visits your website, data is transferred across networks and servers — and that transfer consumes electricity and emits CO₂. The Website Carbon Footprint Calculator estimates your site\'s annual carbon emissions based on the methodology from websitecarbon.com. You enter four values: page size in MB, monthly pageviews, hosting energy type (conventional or green), and your returning visitor ratio. The tool calculates annual CO₂ in kilograms, breaks it down by month and per visit, and also shows annual energy consumption in kWh. Results are converted into a tree equivalent — how many trees would need to absorb CO₂ for a year to offset your site\'s emissions. A comparison simulation shows how switching to green hosting or reducing page size by 50% would reduce your footprint in real time. The copy result card button lets you share your grade and stats on social media instantly. All calculations run entirely in your browser — no data is sent to any server. Note that this calculator uses a conservative energy factor of 1.805 kWh/GB, which may produce higher estimates than the newer Sustainable Web Design v3 model (~0.81 kWh/GB). Grades (A+ through D) are based on industry average benchmarks, not an official standard.',
          useCases: [
            {
              icon: '🌍',
              title: 'ESG Reporting',
              desc: 'Quickly estimate the digital carbon footprint of your web properties to include in ESG reports or carbon neutrality declarations without needing a full audit.',
            },
            {
              icon: '🚀',
              title: 'Green Hosting ROI Simulation',
              desc: 'Compare CO₂ emissions between conventional and renewable-energy hosting to quantify the environmental benefit of switching providers before committing.',
            },
            {
              icon: '📊',
              title: 'Performance Optimization Prioritization',
              desc: 'Simulate how reducing page size by optimizing images or removing unused code affects your carbon output, helping you justify performance work with environmental metrics.',
            },
            {
              icon: '📱',
              title: 'Social Media Sharing',
              desc: 'Copy your carbon grade and tree-equivalent result with one click to share on Twitter, LinkedIn, Slack, or Notion as part of green web initiative announcements.',
            },
          ],
          steps: [
            {
              step: 'Enter page size',
              desc: 'Type your website\'s average page weight in MB. Open Chrome DevTools (F12) → Network tab, reload the page, and check the total transfer size at the bottom. You can also use Google PageSpeed Insights or GTmetrix to find this value.',
            },
            {
              step: 'Enter monthly pageviews',
              desc: 'Input your site\'s monthly pageview count. Find this in Google Analytics under Acquisition or Engagement reports, or use any analytics platform that tracks sessions and page views.',
            },
            {
              step: 'Choose hosting type and return ratio',
              desc: 'Select whether you use conventional or green (renewable energy) hosting, and pick your returning visitor ratio. Return visitors use cached data and generate about 98% less data transfer, so this significantly affects your result.',
            },
            {
              step: 'Review results and share',
              desc: 'See your annual CO₂ estimate, grade (A+ to D), tree equivalent, and monthly/per-visit breakdowns. Check the simulation box to see how switching hosting or optimizing your page would reduce emissions, then copy your result card to share.',
            },
          ],
          faqs: [
            {
              q: 'Are these results accurate?',
              a: 'The calculator provides estimates based on the websitecarbon.com methodology, which uses a conservative energy intensity of 1.805 kWh per GB of data transferred. Actual emissions vary depending on server location, user device types, and network infrastructure. Grades (A+ to D) use industry benchmark averages, not an official carbon standard. Use this tool for directional insights and relative comparisons, not as a substitute for a professional carbon audit.',
            },
            {
              q: 'How much does green hosting reduce emissions?',
              a: 'Green hosting using renewable energy has a CO₂ emission factor of about 0.031 kg/kWh, compared to 0.494 kg/kWh for the conventional grid — roughly 94% lower. This calculator shows you the difference in real time when you switch the hosting type dropdown. Major providers like AWS, Google Cloud, and Azure all offer renewable energy-powered options or have committed to 100% renewable energy.',
            },
            {
              q: 'Where can I find my page size?',
              a: 'Open Chrome DevTools (F12 or Cmd+Option+I on Mac) and go to the Network tab. Reload the page and check the total transfer size shown at the bottom of the panel. Alternatively, tools like Google PageSpeed Insights, GTmetrix, and WebPageTest also report page weight. Most websites average 2–3 MB; well-optimized sites can be under 1 MB.',
            },
            {
              q: 'Why does the calculator use 1.805 kWh/GB?',
              a: 'This value comes from the websitecarbon.com methodology, which uses a conservative energy intensity figure that includes data centers, network infrastructure, and end-user devices. The newer Sustainable Web Design (SWD) v3 model uses approximately 0.81 kWh/GB to reflect improvements in grid efficiency, so actual emissions may be lower than this calculator shows. We use the conservative figure to avoid underestimating impact.',
            },
            {
              q: 'Can I use these results as official data?',
              a: 'Results are for reference only. For accurate carbon emissions data required for official reporting or compliance, please consult a qualified environmental professional or accredited carbon auditing organization.',
            },
          ],
        }}
      />
    </div>
  );
}
