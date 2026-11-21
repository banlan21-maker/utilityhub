'use client';

// 손익분기점·원가율 계산기 — 입력·계산 위젯만 (제목·설명·FAQ는 page.tsx 서버 렌더)
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import {
  AlertTriangle, ArrowRight, CheckCircle2, Copy, Download, FileSpreadsheet, HelpCircle, Info,
  Plus, Printer, RotateCcw, Scissors, Trash2, Upload, UtensilsCrossed, XCircle,
} from 'lucide-react';
import { ui } from '@/app/components/ui';
import {
  CURRENCIES, DEFAULT_TARGET, FIXED_KEYS, LIMITS, UNITS, averageCostRate, blankIngredient, blankMenu, breakEven,
  cleanNum, defaultData, exampleData, fixedTotal, ingredientCost, menuCost, newId, num, pricing,
  rateSuspicious, sanitize, stamp, toCsv,
  type Biz, type BreakEven, type Currency, type Data, type FixedCosts, type Ingredient, type Menu, type Unit,
} from '@/lib/menuCost';
import s from './menu-cost.module.css';

type Tab = 'cost' | 'price' | 'bep';
const TABS: Tab[] = ['cost', 'price', 'bep'];
const STORE_KEY = (lang: string) => `utilhub-menu-cost-${lang}`;

const T = {
  ko: {
    biz: { food: '식당·카페', beauty: '미용·뷰티' } as Record<Biz, string>,
    bizLabel: '업종',
    tabs: { cost: '① 원가 계산', price: '② 판매가·원가율', bep: '③ 손익분기점' } as Record<Tab, string>,
    next: { cost: '다음: ② 판매가·원가율', price: '다음: ③ 손익분기점' } as Partial<Record<Tab, string>>,
    taxBadge: '부가세 10% · 일반과세자 기준',
    example: '예시 불러오기', exFood: '식당 예시', exBeauty: '미용실 예시',
    confirmReplace: '지금 입력한 내용이 예시 데이터로 바뀝니다. 계속할까요?',
    item: { food: '메뉴', beauty: '시술' } as Record<Biz, string>,
    serving: { food: '1인분', beauty: '1회 시술' } as Record<Biz, string>,
    menuName: (b: Biz, n: number) => `${b === 'food' ? '메뉴' : '시술'} ${n}`,
    menuNameLabel: (b: Biz) => `${b === 'food' ? '메뉴' : '시술'} 이름`,
    addMenu: (b: Biz) => `${b === 'food' ? '메뉴' : '시술'} 추가`,
    copyMenu: '복사', deleteMenu: '삭제',
    confirmDelete: (n: string) => `"${n}"을(를) 삭제할까요?`,
    menuMax: `최대 ${LIMITS.menus}개까지 만들 수 있습니다.`,
    ingredients: '재료', ingName: '재료명', price: '구매가', qty: '구매 용량', amountUsed: (b: Biz) => `${b === 'food' ? '1인분' : '1회'} 사용량`,
    yieldL: '수율', ingCost: '재료비', addIng: '재료 추가', removeIng: '재료 삭제',
    units: { g: 'g', kg: 'kg', ml: 'ml', L: 'L', ea: '개' } as Record<Unit, string>,
    ingErr: {
      unit: '구매 단위와 사용 단위의 종류가 달라 계산할 수 없습니다 (예: kg ↔ 개). 같은 종류로 맞춰 주세요.',
      qty: '구매 용량을 넣어 주세요.',
      yield: '수율은 1~100% 사이로 넣어 주세요.',
    },
    extrasTitle: (b: Biz) => (b === 'food' ? '기타 비용 (1인분당)' : '소모품 (1회당)'),
    extrasHint: (b: Biz) => (b === 'food' ? '포장 용기, 일회용품, 소스, 반찬처럼 1인분마다 드는 돈' : '호일, 장갑, 솜, 샴푸처럼 1회 시술마다 드는 돈'),
    extraName: '항목', extraAmount: '1회당 금액', addExtra: '비용 추가', removeExtra: '항목 삭제',
    minutes: '시술 시간', minUnit: '분', laborRate: '시간당 인건비', laborHint: '원장님 본인 또는 디자이너의 1시간 몫 (모든 시술에 공통)',
    includeLabor: '원가에 시간 비용 포함', includeLaborHint: '켜면 ② 원가율·추천가에 시간 비용이 들어갑니다. 시간까지 넣으면 원가율이 크게 오르므로 목표 원가율도 함께 올려야 합니다.',
    manual: '원가 직접 입력', manualOn: '재료로 계산하기', manualCost: (b: Biz) => `${b === 'food' ? '1인분' : '1회'} 원가 (재료·소모품)`,
    manualHint: '재료를 하나씩 넣지 않고 원가를 알고 있을 때',
    sumIng: '재료비', sumExtras: (b: Biz) => (b === 'food' ? '기타 비용' : '소모품'),
    sumLabor: (m: string, r: string) => `시간 비용 (${m}분 × ${r})`,
    sumMaterial: '재료·소모품 원가', sumWithLabor: '시간 포함 원가',
    costOf: (b: Biz) => (b === 'food' ? '1인분 원가' : '시술 원가'),
    costErrors: (n: number) => `계산하지 못한 재료가 ${n}개 있습니다.`,
    table: { name: '메뉴', cost: '원가', price: '판매가', rate: '원가율' },
    tableName: (b: Biz) => (b === 'food' ? '메뉴' : '시술'),
    over: '목표 초과', under: '목표 이하',
    avgRow: '평균 (재료 기준)',
    tableHint: '빨간색은 목표 원가율보다 높은 항목입니다. 행을 누르면 그 항목으로 바뀝니다.',
    // ②
    costRow: '원가', fromCalc: '① 원가 계산 값', editManual: '직접 입력', useCalc: '계산 값 쓰기',
    sellPrice: '현재 판매가', taxIn: '부가세 포함', taxOut: '부가세 별도',
    priceHint: (inc: boolean) => (inc ? '메뉴판 가격 그대로 넣으세요. 계산할 때 부가세를 뺍니다.' : '부가세를 뺀 공급가로 계산합니다.'),
    target: '목표 원가율', targetHint: '업종·가게마다 다르니 내 가게에 맞게 조정하세요. 기본값(식당 33%, 미용 20%)은 흔히 쓰는 참고치일 뿐입니다.',
    fee: '결제·채널 수수료', feeHint: '카드·간편결제·배달앱 수수료. 부가세 제외 매출에 대한 % 로 계산합니다 (②·③ 공통).',
    rounding: '추천가 올림', roundNone: '올림 안 함', roundUnit: (u: string) => `${u} 단위`,
    nowRate: '현재 원가율', quick: (r: string, m: string) => `원가율 ${r} · 1개 팔 때 남는 돈 ${m}`, noPrice: '판매가를 넣으면 원가율이 나옵니다.', noCost: '원가가 0입니다. ①에서 재료를 넣거나 원가를 직접 입력하세요.',
    pGross: (inc: boolean) => (inc ? '판매가 (부가세 포함)' : '판매가 (부가세 별도)'), pTax: '부가세', pNet: '부가세 제외 판매가',
    pCost: '원가', pFee: (r: string) => `수수료 (${r}%)`, pProfit: '1개 팔 때 남는 돈',
    profitHint: '판매가 − 부가세 − 원가 − 수수료. 여기서 월세·인건비 같은 고정비를 갚습니다.',
    rec: '추천 판매가', recHow: (t: string, inc: boolean, u: string) => `원가 ÷ 목표 원가율 ${t}%${inc ? ' × 1.1(부가세)' : ''}${u ? ` → ${u} 단위 올림` : ''}`,
    applyRec: '이 가격으로 바꾸기',
    suspicious: '원가율이 100% 이상이거나 1% 미만입니다. 입력값(단위·판매가)을 확인하세요.',
    simTitle: '재료값이 오르면?', simLabel: (p: number) => `재료비 +${p}%`,
    simResult: (c: string, r: string) => `원가 ${c} → 원가율 ${r}`,
    simKeep: (p: string) => `목표 원가율을 지키려면 판매가 ${p}`,
    simNote: '재료·소모품 값만 올립니다 (시간 비용은 그대로).',
    simpleTax: '간이과세자는 부가세 계산 방식이 달라 결과와 차이가 납니다. 이 계산기는 일반과세자 기준입니다.',
    // ③
    fixedTitle: '월 고정비', fixedTotal: '월 고정비 합계',
    fixedL: {
      rent: '임대료', maintenance: '관리비', staff: '직원 인건비', owner: '사장님 본인 인건비',
      utilities: '공과금 (전기·가스·수도·통신)', interest: '대출 이자', other: '기타 (세무 기장료·보험·광고비 등)',
      equipment: '인테리어·장비 비용 (선택)', equipmentMonths: '나눠서 볼 기간',
    } as Record<keyof FixedCosts, string>,
    staffHint: '알바 급여가 궁금하면', staffLink: '알바 급여·주휴수당 계산기',
    ownerHint: '많은 분이 빠뜨리는 항목입니다. 비워 두면 "사장님이 무급으로 일해야 본전"이라는 뜻이 됩니다.',
    depHint: (v: string) => `한 달에 ${v}씩 비용으로 잡습니다 (감가상각).`,
    monthsUnit: '개월',
    salesTitle: '매출 구조',
    ticket: '평균 객단가', ticketHint: (inc: boolean) => (inc ? '결제 금액 그대로 넣으면 부가세를 빼고 계산합니다.' : '부가세를 뺀 금액입니다.'),
    costRate: '평균 원가율', crAuto: (n: number) => `메뉴 평균 (${n}개)`, crAutoNone: '메뉴 평균', crManual: '직접 입력',
    crAutoHint: '①·②에서 판매가까지 넣은 항목의 재료 원가율 평균입니다. 시간 비용은 고정비(인건비)에 있으므로 빼고 계산합니다.',
    crAutoEmpty: '판매가와 원가가 모두 있는 항목이 없습니다. 직접 입력하거나 ①·②를 채워 주세요.',
    days: '월 영업일수', dayUnit: '일', seats: (b: Biz) => (b === 'food' ? '좌석 수 (선택)' : '의자·베드 수 (선택)'),
    seatUnit: (b: Biz) => (b === 'food' ? '석' : '개'), targetProfit: '목표 월 순이익 (선택)',
    bepBig: (n: string) => `하루에 손님 ${n}명이 와야 본전입니다`,
    bepPeople: '명',
    bepSales: '손익분기점 월 매출 (부가세 제외)', bepMonth: '손익분기점 월 손님 수',
    variable: '변동비율 (원가율 + 수수료율)', contribution: '공헌이익률',
    turnover: (n: string) => `하루 필요 회전율: 좌석당 약 ${n}회`,
    targetLine: (p: string, n: string, sales: string) => `월 순이익 ${p}을 남기려면 하루 ${n} (월 매출 ${sales})`,
    needInput: '월 고정비, 객단가, 원가율, 영업일수를 넣으면 계산됩니다.',
    noMargin: '원가율과 수수료율을 합치면 100% 이상입니다. 손님이 늘수록 손해가 커지므로 가격이나 원가부터 다시 보세요.',
    chartTitle: '손님 수에 따른 매출과 비용', chartX: '하루 손님 수 (명)', chartRev: '매출', chartCost: '총비용 (고정비 + 변동비)',
    chartBep: (n: string) => `본전 ${n}명`, chartLoss: '손해', chartProfit: '이익',
    chartAria: (n: string, s: string) => `하루 손님 ${n}명, 월 매출 ${s}에서 매출선과 비용선이 만납니다.`,
    scTitle: '이렇게 바뀌면? (하루 목표 손님 수)', scHead: ['조건', '하루 손님', '지금과 차이'],
    scBase: '지금 입력값', scTicket: (d: string) => `객단가 ${d}`, scRate: (d: string) => `원가율 ${d}%p`, scRent: (d: string) => `임대료 ${d}%`,
    scNone: '본전 불가', people: (n: number) => `${n.toLocaleString('ko-KR')}명`,
    // 공통
    terms: {
      costRate: '원가율 = 원가 ÷ 판매가(부가세 제외). 12,000원(부가세 포함)짜리 메뉴의 원가가 3,600원이면 3,600 ÷ 10,909 = 33%입니다.',
      yield: '손질하고 버리는 부분을 뺀 실제 사용 비율입니다. 양파 껍질·꼭지로 10%를 버리면 90%를 넣으세요. 비워 두면 100%로 계산합니다.',
      contribution: '공헌이익률 = 1 − (원가율 + 수수료율). 매출 중 고정비를 갚는 데 쓸 수 있는 몫입니다. 60%면 1만원어치 팔 때 6천원이 월세·인건비를 메웁니다.',
      bep: '손익분기점은 이익도 손해도 없는 매출입니다. 월 고정비 ÷ 공헌이익률로 구하고, 객단가로 나누면 필요한 손님 수가 됩니다.',
      ticket: '손님 1명(1팀)이 한 번에 내는 평균 금액입니다. 한 달 매출 ÷ 결제 건수로 구할 수 있습니다.',
      target: '판매가 중 원가가 차지해도 되는 비율의 목표입니다. 목표가 낮을수록 추천 판매가가 올라갑니다.',
    },
    help: '설명 보기',
    saved: '이 기기에 자동 저장됨', saveBlocked: '이 브라우저는 저장이 막혀 있어 새로고침하면 사라집니다. 백업 파일로 내보내 두세요.',
    backup: '백업 내보내기', restore: '백업 불러오기', csv: '원가표 CSV', print: '원가표 인쇄', copy: '결과 복사', copied: '복사됨', reset: '모두 지우기',
    confirmRestore: '백업 파일의 내용으로 바꿉니다. 지금 입력한 내용은 사라집니다. 계속할까요?',
    confirmReset: '입력한 메뉴와 고정비를 모두 지웁니다. 계속할까요?',
    restored: '백업을 불러왔습니다.', restoreFail: '백업 파일을 읽을 수 없습니다. 이 계산기에서 내보낸 .json 파일인지 확인하세요.',
    copyText: (p: { fixed: string; ticket: string; rate: string; daily: string; target?: string }) =>
      `월 고정비 ${p.fixed}, 객단가 ${p.ticket}, 원가율 ${p.rate} → 하루 ${p.daily}명이 본전${p.target ? ` / ${p.target}` : ''}`,
    copyTarget: (p: string, n: string) => `월 순이익 ${p} 목표면 하루 ${n}명`,
    copyNoBep: '손익분기점을 계산할 수 있도록 ③의 값을 먼저 넣어 주세요.',
    bar: (r: string, d: string) => [`평균 원가율 ${r}`, `하루 목표 ${d}`],
    barNone: '—',
    disclaimer: '계산 결과는 참고용입니다. 세금, 계절 변동, 재고 손실 등은 반영되지 않았습니다. 중요한 결정은 세무사 등 전문가와 상의하세요.',
    printTitle: '메뉴 원가표', printMeta: (d: string, b: string) => `${d} · ${b} · 판매가는 부가세 포함 기준, 원가율은 부가세 제외 판매가 기준`,
    printMetaEx: (d: string, b: string) => `${d} · ${b} · 판매가는 부가세 별도 기준`,
    csvHead: ['구분', '메뉴', '재료비', '기타 비용', '시간 비용', '원가', '판매가', '부가세 제외 판매가', '원가율(%)', '1개 남는 돈'],
    csvDetailHead: ['구분', '메뉴', '재료·항목', '구매가', '구매 용량', '단위', '사용량', '단위', '수율(%)', '금액'],
    csvSummary: '요약', csvIng: '재료', csvExtra: '기타',
    currency: '통화', taxRate: '부가세율',
  },
  en: {
    biz: { food: 'Food & café', beauty: 'Salon & beauty' } as Record<Biz, string>,
    bizLabel: 'Business type',
    tabs: { cost: '① Cost', price: '② Price & cost ratio', bep: '③ Break-even' } as Record<Tab, string>,
    next: { cost: 'Next: ② Price & cost ratio', price: 'Next: ③ Break-even' } as Partial<Record<Tab, string>>,
    taxBadge: '',
    example: 'Load an example', exFood: 'Restaurant', exBeauty: 'Salon',
    confirmReplace: 'This replaces what you have entered with example data. Continue?',
    item: { food: 'item', beauty: 'service' } as Record<Biz, string>,
    serving: { food: 'per serving', beauty: 'per service' } as Record<Biz, string>,
    menuName: (b: Biz, n: number) => `${b === 'food' ? 'Item' : 'Service'} ${n}`,
    menuNameLabel: (b: Biz) => (b === 'food' ? 'Menu item name' : 'Service name'),
    addMenu: (b: Biz) => (b === 'food' ? 'Add item' : 'Add service'),
    copyMenu: 'Duplicate', deleteMenu: 'Delete',
    confirmDelete: (n: string) => `Delete "${n}"?`,
    menuMax: `You can create up to ${LIMITS.menus}.`,
    ingredients: 'Ingredients', ingName: 'Ingredient', price: 'Purchase price', qty: 'Pack size', amountUsed: (b: Biz) => (b === 'food' ? 'Used per serving' : 'Used per service'),
    yieldL: 'Yield', ingCost: 'Cost', addIng: 'Add ingredient', removeIng: 'Remove ingredient',
    units: { g: 'g', kg: 'kg', ml: 'ml', L: 'L', ea: 'ea' } as Record<Unit, string>,
    ingErr: {
      unit: 'The pack unit and the usage unit are different kinds (e.g. kg vs each), so the cost can’t be calculated.',
      qty: 'Enter the pack size.',
      yield: 'Yield must be between 1 and 100%.',
    },
    extrasTitle: (b: Biz) => (b === 'food' ? 'Other costs (per serving)' : 'Consumables (per service)'),
    extrasHint: (b: Biz) => (b === 'food' ? 'Packaging, disposables, sauces or sides that every serving uses' : 'Foil, gloves, cotton pads, shampoo used on every service'),
    extraName: 'Item', extraAmount: 'Amount each', addExtra: 'Add cost', removeExtra: 'Remove item',
    minutes: 'Service time', minUnit: 'min', laborRate: 'Labour cost per hour', laborHint: 'Your own or a stylist’s hourly cost (shared by all services)',
    includeLabor: 'Include time cost in the cost', includeLaborHint: 'When on, ② uses the time cost in the cost ratio and suggested price. Raise the target ratio too, because time pushes the ratio up a lot.',
    manual: 'Enter cost directly', manualOn: 'Calculate from ingredients', manualCost: (b: Biz) => (b === 'food' ? 'Cost per serving (materials)' : 'Cost per service (materials)'),
    manualHint: 'Use this when you already know the cost',
    sumIng: 'Ingredients', sumExtras: (b: Biz) => (b === 'food' ? 'Other costs' : 'Consumables'),
    sumLabor: (m: string, r: string) => `Time cost (${m} min × ${r}/h)`,
    sumMaterial: 'Material cost', sumWithLabor: 'Cost including time',
    costOf: (b: Biz) => (b === 'food' ? 'Cost per serving' : 'Cost per service'),
    costErrors: (n: number) => `${n} ingredient(s) could not be calculated.`,
    table: { name: 'Item', cost: 'Cost', price: 'Price', rate: 'Cost ratio' },
    tableName: (b: Biz) => (b === 'food' ? 'Item' : 'Service'),
    over: 'Above target', under: 'On target',
    avgRow: 'Average (materials)',
    tableHint: 'Red rows are above your target cost ratio. Tap a row to edit it.',
    costRow: 'Cost', fromCalc: 'from ① Cost', editManual: 'Enter directly', useCalc: 'Use calculated',
    sellPrice: 'Current menu price', taxIn: 'Tax included', taxOut: 'Before tax',
    priceHint: (inc: boolean) => (inc ? 'Enter the price on the menu; tax is taken out before the cost ratio.' : 'The price before sales tax / VAT.'),
    target: 'Target cost ratio', targetHint: 'Adjust it to your own business. The defaults (33% food, 20% salon) are common reference points only.',
    fee: 'Card / platform fees', feeHint: 'Card, payment and delivery-app fees, as a % of sales before tax (shared by ② and ③).',
    rounding: 'Round the suggested price', roundNone: 'No rounding', roundUnit: (u: string) => `to ${u}`,
    nowRate: 'Current cost ratio', quick: (r: string, m: string) => `Cost ratio ${r} · left per sale ${m}`, noPrice: 'Enter a price to see the cost ratio.', noCost: 'The cost is 0. Add ingredients in ① or enter the cost directly.',
    pGross: (inc: boolean) => (inc ? 'Price (tax included)' : 'Price (before tax)'), pTax: 'Sales tax / VAT', pNet: 'Price before tax',
    pCost: 'Cost', pFee: (r: string) => `Fees (${r}%)`, pProfit: 'Left over per sale',
    profitHint: 'Price − tax − cost − fees. This is what pays rent, wages and other fixed costs.',
    rec: 'Suggested price', recHow: (t: string, inc: boolean, u: string) => `Cost ÷ ${t}% target${inc ? ' × (1 + tax)' : ''}${u ? `, rounded up to ${u}` : ''}`,
    applyRec: 'Use this price',
    suspicious: 'The cost ratio is 100% or more, or under 1%. Check the units and the price.',
    simTitle: 'What if ingredient prices rise?', simLabel: (p: number) => `Materials +${p}%`,
    simResult: (c: string, r: string) => `Cost ${c} → cost ratio ${r}`,
    simKeep: (p: string) => `Price needed to keep your target: ${p}`,
    simNote: 'Only material costs rise (time cost stays the same).',
    simpleTax: '',
    fixedTitle: 'Monthly fixed costs', fixedTotal: 'Total fixed costs per month',
    fixedL: {
      rent: 'Rent', maintenance: 'Building / service charges', staff: 'Staff wages', owner: 'Your own pay (owner)',
      utilities: 'Utilities (power, gas, water, phone)', interest: 'Loan interest', other: 'Other (bookkeeping, insurance, ads…)',
      equipment: 'Fit-out & equipment cost (optional)', equipmentMonths: 'Spread over',
    } as Record<keyof FixedCosts, string>,
    staffHint: '', staffLink: '',
    ownerHint: 'The most commonly forgotten cost. Leaving it empty means you break even only by working for free.',
    depHint: (v: string) => `Counts ${v} a month as a cost (depreciation).`,
    monthsUnit: 'mo',
    salesTitle: 'Sales',
    ticket: 'Average spend per customer', ticketHint: (inc: boolean) => (inc ? 'The amount paid; tax is taken out.' : 'The amount before sales tax / VAT.'),
    costRate: 'Average cost ratio', crAuto: (n: number) => `Menu average (${n})`, crAutoNone: 'Menu average', crManual: 'Enter manually',
    crAutoHint: 'Average material cost ratio of items that have both a cost and a price. Time cost is left out because wages are already in fixed costs.',
    crAutoEmpty: 'No item has both a cost and a price yet. Enter a ratio or fill in ① and ②.',
    days: 'Trading days per month', dayUnit: 'days', seats: (b: Biz) => (b === 'food' ? 'Seats (optional)' : 'Chairs / beds (optional)'),
    seatUnit: () => '', targetProfit: 'Target monthly profit (optional)',
    bepBig: (n: string) => `You need ${n} customers a day to break even`,
    bepPeople: '',
    bepSales: 'Break-even sales per month (before tax)', bepMonth: 'Break-even customers per month',
    variable: 'Variable cost ratio (cost + fees)', contribution: 'Contribution margin',
    turnover: (n: string) => `Table turns needed: about ${n} per seat a day`,
    targetLine: (p: string, n: string, sales: string) => `For ${p} profit a month: ${n} customers a day (sales ${sales})`,
    needInput: 'Enter fixed costs, average spend, cost ratio and trading days to see the result.',
    noMargin: 'Cost ratio plus fees is 100% or more, so every extra customer loses money. Fix prices or costs first.',
    chartTitle: 'Sales vs. costs by customers a day', chartX: 'Customers per day', chartRev: 'Sales', chartCost: 'Total cost (fixed + variable)',
    chartBep: (n: string) => `Break-even ${n}`, chartLoss: 'Loss', chartProfit: 'Profit',
    chartAria: (n: string, s: string) => `Sales and total cost lines cross at ${n} customers a day, ${s} a month.`,
    scTitle: 'What if…? (customers needed a day)', scHead: ['Change', 'Per day', 'vs. now'],
    scBase: 'Current inputs', scTicket: (d: string) => `Average spend ${d}`, scRate: (d: string) => `Cost ratio ${d} pts`, scRent: (d: string) => `Rent ${d}%`,
    scNone: 'No break-even', people: (n: number) => n.toLocaleString('en-US'),
    terms: {
      costRate: 'Cost ratio = cost ÷ price before tax. A dish that costs $2.40 to make and sells for $8.00 before tax has a 30% cost ratio.',
      yield: 'The share you actually use after trimming. If peeling and trimming loses 10% of an onion, enter 90%. Empty means 100%.',
      contribution: 'Contribution margin = 1 − (cost ratio + fee ratio): the share of each sale left to pay fixed costs. At 60%, every $10 of sales covers $6 of rent and wages.',
      bep: 'Break-even is the sales level with neither profit nor loss: fixed costs ÷ contribution margin. Divide by average spend to get customers.',
      ticket: 'The average amount one customer (or table) pays. Monthly sales ÷ number of payments.',
      target: 'The share of the price you are willing to spend on cost. A lower target means a higher suggested price.',
    },
    help: 'Explain',
    saved: 'Saved on this device automatically', saveBlocked: 'Storage is blocked in this browser, so your data will be lost on reload. Export a backup file.',
    backup: 'Export backup', restore: 'Import backup', csv: 'Cost sheet CSV', print: 'Print cost sheet', copy: 'Copy result', copied: 'Copied', reset: 'Clear all',
    confirmRestore: 'Replace everything with the backup file? Your current inputs will be lost.',
    confirmReset: 'Clear all items and fixed costs?',
    restored: 'Backup imported.', restoreFail: 'Could not read that file. Use a .json file exported from this calculator.',
    copyText: (p: { fixed: string; ticket: string; rate: string; daily: string; target?: string }) =>
      `Fixed costs ${p.fixed}/month, average spend ${p.ticket}, cost ratio ${p.rate} → break even at ${p.daily} customers a day${p.target ? ` / ${p.target}` : ''}`,
    copyTarget: (p: string, n: string) => `${n} a day for ${p} monthly profit`,
    copyNoBep: 'Fill in ③ first so the break-even point can be calculated.',
    bar: (r: string, d: string) => [`Avg cost ratio ${r}`, `Break-even ${d}/day`],
    barNone: '—',
    disclaimer: 'For reference only. Taxes, seasonality and stock losses are not included. Talk to an accountant before making major decisions.',
    printTitle: 'Menu cost sheet', printMeta: (d: string, b: string) => `${d} · ${b} · prices include tax; cost ratio uses price before tax`,
    printMetaEx: (d: string, b: string) => `${d} · ${b} · prices before tax`,
    csvHead: ['Type', 'Item', 'Ingredients', 'Other costs', 'Time cost', 'Cost', 'Price', 'Price before tax', 'Cost ratio (%)', 'Left over per sale'],
    csvDetailHead: ['Type', 'Item', 'Ingredient / cost', 'Purchase price', 'Pack size', 'Unit', 'Used', 'Unit', 'Yield (%)', 'Amount'],
    csvSummary: 'Summary', csvIng: 'Ingredient', csvExtra: 'Other',
    currency: 'Currency', taxRate: 'Sales tax / VAT',
  },
};
type Strings = typeof T.ko;

/* ── 작은 부품 ── */
const withCommas = (v: string) => {
  if (!v) return v;
  const [i, d] = v.split('.');
  const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return d === undefined ? int : `${int}.${d}`;
};

function Help({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={s.helpBtn} aria-expanded={open} aria-label={label} title={label} onClick={() => setOpen((o) => !o)}>
        <HelpCircle aria-hidden />
      </button>
      {open && <span className={s.helpText} role="note">{text}</span>}
    </>
  );
}

interface NumProps {
  id: string; label: ReactNode; value: string; onChange: (v: string) => void;
  unit?: string; hint?: ReactNode; decimals?: number; maxInt?: number; help?: ReactNode;
  placeholder?: string; commas?: boolean; invalid?: boolean; large?: boolean;
}
function NumField({ id, label, value, onChange, unit, hint, decimals = 0, maxInt = 12, help, placeholder, commas = true, invalid, large }: NumProps) {
  return (
    <div className={ui.field}>
      <div className={s.labelRow}>
        <label className={ui.label} htmlFor={id}>{label}</label>
        {help}
      </div>
      <div className={ui.inputGroup}>
        <input id={id} className={`${ui.input} ${large ? ui.inputLg : ''}`} inputMode={decimals ? 'decimal' : 'numeric'} autoComplete="off"
          value={commas ? withCommas(value) : value} placeholder={placeholder} aria-invalid={invalid || undefined}
          onChange={(e) => onChange(cleanNum(e.target.value, decimals, maxInt))} />
        {unit && <span className={ui.unit}>{unit}</span>}
      </div>
      {hint && <span className={ui.hint}>{hint}</span>}
    </div>
  );
}

function Radio<V extends string | boolean | number>({ value, options, onChange, label }: {
  value: V; options: { v: V; label: ReactNode }[]; onChange: (v: V) => void; label: string;
}) {
  return (
    <div className={ui.segmented} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.v)} type="button" role="radio" aria-checked={value === o.v}
          className={`${ui.segment} ${value === o.v ? ui.segmentActive : ''}`} onClick={() => onChange(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const niceCeil = (v: number) => {
  if (v <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * mag >= v - 1e-9) return m * mag;
  return 10 * mag;
};

/* ── 손익분기 그래프 (SVG) ── */
function Chart({ fixed, ticket, variable, days, dailyExact, targetDaily, L, axis, money }: {
  fixed: number; ticket: number; variable: number; days: number; dailyExact: number; targetDaily: number | null;
  L: Pick<Strings, 'chartAria' | 'chartX' | 'chartBep' | 'chartLoss' | 'chartProfit'>; axis: (n: number) => string; money: (n: number) => string;
}) {
  const W = 640, H = 300, P = { l: 58, r: 14, t: 16, b: 46 };
  const maxX = niceCeil(Math.max(10, dailyExact * 2, (targetDaily ?? 0) * 1.25));
  const rev = (n: number) => ticket * n * days;
  const cost = (n: number) => fixed + variable * ticket * n * days;
  const maxY = niceCeil(Math.max(rev(maxX), cost(maxX)));
  const x = (n: number) => P.l + (n / maxX) * (W - P.l - P.r);
  const y = (v: number) => H - P.b - (v / maxY) * (H - P.t - P.b);
  const be = dailyExact;
  const xt = Array.from({ length: 6 }, (_, i) => (maxX / 5) * i);
  const yt = Array.from({ length: 5 }, (_, i) => (maxY / 4) * i);
  const pt = (n: number, v: number) => `${x(n).toFixed(1)},${y(v).toFixed(1)}`;
  const fmtN = (n: number) => (Number.isInteger(n) ? n.toLocaleString() : n.toFixed(1));
  const labelLeft = x(be) > W * 0.62;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.chart} role="img" aria-label={L.chartAria(String(Math.ceil(be - 1e-9)), money(rev(be)))}>
      {yt.map((v) => (
        <g key={`y${v}`}>
          <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} className={s.grid} />
          <text x={P.l - 6} y={y(v) + 4} textAnchor="end" className={s.axisText}>{axis(v)}</text>
        </g>
      ))}
      {xt.map((n) => (
        <text key={`x${n}`} x={x(n)} y={H - P.b + 18} textAnchor="middle" className={s.axisText}>{fmtN(n)}</text>
      ))}
      <text x={(P.l + W - P.r) / 2} y={H - 6} textAnchor="middle" className={s.axisTitle}>{L.chartX}</text>
      <polygon points={`${pt(0, cost(0))} ${pt(be, cost(be))} ${pt(0, 0)}`} className={s.lossArea} />
      <polygon points={`${pt(be, rev(be))} ${pt(maxX, rev(maxX))} ${pt(maxX, cost(maxX))}`} className={s.profitArea} />
      <line x1={x(0)} y1={y(cost(0))} x2={x(maxX)} y2={y(cost(maxX))} className={s.costLine} />
      <line x1={x(0)} y1={y(0)} x2={x(maxX)} y2={y(rev(maxX))} className={s.revLine} />
      <line x1={x(be)} x2={x(be)} y1={y(rev(be))} y2={H - P.b} className={s.beGuide} />
      <circle cx={x(be)} cy={y(rev(be))} r={6} className={s.beDot} />
      <text x={x(be) + (labelLeft ? -10 : 10)} y={y(rev(be)) - 10} textAnchor={labelLeft ? 'end' : 'start'} className={s.beText}>
        {L.chartBep(String(Math.ceil(be - 1e-9)))}
      </text>
      <text x={x(be * 0.35)} y={y((cost(be * 0.35) + rev(be * 0.35)) / 2) + 4} textAnchor="middle" className={s.lossText}>{L.chartLoss}</text>
      <text x={x(be + (maxX - be) * 0.75)} y={y((cost(be + (maxX - be) * 0.75) + rev(be + (maxX - be) * 0.75)) / 2) + 4} textAnchor="middle" className={s.profitText}>{L.chartProfit}</text>
    </svg>
  );
}

/* ── 본체 ── */
export default function MenuCostClient() {
  const lang = useLocale() === 'ko' ? 'ko' : 'en';
  const isKo = lang === 'ko';
  const L = T[lang];
  const [data, setData] = useState<Data>(() => defaultData(lang, L.menuName('food', 1)));
  const [tab, setTab] = useState<Tab>('cost');
  const [store, setStore] = useState<'ok' | 'blocked' | null>(null);
  const [flash, setFlash] = useState<{ tone: 'green' | 'red'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [sim, setSim] = useState(10);
  const [printing, setPrinting] = useState(false);
  const [toolVisible, setToolVisible] = useState(false);
  const loaded = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* 저장 복원 (마운트 후 한 번) */
  useEffect(() => {
    let raw: string | null = null;
    let blocked = false;
    try { raw = localStorage.getItem(STORE_KEY(lang)); } catch { blocked = true; }
    let restored: Data | null = null;
    if (raw) {
      try { restored = sanitize(JSON.parse(raw), defaultData(lang, T[lang].menuName('food', 1))); } catch { /* 깨진 저장값은 무시 */ }
    }
    void Promise.resolve().then(() => {
      if (restored) setData(restored);
      setStore(blocked ? 'blocked' : 'ok');
      loaded.current = true;
    });
  }, [lang]);

  /* 자동 저장 */
  useEffect(() => {
    if (!loaded.current) return;
    let ok = true;
    try { localStorage.setItem(STORE_KEY(lang), JSON.stringify(data)); } catch { ok = false; }
    void Promise.resolve().then(() => setStore(ok ? 'ok' : 'blocked'));
  }, [data, lang]);

  /* 하단 요약 막대: 도구가 화면에 보일 때만 */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !rootRef.current) return;
    const io = new IntersectionObserver(([e]) => setToolVisible(e.isIntersecting), { rootMargin: '0px 0px -120px 0px' });
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, []);

  /* 원가표 인쇄: 인쇄용 표를 body 바로 아래에 붙이고 나머지는 숨긴다 */
  useEffect(() => {
    if (!printing) return;
    const body = document.body;
    body.setAttribute('data-mc-print', '');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      body.removeAttribute('data-mc-print');
      window.removeEventListener('afterprint', finish);
      setPrinting(false);
    };
    window.addEventListener('afterprint', finish);
    const t = window.setTimeout(() => { window.print(); window.setTimeout(finish, 500); }, 50);
    return () => { window.clearTimeout(t); };
  }, [printing]);

  const say = (tone: 'green' | 'red', text: string) => {
    setFlash({ tone, text });
    window.setTimeout(() => setFlash((f) => (f?.text === text ? null : f)), 4000);
  };

  /* ── 값 ── */
  const cur: Currency = isKo ? 'KRW' : data.currency;
  const info = CURRENCIES[cur];
  const taxRate = isKo ? 10 : num(data.taxRate);
  const hasTax = taxRate > 0;
  const priceInc = hasTax && data.priceIncludesTax;
  const laborRate = num(data.laborRate);
  const target = num(data.targetRate);
  const feeRate = num(data.feeRate);
  const roundUnit = data.rounding === 0 ? 0 : info.rounding[data.rounding - 1];
  const biz = data.biz;
  const active = data.menus.find((m) => m.id === data.activeId) ?? data.menus[0];

  const money = (n: number) => {
    const sign = n < 0 ? '−' : '';
    const a = Math.abs(n);
    if (isKo) return `${sign}${Math.round(a).toLocaleString('ko-KR')}원`;
    return `${sign}${info.symbol}${a.toLocaleString('en-US', { minimumFractionDigits: info.decimals, maximumFractionDigits: info.decimals })}`;
  };
  const moneyShort = (n: number) => {
    if (!isKo) return money(n);
    if (Math.abs(n) >= 10000) return `${(Math.round(n / 1000) / 10).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만원`;
    return money(n);
  };
  const axis = (n: number) => {
    if (n === 0) return '0';
    if (isKo) return n >= 1e8 ? `${(n / 1e8).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}억` : `${Math.round(n / 1e4).toLocaleString('ko-KR')}만`;
    return `${info.symbol}${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)}`;
  };
  const pct = (r: number | null) => (r === null || !Number.isFinite(r) ? '—' : `${(r * 100).toFixed(1)}%`);
  const curUnit = isKo ? '원' : info.symbol;
  const unitStr = (u: number) => (isKo ? `${u.toLocaleString('ko-KR')}원` : `${info.symbol}${u}`);

  const costs = useMemo(() => new Map(data.menus.map((m) => [m.id, menuCost(m, biz, laborRate, data.includeLabor)])), [data.menus, biz, laborRate, data.includeLabor]);
  const priceOf = (m: Menu) => pricing({
    cost: costs.get(m.id)?.total ?? 0, price: num(m.price), priceIncludesTax: priceInc, taxRate,
    targetRate: target, feeRate, roundUnit, decimals: info.decimals,
  });
  const activeCost = costs.get(active.id)!;
  const activePricing = priceOf(active);
  const avg = useMemo(() => averageCostRate({ ...data, taxRate: String(taxRate), priceIncludesTax: priceInc }), [data, taxRate, priceInc]);

  const fixed = fixedTotal(data.fixed);
  const ticketIn = num(data.ticket);
  const ticketNet = data.ticketIncludesTax && hasTax ? ticketIn / (1 + taxRate / 100) : ticketIn;
  const usedRate = data.costRateMode === 'manual' ? num(data.manualCostRate) / 100 : avg.rate;
  const days = num(data.days);
  const seats = num(data.seats);
  const targetProfit = num(data.targetProfit);
  const beFor = (o: { fixed?: number; ticket?: number; rate?: number }): BreakEven => breakEven({
    fixed: o.fixed ?? fixed.total,
    ticket: o.ticket ?? ticketNet,
    costRate: o.rate ?? usedRate ?? -1,
    feeRate: feeRate / 100, days, seats, targetProfit,
  });
  const be = beFor({});

  /* ── 갱신 ── */
  const update = (fn: (d: Data) => Data) => setData((d) => fn(d));
  const set = <K extends keyof Data>(k: K, v: Data[K]) => update((d) => ({ ...d, [k]: v }));
  const updateMenu = (id: string, fn: (m: Menu) => Menu) => update((d) => ({ ...d, menus: d.menus.map((m) => (m.id === id ? fn(m) : m)) }));
  const updateActive = (fn: (m: Menu) => Menu) => updateMenu(active.id, fn);
  const setIng = (iid: string, patch: Partial<Ingredient>) => updateActive((m) => ({
    ...m, ingredients: m.ingredients.map((i) => (i.id === iid ? { ...i, ...patch } : i)),
  }));
  const setFixed = (k: keyof FixedCosts, v: string) => update((d) => ({ ...d, fixed: { ...d.fixed, [k]: v } }));

  const changeBiz = (b: Biz) => update((d) => ({
    ...d, biz: b,
    targetRate: d.targetRate === DEFAULT_TARGET[d.biz] || d.targetRate === '' ? DEFAULT_TARGET[b] : d.targetRate,
  }));
  const addMenu = () => {
    if (data.menus.length >= LIMITS.menus) { say('red', L.menuMax); return; }
    const id = newId('m');
    update((d) => ({ ...d, menus: [...d.menus, blankMenu(id, L.menuName(d.biz, d.menus.length + 1), newId('i'))], activeId: id }));
  };
  const copyMenu = () => {
    if (data.menus.length >= LIMITS.menus) { say('red', L.menuMax); return; }
    const id = newId('m');
    const copy: Menu = {
      ...active, id, name: `${active.name} (2)`.slice(0, LIMITS.name),
      ingredients: active.ingredients.map((i) => ({ ...i, id: newId('i') })),
      extras: active.extras.map((e) => ({ ...e, id: newId('e') })),
    };
    update((d) => {
      const at = d.menus.findIndex((m) => m.id === active.id);
      const menus = [...d.menus];
      menus.splice(at + 1, 0, copy);
      return { ...d, menus, activeId: id };
    });
  };
  const deleteMenu = () => {
    if (!window.confirm(L.confirmDelete(active.name || L.item[biz]))) return;
    update((d) => {
      const rest = d.menus.filter((m) => m.id !== active.id);
      const menus = rest.length ? rest : [blankMenu(newId('m'), L.menuName(d.biz, 1), newId('i'))];
      const at = Math.min(d.menus.findIndex((m) => m.id === active.id), menus.length - 1);
      return { ...d, menus, activeId: menus[Math.max(0, at)].id };
    });
  };
  /** 구매 단위를 바꾸면 사용 단위를 같은 종류의 작은 단위로 맞춰 준다 (kg → g) */
  const changeUnit = (i: Ingredient, u: Unit) => {
    const small: Record<Unit, Unit> = { g: 'g', kg: 'g', ml: 'ml', L: 'ml', ea: 'ea' };
    const sameKind = small[u] === small[i.useUnit];
    setIng(i.id, { unit: u, useUnit: sameKind ? i.useUnit : small[u] });
  };

  /** 사용자가 뭔가 입력했는지 (예시로 덮어쓰기 전에 물어볼지) */
  const isDirty = () =>
    data.menus.length > 1
    || data.menus.some((m) => m.price || m.manualCost || m.minutes || m.extras.length || m.ingredients.some((i) => i.name || i.price || i.qty || i.use))
    || FIXED_KEYS.some((k) => data.fixed[k]) || !!data.fixed.equipment || !!data.ticket || !!data.targetProfit;
  const loadExample = (b: Biz) => {
    if (isDirty() && !window.confirm(L.confirmReplace)) return;
    setData((d) => exampleData(b, d, lang));
    setTab('cost');
  };
  const reset = () => {
    if (!window.confirm(L.confirmReset)) return;
    setData((d) => ({ ...defaultData(lang, L.menuName(d.biz, 1)), biz: d.biz, targetRate: DEFAULT_TARGET[d.biz], currency: d.currency, taxRate: d.taxRate }));
    setTab('cost');
  };

  /* ── 내보내기 ── */
  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const exportBackup = () => {
    const payload = { app: 'theutilhub-menu-cost', v: 1, savedAt: new Date().toISOString(), data };
    download(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `menu-cost-backup-${stamp()}.json`);
  };
  const importBackup = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('too big');
      const parsed = JSON.parse(await file.text());
      const raw = parsed && typeof parsed === 'object' && 'data' in parsed ? parsed.data : parsed;
      if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { menus?: unknown }).menus)) throw new Error('shape');
      if (!window.confirm(L.confirmRestore)) return;
      setData(sanitize(raw, defaultData(lang, L.menuName('food', 1))));
      setTab('cost');
      say('green', L.restored);
    } catch {
      say('red', L.restoreFail);
    }
  };
  const r2 = (n: number) => Math.round(n * 10 ** info.decimals) / 10 ** info.decimals;
  const exportCsv = () => {
    const rows: (string | number)[][] = [L.csvHead];
    for (const m of data.menus) {
      const c = costs.get(m.id)!;
      const p = priceOf(m);
      rows.push([L.csvSummary, m.name, r2(c.manual ? c.material : c.ingredients), r2(c.extras), r2(c.labor), r2(c.total), r2(num(m.price)), r2(p.net),
        p.costRate === null ? '' : Math.round(p.costRate * 1000) / 10, num(m.price) > 0 ? r2(p.profit) : '']);
    }
    rows.push([]);
    rows.push(L.csvDetailHead);
    for (const m of data.menus) {
      if (m.costMode === 'calc') {
        for (const i of m.ingredients) {
          const r = ingredientCost(i);
          if (r.empty && !i.name) continue;
          rows.push([L.csvIng, m.name, i.name, num(i.price), num(i.qty), L.units[i.unit], num(i.use), L.units[i.useUnit], i.yieldPct ? num(i.yieldPct) : 100, r.error ? '' : r2(r.cost)]);
        }
        for (const e of m.extras) rows.push([L.csvExtra, m.name, e.name, '', '', '', '', '', '', r2(num(e.amount))]);
      }
    }
    download(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }), `menu-cost-${stamp()}.csv`);
  };
  const copyResult = async () => {
    if (!be.ok || usedRate === null) { say('red', L.copyNoBep); return; }
    const text = L.copyText({
      fixed: moneyShort(fixed.total), ticket: money(ticketNet), rate: pct(usedRate),
      daily: be.daily.toLocaleString(isKo ? 'ko-KR' : 'en-US'),
      target: be.target ? L.copyTarget(moneyShort(targetProfit), be.target.daily.toLocaleString(isKo ? 'ko-KR' : 'en-US')) : undefined,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { say('green', text); }
  };

  /* ── 화면 조각 ── */
  const menuChips = (
    <div className={s.menuBar}>
      <div className={s.menuChips} role="listbox" aria-label={L.tableName(biz)}>
        {data.menus.map((m) => {
          const p = priceOf(m);
          const overT = p.costRate !== null && target > 0 && p.costRate > target / 100;
          return (
            <button key={m.id} type="button" role="option" aria-selected={m.id === active.id}
              className={`${ui.chip} ${m.id === active.id ? ui.chipActive : ''} ${overT ? s.chipOver : ''}`}
              onClick={() => set('activeId', m.id)}>
              {m.name || L.item[biz]}
            </button>
          );
        })}
        <button type="button" className={`${ui.chip} ${s.addChip}`} onClick={addMenu}><Plus aria-hidden />{L.addMenu(biz)}</button>
      </div>
    </div>
  );

  const menuTable = (
    <div className={`${ui.card} ${s.card}`}>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">{L.tableName(biz)}</th><th scope="col">{L.table.cost}</th>
              <th scope="col">{L.table.price}</th><th scope="col">{L.table.rate}</th>
            </tr>
          </thead>
          <tbody>
            {data.menus.map((m) => {
              const c = costs.get(m.id)!;
              const p = priceOf(m);
              const overT = p.costRate !== null && target > 0 && p.costRate > target / 100;
              return (
                <tr key={m.id} className={`${m.id === active.id ? s.rowActive : ''} ${overT ? s.rowOver : ''}`}>
                  <td><button type="button" className={s.rowBtn} onClick={() => set('activeId', m.id)}>{m.name || L.item[biz]}</button></td>
                  <td>{c.total > 0 ? money(c.total) : '—'}</td>
                  <td>{num(m.price) > 0 ? money(num(m.price)) : '—'}</td>
                  <td className={p.costRate === null ? '' : overT ? s.bad : s.good}>
                    {pct(p.costRate)}{overT && <span className={s.srOnly}> ({L.over})</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {avg.rate !== null && (
            <tfoot>
              <tr><th scope="row" colSpan={3}>{L.avgRow}</th><td>{pct(avg.rate)}</td></tr>
            </tfoot>
          )}
        </table>
      </div>
      <p className={ui.hint}>{L.tableHint}</p>
    </div>
  );

  const nextBtn = (t: Tab) => L.next[t] && (
    <button type="button" className={`${ui.button} ${ui.primary} ${s.nextBtn}`} onClick={() => {
      setTab(TABS[TABS.indexOf(t) + 1]);
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }}>
      {L.next[t]}<ArrowRight aria-hidden />
    </button>
  );

  /* ① 원가 계산 */
  const costTab = (
    <div className={s.cols}>
      <section className={`${ui.card} ${s.card}`} aria-label={L.tabs.cost}>
        <div className={s.menuHead}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="mc-name">{L.menuNameLabel(biz)}</label>
            <input id="mc-name" className={`${ui.input} ${ui.inputLg}`} maxLength={LIMITS.name} value={active.name}
              onChange={(e) => updateActive((m) => ({ ...m, name: e.target.value }))} />
          </div>
          <div className={s.menuActions}>
            <button type="button" className={`${ui.button} ${ui.ghost} ${ui.sm}`} onClick={copyMenu}><Copy aria-hidden />{L.copyMenu}</button>
            <button type="button" className={`${ui.button} ${ui.ghost} ${ui.sm}`} onClick={deleteMenu}><Trash2 aria-hidden />{L.deleteMenu}</button>
          </div>
        </div>

        {active.costMode === 'manual' ? (
          <>
            <NumField id="mc-manual" label={L.manualCost(biz)} value={active.manualCost} unit={curUnit} decimals={info.decimals} large
              hint={L.manualHint} onChange={(v) => updateActive((m) => ({ ...m, manualCost: v }))} />
            <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm} ${s.alignStart}`}
              onClick={() => updateActive((m) => ({ ...m, costMode: 'calc' }))}>{L.manualOn}</button>
          </>
        ) : (
          <>
            <div className={s.subHead}>
              <h3 className={s.subTitle}>{L.ingredients}</h3>
              <button type="button" className={`${ui.button} ${ui.ghost} ${ui.sm}`} onClick={() => updateActive((m) => ({ ...m, costMode: 'manual' }))}>{L.manual}</button>
            </div>
            <div className={s.ings}>
              {active.ingredients.map((i, idx) => {
                const r = ingredientCost(i);
                const base = `mc-i${idx}`;
                return (
                  <div key={i.id} className={`${s.ing} ${r.error ? s.ingErr : ''}`}>
                    <div className={s.ingTop}>
                      <input className={ui.input} aria-label={`${L.ingName} ${idx + 1}`} placeholder={L.ingName} maxLength={LIMITS.name}
                        value={i.name} onChange={(e) => setIng(i.id, { name: e.target.value })} />
                      <span className={s.ingCost} aria-label={L.ingCost}>{r.error ? '—' : money(r.cost)}</span>
                      <button type="button" className={s.iconBtn} aria-label={`${L.removeIng}: ${i.name || idx + 1}`}
                        onClick={() => updateActive((m) => ({ ...m, ingredients: m.ingredients.filter((x) => x.id !== i.id) }))}>
                        <Trash2 aria-hidden />
                      </button>
                    </div>
                    <div className={s.ingGrid}>
                      <label className={s.mini} htmlFor={`${base}p`}>
                        <span>{L.price}</span>
                        <div className={ui.inputGroup}>
                          <input id={`${base}p`} className={`${ui.input} ${s.miniInput}`} inputMode="decimal" autoComplete="off" value={withCommas(i.price)}
                            onChange={(e) => setIng(i.id, { price: cleanNum(e.target.value, info.decimals) })} />
                          <span className={`${ui.unit} ${s.miniUnit}`}>{curUnit}</span>
                        </div>
                      </label>
                      <div className={s.mini}>
                        <label htmlFor={`${base}q`}>{L.qty}</label>
                        <div className={s.pair}>
                          <input id={`${base}q`} className={ui.input} inputMode="decimal" autoComplete="off" value={withCommas(i.qty)}
                            aria-invalid={r.error === 'qty' || undefined}
                            onChange={(e) => setIng(i.id, { qty: cleanNum(e.target.value, 3) })} />
                          <select className={ui.input} aria-label={`${L.qty} ${isKo ? '단위' : 'unit'}`} value={i.unit} onChange={(e) => changeUnit(i, e.target.value as Unit)}>
                            {UNITS.map((u) => <option key={u} value={u}>{L.units[u]}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className={s.mini}>
                        <label htmlFor={`${base}u`}>{L.amountUsed(biz)}</label>
                        <div className={s.pair}>
                          <input id={`${base}u`} className={ui.input} inputMode="decimal" autoComplete="off" value={withCommas(i.use)}
                            onChange={(e) => setIng(i.id, { use: cleanNum(e.target.value, 3) })} />
                          <select className={ui.input} aria-label={`${L.amountUsed(biz)} ${isKo ? '단위' : 'unit'}`} value={i.useUnit}
                            aria-invalid={r.error === 'unit' || undefined}
                            onChange={(e) => setIng(i.id, { useUnit: e.target.value as Unit })}>
                            {UNITS.map((u) => <option key={u} value={u}>{L.units[u]}</option>)}
                          </select>
                        </div>
                      </div>
                      <label className={s.mini} htmlFor={`${base}y`}>
                        <span className={s.labelRow}>{L.yieldL}{idx === 0 && <Help text={L.terms.yield} label={`${L.yieldL} ${L.help}`} />}</span>
                        <div className={ui.inputGroup}>
                          <input id={`${base}y`} className={`${ui.input} ${s.miniInput}`} inputMode="decimal" autoComplete="off" placeholder="100" value={i.yieldPct}
                            aria-invalid={r.error === 'yield' || undefined}
                            onChange={(e) => setIng(i.id, { yieldPct: cleanNum(e.target.value, 1, 3) })} />
                          <span className={`${ui.unit} ${s.miniUnit}`}>%</span>
                        </div>
                      </label>
                    </div>
                    {r.error && <p className={`${ui.notice} ${ui.red} ${s.ingWarn}`} role="alert"><XCircle aria-hidden />{L.ingErr[r.error]}</p>}
                  </div>
                );
              })}
            </div>
            <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm} ${s.alignStart}`}
              disabled={active.ingredients.length >= LIMITS.ingredients}
              onClick={() => updateActive((m) => ({ ...m, ingredients: [...m.ingredients, blankIngredient(newId('i'))] }))}>
              <Plus aria-hidden />{L.addIng}
            </button>

            <div className={s.subHead}>
              <h3 className={s.subTitle}>{L.extrasTitle(biz)}</h3>
            </div>
            <p className={`${ui.hint} ${s.tight}`}>{L.extrasHint(biz)}</p>
            {active.extras.map((e, idx) => (
              <div key={e.id} className={s.extra}>
                <input className={ui.input} aria-label={`${L.extraName} ${idx + 1}`} placeholder={L.extraName} maxLength={LIMITS.name} value={e.name}
                  onChange={(ev) => updateActive((m) => ({ ...m, extras: m.extras.map((x) => (x.id === e.id ? { ...x, name: ev.target.value } : x)) }))} />
                <div className={ui.inputGroup}>
                  <input className={ui.input} aria-label={`${L.extraAmount} ${idx + 1}`} inputMode="decimal" autoComplete="off" value={withCommas(e.amount)}
                    onChange={(ev) => updateActive((m) => ({ ...m, extras: m.extras.map((x) => (x.id === e.id ? { ...x, amount: cleanNum(ev.target.value, info.decimals) } : x)) }))} />
                  <span className={ui.unit}>{curUnit}</span>
                </div>
                <button type="button" className={s.iconBtn} aria-label={`${L.removeExtra}: ${e.name || idx + 1}`}
                  onClick={() => updateActive((m) => ({ ...m, extras: m.extras.filter((x) => x.id !== e.id) }))}>
                  <Trash2 aria-hidden />
                </button>
              </div>
            ))}
            <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm} ${s.alignStart}`}
              disabled={active.extras.length >= LIMITS.extras}
              onClick={() => updateActive((m) => ({ ...m, extras: [...m.extras, { id: newId('e'), name: '', amount: '' }] }))}>
              <Plus aria-hidden />{L.addExtra}
            </button>
          </>
        )}

        {biz === 'beauty' && (
          <div className={s.laborBox}>
            <div className={s.twoFields}>
              <NumField id="mc-min" label={L.minutes} value={active.minutes} unit={L.minUnit} maxInt={4} commas={false}
                onChange={(v) => updateActive((m) => ({ ...m, minutes: v }))} />
              <NumField id="mc-labor" label={L.laborRate} value={data.laborRate} unit={curUnit} decimals={info.decimals}
                onChange={(v) => set('laborRate', v)} />
            </div>
            <span className={ui.hint}>{L.laborHint}</span>
            <label className={s.switch}>
              <input type="checkbox" checked={data.includeLabor} onChange={(e) => set('includeLabor', e.target.checked)} />
              <span>{L.includeLabor}</span>
            </label>
            <span className={ui.hint}>{L.includeLaborHint}</span>
          </div>
        )}
      </section>

      <div className={s.side}>
        <section className={`${ui.card} ${s.card}`} aria-live="polite" aria-label={L.costOf(biz)}>
          <div className={ui.result}>
            <div className={ui.resultLabel}>{active.name || L.item[biz]} · {L.costOf(biz)}</div>
            <div className={ui.resultValue}>{money(activeCost.total)}</div>
          </div>
          <div>
            {!activeCost.manual && (
              <>
                <div className={s.row}><span className={s.rowLabel}>{L.sumIng}</span><span className={s.rowValue}>{money(activeCost.ingredients)}</span></div>
                <div className={s.row}><span className={s.rowLabel}>{L.sumExtras(biz)}</span><span className={s.rowValue}>{money(activeCost.extras)}</span></div>
              </>
            )}
            {biz === 'beauty' && (
              <>
                <div className={`${s.row} ${!data.includeLabor ? s.total : ''}`}><span className={s.rowLabel}>{L.sumMaterial}</span><span className={s.rowValue}>{money(activeCost.material)}</span></div>
                <div className={s.row}><span className={s.rowLabel}>{L.sumLabor(active.minutes || '0', money(laborRate))}</span><span className={s.rowValue}>{money(activeCost.labor)}</span></div>
                <div className={`${s.row} ${data.includeLabor ? s.total : ''}`}><span className={s.rowLabel}>{L.sumWithLabor}</span><span className={s.rowValue}>{money(activeCost.material + activeCost.labor)}</span></div>
              </>
            )}
          </div>
          {activeCost.errors > 0 && <p className={`${ui.notice} ${ui.amber}`}><AlertTriangle aria-hidden />{L.costErrors(activeCost.errors)}</p>}
          {nextBtn('cost')}
        </section>
        {menuTable}
      </div>
    </div>
  );

  /* ② 판매가·원가율 */
  const p = activePricing;
  const overTarget = p.costRate !== null && target > 0 && p.costRate > target / 100;
  const simCost = activeCost.total + activeCost.material * (sim / 100);
  const simRate = p.net > 0 ? simCost / p.net : null;
  const simKeep = target > 0 && target < 100 ? pricing({ cost: simCost, price: 0, priceIncludesTax: priceInc, taxRate, targetRate: target, feeRate, roundUnit, decimals: info.decimals }).recommended : null;
  const priceTab = (
    <div className={s.cols}>
      <section className={`${ui.card} ${s.card}`} aria-label={L.tabs.price}>
        <div className={s.costHead}>
          <div>
            <span className={ui.label}>{L.costRow}</span>
            {active.costMode === 'manual' ? (
              <div className={ui.inputGroup}>
                <input className={`${ui.input} ${ui.inputLg}`} aria-label={L.costRow} inputMode="decimal" autoComplete="off" value={withCommas(active.manualCost)}
                  onChange={(e) => updateActive((m) => ({ ...m, manualCost: cleanNum(e.target.value, info.decimals) }))} />
                <span className={ui.unit}>{curUnit}</span>
              </div>
            ) : (
              <strong className={s.costValue}>{money(activeCost.total)} <small>{L.fromCalc}</small></strong>
            )}
          </div>
          <button type="button" className={`${ui.button} ${ui.ghost} ${ui.sm}`}
            onClick={() => updateActive((m) => ({ ...m, costMode: m.costMode === 'manual' ? 'calc' : 'manual', manualCost: m.costMode === 'manual' ? m.manualCost : m.manualCost || String(Math.round(activeCost.material * 100) / 100) }))}>
            {active.costMode === 'manual' ? L.useCalc : L.editManual}
          </button>
        </div>

        <NumField id="mc-price" label={L.sellPrice} value={active.price} unit={curUnit} decimals={info.decimals} large
          onChange={(v) => updateActive((m) => ({ ...m, price: v }))} hint={hasTax ? L.priceHint(priceInc) : undefined} />
        {p.costRate !== null && activeCost.total > 0 && (
          <p className={`${s.quick} ${overTarget ? s.bad : s.good}`} aria-hidden>
            {L.quick(pct(p.costRate), money(p.profit))}
          </p>
        )}
        {hasTax && (
          <Radio label={L.sellPrice} value={data.priceIncludesTax} onChange={(v) => set('priceIncludesTax', v)}
            options={[{ v: true, label: L.taxIn }, { v: false, label: L.taxOut }]} />
        )}
        <div className={s.twoFields}>
          <NumField id="mc-target" label={L.target} value={data.targetRate} unit="%" decimals={1} maxInt={2} commas={false}
            help={<Help text={L.terms.target} label={`${L.target} ${L.help}`} />} onChange={(v) => set('targetRate', v)} />
          <NumField id="mc-fee" label={L.fee} value={data.feeRate} unit="%" decimals={2} maxInt={2} commas={false} placeholder="0"
            onChange={(v) => set('feeRate', v)} />
        </div>
        <span className={ui.hint}>{L.targetHint}</span>
        <span className={ui.hint}>{L.feeHint}</span>
        <div className={ui.field}>
          <span className={ui.label}>{L.rounding}</span>
          <Radio label={L.rounding} value={data.rounding} onChange={(v) => set('rounding', v)}
            options={[{ v: 0 as const, label: L.roundNone }, { v: 1 as const, label: L.roundUnit(unitStr(info.rounding[0])) }, { v: 2 as const, label: L.roundUnit(unitStr(info.rounding[1])) }]} />
        </div>
        {isKo && <p className={`${ui.notice} ${ui.gray}`}><Info aria-hidden />{L.simpleTax}</p>}
      </section>

      <div className={s.side}>
        <section className={`${ui.card} ${s.card}`} aria-live="polite" aria-label={L.nowRate}>
          {activeCost.total <= 0 ? (
            <p className={`${ui.notice} ${ui.gray}`}><Info aria-hidden />{L.noCost}</p>
          ) : p.costRate === null ? (
            <p className={`${ui.notice} ${ui.gray}`}><Info aria-hidden />{L.noPrice}</p>
          ) : (
            <>
              <div className={`${ui.result} ${overTarget ? s.resultBad : s.resultGood}`}>
                <div className={ui.resultLabel}>{active.name || L.item[biz]} · {L.nowRate}<Help text={L.terms.costRate} label={`${L.nowRate} ${L.help}`} /></div>
                <div className={`${ui.resultValue} ${s.rateValue}`}>
                  {pct(p.costRate)}
                  {target > 0 && (
                    <span className={`${ui.badge} ${overTarget ? ui.red : ui.green}`}>
                      {overTarget ? <XCircle aria-hidden /> : <CheckCircle2 aria-hidden />}{overTarget ? L.over : L.under} ({target}%)
                    </span>
                  )}
                </div>
              </div>
              {rateSuspicious(p.costRate) && <p className={`${ui.notice} ${ui.amber}`}><AlertTriangle aria-hidden />{L.suspicious}</p>}
              <div>
                <div className={s.row}><span className={s.rowLabel}>{L.pGross(priceInc)}</span><span className={s.rowValue}>{money(num(active.price))}</span></div>
                {hasTax && <div className={s.row}><span className={s.rowLabel}>{L.pTax} ({taxRate}%)</span><span className={s.rowValue}>{priceInc ? '−' : '+'}{money(p.tax)}</span></div>}
                {priceInc && <div className={s.row}><span className={s.rowLabel}>{L.pNet}</span><span className={s.rowValue}>{money(p.net)}</span></div>}
                <div className={s.row}><span className={s.rowLabel}>{L.pCost}</span><span className={`${s.rowValue} ${s.minus}`}>−{money(activeCost.total)}</span></div>
                {feeRate > 0 && <div className={s.row}><span className={s.rowLabel}>{L.pFee(String(feeRate))}</span><span className={`${s.rowValue} ${s.minus}`}>−{money(p.fee)}</span></div>}
                <div className={`${s.row} ${s.total}`}>
                  <span className={s.rowLabel}>{L.pProfit}<small>{L.profitHint}</small></span>
                  <span className={`${s.rowValue} ${p.profit < 0 ? s.minus : ''}`}>{money(p.profit)}</span>
                </div>
              </div>
            </>
          )}
          {p.recommended !== null && (
            <div className={s.recBox}>
              <div>
                <span className={ui.label}>{L.rec}</span>
                <strong className={s.recValue}>{money(p.recommended)}</strong>
                <span className={ui.hint}>{L.recHow(String(target), priceInc, roundUnit ? unitStr(roundUnit) : '')}</span>
              </div>
              {num(active.price) !== p.recommended && (
                <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm}`}
                  onClick={() => updateActive((m) => ({ ...m, price: String(p.recommended) }))}>{L.applyRec}</button>
              )}
            </div>
          )}
          {p.costRate !== null && activeCost.material > 0 && (
            <div className={s.simBox}>
              <label className={s.subTitle} htmlFor="mc-sim">{L.simTitle}</label>
              <div className={s.simRow}>
                <input id="mc-sim" type="range" min={0} max={50} step={1} value={sim} onChange={(e) => setSim(Number(e.target.value))}
                  aria-valuetext={L.simLabel(sim)} />
                <strong>{L.simLabel(sim)}</strong>
              </div>
              <p className={simRate !== null && target > 0 && simRate > target / 100 ? s.bad : s.good}>
                {L.simResult(money(simCost), pct(simRate))}
              </p>
              {simKeep !== null && <p className={ui.hint}>{L.simKeep(money(simKeep))}</p>}
              {biz === 'beauty' && data.includeLabor && <p className={ui.hint}>{L.simNote}</p>}
            </div>
          )}
          {nextBtn('price')}
        </section>
        {menuTable}
      </div>
    </div>
  );

  /* ③ 손익분기점 */
  const step = info.step;
  const scenarios: { label: string; r: BreakEven }[] = [];
  if (be.ok) {
    const sign = (n: number, s2: string) => `${n > 0 ? '+' : '−'}${s2}`;
    const tStep = (d: number) => {
      const t = ticketIn + d;
      return data.ticketIncludesTax && hasTax ? t / (1 + taxRate / 100) : t;
    };
    scenarios.push({ label: L.scBase, r: be });
    scenarios.push({ label: L.scTicket(sign(1, money(step))), r: beFor({ ticket: tStep(step) }) });
    if (ticketIn - step > 0) scenarios.push({ label: L.scTicket(sign(-1, money(step))), r: beFor({ ticket: tStep(-step) }) });
    scenarios.push({ label: L.scRate('+5'), r: beFor({ rate: (usedRate ?? 0) + 0.05 }) });
    if ((usedRate ?? 0) - 0.05 >= 0) scenarios.push({ label: L.scRate('−5'), r: beFor({ rate: (usedRate ?? 0) - 0.05 }) });
    const rent = num(data.fixed.rent);
    if (rent > 0) {
      scenarios.push({ label: L.scRent('+10'), r: beFor({ fixed: fixed.total + rent * 0.1 }) });
      scenarios.push({ label: L.scRent('−10'), r: beFor({ fixed: fixed.total - rent * 0.1 }) });
    }
  }
  const fixedField = (k: keyof FixedCosts, hint?: ReactNode) => (
    <NumField key={k} id={`mc-f-${k}`} label={L.fixedL[k]} value={data.fixed[k]} unit={curUnit} decimals={info.decimals}
      onChange={(v) => setFixed(k, v)} hint={hint} />
  );
  const bepTab = (
    <>
      <div className={s.cols}>
        <section className={`${ui.card} ${s.card}`} aria-label={L.fixedTitle}>
          <h3 className={s.subTitle}>{L.fixedTitle}</h3>
          <div className={s.twoFields}>
            {fixedField('rent')}
            {fixedField('maintenance')}
          </div>
          {fixedField('staff', isKo ? <>{L.staffHint} <a href={`/${lang}/utilities/finance/alba-pay-calc`} className={s.link}>{L.staffLink}</a></> : undefined)}
          {fixedField('owner', L.ownerHint)}
          <div className={s.twoFields}>
            {fixedField('utilities')}
            {fixedField('interest')}
          </div>
          <div className={s.twoFields}>
            {fixedField('equipment')}
            <NumField id="mc-f-months" label={L.fixedL.equipmentMonths} value={data.fixed.equipmentMonths} unit={L.monthsUnit} maxInt={3} commas={false}
              onChange={(v) => setFixed('equipmentMonths', v)} />
          </div>
          {fixed.depreciation > 0 && <span className={`${ui.hint} ${s.tight}`}>{L.depHint(money(fixed.depreciation))}</span>}
          {fixedField('other')}
          <div className={`${s.row} ${s.total}`}><span className={s.rowLabel}>{L.fixedTotal}</span><span className={s.rowValue}>{money(fixed.total)}</span></div>

          <h3 className={s.subTitle}>{L.salesTitle}</h3>
          <NumField id="mc-ticket" label={L.ticket} value={data.ticket} unit={curUnit} decimals={info.decimals} large
            help={<Help text={L.terms.ticket} label={`${L.ticket} ${L.help}`} />}
            hint={hasTax ? L.ticketHint(data.ticketIncludesTax) : undefined} onChange={(v) => set('ticket', v)} />
          {hasTax && (
            <Radio label={L.ticket} value={data.ticketIncludesTax} onChange={(v) => set('ticketIncludesTax', v)}
              options={[{ v: false, label: L.taxOut }, { v: true, label: L.taxIn }]} />
          )}
          <div className={ui.field}>
            <div className={s.labelRow}><span className={ui.label}>{L.costRate}</span><Help text={L.terms.costRate} label={`${L.costRate} ${L.help}`} /></div>
            <Radio label={L.costRate} value={data.costRateMode} onChange={(v) => set('costRateMode', v)}
              options={[{ v: 'auto' as const, label: avg.count ? L.crAuto(avg.count) : L.crAutoNone }, { v: 'manual' as const, label: L.crManual }]} />
            {data.costRateMode === 'auto' ? (
              avg.rate !== null
                ? <span className={ui.hint}><strong className={s.inlineStrong}>{pct(avg.rate)}</strong> · {L.crAutoHint}</span>
                : <p className={`${ui.notice} ${ui.amber}`}><AlertTriangle aria-hidden />{L.crAutoEmpty}</p>
            ) : (
              <div className={ui.inputGroup}>
                <input className={ui.input} aria-label={L.costRate} inputMode="decimal" autoComplete="off" value={data.manualCostRate}
                  onChange={(e) => set('manualCostRate', cleanNum(e.target.value, 1, 3))} />
                <span className={ui.unit}>%</span>
              </div>
            )}
          </div>
          <div className={s.twoFields}>
            <NumField id="mc-fee3" label={L.fee} value={data.feeRate} unit="%" decimals={2} maxInt={2} commas={false} placeholder="0"
              onChange={(v) => set('feeRate', v)} />
            <NumField id="mc-days" label={L.days} value={data.days} unit={L.dayUnit} maxInt={2} commas={false}
              invalid={days <= 0 || days > 31} onChange={(v) => set('days', v)} />
          </div>
          <div className={s.twoFields}>
            <NumField id="mc-seats" label={L.seats(biz)} value={data.seats} unit={L.seatUnit(biz)} maxInt={4} commas={false}
              onChange={(v) => set('seats', v)} />
            <NumField id="mc-profit" label={L.targetProfit} value={data.targetProfit} unit={curUnit} decimals={info.decimals}
              onChange={(v) => set('targetProfit', v)} />
          </div>
        </section>

        <div className={`${s.side} ${s.stickySide}`}>
          <section className={`${ui.card} ${s.card}`} aria-live="polite" aria-label={L.tabs.bep}>
            {!be.ok ? (
              <p className={`${ui.notice} ${be.reason === 'margin' ? ui.red : ui.gray}`}>
                {be.reason === 'margin' ? <XCircle aria-hidden /> : <Info aria-hidden />}
                {be.reason === 'margin' ? L.noMargin : L.needInput}
              </p>
            ) : (
              <>
                <div className={`${ui.result} ${s.bigResult}`}>
                  <div className={s.bigText}>{L.bepBig(be.daily.toLocaleString(isKo ? 'ko-KR' : 'en-US'))}</div>
                </div>
                <div>
                  <div className={s.row}>
                    <span className={s.rowLabel}><span className={s.labelRow}>{L.bepSales}<Help text={L.terms.bep} label={`${L.bepSales} ${L.help}`} /></span></span>
                    <span className={s.rowValue}>{money(be.sales)}</span>
                  </div>
                  <div className={s.row}><span className={s.rowLabel}>{L.bepMonth}</span><span className={s.rowValue}>{L.people(be.monthCustomers)}</span></div>
                  <div className={s.row}><span className={s.rowLabel}>{L.variable}</span><span className={s.rowValue}>{pct(be.variable)}</span></div>
                  <div className={s.row}>
                    <span className={s.rowLabel}><span className={s.labelRow}>{L.contribution}<Help text={L.terms.contribution} label={`${L.contribution} ${L.help}`} /></span></span>
                    <span className={s.rowValue}>{pct(be.contribution)}</span>
                  </div>
                </div>
                {be.turnover !== null && <p className={`${ui.notice} ${ui.blue}`}><Info aria-hidden />{L.turnover(be.turnover.toFixed(1))}</p>}
                {be.target && (
                  <p className={`${ui.notice} ${ui.violet}`}><CheckCircle2 aria-hidden />
                    {L.targetLine(money(targetProfit), L.people(be.target.daily), money(be.target.sales))}
                    {be.target.turnover !== null && ` · ${L.turnover(be.target.turnover.toFixed(1))}`}
                  </p>
                )}
                {num(data.fixed.owner) <= 0 && <p className={`${ui.notice} ${ui.amber}`}><AlertTriangle aria-hidden />{L.ownerHint}</p>}
              </>
            )}
          </section>
        </div>
      </div>

      {be.ok && (
        <div className={s.cols}>
          <section className={`${ui.card} ${s.card}`} aria-label={L.chartTitle}>
            <h3 className={s.subTitle}>{L.chartTitle}</h3>
            <Chart fixed={fixed.total} ticket={ticketNet} variable={be.variable} days={days} dailyExact={be.sales / ticketNet / days}
              targetDaily={be.target?.daily ?? null} L={L} axis={axis} money={money} />
            <div className={s.legend}>
              <span><i className={s.legRev} />{L.chartRev}</span>
              <span><i className={s.legCost} />{L.chartCost}</span>
            </div>
          </section>
          <section className={`${ui.card} ${s.card}`} aria-label={L.scTitle}>
            <h3 className={s.subTitle}>{L.scTitle}</h3>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr>{L.scHead.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                <tbody>
                  {scenarios.map((sc, i) => {
                    const diff = sc.r.ok ? sc.r.daily - be.daily : null;
                    return (
                      <tr key={sc.label} className={i === 0 ? s.rowActive : ''}>
                        <th scope="row">{sc.label}</th>
                        <td>{sc.r.ok ? L.people(sc.r.daily) : L.scNone}</td>
                        <td className={diff === null ? s.bad : diff > 0 ? s.bad : diff < 0 ? s.good : ''}>
                          {i === 0 ? '—' : diff === null ? '—' : diff === 0 ? '0' : `${diff > 0 ? '+' : '−'}${L.people(Math.abs(diff))}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  );

  /* 인쇄용 메뉴 원가표 */
  const printSheet = printing && createPortal(
    <div id="mc-print-sheet" className={s.printSheet}>
      <h1>{L.printTitle}</h1>
      <p>{(priceInc ? L.printMeta : L.printMetaEx)(new Date().toLocaleDateString(isKo ? 'ko-KR' : 'en-US'), L.biz[biz])}</p>
      <table>
        <thead><tr><th>{L.tableName(biz)}</th><th>{L.table.cost}</th><th>{L.table.price}</th><th>{L.table.rate}</th><th>{L.pProfit}</th></tr></thead>
        <tbody>
          {data.menus.map((m) => {
            const c = costs.get(m.id)!;
            const pp = priceOf(m);
            return (
              <tr key={m.id}>
                <td>{m.name}</td><td>{money(c.total)}</td><td>{num(m.price) > 0 ? money(num(m.price)) : '—'}</td>
                <td>{pct(pp.costRate)}</td><td>{num(m.price) > 0 ? money(pp.profit) : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.menus.filter((m) => m.costMode === 'calc').map((m) => (
        <section key={m.id}>
          <h2>{m.name} — {money(costs.get(m.id)!.total)}</h2>
          <table>
            <thead><tr><th>{L.ingName}</th><th>{L.price}</th><th>{L.qty}</th><th>{L.amountUsed(biz)}</th><th>{L.yieldL}</th><th>{L.ingCost}</th></tr></thead>
            <tbody>
              {m.ingredients.filter((i) => i.name || !ingredientCost(i).empty).map((i) => {
                const r = ingredientCost(i);
                return (
                  <tr key={i.id}>
                    <td>{i.name}</td><td>{money(num(i.price))}</td><td>{i.qty}{L.units[i.unit]}</td>
                    <td>{i.use}{L.units[i.useUnit]}</td><td>{i.yieldPct || '100'}%</td><td>{r.error ? '—' : money(r.cost)}</td>
                  </tr>
                );
              })}
              {m.extras.map((e) => <tr key={e.id}><td>{e.name}</td><td colSpan={4} /><td>{money(num(e.amount))}</td></tr>)}
              {biz === 'beauty' && costs.get(m.id)!.labor > 0 && (
                <tr><td>{L.sumLabor(m.minutes, money(laborRate))}</td><td colSpan={4} /><td>{money(costs.get(m.id)!.labor)}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      ))}
    </div>,
    document.body,
  );

  const barRate = usedRate === null ? L.barNone : pct(usedRate);
  const barDaily = be.ok ? `${be.daily.toLocaleString(isKo ? 'ko-KR' : 'en-US')}${isKo ? '명' : ''}` : L.barNone;

  return (
    <div ref={rootRef} className={s.tool}>
      <style>{`#mc-print-sheet{display:none}@media print{body[data-mc-print]>*:not(#mc-print-sheet){display:none!important}body[data-mc-print]>#mc-print-sheet{display:block!important}}`}</style>

      {/* 업종·예시·통화 */}
      <div className={`${ui.card} ${s.top}`}>
        <div className={s.topRow}>
          <div className={ui.field}>
            <span className={ui.label}>{L.bizLabel}</span>
            <Radio label={L.bizLabel} value={biz} onChange={changeBiz}
              options={[
                { v: 'food' as const, label: <span className={s.segLabel}><UtensilsCrossed aria-hidden />{L.biz.food}</span> },
                { v: 'beauty' as const, label: <span className={s.segLabel}><Scissors aria-hidden />{L.biz.beauty}</span> },
              ]} />
          </div>
          <div className={ui.field}>
            <span className={ui.label}>{L.example}</span>
            <div className={ui.chips}>
              <button type="button" className={`${ui.chip} ${ui.pill}`} onClick={() => loadExample('food')}>{L.exFood}</button>
              <button type="button" className={`${ui.chip} ${ui.pill}`} onClick={() => loadExample('beauty')}>{L.exBeauty}</button>
            </div>
          </div>
        </div>
        {isKo ? (
          <span className={`${ui.badge} ${ui.gray} ${s.alignStart}`}>{L.taxBadge}</span>
        ) : (
          <div className={s.topRow}>
            <div className={ui.field}>
              <label className={ui.label} htmlFor="mc-cur">{L.currency}</label>
              <select id="mc-cur" className={ui.input} value={data.currency} onChange={(e) => set('currency', e.target.value as Currency)}>
                {(Object.keys(CURRENCIES) as Currency[]).map((c) => <option key={c} value={c}>{c} ({CURRENCIES[c].symbol})</option>)}
              </select>
            </div>
            <div className={ui.field}>
              <label className={ui.label} htmlFor="mc-tax">{L.taxRate}</label>
              <div className={s.taxRow}>
                <div className={ui.inputGroup}>
                  <input id="mc-tax" className={ui.input} inputMode="decimal" autoComplete="off" value={data.taxRate}
                    onChange={(e) => set('taxRate', cleanNum(e.target.value, 2, 2))} />
                  <span className={ui.unit}>%</span>
                </div>
                <div className={ui.chips}>
                  {['0', '5', '10', '20'].map((r) => (
                    <button key={r} type="button" aria-pressed={data.taxRate === r} className={`${ui.chip} ${ui.pill} ${data.taxRate === r ? ui.chipActive : ''}`}
                      onClick={() => set('taxRate', r)}>{r}%</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 단계 탭 */}
      <div className={s.tabs} role="tablist" aria-label={isKo ? '계산 단계' : 'Steps'}>
        {TABS.map((t) => (
          <button key={t} id={`mc-tab-${t}`} type="button" role="tab" aria-selected={tab === t} aria-controls={`mc-panel-${t}`}
            className={`${s.tab} ${tab === t ? s.tabActive : ''}`} onClick={() => setTab(t)}>
            {L.tabs[t]}
          </button>
        ))}
      </div>

      {tab !== 'bep' && menuChips}
      <div id={`mc-panel-${tab}`} role="tabpanel" aria-labelledby={`mc-tab-${tab}`} className={s.panel}>
        {tab === 'cost' ? costTab : tab === 'price' ? priceTab : bepTab}
      </div>

      {flash && <p className={`${ui.notice} ${ui[flash.tone]}`} role="status">{flash.tone === 'green' ? <CheckCircle2 aria-hidden /> : <AlertTriangle aria-hidden />}{flash.text}</p>}

      {/* 저장·내보내기 */}
      <div className={`${ui.card} ${s.tools}`}>
        <div className={s.actions}>
          <button type="button" className={`${ui.button} ${copied ? ui.primary : ui.secondary} ${ui.sm}`} onClick={copyResult}><Copy aria-hidden />{copied ? L.copied : L.copy}</button>
          <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm}`} onClick={exportCsv}><FileSpreadsheet aria-hidden />{L.csv}</button>
          <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm}`} onClick={() => setPrinting(true)}><Printer aria-hidden />{L.print}</button>
          <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm}`} onClick={exportBackup}><Download aria-hidden />{L.backup}</button>
          <button type="button" className={`${ui.button} ${ui.secondary} ${ui.sm}`} onClick={() => fileRef.current?.click()}><Upload aria-hidden />{L.restore}</button>
          <button type="button" className={`${ui.button} ${ui.ghost} ${ui.sm}`} onClick={reset}><RotateCcw aria-hidden />{L.reset}</button>
          <input ref={fileRef} type="file" accept=".json,application/json" hidden
            onChange={(e) => { void importBackup(e.target.files?.[0]); e.target.value = ''; }} />
        </div>
        {store === 'ok' && <span className={`${ui.hint} ${s.saved}`}><CheckCircle2 aria-hidden />{L.saved}</span>}
        {store === 'blocked' && <p className={`${ui.notice} ${ui.amber}`}><AlertTriangle aria-hidden />{L.saveBlocked}</p>}
        <p className={s.disclaimer}>{L.disclaimer}</p>
      </div>

      {toolVisible && (
        <button type="button" className={s.bar} onClick={() => { setTab('bep'); rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
          {L.bar(barRate, barDaily).map((t, i) => <span key={i}>{t}</span>)}
        </button>
      )}
      {printSheet}
    </div>
  );
}
