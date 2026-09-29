import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { 
  Activity, 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Settings2, 
  BarChart2, 
  ShieldAlert, 
  List, 
  BookOpen,
  FlaskConical,
  Library
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pharmacy Substitution Safety Prototype',
  description: 'Deterministic rule-based prescription substitution decision checklist and safety dashboard.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-[#050505] text-gray-300 font-sans antialiased overflow-hidden" suppressHydrationWarning>
        <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col hidden md:flex shrink-0">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-xl font-serif italic text-[#D4AF37] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#D4AF37]" />
              RxSafe Sub
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] mt-1 font-bold">100% Final Prototype</p>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 text-sm">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/demo" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#D4AF37] hover:text-white hover:bg-white/5 transition-colors font-medium">
              <ShieldAlert className="w-4 h-4 text-[#D4AF37]" /> Demo Scenarios
            </Link>
            <Link href="/prescriptions" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <FileText className="w-4 h-4" /> Prescriptions
            </Link>
            <Link href="/experiment" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#D4AF37] hover:text-white hover:bg-white/5 transition-colors font-medium">
              <FlaskConical className="w-4 h-4 text-[#D4AF37]" /> Experiment Harness
            </Link>
            <Link href="/followups" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <CheckSquare className="w-4 h-4" /> Follow-up Queue
            </Link>
            <Link href="/evidence" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <Library className="w-4 h-4" /> Evidence Catalog
            </Link>
            <Link href="/metrics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <BarChart2 className="w-4 h-4" /> Safety Metrics
            </Link>
            <Link href="/audit" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <Activity className="w-4 h-4" /> Audit Log
            </Link>

            <div className="pt-4 pb-1">
              <p className="px-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Verification & Quality</p>
            </div>
            <Link href="/quality-gate" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <CheckSquare className="w-4 h-4 text-emerald-400" /> Quality Gate
            </Link>
            <Link href="/tests" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <Settings2 className="w-4 h-4" /> Test Harness
            </Link>
            <Link href="/error-analysis" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <BarChart2 className="w-4 h-4 text-amber-400" /> Error Analysis
            </Link>
            <Link href="/data-quality" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <FileText className="w-4 h-4 text-blue-400" /> Data Quality
            </Link>
            <Link href="/system-health" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <Activity className="w-4 h-4 text-purple-400" /> System Health
            </Link>
            
            <div className="pt-4 pb-1">
              <p className="px-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Documentation</p>
            </div>
            <Link href="/requirements" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <List className="w-4 h-4" /> Requirements
            </Link>
            <Link href="/limitations" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <BookOpen className="w-4 h-4" /> Limitations
            </Link>
          </nav>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b border-white/10 bg-[#0a0a0a]/50 flex items-center justify-between px-8 shrink-0">
            <div className="font-serif italic text-[#D4AF37]">Pharmacy Substitution Safety Research</div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 bg-white/5 px-3 py-1 rounded border border-white/10">
                Persistent Synthetic Storage
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded border border-[#D4AF37]/20 font-bold">
                Deterministic Engine
              </span>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
