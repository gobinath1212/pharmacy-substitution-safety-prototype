"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert, FileWarning, ArrowLeft, Info, FileText } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

type Evaluation = any; // simplified for client side

const Badge = ({ decision }: { decision: string }) => {
  switch (decision) {
    case "VALID OPTION": return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> VALID OPTION</span>;
    case "BLOCKED": return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><ShieldAlert className="w-3.5 h-3.5" /> BLOCKED</span>;
    case "UNSUITABLE": return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800"><AlertCircle className="w-3.5 h-3.5" /> UNSUITABLE</span>;
    case "NEEDS HUMAN REVIEW": return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><FileWarning className="w-3.5 h-3.5" /> NEEDS REVIEW</span>;
    default: return null;
  }
};

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [rx, setRx] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  
  // Override state
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideLoading, setOverrideLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      // For the prototype, we fetch the prescriptions directly via API route
      const res = await fetch(`/api/prescriptions?id=${params.id}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setRx(data);

      // Now evaluate all alternatives except the prescribed one
      // Just hardcoding candidates for prototype
      const candidates = ["MED-A", "MED-B", "MED-C", "MED-D", "MED-E"].filter(id => id !== data.medicationId);
      
      const evals = await Promise.all(candidates.map(async (altId) => {
        const evalRes = await fetch('/api/evaluate-substitution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prescriptionId: data.id, alternativeId: altId })
        });
        return evalRes.json();
      }));

      setEvaluations(evals);
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  const handleOverride = async () => {
    if (!overrideReason.trim() || !selectedEval) return;
    setOverrideLoading(true);
    
    await fetch('/api/override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: rx.id,
        alternativeId: selectedEval.alternativeId,
        reviewerId: "PHARM-USER-1",
        reason: overrideReason,
        previousDecision: selectedEval.decision
      })
    });
    
    setOverrideLoading(false);
    setShowOverride(false);
    setSelectedEval(null);
    setOverrideReason("");
    
    // Refresh the page or evaluations
    router.refresh();
    alert("Override logged successfully. Check Audit Log.");
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading synthetic case...</div>;
  if (!rx) return <div className="p-12 text-center text-red-500">Prescription not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white bg-white/5 p-2 border border-white/10 rounded transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-serif italic text-[#D4AF37]">Case Review: {rx.id}</h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Reviewing potential substitution alternatives.</p>
        </div>
      </div>

      <div className="bg-[#0f0f0f] rounded-xl border border-white/10 p-6 shadow-2xl">
        <h2 className="text-lg font-serif italic text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#D4AF37]" /> Original Prescription
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Medication</p>
            <p className="font-mono text-white mt-1">{rx.medicationId}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Strength & Route</p>
            <p className="font-semibold text-gray-300 mt-1">{rx.strength} • {rx.route}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Patient Allergies</p>
            <div className="mt-1 flex gap-2">
              {rx.allergyIds.length ? rx.allergyIds.map((a: string) => (
                <span key={a} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/20">{a}</span>
              )) : <span className="text-gray-500 text-[10px] italic">None</span>}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Patient Constraints</p>
            <div className="mt-1 flex gap-2 flex-wrap">
              {rx.patientConstraints.length ? rx.patientConstraints.map((c: string) => (
                <span key={c} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/20">{c}</span>
              )) : <span className="text-gray-500 text-[10px] italic">None</span>}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-serif italic text-white mt-8 mb-4">Candidate Alternatives</h2>
      <div className="bg-[#0f0f0f] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest">
            <tr className="border-b border-white/10">
              <th scope="col" className="p-4">Alternative</th>
              <th scope="col" className="p-4">Risk Level</th>
              <th scope="col" className="p-4">Decision</th>
              <th scope="col" className="p-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {evaluations.map((ev) => (
              <tr key={ev.alternativeId} className="hover:bg-white/5 transition-colors">
                <td className="p-4 whitespace-nowrap text-sm font-mono text-white">{ev.alternativeId}</td>
                <td className="p-4 whitespace-nowrap text-sm">
                  <span className={`font-bold text-[10px] uppercase tracking-widest ${ev.riskLevel === 'HIGH' ? 'text-rose-500' : ev.riskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {ev.riskLevel}
                  </span>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <Badge decision={ev.decision} />
                </td>
                <td className="p-4 whitespace-nowrap text-right">
                  <button onClick={() => setSelectedEval(ev)} className="text-[#D4AF37] hover:text-white text-[10px] uppercase tracking-widest font-bold transition-colors">View Evidence</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Decision Evidence Dialog */}
      <Dialog.Root open={!!selectedEval} onOpenChange={(open) => !open && setSelectedEval(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-[#050505]/80 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-[#0f0f0f] border border-white/10 p-6 shadow-2xl focus:outline-none z-50 overflow-y-auto">
            {selectedEval && (
              <div>
                <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                  <Dialog.Title className="text-xl font-serif italic text-white">Decision Explanation: {selectedEval.alternativeId}</Dialog.Title>
                  <Badge decision={selectedEval.decision} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 p-4 rounded border border-white/5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Risk Level</p>
                    <p className={`font-bold text-lg ${selectedEval.riskLevel === 'HIGH' ? 'text-rose-500' : selectedEval.riskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'}`}>{selectedEval.riskLevel}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded border border-white/5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Prototype Uncertainty</p>
                    <p className="font-mono text-lg text-white">{selectedEval.uncertaintyScore.toFixed(2)}</p>
                  </div>
                </div>

                {selectedEval.violatedRules.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500" /> Violated Constraints
                    </h3>
                    <ul className="space-y-2">
                      {selectedEval.violatedRules.map((r: string, i: number) => (
                         <li key={i} className="text-xs text-rose-500 bg-rose-500/10 p-3 rounded border border-rose-500/20">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedEval.evidence.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Supporting Evidence
                    </h3>
                    <ul className="space-y-2">
                      {selectedEval.evidence.map((r: string, i: number) => (
                        <li key={i} className="text-xs text-emerald-500 bg-emerald-500/10 p-3 rounded border border-emerald-500/20">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedEval.potentialHarm.length > 0 && (
                  <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-white p-4 rounded-lg">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2 text-rose-500">
                      <AlertTriangle className="w-4 h-4" /> Potential Harm Warnings
                    </h3>
                    <ul className="space-y-2 list-none text-xs text-gray-300">
                      {selectedEval.potentialHarm.map((h: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1 shrink-0"></div> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-6 bg-white/5 p-4 rounded border border-white/5">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Required Action</h3>
                  <p className="text-sm text-gray-300 font-medium">
                    {selectedEval.decision === 'BLOCKED' ? 'System blocked substitution.' : 
                     selectedEval.decision === 'NEEDS HUMAN REVIEW' ? 'Human confirmation required before proceeding.' : 
                     selectedEval.decision === 'UNSUITABLE' ? 'No action - option unavailable.' : 
                     'Safe to substitute according to prototype rules.'}
                  </p>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button onClick={() => setSelectedEval(null)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors border border-transparent">
                    Close
                  </button>
                  
                  {['BLOCKED', 'NEEDS HUMAN REVIEW'].includes(selectedEval.decision) && (
                    <button 
                      onClick={() => setShowOverride(true)}
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black bg-[#D4AF37] hover:bg-[#b5952f] rounded transition-colors flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" /> Human Review & Override
                    </button>
                  )}
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Override Dialog */}
      <Dialog.Root open={showOverride} onOpenChange={setShowOverride}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-[#050505]/90 backdrop-blur-md z-[60]" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-[#0f0f0f] border border-[#D4AF37]/50 p-6 shadow-2xl focus:outline-none z-[70]">
            <Dialog.Title className="text-lg font-serif italic text-white mb-4">Human Review Required</Dialog.Title>
            
            <div className="bg-amber-500/10 p-4 rounded border border-amber-500/20 mb-6">
              <p className="text-sm text-amber-500 mb-2">You are attempting to override a system safeguard for alternative <strong className="text-white font-mono">{selectedEval?.alternativeId}</strong>.</p>
              <p className="text-xs text-amber-500/70 uppercase tracking-widest font-bold">All overrides are logged. Do not proceed unless you have verified clinical appropriateness outside the system.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Override Reason <span className="text-rose-500">*</span></label>
                <select 
                  value={overrideReason} 
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-[#050505] border border-white/20 rounded p-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                >
                  <option value="" className="text-gray-500">Select a reason...</option>
                  <option value="Prescriber contacted and approved">Prescriber contacted and approved</option>
                  <option value="Patient preference confirmed clinically safe">Patient preference confirmed clinically safe</option>
                  <option value="Additional clinical information received">Additional clinical information received</option>
                  <option value="Stock emergency (critical shortage)">Stock emergency (critical shortage)</option>
                  <option value="Other">Other (Document in clinical notes)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
                <button 
                  onClick={() => setShowOverride(false)} 
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleOverride}
                  disabled={!overrideReason || overrideLoading}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:bg-rose-900 rounded transition-colors flex items-center gap-2"
                >
                  {overrideLoading ? 'Logging...' : 'Confirm Override'}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}

// Add FileText icon if missing from import list on top, it's there but just to be sure.
