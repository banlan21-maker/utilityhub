'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import NavigationActions from '@/app/components/NavigationActions';
import s from './ivm.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────
type CountryMode = 'KR' | 'US';
interface LineItem { id: string; desc: string; qty: number; unitPrice: number; }
interface Issuer {
  name: string; email: string; phone: string; address: string;
  bizNo: string; account: string; bank: string; logoBase64: string;
}
interface InvoiceData {
  invNo: string; issueDate: string; dueDate: string;
  issuer: Issuer;
  clientName: string; clientEmail: string; clientAddress: string;
  items: LineItem[];
  taxRate: number; notes: string; payLink: string;
  countryMode: CountryMode;
}

// ─── LS Keys ─────────────────────────────────────────────────────────────────
const LS_ISSUER = 'ivm-issuer-v1';
const LS_HISTORY = 'ivm-history-v1';
const LS_LAST_INV = 'ivm-last-inv-v1';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const dateKey = () => todayStr().replace(/-/g,'');

function genInvNo(): string {
  const dk = dateKey();
  try {
    const last = JSON.parse(localStorage.getItem(LS_LAST_INV) || 'null');
    if (last && last.dk === dk) {
      return `INV-${dk}-${String(last.seq + 1).padStart(3,'0')}`;
    }
  } catch { /* ignore */ }
  return `INV-${dk}-001`;
}

function saveSeqFromNo(invNo: string) {
  const m = invNo.match(/INV-(\d{8})-(\d+)$/);
  if (!m) return;
  try { localStorage.setItem(LS_LAST_INV, JSON.stringify({ dk: m[1], seq: parseInt(m[2], 10) })); }
  catch { /* ignore */ }
}

const fmt = (n: number, mode: CountryMode) =>
  mode === 'KR'
    ? `₩${Math.round(n).toLocaleString()}`
    : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const newItem = (): LineItem => ({ id: Date.now().toString(), desc: '', qty: 1, unitPrice: 0 });

const defaultIssuer = (): Issuer => ({
  name: '', email: '', phone: '', address: '', bizNo: '', account: '', bank: '', logoBase64: '',
});

const defaultData = (mode: CountryMode = 'KR'): InvoiceData => ({
  invNo: '',
  issueDate: todayStr(),
  dueDate: '',
  issuer: defaultIssuer(),
  clientName: '', clientEmail: '', clientAddress: '',
  items: [newItem()],
  taxRate: mode === 'KR' ? 10 : 8.25,
  notes: '',
  payLink: '',
  countryMode: mode,
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InvoiceMakerClient() {
  const locale = useLocale();
  const isKo = locale === 'ko';
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<InvoiceData>(defaultData('KR'));
  const [history, setHistory] = useState<InvoiceData[]>([]);
  const [toast, setToast] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Init ──
  useEffect(() => {
    setIsClient(true);
    const invNo = genInvNo();
    let saved: Partial<InvoiceData> = {};
    try { saved = JSON.parse(localStorage.getItem(LS_ISSUER) || '{}'); } catch { /* ignore */ }
    const hist: InvoiceData[] = [];
    try { hist.push(...JSON.parse(localStorage.getItem(LS_HISTORY) || '[]')); } catch { /* ignore */ }
    setHistory(hist);
    setData(prev => ({
      ...prev,
      invNo,
      issuer: { ...prev.issuer, ...(saved as Partial<Issuer>) },
    }));
  }, []);

  // ── Save issuer on change ──
  useEffect(() => {
    if (!isClient) return;
    try { localStorage.setItem(LS_ISSUER, JSON.stringify(data.issuer)); } catch { /* ignore */ }
  }, [data.issuer, isClient]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // ── Setters ──
  const setMode = (mode: CountryMode) => {
    setData(prev => ({
      ...prev,
      countryMode: mode,
      taxRate: mode === 'KR' ? 10 : 8.25,
    }));
  };

  const setField = <K extends keyof InvoiceData>(k: K, v: InvoiceData[K]) =>
    setData(prev => ({ ...prev, [k]: v }));

  const setIssuerField = <K extends keyof Issuer>(k: K, v: Issuer[K]) =>
    setData(prev => ({ ...prev, issuer: { ...prev.issuer, [k]: v } }));

  const setItem = (id: string, k: keyof LineItem, v: string | number) =>
    setData(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === id ? { ...it, [k]: v } : it),
    }));

  // ── Calculation ──
  const subtotal = data.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const taxLabel = data.countryMode === 'KR' ? (data.taxRate === 3.3 ? '원천징수' : '부가세') : 'Sales Tax';
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;

  // ── Logo upload ──
  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { showToast(isKo ? '이미지는 1MB 이하로 올려주세요' : 'Image must be under 1MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => setIssuerField('logoBase64', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ── Inv number regen ──
  const regenInvNo = () => setField('invNo', genInvNo());

  // ── Save to history ──
  const saveToHistory = useCallback((d: InvoiceData) => {
    saveSeqFromNo(d.invNo);
    setHistory(prev => {
      const next = [d, ...prev.filter(h => h.invNo !== d.invNo)].slice(0, 5);
      try { localStorage.setItem(LS_HISTORY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // ── Load from history ──
  const loadHistory = (h: InvoiceData) => {
    setData({ ...h, invNo: genInvNo(), issueDate: todayStr() });
    showToast(isKo ? '불러왔습니다' : 'Loaded');
  };

  // ── PDF Export ──
  const exportPDF = async () => {
    if (!previewRef.current) return;
    showToast(isKo ? 'PDF 생성 중...' : 'Generating PDF...');
    saveToHistory(data);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#fff',
        windowWidth: 794, width: 794,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const pW = pdf.internal.pageSize.getWidth();
      const pH = pdf.internal.pageSize.getHeight();
      const ratio = pW / canvas.width;
      const imgH = canvas.height * ratio;
      if (imgH <= pH) {
        pdf.addImage(imgData, 'PNG', 0, 0, pW, imgH);
      } else {
        let y = 0;
        while (y < canvas.height) {
          const sliceH = Math.min(pH / ratio, canvas.height - y);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          sliceCanvas.getContext('2d')?.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          if (y > 0) pdf.addPage();
          pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, pW, sliceH * ratio);
          y += sliceH;
        }
      }
      pdf.save(`${data.invNo || 'invoice'}.pdf`);
      showToast(isKo ? 'PDF 저장 완료' : 'PDF saved');
    } catch (e) {
      console.error(e);
      showToast(isKo ? 'PDF 생성 실패' : 'PDF export failed');
    }
  };

  // ── Excel Export ──
  const exportExcel = async () => {
    saveToHistory(data);
    try {
      const XLSX = await import('xlsx');
      const rows = [
        [isKo ? '품목명' : 'Description', isKo ? '수량' : 'Qty', isKo ? '단가' : 'Unit Price', isKo ? '금액' : 'Amount'],
        ...data.items.map(it => [it.desc, it.qty, it.unitPrice, it.qty * it.unitPrice]),
        [],
        [isKo ? '소계' : 'Subtotal', '', '', subtotal],
        [`${taxLabel} (${data.taxRate}%)`, '', '', taxAmount],
        [isKo ? '합계' : 'Total', '', '', total],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Invoice');
      XLSX.writeFile(wb, `${data.invNo || 'invoice'}.xlsx`);
      showToast(isKo ? 'Excel 저장 완료' : 'Excel saved');
    } catch (e) {
      console.error(e);
      showToast('Excel export failed');
    }
  };

  // ── Share Link (lz-string + AES) ──
  const genShareLink = async () => {
    try {
      const CryptoJS = (await import('crypto-js')).default;
      const LZString = (await import('lz-string')).default;
      const safeData = { ...data, issuer: { ...data.issuer, account: '', bank: '' } };
      const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(safeData));
      const SECRET = 'theutilhub-inv-2026';
      const encrypted = CryptoJS.AES.encrypt(compressed, SECRET).toString();
      const encoded = encodeURIComponent(encrypted);
      const url = `${window.location.origin}${window.location.pathname}?d=${encoded}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      setShareUrl(url);
      showToast(isKo ? '공유 링크 복사됨 (계좌 제외)' : 'Share link copied (account excluded)');
    } catch (e) {
      console.error(e);
      showToast('Share failed');
    }
  };

  // ── Load from URL param ──
  useEffect(() => {
    if (!isClient) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const enc = params.get('d');
      if (!enc) return;
      import('crypto-js').then(mod => {
        import('lz-string').then(lzMod => {
          const CryptoJS = mod.default;
          const LZString = lzMod.default;
          const SECRET = 'theutilhub-inv-2026';
          const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(enc), SECRET).toString(CryptoJS.enc.Utf8);
          const decompressed = LZString.decompressFromEncodedURIComponent(decrypted);
          if (decompressed) {
            const parsed = JSON.parse(decompressed) as InvoiceData;
            setData({ ...parsed, invNo: genInvNo(), issueDate: todayStr() });
            showToast(isKo ? '공유 데이터 불러옴' : 'Shared invoice loaded');
          }
        });
      });
    } catch { /* ignore */ }
  }, [isClient, isKo]);

  const fmtDate = (d: string) => {
    if (!d) return '';
    if (data.countryMode === 'KR') {
      const [y, m, day] = d.split('-');
      return `${y}년 ${m}월 ${day}일`;
    }
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!isClient) return null;

  const payQrValue = data.payLink || (data.countryMode === 'KR' ? 'https://toss.me/' : 'https://paypal.me/');

  return (
    <div className={s.ivm_wrap}>
      <NavigationActions />

      {/* Header */}
      <header className={s.ivm_header}>
        <div className={s.ivm_badge}>🧾 Invoice / Quote Maker</div>
        <h1 className={s.ivm_title}>{isKo ? '1분 인보이스 & 견적서 메이커' : '1-Minute Invoice & Quote Maker'}</h1>
        <p className={s.ivm_subtitle}>
          {isKo ? '브라우저에서 바로 — 가입 없이, 무료로, 즉시 PDF 출력' : 'Browser-based · No sign-up · Free · Instant PDF'}
        </p>
      </header>

      {/* Country Toggle */}
      <div className={s.ivm_toggle_row}>
        {(['KR','US'] as CountryMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`${s.ivm_toggle_btn} ${data.countryMode === m ? s.ivm_toggle_active : ''}`}>
            {m === 'KR' ? '🇰🇷 한국 (KRW)' : '🇺🇸 US (USD)'}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className={s.ivm_layout}>

        {/* Issuer */}
        <div className={s.ivm_card}>
          <p className={s.ivm_card_title}>📤 {isKo ? '발행인 정보' : 'From (Issuer)'}</p>
          <div className={s.ivm_logo_wrap}>
            <div className={s.ivm_logo_preview}>
              {data.issuer.logoBase64
                ? <img src={data.issuer.logoBase64} alt="logo" />
                : <span>LOGO</span>}
            </div>
            <button className={s.ivm_logo_btn} onClick={() => fileInputRef.current?.click()}>
              {isKo ? '로고 업로드' : 'Upload Logo'}
            </button>
            {data.issuer.logoBase64 && (
              <button className={s.ivm_logo_btn} onClick={() => setIssuerField('logoBase64', '')}>
                {isKo ? '제거' : 'Remove'}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleLogo} />
          </div>
          {[
            { k: 'name' as keyof Issuer, label: isKo ? '이름/상호명' : 'Name / Company' },
            { k: 'email' as keyof Issuer, label: 'Email' },
            { k: 'phone' as keyof Issuer, label: isKo ? '연락처' : 'Phone' },
            { k: 'address' as keyof Issuer, label: isKo ? '주소' : 'Address' },
            { k: 'bizNo' as keyof Issuer, label: data.countryMode === 'KR' ? '사업자번호' : 'EIN / Tax ID' },
            { k: 'bank' as keyof Issuer, label: data.countryMode === 'KR' ? '은행명' : 'Bank' },
            { k: 'account' as keyof Issuer, label: data.countryMode === 'KR' ? '계좌번호' : 'Account' },
          ].map(({ k, label }) => (
            <div key={k} className={s.ivm_field}>
              <label className={s.ivm_label}>{label}</label>
              <input className={s.ivm_input} value={data.issuer[k]} onChange={e => setIssuerField(k, e.target.value)} />
            </div>
          ))}
        </div>

        {/* Client + Meta */}
        <div className={s.ivm_card}>
          <p className={s.ivm_card_title}>📥 {isKo ? '수신인 정보' : 'To (Client)'}</p>
          {[
            { k: 'clientName' as keyof InvoiceData, label: isKo ? '이름/업체명' : 'Name / Company' },
            { k: 'clientEmail' as keyof InvoiceData, label: 'Email' },
            { k: 'clientAddress' as keyof InvoiceData, label: isKo ? '주소' : 'Address' },
          ].map(({ k, label }) => (
            <div key={k} className={s.ivm_field}>
              <label className={s.ivm_label}>{label}</label>
              <input className={s.ivm_input} value={data[k] as string}
                onChange={e => setField(k, e.target.value)} />
            </div>
          ))}

          <p className={s.ivm_card_title} style={{ marginTop: '1rem' }}>📋 {isKo ? '인보이스 정보' : 'Invoice Info'}</p>
          <div className={s.ivm_field}>
            <label className={s.ivm_label}>{isKo ? '인보이스 번호' : 'Invoice #'}</label>
            <div className={s.ivm_inv_row}>
              <input className={s.ivm_input} value={data.invNo}
                onChange={e => setField('invNo', e.target.value)} />
              <button className={s.ivm_regen_btn} onClick={regenInvNo}>🔄 {isKo ? '재생성' : 'Regen'}</button>
            </div>
          </div>
          <div className={s.ivm_row2}>
            <div className={s.ivm_field}>
              <label className={s.ivm_label}>{isKo ? '발행일' : 'Issue Date'}</label>
              <input type="date" className={s.ivm_input} value={data.issueDate}
                onChange={e => setField('issueDate', e.target.value)} />
            </div>
            <div className={s.ivm_field}>
              <label className={s.ivm_label}>{isKo ? '납기일' : 'Due Date'}</label>
              <input type="date" className={s.ivm_input} value={data.dueDate}
                onChange={e => setField('dueDate', e.target.value)} />
            </div>
          </div>

          {/* Payment QR */}
          <div className={s.ivm_field} style={{ marginTop: '0.5rem' }}>
            <label className={s.ivm_label}>
              {data.countryMode === 'KR' ? '카카오/토스 결제 링크' : 'PayPal/Venmo Pay Link'}
            </label>
            <input className={s.ivm_input} value={data.payLink}
              placeholder={data.countryMode === 'KR' ? 'https://toss.me/...' : 'https://paypal.me/...'}
              onChange={e => setField('payLink', e.target.value)} />
          </div>
          {data.payLink && (
            <div className={s.ivm_qr_row}>
              <div className={s.ivm_qr_item}>
                <QRCodeSVG value={payQrValue} size={72} />
                <span className={s.ivm_qr_item_label}>{isKo ? '결제 QR' : 'Pay QR'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className={`${s.ivm_card} ${s.ivm_card_full}`}>
          <p className={s.ivm_card_title}>📦 {isKo ? '품목 목록' : 'Line Items'}</p>
          <div className={s.ivm_items_header}>
            <span>{isKo ? '품목명' : 'Description'}</span>
            <span>{isKo ? '수량' : 'Qty'}</span>
            <span>{isKo ? '단가' : 'Unit Price'}</span>
            <span>{isKo ? '금액' : 'Amount'}</span>
            <span></span>
          </div>
          {data.items.map(it => (
            <div key={it.id} className={s.ivm_item_row}>
              <input className={`${s.ivm_input} ${s.ivm_input_sm}`} value={it.desc}
                placeholder={isKo ? '항목 설명' : 'Item description'}
                onChange={e => setItem(it.id, 'desc', e.target.value)} />
              <input type="number" className={`${s.ivm_input} ${s.ivm_input_sm}`} value={it.qty} min={1}
                onChange={e => setItem(it.id, 'qty', Math.max(1, Number(e.target.value)))} />
              <input type="number" className={`${s.ivm_input} ${s.ivm_input_sm}`} value={it.unitPrice} min={0}
                onChange={e => setItem(it.id, 'unitPrice', Number(e.target.value))} />
              <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#1e40af', paddingLeft:'0.2rem' }}>
                {fmt(it.qty * it.unitPrice, data.countryMode)}
              </span>
              <button className={s.ivm_del_btn}
                onClick={() => setData(prev => ({ ...prev, items: prev.items.filter(x => x.id !== it.id) }))}>
                ✕
              </button>
            </div>
          ))}
          <button className={s.ivm_add_item_btn}
            onClick={() => setData(prev => ({ ...prev, items: [...prev.items, newItem()] }))}>
            + {isKo ? '품목 추가' : 'Add Item'}
          </button>

          {/* Tax & Summary */}
          <div className={s.ivm_summary}>
            <div className={s.ivm_tax_row}>
              <span className={s.ivm_tax_label}>
                {data.countryMode === 'KR' ? '세금 유형 & 세율' : 'Tax Rate'}
              </span>
              {data.countryMode === 'KR' && (
                <select className={s.ivm_input} style={{ width:'auto', marginRight:'0.5rem' }}
                  value={data.taxRate}
                  onChange={e => setField('taxRate', Number(e.target.value))}>
                  <option value={10}>부가세 10%</option>
                  <option value={3.3}>원천징수 3.3%</option>
                  <option value={0}>세금 없음 (0%)</option>
                </select>
              )}
              {data.countryMode === 'US' && (
                <input type="number" className={s.ivm_input} style={{ width:'80px' }}
                  value={data.taxRate} step={0.25} min={0}
                  onChange={e => setField('taxRate', Number(e.target.value))} />
              )}
              {data.countryMode === 'US' && <span style={{ fontSize:'0.85rem' }}>%</span>}
            </div>
            <div className={s.ivm_sum_row}><span>{isKo ? '소계' : 'Subtotal'}</span><span>{fmt(subtotal, data.countryMode)}</span></div>
            <div className={s.ivm_sum_row}><span>{taxLabel} ({data.taxRate}%)</span><span>{fmt(taxAmount, data.countryMode)}</span></div>
            <div className={s.ivm_sum_total}><span>{isKo ? '합계' : 'Total'}</span><span>{fmt(total, data.countryMode)}</span></div>
          </div>

          {/* Notes */}
          <div className={s.ivm_field} style={{ marginTop:'1rem' }}>
            <label className={s.ivm_label}>{isKo ? '비고 / 결제 안내' : 'Notes / Payment Terms'}</label>
            <textarea className={s.ivm_textarea} value={data.notes}
              placeholder={isKo ? '결제 기한, 계좌 안내, 특이사항 등...' : 'Payment terms, special instructions...'}
              onChange={e => setField('notes', e.target.value)} />
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className={`${s.ivm_card} ${s.ivm_card_full}`}>
            <p className={s.ivm_card_title}>🕒 {isKo ? '최근 5개 불러오기' : 'Recent (Load)'}</p>
            <div className={s.ivm_history_list}>
              {history.map((h, i) => (
                <div key={i} className={s.ivm_history_item} onClick={() => loadHistory(h)}>
                  <span className={s.ivm_history_num}>{h.invNo}</span>
                  <span>{h.clientName || (isKo ? '(수신인 없음)' : '(no client)')}</span>
                  <span className={s.ivm_history_meta}>{fmt(h.items.reduce((s,it)=>s+it.qty*it.unitPrice,0) * (1 + h.taxRate/100), h.countryMode)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={s.ivm_actions}>
        <button className={`${s.ivm_btn} ${s.ivm_btn_primary}`} onClick={exportPDF}>
          📄 {isKo ? 'PDF 저장' : 'Save PDF'}
        </button>
        <button className={`${s.ivm_btn} ${s.ivm_btn_green}`} onClick={exportExcel}>
          📊 {isKo ? 'Excel 저장' : 'Save Excel'}
        </button>
        <button className={`${s.ivm_btn} ${s.ivm_btn_orange}`} onClick={genShareLink}>
          🔗 {isKo ? '암호화 공유링크' : 'Encrypted Share'}
        </button>
        <button className={`${s.ivm_btn} ${s.ivm_btn_slate}`}
          onClick={() => {
            saveToHistory(data);
            showToast(isKo ? '저장되었습니다' : 'Saved to history');
          }}>
          💾 {isKo ? '저장' : 'Save'}
        </button>
      </div>
      {shareUrl && (
        <p style={{ textAlign:'center', fontSize:'0.75rem', color:'#64748b', maxWidth:900, margin:'0 auto 1rem', wordBreak:'break-all' }}>
          {shareUrl}
        </p>
      )}

      {/* Off-screen PDF preview */}
      <div ref={previewRef} className={s.ivm_preview}>
        <div className={s.ivm_preview_header}>
          <div>
            {data.issuer.logoBase64 && <img src={data.issuer.logoBase64} className={s.ivm_preview_logo} alt="logo" />}
          </div>
          <div>
            <p className={s.ivm_preview_title}>{data.countryMode === 'KR' ? '세금계산서 / 견적서' : 'INVOICE'}</p>
            <p className={s.ivm_preview_meta}># {data.invNo}</p>
            <p className={s.ivm_preview_meta}>{isKo ? '발행일' : 'Issue'}: {fmtDate(data.issueDate)}</p>
            {data.dueDate && <p className={s.ivm_preview_meta}>{isKo ? '납기일' : 'Due'}: {fmtDate(data.dueDate)}</p>}
          </div>
        </div>

        <div className={s.ivm_preview_parties}>
          <div>
            <p className={s.ivm_preview_party_label}>{isKo ? '발행인' : 'FROM'}</p>
            <p className={s.ivm_preview_party_name}>{data.issuer.name}</p>
            <p className={s.ivm_preview_party_info}>
              {data.issuer.email}{data.issuer.email && <br />}
              {data.issuer.phone}{data.issuer.phone && <br />}
              {data.issuer.address}{data.issuer.address && <br />}
              {data.issuer.bizNo && (data.countryMode === 'KR' ? `사업자번호: ${data.issuer.bizNo}` : `EIN: ${data.issuer.bizNo}`)}
            </p>
          </div>
          <div>
            <p className={s.ivm_preview_party_label}>{isKo ? '수신인' : 'BILL TO'}</p>
            <p className={s.ivm_preview_party_name}>{data.clientName}</p>
            <p className={s.ivm_preview_party_info}>
              {data.clientEmail}{data.clientEmail && <br />}
              {data.clientAddress}
            </p>
          </div>
        </div>

        <table className={s.ivm_preview_table}>
          <thead>
            <tr>
              <th>{isKo ? '품목명' : 'Description'}</th>
              <th style={{ textAlign:'right' }}>{isKo ? '수량' : 'Qty'}</th>
              <th style={{ textAlign:'right' }}>{isKo ? '단가' : 'Unit Price'}</th>
              <th style={{ textAlign:'right' }}>{isKo ? '금액' : 'Amount'}</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(it => (
              <tr key={it.id}>
                <td>{it.desc}</td>
                <td style={{ textAlign:'right' }}>{it.qty}</td>
                <td style={{ textAlign:'right' }}>{fmt(it.unitPrice, data.countryMode)}</td>
                <td style={{ textAlign:'right' }}>{fmt(it.qty * it.unitPrice, data.countryMode)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={s.ivm_preview_totals}>
          <div className={s.ivm_preview_totals_inner}>
            <div className={s.ivm_preview_tot_row}><span>{isKo ? '소계' : 'Subtotal'}</span><span>{fmt(subtotal, data.countryMode)}</span></div>
            <div className={s.ivm_preview_tot_row}><span>{taxLabel} ({data.taxRate}%)</span><span>{fmt(taxAmount, data.countryMode)}</span></div>
            <div className={s.ivm_preview_tot_final}><span>{isKo ? '합계' : 'TOTAL'}</span><span>{fmt(total, data.countryMode)}</span></div>
          </div>
        </div>

        {data.notes && (
          <p className={s.ivm_preview_note}>
            <strong>{isKo ? '비고' : 'Notes'}:</strong> {data.notes}
          </p>
        )}

        <div className={s.ivm_preview_footer}>
          <div className={s.ivm_preview_qr_wrap}>
            {data.payLink && (
              <div className={s.ivm_preview_qr_item}>
                <QRCodeSVG value={payQrValue} size={64} />
                <span>{isKo ? '결제 QR' : 'Pay QR'}</span>
              </div>
            )}
          </div>
          <p className={s.ivm_preview_watermark}>Created with TheUtilHub · theutilhub.com</p>
        </div>
      </div>

      {/* SEO Section */}
      <section className={s.ivm_seo}>
        <h2>{isKo ? '📌 인보이스 & 견적서 메이커란?' : '📌 What is the Invoice & Quote Maker?'}</h2>
        <p>
          {isKo
            ? '프리랜서, 소규모 사업자, 개인 사업자라면 클라이언트에게 견적서·인보이스·세금계산서를 발행하는 일이 빈번합니다. 하지만 기존 솔루션들은 구독료가 필요하거나 회원가입이 필수였습니다. 본 도구는 브라우저 내에서 완전 무료로 작동하며, 입력한 데이터는 사용자의 브라우저 로컬 스토리지에만 저장됩니다. 서버로 전송되거나 제3자와 공유되지 않아 보안상 안전합니다. 한국(KRW, 부가세/원천징수)과 미국(USD, Sales Tax) 모드를 지원하며, PDF·Excel 동시 출력과 암호화 공유 링크 기능을 제공합니다.'
            : 'Freelancers and small business owners frequently need to issue quotes, invoices, and receipts. Traditional solutions require subscriptions or account creation. This tool runs entirely in your browser for free — all data stays in your local storage, never sent to any server. It supports both Korea (KRW, VAT/withholding) and US (USD, Sales Tax) modes, with PDF & Excel export and encrypted share links.'}
        </p>

        <h2>{isKo ? '🔢 자동 인보이스 번호 채번 방식' : '🔢 Smart Auto Invoice Numbering'}</h2>
        <p>
          {isKo
            ? '인보이스 번호는 INV-YYYYMMDD-001 형식으로 자동 생성됩니다. 같은 날 여러 장을 발행하면 001, 002, 003... 순서로 자동 증가합니다. 수동으로 번호를 편집할 수 있으며, 편집된 번호를 기준으로 다음 발행 번호가 이어집니다. 재생성 버튼을 누르면 오늘 날짜 기준의 최신 번호로 갱신됩니다.'
            : 'Invoice numbers are auto-generated in INV-YYYYMMDD-001 format. Issuing multiple on the same day increments the sequence automatically (001, 002, 003...). You can manually edit the number and the next invoice will continue from your edited value. The Regen button refreshes to today\'s latest sequence.'}
        </p>

        <h2>{isKo ? '❓ 자주 묻는 질문 (FAQ)' : '❓ Frequently Asked Questions'}</h2>
        <dl>
          <dt>{isKo ? 'Q. 상업적으로 사용해도 되나요?' : 'Q. Can I use this commercially?'}</dt>
          <dd>{isKo ? 'A. 개인 및 기업 모두 완전 무료로 사용 가능합니다. 별도 구독이나 결제가 필요 없습니다.' : 'A. Yes, completely free for both personal and commercial use. No subscription or payment required.'}</dd>

          <dt>{isKo ? 'Q. 입력한 데이터가 사라지면 어떻게 하나요?' : 'Q. What if my data disappears?'}</dt>
          <dd>{isKo ? 'A. 데이터는 서버가 아닌 브라우저 로컬 스토리지에 저장됩니다. 브라우저 캐시를 초기화하거나 시크릿 모드를 사용하면 데이터가 사라질 수 있습니다. 중요한 인보이스는 반드시 PDF/Excel로 저장해 두세요.' : 'A. Data is stored in browser localStorage, not on a server. Clearing browser cache or using incognito mode will erase it. Always save important invoices as PDF or Excel.'}</dd>

          <dt>{isKo ? 'Q. QR 코드가 인식되지 않아요.' : 'Q. The QR code is not scanning.'}</dt>
          <dd>{isKo ? 'A. 결제 링크가 올바른 형식인지 확인하세요. 카카오페이는 https://qr.kakaopay.com/... 또는 https://toss.me/... 형식, PayPal은 https://paypal.me/... 형식이어야 합니다.' : 'A. Verify the payment link format. PayPal links should be https://paypal.me/..., Venmo links https://venmo.com/..., etc. Incorrect URLs will generate a QR that points to the wrong address.'}</dd>

          <dt>{isKo ? 'Q. PDF에서 한글이 깨져 보여요.' : 'Q. Korean text is garbled in the PDF.'}</dt>
          <dd>{isKo ? 'A. 본 도구는 html2canvas 방식으로 PDF를 생성하므로 브라우저에서 보이는 화면을 그대로 이미지화합니다. 브라우저를 최신 버전으로 업데이트하고, 운영체제에 한글 폰트(Pretendard, 나눔고딕)가 설치되어 있는지 확인하세요.' : 'A. The PDF is generated as a screenshot image via html2canvas, so it renders exactly what your browser shows. Make sure your browser is up to date and system fonts are properly installed.'}</dd>

          <dt>{isKo ? 'Q. 로고가 PDF에 안 나와요.' : 'Q. My logo doesn\'t appear in the PDF.'}</dt>
          <dd>{isKo ? 'A. 이미지 파일 용량을 1MB 이하로 최적화한 후 다시 업로드해 보세요. 큰 이미지는 Base64 변환 과정에서 처리 지연이 발생할 수 있습니다.' : 'A. Optimize your image to under 1MB and re-upload. Large images can cause processing delays during Base64 conversion and may not render correctly in the export.'}</dd>
        </dl>

        <h2>{isKo ? '🔐 암호화 공유 링크 보안 안내' : '🔐 Encrypted Share Link Security'}</h2>
        <p>
          {isKo
            ? '공유 링크 생성 시 입력된 데이터는 lz-string으로 압축 후 AES-256 알고리즘으로 암호화되어 URL에 포함됩니다. 계좌번호·은행 정보 등 민감한 금융 정보는 URL에서 자동 제외됩니다. 링크를 받는 상대방은 인보이스 내용을 바로 확인하고 자신의 브라우저에서 편집·출력할 수 있습니다.'
            : 'When you generate a share link, all data is compressed with lz-string and encrypted with AES-256 before being included in the URL. Sensitive financial information like bank account numbers is automatically excluded from the shared link. The recipient can view the invoice in their browser, edit it, and export their own copy.'}
        </p>

        <h2>{isKo ? '⚠️ 면책 조항' : '⚠️ Disclaimer'}</h2>
        <p>
          {isKo
            ? '본 도구는 정보 제공 목적으로만 사용되며, 세무·법률 조언을 구성하지 않습니다. 부가세, 원천징수, Sales Tax 등 세금 계산의 정확성은 사용자가 직접 확인해야 하며, 정확한 세금 신고 및 납부는 반드시 공인 세무사 또는 세무 전문가와 상담하시기 바랍니다. 본 서비스는 생성된 문서의 법적 효력을 보장하지 않습니다.'
            : 'This tool is for informational purposes only and does not constitute tax, accounting, or legal advice. Tax calculations (VAT, withholding tax, sales tax) should be verified independently. Always consult a qualified tax professional or CPA for accurate tax reporting. This service does not guarantee the legal validity of any generated documents.'}
        </p>
      </section>

      {toast && <div className={s.ivm_toast}>{toast}</div>}
    </div>
  );
}
