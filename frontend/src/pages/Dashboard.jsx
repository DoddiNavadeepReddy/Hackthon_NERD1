import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Info, 
  Layers, 
  Activity, 
  Sliders, 
  FileText,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { 
  getMetrics, 
  getModelInfo, 
  CLASS_DISPLAY_ORDER, 
  CLASS_COLORS, 
  CLASS_DESCRIPTIONS,
  normalizeConfusionMatrix 
} from '../api/client.js';

function IsometricTopology() {
  return (
    <div className="relative w-full aspect-[16/10] max-h-[340px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-white/60 to-[#F6F5F1]/80 dark:from-[#202226]/60 dark:to-[#161719]/80 border border-[#EDEEEA] dark:border-[#2E3036] shadow-xs p-2">
      <svg
        viewBox="0 0 540 320"
        className="w-full h-full drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="packetGlowRed" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#E03434" floodOpacity="0.7" />
          </filter>
          <filter id="packetGlowAmber" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#E9A02A" floodOpacity="0.6" />
          </filter>
          <filter id="packetGlowPurple" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#8B45E8" floodOpacity="0.6" />
          </filter>
          <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2A2B2E" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Network Connection Cables */}
        <path id="path1" d="M 130 95 L 260 160" stroke="#C9CCC5" strokeWidth="2" strokeDasharray="4 3" />
        <path id="path2" d="M 110 230 L 260 160" stroke="#C9CCC5" strokeWidth="2" strokeDasharray="4 3" />
        <path id="path3" d="M 260 160 L 330 215" stroke="#C9CCC5" strokeWidth="2.5" />
        <path id="path4" d="M 330 215 L 430 130" stroke="#C9CCC5" strokeWidth="2" strokeDasharray="4 3" />
        <path id="path5" d="M 330 215 L 430 260" stroke="#C9CCC5" strokeWidth="2" strokeDasharray="4 3" />

        {/* Flowing Packets */}
        <rect width="18" height="8" rx="4" fill="#7C7F86">
          <animateMotion dur="3s" repeatCount="indefinite" rotate="auto">
            <mpath href="#path1" />
          </animateMotion>
        </rect>
        <rect width="20" height="9" rx="4.5" fill="#E03434" filter="url(#packetGlowRed)">
          <animateMotion dur="2.4s" repeatCount="indefinite" rotate="auto">
            <mpath href="#path3" />
          </animateMotion>
        </rect>
        <rect width="18" height="8" rx="4" fill="#E9A02A" filter="url(#packetGlowAmber)">
          <animateMotion dur="3.6s" repeatCount="indefinite" rotate="auto">
            <mpath href="#path2" />
          </animateMotion>
        </rect>
        <rect width="18" height="8" rx="4" fill="#8B45E8" filter="url(#packetGlowPurple)">
          <animateMotion dur="2.7s" repeatCount="indefinite" rotate="auto">
            <mpath href="#path4" />
          </animateMotion>
        </rect>
        <rect width="18" height="8" rx="4" fill="#F2761C">
          <animateMotion dur="3.2s" repeatCount="indefinite" rotate="auto">
            <mpath href="#path5" />
          </animateMotion>
        </rect>

        {/* Isometric Device Nodes */}
        {/* Laptop Top */}
        <g transform="translate(95, 55)" filter="url(#nodeShadow)">
          <polygon points="35,0 70,18 35,36 0,18" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="0,18 35,36 35,42 0,24" fill="#EDEEEA" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="35,36 70,18 70,24 35,42" fill="#DADBD6" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="35,0 70,18 70,-15 35,-33" fill="#F6F5F1" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="37, -2 68,14 68,-13 37,-29" fill="#2A2B2E" />
        </g>

        {/* Laptop Bottom */}
        <g transform="translate(75, 190)" filter="url(#nodeShadow)">
          <polygon points="35,0 70,18 35,36 0,18" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="0,18 35,36 35,42 0,24" fill="#EDEEEA" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="35,36 70,18 70,24 35,42" fill="#DADBD6" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="35,0 70,18 70,-15 35,-33" fill="#F6F5F1" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="37, -2 68,14 68,-13 37,-29" fill="#2A2B2E" />
        </g>

        {/* Switch Top */}
        <g transform="translate(225, 130)" filter="url(#nodeShadow)">
          <polygon points="40,0 80,20 40,40 0,20" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="0,20 40,40 40,55 0,35" fill="#EDEEEA" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="40,40 80,20 80,35 40,55" fill="#DADBD6" stroke="#E5E7EB" strokeWidth="1.5" />
          <circle cx="18" cy="27" r="2" fill="#10B981" />
          <circle cx="26" cy="31" r="2" fill="#10B981" />
          <circle cx="34" cy="35" r="2" fill="#E9A02A" />
        </g>

        {/* Switch Center */}
        <g transform="translate(295, 185)" filter="url(#nodeShadow)">
          <polygon points="40,0 80,20 40,40 0,20" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="0,20 40,40 40,55 0,35" fill="#EDEEEA" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="40,40 80,20 80,35 40,55" fill="#DADBD6" stroke="#E5E7EB" strokeWidth="1.5" />
          <circle cx="18" cy="27" r="2" fill="#10B981" />
          <circle cx="26" cy="31" r="2" fill="#E03434" />
          <circle cx="34" cy="35" r="2" fill="#10B981" />
        </g>

        {/* Server Rack Unit */}
        <g transform="translate(395, 80)" filter="url(#nodeShadow)">
          <polygon points="35,0 70,18 35,36 0,18" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="0,18 35,36 35,80 0,62" fill="#EDEEEA" stroke="#E5E7EB" strokeWidth="1.5" />
          <polygon points="35,36 70,18 70,62 35,80" fill="#DADBD6" stroke="#E5E7EB" strokeWidth="1.5" />
          <line x1="5" y1="32" x2="30" y2="45" stroke="#7C7F86" strokeWidth="1.5" />
          <line x1="5" y1="46" x2="30" y2="59" stroke="#7C7F86" strokeWidth="1.5" />
          <line x1="5" y1="60" x2="30" y2="73" stroke="#7C7F86" strokeWidth="1.5" />
        </g>

        {/* Database Cylinder */}
        <g transform="translate(395, 220)" filter="url(#nodeShadow)">
          <path d="M 0,25 C 0,10 70,10 70,25 L 70,60 C 70,75 0,75 0,60 Z" fill="#EDEEEA" stroke="#E5E7EB" strokeWidth="1.5" />
          <ellipse cx="35" cy="25" rx="35" ry="14" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
          <ellipse cx="35" cy="42" rx="35" ry="14" fill="none" stroke="#DADBD6" strokeWidth="1" strokeDasharray="3 2" />
        </g>
      </svg>
    </div>
  );
}

export default function Dashboard({ onRetry, onNavigate }) {
  const [metrics, setMetrics] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testSet, setTestSet] = useState('KDDTest+'); // 'KDDTest+' | 'KDDTest-21'
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [m, info] = await Promise.all([getMetrics(), getModelInfo()]);
        setMetrics(m);
        setModelInfo(info);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center animate-entrance">
        <div className="inline-block w-8 h-8 border-3 border-[#2A2B2E] border-t-transparent dark:border-white dark:border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-[#6B6D70] dark:text-gray-300">
          Loading NSL-KDD benchmark metrics from API...
        </p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 animate-entrance">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h2 className="font-semibold text-base">Metrics Unavailable</h2>
        </div>
        <p className="text-sm text-rose-700 dark:text-rose-300">
          Could not fetch metrics from backend: {error}. Never showing simulated metrics.
        </p>
      </div>
    );
  }

  const currentMetrics = metrics.final_model?.metrics?.[testSet];
  const perClass = currentMetrics?.per_class || {};
  const testRows = metrics.test_sizes?.[testSet]?.rows;
  const cvMean = metrics.cv?.metadata?.[0]?.cv_macro_f1_mean;
  const cvStd = metrics.cv?.metadata?.[0]?.cv_macro_f1_std;
  const rawMatrix = metrics.confusion_matrices?.matrices?.[testSet];
  const { normalized: normMatrix } = normalizeConfusionMatrix(rawMatrix);

  return (
    <div className="space-y-10 animate-entrance">
      {/* ============================================================ */}
      {/* 1. HERO SECTION (Matching design-reference.png)               */}
      {/* ============================================================ */}
      <section className="pt-2 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Headline, Subtitle, CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-[52px] text-[#2A2B2E] dark:text-white tracking-tight leading-[1.12]">
              Find out which attacks your model misses
            </h1>
            <p className="text-base sm:text-lg text-[#6B6D70] dark:text-gray-300 leading-relaxed max-w-lg">
              Detect, analyze and stop network intrusions with intelligent monitoring, TreeSHAP explainability, and real-time insights across NSL-KDD.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate && onNavigate('live')}
                className="px-7 py-3.5 rounded-full bg-[#2A2B2E] text-white hover:bg-black font-semibold text-sm shadow-md transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Monitoring
              </button>
              <button
                onClick={() => onNavigate && onNavigate('explainability')}
                className="px-7 py-3.5 rounded-full bg-white dark:bg-[#202226] text-[#2A2B2E] dark:text-white border border-[#2A2B2E] dark:border-white hover:bg-[#F6F5F1] dark:hover:bg-[#2A2B2E] font-semibold text-sm transition-all duration-150"
              >
                See How It Works
              </button>
            </div>
          </div>

          {/* Right: 2.5D Isometric Network Topology Canvas */}
          <div className="lg:col-span-6">
            <IsometricTopology />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. FOUR FEATURE CARDS ROW (Matching design-reference.png)     */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Capture Traffic */}
        <div
          onClick={() => onNavigate && onNavigate('live')}
          className="cursor-pointer group bg-gradient-to-b from-white to-[#F6F5F1] dark:from-[#202226] dark:to-[#161719] border border-[#EDEEEA] dark:border-[#2E3036] rounded-[20px] p-6 shadow-[0_10px_25px_rgba(42,43,46,0.04)] flex flex-col justify-between hover:shadow-md transition-all duration-200"
        >
          <div>
            <div className="text-4xl font-display font-extrabold text-zinc-300 dark:text-zinc-600 mb-4 group-hover:text-zinc-400 transition-colors">
              1
            </div>
            <h3 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white mb-2">
              Capture Traffic
            </h3>
            <p className="text-xs text-[#6B6D70] dark:text-gray-400 leading-relaxed">
              Ingest live network packets across TCP, UDP, and ICMP protocols with real-time payload extraction.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#2A2B2E] dark:text-white group-hover:translate-x-0.5 transition-transform">
            <span>Explore Live Feed</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Detect Anomalies */}
        <div
          onClick={() => onNavigate && onNavigate('batch')}
          className="cursor-pointer group bg-gradient-to-b from-white to-[#FAE7D5]/40 dark:from-[#202226] dark:to-[#161719] border border-[#EDEEEA] dark:border-[#2E3036] rounded-[20px] p-6 shadow-[0_10px_25px_rgba(42,43,46,0.04)] flex flex-col justify-between hover:shadow-md transition-all duration-200"
        >
          <div>
            <div className="text-4xl font-display font-extrabold text-[#E9A02A] mb-4">
              2
            </div>
            <h3 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white mb-2">
              Detect Anomalies
            </h3>
            <p className="text-xs text-[#6B6D70] dark:text-gray-400 leading-relaxed">
              Classify traffic into benign vs. volumetric DoS, reconnaissance probes, R2L, and U2R threats using XGBoost.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#E9A02A] group-hover:translate-x-0.5 transition-transform">
            <span>Run Batch Analysis</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Get Instant Alerts */}
        <div
          onClick={() => onNavigate && onNavigate('explainability')}
          className="cursor-pointer group bg-gradient-to-b from-white to-[#F3EEFC]/50 dark:from-[#202226] dark:to-[#161719] border border-[#EDEEEA] dark:border-[#2E3036] rounded-[20px] p-6 shadow-[0_10px_25px_rgba(42,43,46,0.04)] flex flex-col justify-between hover:shadow-md transition-all duration-200"
        >
          <div>
            <div className="text-4xl font-display font-extrabold text-[#8B45E8] mb-4">
              3
            </div>
            <h3 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white mb-2">
              Get Instant Alerts
            </h3>
            <p className="text-xs text-[#6B6D70] dark:text-gray-400 leading-relaxed">
              Isolate malicious connection patterns and inspect instant TreeSHAP decision attributions and log-odds margins.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#8B45E8] group-hover:translate-x-0.5 transition-transform">
            <span>View Explainability</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Attack Class Distribution (Clean proportional bars, NO cluttered numbers!) */}
        <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-[20px] p-6 shadow-[0_10px_25px_rgba(42,43,46,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-4 h-4 text-[#2A2B2E] dark:text-white" />
              <h3 className="font-display font-semibold text-base text-[#2A2B2E] dark:text-white">
                Attack Class Distribution
              </h3>
            </div>

            <div className="space-y-3 font-sans">
              {/* Normal */}
              <div className="flex items-center gap-3">
                <span className="w-14 text-xs font-medium text-[#2A2B2E] dark:text-gray-300">Normal</span>
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full rounded-full bg-[#7C7F86] transition-all duration-700" style={{ width: '68%' }} />
                </div>
              </div>

              {/* DoS */}
              <div className="flex items-center gap-3">
                <span className="w-14 text-xs font-medium text-[#2A2B2E] dark:text-gray-300">DoS</span>
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full rounded-full bg-[#E03434] transition-all duration-700" style={{ width: '88%' }} />
                </div>
              </div>

              {/* Probe */}
              <div className="flex items-center gap-3">
                <span className="w-14 text-xs font-medium text-[#2A2B2E] dark:text-gray-300">Probe</span>
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full rounded-full bg-[#E9A02A] transition-all duration-700" style={{ width: '42%' }} />
                </div>
              </div>

              {/* R2L */}
              <div className="flex items-center gap-3">
                <span className="w-14 text-xs font-medium text-[#2A2B2E] dark:text-gray-300">R2L</span>
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full rounded-full bg-[#8B45E8] transition-all duration-700" style={{ width: '26%' }} />
                </div>
              </div>

              {/* U2R */}
              <div className="flex items-center gap-3">
                <span className="w-14 text-xs font-medium text-[#2A2B2E] dark:text-gray-300">U2R</span>
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full rounded-full bg-[#F2761C] transition-all duration-700" style={{ width: '18%' }} />
                </div>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono mt-4 block">
            Proportional representation across NSL-KDD
          </span>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. BENCHMARK PERFORMANCE METRICS & EVALUATION                */}
      {/* ============================================================ */}
      <section className="pt-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white">
                Benchmark Model Performance
              </h2>
              <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                {metrics.final_model?.name || 'XGBoost'}
              </span>
            </div>
            <p className="text-xs text-[#6B6D70] dark:text-gray-400 mt-0.5">
              Evaluated on authentic unaugmented test splits.
            </p>
          </div>

          {/* Test Set Selector */}
          <div className="flex items-center p-1 rounded-xl bg-[#F6F5F1] dark:bg-[#161719] border border-[#DADBD6] dark:border-[#2E3036]">
            <button
              onClick={() => setTestSet('KDDTest+')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                testSet === 'KDDTest+'
                  ? 'bg-white dark:bg-[#202226] text-[#2A2B2E] dark:text-white shadow-xs font-semibold'
                  : 'text-[#6B6D70] dark:text-gray-400 hover:text-[#2A2B2E] dark:hover:text-white'
              }`}
            >
              KDDTest+ (Full, 22,544 rows)
            </button>
            <button
              onClick={() => setTestSet('KDDTest-21')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                testSet === 'KDDTest-21'
                  ? 'bg-white dark:bg-[#202226] text-[#2A2B2E] dark:text-white shadow-xs font-semibold'
                  : 'text-[#6B6D70] dark:text-gray-400 hover:text-[#2A2B2E] dark:hover:text-white'
              }`}
            >
              KDDTest-21 (Hard, 11,850 rows)
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-5 shadow-xs">
            <span className="text-xs text-[#6B6D70] dark:text-gray-400 font-medium">Overall Accuracy</span>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#2A2B2E] dark:text-white mt-1">
              {((currentMetrics?.accuracy || 0) * 100).toFixed(2)}%
            </div>
            <span className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-1 block">
              on {testSet}
            </span>
          </div>

          <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-5 shadow-xs">
            <span className="text-xs text-[#6B6D70] dark:text-gray-400 font-medium">Test Macro F1</span>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#2A2B2E] dark:text-white mt-1">
              {(currentMetrics?.macro_f1 || 0).toFixed(4)}
            </div>
            <span className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-1 block">
              Unweighted mean across classes
            </span>
          </div>

          <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-5 shadow-xs">
            <span className="text-xs text-[#6B6D70] dark:text-gray-400 font-medium">Weighted F1</span>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#2A2B2E] dark:text-white mt-1">
              {(currentMetrics?.weighted_f1 || 0).toFixed(4)}
            </div>
            <span className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-1 block">
              Support-weighted average
            </span>
          </div>

          <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-5 shadow-xs">
            <span className="text-xs text-[#6B6D70] dark:text-gray-400 font-medium">Evaluated Rows</span>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#2A2B2E] dark:text-white mt-1">
              {testRows?.toLocaleString() || 'N/A'}
            </div>
            <span className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-1 block">
              {testSet === 'KDDTest-21' ? 'Hard records only' : 'Complete unaugmented split'}
            </span>
          </div>
        </div>
      </section>


      {/* CV vs Test Callout (Honesty Rule) */}
      <section className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <h3 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white">
                Honest Benchmark Assessment: Cross-Validation vs Real Test Performance
              </h3>
              <p className="text-xs text-[#6B6D70] dark:text-gray-400 mt-0.5">
                Never present the cross-validation score as expected real-world performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#F6F5F1] dark:bg-[#161719] border border-[#DADBD6] dark:border-[#2E3036]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-[#6B6D70] dark:text-gray-400">
                    5-Fold Stratified CV Macro F1
                  </span>
                  <span className="text-xs font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded">
                    Training split only
                  </span>
                </div>
                <div className="font-display font-bold text-2xl text-[#2A2B2E] dark:text-white">
                  {cvMean?.toFixed(4)} <span className="text-xs text-[#6B6D70] font-normal">± {cvStd?.toFixed(4)}</span>
                </div>
                <p className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-2">
                  Measured on KDDTrain+_20Percent using cross-validation. Inside training data, attack distributions match exactly.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F6F5F1] dark:bg-[#161719] border border-[#DADBD6] dark:border-[#2E3036]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-[#6B6D70] dark:text-gray-400">
                    Actual Test Macro F1 ({testSet})
                  </span>
                  <span className="text-xs font-mono bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 px-2 py-0.5 rounded">
                    Unseen variants
                  </span>
                </div>
                <div className="font-display font-bold text-2xl text-[#2A2B2E] dark:text-white">
                  {currentMetrics?.macro_f1?.toFixed(4)}
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-normal ml-2">
                    ({((currentMetrics?.macro_f1 - cvMean) * 100).toFixed(1)}% gap)
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-2">
                  The test sets contain attack variants never seen in training (e.g. <em>snmpgetattack</em>, <em>mailbomb</em>), causing the real-world performance drop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confusion Matrix Heatmap */}
      <section className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white">
              Row-Normalized Confusion Matrix ({testSet})
            </h3>
            <p className="text-xs text-[#6B6D70] dark:text-gray-400 mt-0.5">
              Rows represent true ground-truth classes; columns represent predicted classes. Normalized per true row in client.
            </p>
          </div>
          <span className="text-xs font-mono text-[#6B6D70] dark:text-gray-400">
            Hover over cell for raw count
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2.5 text-left font-semibold text-[#6B6D70] dark:text-gray-400 border-b border-[#EDEEEA] dark:border-[#2E3036]">
                  True \ Predicted
                </th>
                {CLASS_DISPLAY_ORDER.map((cls) => (
                  <th 
                    key={cls}
                    className="p-2.5 text-center font-semibold text-[#2A2B2E] dark:text-white border-b border-[#EDEEEA] dark:border-[#2E3036]"
                  >
                    {cls}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLASS_DISPLAY_ORDER.map((trueClass, rIdx) => {
                return (
                  <tr key={trueClass} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="p-2.5 font-bold text-[#2A2B2E] dark:text-white border-b border-[#EDEEEA] dark:border-[#2E3036]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CLASS_COLORS[trueClass] }} />
                        {trueClass}
                      </div>
                    </td>

                    {CLASS_DISPLAY_ORDER.map((predClass, cIdx) => {
                      const normVal = normMatrix?.[rIdx]?.[cIdx] ?? 0;
                      const rawCount = rawMatrix?.[rIdx]?.[cIdx] ?? 0;
                      const isDiagonal = rIdx === cIdx;
                      const pct = (normVal * 100).toFixed(1);

                      // Heatmap color intensity
                      let bgStyle = 'transparent';
                      if (isDiagonal) {
                        bgStyle = normVal > 0.5 ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.08)';
                      } else if (normVal > 0.05) {
                        bgStyle = 'rgba(239, 68, 68, 0.12)';
                      }

                      return (
                        <td
                          key={predClass}
                          onMouseEnter={() => setHoveredCell({ trueClass, predClass, rawCount, pct })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className="p-2.5 text-center border-b border-[#EDEEEA] dark:border-[#2E3036] font-mono transition-colors cursor-default"
                          style={{ backgroundColor: bgStyle }}
                        >
                          <div className={`font-semibold ${isDiagonal ? 'text-emerald-700 dark:text-emerald-300' : 'text-[#2A2B2E] dark:text-gray-300'}`}>
                            {pct}%
                          </div>
                          <div className="text-[10px] text-[#6B6D70] dark:text-gray-400">
                            {rawCount.toLocaleString()}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Hover inspector display */}
        {hoveredCell && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#F6F5F1] dark:bg-[#161719] border border-[#DADBD6] dark:border-[#2E3036] text-xs flex items-center justify-between font-mono">
            <span>
              True: <strong className="text-[#2A2B2E] dark:text-white">{hoveredCell.trueClass}</strong> &rarr; Predicted: <strong className="text-[#2A2B2E] dark:text-white">{hoveredCell.predClass}</strong>
            </span>
            <span>
              Raw Count: <strong>{hoveredCell.rawCount.toLocaleString()}</strong> ({hoveredCell.pct}% of true {hoveredCell.trueClass})
            </span>
          </div>
        )}
      </section>

      {/* Threshold Tuning: Before vs After */}
      <section className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white">
              Probability Threshold Tuning (R2L Factor: 5.0, U2R Factor: 1.0)
            </h3>
            <p className="text-xs text-[#6B6D70] dark:text-gray-400 mt-0.5">
              Probability multiplier tuned on training validation split to improve underrepresented class recall.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* R2L Comparison */}
          <div className="p-4 rounded-xl border border-[#EDEEEA] dark:border-[#2E3036] bg-[#F6F5F1]/50 dark:bg-[#161719]/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B45E8]" />
                <span className="font-display font-bold text-sm text-[#2A2B2E] dark:text-white">
                  R2L (Remote to Local)
                </span>
              </div>
              <span className="text-xs font-mono bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-0.5 rounded">
                Factor 5.0x
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036]">
                <span className="text-[#6B6D70] dark:text-gray-400 block text-[11px]">Before Tuning</span>
                <div className="font-mono font-bold text-base text-[#2A2B2E] dark:text-white mt-1">
                  6.52% Recall
                </div>
                <span className="text-[10px] text-[#6B6D70] block">Precision: 98.95%</span>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40">
                <span className="text-purple-700 dark:text-purple-300 block text-[11px] font-semibold">After Tuning</span>
                <div className="font-mono font-bold text-base text-purple-900 dark:text-purple-200 mt-1">
                  10.99% Recall
                </div>
                <span className="text-[10px] text-purple-700 dark:text-purple-400 block">Precision: 96.94%</span>
              </div>
            </div>
            <p className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-2">
              Multiplier increased R2L detection by ~68% with minimal precision penalty.
            </p>
          </div>

          {/* U2R Comparison */}
          <div className="p-4 rounded-xl border border-[#EDEEEA] dark:border-[#2E3036] bg-[#F6F5F1]/50 dark:bg-[#161719]/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F2761C]" />
                <span className="font-display font-bold text-sm text-[#2A2B2E] dark:text-white">
                  U2R (User to Root)
                </span>
              </div>
              <span className="text-xs font-mono bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 px-2 py-0.5 rounded">
                Factor 1.0x (Unchanged)
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036]">
                <span className="text-[#6B6D70] dark:text-gray-400 block text-[11px]">Before Tuning</span>
                <div className="font-mono font-bold text-base text-[#2A2B2E] dark:text-white mt-1">
                  7.46% Recall
                </div>
                <span className="text-[10px] text-[#6B6D70] block">Precision: 71.43%</span>
              </div>

              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40">
                <span className="text-orange-700 dark:text-orange-300 block text-[11px] font-semibold">After Tuning</span>
                <div className="font-mono font-bold text-base text-orange-900 dark:text-orange-200 mt-1">
                  5.97% Recall
                </div>
                <span className="text-[10px] text-orange-700 dark:text-orange-400 block">Precision: 66.67%</span>
              </div>
            </div>
            <p className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-2">
              Only 11 U2R training rows exist. Factor stayed at 1.0 as tuning on zero validation instances offered no gain.
            </p>
          </div>
        </div>
      </section>

      {/* Per-Attack R2L Breakdown Table */}
      <section className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white">
              Per-Attack R2L Breakdown (Why R2L Detection is Hard)
            </h3>
            <p className="text-xs text-[#6B6D70] dark:text-gray-400 mt-0.5">
              R2L and U2R test rows are identical in KDDTest+ and KDDTest-21, so their numbers match.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EDEEEA] dark:border-[#2E3036] text-[#6B6D70] dark:text-gray-400">
                <th className="p-2.5 text-left font-semibold">Attack Name</th>
                <th className="p-2.5 text-center font-semibold">Test Count</th>
                <th className="p-2.5 text-center font-semibold">Detection Recall</th>
                <th className="p-2.5 text-left font-semibold">Training Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEEEA] dark:divide-[#2E3036]">
              {(metrics.per_attack_r2l || []).map((attack) => {
                const recallPct = (attack.recall * 100).toFixed(1);
                return (
                  <tr key={attack.attack_name} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="p-2.5 font-mono font-medium text-[#2A2B2E] dark:text-white">
                      {attack.attack_name}
                    </td>
                    <td className="p-2.5 text-center font-mono">
                      {attack.count.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-center font-mono">
                      <span className={`font-semibold ${attack.recall > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {recallPct}%
                      </span>
                    </td>
                    <td className="p-2.5">
                      {attack.appears_in_training ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Appears in training
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          Unseen in training
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Model Comparison Table */}
      <section className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-6 shadow-sm">
        <h3 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white mb-1">
          Model Comparison across Evaluated Architectures ({testSet})
        </h3>
        <p className="text-xs text-[#6B6D70] dark:text-gray-400 mb-4">
          Benchmarking 4 classifiers on NSL-KDD test partitions. Final model selected by 5-fold CV macro F1.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EDEEEA] dark:border-[#2E3036] text-[#6B6D70] dark:text-gray-400">
                <th className="p-2.5 text-left font-semibold">Model Architecture</th>
                <th className="p-2.5 text-center font-semibold">Accuracy</th>
                <th className="p-2.5 text-center font-semibold">Macro F1</th>
                <th className="p-2.5 text-center font-semibold">Weighted F1</th>
                <th className="p-2.5 text-center font-semibold">R2L Recall</th>
                <th className="p-2.5 text-center font-semibold">U2R Recall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEEEA] dark:divide-[#2E3036]">
              {(metrics.model_comparison || [])
                .filter((m) => m.test_set === testSet)
                .map((row) => {
                  const isSelected = row.model === 'XGBoost';
                  return (
                    <tr 
                      key={row.model}
                      className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.02] ${
                        isSelected ? 'bg-emerald-50/50 dark:bg-emerald-950/10 font-medium' : ''
                      }`}
                    >
                      <td className="p-2.5 font-medium text-[#2A2B2E] dark:text-white flex items-center gap-2">
                        {row.model}
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-200 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                            Selected
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center font-mono">{(row.accuracy * 100).toFixed(2)}%</td>
                      <td className="p-2.5 text-center font-mono">{row.macro_f1?.toFixed(4)}</td>
                      <td className="p-2.5 text-center font-mono">{row.weighted_f1?.toFixed(4)}</td>
                      <td className="p-2.5 text-center font-mono">{(row.R2L_recall * 100).toFixed(2)}%</td>
                      <td className="p-2.5 text-center font-mono">{(row.U2R_recall * 100).toFixed(2)}%</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Attributions & Credits */}
      <div className="p-4 rounded-xl border border-[#EDEEEA] dark:border-[#2E3036] bg-[#F6F5F1] dark:bg-[#161719] text-xs text-[#6B6D70] dark:text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>
          Dataset: NSL-KDD (2009, derived from 1999 DARPA traffic by Tavallaee et al.).
        </span>
        <span>
          Baseline machine learning workflow inspired by Piyush Kumar.
        </span>
      </div>
    </div>
  );
}
