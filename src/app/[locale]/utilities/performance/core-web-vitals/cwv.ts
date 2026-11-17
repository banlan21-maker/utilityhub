// Core Web Vitals 판정 로직 (구글 공식 기준: web.dev/articles/vitals)
// 기준값은 그대로: LCP 2.5s/4s, INP 200ms/500ms, CLS 0.1/0.25 — '이하'는 Good, 상한 '초과'는 Poor

export type Rating = 'good' | 'needs' | 'poor';
export type MetricKey = 'lcp' | 'inp' | 'cls';
export type Device = 'mobile' | 'desktop';
export const METRIC_KEYS: MetricKey[] = ['lcp', 'inp', 'cls'];

export const METRICS: Record<MetricKey, { good: number; poor: number; decimals: number; unit: string; max: number; step: number }> = {
  lcp: { good: 2.5, poor: 4, decimals: 2, unit: 's', max: 6, step: 0.01 },
  inp: { good: 200, poor: 500, decimals: 0, unit: 'ms', max: 600, step: 1 },
  cls: { good: 0.1, poor: 0.25, decimals: 3, unit: '', max: 0.6, step: 0.001 },
};

export interface Parsed {
  /** 판정에 쓰는 값 (화면 표시 자릿수로 반올림) — 빈칸·잘못된 값이면 null */
  value: number | null;
  /** 단위를 자동으로 바꿨으면 원래 입력 */
  convertedFrom?: string;
  invalid?: boolean;
}

const round = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

/**
 * 입력 문자열 해석. "2.51", "2500ms", "2.5 s", "0.2s"(INP) 같은 값을 받는다.
 * - LCP: ms 단위이거나 100 이상이면 밀리초로 보고 초로 바꾼다 (PageSpeed Insights 붙여넣기 대비)
 * - INP: s 단위면 밀리초로 바꾼다
 * - 음수는 입력 단계에서 막히지만, 들어와도 0으로 본다
 */
export function parseMetric(key: MetricKey, raw: string): Parsed {
  const t = raw.trim().replace(/,/g, '');
  if (!t) return { value: null };
  const m = t.match(/^(-?\d*\.?\d+)\s*(ms|s)?$/i);
  if (!m) return { value: null, invalid: true };
  let v = Math.max(0, Number(m[1]));
  const unit = m[2]?.toLowerCase();
  let convertedFrom: string | undefined;
  if (key === 'lcp' && (unit === 'ms' || (!unit && v >= 100))) {
    convertedFrom = `${m[1]}ms`;
    v = v / 1000;
  } else if (key === 'inp' && unit === 's') {
    convertedFrom = `${m[1]}s`;
    v = v * 1000;
  }
  return { value: round(v, METRICS[key].decimals), convertedFrom };
}

export function rate(key: MetricKey, v: number): Rating {
  const { good, poor } = METRICS[key];
  if (v <= good) return 'good';
  if (v <= poor) return 'needs';
  return 'poor';
}

/** 화면 표시: LCP 소수 둘째 자리, INP 정수, CLS 소수 셋째 자리 — 판정에 쓴 값과 같은 자릿수 */
export function formatMetric(key: MetricKey, v: number): string {
  const { decimals, unit } = METRICS[key];
  return `${v.toFixed(decimals)}${unit}`;
}

export interface Assessment {
  values: Record<MetricKey, number | null>;
  ratings: Record<MetricKey, Rating | null>;
  /** 세 값이 모두 있을 때만 종합 판정 */
  overall: Rating | null;
  entered: number;
  passed: number;
}

export function assess(inputs: Record<MetricKey, string>): Assessment {
  const values = {} as Record<MetricKey, number | null>;
  const ratings = {} as Record<MetricKey, Rating | null>;
  for (const k of METRIC_KEYS) {
    const v = parseMetric(k, inputs[k]).value;
    values[k] = v;
    ratings[k] = v === null ? null : rate(k, v);
  }
  const rs = METRIC_KEYS.map((k) => ratings[k]);
  const entered = rs.filter(Boolean).length;
  const passed = rs.filter((r) => r === 'good').length;
  const overall = entered < 3 ? null : rs.includes('poor') ? 'poor' : passed === 3 ? 'good' : 'needs';
  return { values, ratings, overall, entered, passed };
}

/** 주소창 공유용: "2.51,201,0.101" */
export const encodeDevice = (v: Record<MetricKey, string>) => METRIC_KEYS.map((k) => v[k].trim()).join(',');
export function decodeDevice(s: string | null): Record<MetricKey, string> | null {
  if (!s) return null;
  const parts = s.split(',');
  if (parts.length !== 3) return null;
  const clean = (x: string) => x.replace(/[^0-9.]/g, '').slice(0, 10);
  return { lcp: clean(parts[0]), inp: clean(parts[1]), cls: clean(parts[2]) };
}
