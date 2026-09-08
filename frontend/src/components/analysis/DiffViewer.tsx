import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, AlertTriangle, FileCode2 } from 'lucide-react';
import { parseDiff } from '@/lib/utils';
import { SeverityBadge } from '@/components/ui/Badge';
import type { DiffFile, Finding } from '@/types';

interface DiffViewerProps {
  files: DiffFile[];
  findings: Finding[];
  selectedFindingId?: string;
  onSelectFinding?: (id: string) => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  python: '#3572A5',
  typescript: '#3178C6',
  javascript: '#f7df1e',
  go: '#00ADD8',
  rust: '#dea584',
};

function getLineClass(type: string): string {
  if (type === 'add') return 'diff-add';
  if (type === 'remove') return 'diff-remove';
  return 'diff-neutral';
}

function getLinePrefix(type: string): string {
  if (type === 'add') return '+';
  if (type === 'remove') return '-';
  return ' ';
}

interface FileTabProps {
  file: DiffFile;
  active: boolean;
  onClick: () => void;
  hasFinding: boolean;
}

function FileTab({ file, active, onClick, hasFinding }: FileTabProps) {
  const statusColors: Record<string, string> = {
    added: 'var(--color-pass)',
    modified: 'var(--color-medium)',
    deleted: 'var(--color-critical)',
    renamed: 'var(--color-accent)',
  };

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-1 px-4 py-3 text-[12px] transition-all border-l-[3px] font-mono w-full"
      style={{
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        borderLeftColor: active ? 'var(--color-accent)' : 'transparent',
        background: active ? 'var(--color-bg-elevated)' : 'transparent',
      }}
    >
      <div className="flex items-center gap-2 w-full">
      <span
        className="text-[9px] px-1 font-bold rounded uppercase"
        style={{
          background: `color-mix(in srgb, ${statusColors[file.status]} 15%, transparent)`,
          color: statusColors[file.status],
        }}
      >
        {file.status === 'added' ? 'A' : file.status === 'deleted' ? 'D' : 'M'}
      </span>
      <span>{file.filename.split('/').pop()}</span>
      </div>
      <div className="flex items-center justify-between w-full text-[10px]">
        <div className="flex items-center gap-1">
          <span style={{ color: 'var(--color-pass)' }}>+{file.additions}</span>
          <span style={{ color: 'var(--color-critical)' }}>-{file.deletions}</span>
        </div>
        {hasFinding && (
          <AlertTriangle size={11} className="text-rose-500" />
        )}
      </div>
    </button>
  );
}

export function DiffViewer({ files, findings, selectedFindingId, onSelectFinding }: DiffViewerProps) {
  const [activeFile, setActiveFile] = useState(files[0]?.filename ?? '');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedFinding = findings.find(f => f.id === selectedFindingId);

  // Auto-switch tab if selected finding belongs to a different file
  useEffect(() => {
    if (selectedFinding && selectedFinding.file !== activeFile) {
      if (files.some(f => f.filename === selectedFinding.file)) {
        setActiveFile(selectedFinding.file);
      }
    }
  }, [selectedFindingId]);

  // Smooth scroll to selected line when selectedFindingId changes
  useEffect(() => {
    if (selectedFinding) {
      const lineElem = document.getElementById(`diff-line-${selectedFinding.file}-${selectedFinding.line}`);
      if (lineElem) {
        lineElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedFindingId, activeFile]);

  const currentFile = files.find(f => f.filename === activeFile) ?? files[0];
  const fileFindings = findings.filter(f => f.file === currentFile?.filename);
  const findingMap = new Map(fileFindings.map(f => [f.line, f]));

  const parsedLines = currentFile ? parseDiff(currentFile.patch) : [];

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* File Tree Sidebar (Left) */}
      <div
        className="w-72 shrink-0 flex flex-col h-full border-r"
        style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="px-4 py-3 text-[11px] font-bold text-slate-100 uppercase tracking-widest border-b" style={{ borderColor: 'var(--color-border)' }}>
          Files Changed
        </div>
        <div className="flex-1 overflow-y-auto">
          {files.map(file => (
            <FileTab
              key={file.filename}
              file={file}
              active={file.filename === activeFile}
              onClick={() => setActiveFile(file.filename)}
              hasFinding={findings.some(f => f.file === file.filename)}
            />
          ))}
        </div>
      </div>

      {/* Code Diff Area (Right) */}
      <div
        className="flex-1 overflow-hidden flex flex-col h-full w-full"
        style={{
          background: '#0a0a10',
        }}
      >
        {/* Sticky File header */}
        <div
          className="flex items-center justify-between px-4 py-2 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-elevated)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
          <FileCode2 size={14} className="text-indigo-400 shrink-0" />
          <code className="text-[12px] font-mono truncate text-slate-100 font-semibold">
            {currentFile?.filename}
          </code>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {currentFile && (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold"
              style={{
                background: `${LANGUAGE_COLORS[currentFile.language] ?? '#888'}20`,
                color: LANGUAGE_COLORS[currentFile.language] ?? '#888',
              }}
            >
              {currentFile.language}
            </span>
          )}
          {fileFindings.length > 0 && (
            <span
              className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm"
              style={{
                background: 'var(--color-critical-muted)',
                color: 'var(--color-critical)',
                border: '1px solid var(--color-critical-border)',
              }}
            >
              <AlertTriangle size={11} />
              {fileFindings.length} issue{fileFindings.length > 1 ? 's' : ''} detected
            </span>
          )}
        </div>
      </div>

      {/* Code diff container */}
      <div ref={containerRef} className="overflow-x-auto overflow-y-auto flex-1 font-mono text-xs w-full">
        <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {parsedLines.map((line, idx) => {
              if (line.type === 'header') {
                return (
                  <tr key={idx}>
                    <td
                      colSpan={3}
                      className="px-4 py-1.5 font-mono text-[11px] font-semibold"
                      style={{ background: 'var(--color-bg-overlay)', color: 'var(--color-text-muted)' }}
                    >
                      {line.content}
                    </td>
                  </tr>
                );
              }

              const lineNum = line.newLineNum;
              const findingOnLine = lineNum ? findingMap.get(lineNum) : undefined;
              const isSelectedFindingLine = findingOnLine && findingOnLine.id === selectedFindingId;

              return (
                <React.Fragment key={idx}>
                  <tr
                    id={lineNum ? `diff-line-${currentFile?.filename}-${lineNum}` : undefined}
                    className={`transition-colors cursor-pointer ${getLineClass(line.type)} ${
                      isSelectedFindingLine ? 'bg-rose-950/40 ring-2 ring-rose-500 ring-inset' : findingOnLine ? 'bg-rose-950/20' : ''
                    }`}
                    onClick={() => {
                      if (findingOnLine && onSelectFinding) {
                        onSelectFinding(findingOnLine.id);
                      }
                    }}
                  >
                    {/* Old line num */}
                    <td
                      className="w-12 text-right px-2 py-0.5 select-none font-mono text-[11px] opacity-40 shrink-0"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {line.oldLineNum ?? ''}
                    </td>
                    {/* New line num */}
                    <td
                      className="w-12 text-right px-2 py-0.5 select-none font-mono text-[11px] opacity-40 shrink-0 border-r border-[var(--color-border-subtle)]"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {line.newLineNum ?? ''}
                    </td>
                    {/* Code content */}
                    <td className="px-4 py-0.5 whitespace-pre font-mono leading-relaxed relative">
                      <span className="select-none opacity-50 mr-2 font-bold">{getLinePrefix(line.type)}</span>
                      <span style={{ color: line.type === 'add' ? '#6ee7b7' : line.type === 'remove' ? '#fda4af' : 'var(--color-text-primary)' }}>
                        {line.content}
                      </span>
                    </td>
                  </tr>

                  {/* Inline Finding Annotation Banner */}
                  {findingOnLine && (
                    <tr key={`finding-${idx}`}>
                      <td colSpan={3} className="px-4 py-2.5">
                        <div
                          className={`rounded-md p-3.5 my-1 border shadow-xl transition-all cursor-pointer ${
                            isSelectedFindingLine ? 'ring-2 ring-rose-500 shadow-rose-950/50' : ''
                          }`}
                          style={{
                            background: 'var(--color-bg-surface)',
                            borderColor: `var(--color-${findingOnLine.severity})`,
                          }}
                          onClick={() => onSelectFinding?.(findingOnLine.id)}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <SeverityBadge severity={findingOnLine.severity} size="sm" />
                              <span className="font-sans font-bold text-xs text-slate-100">
                                {findingOnLine.title}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] opacity-90 font-bold" style={{ color: `var(--color-${findingOnLine.severity})` }}>
                              Line {findingOnLine.line} · {findingOnLine.confidence}% Confidence
                            </span>
                          </div>
                          <p className="font-sans text-xs leading-relaxed mb-2 text-slate-300">
                            {findingOnLine.explanation}
                          </p>
                          {findingOnLine.suggestedFix && (
                            <div
                              className="p-2.5 rounded bg-black/50 font-mono text-[11px] border border-slate-800"
                              style={{ color: '#6ee7b7' }}
                            >
                              <div className="text-[9px] font-sans font-bold text-slate-400 uppercase mb-1">Suggested Fix:</div>
                              {findingOnLine.suggestedFix}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
