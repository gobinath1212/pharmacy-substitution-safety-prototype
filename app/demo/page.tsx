"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  ShieldCheck, 
  ShieldAlert, 
  FileWarning, 
  AlertCircle, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Clock,
  ExternalLink,
  Activity
} from 'lucide-react';
import { calculateMetrics } from '../../src/services/metrics';

export default function DemoDashboardPage() {
  const router = useRouter();
  const metrics = calculateMetrics();
  const [stats, setStats] = useState({
    auditCount: 0,
    openFollowUps: 0,
    escalationCount: 0
  });

  const escalationsCount = metrics.detailed?.escalationsCount || 0;

  useEffect(() => {
    async function loadStats() {
      try {
        const auditRes = await fetch('/api/audit');
        const auditData = await auditRes.json();
        const fuRes = await fetch('/api/followups?status=OPEN');
        const fuData = await fuRes.json();
        setStats({
          auditCount: auditData.length || 0,
          openFollowUps: fuData.length || 0,
          escalationCount: escalationsCount
        });
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, [escalationsCount]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-[#D4AF37]">Final Evaluator Demonstration Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">
            End-to-end interactive scenarios benchmarking the deterministic 8-priority safety rules engine.
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1.5 rounded border border-[#D4AF37]/20 font-bold">
          Presentation Ready
        </div>
      </div>

      {/* 3 Canonical Demo Launchers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Case A */}
        <div className="bg-[#0f0f0f] border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-6 shadow-2xl transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
                RX-DEMO-A
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Valid Option Retained
              </span>
            </div>

            <h3 className="text-base font-serif italic text-white group-hover:text-[#D4AF37] transition-colors">
              Case A: Unsafe Alternatives Blocked
            </h3>

            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Demonstrates multi-candidate safety filtering: candidate <strong>BioCillin (MED-B)</strong> is blocked by documented allergy, <strong>Allerpen (MED-C)</strong> is rejected due to zero stock, while <strong>SafeCillin (MED-D)</strong> is cleared as a valid, safe bioequivalent.
            </p>

            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5 text-[11px] text-gray-400 space-y-1">
              <div><strong className="text-gray-200">Patient:</strong> PAT-DEMO-A (Allergic to MED-B)</div>
              <div><strong className="text-gray-200">Expected:</strong> MED-B Blocked, MED-C Out of Stock, MED-D Valid</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <Link
              href="/review/RX-DEMO-A"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-[#D4AF37] hover:bg-[#e0bc46] text-black font-bold uppercase text-xs tracking-wider rounded-lg transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              Load Demo Case A
            </Link>
          </div>
        </div>

        {/* Case B */}
        <div className="bg-[#0f0f0f] border border-white/10 hover:border-amber-500/50 rounded-2xl p-6 shadow-2xl transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                RX-DEMO-B
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Human Review
              </span>
            </div>

            <h3 className="text-base font-serif italic text-white group-hover:text-amber-400 transition-colors">
              Case B: Formulation & Telemetry Review
            </h3>

            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Demonstrates physical formulation constraints and uncertainty handling: patient dysphagia (&ldquo;cannot swallow large tablets&rdquo;) triggers a Priority 6 review on <strong>HeavyCillin (MED-E)</strong>, prompting the clinician to verify or choose an oral liquid.
            </p>

            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5 text-[11px] text-gray-400 space-y-1">
              <div><strong className="text-gray-200">Patient:</strong> PAT-DEMO-B (Dysphagia impairment)</div>
              <div><strong className="text-gray-200">Expected:</strong> NEEDS_HUMAN_REVIEW (Formulation constraint)</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <Link
              href="/review/RX-DEMO-B"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase text-xs tracking-wider rounded-lg transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              Load Demo Case B
            </Link>
          </div>
        </div>

        {/* Case C */}
        <div className="bg-[#0f0f0f] border border-white/10 hover:border-rose-500/50 rounded-2xl p-6 shadow-2xl transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                RX-DEMO-C
              </span>
              <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                Safety Exhaustion
              </span>
            </div>

            <h3 className="text-base font-serif italic text-white group-hover:text-rose-400 transition-colors">
              Case C: No Valid Option Remaining
            </h3>

            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Demonstrates safety exhaustion when prescriber orders <strong>DAW-1</strong> while patient is allergic to alternatives and remaining options are out of stock. The engine flags <strong>NO_VALID_OPTION</strong> and auto-dispatches an urgent follow-up task.
            </p>

            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5 text-[11px] text-gray-400 space-y-1">
              <div><strong className="text-gray-200">Prescriber:</strong> DOC-RESTRICT (DAW-1 directive)</div>
              <div><strong className="text-gray-200">Expected:</strong> NO_VALID_OPTION &rarr; Auto High-Priority Follow-up</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <Link
              href="/review/RX-DEMO-C"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold uppercase text-xs tracking-wider rounded-lg transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Load Demo Case C
            </Link>
          </div>
        </div>
      </div>

      {/* Comprehensive Operational Stats Banner */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold mb-4">
          End-to-End Operational Pipeline Status
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Tested Cases</p>
            <p className="text-2xl font-serif text-white mt-1 tabular-nums">{metrics.totalPrescriptions}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Candidate Evals</p>
            <p className="text-2xl font-serif text-white mt-1 tabular-nums">{metrics.totalEvaluations}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Unsafe Blocked</p>
            <p className="text-2xl font-serif text-rose-400 mt-1 tabular-nums">{metrics.prototype.unsafeBlocked}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Open Tasks</p>
            <p className="text-2xl font-serif text-amber-400 mt-1 tabular-nums">{stats.openFollowUps}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Audit Events</p>
            <p className="text-2xl font-serif text-emerald-400 mt-1 tabular-nums">{stats.auditCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
