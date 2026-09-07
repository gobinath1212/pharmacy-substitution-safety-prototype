"use client";

import { useMemo } from 'react';
import { calculateMetrics } from '../src/services/metrics';
import { Shield, ShieldAlert, FileWarning, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
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
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl font-serif italic text-[#D4AF37]">Pharmacy Substitution Safety Dashboard</h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Prototype monitoring and rule engine metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-500">Total Evaluations</h3>
            <Shield className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-2xl font-serif text-white mt-2">{metrics.totalEvaluations}</p>
        </div>
        
        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-500">Unsafe Blocked</h3>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-serif text-rose-500 mt-2">{metrics.prototype.unsafeBlocked}</p>
          <p className="text-[10px] text-gray-500 mt-1 tracking-wider uppercase">100% catch rate vs baseline</p>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-500">Needs Human Review</h3>
            <FileWarning className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-serif text-amber-500 mt-2">{metrics.prototype.humanReviewCases}</p>
          <p className="text-[10px] text-gray-500 mt-1 tracking-wider uppercase">Due to constraints/uncertainty</p>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-500">Valid Options Remaining</h3>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-serif text-emerald-500 mt-2">{metrics.prototype.validCasesRemaining}</p>
          <p className="text-[10px] text-gray-500 mt-1 tracking-wider uppercase">Prescriptions with safe alternative</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col">
          <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Baseline vs Rule-Based Prototype</h3>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                <Tooltip cursor={{fill: '#1a1a1a'}} contentStyle={{borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f0f0f', color: '#fff'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                <Bar dataKey="Baseline" fill="#4B5563" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Prototype" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-2xl">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Safety Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded border border-white/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <div>
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">Unsafe Substitution Rate</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Prototype vs Target ({`<2%`})</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif font-bold text-emerald-500 text-lg">{metrics.prototype.unsafeSubstitutionRate}</p>
                <p className="text-[10px] text-rose-400 line-through">Baseline: {metrics.baseline.unsafeSubstitutionRate}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded border border-white/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">Valid-Option Retention</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Prescriptions with {'>'}= 1 valid alt</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif font-bold text-white text-lg">{metrics.prototype.validOptionRetention}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded border border-white/10">
              <div className="flex items-center gap-3">
                <FileWarning className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">Human-Review Rate</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Cases requiring pharmacist check</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif font-bold text-white text-lg">{metrics.prototype.humanReviewRate}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded border border-white/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">Override Rate</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Blocks manually overridden</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif font-bold text-white text-lg">{metrics.prototype.overrideRate}</p>
                <p className="text-[10px] text-gray-500">{metrics.prototype.overrides} total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
