'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { ParsedExcelData } from '../ExcelMapperClient';
import { ui } from '@/app/components/ui';
import s from '../excel-mapper.module.css';

interface Step1FileUploadProps {
  onComplete: (data: ParsedExcelData) => void;
}

export default function Step1FileUpload({ onComplete }: Step1FileUploadProps) {
  const t = useTranslations('SmartExcelMapper');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [allRows, setAllRows] = useState<any[][] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [sheetName, setSheetName] = useState<string>('');
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(1);
  const [dataStartRowIndex, setDataStartRowIndex] = useState<number>(2);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseExcelFile = async (file: File) => {
    setIsProcessing(true);
    try {
      // Dynamic import of xlsx
      const XLSX = await import('xlsx');

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to array of arrays (include all rows, including empty ones for now)
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '', // Default value for empty cells
        raw: false, // Convert everything to strings
      });

      setAllRows(jsonData);
      setFileName(file.name);
      setSheetName(firstSheetName);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      alert(t('parseError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      parseExcelFile(file);
    } else {
      alert(t('invalidFileType'));
    }
  }, [t]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseExcelFile(file);
    }
  };

  const handleContinue = () => {
    if (!allRows || allRows.length === 0) {
      alert(t('noData'));
      return;
    }

    // Validate indices
    if (headerRowIndex < 1 || headerRowIndex > allRows.length) {
      alert(t('invalidHeaderRow'));
      return;
    }

    if (dataStartRowIndex < 1 || dataStartRowIndex > allRows.length) {
      alert(t('invalidDataRow'));
      return;
    }

    if (dataStartRowIndex <= headerRowIndex) {
      alert(t('dataRowMustBeAfterHeader'));
      return;
    }

    // Extract headers and data rows
    const headers = allRows[headerRowIndex - 1].map((h: any) => String(h || '').trim());
    const dataRows = allRows.slice(dataStartRowIndex - 1).filter((row) => {
      // Filter out completely empty rows
      return row.some((cell) => cell !== '' && cell != null);
    });

    const parsedData: ParsedExcelData = {
      fileName,
      sheetName,
      allRows,
      headerRowIndex,
      dataStartRowIndex,
      headers,
      dataRows,
    };

    onComplete(parsedData);
  };

  return (
    <div>
      {!allRows ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`${s.dropzone} ${isDragging ? s.dropzoneActive : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {isProcessing ? t('processing') : t('uploadPrompt')}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('supportedFormats')}
          </p>
        </div>
      ) : (
        <div>
          <div className={`${ui.card} ${s.fileInfo}`}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{t('fileName')}:</strong> {fileName}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{t('sheetName')}:</strong> {sheetName}
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>{t('totalRows')}:</strong> {allRows.length}
            </div>
          </div>

          <div className={s.grid2}>
            <div className={ui.field}>
              <label className={ui.label}>
                {t('headerRowLabel')}
              </label>
              <input
                type="number"
                min={1}
                max={allRows.length}
                value={headerRowIndex}
                onChange={(e) => setHeaderRowIndex(parseInt(e.target.value) || 1)}
                className={ui.input}
              />
              <p className={ui.hint}>
                {t('headerRowHint')}
              </p>
            </div>

            <div className={ui.field}>
              <label className={ui.label}>
                {t('dataStartRowLabel')}
              </label>
              <input
                type="number"
                min={1}
                max={allRows.length}
                value={dataStartRowIndex}
                onChange={(e) => setDataStartRowIndex(parseInt(e.target.value) || 2)}
                className={ui.input}
              />
              <p className={ui.hint}>
                {t('dataStartRowHint')}
              </p>
            </div>
          </div>

          {/* Preview */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 className={ui.cardTitle}>
              {t('preview')}
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {allRows.slice(0, Math.min(10, allRows.length)).map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      style={{
                        background:
                          rowIndex === headerRowIndex - 1
                            ? 'var(--color-primary-light)'
                            : rowIndex >= dataStartRowIndex - 1
                            ? 'var(--surface)'
                            : 'var(--surface-hover)',
                      }}
                    >
                      <td
                        style={{
                          padding: '0.5rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          borderBottom: '1px solid var(--border)',
                          textAlign: 'center',
                          width: '50px',
                        }}
                      >
                        {rowIndex + 1}
                      </td>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          style={{
                            padding: '0.5rem',
                            borderBottom: '1px solid var(--border)',
                            color: rowIndex === headerRowIndex - 1 ? 'var(--color-primary)' : 'var(--text-primary)',
                            fontWeight: rowIndex === headerRowIndex - 1 ? 600 : 400,
                          }}
                        >
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {allRows.length > 10 && (
              <p className={`${ui.hint} ${s.tableNote}`}>
                {t('showingFirst10')}
              </p>
            )}
          </div>

          <div className={`${s.actions} ${s.actionsEnd}`}>
            <button
              onClick={() => {
                setAllRows(null);
                setFileName('');
                setSheetName('');
                setHeaderRowIndex(1);
                setDataStartRowIndex(2);
              }}
              className={`${ui.button} ${ui.secondary}`}
            >
              {t('reset')}
            </button>
            <button
              onClick={handleContinue}
              className={`${ui.button} ${ui.primary}`}
            >
              {t('continue')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
