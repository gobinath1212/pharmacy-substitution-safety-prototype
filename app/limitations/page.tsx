export default function LimitationsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-xl font-serif italic text-[#D4AF37]">System Limitations</h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Important caveats regarding this prototype environment.</p>
      </div>

      <div className="bg-[#0f0f0f] border border-rose-500/20 p-6 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full"></div>
        <h2 className="text-lg font-serif italic text-rose-500 mb-4 flex items-center gap-2 relative z-10">
          Prototype Warning
        </h2>
        <p className="text-sm text-gray-300 font-medium mb-6 relative z-10">
          This system is a software experiment/prototype. It is not a clinical decision-support system and must not be used for real medication decisions.
        </p>

        <ul className="space-y-3 relative z-10">
          <li className="flex items-start gap-3 bg-white/5 p-4 rounded border border-white/5">
            <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-500 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
            <div>
              <p className="text-sm font-bold text-white mb-1">Synthetic Data Only</p>
              <p className="text-xs text-gray-400">All prescriptions, patients, medications, and allergies are entirely fictitious. No real EHR integration exists.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 bg-white/5 p-4 rounded border border-white/5">
            <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-500 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
            <div>
              <p className="text-sm font-bold text-white mb-1">No Real Pharmacy System Integration</p>
              <p className="text-xs text-gray-400">Stock values and system context are simulated. There is no real-time stock guarantee.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 bg-white/5 p-4 rounded border border-white/5">
            <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-500 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
            <div>
              <p className="text-sm font-bold text-white mb-1">Illustrative Rules</p>
              <p className="text-xs text-gray-400">The clinical substitution rules are illustrative and not based on a validated clinical knowledge base.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 bg-white/5 p-4 rounded border border-white/5">
            <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-500 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
            <div>
              <p className="text-sm font-bold text-white mb-1">Uncalibrated Uncertainty Score</p>
              <p className="text-xs text-gray-400">The uncertainty score is deterministic and synthetic. It does not represent a statistically validated clinical probability.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 bg-white/5 p-4 rounded border border-white/5">
            <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-500 flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
            <div>
              <p className="text-sm font-bold text-white mb-1">Human Review Remains Essential</p>
              <p className="text-xs text-gray-400">The prototype engine handles basic logical constraints but human review remains absolutely essential for high-impact cases.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
