import { summary } from '@actions/core';
import type { PipelineResult } from '@github-global/core';

export function writeJobSummary(results: PipelineResult[]): void {
  summary.addHeading('github-global Translation Report');

  // Summary table
  const headers = [
    { data: 'Language', header: true },
    { data: 'Files', header: true },
    { data: 'New Chunks', header: true },
    { data: 'Reused Chunks', header: true },
    { data: 'Tokens In', header: true },
    { data: 'Tokens Out', header: true },
    { data: 'Duration', header: true },
    { data: 'Failures', header: true },
  ];

  const rows = results.map((r) => [
    r.lang,
    String(r.filesProcessed),
    String(r.chunksNew),
    String(r.chunksReused),
    r.tokensIn.toLocaleString(),
    r.tokensOut.toLocaleString(),
    `${(r.durationMs / 1000).toFixed(1)}s`,
    r.failures.length > 0 ? `⚠ ${r.failures.length}` : '✓ 0',
  ]);

  summary.addTable([headers, ...rows]);

  // Totals
  const totalFiles = results.reduce((s, r) => s + r.filesProcessed, 0);
  const totalNew = results.reduce((s, r) => s + r.chunksNew, 0);
  const totalReused = results.reduce((s, r) => s + r.chunksReused, 0);
  const totalTokensIn = results.reduce((s, r) => s + r.tokensIn, 0);
  const totalTokensOut = results.reduce((s, r) => s + r.tokensOut, 0);
  const totalFailures = results.reduce((s, r) => s + r.failures.length, 0);

  summary.addHeading('Totals', 2);
  summary.addTable([
    [
      { data: 'Files', header: true },
      { data: 'New Chunks', header: true },
      { data: 'Reused Chunks', header: true },
      { data: 'Tokens In', header: true },
      { data: 'Tokens Out', header: true },
      { data: 'Failures', header: true },
    ],
    [
      String(totalFiles),
      String(totalNew),
      String(totalReused),
      totalTokensIn.toLocaleString(),
      totalTokensOut.toLocaleString(),
      totalFailures > 0 ? `⚠ ${totalFailures}` : '✓ 0',
    ],
  ]);

  // Failure details
  const allFailures = results.flatMap((r) => r.failures);
  if (allFailures.length > 0) {
    summary.addHeading('Failures', 2);
    for (const f of allFailures) {
      summary.addRaw(`- **${f.file}** [${f.lang}] chunk ${f.chunkIndex}: ${f.reason} - ${f.detail}\n`);
    }
  }

  summary.write();
}
