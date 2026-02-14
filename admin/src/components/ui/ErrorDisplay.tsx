import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({
  message = "Something went wrong while loading the dashboard.",
  onRetry
}: ErrorDisplayProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Unavailable</h2>
      <p className="text-slate-500 max-w-md mb-8">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
