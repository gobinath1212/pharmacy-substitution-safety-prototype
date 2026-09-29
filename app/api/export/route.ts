import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';
import { calculateMetrics } from '../../../src/services/metrics';
import { getErrorAnalysisReport } from '../../../src/services/errorAnalysisService';

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(header => {
      const val = item[header];
      if (val === null || val === undefined) return '""';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'audit';
    const format = searchParams.get('format')?.toLowerCase() || 'json';

    const storage = getStorage();
    let exportData: any = null;
    let filename = `synthetic-${type}-${Date.now()}`;

    if (type === 'audit') {
      exportData = await storage.getAuditLogs();
      filename = `synthetic-audit-trail-${Date.now()}`;
    } else if (type === 'experiments') {
      exportData = await storage.getExperimentRuns();
      filename = `synthetic-experiment-runs-${Date.now()}`;
    } else if (type === 'metrics') {
      exportData = [calculateMetrics()];
      filename = `synthetic-safety-metrics-${Date.now()}`;
    } else if (type === 'error-analysis') {
      const report = await getErrorAnalysisReport();
      exportData = report.items;
      filename = `synthetic-error-analysis-${Date.now()}`;
    } else {
      return NextResponse.json({ error: "Invalid export type. Supported: audit, experiments, metrics, error-analysis." }, { status: 400 });
    }

    if (format === 'csv') {
      const flatData = Array.isArray(exportData) ? exportData : [exportData];
      const csv = convertToCSV(flatData);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      });
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}.json"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Export failed" }, { status: 500 });
  }
}
