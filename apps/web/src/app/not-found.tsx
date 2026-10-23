import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-[#0A5C43] font-black text-2xl flex items-center justify-center mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-gray-600 max-w-md mb-6">
        The tournament view, player portal page, or resource you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#0A5C43] hover:bg-[#084734] text-white rounded-xl text-xs font-bold transition shadow-xs"
      >
        Return to Fleet Hub
      </Link>
    </div>
  );
}
