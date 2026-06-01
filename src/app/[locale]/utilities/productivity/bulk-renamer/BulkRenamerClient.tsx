'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  FileEdit,
  Upload,
  FolderOpen,
  Download,
  FolderInput,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './bulk-renamer.module.css';

// ── constants ──
const ROW_H = 40;
const VIEWPORT_H = 480;
const OVERSCAN = 6;
const ZIP_MAX_FILES = 500;
const ZIP_MAX_BYTES = 1024 * 1024 * 1024; // 1GB

const RESERVED = new Set<string>(['CON', 'PRN', 'AUX', 'NUL']);
for (let i = 1; i <= 9; i++) {
  RESERVED.add('COM' + i);
  RESERVED.add('LPT' + i);
}

type CaseMode = 'none' | 'lower' | 'upper' | 'title';
type DateMode = 'none' | 'prefix' | 'suffix';
type NumPos = 'prefix' | 'suffix';
type SortMode = 'original' | 'name' | 'date';
type Resolution = 'skip' | 'replace' | 'keepboth';

interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  lastModified: number;
}

interface RowResult {
  id: string;
  before: string;
  after: string;
  normalized: boolean;
  conflict: boolean;
}

// ── helpers ──
function splitName(n: string): { base: string; ext: string } {
  const i = n.lastIndexOf('.');
  if (i <= 0) return { base: n, ext: '' };
  return { base: n.slice(0, i), ext: n.slice(i) };
}

function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeName(name: string): { out: string; changed: boolean } {
  const { base, ext } = splitName(name);
  let nb = base.replace(/[\\/:*?"<>|]/g, '_');
  // eslint-disable-next-line no-control-regex
  nb = nb.replace(/[\x00-\x1f]/g, '');
  nb = nb.replace(/[ .]+$/, '');
  if (RESERVED.has(nb.toUpperCase())) nb = nb + '_';
  if (nb === '') nb = 'unnamed';
  // eslint-disable-next-line no-control-regex
  const ne = ext.replace(/[\\/:*?"<>|\x00-\x1f]/g, '_');
  const changed = nb !== base || ne !== ext;
  return { out: nb + ne, changed };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

function todayString(fmt: string): string {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const yy = yyyy.slice(2);
  const mm = pad(d.getMonth() + 1, 2);
  const dd = pad(d.getDate(), 2);
  if (fmt === 'YYYYMMDD') return `${yyyy}${mm}${dd}`;
  if (fmt === 'YYMMDD') return `${yy}${mm}${dd}`;
  return `${yyyy}-${mm}-${dd}`;
}

export default function BulkRenamerClient() {
  const t = useTranslations('BulkRenamer');

  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('original');
  const [scrollTop, setScrollTop] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [supportsFolder, setSupportsFolder] = useState(false);
  const [overwrite, setOverwrite] = useState<{ count: number } | null>(null);

  // ── rule state ──
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [whitespace, setWhitespace] = useState(false);
  const [caseMode, setCaseMode] = useState<CaseMode>('none');
  const [fullRename, setFullRename] = useState(false);
  const [fullBase, setFullBase] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [dateMode, setDateMode] = useState<DateMode>('none');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [numbering, setNumbering] = useState(false);
  const [numStart, setNumStart] = useState('1');
  const [numPad, setNumPad] = useState('3');
  const [numPos, setNumPos] = useState<NumPos>('suffix');
  const [numSep, setNumSep] = useState('_');
  const [extEnable, setExtEnable] = useState(false);
  const [extValue, setExtValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const dirHandleRef = useRef<unknown>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSupportsFolder(typeof window !== 'undefined' && 'showDirectoryPicker' in window);
  }, []);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ── add files ──
  const addFiles = useCallback((list: FileList | File[]) => {
    const arr = Array.from(list);
    if (arr.length === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      arr.forEach((file, i) => {
        next.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${prev.length + i}`,
          file,
          name: file.name,
          size: file.size,
          lastModified: file.lastModified || 0,
        });
      });
      return next;
    });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  // ── regex validity ──
  const regexError = useMemo(() => {
    if (!useRegex || !find) return false;
    try {
      new RegExp(find);
      return false;
    } catch {
      return true;
    }
  }, [useRegex, find]);

  // ── sorted files ──
  const sortedFiles = useMemo(() => {
    const copy = [...files];
    if (sortMode === 'name') {
      copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    } else if (sortMode === 'date') {
      copy.sort((a, b) => a.lastModified - b.lastModified);
    }
    return copy;
  }, [files, sortMode]);

  // ── transform pipeline (8 steps + V5 normalize + conflict avoidance) ──
  const results = useMemo<RowResult[]>(() => {
    const dateStr = dateMode !== 'none' ? todayString(dateFormat) : '';
    const start = parseInt(numStart, 10);
    const padW = Math.max(0, Math.min(10, parseInt(numPad, 10) || 0));
    const usedLower = new Map<string, number>();

    return sortedFiles.map((item, idx) => {
      let { base } = splitName(item.name);
      const orig = splitName(item.name);
      let ext = orig.ext;

      // 1. find / replace
      if (find) {
        try {
          if (useRegex) {
            const re = new RegExp(find, 'g');
            base = base.replace(re, replace);
          } else {
            base = base.split(find).join(replace);
          }
        } catch {
          /* invalid regex → skip this rule */
        }
      }
      // 2. whitespace cleanup
      if (whitespace) base = base.trim().replace(/\s+/g, ' ');
      // 3. case
      if (caseMode === 'lower') base = base.toLowerCase();
      else if (caseMode === 'upper') base = base.toUpperCase();
      else if (caseMode === 'title') base = titleCase(base);
      // 4. full rename
      if (fullRename) base = fullBase || 'file';
      // 5. prefix / suffix
      if (prefix) base = prefix + base;
      if (suffix) base = base + suffix;
      // 6. date
      if (dateMode === 'prefix') base = `${dateStr}_${base}`;
      else if (dateMode === 'suffix') base = `${base}_${dateStr}`;
      // 7. numbering
      if (numbering && !isNaN(start)) {
        const numStr = pad(start + idx, padW);
        if (numPos === 'prefix') base = `${numStr}${numSep}${base}`;
        else base = `${base}${numSep}${numStr}`;
      }
      // 8. extension unify
      if (extEnable && extValue) {
        const clean = extValue.replace(/^\.+/, '').trim();
        ext = clean ? `.${clean}` : ext;
      }

      // V5. normalize forbidden chars
      const { out: normalized, changed } = normalizeName(base + ext);

      // conflict avoidance
      let finalName = normalized;
      const lower = finalName.toLowerCase();
      if (usedLower.has(lower)) {
        const sp = splitName(normalized);
        let n = usedLower.get(lower)! + 1;
        let candidate: string;
        do {
          candidate = `${sp.base}_${n}${sp.ext}`;
          n++;
        } while (usedLower.has(candidate.toLowerCase()));
        usedLower.set(lower, n - 1);
        usedLower.set(candidate.toLowerCase(), 0);
        finalName = candidate;
        return { id: item.id, before: item.name, after: finalName, normalized: changed, conflict: true };
      }
      usedLower.set(lower, 0);
      return { id: item.id, before: item.name, after: finalName, normalized: changed, conflict: false };
    });
  }, [
    sortedFiles, find, replace, useRegex, whitespace, caseMode, fullRename, fullBase,
    prefix, suffix, dateMode, dateFormat, numbering, numStart, numPad, numPos, numSep, extEnable, extValue,
  ]);

  const anyNormalized = useMemo(() => results.some((r) => r.normalized), [results]);
  const totalBytes = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);
  const zipBlocked = files.length > ZIP_MAX_FILES || totalBytes > ZIP_MAX_BYTES;

  // ── virtual scroll window ──
  const total = results.length;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const endIdx = Math.min(total, Math.ceil((scrollTop + VIEWPORT_H) / ROW_H) + OVERSCAN);
  const visible = results.slice(startIdx, endIdx);

  // ── ZIP download ──
  const downloadZip = useCallback(async () => {
    if (isProcessing || zipBlocked || results.length === 0) return;
    setIsProcessing(true);
    setProgress({ done: 0, total: results.length });
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const byId = new Map(files.map((f) => [f.id, f.file]));
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        const file = byId.get(r.id);
        if (file) zip.file(r.after, file);
        setProgress({ done: i + 1, total: results.length });
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'renamed-files.zip';
      a.click();
      URL.revokeObjectURL(url);
      showToast(t('done_zip'));
    } catch {
      showToast(t('error_generic'));
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [isProcessing, zipBlocked, results, files, showToast, t]);

  // ── folder save ──
  const performWrite = useCallback(
    async (dirHandle: any, conflictSet: Set<string>, resolution: Resolution | null) => {
      setIsProcessing(true);
      setProgress({ done: 0, total: results.length });
      const byId = new Map(files.map((f) => [f.id, f.file]));
      const used = new Set<string>(conflictSet);
      let saved = 0;
      try {
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          const file = byId.get(r.id);
          setProgress({ done: i + 1, total: results.length });
          if (!file) continue;
          let name = r.after;
          const isConflict = conflictSet.has(name.toLowerCase());
          if (isConflict && resolution === 'skip') continue;
          if (isConflict && resolution === 'keepboth') {
            const sp = splitName(name);
            let n = 1;
            let cand: string;
            do {
              cand = `${sp.base}_${n}${sp.ext}`;
              n++;
            } while (used.has(cand.toLowerCase()));
            name = cand;
          }
          used.add(name.toLowerCase());
          const fh = await dirHandle.getFileHandle(name, { create: true });
          const writable = await fh.createWritable();
          await writable.write(file);
          await writable.close();
          saved++;
        }
        showToast(t('done_folder', { count: saved }));
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          showToast(t('cancelled'));
        } else {
          showToast(t('error_generic'));
        }
      } finally {
        setIsProcessing(false);
        setProgress(null);
        setOverwrite(null);
      }
    },
    [results, files, showToast, t]
  );

  const saveToFolder = useCallback(async () => {
    if (isProcessing || results.length === 0 || !supportsFolder) return;
    try {
      const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      // permission guard
      if (dirHandle.queryPermission) {
        const perm = await dirHandle.queryPermission({ mode: 'readwrite' });
        if (perm !== 'granted') {
          const req = await dirHandle.requestPermission({ mode: 'readwrite' });
          if (req !== 'granted') {
            showToast(t('error_generic'));
            return;
          }
        }
      }
      dirHandleRef.current = dirHandle;

      // pre-check conflicts
      const conflictSet = new Set<string>();
      for (const r of results) {
        try {
          await dirHandle.getFileHandle(r.after, { create: false });
          conflictSet.add(r.after.toLowerCase());
        } catch {
          /* not found → no conflict */
        }
      }

      if (conflictSet.size > 0) {
        // stash and open modal
        (dirHandleRef.current as any).__conflictSet = conflictSet;
        setOverwrite({ count: conflictSet.size });
        return;
      }
      await performWrite(dirHandle, conflictSet, null);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        showToast(t('cancelled'));
      } else {
        showToast(t('error_generic'));
      }
    }
  }, [isProcessing, results, supportsFolder, performWrite, showToast, t]);

  const resolveOverwrite = useCallback(
    (resolution: Resolution) => {
      const dirHandle = dirHandleRef.current as any;
      if (!dirHandle) return;
      const conflictSet: Set<string> = dirHandle.__conflictSet || new Set();
      performWrite(dirHandle, conflictSet, resolution);
    },
    [performWrite]
  );

  const clearFiles = () => {
    setFiles([]);
    setScrollTop(0);
  };

  return (
    <div className={s.container}>
      <NavigationActions />

      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.icon_wrap}>
          <FileEdit size={40} color="#8b5cf6" />
        </div>
        <h1 className={s.title}>{t('title')}</h1>
        <p className={s.subtitle}>{t('subtitle')}</p>
      </header>

      {/* ── Step 1: input ── */}
      <section className={s.panel}>
        <h2 className={s.step_title}>{t('step1_title')}</h2>
        <div
          className={`${s.dropzone} ${dragActive ? s.dropzone_active : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
        >
          <Upload size={32} color="#3b82f6" />
          <span className={s.dropzone_text}>{t('dropzone_text')}</span>
          <div className={s.dropzone_btns}>
            <button className={`${s.btn} ${s.btn_primary}`} onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> {t('select_files_btn')}
            </button>
            <button className={`${s.btn} ${s.btn_ghost}`} onClick={() => folderInputRef.current?.click()}>
              <FolderOpen size={16} /> {t('select_folder_btn')}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
          />
          <input
            ref={folderInputRef}
            type="file"
            hidden
            multiple
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
            {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
          />
        </div>
        <p className={s.security_notice}>{t('security_notice')}</p>
        {files.length > 0 && (
          <div className={s.files_bar}>
            <span>{t('files_summary', { count: files.length, size: formatBytes(totalBytes) })}</span>
            <button className={s.clear_btn} onClick={clearFiles}>
              <Trash2 size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />
              {t('clear_files')}
            </button>
          </div>
        )}
      </section>

      {/* ── Step 2: rules + preview ── */}
      {files.length > 0 && (
        <section className={s.panel}>
          <h2 className={s.step_title}>{t('step2_title')}</h2>
          <div className={s.step2_grid}>
            {/* rules */}
            <div className={s.rules}>
              {/* find/replace */}
              <div className={s.rule_group}>
                <p className={s.rule_group_title}>{t('find_replace_title')}</p>
                <div className={s.field}>
                  <label className={s.field_label}>{t('find_label')}</label>
                  <input className={s.input} value={find} onChange={(e) => setFind(e.target.value)} />
                </div>
                <div className={s.field}>
                  <label className={s.field_label}>{t('replace_label')}</label>
                  <input className={s.input} value={replace} onChange={(e) => setReplace(e.target.value)} />
                </div>
                <label className={s.check_row}>
                  <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} />
                  {t('use_regex_label')}
                </label>
                {regexError && <span className={s.regex_err}>{t('regex_error')}</span>}
              </div>

              {/* whitespace */}
              <div className={s.rule_group}>
                <p className={s.rule_group_title}>{t('whitespace_title')}</p>
                <label className={s.check_row}>
                  <input type="checkbox" checked={whitespace} onChange={(e) => setWhitespace(e.target.checked)} />
                  {t('whitespace_enable')}
                </label>
              </div>

              {/* case */}
              <div className={s.rule_group}>
                <p className={s.rule_group_title}>{t('case_title')}</p>
                <div className={s.seg}>
                  {(['none', 'lower', 'upper', 'title'] as CaseMode[]).map((m) => (
                    <button
                      key={m}
                      className={`${s.seg_btn} ${caseMode === m ? s.seg_btn_active : ''}`}
                      onClick={() => setCaseMode(m)}
                      aria-pressed={caseMode === m}
                    >
                      {t(`case_${m === 'title' ? 'title_case' : m}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* full rename */}
              <div className={s.rule_group}>
                <p className={s.rule_group_title}>{t('fullrename_title')}</p>
                <label className={s.check_row}>
                  <input type="checkbox" checked={fullRename} onChange={(e) => setFullRename(e.target.checked)} />
                  {t('fullrename_enable')}
                </label>
                {fullRename && (
                  <div className={s.field} style={{ marginTop: '0.5rem' }}>
                    <label className={s.field_label}>{t('fullrename_base')}</label>
                    <input
                      className={s.input}
                      value={fullBase}
                      onChange={(e) => setFullBase(e.target.value)}
                      placeholder={t('fullrename_placeholder')}
                    />
                  </div>
                )}
              </div>

              {/* affix */}
              <div className={s.rule_group}>
                <p className={s.rule_group_title}>{t('affix_title')}</p>
                <div className={s.field}>
                  <label className={s.field_label}>{t('prefix_label')}</label>
                  <input className={s.input} value={prefix} onChange={(e) => setPrefix(e.target.value)} />
                </div>
                <div className={s.field}>
                  <label className={s.field_label}>{t('suffix_label')}</label>
                  <input className={s.input} value={suffix} onChange={(e) => setSuffix(e.target.value)} />
                </div>
              </div>

              {/* date */}
              <div className={s.rule_group}>
                <p className={s.rule_group_title}>{t('date_title')}</p>
                <div className={s.seg}>
                  {(['none', 'prefix', 'suffix'] as DateMode[]).map((m) => (
                    <button
                      key={m}
                      className={`${s.seg_btn} ${dateMode === m ? s.seg_btn_active : ''}`}
                      onClick={() => setDateMode(m)}
                      aria-pressed={dateMode === m}
                    >
                      {t(`date_${m}`)}
                    </button>
                  ))}
                </div>
                {dateMode !== 'none' && (
                  <div className={s.field} style={{ marginTop: '0.5rem' }}>
                    <label className={s.field_label}>{t('date_format_label')}</label>
                    <div className={s.seg}>
                      {['YYYY-MM-DD', 'YYYYMMDD', 'YYMMDD'].map((f) => (
                        <button
                          key={f}
                          className={`${s.seg_btn} ${dateFormat === f ? s.seg_btn_active : ''}`}
                          onClick={() => setDateFormat(f)}
                          aria-pressed={dateFormat === f}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* numbering */}
              <div className={s.rule_group}>
                <p className={s.rule_group_title}>{t('numbering_title')}</p>
                <label className={s.check_row}>
                  <input type="checkbox" checked={numbering} onChange={(e) => setNumbering(e.target.checked)} />
                  {t('numbering_enable')}
                </label>
                {numbering && (
                  <>
                    <div className={s.row2} style={{ marginTop: '0.5rem' }}>
                      <div className={s.field}>
                        <label className={s.field_label}>{t('numbering_start')}</label>
                        <input className={s.input} type="number" inputMode="numeric" value={numStart} onChange={(e) => setNumStart(e.target.value)} />
                      </div>
                      <div className={s.field}>
                        <label className={s.field_label}>{t('numbering_pad')}</label>
                        <input className={s.input} type="number" inputMode="numeric" value={numPad} onChange={(e) => setNumPad(e.target.value)} />
                      </div>
                    </div>
                    <div className={s.row2}>
                      <div className={s.field}>
                        <label className={s.field_label}>{t('numbering_position')}</label>
                        <div className={s.seg}>
                          {(['prefix', 'suffix'] as NumPos[]).map((p) => (
                            <button key={p} className={`${s.seg_btn} ${numPos === p ? s.seg_btn_active : ''}`} onClick={() => setNumPos(p)} aria-pressed={numPos === p}>
                              {t(`date_${p}`)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className={s.field}>
                        <label className={s.field_label}>{t('numbering_sep')}</label>
                        <input className={s.input} value={numSep} onChange={(e) => setNumSep(e.target.value)} maxLength={3} />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ext */}
              <div className={s.rule_group}>
                <p className={s.rule_group_title}>{t('ext_title')}</p>
                <label className={s.check_row}>
                  <input type="checkbox" checked={extEnable} onChange={(e) => setExtEnable(e.target.checked)} />
                  {t('ext_enable')}
                </label>
                {extEnable && (
                  <div className={s.field} style={{ marginTop: '0.5rem' }}>
                    <label className={s.field_label}>{t('ext_label')}</label>
                    <input className={s.input} value={extValue} onChange={(e) => setExtValue(e.target.value)} placeholder={t('ext_placeholder')} />
                  </div>
                )}
              </div>
            </div>

            {/* preview */}
            <div className={s.preview}>
              <div className={s.preview_head}>
                <h3 className={s.preview_title}>{t('preview_title')}</h3>
                <div className={s.seg}>
                  {(['original', 'name', 'date'] as SortMode[]).map((m) => (
                    <button key={m} className={`${s.seg_btn} ${sortMode === m ? s.seg_btn_active : ''}`} onClick={() => setSortMode(m)} aria-pressed={sortMode === m}>
                      {t(`sort_${m}`)}
                    </button>
                  ))}
                </div>
              </div>

              {anyNormalized && <div className={s.normalized_warn}>{t('normalized_warning')}</div>}
              {sortMode === 'date' && <p className={s.date_warn}>{t('sort_date_warning')}</p>}

              <div className={s.table_head}>
                <span>{t('col_index')}</span>
                <span>{t('col_before')}</span>
                <span>{t('col_after')}</span>
                <span />
              </div>

              <div
                className={s.viewport}
                onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
                role="grid"
                aria-rowcount={total}
              >
                <div className={s.spacer} style={{ height: total * ROW_H }}>
                  {visible.map((r, i) => {
                    const realIdx = startIdx + i;
                    return (
                      <div
                        key={r.id}
                        className={`${s.row} ${realIdx % 2 === 1 ? s.row_alt : ''}`}
                        style={{ top: realIdx * ROW_H }}
                        role="row"
                      >
                        <span className={s.cell_idx}>{realIdx + 1}</span>
                        <span className={s.cell} style={{ color: '#94a3b8' }} title={r.before}>{r.before}</span>
                        <span className={`${s.cell} ${s.cell_after} ${r.conflict ? s.cell_conflict : ''}`} title={r.after}>
                          {r.after}
                          {r.conflict && <span className={s.conflict_tag}>{t('conflict_badge')}</span>}
                        </span>
                        <span
                          className={s.badge_norm}
                          title={r.normalized ? t('normalized_tooltip') : undefined}
                          aria-label={r.normalized ? t('normalized_tooltip') : undefined}
                        >
                          {r.normalized && <AlertTriangle size={14} />}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Step 3: output ── */}
      {files.length > 0 && (
        <section className={s.panel}>
          <h2 className={s.step_title}>{t('step3_title')}</h2>
          <div className={s.output_row}>
            <button
              className={`${s.btn} ${s.btn_primary}`}
              onClick={downloadZip}
              disabled={isProcessing || zipBlocked || results.length === 0}
              aria-busy={isProcessing}
            >
              <Download size={16} /> {t('download_zip_btn')}
            </button>
            {supportsFolder && (
              <button
                className={`${s.btn} ${s.btn_ghost}`}
                onClick={saveToFolder}
                disabled={isProcessing || results.length === 0}
                aria-busy={isProcessing}
              >
                <FolderInput size={16} /> {t('save_folder_btn')}
              </button>
            )}
          </div>
          {zipBlocked && <p className={s.warn_text}>{t('zip_limit_warning')}</p>}
          {!supportsFolder && <p className={s.warn_text}>{t('folder_unsupported')}</p>}
          {progress && (
            <div className={s.progress_wrap}>
              <div className={s.progress_track}>
                <div className={s.progress_fill} style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
              <p className={s.progress_text}>{t('progress', { done: progress.done, total: progress.total })}</p>
            </div>
          )}
        </section>
      )}

      {/* ── bottom sections ── */}
      <ShareBar title={t('title')} description={t('subtitle')} />
      <RelatedTools toolId="utilities/productivity/bulk-renamer" />
      <div className={s.ad_placeholder}>{t('ad_text')}</div>

      <SeoSection
        ko={{
          title: '스마트 대량 파일명 변환기란 무엇인가요?',
          description:
            '스마트 대량 파일명 변환기는 여러 개의 파일 이름을 한 번에 규칙적으로 바꿔주는 100% 브라우저 기반 도구입니다. 윈도우 탐색기의 기본 이름 바꾸기는 순번이 "(1)" "(2)"처럼 지저분하게 붙고 세부 제어가 어렵지만, 이 도구는 찾기·바꾸기, 접두어·접미어 추가, 001 형식의 자유로운 넘버링, 오늘 날짜 삽입, 대소문자 변경, 공백 정리, 그리고 정규식까지 9가지 규칙을 정해진 순서대로 조합해 즉시 적용합니다. 가장 큰 특징은 보안입니다 — 파일을 끌어다 놓아도 어떤 서버로도 전송되지 않고, 이름 변경부터 ZIP 압축, 폴더 직접 저장까지 모든 처리가 사용자 브라우저 안에서만 일어납니다. 또한 윈도우·맥에서 파일명에 쓸 수 없는 특수문자(\\ / : * ? " < > |)나 예약어(CON, PRN 등)가 결과에 포함되면 미리보기 단계에서 자동으로 안전한 문자로 변환하고 해당 행에 표시해주므로, 저장 단계에서 오류로 멈추는 일이 없습니다. 변경 후 이름이 서로 겹치면 자동으로 _1, _2를 붙여 충돌도 회피합니다. 결과는 비포·애프터로 실시간 미리보기되며, 만족스러우면 ZIP으로 내려받거나(500개·1GB 이하) 지원 브라우저에서는 폴더에 직접 저장할 수 있습니다. 사진 정리, 자료 백업, 프로젝트 에셋 정돈 등 반복적인 이름 작업을 단 몇 초로 줄여줍니다.',
          useCases: [
            { icon: '📷', title: '여행 사진 일괄 정리', desc: '카메라가 붙인 DSC_0001 같은 무의미한 이름을 "제주여행_001" 형식으로 날짜와 넘버링을 더해 한 번에 깔끔하게 정리하고 ZIP으로 백업합니다.' },
            { icon: '🗂️', title: '업무 문서 규칙 통일', desc: '팀에서 제각각으로 저장된 보고서 파일에 접두어와 작성 날짜를 일괄로 붙여 사내 명명 규칙에 맞게 한 번에 표준화하여 검색성을 높입니다.' },
            { icon: '🎨', title: '디자인·개발 에셋 정돈', desc: '아이콘이나 이미지 에셋의 확장자를 통일하고 정규식으로 불필요한 접미어를 제거해 프로젝트 폴더를 일관된 규칙으로 정리합니다.' },
            { icon: '🔒', title: '민감 파일 오프라인 처리', desc: '계약서나 개인 자료처럼 외부 업로드가 꺼려지는 파일도 서버 전송 없이 브라우저 안에서만 이름을 바꿔 폴더에 바로 저장할 수 있습니다.' },
          ],
          steps: [
            { step: '파일 추가', desc: '1단계에서 파일을 드래그앤드롭하거나 파일·폴더 선택 버튼으로 추가합니다. 추가된 파일 개수와 총 용량이 요약으로 표시됩니다.' },
            { step: '변환 규칙 설정', desc: '2단계 좌측에서 찾기·바꾸기, 넘버링, 날짜, 정규식 등 원하는 규칙을 켭니다. 규칙은 정해진 8단계 순서로 적용되어 결과가 예측 가능합니다.' },
            { step: '미리보기로 확인', desc: '우측 표에서 변경 전·후 이름을 실시간으로 대조합니다. 사용 불가 문자가 변환된 행과 이름이 겹쳐 회피된 행이 표시로 안내됩니다.' },
            { step: 'ZIP 또는 폴더 저장', desc: '3단계에서 ZIP으로 내려받거나(500개·1GB 이하) 지원 브라우저에서는 폴더에 직접 저장합니다. 원본은 보존되고 새 이름의 파일이 생성됩니다.' },
          ],
          faqs: [
            { q: '업로드한 파일이 서버로 전송되거나 저장되나요?', a: '아닙니다. 이 도구는 100% 사용자 브라우저 안에서만 작동하며, 파일을 끌어다 놓아도 어떤 서버로도 전송되지 않습니다. 이름 변경, ZIP 압축, 폴더 저장 모든 과정이 사용자 기기 안에서만 일어나므로 민감한 파일도 안심하고 처리할 수 있습니다. 개발자 도구의 네트워크 탭으로 직접 확인하실 수 있습니다.' },
            { q: '윈도우에서 쓸 수 없는 특수문자가 이름에 들어가면 어떻게 되나요?', a: '슬래시(/), 콜론(:), 물음표(?) 같은 윈도우·맥에서 파일명에 쓸 수 없는 문자나 CON·PRN 같은 예약어는 미리보기 단계에서 자동으로 밑줄(_)로 변환되고, 변환된 행에는 작은 경고 아이콘이 표시됩니다. 덕분에 저장 단계에서 오류로 멈추지 않고 안전하게 파일이 생성됩니다.' },
            { q: '파일이 수백 개여도 한 번에 처리할 수 있나요?', a: 'ZIP 다운로드는 브라우저 메모리 안정성을 위해 500개 또는 총 1GB 이하로 제한됩니다. 그보다 많은 파일은 크롬·엣지 등에서 지원하는 폴더 직접 저장 기능을 사용하면 개수 제한 없이 처리할 수 있습니다. 미리보기는 가상 스크롤로 수천 개도 끊김 없이 표시됩니다.' },
            { q: '이 툴의 결과를 공식 자료로 사용해도 되나요?', a: '이 툴은 원본 파일을 그대로 두고 새 이름의 복사본을 생성하므로 비교적 안전하지만, 중요한 데이터는 작업 전 백업을 권장합니다. 계산이나 변환 결과는 참고용으로 제공되며, 대량 작업 전에는 소수의 파일로 먼저 결과를 확인해 보시기 바랍니다.' },
          ],
        }}
        en={{
          title: 'What is the Smart Bulk Renamer?',
          description:
            'The Smart Bulk Renamer is a 100% browser-based tool that renames many files at once with consistent rules. Windows Explorer\'s built-in rename appends messy "(1)" "(2)" suffixes and offers little control, but this tool combines nine rules — find/replace, prefix/suffix, flexible 001-style numbering, today\'s date insertion, case change, whitespace cleanup, and full regex — applied in a fixed order and previewed instantly. Its biggest strength is privacy: dropping files sends them to no server, and renaming, ZIP compression, and direct folder saving all happen entirely inside your browser. It also automatically converts characters that Windows and macOS forbid in filenames (\\ / : * ? " < > |) and reserved words (CON, PRN, etc.) into safe characters at the preview stage, flagging affected rows, so saving never crashes with an error. If renamed results collide, it appends _1, _2 to avoid conflicts. Results are previewed before and after in real time; when you are satisfied, download as a ZIP (up to 500 files / 1GB) or, in supported browsers, save straight to a folder. It turns repetitive renaming for photo organizing, backups, and project asset tidying into a few seconds of work.',
          useCases: [
            { icon: '📷', title: 'Organize Travel Photos', desc: 'Turn meaningless camera names like DSC_0001 into a clean "Jeju_Trip_001" format with date and numbering in one pass, then back up as a ZIP.' },
            { icon: '🗂️', title: 'Standardize Work Documents', desc: 'Batch-add a prefix and the authoring date to inconsistently named report files so they match your team naming convention and become easier to search.' },
            { icon: '🎨', title: 'Tidy Design & Dev Assets', desc: 'Unify the extension of icon or image assets and strip unneeded suffixes with regex to keep a project folder organized under one consistent rule.' },
            { icon: '🔒', title: 'Process Sensitive Files Offline', desc: 'Even files you would rather not upload, like contracts or personal data, can be renamed entirely in your browser and saved straight to a folder with no server transfer.' },
          ],
          steps: [
            { step: 'Add files', desc: 'In Step 1, drag and drop files or use the Select Files / Select Folder buttons. A summary shows the file count and total size that have been added.' },
            { step: 'Set the rules', desc: 'On the left of Step 2, enable the rules you want — find/replace, numbering, date, regex, and more. Rules apply in a fixed 8-step order so results stay predictable.' },
            { step: 'Check the preview', desc: 'The table on the right compares before and after names live. Rows where invalid characters were converted or names were de-duplicated are clearly flagged.' },
            { step: 'Save as ZIP or to a folder', desc: 'In Step 3, download as a ZIP (up to 500 files / 1GB) or save straight to a folder in supported browsers. Originals are preserved; new renamed files are created.' },
          ],
          faqs: [
            { q: 'Are my uploaded files sent to or stored on a server?', a: 'No. This tool runs entirely in your browser, and dropping files sends them to no server. Renaming, ZIP compression, and folder saving all happen on your device, so even sensitive files are safe to process. You can verify this yourself in the Network tab of your browser dev tools.' },
            { q: 'What happens if a name contains characters Windows forbids?', a: 'Characters that Windows and macOS forbid in filenames, such as slash (/), colon (:), and question mark (?), and reserved words like CON or PRN, are automatically replaced with an underscore (_) at the preview stage, and affected rows show a small warning icon. This prevents the save step from crashing and ensures files are created safely.' },
            { q: 'Can I process hundreds of files at once?', a: 'ZIP download is limited to 500 files or 1GB total for browser memory stability. For more, use the Save to Folder feature supported in Chrome, Edge, and similar browsers, which has no count limit. The preview uses virtual scrolling, so even thousands of files render smoothly.' },
            { q: 'Can I rely on this for important data?', a: 'The tool leaves originals untouched and creates renamed copies, so it is relatively safe, but we recommend backing up important data before any batch operation. Results are provided for reference; test with a few files first before processing a large batch.' },
          ],
        }}
      />

      {/* ── overwrite modal ── */}
      {overwrite && (
        <div className={s.modal_overlay} role="alertdialog" aria-modal="true" onClick={() => setOverwrite(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={s.modal_title}>{t('overwrite_title')}</h3>
            <p className={s.modal_body}>{t('overwrite_body', { count: overwrite.count })}</p>
            <div className={s.modal_actions}>
              <button className={`${s.btn} ${s.btn_primary}`} onClick={() => resolveOverwrite('keepboth')}>
                {t('overwrite_keepboth')}
              </button>
              <button className={`${s.btn} ${s.btn_ghost}`} onClick={() => resolveOverwrite('skip')}>
                {t('overwrite_skip')}
              </button>
              <button className={`${s.btn} ${s.btn_ghost}`} onClick={() => resolveOverwrite('replace')}>
                {t('overwrite_replace')}
              </button>
              <button className={`${s.btn} ${s.btn_ghost}`} onClick={() => setOverwrite(null)}>
                {t('modal_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={s.toast} role="status">{toast}</div>}
    </div>
  );
}
