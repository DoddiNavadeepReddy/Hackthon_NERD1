import React from 'react';
import { Activity, AlertTriangle, BarChart3, Database, RefreshCw, ShieldCheck } from 'lucide-react';
import { CLASS_COLORS, CLASS_DISPLAY_ORDER, getMetrics, getModelInfo, getSamples } from '../api/client.js';

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-5 shadow-[0_10px_30px_rgba(42,43,46,0.05)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-wider text-[#6B6D70] dark:text-gray-400">{label}</span>
        <Icon className="w-4 h-4 text-[#6B6D70] dark:text-gray-400" />
      </div>
      <p className="text-2xl font-bold text-[#2A2B2E] dark:text-white">{value}</p>
      {detail && <p className="text-xs text-[#6B6D70] dark:text-gray-400 mt-1">{detail}</p>}
    </div>
  );
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

export default function Dashboard({ onRetry }) {
  const [modelInfo, setModelInfo] = React.useState(null);
  const [metrics, setMetrics] = React.useState(null);
  const [sample, setSample] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadDashboard = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [info, exportedMetrics, samples] = await Promise.all([
        getModelInfo(),
        getMetrics(),
        getSamples('normal', 1),
      ]);
      setModelInfo(info);
      setMetrics(exportedMetrics);
      setSample(samples.items?.[0] || null);
    } catch (err) {
      setError(err.message || 'Unable to load exported backend details.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <section className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-10 text-center shadow-[0_10px_30px_rgba(42,43,46,0.05)]">
        <RefreshCw className="w-6 h-6 mx-auto mb-3 animate-spin text-[#6B6D70]" />
        <p className="text-sm text-[#6B6D70] dark:text-gray-300">Loading exported model details...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white dark:bg-[#202226] border border-rose-200 dark:border-rose-900 rounded-2xl p-8 shadow-[0_10px_30px_rgba(42,43,46,0.05)]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5" />
          <div>
            <h1 className="font-bold text-lg text-[#2A2B2E] dark:text-white">Backend details unavailable</h1>
            <p className="text-sm text-[#6B6D70] dark:text-gray-300 mt-1">{error}</p>
            <button onClick={() => { loadDashboard(); onRetry?.(); }} className="mt-4 px-4 py-2 rounded-lg bg-[#2A2B2E] text-white text-sm">
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const finalMetrics = metrics?.final_model?.metrics || {};
  const testPlus = finalMetrics['KDDTest+'] || {};
  const testHard = finalMetrics['KDDTest-21'] || {};
  const cvScore = modelInfo?.cv?.mean_macro_f1;
  const thresholds = metrics?.thresholds?.test_results || [];

  return (
    <div className="space-y-6 animate-entrance">
      <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#6B6D70] dark:text-gray-400 mb-2">Exported evaluation</p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-[#2A2B2E] dark:text-white">Detection overview</h1>
          <p className="text-sm text-[#6B6D70] dark:text-gray-300 mt-2">
            Real results from {modelInfo?.training_set || 'the NSL-KDD training set'}.
          </p>
        </div>
        <button onClick={loadDashboard} className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#DADBD6] dark:border-[#3B3E45] bg-white dark:bg-[#202226] text-sm text-[#2A2B2E] dark:text-white">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Selected model" value={modelInfo?.model_name || 'XGBoost'} detail="5-class classifier" icon={ShieldCheck} />
        <MetricCard label="CV macro F1" value={formatPercent(cvScore)} detail={`± ${formatPercent(modelInfo?.cv?.std_macro_f1)}`} icon={BarChart3} />
        <MetricCard label="KDDTest+ accuracy" value={formatPercent(testPlus.accuracy)} detail={`Macro F1 ${formatPercent(testPlus.macro_f1)}`} icon={Activity} />
        <MetricCard label="KDDTest-21 accuracy" value={formatPercent(testHard.accuracy)} detail={`Macro F1 ${formatPercent(testHard.macro_f1)}`} icon={Database} />
      </section>
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        CV measures performance on training-like data. Test scores are lower because test sets contain unseen attack variants.
      </div>

      <section className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-5 shadow-[0_10px_30px_rgba(42,43,46,0.05)] overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg text-[#2A2B2E] dark:text-white">Per-class performance</h2>
            <p className="text-xs text-[#6B6D70] dark:text-gray-400">Recall and F1 from the saved final model</p>
          </div>
          <span className="text-xs font-mono text-[#6B6D70] dark:text-gray-400">KDDTest+ / KDDTest-21</span>
        </div>
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-[#6B6D70] dark:text-gray-400 border-b border-[#EDEEEA] dark:border-[#2E3036]">
              <th className="pb-3">Class</th><th className="pb-3">Test+ recall</th><th className="pb-3">Test+ F1</th><th className="pb-3">Test-21 recall</th><th className="pb-3">Test-21 F1</th>
            </tr>
          </thead>
          <tbody>
            {CLASS_DISPLAY_ORDER.map((category) => {
              const plus = testPlus.per_class?.[category] || {};
              const hard = testHard.per_class?.[category] || {};
              return (
                <tr key={category} className="border-b last:border-0 border-[#EDEEEA] dark:border-[#2E3036]">
                  <td className="py-3 font-semibold" style={{ color: CLASS_COLORS[category] }}>{category}</td>
                  <td className="py-3 text-[#2A2B2E] dark:text-gray-200">
                    <div className="flex items-center gap-3">
                      <span className={Number(plus.recall || 0) < 0.2 ? 'font-semibold text-rose-600 dark:text-rose-400' : ''}>{formatPercent(plus.recall)}</span>
                      <span className="h-2 w-24 rounded-full bg-[#EDEEEA] dark:bg-[#3B3E45]">
                        <span
                          className={`block h-2 rounded-full ${Number(plus.recall || 0) < 0.2 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.max(0, Math.min(100, Number(plus.recall || 0) * 100))}%` }}
                        />
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-[#2A2B2E] dark:text-gray-200">{formatPercent(plus.f1)}</td>
                  <td className="py-3 text-[#2A2B2E] dark:text-gray-200">
                    <div className="flex items-center gap-3">
                      <span className={Number(hard.recall || 0) < 0.2 ? 'font-semibold text-rose-600 dark:text-rose-400' : ''}>{formatPercent(hard.recall)}</span>
                      <span className="h-2 w-24 rounded-full bg-[#EDEEEA] dark:bg-[#3B3E45]">
                        <span
                          className={`block h-2 rounded-full ${Number(hard.recall || 0) < 0.2 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.max(0, Math.min(100, Number(hard.recall || 0) * 100))}%` }}
                        />
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-[#2A2B2E] dark:text-gray-200">{formatPercent(hard.f1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-5 shadow-[0_10px_30px_rgba(42,43,46,0.05)]">
          <h2 className="font-bold text-lg text-[#2A2B2E] dark:text-white">Threshold tuning</h2>
          <p className="text-xs text-[#6B6D70] dark:text-gray-400 mt-1">R2L × {modelInfo?.threshold_factors?.R2L}, U2R × {modelInfo?.threshold_factors?.U2R}</p>
          <div className="mt-4 space-y-3">
            {thresholds.filter((row) => row.test_set === 'KDDTest+' && ['R2L', 'U2R'].includes(row.class)).map((row) => (
              <div key={`${row.class}-${row.state}`} className="flex items-center justify-between text-sm">
                <span className="font-semibold" style={{ color: CLASS_COLORS[row.class] }}>{row.class} {row.state}</span>
                <span className="text-[#6B6D70] dark:text-gray-300">Recall {formatPercent(row.recall)} · Precision {formatPercent(row.precision)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-5 shadow-[0_10px_30px_rgba(42,43,46,0.05)]">
          <h2 className="font-bold text-lg text-[#2A2B2E] dark:text-white">Raw sample preview</h2>
          <p className="text-xs text-[#6B6D70] dark:text-gray-400 mt-1">One real row from the exported KDDTest+ sample set</p>
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-[#F6F5F1] dark:bg-[#161719] p-3 text-xs text-[#2A2B2E] dark:text-gray-300">{JSON.stringify(sample, null, 2)}</pre>
        </div>
      </section>
    </div>
  );
}
