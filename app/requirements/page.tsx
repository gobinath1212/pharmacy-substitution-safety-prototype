export default function RequirementsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-xl font-serif italic text-[#D4AF37]">Requirements Specification</h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Pharmacy Substitution Decision Checklist Prototype - Milestone 1</p>
      </div>

      <div className="bg-[#0f0f0f] p-6 rounded-xl border border-white/10 shadow-2xl space-y-6 max-w-none">
        <div>
          <h3 className="text-lg font-serif italic text-white border-b border-white/10 pb-2">Problem Statement</h3>
          <p className="text-sm text-gray-400 mt-2">
            Pharmacists face cognitive overload when identifying safe substitution alternatives during drug shortages. Manual checks of allergies, prescriber restrictions, and patient constraints are error-prone. This prototype aims to evaluate a deterministic rule engine&apos;s ability to safely filter candidate substitutions.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-serif italic text-white border-b border-white/10 pb-2">Safety Requirements</h3>
          <ul className="text-sm text-gray-400 mt-2 list-none space-y-2">
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>Use synthetic/fictitious prescription data only.</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>No autonomous real-world medical decisions.</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>Use explicit predefined rules (deterministic), not LLM inference.</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>Every recommendation must display the rule/evidence.</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>High-impact actions require explicit human confirmation.</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>Overrides must require a recorded reason.</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>Interface must show uncertainty and potential harm warnings.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-serif italic text-white border-b border-white/10 pb-2">Requirements Traceability</h3>
          <div className="mt-3 bg-[#050505] border border-white/10 rounded-lg overflow-hidden">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest">
                <tr className="border-b border-white/10">
                  <th className="p-4">Requirement</th>
                  <th className="p-4">Implementation</th>
                  <th className="p-4">Test ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-gray-300">Check patient allergies</td>
                  <td className="p-4 text-emerald-500 font-medium">Rules Engine (engine.ts:20)</td>
                  <td className="p-4 font-mono text-white text-[10px]">TC-001</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-gray-300">Verify stock availability</td>
                  <td className="p-4 text-emerald-500 font-medium">Rules Engine (engine.ts:60)</td>
                  <td className="p-4 font-mono text-white text-[10px]">TC-002</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-gray-300">Enforce prescriber restrictions</td>
                  <td className="p-4 text-emerald-500 font-medium">Rules Engine (engine.ts:28)</td>
                  <td className="p-4 font-mono text-white text-[10px]">TC-003</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-gray-300">Maintain valid options list</td>
                  <td className="p-4 text-emerald-500 font-medium">Decision Status logic</td>
                  <td className="p-4 font-mono text-white text-[10px]">TC-004</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-gray-300">Flag patient formulation constraints</td>
                  <td className="p-4 text-emerald-500 font-medium">Rules Engine (engine.ts:50)</td>
                  <td className="p-4 font-mono text-white text-[10px]">TC-005</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-gray-300">Require human confirmation (override)</td>
                  <td className="p-4 text-emerald-500 font-medium">Review Modal (page.tsx:180)</td>
                  <td className="p-4 font-mono text-white text-[10px]">Manual</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
