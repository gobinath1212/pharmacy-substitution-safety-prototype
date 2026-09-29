"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Activity, Search, ShieldCheck, Clock, FileText } from 'lucide-react';
import { AuditLogEntry } from '../../src/types';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadAuditLogs = () => {
    fetch('/api/audit')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    fetch('/api/audit')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (isMounted) {
          setLogs(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLogs = logs.filter(log =>
    log.caseId.toLowerCase().includes(search.toLowerCase()) ||
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-[#D4AF37]">Clinical Audit Trail</h1>
          <p className="text-xs text-gray-400 mt-1">
            Immutable log of system evaluations, pharmacist overrides, and safety transitions.
          </p>
        </div>
        <button
          onClick={loadAuditLogs}
          className="text-xs text-[#D4AF37] hover:underline uppercase font-bold tracking-wider"
        >
          Refresh Audit Trail
        </button>
      </div>

      <div className="flex items-center gap-4 bg-[#0f0f0f] p-4 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by Case ID, User, Action, or Reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {filteredLogs.length} audit entries
        </span>
      </div>

      <div className="bg-[#0f0f0f] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest border-b border-white/10">
              <tr>
                <th scope="col" className="p-4">Timestamp</th>
                <th scope="col" className="p-4">Case ID</th>
                <th scope="col" className="p-4">Reviewer / Actor</th>
                <th scope="col" className="p-4">Action</th>
                <th scope="col" className="p-4">Status Transition</th>
                <th scope="col" className="p-4">Documented Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs text-gray-500">
                    Loading persistent audit log...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs text-gray-500 uppercase tracking-widest">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                      {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <a href={`/review/${log.caseId}`} className="font-mono font-bold text-white hover:text-[#D4AF37] transition-colors">
                        {log.caseId}
                      </a>
                      {log.alternativeId && (
                        <span className="block text-[10px] text-gray-500 font-mono">Alt: {log.alternativeId}</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-300 font-medium">
                      {log.user}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.action === 'OVERRIDE'
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                          : 'bg-white/10 text-gray-300 border border-white/10'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs">
                      <span className="line-through text-gray-500">{log.previousDecision}</span>
                      <span className="mx-1.5 text-gray-600">&rarr;</span>
                      <span className="font-semibold text-white">{log.newDecision}</span>
                    </td>
                    <td className="p-4 text-xs text-gray-300 max-w-sm truncate" title={log.reason}>
                      {log.reason}
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
