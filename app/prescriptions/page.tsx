import Link from 'next/link';
import { PRESCRIPTIONS } from '../../src/data/store';
import { format } from 'date-fns';

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-serif italic text-[#D4AF37]">Synthetic Prescriptions</h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Select a case to evaluate substitution options.</p>
        </div>
        <Link href="/review/RX-DEMO" className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-colors">
          Open Demo Case
        </Link>
      </div>

      <div className="bg-[#0f0f0f] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest">
            <tr className="border-b border-white/10">
              <th scope="col" className="p-4">Prescription ID</th>
              <th scope="col" className="p-4">Date</th>
              <th scope="col" className="p-4">Medication</th>
              <th scope="col" className="p-4">Strength/Route</th>
              <th scope="col" className="p-4">Patient ID</th>
              <th scope="col" className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {PRESCRIPTIONS.slice(0, 15).map((rx) => (
              <tr key={rx.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 whitespace-nowrap text-sm font-mono text-white">{rx.id} {rx.id === 'RX-DEMO' && <span className="ml-2 inline-flex items-center rounded bg-[#D4AF37]/20 px-2 py-0.5 text-[10px] font-bold text-[#D4AF37]">Demo</span>}</td>
                <td className="p-4 whitespace-nowrap text-xs text-gray-500">{format(new Date(rx.date), 'MMM d, yyyy')}</td>
                <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-300">{rx.medicationId}</td>
                <td className="p-4 whitespace-nowrap text-xs text-gray-500">{rx.strength} • {rx.route}</td>
                <td className="p-4 whitespace-nowrap text-xs font-mono text-gray-500">{rx.patientId}</td>
                <td className="p-4 whitespace-nowrap text-right">
                  <Link href={`/review/${rx.id}`} className="text-[#D4AF37] hover:text-white text-[10px] uppercase tracking-widest font-bold transition-colors">Review Case</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-white/10 bg-black/40 text-[10px] uppercase tracking-widest text-gray-600 text-center">
          Showing 15 of {PRESCRIPTIONS.length} synthetic records
        </div>
      </div>
    </div>
  );
}
