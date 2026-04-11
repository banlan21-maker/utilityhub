'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Activity } from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import ShareBar from '@/app/components/ShareBar';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import s from './sla-uptime-calc.module.css';

/* ─── Constants ───────────────────────────────────────────── */

const YEAR_SECONDS = 365.25 * 24 * 3600; // 31,557,600
const QUICK_VALUES = [99, 99.9, 99.99, 99.999];

/* ─── Calculation ─────────────────────────────────────────── */

function calcDowntime(uptime: number) {
  const diff = Number((100 - uptime).toFixed(10));
  const yearSeconds = Number(((diff / 100) * YEAR_SECONDS).toFixed(5));
  const monthSeconds = Number((yearSeconds / 12).toFixed(5));
  const weekSeconds = Number((yearSeconds / 52).toFixed(5));
  const daySeconds = Number((yearSeconds / 365.25).toFixed(5));
  return { yearSeconds, monthSeconds, weekSeconds, daySeconds };
}

const toHours = (sec: number) => (sec / 3600).toFixed(2);
const toMins = (sec: number) => (sec / 60).toFixed(2);
const toSecs = (sec: number) => sec.toFixed(2);

const fmt = (val: string) =>
  Number(val).toLocaleString('ko-KR', { maximumFractionDigits: 2 });

/* ─── Component ───────────────────────────────────────────── */

export default function SlaUptimeCalcClient() {
  const t = useTranslations('SlaUptimeCalc');
  const locale = useLocale();
  const isKo = locale === 'ko';

  const [inputVal, setInputVal] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setInputVal('');
      return;
    }
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    if (num > 100) { setInputVal('100'); return; }
    if (num < 0) { setInputVal('0'); return; }
    setInputVal(raw);
  };

  const handleQuick = (val: number) => {
    setInputVal(String(val));
  };

  const uptime = inputVal !== '' ? parseFloat(inputVal) : null;
  const hasValue = uptime !== null && !isNaN(uptime);

  const result = useMemo(() => {
    if (!hasValue || uptime === null) return null;
    return calcDowntime(uptime);
  }, [hasValue, uptime]);

  const periods = useMemo(() => {
    const labels = isKo
      ? [{ key: 'year', label: '연간' }, { key: 'month', label: '월간' }, { key: 'week', label: '주간' }, { key: 'day', label: '일간' }]
      : [{ key: 'year', label: 'Yearly' }, { key: 'month', label: 'Monthly' }, { key: 'week', label: 'Weekly' }, { key: 'day', label: 'Daily' }];

    const unitH = isKo ? '시간' : 'hrs';
    const unitM = isKo ? '분' : 'min';
    const unitS = isKo ? '초' : 'sec';

    if (!result) {
      return labels.map(l => ({ ...l, hours: null, mins: null, secs: null, unitH, unitM, unitS }));
    }

    const secValues = [result.yearSeconds, result.monthSeconds, result.weekSeconds, result.daySeconds];
    return labels.map((l, i) => ({
      ...l,
      hours: fmt(toHours(secValues[i])),
      mins: fmt(toMins(secValues[i])),
      secs: fmt(toSecs(secValues[i])),
      unitH, unitM, unitS,
    }));
  }, [result, isKo]);

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* Header */}
      <header className={s.fin_header}>
        <div style={{
          display: 'inline-flex', padding: '1rem', background: 'white',
          borderRadius: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <Activity size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.fin_title}>{t('title')}</h1>
        <p className={s.fin_subtitle}>{t('description')}</p>
      </header>

      {/* Input Panel */}
      <section className={s.fin_panel}>
        <div className={s.inputGroup}>
          <label className={s.inputLabel} htmlFor="sla-input">
            {isKo ? 'SLA 가동률 (%)' : 'SLA Uptime (%)'}
          </label>
          <div className={s.inputWrapper}>
            <input
              id="sla-input"
              className={s.numInput}
              type="number"
              step="any"
              placeholder={isKo ? '예: 99.99' : 'e.g. 99.99'}
              value={inputVal}
              onChange={handleChange}
              autoComplete="off"
            />
            <span className={s.inputSuffix}>%</span>
          </div>
        </div>

        <div className={s.quickBtns}>
          {QUICK_VALUES.map(v => (
            <button
              key={v}
              className={inputVal === String(v) ? s.quickBtnActive : s.quickBtn}
              onClick={() => handleQuick(v)}
              aria-label={`SLA ${v}%`}
            >
              {v}%
            </button>
          ))}
        </div>
      </section>

      {/* Result Grid */}
      <div className={s.resultGrid}>
        {periods.map((p, i) => (
          <div key={p.key} className={i === 0 ? s.resultCardHighlight : s.resultCard}>
            <div className={s.cardLabel}>{p.label}</div>
            {p.hours !== null ? (
              <>
                <div className={s.cardHours}>{p.hours}<span className={s.cardUnit}>{p.unitH}</span></div>
                <div className={s.cardMins}>{p.mins}<span className={s.cardUnit}>{p.unitM}</span></div>
                <div className={s.cardSecs}>{p.secs}<span className={s.cardUnit}>{p.unitS}</span></div>
              </>
            ) : (
              <div className={s.emptyVal}>—</div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom 7 Sections */}
      <ShareBar title={t('title')} description={t('description')} />
      <RelatedTools toolId="utilities/performance/sla-uptime-calc" />
      <div style={{
        width: '100%', minHeight: '90px', background: 'rgba(226, 232, 240, 0.3)',
        border: '1px dashed #cbd5e1', borderRadius: '0.5rem', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
        fontSize: '0.875rem', margin: '2rem 0'
      }}>
        AD
      </div>

      <SeoSection
        ko={{
          title: 'SLA 가동률 계산기란 무엇인가요?',
          description: '쓰리 나인(99.9%), 포 나인(99.99%), 파이브 나인(99.999%) — 클라우드 업계에서 SLA 가동률을 부르는 방식입니다. 숫자 하나 차이처럼 보이지만 실제 허용 다운타임은 천지 차이입니다. 쓰리 나인은 연간 약 8시간 45분을 허용하지만, 포 나인은 연간 52분, 파이브 나인은 고작 5분 15초만 허용합니다. 이 계산기는 SLA 퍼센트를 입력하면 연간·월간·주간·일간 허용 다운타임을 시간·분·초 단위로 즉시 변환합니다. AWS, GCP, Azure 등 클라우드 서비스 도입 시 SLA 비교, 외부 벤더 계약 검토, 인프라 아키텍처 설계, 장애 대응 계획(RTO/RPO 수립)에 필수적으로 활용할 수 있습니다. 모든 계산은 브라우저에서만 수행되며 어떤 데이터도 서버로 전송되지 않습니다.',
          useCases: [
            { icon: '☁️', title: '클라우드 서비스 비교', desc: 'AWS, GCP, Azure 등 클라우드 벤더의 SLA를 직접 입력해 연간 허용 다운타임을 비교하고, 비즈니스 요구사항에 맞는 서비스를 데이터 기반으로 선택할 수 있습니다.' },
            { icon: '📝', title: '계약서 검토 및 협상', desc: '외부 서비스 도입 전 계약서의 SLA 조항을 이 계산기로 실제 시간으로 변환해 비즈니스 리스크를 파악하고, 협상 기준값을 구체적인 숫자로 마련할 수 있습니다.' },
            { icon: '🚨', title: '장애 대응 계획 수립', desc: '월간 허용 다운타임 기준으로 배포·점검 일정을 잡거나, 장애 복구 목표시간(RTO)을 SLA와 비교해 현실적인 인시던트 대응 계획과 에스컬레이션 기준을 세울 수 있습니다.' },
            { icon: '🏗️', title: '인프라 아키텍처 설계', desc: '목표 가동률을 달성하려면 어느 수준의 이중화·다중화가 필요한지 판단하는 기준으로 활용합니다. 파이브 나인(99.999%) 달성 시 연간 5분 15초 내에 모든 점검이 완료돼야 한다는 수치를 팀원에게 공유해 설계 방향을 빠르게 합의할 수 있습니다.' },
          ],
          steps: [
            { step: 'SLA 값 입력', desc: '입력란에 SLA 가동률 퍼센트를 숫자로 입력합니다. 99.9, 99.99, 99.999처럼 소수점 여러 자리 입력도 가능하며, 값은 0~100 사이로 자동 보정됩니다.' },
            { step: '빠른 선택 버튼', desc: '자주 사용하는 표준 SLA인 99%(투 나인)부터 99.999%(파이브 나인)까지 빠른 선택 버튼을 클릭하면 즉시 해당 값이 입력되고 결과가 자동 계산됩니다.' },
            { step: '결과 확인', desc: '연간·월간·주간·일간 4개 카드에 허용 다운타임이 시간·분·초 단위로 동시에 표시됩니다. 모바일에서도 스크롤 없이 한눈에 확인할 수 있습니다.' },
            { step: '공유하기', desc: '하단 공유 버튼으로 결과 링크를 복사해 팀원이나 클라이언트와 바로 공유하거나, SNS에 공유해 인프라 설계 논의의 기준값으로 활용할 수 있습니다.' },
          ],
          faqs: [
            { q: '쓰리 나인(99.9%)과 포 나인(99.99%)의 실제 차이는 얼마나 되나요?', a: '쓰리 나인(99.9%)은 연간 약 8시간 45분의 다운타임을 허용하고, 포 나인(99.99%)은 연간 약 52분만 허용합니다. 숫자로는 0.09%p 차이지만 실제 허용 시간은 약 10배 차이입니다. 결제·의료·금융처럼 중단이 곧 손실로 이어지는 서비스는 최소 포 나인(99.99%) 이상의 SLA를 요구하는 경우가 많습니다.' },
            { q: '계산에 사용되는 공식이 무엇인가요?', a: '허용 다운타임(초) = (100 - 가동률) / 100 × 기간(초) 공식을 사용합니다. 연간은 365.25일 × 24시간 × 3600초 = 31,557,600초 기준이며, 월간은 연간÷12, 주간은 연간÷52, 일간은 연간÷365.25로 계산합니다. JS 부동소수점 오류를 방지하기 위해 정밀도 보정 처리가 적용되어 있으며, 모든 계산은 브라우저에서만 수행됩니다.' },
            { q: 'SLA 100%는 현실적으로 가능한가요?', a: '현실적으로 100% SLA는 존재할 수 없습니다. 하드웨어 교체, OS 패치, 네트워크 유지보수 등 계획된 점검만으로도 다운타임이 발생하기 때문입니다. 상용 클라우드의 최고 수준은 파이브 나인(99.999%, 연간 약 5분 15초)이며, 이 수준 달성에도 다중화·자동 페일오버 등 상당한 인프라 투자가 필요합니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴의 계산 결과는 참고용으로만 제공됩니다. 실제 SLA 조건과 다운타임 정의는 각 서비스 제공사의 공식 문서를 반드시 확인하시기 바랍니다. 계약 협상이나 법적 판단에는 전문가 또는 공식 기관에 확인하시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is the SLA Uptime Calculator?',
          description: 'Three nines (99.9%), four nines (99.99%), five nines (99.999%) — these shorthand terms define the SLA tiers that separate good infrastructure from great infrastructure. While three nines allows roughly 8 hours and 45 minutes of downtime per year, four nines permits only about 52 minutes, and five nines a mere 5 minutes and 15 seconds. This calculator instantly converts any SLA uptime percentage into allowed downtime across four time periods: yearly, monthly, weekly, and daily — displayed simultaneously in hours, minutes, and seconds. It is an essential tool for comparing cloud vendor SLAs (AWS, GCP, Azure), reviewing contracts before signing with external providers, planning incident response strategies (RTO/RPO), and designing infrastructure architectures that meet availability targets. All calculations run entirely in your browser — no data is ever sent to any server, ensuring complete privacy.',
          useCases: [
            { icon: '☁️', title: 'Cloud Vendor Comparison', desc: 'Enter SLA percentages from AWS, GCP, Azure, and other cloud providers to compare their yearly allowed downtime side by side and choose the best fit for your business requirements.' },
            { icon: '📝', title: 'Contract Review & Negotiation', desc: 'Convert SLA clauses in vendor contracts into real-world downtime figures so you can assess business risk and prepare concrete negotiation benchmarks before signing.' },
            { icon: '🚨', title: 'Incident Response Planning', desc: 'Use monthly and weekly downtime allowances to schedule deployments, maintenance windows, and set realistic recovery time objectives (RTO) aligned with your SLA commitments.' },
            { icon: '🏗️', title: 'Infrastructure Architecture Design', desc: 'Determine the level of redundancy and failover required to meet your target uptime. Share the exact numbers — like "five nines means all maintenance must complete within 5 minutes 15 seconds yearly" — with your team to align on architecture decisions.' },
          ],
          steps: [
            { step: 'Enter SLA Value', desc: 'Type your SLA uptime percentage into the input field. You can enter values with multiple decimal places like 99.9, 99.99, or 99.999. Values are automatically clamped between 0 and 100.' },
            { step: 'Use Quick Select', desc: 'Click one of the four preset buttons — 99%, 99.9%, 99.99%, or 99.999% — to instantly fill in a standard SLA value and see results calculated in real time.' },
            { step: 'View Results', desc: 'Four cards display your allowed downtime for yearly, monthly, weekly, and daily periods simultaneously in hours, minutes, and seconds. Viewable at a glance on both desktop and mobile.' },
            { step: 'Share Results', desc: 'Use the sharing buttons at the bottom to copy the result link and share it with teammates or clients, or post it on social media to use as a reference point for infrastructure planning discussions.' },
          ],
          faqs: [
            { q: 'What is the actual difference between three nines and four nines uptime?', a: 'Three nines (99.9%) allows approximately 8 hours and 45 minutes of downtime per year, while four nines (99.99%) allows only about 52 minutes. Despite appearing as just a 0.09 percentage point difference, the actual allowed downtime differs by roughly 10x. Mission-critical services in payments, healthcare, and finance typically require at least four nines.' },
            { q: 'What formula does this calculator use?', a: 'Allowed downtime (seconds) = (100 - uptime%) / 100 × period (seconds). The yearly baseline uses 365.25 days × 24 hours × 3,600 seconds = 31,557,600 seconds. Monthly is yearly ÷ 12, weekly is yearly ÷ 52, and daily is yearly ÷ 365.25. Floating-point precision corrections are applied to prevent JavaScript rounding errors.' },
            { q: 'Is 100% SLA realistically achievable?', a: 'In practice, 100% SLA is not achievable. Even planned maintenance — hardware replacements, OS patches, network updates — introduces downtime. The highest commercial cloud tier is five nines (99.999%, about 5 minutes 15 seconds per year), and achieving even that requires significant investment in redundancy, automatic failover, and multi-region architecture.' },
            { q: 'Can I use this result as official data?', a: 'Results are for reference only. Please consult a professional or official source for accurate figures. Actual SLA conditions and downtime definitions vary by provider — always refer to the vendor\'s official documentation for contractual or legal purposes.' },
          ],
        }}
      />
    </div>
  );
}
