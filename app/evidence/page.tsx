"use client";

import { useState } from 'react';
import { SYNTHETIC_EVIDENCE_CATALOG } from '../../src/data/evidenceCatalog';
import { EvidenceCatalogItem } from '../../src/types';
import { BookOpen, ShieldAlert, CheckCircle2, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function EvidenceCatalogPage() {
  const items = Object.values(SYNTHETIC_EVIDENCE_CATALOG);
  const [selectedItem, setSelectedItem] = useState<EvidenceCatalogItem | null>(null);
  const [search, setSearch] = useState("");

  const filteredItems = items.filter(item =>
    item.evidenceId.toLowerCase().includes(search.toLowerCase()) ||
    item.ruleId.toLowerCase().includes(search.toLowerCase()) ||
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.sourceType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-[#D4AF37]">Synthetic Evidence Catalog</h1>
          <p className="text-xs text-gray-400 mt-1">
            Standardized references and clinical rationales backing the 8-priority substitution rules engine.
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1.5 rounded border border-[#D4AF37]/20 font-bold">
          Synthetic Experimental Standards
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-xs text-amber-200/90 leading-relaxed">
          <span className="font-semibold text-amber-400">Notice: </span>
          Synthetic experimental rule reference — not a clinical practice guideline. References are modeled for academic safety evaluation and decision explainability.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by Evidence ID, Rule ID, or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#0f0f0f] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
        />
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {filteredItems.length} references
        </span>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.evidenceId}
            onClick={() => setSelectedItem(item)}
            className="bg-[#0f0f0f] border border-white/10 hover:border-[#D4AF37]/50 rounded-xl p-5 shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono text-[#D4AF37] border border-white/10 font-bold">
                  {item.evidenceId}
                </span>
                <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono text-gray-400 border border-white/5">
                  {item.ruleId}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                {item.title}
              </h3>

              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-mono">
                {item.sourceType} · v{item.version}
              </p>

              <p className="text-xs text-gray-300 mt-3 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#D4AF37] font-semibold">
              <span className="text-[10px] text-gray-500 uppercase font-mono">Ref: {item.syntheticReference}</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[11px]">
                Inspect Evidence <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Evidence Details Modal */}
      <Dialog.Root open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 shadow-2xl z-50 animate-in zoom-in-95 duration-200">
            {selectedItem && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded font-mono text-xs font-bold border border-[#D4AF37]/30">
                      {selectedItem.evidenceId}
                    </span>
                    <span className="px-2.5 py-1 bg-white/5 text-gray-300 rounded font-mono text-xs border border-white/10">
                      {selectedItem.ruleId}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {selectedItem.status}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-serif italic text-white">{selectedItem.title}</h2>
                  <p className="text-xs text-gray-400 mt-1">{selectedItem.sourceType}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Rule Description & Scope</p>
                  <p className="text-xs text-gray-200 leading-relaxed">{selectedItem.description}</p>
                </div>

                <div className="bg-[#D4AF37]/5 rounded-xl p-4 border border-[#D4AF37]/20 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">Clinical & Safety Rationale</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{selectedItem.clinicalRationale}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-[10px] uppercase text-gray-500">Version</p>
                    <p className="font-mono text-white mt-1">v{selectedItem.version}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-[10px] uppercase text-gray-500">Effective Date</p>
                    <p className="font-mono text-white mt-1">{selectedItem.effectiveDate}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-[10px] uppercase text-gray-500">Synthetic Reference</p>
                    <p className="font-mono text-[#D4AF37] mt-1 truncate" title={selectedItem.syntheticReference}>
                      {selectedItem.syntheticReference}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Close Reference
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
