"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  FileWarning, 
  ArrowLeft, 
  Info, 
  FileText,
  ChevronRight,
  ShieldCheck,
  Send,
  MessageSquare,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { CandidateAlternativeEvaluation, PrescriptionAlternativesEvaluation, EvidenceCatalogItem } from '../../../src/types';
import { SYNTHETIC_EVIDENCE_CATALOG } from '../../../src/data/evidenceCatalog';

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "VALID OPTION":
    case "VALID_OPTION":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> VALID OPTION
        </span>
      );
    case "BLOCKED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <ShieldAlert className="w-3.5 h-3.5" /> BLOCKED
        </span>
      );
    case "UNSUITABLE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
          <AlertCircle className="w-3.5 h-3.5" /> UNSUITABLE
        </span>
      );
    case "NEEDS HUMAN REVIEW":
    case "NEEDS_HUMAN_REVIEW":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <FileWarning className="w-3.5 h-3.5" /> NEEDS REVIEW
        </span>
      );
    default:
      return null;
  }
};

const OverallStatusBanner = ({ status, action }: { status: string; action: string }) => {
  let colorClasses = "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
  let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  let label = "VALID OPTIONS AVAILABLE";

  if (status === "URGENT_SAFETY_REVIEW") {
    colorClasses = "bg-rose-500/15 border-rose-500/40 text-rose-300";
    icon = <ShieldAlert className="w-5 h-5 text-rose-400" />;
    label = "URGENT SAFETY REVIEW REQUIRED";
  } else if (status === "HUMAN_REVIEW_REQUIRED") {
    colorClasses = "bg-amber-500/15 border-amber-500/40 text-amber-300";
    icon = <FileWarning className="w-5 h-5 text-amber-400" />;
    label = "PHARMACIST CLINICAL REVIEW REQUIRED";
  } else if (status === "NO_VALID_OPTION") {
    colorClasses = "bg-gray-500/15 border-gray-500/30 text-gray-300";
    icon = <AlertCircle className="w-5 h-5 text-gray-400" />;
    label = "NO VALID SUBSTITUTION AVAILABLE";
  }

  return (
    <div className={`p-4 rounded-xl border ${colorClasses} flex items-start justify-between gap-4 shadow-xl`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div>
          <h3 className="text-xs uppercase tracking-widest font-bold">{label}</h3>
          <p className="text-xs mt-1 opacity-90 leading-relaxed">{action}</p>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-wider font-mono opacity-70 shrink-0">
        Deterministic Rule Engine
      </span>
    </div>
  );
};

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [rx, setRx] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<PrescriptionAlternativesEvaluation | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateAlternativeEvaluation | null>(null);
  const [loading, setLoading] = useState(true);

  // Evidence Dialog
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceCatalogItem | null>(null);

  // Override State
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideSuccessMessage, setOverrideSuccessMessage] = useState("");

  // Stakeholder Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [reviewerName, setReviewerName] = useState("Dr. Evelyn Reed, PharmD");
  const [reviewerRole, setReviewerRole] = useState<"Staff Pharmacist" | "Clinical Pharmacy Specialist" | "Safety Auditor" | "Pharmacy Director">("Staff Pharmacist");
  const [feedbackAgreement, setFeedbackAgreement] = useState<"AGREE" | "DISAGREE" | "NEEDS_MODIFICATION">("AGREE");
  const [feedbackComments, setFeedbackComments] = useState("");
  const [feedbackAction, setFeedbackAction] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Escalate Modal State
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateNote, setEscalateNote] = useState("");
  const [escalateLevel, setEscalateLevel] = useState(1);
  const [escalatePriority, setEscalatePriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("HIGH");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/prescriptions?id=${params.id}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setRx(data);

        // Evaluate all alternatives using prescription-wide evaluation
        const evalRes = await fetch('/api/evaluate-substitution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prescriptionId: data.id, evaluateAll: true })
        });

        if (evalRes.ok) {
          const evalData: PrescriptionAlternativesEvaluation = await evalRes.json();
          setEvaluation(evalData);
          if (evalData.candidateAlternatives.length > 0) {
            setSelectedCandidate(evalData.candidateAlternatives[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load case data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  const handleOverride = async () => {
    if (!overrideReason.trim() || !selectedCandidate || !rx) return;
    setOverrideLoading(true);

    try {
      const res = await fetch('/api/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: rx.id,
          alternativeId: selectedCandidate.alternativeId,
          reviewerId: reviewerName,
          reason: overrideReason,
          previousDecision: selectedCandidate.decision
        })
      });

      if (res.ok) {
        setOverrideSuccessMessage("Override logged in persistent audit log and follow-up queue.");
        setTimeout(() => {
          setShowOverride(false);
          setOverrideReason("");
          setOverrideSuccessMessage("");
        }, 1500);
      }
    } catch (err) {
      console.error("Override failed", err);
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!rx || !selectedCandidate) return;

    try {
      const res = await fetch('/api/validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: rx.id,
          reviewerName,
          reviewerRole,
          agreement: feedbackAgreement,
          decisionEvaluated: `${selectedCandidate.alternativeId} (${selectedCandidate.decision})`,
          comments: feedbackComments,
          recommendedAction: feedbackAction || "Proceed according to verified guideline."
        })
      });

      if (res.ok) {
        setFeedbackSuccess(true);
        setTimeout(() => {
          setShowFeedbackModal(false);
          setFeedbackComments("");
          setFeedbackAction("");
          setFeedbackSuccess(false);
        }, 1200);
      }
    } catch (err) {
      console.error("Feedback submission error:", err);
    }
  };

  const handleEscalateSubmit = async () => {
    if (!rx) return;
    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: rx.id,
          priority: escalatePriority,
          owner: reviewerName,
          escalationLevel: escalateLevel,
          initialNote: escalateNote || `Escalated from Case Review: ${selectedCandidate?.alternativeId}`,
          actor: reviewerName
        })
      });

      if (res.ok) {
        setShowEscalateModal(false);
        setEscalateNote("");
        alert("Case escalated to Follow-up queue successfully.");
      }
    } catch (err) {
      console.error("Escalation error:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-400 space-y-3">
        <Clock className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
        <p className="text-xs uppercase tracking-widest">Evaluating multi-candidate alternatives...</p>
      </div>
    );
  }

  if (!rx) {
    return (
      <div className="p-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-sm font-semibold text-white">Prescription record not found.</p>
        <button onClick={() => router.push('/prescriptions')} className="text-xs text-[#D4AF37] underline">
          Return to Prescriptions
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white bg-white/5 p-2 border border-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-serif italic text-[#D4AF37]">Case Review: {rx.id}</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">
              Comprehensive Multi-Alternative Safety Verification
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
            Pharmacist Validation
          </button>
          <button
            onClick={() => setShowEscalateModal(true)}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs text-rose-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Escalate Case
          </button>
        </div>
      </div>

      {/* Prescription-Wide Overall Status Banner */}
      {evaluation && (
        <OverallStatusBanner
          status={evaluation.overallStatus}
          action={evaluation.recommendedNextAction}
        />
      )}

      {/* Original Prescription Metadata Box */}
      <div className="bg-[#0f0f0f] rounded-xl border border-white/10 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <h2 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D4AF37]" /> Original Prescription Details
          </h2>
          <span className="text-[10px] text-gray-500 font-mono">Patient: {rx.patientId} · Prescriber: {rx.prescriberId}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Prescribed Drug</p>
            <p className="font-mono text-white mt-1 text-sm">{rx.medicationId}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dosage & Route</p>
            <p className="text-gray-300 mt-1">{rx.strength} · {rx.route}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recorded Allergies</p>
            <div className="mt-1 flex gap-1.5 flex-wrap">
              {rx.allergyIds?.length ? rx.allergyIds.map((a: string) => (
                <span key={a} className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/20">
                  {a}
                </span>
              )) : (
                <span className="text-gray-500 text-[11px] italic">No allergies recorded</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Patient Constraints</p>
            <div className="mt-1 flex gap-1.5 flex-wrap">
              {rx.patientConstraints?.length ? rx.patientConstraints.map((c: string) => (
                <span key={c} className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20">
                  {c}
                </span>
              )) : (
                <span className="text-gray-500 text-[11px] italic">None</span>
              )}
            </div>
          </div>
        </div>

        {rx.scenarioDescription && (
          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-gray-400 flex items-center justify-between">
            <span><strong className="text-gray-300">Scenario:</strong> {rx.scenarioDescription}</span>
            <span className="text-gray-500 font-mono text-[10px]">{rx.clinicalNotes}</span>
          </div>
        )}
      </div>

      {/* Candidate Alternatives Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm uppercase tracking-widest font-bold text-[#D4AF37]">
            Evaluated Candidate Alternatives ({evaluation?.candidateAlternatives.length || 0})
          </h2>
          <span className="text-[10px] text-gray-400">Click a candidate to inspect its decision trace</span>
        </div>

        <div className="bg-[#0f0f0f] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest border-b border-white/10">
                <tr>
                  <th scope="col" className="p-3.5">Candidate Drug</th>
                  <th scope="col" className="p-3.5">Evaluation Status</th>
                  <th scope="col" className="p-3.5">Risk Level</th>
                  <th scope="col" className="p-3.5">Uncertainty</th>
                  <th scope="col" className="p-3.5">Primary Decision Reason</th>
                  <th scope="col" className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {evaluation?.candidateAlternatives.map((cand) => {
                  const isSelected = selectedCandidate?.alternativeId === cand.alternativeId;
                  return (
                    <tr
                      key={cand.alternativeId}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-white/10 border-l-2 border-[#D4AF37]' : 'hover:bg-white/5'
                      }`}
                    >
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-white text-sm">{cand.alternativeId}</span>
                        <span className="block text-[10px] text-gray-400">{cand.alternativeName}</span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <StatusBadge status={cand.status} />
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          cand.riskLevel === 'CRITICAL' ? 'text-rose-500' :
                          cand.riskLevel === 'HIGH' ? 'text-rose-400' :
                          cand.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {cand.riskLevel}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-mono text-[11px]">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          cand.uncertainty.level === 'HIGH' ? 'bg-rose-500/20 text-rose-300' :
                          cand.uncertainty.level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {cand.uncertaintyScore} · {cand.uncertainty.level}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-300 max-w-sm truncate text-xs" title={cand.reasons.join(' ')}>
                        {cand.reasons[0] || "Passed all clinical priority rules."}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidate(cand);
                            setShowOverride(true);
                          }}
                          className="text-[10px] uppercase font-bold text-[#D4AF37] hover:text-white px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded transition-colors"
                        >
                          Override
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Selected Candidate Detailed Trace and Evidence */}
      {selectedCandidate && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Decision Trace Banner */}
          <div className="bg-[#0f0f0f] border border-[#D4AF37]/30 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#D4AF37] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                Decision Trace: {selectedCandidate.alternativeId} ({selectedCandidate.alternativeName})
              </h3>
              <StatusBadge status={selectedCandidate.status} />
            </div>
            
            <div className="p-3.5 bg-black/60 rounded-lg border border-white/5 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto">
              {selectedCandidate.decisionTraceText}
            </div>

            {/* Uncertainty Box */}
            <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-gray-400">Experimental Uncertainty Score:</span>
                <span className="font-mono font-bold text-white tabular-nums">{selectedCandidate.uncertaintyScore}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500">({selectedCandidate.uncertainty.level})</span>
              </div>
              <span className="text-[10px] text-gray-500 italic">
                Experimental uncertainty indicator — not a clinical probability
              </span>
            </div>
            {selectedCandidate.uncertainty.reasons.length > 0 && (
              <ul className="mt-2 text-[11px] text-gray-400 list-disc list-inside space-y-0.5">
                {selectedCandidate.uncertainty.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>

          {/* 8-Level Rule Trace Evidence Panel */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-white">
                  Evaluated Rule Priority Hierarchy (Priorities 1 - 8)
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Click any Evidence link (EVID-xxx) to inspect its synthetic reference.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {selectedCandidate.ruleTrace.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border text-xs transition-colors ${
                    item.result === "FAIL"
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : item.result === "REVIEW"
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : item.result === "WARNING"
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black/40 rounded text-gray-400 font-bold">
                        P{item.priority}
                      </span>
                      <span className="font-mono font-semibold text-white">{item.ruleId}</span>
                      <span className="text-gray-400">· {item.ruleDescription}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        item.result === 'FAIL' ? 'bg-rose-500/30 text-rose-300' :
                        item.result === 'REVIEW' ? 'bg-amber-500/30 text-amber-300' :
                        item.result === 'WARNING' ? 'bg-blue-500/30 text-blue-300' : 'bg-emerald-500/30 text-emerald-300'
                      }`}>
                        {item.result} &rarr; {item.decisionEffect}
                      </span>

                      {/* Clickable Synthetic Evidence Link */}
                      <button
                        onClick={() => {
                          const ev = SYNTHETIC_EVIDENCE_CATALOG[item.evidenceId];
                          if (ev) setSelectedEvidence(ev);
                        }}
                        className="text-[10px] font-mono text-[#D4AF37] hover:underline px-2 py-0.5 bg-[#D4AF37]/10 rounded border border-[#D4AF37]/20"
                      >
                        {item.evidenceId}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-400 mt-2 bg-black/30 p-2 rounded">
                    <div>
                      <span className="text-gray-500">Observed Value: </span>
                      <span className="text-gray-200 font-mono">{item.observedValue}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Expected Condition: </span>
                      <span className="text-gray-300">{item.expectedCondition}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-300 mt-2 italic">{item.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Potential Harm Analysis */}
          {selectedCandidate.potentialHarmAnalysis.length > 0 && (
            <div className="bg-[#0f0f0f] border border-rose-500/20 rounded-xl p-5 shadow-2xl">
              <h3 className="text-xs uppercase tracking-widest font-bold text-rose-400 flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Potential Harm & Risk Analysis
              </h3>
              <div className="space-y-3">
                {selectedCandidate.potentialHarmAnalysis.map((harm, idx) => (
                  <div key={idx} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{harm.hazard}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                        Severity: {harm.severity}
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs">{harm.potentialHarm}</p>
                    <div className="text-[10px] text-gray-500 flex items-center justify-between pt-1">
                      <span>Affected Constraint: {harm.affectedConstraint}</span>
                      <span className="font-mono text-gray-400">Preventive Rule: {harm.preventiveRule}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Override Dialog */}
      <Dialog.Root open={showOverride} onOpenChange={setShowOverride}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 shadow-2xl z-50">
            <h2 className="text-lg font-serif italic text-white mb-2">
              Pharmacist Clinical Override
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Overriding candidate <strong className="text-white">{selectedCandidate?.alternativeId}</strong> ({selectedCandidate?.alternativeName}) from status <strong className="text-[#D4AF37]">{selectedCandidate?.decision}</strong>. An immutable audit record will be logged.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                  Clinical Rationale / Prescriber Confirmation *
                </label>
                <textarea
                  rows={4}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Verbal prescriber authorization received for emergency 3-day supply..."
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {overrideSuccessMessage && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {overrideSuccessMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOverride(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs uppercase tracking-wider font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!overrideReason.trim() || overrideLoading}
                  onClick={handleOverride}
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-[#e0bc46] disabled:opacity-50 text-black rounded-lg text-xs uppercase tracking-wider font-bold transition-all"
                >
                  {overrideLoading ? "Logging Override..." : "Confirm Override"}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Pharmacist Validation Feedback Modal */}
      <Dialog.Root open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 shadow-2xl z-50">
            <h2 className="text-lg font-serif italic text-[#D4AF37] mb-2">
              Stakeholder Validation Feedback
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Submit formal clinical audit feedback on the decision outcomes for Case {rx.id}.
            </p>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Reviewer Name</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Clinical Role</label>
                  <select
                    value={reviewerRole}
                    onChange={(e: any) => setReviewerRole(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg p-2.5 text-white"
                  >
                    <option value="Staff Pharmacist">Staff Pharmacist</option>
                    <option value="Clinical Pharmacy Specialist">Clinical Pharmacy Specialist</option>
                    <option value="Safety Auditor">Safety Auditor</option>
                    <option value="Pharmacy Director">Pharmacy Director</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Agreement with Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["AGREE", "NEEDS_MODIFICATION", "DISAGREE"] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFeedbackAgreement(opt)}
                      className={`p-2 rounded-lg text-center font-bold uppercase text-[10px] tracking-wider transition-colors border ${
                        feedbackAgreement === opt
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {opt.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Reviewer Comments</label>
                <textarea
                  rows={3}
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  placeholder="Add clinical observation or evaluation remarks..."
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white placeholder-gray-600"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Recommended Action</label>
                <input
                  type="text"
                  value={feedbackAction}
                  onChange={(e) => setFeedbackAction(e.target.value)}
                  placeholder="e.g. Update patient profile or clarify formulation requirement"
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              {feedbackSuccess && (
                <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40 text-xs">
                  Validation feedback recorded successfully.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-semibold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFeedbackSubmit}
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-[#e0bc46] text-black rounded-lg font-bold uppercase text-xs"
                >
                  Save Feedback
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Escalate Modal */}
      <Dialog.Root open={showEscalateModal} onOpenChange={setShowEscalateModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 shadow-2xl z-50">
            <h2 className="text-lg font-serif italic text-rose-400 mb-2">
              Escalate to Follow-up Queue
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Add Case {rx.id} to the clinical follow-up and escalation pipeline.
            </p>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Priority</label>
                  <select
                    value={escalatePriority}
                    onChange={(e: any) => setEscalatePriority(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg p-2.5 text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Escalation Level</label>
                  <select
                    value={escalateLevel}
                    onChange={(e: any) => setEscalateLevel(parseInt(e.target.value, 10))}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg p-2.5 text-white"
                  >
                    <option value={0}>Level 0: Initial Follow-up</option>
                    <option value={1}>Level 1: Senior Pharmacist Review</option>
                    <option value={2}>Level 2: Prescriber Outreach</option>
                    <option value={3}>Level 3: Urgent Safety Board</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Clinical Note / Reason</label>
                <textarea
                  rows={3}
                  value={escalateNote}
                  onChange={(e) => setEscalateNote(e.target.value)}
                  placeholder="Detail why human intervention or prescriber outreach is required..."
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white placeholder-gray-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-semibold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEscalateSubmit}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold uppercase text-xs"
                >
                  Confirm Escalation
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Synthetic Evidence Inspector Dialog */}
      <Dialog.Root open={!!selectedEvidence} onOpenChange={(open) => !open && setSelectedEvidence(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0d0d0d] border border-[#D4AF37]/30 rounded-2xl p-6 shadow-2xl z-50">
            {selectedEvidence && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded font-mono font-bold">
                      {selectedEvidence.evidenceId}
                    </span>
                    <span className="text-gray-400 font-mono">{selectedEvidence.ruleId}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400">
                    {selectedEvidence.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-serif italic text-white">{selectedEvidence.title}</h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedEvidence.sourceType} · v{selectedEvidence.version}</p>
                </div>

                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Standard Scope</p>
                  <p className="text-gray-300 leading-relaxed">{selectedEvidence.description}</p>
                </div>

                <div className="p-3 bg-[#D4AF37]/5 rounded-lg border border-[#D4AF37]/20">
                  <p className="text-[10px] uppercase font-bold text-[#D4AF37] mb-1">Clinical Rationale</p>
                  <p className="text-gray-300 leading-relaxed">{selectedEvidence.clinicalRationale}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-white/10">
                  <span>Ref: {selectedEvidence.syntheticReference}</span>
                  <span>Effective: {selectedEvidence.effectiveDate}</span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedEvidence(null)}
                    className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs uppercase tracking-wider font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
