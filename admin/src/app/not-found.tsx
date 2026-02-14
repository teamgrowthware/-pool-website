import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 text-center">
      <div className="rounded-full bg-slate-50 p-4">
        <FileQuestion className="h-12 w-12 text-slate-400" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Page Not Found</h2>
        <p className="text-slate-500">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
