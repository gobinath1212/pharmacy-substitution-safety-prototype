"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  AlertCircle, 
  Clock, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowUpRight, 
  History, 
  Filter,
  FileText
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { FollowUp } from '../../src/types';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Escalation / Resolution Modal State
  const [selectedItem, setSelectedItem] = useState<FollowUp | null>(null);
  const [actionType, setActionType] = useState<"ESCALATE" | "RESOLVE" | "VIEW_HISTORY" | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFollowUps = () => {
    let url = '/api/followups';
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setFollowUps(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    let url = '/api/followups';
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (isMounted) {
          setFollowUps(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [statusFilter, priorityFilter]);

  const handleActionSubmit = async () => {
    if (!selectedItem || !actionType) return;
    setActionLoading(true);

    try {
      if (actionType === "RESOLVE") {
        await fetch('/api/followups', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedItem.id,
            status: "RESOLVED",
            resolutionNotes: actionNote || "Resolved by clinical pharmacist verification.",
            actor: "PHARM-CLINICAL-1",
            note: actionNote || "Case marked as resolved."
          })
        });
      } else if (actionType === "ESCALATE") {
        const newLevel = Math.min(3, selectedItem.escalationLevel + 1);
        await fetch('/api/followups', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedItem.id,
            status: "ESCALATED",
            escalationLevel: newLevel,
            actor: "PHARM-CLINICAL-1",
            note: actionNote || `Escalated to Level ${newLevel}`
          })
        });
      }

      setActionType(null);
      setSelectedItem(null);
      setActionNote("");
      fetchFollowUps();
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const getEscalationBadge = (level: number) => {
    switch (level) {
      case 0:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">L0: Initial</span>;
      case 1:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">L1: Senior RPh</span>;
      case 2:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">L2: Prescriber Outreach</span>;
      case 3:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">L3: Urgent Safety Board</span>;
      default:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">L{level}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-[#D4AF37]">Clinical Follow-up & Escalation Queue</h1>
          <p className="text-xs text-gray-400 mt-1">
            Active tracking for overrides, high-uncertainty substitutions, and clinical exceptions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded border border-white/10">
            {followUps.filter(f => f.status !== 'RESOLVED').length} Active Tasks
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0f0f0f] p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-semibold text-gray-400">Filter By:</span>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#141414] border border-white/10 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#141414] border border-white/10 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <button
          onClick={fetchFollowUps}
          className="text-xs text-[#D4AF37] hover:underline uppercase font-bold tracking-wider"
        >
          Refresh Queue
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0f0f0f] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest border-b border-white/10">
              <tr>
                <th scope="col" className="p-4">Case ID</th>
                <th scope="col" className="p-4">Priority</th>
                <th scope="col" className="p-4">Status & Level</th>
                <th scope="col" className="p-4">Owner</th>
                <th scope="col" className="p-4">Clinical Notes</th>
                <th scope="col" className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs text-gray-500">
                    Loading follow-up queue...
                  </td>
                </tr>
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs text-gray-500 uppercase tracking-widest">
                    No follow-up items found.
                  </td>
                </tr>
              ) : (
                followUps.map((fu) => (
                  <tr key={fu.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <a href={`/review/${fu.caseId}`} className="font-mono font-bold text-white hover:text-[#D4AF37] transition-colors">
                        {fu.caseId}
                      </a>
                      <span className="block text-[10px] text-gray-500 font-mono">{fu.id}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        fu.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        fu.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400' :
                        fu.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {fu.priority}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap space-y-1">
                      <div className="font-semibold text-gray-200">{fu.status}</div>
                      <div>{getEscalationBadge(fu.escalationLevel)}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                        <span>{fu.owner}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Due {format(new Date(fu.dueDate), 'MMM d')}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-gray-300 max-w-xs truncate" title={fu.resolutionNotes || fu.overrideReason || ""}>
                      {fu.overrideReason ? (
                        <span className="text-amber-400 italic">Override: {fu.overrideReason}</span>
                      ) : (
                        fu.resolutionNotes || "Awaiting clinician assessment."
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedItem(fu);
                          setActionType("VIEW_HISTORY");
                        }}
                        className="text-[10px] uppercase font-bold text-gray-400 hover:text-white px-2 py-1 bg-white/5 hover:bg-white/10 rounded transition-colors"
                      >
                        History
                      </button>

                      {fu.status !== "RESOLVED" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedItem(fu);
                              setActionType("ESCALATE");
                            }}
                            className="text-[10px] uppercase font-bold text-amber-400 hover:text-amber-300 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 rounded transition-colors"
                          >
                            Escalate
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(fu);
                              setActionType("RESOLVE");
                            }}
                            className="text-[10px] uppercase font-bold text-emerald-400 hover:text-emerald-300 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 rounded transition-colors"
                          >
                            Resolve
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action / History Modal */}
      <Dialog.Root open={!!actionType} onOpenChange={(open) => !open && setActionType(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 shadow-2xl z-50">
            {selectedItem && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-base font-serif italic text-white">
                    {actionType === "RESOLVE" && "Resolve Follow-up Item"}
                    {actionType === "ESCALATE" && "Escalate Case to Higher Authority"}
                    {actionType === "VIEW_HISTORY" && `Escalation History: ${selectedItem.caseId}`}
                  </h2>
                  <span className="font-mono text-gray-500 text-[10px]">{selectedItem.id}</span>
                </div>

                {actionType === "VIEW_HISTORY" ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400">Audit trail of escalation events:</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedItem.escalationHistory && selectedItem.escalationHistory.length > 0 ? (
                        selectedItem.escalationHistory.map((h, i) => (
                          <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">{getEscalationBadge(h.level)}</span>
                              <span className="text-[10px] text-gray-500 font-mono">
                                {format(new Date(h.timestamp), 'MMM d, HH:mm')} · {h.actor}
                              </span>
                            </div>
                            <p className="text-gray-300 text-xs">{h.note}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No history entries recorded.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-400">
                      {actionType === "RESOLVE" && `Add formal resolution note to close Case ${selectedItem.caseId}:`}
                      {actionType === "ESCALATE" && `Advancing Case ${selectedItem.caseId} from Level ${selectedItem.escalationLevel} to Level ${Math.min(3, selectedItem.escalationLevel + 1)}:`}
                    </p>
                    <textarea
                      rows={3}
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder={actionType === "RESOLVE" ? "Enter resolution documentation..." : "Enter reason for escalation..."}
                      className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    onClick={() => setActionType(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-semibold uppercase text-xs"
                  >
                    Close
                  </button>
                  {actionType !== "VIEW_HISTORY" && (
                    <button
                      onClick={handleActionSubmit}
                      disabled={actionLoading}
                      className="px-5 py-2 bg-[#D4AF37] hover:bg-[#e0bc46] text-black rounded-lg font-bold uppercase text-xs"
                    >
                      {actionLoading ? "Submitting..." : "Confirm Action"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
