import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Activity, LayoutDashboard, FileText, CheckSquare, Settings2, BarChart2, ShieldAlert, List, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pharmacy Substitution Safety Prototype',
  description: 'A rule-based prescription substitution decision checklist and safety dashboard.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-[#050505] text-gray-300 font-sans antialiased overflow-hidden" suppressHydrationWarning>
        <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col hidden md:flex">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-xl font-serif italic text-[#D4AF37] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#D4AF37]" />
              RxSafe Sub
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Prototype Milestone</p>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/prescriptions" className="flex items-center gap-3 px-3 py-2 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              <FileText className="w-4 h-4" /> Prescriptions
            </Link>
            <Link href="/followups" className="flex items-center gap-3 px-3 py-2 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              <CheckSquare className="w-4 h-4" /> Follow-ups
            </Link>
            <Link href="/tests" className="flex items-center gap-3 px-3 py-2 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              <Settings2 className="w-4 h-4" /> Test Harness
            </Link>
            <Link href="/metrics" className="flex items-center gap-3 px-3 py-2 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              <BarChart2 className="w-4 h-4" /> Metrics
            </Link>
            <Link href="/audit" className="flex items-center gap-3 px-3 py-2 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              <Activity className="w-4 h-4" /> Audit Log
            </Link>
            
            <div className="pt-6 pb-2">
              <p className="px-3 text-[10px] uppercase tracking-widest text-gray-500">Documentation</p>
            </div>
            <Link href="/requirements" className="flex items-center gap-3 px-3 py-2 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              <List className="w-4 h-4" /> Requirements
            </Link>
            <Link href="/limitations" className="flex items-center gap-3 px-3 py-2 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              <BookOpen className="w-4 h-4" /> Limitations
            </Link>
          </nav>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b border-white/10 bg-[#0a0a0a]/50 flex items-center justify-between px-8 shrink-0">
            <div className="font-serif italic text-[#D4AF37]">Pharmacy Operations</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1 rounded border border-white/10">
              Synthetic Data Environment
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
