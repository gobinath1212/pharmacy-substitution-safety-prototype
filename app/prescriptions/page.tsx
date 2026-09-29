"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Search, Filter, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Prescription } from '../../src/types';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrescriptions() {
      setLoading(true);
      try {
        const offset = (page - 1) * limit;
        let url = `/api/prescriptions?limit=${limit}&offset=${offset}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setPrescriptions(data.prescriptions || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error("Failed to load prescriptions", err);
      } finally {
        setLoading(false);
      }
    }
    loadPrescriptions();
  }, [page, search, limit]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-[#D4AF37]">Synthetic Prescription Ledger</h1>
          <p className="text-xs text-gray-400 mt-1">
            220 controlled synthetic cases covering safe interchanges, allergy blocks, prescriber prohibitions, and formulation constraints.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/review/RX-DEMO"
            className="bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-[#D4AF37]/30 transition-colors"
          >
            Launch Interactive Demo Case (RX-DEMO)
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f0f0f] p-4 rounded-xl border border-white/10">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Rx ID, Patient, Drug, or Scenario..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#141414] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>Showing <strong className="text-white">{prescriptions.length}</strong> of <strong className="text-white tabular-nums">{total}</strong> synthetic records</span>
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="bg-[#0f0f0f] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest border-b border-white/10">
              <tr>
                <th scope="col" className="p-4">Rx ID</th>
                <th scope="col" className="p-4">Prescribed Drug</th>
                <th scope="col" className="p-4">Strength / Route</th>
                <th scope="col" className="p-4">Patient & Prescriber</th>
                <th scope="col" className="p-4">Allergies / Constraints</th>
                <th scope="col" className="p-4">Scenario Context</th>
                <th scope="col" className="p-4 text-right">Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-gray-500">
                    Loading synthetic prescriptions...
                  </td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-gray-500 uppercase tracking-widest">
                    No matching prescriptions found.
                  </td>
                </tr>
              ) : (
                prescriptions.map((rx) => {
                  const isBenchmark = ["RX-DEMO", "RX-1001", "RX-1002", "RX-1003", "RX-1004", "RX-1010"].includes(rx.id);
                  return (
                    <tr key={rx.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 whitespace-nowrap font-mono text-sm text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{rx.id}</span>
                          {isBenchmark && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                              Core Case
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 font-sans">
                          {format(new Date(rx.date), 'MMM d, yyyy')}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap font-semibold text-gray-200">
                        {rx.medicationId}
                      </td>

                      <td className="p-4 whitespace-nowrap text-gray-400">
                        {rx.strength} · {rx.route}
                        <span className="block text-[10px] text-gray-500">{rx.frequency}</span>
                      </td>

                      <td className="p-4 whitespace-nowrap text-gray-400 font-mono text-[11px]">
                        <div>Pt: {rx.patientId}</div>
                        <div className="text-gray-500 text-[10px]">Dr: {rx.prescriberId}</div>
                      </td>

                      <td className="p-4 text-xs space-y-1">
                        {rx.allergyIds?.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {rx.allergyIds.map(a => (
                              <span key={a} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/20">
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-600 text-[10px] italic">No allergies</span>
                        )}

                        {rx.patientConstraints?.length > 0 && (
                          <div className="text-[10px] text-amber-400 font-medium">
                            {rx.patientConstraints.join('; ')}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-xs text-gray-400 max-w-xs truncate" title={rx.scenarioDescription || rx.clinicalNotes || ""}>
                        {rx.scenarioDescription || "Standard evaluation encounter"}
                      </td>

                      <td className="p-4 whitespace-nowrap text-right">
                        <Link
                          href={`/review/${rx.id}`}
                          className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#D4AF37] hover:text-white px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                        >
                          Review Case <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="text-gray-500">
            Page {page} of {Math.max(1, totalPages)}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-gray-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-gray-400 px-2">{page} / {Math.max(1, totalPages)}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-gray-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
