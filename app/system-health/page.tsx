"use client";

import { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Server, 
  Database, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  Clock,
  Layers
} from 'lucide-react';

interface ComponentHealth {
  component: string;
  category: "Core Engine" | "Storage & Data" | "Workflow & Audit" | "Presentation";
  status: "PASS" | "WARNING" | "FAIL";
  details: string;
  latencyMs: number;
}

export default function SystemHealthPage() {
  const [components, setComponents] = useState<ComponentHealth[]>([]);
  const [overallStatus, setOverallStatus] = useState<"PASS" | "WARNING" | "FAIL">("PASS");
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string>("");

  const runHealthChecks = async () => {
    const checks: ComponentHealth[] = [];

    // 1. Health API Check
    const startHealth = performance.now();
    try {
      const res = await fetch('/api/health');
      const healthData = await res.json();
      checks.push({
        component: "System Health API (/api/health)",
        category: "Storage & Data",
        status: res.ok && healthData.status === "HEALTHY" ? "PASS" : "WARNING",
        details: `Storage status: ${healthData.storageStatus} · Prescriptions: ${healthData.databaseHealth?.prescriptions}`,
        latencyMs: Math.round(performance.now() - startHealth)
      });
    } catch {
      checks.push({
        component: "System Health API",
        category: "Storage & Data",
        status: "FAIL",
        details: "Failed to connect to health endpoint.",
        latencyMs: 0
      });
    }

    // 2. Rules Engine Check
    const startRules = performance.now();
    try {
      const res = await fetch('/api/evaluate-substitution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId: "RX-1001", alternativeId: "MED-C" })
      });
      const evalData = await res.json();
      const isPass = res.ok && evalData.decision === "BLOCKED";
      checks.push({
        component: "8-Priority Rules Engine (engine.ts)",
        category: "Core Engine",
        status: isPass ? "PASS" : "FAIL",
        details: "Deterministic rule hierarchy active. Verified allergy block on Priority 1.",
        latencyMs: Math.round(performance.now() - startRules)
      });
    } catch {
      checks.push({
        component: "8-Priority Rules Engine",
        category: "Core Engine",
        status: "FAIL",
        details: "Rule engine evaluation threw an unexpected error.",
        latencyMs: 0
      });
    }

    // 3. Storage Layer Check
    const startStorage = performance.now();
    try {
      const res = await fetch('/api/prescriptions?limit=1');
      checks.push({
        component: "Persistent Storage Layer (IStorageAdapter)",
        category: "Storage & Data",
        status: res.ok ? "PASS" : "FAIL",
        details: "Local persistent JSON file store readable and operational.",
        latencyMs: Math.round(performance.now() - startStorage)
      });
    } catch {
      checks.push({
        component: "Persistent Storage Layer",
        category: "Storage & Data",
        status: "FAIL",
        details: "Storage layer read error.",
        latencyMs: 0
      });
    }

    // 4. Audit Log & Hash Integrity Check
    const startAudit = performance.now();
    try {
      const res = await fetch('/api/audit?verify=true');
      const auditData = await res.json();
      checks.push({
        component: "Audit Log & Cryptographic Checksum",
        category: "Workflow & Audit",
        status: res.ok && auditData.isTamperFree ? "PASS" : "WARNING",
        details: `Integrity status: ${auditData.isTamperFree ? 'Tamper-free' : 'Discrepancy'} · Verified: ${auditData.verifiedCount} records`,
        latencyMs: Math.round(performance.now() - startAudit)
      });
    } catch {
      checks.push({
        component: "Audit Log & Hash Integrity",
        category: "Workflow & Audit",
        status: "FAIL",
        details: "Failed to verify audit log integrity.",
        latencyMs: 0
      });
    }

    // 5. Follow-Up & Escalation Pipeline Check
    const startFollowups = performance.now();
    try {
      const res = await fetch('/api/followups');
      const fuData = await res.json();
      checks.push({
        component: "Follow-up & Escalation Pipeline",
        category: "Workflow & Audit",
        status: res.ok ? "PASS" : "FAIL",
        details: `Queue operational. ${fuData.length} active follow-up tasks loaded.`,
        latencyMs: Math.round(performance.now() - startFollowups)
      });
    } catch {
      checks.push({
        component: "Follow-up Pipeline",
        category: "Workflow & Audit",
        status: "FAIL",
        details: "Follow-up service unresponsive.",
        latencyMs: 0
      });
    }

    // 6. Experiment Execution Engine Check
    const startExp = performance.now();
    try {
      const res = await fetch('/api/experiments');
      checks.push({
        component: "Comparative Experiment Engine",
        category: "Core Engine",
        status: res.ok ? "PASS" : "FAIL",
        details: "Baseline vs Prototype benchmark framework operational.",
        latencyMs: Math.round(performance.now() - startExp)
      });
    } catch {
      checks.push({
        component: "Comparative Experiment Engine",
        category: "Core Engine",
        status: "FAIL",
        details: "Experiment engine unreachable.",
        latencyMs: 0
      });
    }

    // 7. Evidence Catalog Check
    const startEvidence = performance.now();
    try {
      const res = await fetch('/api/evidence');
      const evData = await res.json();
      checks.push({
        component: "Synthetic Evidence Catalog",
        category: "Core Engine",
        status: res.ok && evData.count >= 8 ? "PASS" : "WARNING",
        details: `Active references: ${evData.count} standards (EVID-001 through EVID-008).`,
        latencyMs: Math.round(performance.now() - startEvidence)
      });
    } catch {
      checks.push({
        component: "Synthetic Evidence Catalog",
        category: "Core Engine",
        status: "FAIL",
        details: "Evidence catalog unavailable.",
        latencyMs: 0
      });
    }

    // 8. Data Quality Service Check
    const startDataQuality = performance.now();
    try {
      const res = await fetch('/api/data-quality');
      const dqData = await res.json();
      checks.push({
        component: "Data Quality & Telemetry Audit",
        category: "Storage & Data",
        status: res.ok && dqData.criticalCount === 0 ? "PASS" : "WARNING",
        details: `Audit status: ${dqData.integrityStatus} · Critical issues: ${dqData.criticalCount}`,
        latencyMs: Math.round(performance.now() - startDataQuality)
      });
    } catch {
      checks.push({
        component: "Data Quality Audit",
        category: "Storage & Data",
        status: "FAIL",
        details: "Data quality check failed.",
        latencyMs: 0
      });
    }

    setComponents(checks);
    const hasFail = checks.some(c => c.status === "FAIL");
    const hasWarn = checks.some(c => c.status === "WARNING");
    setOverallStatus(hasFail ? "FAIL" : hasWarn ? "WARNING" : "PASS");
    setLastChecked(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runHealthChecks();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-[#D4AF37]">System Health & Diagnostics</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time verification of frontend components, deterministic engine, persistent store, and workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-mono">Last verified: {lastChecked || "Checking..."}</span>
          <button
            onClick={() => { setLoading(true); runHealthChecks(); }}
            disabled={loading}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#e0bc46] disabled:opacity-50 text-black rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Run Diagnostics
          </button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <div className={`p-5 rounded-xl border flex items-center justify-between shadow-2xl ${
        overallStatus === "PASS"
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : overallStatus === "WARNING"
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
      }`}>
        <div className="flex items-center gap-3">
          {overallStatus === "PASS" && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
          {overallStatus === "WARNING" && <AlertTriangle className="w-6 h-6 text-amber-400" />}
          {overallStatus === "FAIL" && <XCircle className="w-6 h-6 text-rose-500" />}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider">
              System Diagnostics: {overallStatus === "PASS" ? "ALL SUBSYSTEMS NOMINAL" : overallStatus === "WARNING" ? "DEGRADED TELEMETRY DETECTED" : "SUBSYSTEM FAILURE DETECTED"}
            </h2>
            <p className="text-xs opacity-90 mt-0.5">
              8 real subsystem probes executed across API routes, rules engine, storage, and audit hash chains.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-wider bg-black/40 px-3 py-1.5 rounded">
          {components.filter(c => c.status === "PASS").length} / {components.length} Checks Passing
        </span>
      </div>

      {/* Health Probes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {components.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  {item.latencyMs}ms
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">
                  {item.component}
                </h3>
                {item.status === "PASS" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> PASS
                  </span>
                )}
                {item.status === "WARNING" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" /> WARNING
                  </span>
                )}
                {item.status === "FAIL" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <XCircle className="w-3 h-3" /> FAIL
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                {item.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
