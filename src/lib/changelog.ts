// 사용자에게 보이는 업데이트 기록 — 첫 화면 전광판과 "이번 달 개선" 숫자가 여기서 나온다.
// 도구를 새로 만들거나 눈에 띄게 고치면 맨 위에 한 줄 추가한다 (docs/STRATEGY.md 기록과 함께).
// href 는 로케일 없는 도구 경로 (tools-registry 의 href).

export type ChangeType = 'new' | 'update' | 'fix';

export interface ChangeEntry {
  date: string; // YYYY-MM-DD (한국 시간)
  type: ChangeType;
  href: string;
  ko: string;
  en: string;
}

export const CHANGELOG: ChangeEntry[] = [
  { date: '2026-11-17', type: 'fix', href: '/utilities/productivity/excel-mapper', ko: '스마트 엑셀 매퍼 — 영어 화면 문구 추가', en: 'Smart Excel Mapper — full English interface' },
  { date: '2026-11-17', type: 'fix', href: '/utilities/productivity/world-time', ko: '세계 시간 — 화면 오류 수정', en: 'World Time — display glitch fixed' },
  { date: '2026-11-16', type: 'update', href: '/utilities/lifestyle/color-coordinator', ko: 'OOTD 컬러 코디네이터 — 옷 모양 18종·원피스·긴 머리', en: 'Outfit Color Coordinator — 18 garment shapes and dresses' },
  { date: '2026-11-16', type: 'update', href: '/utilities/lifestyle/color-coordinator', ko: 'OOTD 컬러 코디네이터 — 실사 마네킹·퍼스널 컬러·조합 점검', en: 'Outfit Color Coordinator — realistic mannequin and personal color' },
  { date: '2026-11-16', type: 'update', href: '/utilities/utility/wire-size-calc', ko: '전선 굵기 계산기 — 미국 NEC(AWG) 기준 추가', en: 'Wire Size Calculator — US NEC (AWG) mode' },
  { date: '2026-11-16', type: 'update', href: '/utilities/utility/piping-calc', ko: '배관 계산기 — 미국 단위·동관·PVC·마찰 손실', en: 'Piping Calculator — US units, copper, PVC and friction loss' },
  { date: '2026-11-16', type: 'update', href: '/utilities/utility/pyeong-calc', ko: '평수 계산기 — 평·㎡·ft² 환산표', en: 'Pyeong Converter — pyeong, m² and ft² table' },
  { date: '2026-11-16', type: 'update', href: '/utilities/utility/cable-tray-calc', ko: '케이블 트레이 — 현장 꺾기(V-컷) 가이드', en: 'Cable Tray Calculator — field bending guide' },
  { date: '2026-11-16', type: 'update', href: '/utilities/performance/core-web-vitals', ko: 'Core Web Vitals — 결과 해석 가이드', en: 'Core Web Vitals — how to read your results' },
  { date: '2026-10-25', type: 'update', href: '/utilities/design/tile-visualizer', ko: '욕실 타일 시뮬레이터 — 실사 렌더링(원근·반사·질감)', en: 'Bathroom Tile Visualizer — photo-real rendering' },
  { date: '2026-10-25', type: 'update', href: '/utilities/productivity/solar-master', ko: '태양광 계산기 — 발전사업 수익(SMP·REC) 탭', en: 'Solar Calculator — power business revenue tab' },
  { date: '2026-10-25', type: 'fix', href: '/utilities/utility/elbow-offset', ko: '배관 옵셋 계산기 — KS 엘보 규격으로 교체', en: 'Pipe Offset Calculator — KS elbow dimensions' },
  { date: '2026-10-25', type: 'fix', href: '/utilities/utility/piping-calc', ko: '배관 계산기 — 규격표 두께 오류 수정', en: 'Piping Calculator — schedule table corrections' },
  { date: '2026-10-25', type: 'fix', href: '/utilities/utility/interior-material-calc', ko: '타일·도배 계산기 — 지그재그 시공 수량 수정', en: 'Tile & Wallpaper Calculator — staggered layout count fixed' },
  { date: '2026-10-24', type: 'update', href: '/utilities/utility/wordle', ko: '한글 워들 — 자모 6칸 방식으로 개편', en: 'Korean Wordle — six-jamo board' },
  { date: '2026-10-24', type: 'fix', href: '/utilities/document/hwp-pdf-converter', ko: 'HWP 변환기 — 문서 전체 변환(기존 앞부분만)', en: 'HWP Converter — converts the whole document' },
  { date: '2026-10-24', type: 'update', href: '/utilities/finance/vat-calc', ko: '부가세 계산기 — 신고 예상·간이과세자', en: 'VAT Calculator — return estimate and simplified taxpayers' },
  { date: '2026-10-24', type: 'update', href: '/utilities/finance/tax-33-calc', ko: '3.3% 계산기 — 5월 종합소득세 환급 예상', en: '3.3% Tax Calculator — May refund estimate' },
  { date: '2026-10-24', type: 'update', href: '/utilities/lifestyle/ac-capacity-calc', ko: '에어컨 평형 계산기 — 제조사 냉방면적 기준', en: 'AC Size Calculator — manufacturer cooling-area basis' },
  { date: '2026-10-24', type: 'fix', href: '/utilities/utility/pyeong-calc', ko: '평수 계산기 — 평형 환산 오류 수정(84㎡ ≈ 34평형)', en: 'Pyeong Converter — apartment size class fixed' },
  { date: '2026-10-24', type: 'update', href: '/utilities/utility/metal-weight-calc', ko: '금속 중량 계산기 — 단면도 치수 표시', en: 'Metal Weight Calculator — dimensioned cross-sections' },
  { date: '2026-10-23', type: 'update', href: '/utilities/utility/wire-size-calc', ko: '전선 굵기 계산기 — KS C IEC 허용전류표로 개편', en: 'Wire Size Calculator — IEC ampacity tables' },
  { date: '2026-10-23', type: 'update', href: '/utilities/utility/cable-tray-calc', ko: '케이블 트레이 가공 계산기 — 전면 개편', en: 'Cable Tray Calculator — rebuilt' },
  { date: '2026-10-23', type: 'update', href: '/utilities/finance/salary-calc', ko: '연봉 실수령액 — 2026 간이세액표 반영', en: 'Salary Calculator — 2026 Korean tax table' },
];
