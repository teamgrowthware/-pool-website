'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 text-center">
      <div className="rounded-full bg-red-50 p-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Something went wrong!</h2>
        <p className="text-slate-500">
          We encountered an unexpected error. Our team has been notified.
        </p>
        <div className="mt-4 rounded-lg bg-slate-100 p-3 text-left">
          <code className="text-xs text-slate-600 font-mono break-all">
            {error.message || 'Unknown error occurred'}
          </code>
        </div>
      </div>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        <RefreshCcw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
