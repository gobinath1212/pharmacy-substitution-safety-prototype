"use client";

import { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  Filter, 
  Info,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { ExperimentRun } from '../../src/types';

export default function ExperimentPage() {
  const [running, setRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState<ExperimentRun | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [pastRuns, setPastRuns] = useState<ExperimentRun[]>([]);
  const [loadingPast, setLoadingPast] = useState(true);

  useEffect(() => {
    async function loadPastRuns() {
      try {
        const res = await fetch('/api/experiments');
        if (res.ok) {
          const data = await res.json();
          if (data.runs && data.runs.length > 0) {
            setPastRuns(data.runs);
            setCurrentRun(data.runs[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load past runs", err);
      } finally {
        setLoadingPast(false);
      }
    }
    loadPastRuns();
  }, []);

  const handleRunExperiment = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/experiments', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCurrentRun(data.run);
        setPastRuns(prev => [data.run, ...prev]);
      }
    } catch (err) {
      console.error("Experiment failed", err);
    } finally {
      setRunning(false);
    }
  };

  const chartData = currentRun ? [
    {
      metric: 'Unsafe Sub Allowed',
      Baseline: currentRun.baseline.unsafeAllowed,
      Prototype: 0,
    },
    {
      metric: 'Human Review Needed',
      Baseline: 0,
      Prototype: currentRun.prototype.humanReviewCases,
    },
    {
      metric: 'Safety Blocks Caught',
      Baseline: currentRun.baseline.unsuitableBlocks,
      Prototype: currentRun.prototype.unsafeBlocked,
    }
  ] : [];

  const uncertaintyData = currentRun ? [
    { name: 'Low (<0.25)', count: currentRun.prototype.uncertaintyBreakdown.low, fill: '#10B981' },
    { name: 'Medium (0.25-0.5)', count: currentRun.prototype.uncertaintyBreakdown.medium, fill: '#F59E0B' },
    { name: 'High (>0.5)', count: currentRun.prototype.uncertaintyBreakdown.high, fill: '#EF4444' }
  ] : [];

  const filteredSamples = currentRun?.sampleComparisons.filter(s => {
    if (filterType === "ALL") return true;
    return s.outcomeType === filterType;
  }) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-[#D4AF37]">Controlled Experimentation Harness</h1>
          <p className="text-xs text-gray-400 mt-1">
            Comparative evaluation of Availability-Only Baseline vs. Multi-Constraint Priority Prototype across synthetic dataset.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunExperiment}
            disabled={running}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-lg ${
              running 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-[#D4AF37] text-black hover:bg-[#e0bc46] active:scale-95'
            }`}
          >
            {running ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Evaluating 200+ Cases...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                Run Experiment (220 Prescriptions)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Synthetic Research Disclaimer */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <span className="font-semibold text-amber-400">Experimental Evaluation Notice: </span>
          All records, rules, and outcomes are simulated for decision-engine benchmarking. The Baseline represents an unconstrained inventory-only system, while the Prototype enforces the 8-priority clinical safety hierarchy.
        </div>
      </div>

      {!currentRun && !running ? (
        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-16 text-center space-y-4 shadow-2xl">
          <Clock className="w-12 h-12 text-[#D4AF37] mx-auto opacity-70" />
          <h3 className="text-lg font-serif italic text-white">No Experiment Run Loaded</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Click &ldquo;Run Experiment&rdquo; to benchmark the rule-based safety engine against the unconstrained baseline over 220 synthetic prescriptions.
          </p>
          <button
            onClick={handleRunExperiment}
            className="px-6 py-2.5 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-[#e0bc46]"
          >
            Execute Benchmark Now
          </button>
        </div>
      ) : currentRun ? (
        <>
          {/* Top Scorecard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
              <div className="flex items-center justify-between text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                <span>Dataset Scale</span>
                <FileCheck className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <p className="text-3xl font-serif text-white mt-2 tabular-nums">{currentRun.datasetSize}</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider tabular-nums">
                {currentRun.prototype.totalEvaluations} candidate evaluations
              </p>
            </div>

            <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
              <div className="flex items-center justify-between text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                <span>Unsafe Prevented</span>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-3xl font-serif text-rose-500 mt-2 tabular-nums">
                {currentRun.differences.safetyViolationsPrevented}
              </p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                Baseline would have allowed
              </p>
            </div>

            <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
              <div className="flex items-center justify-between text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                <span>Human Reviews Triggered</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-serif text-amber-500 mt-2 tabular-nums">
                {currentRun.prototype.humanReviewCases}
              </p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                {currentRun.prototype.humanReviewRate} review rate
              </p>
            </div>

            <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
              <div className="flex items-center justify-between text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                <span>Safe Option Retention</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-serif text-emerald-500 mt-2 tabular-nums">
                {currentRun.prototype.validOptionRetention}
              </p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider tabular-nums">
                {currentRun.prototype.validCasesRemaining} prescriptions preserved
              </p>
            </div>
          </div>

          {/* Comparative Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: Baseline vs Prototype */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                  Decision Outcome Comparison
                </h3>
                <span className="text-[10px] text-gray-500 font-mono">Run: {currentRun.id}</span>
              </div>
              <div className="h-64 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                    <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f0f0f', color: '#fff', fontSize: '12px' }} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Baseline" fill="#4B5563" radius={[4, 4, 0, 0]} maxBarSize={45} />
                    <Bar dataKey="Prototype" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Error Breakdown & Violation Categories */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold mb-4">
                  Safety Violation Intercepts
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-lg border border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Allergy Hypersensitivity Conflicts</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">RULE-ALLERGY-001 Priority 1 hard blocks</p>
                    </div>
                    <span className="text-sm font-mono font-bold text-rose-500 tabular-nums">
                      {currentRun.differences.allergyConflictsCaught} caught
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-lg border border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Prescriber DAW Prohibitions</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">RULE-PRESCRIBER-002 Priority 2 directives</p>
                    </div>
                    <span className="text-sm font-mono font-bold text-amber-500 tabular-nums">
                      {currentRun.differences.prescriberProhibitionsCaught} enforced
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-lg border border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Route & Strength Discrepancies</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">RULE-ROUTE-004 / RULE-STRENGTH-005</p>
                    </div>
                    <span className="text-sm font-mono font-bold text-blue-400 tabular-nums">
                      {currentRun.differences.routeStrengthMismatchesCaught} filtered
                    </span>
                  </div>
                </div>
              </div>

              {/* Uncertainty Distribution */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-400 mb-2">
                  <span>Experimental Uncertainty Model</span>
                  <span>Not a clinical probability</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded">
                    <p className="text-[10px] text-emerald-400 uppercase">Low</p>
                    <p className="text-sm font-bold text-emerald-300 font-mono tabular-nums">
                      {currentRun.prototype.uncertaintyBreakdown.low}
                    </p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded">
                    <p className="text-[10px] text-amber-400 uppercase">Medium</p>
                    <p className="text-sm font-bold text-amber-300 font-mono tabular-nums">
                      {currentRun.prototype.uncertaintyBreakdown.medium}
                    </p>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded">
                    <p className="text-[10px] text-rose-400 uppercase">High</p>
                    <p className="text-sm font-bold text-rose-300 font-mono tabular-nums">
                      {currentRun.prototype.uncertaintyBreakdown.high}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filterable Outcome Differences & Error Analysis */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-serif italic text-white">Comparative Sample Analysis</h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">
                  Granular side-by-side evaluation of baseline vs prototype decisions.
                </p>
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10 text-xs">
                <button
                  onClick={() => setFilterType("ALL")}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    filterType === "ALL" ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All ({currentRun.sampleComparisons.length})
                </button>
                <button
                  onClick={() => setFilterType("PROTECTED")}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    filterType === "PROTECTED" ? 'bg-rose-500/30 text-rose-400 font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Safety Blocks ({currentRun.sampleComparisons.filter(s => s.outcomeType === "PROTECTED").length})
                </button>
                <button
                  onClick={() => setFilterType("REVIEW_TRIGGERED")}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    filterType === "REVIEW_TRIGGERED" ? 'bg-amber-500/30 text-amber-400 font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Reviews ({currentRun.sampleComparisons.filter(s => s.outcomeType === "REVIEW_TRIGGERED").length})
                </button>
                <button
                  onClick={() => setFilterType("UNAVAILABLE")}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    filterType === "UNAVAILABLE" ? 'bg-gray-500/30 text-gray-300 font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Out of Stock ({currentRun.sampleComparisons.filter(s => s.outcomeType === "UNAVAILABLE").length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest border-b border-white/10">
                  <tr>
                    <th scope="col" className="p-4">Prescription</th>
                    <th scope="col" className="p-4">Candidate</th>
                    <th scope="col" className="p-4">Baseline Result</th>
                    <th scope="col" className="p-4">Prototype Result</th>
                    <th scope="col" className="p-4">Safety Intercept Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSamples.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 text-xs uppercase tracking-wider">
                        No samples matching selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSamples.map((sample, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono font-semibold text-white whitespace-nowrap">
                          {sample.prescriptionId}
                          <span className="block text-[10px] text-gray-500 font-normal">Patient {sample.patientId}</span>
                        </td>
                        <td className="p-4 font-mono text-gray-300 whitespace-nowrap">
                          {sample.medicationId}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {sample.baselineResult === "VALID OPTION" ? (
                            <span className="text-gray-400 font-medium line-through">VALID OPTION</span>
                          ) : (
                            <span className="text-gray-500">{sample.baselineResult}</span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {sample.prototypeResult === "BLOCKED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/20">
                              <ShieldAlert className="w-3 h-3" /> BLOCKED
                            </span>
                          )}
                          {sample.prototypeResult === "NEEDS HUMAN REVIEW" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20">
                              <AlertTriangle className="w-3 h-3" /> NEEDS REVIEW
                            </span>
                          )}
                          {sample.prototypeResult === "UNSUITABLE" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/20">
                              UNSUITABLE
                            </span>
                          )}
                          {sample.prototypeResult === "VALID OPTION" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" /> VALID
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-300 text-xs">
                          {sample.safetyNote}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
