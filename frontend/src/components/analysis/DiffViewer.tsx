import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, SplitSquareHorizontal, AlignLeft } from 'lucide-react';
import { parseDiff } from '@/lib/utils';
import type { DiffFile, Finding } from '@/types';

interface DiffViewerProps {
  files: DiffFile[];
  findings: Finding[];
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
      className="flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap transition-all border-b-2"
      style={{
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        borderBottomColor: active ? 'var(--color-accent)' : 'transparent',
        background: active ? 'var(--color-bg-surface)' : 'transparent',
      }}
    >
      <span
        className="font-mono text-[9px] px-1 rounded-sm"
        style={{ background: `${statusColors[file.status]}20`, color: statusColors[file.status] }}
      >
        {file.status === 'added' ? 'A' : file.status === 'deleted' ? 'D' : 'M'}
      </span>
      <span className="font-mono">{file.filename.split('/').pop()}</span>
      <div className="flex items-center gap-1 text-[10px]">
        <span style={{ color: 'var(--color-pass)' }}>+{file.additions}</span>
        <span style={{ color: 'var(--color-critical)' }}>-{file.deletions}</span>
      </div>
      {hasFinding && (
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-critical)' }} />
      )}
    </button>
  );
}

export function DiffViewer({ files, findings }: DiffViewerProps) {
  const [activeFile, setActiveFile] = useState(files[0]?.filename ?? '');

  const currentFile = files.find(f => f.filename === activeFile) ?? files[0];
  const fileFindings = findings.filter(f => f.file === currentFile?.filename);
  const findingLines = new Set(fileFindings.map(f => f.line));

  const parsedLines = currentFile ? parseDiff(currentFile.patch) : [];

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: '#0d0d14',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* File tabs */}
      <div
        className="flex overflow-x-auto"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}
      >
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

      {/* File header */}
      <div
        className="flex items-center gap-3 px-4 py-2"
        style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-elevated)' }}
      >
        <GitBranch size={12} style={{ color: 'var(--color-text-muted)' }} />
        <code className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
          {currentFile?.filename}
        </code>
        {currentFile && (
          <div
            className="ml-auto flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-sm"
            style={{ background: `${LANGUAGE_COLORS[currentFile.language] ?? '#888'}20`, color: LANGUAGE_COLORS[currentFile.language] ?? '#888' }}
          >
            {currentFile.language}
          </div>
        )}
        {fileFindings.length > 0 && (
          <div
            className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-sm"
            style={{
              background: 'var(--color-critical-muted)',
              color: 'var(--color-critical)',
              border: '1px solid var(--color-critical-border)',
            }}
          >
            {fileFindings.length} finding{fileFindings.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Diff content */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {parsedLines.map((line, idx) => {
              if (line.type === 'header') {
                return (
                  <tr key={idx}>
                    <td
                      colSpan={3}
                      className="px-4 py-1.5 font-mono text-[10px]"
                      style={{ background: 'var(--color-bg-overlay)', color: 'var(--color-text-muted)' }}
                    >
                      {line.content}
                    </td>
                  </tr>
                );
              }

              const isHighlighted = line.newLineNum !== null && findingLines.has(line.newLineNum);
              const lineFinding = isHighlighted
                ? fileFindings.find(f => f.line === line.newLineNum)
                : null;

              return (
                <>
                  <tr
                    key={idx}
                    className={getLineClass(line.type)}
                    style={{
                      background: isHighlighted
                        ? 'rgba(244, 63, 94, 0.08)'
                        : line.type === 'add'
                          ? 'rgba(16, 185, 129, 0.04)'
                          : line.type === 'remove'
                            ? 'rgba(244, 63, 94, 0.04)'
                            : 'transparent',
                    }}
                  >
                    {/* Old line number */}
                    <td
                      className="px-2 py-0.5 text-right w-10 select-none font-mono text-[10px] shrink-0"
                      style={{
                        color: 'var(--color-text-muted)',
                        borderRight: '1px solid var(--color-border-subtle)',
                        userSelect: 'none',
                      }}
                    >
                      {line.oldLineNum ?? ''}
                    </td>
                    {/* New line number */}
                    <td
                      className="px-2 py-0.5 text-right w-10 select-none font-mono text-[10px]"
                      style={{
                        color: 'var(--color-text-muted)',
                        borderRight: '1px solid var(--color-border-subtle)',
                        userSelect: 'none',
                      }}
                    >
                      {line.newLineNum ?? ''}
                    </td>
                    {/* Finding indicator */}
                    <td
                      className="w-4 text-center select-none"
                      style={{ userSelect: 'none' }}
                    >
                      {isHighlighted && (
                        <div
                          className="w-1.5 h-1.5 rounded-full mx-auto"
                          style={{ background: 'var(--color-critical)' }}
                          title={lineFinding?.title}
                        />
                      )}
                    </td>
                    {/* Code content */}
                    <td className="px-3 py-0.5 w-full">
                      <pre
                        className="font-mono text-[11px] leading-5"
                        style={{
                          color: line.type === 'add'
                            ? '#9ece6a'
                            : line.type === 'remove'
                              ? '#f7768e'
                              : '#a9b1d6',
                        }}
                      >
                        <span
                          className="select-none mr-2 opacity-50"
                          style={{ userSelect: 'none' }}
                        >
                          {getLinePrefix(line.type)}
                        </span>
                        {line.content}
                      </pre>
                    </td>
                  </tr>
                  {/* Inline finding callout */}
                  {lineFinding && (
                    <tr key={`finding-${idx}`}>
                      <td colSpan={4} className="px-4 py-2">
                        <div
                          className="flex items-start gap-2 p-2 rounded-md text-xs"
                          style={{
                            background: 'var(--color-critical-muted)',
                            border: '1px solid var(--color-critical-border)',
                          }}
                        >
                          <div
                            className="w-1 h-4 rounded-full shrink-0 mt-0.5"
                            style={{ background: 'var(--color-critical)' }}
                          />
                          <div>
                            <span className="font-semibold" style={{ color: 'var(--color-critical)' }}>
                              {lineFinding.severity.toUpperCase()}
                            </span>
                            <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                              {lineFinding.title}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
