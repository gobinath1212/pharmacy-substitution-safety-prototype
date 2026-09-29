"use client";

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  RefreshCw, 
  Search, 
  Filter, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { DataQualityReport, DataQualityIssue } from '../../src/types';

export default function DataQualityPage() {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const loadDataQuality = () => {
    fetch('/api/data-quality')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadDataQuality();
  }, []);

  const issues = report?.issues.filter(issue => {
    const matchesSev = severityFilter === "ALL" || issue.type === severityFilter;
    const matchesSearch = 
      issue.entityId.toLowerCase().includes(search.toLowerCase()) ||
      issue.description.toLowerCase().includes(search.toLowerCase()) ||
      issue.category.toLowerCase().includes(search.toLowerCase());
    return matchesSev && matchesSearch;
  }) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-[#D4AF37]">Synthetic Data Quality & Integrity</h1>
          <p className="text-xs text-gray-400 mt-1">
            Automated integrity gate auditing record schema, broken foreign keys, stale stock telemetry, and completeness.
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); loadDataQuality(); }}
          className="px-4 py-2 bg-[#D4AF37] hover:bg-[#e0bc46] text-black rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Run Quality Audit
        </button>
      </div>

      {/* Top Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between text-gray-500 text-[10px] uppercase tracking-widest font-bold">
            <span>Overall Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className={`text-2xl font-serif mt-2 font-bold ${
            report?.integrityStatus === "HEALTHY" ? "text-emerald-400" :
            report?.integrityStatus === "DEGRADED" ? "text-amber-400" : "text-rose-500"
          }`}>
            {report?.integrityStatus || "HEALTHY"}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
            {report?.totalRecordsChecked || 0} total records audited
          </p>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between text-gray-500 text-[10px] uppercase tracking-widest font-bold">
            <span>Valid Records</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-serif text-emerald-400 mt-2 tabular-nums">
            {report?.validCount || 0}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
            100% compliant schema
          </p>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between text-gray-500 text-[10px] uppercase tracking-widest font-bold">
            <span>Telemetry Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-serif text-amber-400 mt-2 tabular-nums">
            {report?.warningCount || 0}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
            Stale stock telemetry &gt; 48h
          </p>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between text-gray-500 text-[10px] uppercase tracking-widest font-bold">
            <span>Critical Issues</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-serif text-rose-400 mt-2 tabular-nums">
            {report?.criticalCount || 0}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
            Broken refs or missing keys
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f0f0f] p-4 rounded-xl border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit issues by entity ID, category, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => setSeverityFilter("ALL")}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              severityFilter === "ALL" ? "bg-white/20 text-white font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            All ({report?.issues.length || 0})
          </button>
          <button
            onClick={() => setSeverityFilter("WARNING")}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              severityFilter === "WARNING" ? "bg-amber-500/30 text-amber-300 font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Warnings ({report?.issues.filter(i => i.type === "WARNING").length || 0})
          </button>
          <button
            onClick={() => setSeverityFilter("CRITICAL")}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              severityFilter === "CRITICAL" ? "bg-rose-500/30 text-rose-300 font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Critical ({report?.issues.filter(i => i.type === "CRITICAL").length || 0})
          </button>
          <button
            onClick={() => setSeverityFilter("INFO")}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              severityFilter === "INFO" ? "bg-blue-500/30 text-blue-300 font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Info ({report?.issues.filter(i => i.type === "INFO").length || 0})
          </button>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-[#0f0f0f] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest border-b border-white/10">
              <tr>
                <th scope="col" className="p-4">Severity</th>
                <th scope="col" className="p-4">Category</th>
                <th scope="col" className="p-4">Entity Identifier</th>
                <th scope="col" className="p-4">Issue Description</th>
                <th scope="col" className="p-4">Recommended Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-xs text-gray-500">
                    Running data quality audit across synthetic store...
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-xs text-gray-500 uppercase tracking-widest">
                    No data quality issues found.
                  </td>
                </tr>
              ) : (
                issues.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      {issue.type === "CRITICAL" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <AlertCircle className="w-3 h-3" /> CRITICAL
                        </span>
                      )}
                      {issue.type === "WARNING" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" /> WARNING
                        </span>
                      )}
                      {issue.type === "INFO" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <Info className="w-3 h-3" /> INFO
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap font-mono text-gray-300 text-[11px]">
                      {issue.category}
                    </td>
                    <td className="p-4 whitespace-nowrap font-mono font-bold text-white">
                      {issue.entityId}
                    </td>
                    <td className="p-4 text-xs text-gray-300 max-w-sm">
                      {issue.description}
                    </td>
                    <td className="p-4 text-xs text-gray-400 italic max-w-sm">
                      {issue.recommendedResolution}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
