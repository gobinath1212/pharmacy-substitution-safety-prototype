"use client";

import { STATE } from '../../src/data/store';
import { format } from 'date-fns';
import { AlertCircle, Clock, User } from 'lucide-react';

export default function FollowUpsPage() {
  const followUps = STATE.followUps;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl font-serif italic text-[#D4AF37]">Follow-up Queue</h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Unresolved actions requiring human intervention.</p>
      </div>

      <div className="bg-[#0f0f0f] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest">
            <tr className="border-b border-white/10">
              <th scope="col" className="p-4">Case ID</th>
              <th scope="col" className="p-4">Priority</th>
              <th scope="col" className="p-4">Status</th>
              <th scope="col" className="p-4">Owner</th>
              <th scope="col" className="p-4">Due Date</th>
              <th scope="col" className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {followUps.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[10px] uppercase tracking-widest text-gray-500">
                  No active follow-ups.
                </td>
              </tr>
            ) : followUps.map((fu) => (
              <tr key={fu.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 whitespace-nowrap text-sm font-mono text-white">{fu.caseId}</td>
                <td className="p-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${fu.priority === 'HIGH' || fu.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    {fu.priority}
                  </span>
                </td>
                <td className="p-4 whitespace-nowrap text-xs text-gray-300 font-semibold">{fu.status}</td>
                <td className="p-4 whitespace-nowrap text-xs text-gray-500 flex items-center gap-2">
                  <User className="w-3 h-3" /> {fu.owner}
                </td>
                <td className="p-4 whitespace-nowrap text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {format(new Date(fu.dueDate), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap text-right">
                  <button className="text-[#D4AF37] hover:text-white text-[10px] uppercase tracking-widest font-bold transition-colors">Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
