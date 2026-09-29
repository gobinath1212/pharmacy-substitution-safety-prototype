"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { calculateMetrics } from '../src/services/metrics';
import { 
  Shield, 
  ShieldAlert, 
  FileWarning, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  FlaskConical, 
  ArrowRight,
  Library,
  Layers
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const metrics = useMemo(() => calculateMetrics(), []);

  const chartData = [
    {
      name: 'Unsafe Allowed',
      Baseline: metrics.baseline.unsafeAllowed,
      Prototype: 0,
    },
    {
      name: 'Human Reviews',
      Baseline: 0,
      Prototype: metrics.prototype.humanReviewCases,
    },
    {
      name: 'Unsafe Blocked',
      Baseline: 0,
      Prototype: metrics.prototype.unsafeBlocked,
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0f0f0f] via-[#0d0d0d] to-black border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-mono font-bold">
            70% Prototype Milestone · Deterministic Safety Engine
          </div>
          <h1 className="text-3xl font-serif italic text-white tracking-tight">
            Pharmacy Prescription Substitution Safety Prototype
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Rule-based multi-alternative evaluation, 8-level priority conflict resolution, evidence traceability, and comparative experimentation across 220 controlled synthetic cases.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/experiment"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#e0bc46] transition-colors shadow-lg"
            >
              <FlaskConical className="w-4 h-4 fill-black" />
              Launch Experiment Harness
            </Link>
            <Link
              href="/review/RX-DEMO"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Interactive Demo Case <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/evidence"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Library className="w-3.5 h-3.5 text-[#D4AF37]" />
              Evidence Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Total Synthetic Cases</h3>
            <Shield className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-3xl font-serif text-white mt-2 tabular-nums">{metrics.totalPrescriptions}</p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider tabular-nums">{metrics.totalEvaluations} evaluations</p>
        </div>
        
        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Unsafe Blocked</h3>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-serif text-rose-500 mt-2 tabular-nums">{metrics.prototype.unsafeBlocked}</p>
          <p className="text-[10px] text-gray-500 mt-1 tracking-wider uppercase">100% catch rate vs baseline</p>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Needs Human Review</h3>
            <FileWarning className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-serif text-amber-500 mt-2 tabular-nums">{metrics.prototype.humanReviewCases}</p>
          <p className="text-[10px] text-gray-500 mt-1 tracking-wider uppercase">Formulation/telemetry triggers</p>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Valid Options Preserved</h3>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-serif text-emerald-500 mt-2 tabular-nums">{metrics.prototype.validCasesRemaining}</p>
          <p className="text-[10px] text-gray-500 mt-1 tracking-wider uppercase">{metrics.prototype.validOptionRetention} preservation rate</p>
        </div>
      </div>

      {/* Visual Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">Baseline vs Rule-Based Prototype</h3>
            <span className="text-[10px] text-gray-500 font-mono">Benchmark Metrics</span>
          </div>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f0f0f', color: '#fff', fontSize: '12px'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                <Bar dataKey="Baseline" fill="#4B5563" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Prototype" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Key Safety Indicators</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <div>
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">Unsafe Substitution Rate</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Prototype vs Target ({`<2%`})</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif font-bold text-emerald-400 text-lg tabular-nums">{metrics.prototype.unsafeSubstitutionRate}</p>
                <p className="text-[10px] text-rose-400 line-through">Baseline: {metrics.baseline.unsafeSubstitutionRate}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">Valid-Option Retention</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Prescriptions with at least 1 safe alt</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif font-bold text-white text-lg tabular-nums">{metrics.prototype.validOptionRetention}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <FileWarning className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">Human-Review Rate</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Physical constraints & telemetry staleness</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif font-bold text-white text-lg tabular-nums">{metrics.prototype.humanReviewRate}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">Pharmacist Override Rate</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Logged in immutable audit trail</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif font-bold text-white text-lg tabular-nums">{metrics.prototype.overrideRate}</p>
                <p className="text-[10px] text-gray-500 tabular-nums">{metrics.prototype.overrides} total logged</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
