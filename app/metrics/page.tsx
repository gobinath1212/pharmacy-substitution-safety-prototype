"use client";

import { useMemo } from 'react';
import { calculateMetrics } from '../../src/services/metrics';
import { Shield, ShieldAlert, AlertTriangle, FileWarning, CheckCircle2 } from 'lucide-react';

export default function MetricsPage() {
  const metrics = useMemo(() => calculateMetrics(), []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl font-serif italic text-[#D4AF37]">Prototype Metrics</h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Detailed performance and safety metrics comparison.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Baseline Model */}
        <div className="bg-[#0f0f0f] rounded-xl border border-white/10 p-6 shadow-2xl">
          <h2 className="text-lg font-serif italic text-white mb-6 flex items-center gap-2">
            Baseline Algorithm
            <span className="text-[10px] tracking-widest uppercase font-bold bg-white/5 text-gray-500 px-2 py-0.5 rounded">Availability Only</span>
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Unsafe Substitution Rate</p>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-serif text-white">{metrics.baseline.unsafeSubstitutionRate}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Fails target</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{metrics.baseline.unsafeAllowed} unsafe combinations allowed due to lack of constraint checking.</p>
            </div>
            
            <div className="border-t border-white/10 pt-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Valid-Option Retention</p>
              <p className="text-2xl font-serif text-white">100.0%</p>
              <p className="text-xs text-gray-500 mt-1">All available options retained, but includes unsafe ones.</p>
            </div>
          </div>
        </div>

        {/* Prototype Model */}
        <div className="bg-[#0f0f0f] rounded-xl border border-[#D4AF37]/30 p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl rounded-full"></div>
          <h2 className="text-lg font-serif italic text-[#D4AF37] mb-6 flex items-center gap-2">
            Rule-Based Prototype
            <span className="text-[10px] tracking-widest uppercase font-bold bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded">Constraint-Aware</span>
          </h2>

          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Unsafe Substitution Rate</p>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-serif text-emerald-500">{metrics.prototype.unsafeSubstitutionRate}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Meets target</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{metrics.prototype.unsafeBlocked} unsafe combinations successfully blocked.</p>
            </div>
            
            <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Valid-Option Retention</p>
                <p className="text-xl font-serif text-white">{metrics.prototype.validOptionRetention}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Human-Review Rate</p>
                <p className="text-xl font-serif text-white">{metrics.prototype.humanReviewRate}</p>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">False Block Rate</p>
                <p className="text-xl font-serif text-white">{metrics.prototype.falseBlockRate}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Override Rate</p>
                <p className="text-xl font-serif text-white">{metrics.prototype.overrideRate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
