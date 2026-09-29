export default function RequirementsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-xl font-serif italic text-[#D4AF37]">Requirements Specification</h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Pharmacy Substitution Safety Prototype · 70% Milestone Specification</p>
      </div>

      <div className="bg-[#0f0f0f] p-6 rounded-xl border border-white/10 shadow-2xl space-y-6 max-w-none">
        <div>
          <h3 className="text-lg font-serif italic text-white border-b border-white/10 pb-2">Problem Statement</h3>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Pharmacists face cognitive overload when identifying safe substitution alternatives during drug shortages. Manual checks of allergies, prescriber restrictions, patient physical constraints, route mismatches, and potency equivalence are prone to slips. This academic prototype benchmarks a deterministic 8-priority safety engine against an unconstrained availability-only baseline across 220 controlled synthetic cases.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-serif italic text-white border-b border-white/10 pb-2">8-Priority Rule Hierarchy</h3>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-white/5 rounded border border-white/5">
              <span className="font-mono text-[#D4AF37] font-bold">Priority 1:</span> Allergy & Hypersensitivity Screen (RULE-ALLERGY-001) &rarr; <span className="text-rose-400 font-bold">BLOCKED</span>
            </div>
            <div className="p-3 bg-white/5 rounded border border-white/5">
              <span className="font-mono text-[#D4AF37] font-bold">Priority 2:</span> Prescriber DAW Prohibition (RULE-PRESCRIBER-002) &rarr; <span className="text-rose-400 font-bold">BLOCKED</span>
            </div>
            <div className="p-3 bg-white/5 rounded border border-white/5">
              <span className="font-mono text-[#D4AF37] font-bold">Priority 3:</span> Therapeutic Bioequivalence Group (RULE-APPROVAL-003) &rarr; <span className="text-rose-400 font-bold">BLOCKED</span>
            </div>
            <div className="p-3 bg-white/5 rounded border border-white/5">
              <span className="font-mono text-[#D4AF37] font-bold">Priority 4:</span> Route Compatibility (RULE-ROUTE-004) &rarr; <span className="text-rose-400 font-bold">BLOCKED</span>
            </div>
            <div className="p-3 bg-white/5 rounded border border-white/5">
              <span className="font-mono text-[#D4AF37] font-bold">Priority 5:</span> Dosage Strength Equivalence (RULE-STRENGTH-005) &rarr; <span className="text-rose-400 font-bold">BLOCKED</span>
            </div>
            <div className="p-3 bg-white/5 rounded border border-white/5">
              <span className="font-mono text-[#D4AF37] font-bold">Priority 6:</span> Patient Physical Formulation Constraint (RULE-PATIENT-006) &rarr; <span className="text-amber-400 font-bold">REVIEW</span>
            </div>
            <div className="p-3 bg-white/5 rounded border border-white/5">
              <span className="font-mono text-[#D4AF37] font-bold">Priority 7:</span> Warehouse Inventory Availability (RULE-STOCK-007) &rarr; <span className="text-gray-400 font-bold">UNSUITABLE</span>
            </div>
            <div className="p-3 bg-white/5 rounded border border-white/5">
              <span className="font-mono text-[#D4AF37] font-bold">Priority 8:</span> Telemetry Freshness & Completeness (RULE-DATA-008) &rarr; <span className="text-amber-400 font-bold">REVIEW</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-serif italic text-white border-b border-white/10 pb-2">Safety Principles</h3>
          <ul className="text-sm text-gray-400 mt-2 list-none space-y-2">
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>Use synthetic/fictitious prescription data only.</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>No autonomous real-world medical decisions; all outputs serve as a decision checklist.</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>Deterministic explainable rule evaluation; no black-box AI decision maker.</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>Evidence catalog linkage (EVID-001 through EVID-008) for every evaluated decision.</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>Decision Trace waterfall rendered in the UI for complete transparency.</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>Overrides require clinical justification logged to an immutable audit trail.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-serif italic text-white border-b border-white/10 pb-2">Requirements Traceability Matrix</h3>
          <div className="mt-3 bg-[#050505] border border-white/10 rounded-lg overflow-hidden">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest border-b border-white/10">
                <tr>
                  <th className="p-3.5">Requirement</th>
                  <th className="p-3.5">Implementation Module</th>
                  <th className="p-3.5">Test / Benchmark ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5">
                  <td className="p-3.5 text-gray-300">Check patient allergies (Priority 1)</td>
                  <td className="p-3.5 text-emerald-400 font-medium">RULE-ALLERGY-001 (engine.ts)</td>
                  <td className="p-3.5 font-mono text-white text-[10px]">TC-001</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3.5 text-gray-300">Enforce prescriber DAW restrictions (Priority 2)</td>
                  <td className="p-3.5 text-emerald-400 font-medium">RULE-PRESCRIBER-002 (engine.ts)</td>
                  <td className="p-3.5 font-mono text-white text-[10px]">TC-003</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3.5 text-gray-300">Verify therapeutic equivalence group (Priority 3)</td>
                  <td className="p-3.5 text-emerald-400 font-medium">RULE-APPROVAL-003 (engine.ts)</td>
                  <td className="p-3.5 font-mono text-white text-[10px]">TC-007</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3.5 text-gray-300">Route of administration check (Priority 4)</td>
                  <td className="p-3.5 text-emerald-400 font-medium">RULE-ROUTE-004 (engine.ts)</td>
                  <td className="p-3.5 font-mono text-white text-[10px]">TC-006</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3.5 text-gray-300">Check patient physical formulation (Priority 6)</td>
                  <td className="p-3.5 text-emerald-400 font-medium">RULE-PATIENT-006 (engine.ts)</td>
                  <td className="p-3.5 font-mono text-white text-[10px]">TC-005</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3.5 text-gray-300">Verify warehouse stock inventory (Priority 7)</td>
                  <td className="p-3.5 text-emerald-400 font-medium">RULE-STOCK-007 (engine.ts)</td>
                  <td className="p-3.5 font-mono text-white text-[10px]">TC-002</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3.5 text-gray-300">Flag stale telemetry & incomplete data (Priority 8)</td>
                  <td className="p-3.5 text-emerald-400 font-medium">RULE-DATA-008 (engine.ts)</td>
                  <td className="p-3.5 font-mono text-white text-[10px]">TC-008</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3.5 text-gray-300">Scale comparative experiment over 200+ cases</td>
                  <td className="p-3.5 text-emerald-400 font-medium">experimentService.ts (/experiment)</td>
                  <td className="p-3.5 font-mono text-white text-[10px]">EXP-RUNNER</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3.5 text-gray-300">Local persistent data storage layer</td>
                  <td className="p-3.5 text-emerald-400 font-medium">IStorageAdapter (storage/index.ts)</td>
                  <td className="p-3.5 font-mono text-white text-[10px]">STORAGE-PERSIST</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
