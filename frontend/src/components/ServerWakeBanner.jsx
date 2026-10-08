import React, { useState } from 'react';
import { Loader2, AlertCircle, RefreshCw, Settings2, Check, RotateCcw } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl } from '../api/client.js';

export default function ServerWakeBanner({
  serverStatus,
  retryState,
  onManualRetry,
}) {
  const [showConfig, setShowConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(() => getApiBaseUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (serverStatus === 'online') return null;

  const handleSaveUrl = (e) => {
    e.preventDefault();
    setApiBaseUrl(customUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    onManualRetry();
  };

  const handleResetUrl = () => {
    setApiBaseUrl(null);
    const fallback = getApiBaseUrl();
    setCustomUrl(fallback);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    onManualRetry();
  };

  const currentUrl = getApiBaseUrl();

  return (
    <div className="max-w-6xl mx-auto px-4 mb-6">
      {serverStatus === 'waking' ? (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/90 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex items-center justify-between shadow-sm animate-entrance">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold text-sm">Waking up API server...</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Cloud service spins down on idle. Retrying connection to <span className="font-mono">{currentUrl}</span> (attempt {retryState?.attempt || 1} of {retryState?.maxRetries || 15})...
              </p>
            </div>
          </div>
          <span className="text-xs font-mono bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-800">
            Please wait
          </span>
        </div>
      ) : (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 shadow-sm animate-entrance overflow-hidden">
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-sm">Cannot connect to API backend</p>
                <p className="text-xs text-rose-700 dark:text-rose-300 truncate">
                  Backend at <code className="font-mono bg-rose-100 dark:bg-rose-900/80 px-1 py-0.5 rounded text-[11px] font-bold">{currentUrl}</code> is currently unreachable.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-zinc-800 text-rose-900 dark:text-rose-200 text-xs font-medium transition-colors"
                title="Configure Backend URL"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {showConfig ? 'Hide Settings' : 'Configure API URL'}
              </button>

              <button
                type="button"
                onClick={onManualRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Now
              </button>
            </div>
          </div>

          {showConfig && (
            <div className="border-t border-rose-200/80 dark:border-rose-900/60 bg-white/70 dark:bg-zinc-950/50 p-4 transition-all">
              <form onSubmit={handleSaveUrl} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex-1 min-w-0">
                  <label htmlFor="api-url-input" className="block text-[11px] font-semibold text-[#555] dark:text-gray-400 mb-1">
                    Deployed Backend URL (e.g. Render, Railway, ngrok)
                  </label>
                  <input
                    id="api-url-input"
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://nerd-api.onrender.com"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#2A2B2E] dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto sm:mt-5">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
                  >
                    {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                    Save & Reconnect
                  </button>

                  <button
                    type="button"
                    onClick={handleResetUrl}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs transition-colors"
                    title="Reset to default URL"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
              </form>

              <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                Tip: When hosting the backend on Render, use the generated URL (e.g. <span className="font-mono text-gray-700 dark:text-gray-200">https://your-service.onrender.com</span>). Dashboard benchmark metrics remain visible below even when offline.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
