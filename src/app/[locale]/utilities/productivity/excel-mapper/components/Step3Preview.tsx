'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ParsedExcelData, MappingRule } from '../ExcelMapperClient';
import { ui } from '@/app/components/ui';
import s from '../excel-mapper.module.css';

interface Step3PreviewProps {
  parsedData: ParsedExcelData;
  mappingRules: MappingRule[];
  onBack: () => void;
  onReset: () => void;
}

export default function Step3Preview({ parsedData, mappingRules, onBack, onReset }: Step3PreviewProps) {
  const t = useTranslations('SmartExcelMapper');
  const [isExporting, setIsExporting] = useState(false);

  // Generate output data based on mapping rules
  const outputData = useMemo(() => {
    // Build header row from target columns
    const headers = mappingRules.map((rule) => rule.targetColumn);

    // Build data rows
    const rows = parsedData.dataRows.map((sourceRow) => {
      return mappingRules.map((rule) => {
        if (rule.type === 'fixed') {
          return rule.fixedValue || '';
        } else if (rule.type === 'column' && rule.sourceColumnIndex !== undefined) {
          return sourceRow[rule.sourceColumnIndex] || '';
        }
        return '';
      });
    });

    return [headers, ...rows];
  }, [parsedData, mappingRules]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Convert output data to worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(outputData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Mapped Data');

      // Generate file name
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `mapped_${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error exporting file:', error);
      alert(t('exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 className={ui.cardTitle}>
          {t('previewTitle')}
        </h3>
        <p className={s.previewDesc}>
          {t('previewDesc')}
        </p>

        {/* Stats */}
        <div className={s.stats}>
          <div className={`${ui.card} ${s.stat}`}>
            <div className={s.statValue}>
              {parsedData.dataRows.length}
            </div>
            <div className={ui.resultLabel}>
              {t('inputRows')}
            </div>
          </div>
          <div className={`${ui.card} ${s.stat}`}>
            <div className={s.statValue}>
              {outputData.length - 1}
            </div>
            <div className={ui.resultLabel}>
              {t('outputRows')}
            </div>
          </div>
          <div className={`${ui.card} ${s.stat}`}>
            <div className={s.statValue}>
              {mappingRules.length}
            </div>
            <div className={ui.resultLabel}>
              {t('columns')}
            </div>
          </div>
        </div>

        {/* Preview table */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-primary-light)' }}>
                  <th
                    style={{
                      padding: '0.75rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      borderBottom: '2px solid var(--border)',
                      width: '50px',
                    }}
                  >
                    #
                  </th>
                  {outputData[0].map((header, index) => (
                    <th
                      key={index}
                      style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        borderBottom: '2px solid var(--border)',
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outputData.slice(1, Math.min(11, outputData.length)).map((row, rowIndex) => (
                  <tr key={rowIndex} style={{ background: rowIndex % 2 === 0 ? 'var(--surface)' : 'var(--surface-hover)' }}>
                    <td
                      style={{
                        padding: '0.5rem',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {rowIndex + 1}
                    </td>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{
                          padding: '0.5rem',
                          color: 'var(--text-primary)',
                          borderBottom: '1px solid var(--border)',
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
          {outputData.length > 11 && (
            <p className={`${ui.hint} ${s.tableNote}`}>
              {t('showingFirst10Rows')} ({outputData.length - 1} {t('totalRows')})
            </p>
          )}
        </div>

        {/* Export button */}
        <div className={s.exportRow}>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`${ui.button} ${ui.primary} ${ui.lg}`}
          >
            {isExporting ? t('exporting') : t('exportExcel')}
          </button>
        </div>
      </div>

      <div className={s.actions}>
        <button
          onClick={onBack}
          className={`${ui.button} ${ui.secondary}`}
        >
          {t('back')}
        </button>
        <button
          onClick={onReset}
          className={`${ui.button} ${ui.secondary}`}
        >
          {t('startOver')}
        </button>
      </div>
    </div>
  );
}
