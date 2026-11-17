'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ParsedExcelData, MappingRule } from '../ExcelMapperClient';
import { ui } from '@/app/components/ui';
import s from '../excel-mapper.module.css';

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
      <div className={`${ui.notice} ${ui.violet} ${s.howTo}`}>
        <h3 className={s.howToTitle}>
          📋 {t('howToUse')}
        </h3>
        <div className={s.howToBody}>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>1. {t('forFixedValue')}:</strong> {t('clickCellInstruction')}
          </p>
          <p>
            <strong>2. {t('forColumnMapping')}:</strong> {t('clickHeaderInstruction')}
          </p>
        </div>
      </div>

      {/* Target Column Input */}
      <div className={`${ui.card} ${ui.field} ${s.targetPanel}`}>
        <label className={ui.label}>
          {t('targetColumnName')}
        </label>
        <input
          type="text"
          value={targetColumnInput}
          onChange={(e) => setTargetColumnInput(e.target.value)}
          placeholder={t('targetColumnPlaceholder2')}
          className={ui.input}
        />
        {selectedCell && (
          <button
            onClick={handleAddFixedValue}
            className={`${ui.button} ${ui.primary} ${ui.block}`}
          >
            ✓ {t('addAsFixedValue')}
          </button>
        )}
      </div>

      {/* Excel Preview Table */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 className={ui.cardTitle}>
          {t('clickTableToMap')}
        </h3>
        <div style={{ overflowX: 'auto', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
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
                    position: 'sticky',
                    left: 0,
                    background: 'var(--color-primary-light)',
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
                      color: 'var(--color-primary)',
                      borderBottom: '2px solid var(--border)',
                      cursor: 'pointer',
                      background: 'var(--color-primary-light)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--tint-violet-border)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--color-primary-light)';
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
                        ? 'var(--tint-blue-bg)'
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
                          ? 'var(--tint-blue-bg)'
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
                            ? 'var(--tint-blue-fg)'
                            : 'var(--text-primary)',
                        fontWeight: rowIndex === parsedData.headerRowIndex - 1 ? 600 : 400,
                        cursor: 'pointer',
                        background:
                          selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                            ? 'var(--color-primary-light)'
                            : 'transparent',
                        transition: 'background 0.2s ease',
                        border:
                          selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                            ? '2px solid var(--color-primary)'
                            : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!(selectedCell?.row === rowIndex && selectedCell?.col === colIndex)) {
                          e.currentTarget.style.background = 'var(--surface-hover)';
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
          <p className={`${ui.hint} ${s.tableNote}`}>
            {t('showing15rows')} ({parsedData.allRows.length} {t('totalRows')})
          </p>
        )}
      </div>

      {/* Added Rules */}
      {rules.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 className={ui.cardTitle}>
            ✅ {t('addedRules')} ({rules.length})
          </h3>
          <div className={s.ruleList}>
            {rules.map((rule, index) => (
              <div
                key={rule.id}
                className={`${ui.card} ${s.ruleRow}`}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{rule.targetColumn}</span>
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
                  className={`${ui.button} ${ui.ghost} ${ui.sm}`}
                >
                  {t('remove')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={s.actions}>
        <button
          onClick={onBack}
          className={`${ui.button} ${ui.secondary}`}
        >
          {t('back')}
        </button>
        <button
          onClick={handleContinue}
          className={`${ui.button} ${ui.primary}`}
        >
          {t('continue')} ({rules.length})
        </button>
      </div>
    </div>
  );
}
