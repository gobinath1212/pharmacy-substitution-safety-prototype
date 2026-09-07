import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-4xl font-bold text-[#D4AF37] mb-4">404 - Not Found</h2>
      <p className="text-gray-400 mb-8">The page you are looking for does not exist.</p>
      <Link href="/" className="px-4 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors">
        Return Home
      </Link>
    </div>
  );
}
