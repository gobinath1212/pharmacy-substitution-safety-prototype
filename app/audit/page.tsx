"use client";

import { STATE } from '../../src/data/store';
import { format } from 'date-fns';

export default function AuditLogPage() {
  const logs = STATE.auditLogs;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl font-serif italic text-[#D4AF37]">Audit Log</h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Immutable record of system decisions and human overrides.</p>
      </div>

      <div className="bg-[#0f0f0f] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest">
            <tr className="border-b border-white/10">
              <th scope="col" className="p-4">Timestamp</th>
              <th scope="col" className="p-4">Case ID</th>
              <th scope="col" className="p-4">User</th>
              <th scope="col" className="p-4">Action</th>
              <th scope="col" className="p-4">Transition</th>
              <th scope="col" className="p-4">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[10px] uppercase tracking-widest text-gray-500">
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 whitespace-nowrap text-xs text-gray-500">{format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}</td>
                <td className="p-4 whitespace-nowrap text-sm font-mono text-white">{log.caseId}</td>
                <td className="p-4 whitespace-nowrap text-xs text-gray-300 font-semibold">{log.user}</td>
                <td className="p-4 whitespace-nowrap text-sm">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-[#D4AF37]/20 text-[#D4AF37]">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 whitespace-nowrap text-xs text-gray-500">
                  <span className="line-through text-gray-600">{log.previousDecision}</span> &rarr; <span className="font-semibold text-white">{log.newDecision}</span>
                </td>
                <td className="p-4 text-xs text-gray-400 max-w-xs truncate" title={log.reason}>
                  {log.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
