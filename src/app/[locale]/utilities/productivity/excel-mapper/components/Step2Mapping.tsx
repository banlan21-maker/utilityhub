'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ParsedExcelData, MappingRule } from '../ExcelMapperClient';

interface Step2MappingProps {
  parsedData: ParsedExcelData;
  onComplete: (rules: MappingRule[]) => void;
  onBack: () => void;
}

export default function Step2Mapping({ parsedData, onComplete, onBack }: Step2MappingProps) {
  const t = useTranslations('SmartExcelMapper');
  const [rules, setRules] = useState<MappingRule[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [targetColumnInput, setTargetColumnInput] = useState('');

  // Handle cell click for fixed value broadcasting
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex });
  };

  // Handle header click for column mapping
  const handleHeaderClick = (colIndex: number) => {
    if (!targetColumnInput.trim()) {
      alert(t('pleaseEnterTargetColumn'));
      return;
    }

    const newRule: MappingRule = {
      id: Date.now().toString(),
      type: 'column',
      targetColumn: targetColumnInput,
      sourceColumnIndex: colIndex,
    };

    setRules([...rules, newRule]);
    setTargetColumnInput('');
  };

  // Add fixed value rule from selected cell
  const handleAddFixedValue = () => {
    if (!selectedCell) {
      alert(t('pleaseSelectCell'));
      return;
    }

    if (!targetColumnInput.trim()) {
      alert(t('pleaseEnterTargetColumn'));
      return;
    }

    const cellValue = parsedData.allRows[selectedCell.row][selectedCell.col];

    const newRule: MappingRule = {
      id: Date.now().toString(),
      type: 'fixed',
      targetColumn: targetColumnInput,
      fixedValue: String(cellValue || ''),
    };

    setRules([...rules, newRule]);
    setTargetColumnInput('');
    setSelectedCell(null);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleContinue = () => {
    if (rules.length === 0) {
      alert(t('noValidRules'));
      return;
    }

    onComplete(rules);
  };

  return (
    <div>
      {/* Instructions */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(249, 115, 22, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f97316', marginBottom: '1rem' }}>
          📋 {t('howToUse')}
        </h3>
        <div style={{ color: 'var(--text-primary)', lineHeight: 1.8 }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>1. {t('forFixedValue')}:</strong> {t('clickCellInstruction')}
          </p>
          <p>
            <strong>2. {t('forColumnMapping')}:</strong> {t('clickHeaderInstruction')}
          </p>
        </div>
      </div>

      {/* Target Column Input */}
      <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {t('targetColumnName')}
        </label>
        <input
          type="text"
          value={targetColumnInput}
          onChange={(e) => setTargetColumnInput(e.target.value)}
          placeholder={t('targetColumnPlaceholder2')}
          style={{
            width: '100%',
            padding: '0.875rem',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-hover)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontWeight: 500,
          }}
        />
        {selectedCell && (
          <button
            onClick={handleAddFixedValue}
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: '#f97316',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            ✓ {t('addAsFixedValue')}
          </button>
        )}
      </div>

      {/* Excel Preview Table */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          {t('clickTableToMap')}
        </h3>
        <div style={{ overflowX: 'auto', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(249, 115, 22, 0.15)' }}>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    borderBottom: '2px solid var(--border)',
                    width: '50px',
                    position: 'sticky',
                    left: 0,
                    background: 'rgba(249, 115, 22, 0.15)',
                  }}
                >
                  #
                </th>
                {parsedData.allRows[0]?.map((_, colIndex) => (
                  <th
                    key={colIndex}
                    onClick={() => handleHeaderClick(colIndex)}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#f97316',
                      borderBottom: '2px solid var(--border)',
                      cursor: 'pointer',
                      background: 'rgba(249, 115, 22, 0.15)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(249, 115, 22, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(249, 115, 22, 0.15)';
                    }}
                  >
                    Col {colIndex + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedData.allRows.slice(0, Math.min(15, parsedData.allRows.length)).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  style={{
                    background:
                      rowIndex === parsedData.headerRowIndex - 1
                        ? 'rgba(59, 130, 246, 0.1)'
                        : rowIndex >= parsedData.dataStartRowIndex - 1
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
                      position: 'sticky',
                      left: 0,
                      background:
                        rowIndex === parsedData.headerRowIndex - 1
                          ? 'rgba(59, 130, 246, 0.1)'
                          : rowIndex >= parsedData.dataStartRowIndex - 1
                          ? 'var(--surface)'
                          : 'var(--surface-hover)',
                    }}
                  >
                    {rowIndex + 1}
                  </td>
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      style={{
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--border)',
                        color:
                          rowIndex === parsedData.headerRowIndex - 1
                            ? '#3b82f6'
                            : 'var(--text-primary)',
                        fontWeight: rowIndex === parsedData.headerRowIndex - 1 ? 600 : 400,
                        cursor: 'pointer',
                        background:
                          selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                            ? 'rgba(249, 115, 22, 0.2)'
                            : 'transparent',
                        transition: 'background 0.2s ease',
                        border:
                          selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                            ? '2px solid #f97316'
                            : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!(selectedCell?.row === rowIndex && selectedCell?.col === colIndex)) {
                          e.currentTarget.style.background = 'rgba(249, 115, 22, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!(selectedCell?.row === rowIndex && selectedCell?.col === colIndex)) {
                          e.currentTarget.style.background = 'transparent';
                        }
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
        {parsedData.allRows.length > 15 && (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {t('showing15rows')} ({parsedData.allRows.length} {t('totalRows')})
          </p>
        )}
      </div>

      {/* Added Rules */}
      {rules.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            ✅ {t('addedRules')} ({rules.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {rules.map((rule, index) => (
              <div
                key={rule.id}
                style={{
                  padding: '1rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: '#f97316' }}>{rule.targetColumn}</span>
                  <span style={{ color: 'var(--text-secondary)', margin: '0 0.5rem' }}>←</span>
                  {rule.type === 'fixed' ? (
                    <span style={{ color: 'var(--text-primary)' }}>
                      {t('fixedValue')}: <strong>"{rule.fixedValue}"</strong>
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-primary)' }}>
                      {t('sourceColumn')}: <strong>Col {(rule.sourceColumnIndex ?? 0) + 1}</strong> (
                      {parsedData.headers[rule.sourceColumnIndex ?? 0] || t('emptyColumn')})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeRule(rule.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {t('remove')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
          onClick={handleContinue}
          style={{
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: '#f97316',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('continue')} ({rules.length})
        </button>
      </div>
    </div>
  );
}
