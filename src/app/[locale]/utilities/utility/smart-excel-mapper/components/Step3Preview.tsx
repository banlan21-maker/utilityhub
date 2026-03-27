'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ParsedExcelData, MappingRule } from '../page';

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
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          {t('previewTitle')}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {t('previewDesc')}
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f97316', marginBottom: '0.25rem' }}>
              {parsedData.dataRows.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {t('inputRows')}
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f97316', marginBottom: '0.25rem' }}>
              {outputData.length - 1}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {t('outputRows')}
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f97316', marginBottom: '0.25rem' }}>
              {mappingRules.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {t('columns')}
            </div>
          </div>
        </div>

        {/* Preview table */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(249, 115, 22, 0.1)' }}>
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
                        color: '#f97316',
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
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {t('showingFirst10Rows')} ({outputData.length - 1} {t('totalRows')})
            </p>
          )}
        </div>

        {/* Export button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              padding: '1rem 3rem',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: '#f97316',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: isExporting ? 'not-allowed' : 'pointer',
              opacity: isExporting ? 0.6 : 1,
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {isExporting ? t('exporting') : t('exportExcel')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('back')}
        </button>
        <button
          onClick={onReset}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('startOver')}
        </button>
      </div>
    </div>
  );
}
