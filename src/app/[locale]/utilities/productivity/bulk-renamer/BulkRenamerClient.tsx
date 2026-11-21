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
import ToolHeader from '@/app/components/ToolHeader';
import RelatedTools from '@/app/components/RelatedTools';
import ShareBar from '@/app/components/ShareBar';
import s from './bulk-renamer.module.css';
import { ui } from '@/app/components/ui';

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

export default function BulkRenamerClient({ seo }: { seo?: React.ReactNode }) {
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
      <ToolHeader icon={<FileEdit />} title={t('title')} subtitle={t('subtitle')} />

      {/* ── Step 1: input ── */}
      <section className={ui.card}>
        <h2 className={ui.cardTitle}>{t('step1_title')}</h2>
        <div
          className={`${s.dropzone} ${dragActive ? s.dropzone_active : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
        >
          <Upload size={32} color="var(--tint-blue-fg)" />
          <span className={s.dropzone_text}>{t('dropzone_text')}</span>
          <div className={s.dropzone_btns}>
            <button className={`${ui.button} ${ui.primary}`} onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> {t('select_files_btn')}
            </button>
            <button className={`${ui.button} ${ui.secondary}`} onClick={() => folderInputRef.current?.click()}>
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
          <div className={`${ui.notice} ${ui.blue} ${s.files_bar}`}>
            <span>{t('files_summary', { count: files.length, size: formatBytes(totalBytes) })}</span>
            <button className={`${ui.button} ${ui.ghost} ${ui.sm}`} onClick={clearFiles}>
              <Trash2 size={13} />
              {t('clear_files')}
            </button>
          </div>
        )}
      </section>

      {/* ── Step 2: rules + preview ── */}
      {files.length > 0 && (
        <section className={ui.card}>
          <h2 className={ui.cardTitle}>{t('step2_title')}</h2>
          <div className={s.step2_grid}>
            {/* rules */}
            <div className={s.rules}>
              {/* find/replace */}
              <div className={s.rule_group}>
                <p className={s.rule_group_title}>{t('find_replace_title')}</p>
                <div className={ui.field}>
                  <label className={ui.label}>{t('find_label')}</label>
                  <input className={ui.input} value={find} onChange={(e) => setFind(e.target.value)} />
                </div>
                <div className={ui.field}>
                  <label className={ui.label}>{t('replace_label')}</label>
                  <input className={ui.input} value={replace} onChange={(e) => setReplace(e.target.value)} />
                </div>
                <label className={s.check_row}>
                  <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} />
                  {t('use_regex_label')}
                </label>
                {regexError && <span className={ui.error}>{t('regex_error')}</span>}
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
                <div className={ui.segmented}>
                  {(['none', 'lower', 'upper', 'title'] as CaseMode[]).map((m) => (
                    <button
                      key={m}
                      className={`${ui.segment} ${caseMode === m ? ui.segmentActive : ''}`}
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
                  <div className={ui.field} style={{ marginTop: '0.5rem' }}>
                    <label className={ui.label}>{t('fullrename_base')}</label>
                    <input
                      className={ui.input}
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
                <div className={ui.field}>
                  <label className={ui.label}>{t('prefix_label')}</label>
                  <input className={ui.input} value={prefix} onChange={(e) => setPrefix(e.target.value)} />
                </div>
                <div className={ui.field}>
                  <label className={ui.label}>{t('suffix_label')}</label>
                  <input className={ui.input} value={suffix} onChange={(e) => setSuffix(e.target.value)} />
                </div>
              </div>

              {/* date */}
              <div className={s.rule_group}>
                <p className={s.rule_group_title}>{t('date_title')}</p>
                <div className={ui.segmented}>
                  {(['none', 'prefix', 'suffix'] as DateMode[]).map((m) => (
                    <button
                      key={m}
                      className={`${ui.segment} ${dateMode === m ? ui.segmentActive : ''}`}
                      onClick={() => setDateMode(m)}
                      aria-pressed={dateMode === m}
                    >
                      {t(`date_${m}`)}
                    </button>
                  ))}
                </div>
                {dateMode !== 'none' && (
                  <div className={ui.field} style={{ marginTop: '0.5rem' }}>
                    <label className={ui.label}>{t('date_format_label')}</label>
                    <div className={ui.segmented}>
                      {['YYYY-MM-DD', 'YYYYMMDD', 'YYMMDD'].map((f) => (
                        <button
                          key={f}
                          className={`${ui.segment} ${dateFormat === f ? ui.segmentActive : ''}`}
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
                      <div className={ui.field}>
                        <label className={ui.label}>{t('numbering_start')}</label>
                        <input className={ui.input} type="number" inputMode="numeric" value={numStart} onChange={(e) => setNumStart(e.target.value)} />
                      </div>
                      <div className={ui.field}>
                        <label className={ui.label}>{t('numbering_pad')}</label>
                        <input className={ui.input} type="number" inputMode="numeric" value={numPad} onChange={(e) => setNumPad(e.target.value)} />
                      </div>
                    </div>
                    <div className={s.row2}>
                      <div className={ui.field}>
                        <label className={ui.label}>{t('numbering_position')}</label>
                        <div className={ui.segmented}>
                          {(['prefix', 'suffix'] as NumPos[]).map((p) => (
                            <button key={p} className={`${ui.segment} ${numPos === p ? ui.segmentActive : ''}`} onClick={() => setNumPos(p)} aria-pressed={numPos === p}>
                              {t(`date_${p}`)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className={ui.field}>
                        <label className={ui.label}>{t('numbering_sep')}</label>
                        <input className={ui.input} value={numSep} onChange={(e) => setNumSep(e.target.value)} maxLength={3} />
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
                  <div className={ui.field} style={{ marginTop: '0.5rem' }}>
                    <label className={ui.label}>{t('ext_label')}</label>
                    <input className={ui.input} value={extValue} onChange={(e) => setExtValue(e.target.value)} placeholder={t('ext_placeholder')} />
                  </div>
                )}
              </div>
            </div>

            {/* preview */}
            <div className={s.preview}>
              <div className={s.preview_head}>
                <h3 className={s.preview_title}>{t('preview_title')}</h3>
                <div className={ui.segmented}>
                  {(['original', 'name', 'date'] as SortMode[]).map((m) => (
                    <button key={m} className={`${ui.segment} ${sortMode === m ? ui.segmentActive : ''}`} onClick={() => setSortMode(m)} aria-pressed={sortMode === m}>
                      {t(`sort_${m}`)}
                    </button>
                  ))}
                </div>
              </div>

              {anyNormalized && <div className={`${ui.notice} ${ui.amber}`}>{t('normalized_warning')}</div>}
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
                        <span className={`${s.cell} ${s.cell_before}`} title={r.before}>{r.before}</span>
                        <span className={`${s.cell} ${s.cell_after} ${r.conflict ? s.cell_conflict : ''}`} title={r.after}>
                          {r.after}
                          {r.conflict && <span className={`${ui.badge} ${ui.amber} ${s.conflict_tag}`}>{t('conflict_badge')}</span>}
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
        <section className={ui.card}>
          <h2 className={ui.cardTitle}>{t('step3_title')}</h2>
          <div className={s.output_row}>
            <button
              className={`${ui.button} ${ui.primary}`}
              onClick={downloadZip}
              disabled={isProcessing || zipBlocked || results.length === 0}
              aria-busy={isProcessing}
            >
              <Download size={16} /> {t('download_zip_btn')}
            </button>
            {supportsFolder && (
              <button
                className={`${ui.button} ${ui.secondary}`}
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

      {seo}

      {/* ── overwrite modal ── */}
      {overwrite && (
        <div className={s.modal_overlay} role="alertdialog" aria-modal="true" onClick={() => setOverwrite(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={s.modal_title}>{t('overwrite_title')}</h3>
            <p className={s.modal_body}>{t('overwrite_body', { count: overwrite.count })}</p>
            <div className={s.modal_actions}>
              <button className={`${ui.button} ${ui.primary}`} onClick={() => resolveOverwrite('keepboth')}>
                {t('overwrite_keepboth')}
              </button>
              <button className={`${ui.button} ${ui.secondary}`} onClick={() => resolveOverwrite('skip')}>
                {t('overwrite_skip')}
              </button>
              <button className={`${ui.button} ${ui.secondary}`} onClick={() => resolveOverwrite('replace')}>
                {t('overwrite_replace')}
              </button>
              <button className={`${ui.button} ${ui.secondary}`} onClick={() => setOverwrite(null)}>
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
