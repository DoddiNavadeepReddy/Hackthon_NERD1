import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ServerWakeBanner({
  serverStatus,
  retryState,
  onManualRetry,
}) {
  if (serverStatus === 'online') return null;

  return (
    <div className="max-w-6xl mx-auto px-4 mb-6">
      {serverStatus === 'waking' ? (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/90 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex items-center justify-between shadow-sm animate-entrance">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold text-sm">Waking up API server...</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Render's free tier spins down after idle. Retrying connection (attempt {retryState?.attempt || 1} of {retryState?.maxRetries || 15})...
              </p>
            </div>
          </div>
          <span className="text-xs font-mono bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-800">
            Please wait
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 flex items-center justify-between shadow-sm animate-entrance">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Cannot connect to API backend</p>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Backend at <code className="font-mono bg-rose-100 dark:bg-rose-900 px-1 rounded">{import.meta.env.VITE_API_URL || 'http://localhost:8000'}</code> is currently unreachable.
              </p>
            </div>
          </div>
          <button
            onClick={onManualRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Now
          </button>
        </div>
      )}
    </div>
  );
}
