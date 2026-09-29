"use client";

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ShieldAlert, 
  Info,
  Bug
} from 'lucide-react';
import { ErrorAnalysisItem } from '../../src/types';

export default function ErrorAnalysisPage() {
  const [items, setItems] = useState<ErrorAnalysisItem[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [totalEvaluated, setTotalEvaluated] = useState(0);
  const [totalDiscrepancies, setTotalDiscrepancies] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  const loadReport = () => {
    fetch('/api/error-analysis')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setItems(data.items || []);
          setCategoryTotals(data.categoryTotals || {});
          setTotalEvaluated(data.totalPrescriptionsEvaluated || 0);
          setTotalDiscrepancies(data.totalDiscrepancies || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadReport();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesCat = filterCategory === "ALL" || item.errorCategory === filterCategory;
    const matchesSearch = 
      item.caseId.toLowerCase().includes(search.toLowerCase()) ||
      item.candidateId.toLowerCase().includes(search.toLowerCase()) ||
      item.affectedRule.toLowerCase().includes(search.toLowerCase()) ||
      item.possibleCause.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-[#D4AF37]">Error & Discrepancy Analysis</h1>
          <p className="text-xs text-gray-400 mt-1">
            Deterministic audit comparing synthetic clinical expectations against actual rule engine decisions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/export?type=error-analysis&format=csv"
            download
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-gray-300 flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </a>
          <button
            onClick={() => { setLoading(true); loadReport(); }}
            className="px-3.5 py-2 bg-[#D4AF37] hover:bg-[#e0bc46] text-black rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Audit
          </button>
        </div>
      </div>

      {/* Synthetic Benchmark Notice */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
        <div className="text-xs text-gray-300 leading-relaxed">
          <strong className="text-white">Audit Execution Scope: </strong>
          Evaluated {totalEvaluated} synthetic prescriptions. This report captures intentional deviations, baseline discrepancies, and unexpected constraint misclassifications. Zero errors are displayed if no failures occur — errors are never fabricated.
        </div>
      </div>

      {/* Category Totals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {Object.entries(categoryTotals).map(([cat, count]) => (
          <div
            key={cat}
            onClick={() => setFilterCategory(cat === filterCategory ? "ALL" : cat)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              filterCategory === cat
                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-lg'
                : 'bg-[#0f0f0f] border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >
            <p className="text-[10px] uppercase tracking-wider font-medium truncate">{cat}</p>
            <p className="text-2xl font-serif text-white mt-1 tabular-nums">{count}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f0f0f] p-4 rounded-xl border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Case ID, Candidate, Rule, or Cause..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
        <div className="text-xs text-gray-400 whitespace-nowrap">
          Category Filter: <strong className="text-white">{filterCategory}</strong> ({filteredItems.length} records)
        </div>
      </div>

      {/* Discrepancy Table */}
      <div className="bg-[#0f0f0f] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest border-b border-white/10">
              <tr>
                <th scope="col" className="p-4">Case & Candidate</th>
                <th scope="col" className="p-4">Expected Decision</th>
                <th scope="col" className="p-4">Actual Engine Output</th>
                <th scope="col" className="p-4">Audit Result</th>
                <th scope="col" className="p-4">Category & Rule</th>
                <th scope="col" className="p-4">Possible Cause & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs text-gray-500">
                    Executing comprehensive error analysis across synthetic cases...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs text-gray-500 uppercase tracking-widest">
                    No discrepancies identified for selected filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <a href={`/review/${item.caseId}`} className="font-mono font-bold text-white hover:text-[#D4AF37]">
                        {item.caseId}
                      </a>
                      <span className="block font-mono text-[10px] text-gray-400">Alt: {item.candidateId}</span>
                    </td>
                    <td className="p-4 text-xs text-gray-300 max-w-xs truncate" title={item.expectedDecision}>
                      {item.expectedDecision}
                    </td>
                    <td className="p-4 whitespace-nowrap font-semibold text-white">
                      {item.actualDecision}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {item.result === "PASS" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="w-3.5 h-3.5" /> DISCREPANCY
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-gray-300 font-medium block">{item.errorCategory}</span>
                      <span className="font-mono text-[10px] text-[#D4AF37]">{item.affectedRule}</span>
                    </td>
                    <td className="p-4 text-xs text-gray-400 max-w-sm">
                      <p className="text-gray-300">{item.possibleCause}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 italic">{item.correctiveAction}</p>
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
