import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Sliders,
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import {
  predict,
  getSamples,
  CLASS_DISPLAY_ORDER,
  CLASS_COLORS,
  CLASS_DESCRIPTIONS,
  formatContribution
} from '../api/client.js';

// Fallback baseline packets for each class if API samples are loading
const DEFAULT_PRESETS = {
  normal: {
    duration: 0, protocol_type: 'tcp', service: 'http', flag: 'SF',
    src_bytes: 347, dst_bytes: 521, land: 0, wrong_fragment: 0, urgent: 0,
    hot: 0, num_failed_logins: 0, logged_in: 1, num_compromised: 0, root_shell: 0,
    su_attempted: 0, num_root: 0, num_file_creations: 0, num_shells: 0, num_access_files: 0,
    num_outbound_cmds: 0, is_host_login: 0, is_guest_login: 0, count: 5, srv_count: 5,
    serror_rate: 0.0, srv_serror_rate: 0.0, rerror_rate: 0.0, srv_rerror_rate: 0.0,
    same_srv_rate: 1.0, diff_srv_rate: 0.0, srv_diff_host_rate: 0.0,
    dst_host_count: 32, dst_host_srv_count: 255, dst_host_same_srv_rate: 1.0,
    dst_host_diff_srv_rate: 0.0, dst_host_same_src_port_rate: 0.03,
    dst_host_srv_diff_host_rate: 0.02, dst_host_serror_rate: 0.0,
    dst_host_srv_serror_rate: 0.0, dst_host_rerror_rate: 0.0, dst_host_srv_rerror_rate: 0.0
  },
  DoS: {
    duration: 0, protocol_type: 'tcp', service: 'private', flag: 'S0',
    src_bytes: 0, dst_bytes: 0, land: 0, wrong_fragment: 0, urgent: 0,
    hot: 0, num_failed_logins: 0, logged_in: 0, num_compromised: 0, root_shell: 0,
    su_attempted: 0, num_root: 0, num_file_creations: 0, num_shells: 0, num_access_files: 0,
    num_outbound_cmds: 0, is_host_login: 0, is_guest_login: 0, count: 245, srv_count: 18,
    serror_rate: 1.0, srv_serror_rate: 1.0, rerror_rate: 0.0, srv_rerror_rate: 0.0,
    same_srv_rate: 0.07, diff_srv_rate: 0.06, srv_diff_host_rate: 0.0,
    dst_host_count: 255, dst_host_srv_count: 18, dst_host_same_srv_rate: 0.07,
    dst_host_diff_srv_rate: 0.07, dst_host_same_src_port_rate: 0.0,
    dst_host_srv_diff_host_rate: 0.0, dst_host_serror_rate: 1.0,
    dst_host_srv_serror_rate: 1.0, dst_host_rerror_rate: 0.0, dst_host_srv_rerror_rate: 0.0
  },
  Probe: {
    duration: 0, protocol_type: 'tcp', service: 'private', flag: 'REJ',
    src_bytes: 0, dst_bytes: 0, land: 0, wrong_fragment: 0, urgent: 0,
    hot: 0, num_failed_logins: 0, logged_in: 0, num_compromised: 0, root_shell: 0,
    su_attempted: 0, num_root: 0, num_file_creations: 0, num_shells: 0, num_access_files: 0,
    num_outbound_cmds: 0, is_host_login: 0, is_guest_login: 0, count: 180, srv_count: 1,
    serror_rate: 0.0, srv_serror_rate: 0.0, rerror_rate: 1.0, srv_rerror_rate: 1.0,
    same_srv_rate: 0.01, diff_srv_rate: 0.99, srv_diff_host_rate: 0.0,
    dst_host_count: 255, dst_host_srv_count: 1, dst_host_same_srv_rate: 0.0,
    dst_host_diff_srv_rate: 1.0, dst_host_same_src_port_rate: 0.0,
    dst_host_srv_diff_host_rate: 0.0, dst_host_serror_rate: 0.0,
    dst_host_srv_serror_rate: 0.0, dst_host_rerror_rate: 1.0, dst_host_srv_rerror_rate: 1.0
  },
  R2L: {
    duration: 28, protocol_type: 'tcp', service: 'ftp', flag: 'SF',
    src_bytes: 280, dst_bytes: 1200, land: 0, wrong_fragment: 0, urgent: 0,
    hot: 5, num_failed_logins: 3, logged_in: 0, num_compromised: 0, root_shell: 0,
    su_attempted: 0, num_root: 0, num_file_creations: 0, num_shells: 0, num_access_files: 0,
    num_outbound_cmds: 0, is_host_login: 0, is_guest_login: 1, count: 1, srv_count: 1,
    serror_rate: 0.0, srv_serror_rate: 0.0, rerror_rate: 0.0, srv_rerror_rate: 0.0,
    same_srv_rate: 1.0, diff_srv_rate: 0.0, srv_diff_host_rate: 0.0,
    dst_host_count: 4, dst_host_srv_count: 4, dst_host_same_srv_rate: 1.0,
    dst_host_diff_srv_rate: 0.0, dst_host_same_src_port_rate: 0.25,
    dst_host_srv_diff_host_rate: 0.0, dst_host_serror_rate: 0.0,
    dst_host_srv_serror_rate: 0.0, dst_host_rerror_rate: 0.0, dst_host_srv_rerror_rate: 0.0
  },
  U2R: {
    duration: 12, protocol_type: 'tcp', service: 'telnet', flag: 'SF',
    src_bytes: 2500, dst_bytes: 4800, land: 0, wrong_fragment: 0, urgent: 0,
    hot: 3, num_failed_logins: 0, logged_in: 1, num_compromised: 2, root_shell: 1,
    su_attempted: 1, num_root: 3, num_file_creations: 5, num_shells: 1, num_access_files: 1,
    num_outbound_cmds: 0, is_host_login: 0, is_guest_login: 0, count: 1, srv_count: 1,
    serror_rate: 0.0, srv_serror_rate: 0.0, rerror_rate: 0.0, srv_rerror_rate: 0.0,
    same_srv_rate: 1.0, diff_srv_rate: 0.0, srv_diff_host_rate: 0.0,
    dst_host_count: 1, dst_host_srv_count: 1, dst_host_same_srv_rate: 1.0,
    dst_host_diff_srv_rate: 0.0, dst_host_same_src_port_rate: 1.0,
    dst_host_srv_diff_host_rate: 0.0, dst_host_serror_rate: 0.0,
    dst_host_srv_serror_rate: 0.0, dst_host_rerror_rate: 0.0, dst_host_srv_rerror_rate: 0.0
  }
};

export default function LiveDetection() {
  const [streamActive, setStreamActive] = useState(false);
  const [streamSpeed, setStreamSpeed] = useState(2500); // ms
  const [packets, setPackets] = useState([]);
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [filterClass, setFilterClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sampleBank, setSampleBank] = useState({});
  const [crafterOpen, setCrafterOpen] = useState(false);
  const [craftingData, setCraftingData] = useState(DEFAULT_PRESETS.normal);
  const [analyzingManual, setAnalyzingManual] = useState(false);
  const streamTimerRef = useRef(null);
  const packetIdCounter = useRef(1);

  // Pre-fetch diverse real benchmark samples for authentic streaming
  useEffect(() => {
    async function fetchSamples() {
      const bank = {};
      for (const cat of CLASS_DISPLAY_ORDER) {
        try {
          const res = await getSamples(cat, 8);
          if (res?.items?.length) {
            bank[cat] = res.items;
          }
        } catch {
          // fallback to presets
        }
      }
      setSampleBank(bank);
    }
    fetchSamples();
  }, []);

  // Process and analyze an incoming packet
  const processPacket = useCallback(async (rawFeatures, originType = 'Stream') => {
    const startTime = performance.now();
    try {
      const prediction = await predict(rawFeatures, 'full');
      const latencyMs = Math.round(performance.now() - startTime);

      const packetRecord = {
        id: packetIdCounter.current++,
        timestamp: new Date().toLocaleTimeString(),
        origin: originType,
        features: rawFeatures,
        prediction,
        latencyMs,
        verdict: prediction.predicted_class,
        isAttack: prediction.is_attack,
        confidence: Math.round((prediction.probabilities?.[prediction.predicted_class] || 0) * 100),
      };

      setPackets(prev => [packetRecord, ...prev.slice(0, 49)]); // keep latest 50
      if (!selectedPacket) {
        setSelectedPacket(packetRecord);
      }
      return packetRecord;
    } catch (err) {
      console.error('Packet analysis failed:', err);
    }
  }, [selectedPacket]);

  // Inject a specific attack type or normal packet
  const handleInject = useCallback(async (category) => {
    const pool = sampleBank[category] || [];
    const source = pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : DEFAULT_PRESETS[category] || DEFAULT_PRESETS.normal;

    const record = await processPacket(source, `Inject (${category})`);
    if (record) {
      setSelectedPacket(record);
    }
  }, [sampleBank, processPacket]);

  // Streaming loop
  useEffect(() => {
    if (!streamActive) {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      return;
    }

    const triggerNext = () => {
      // 65% normal traffic, 20% DoS, 10% Probe, 4% R2L, 1% U2R
      const rand = Math.random();
      let chosen = 'normal';
      if (rand > 0.95) chosen = 'U2R';
      else if (rand > 0.85) chosen = 'R2L';
      else if (rand > 0.70) chosen = 'Probe';
      else if (rand > 0.50) chosen = 'DoS';

      handleInject(chosen);
    };

    // run first immediately
    triggerNext();
    streamTimerRef.current = setInterval(triggerNext, streamSpeed);

    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [streamActive, streamSpeed, handleInject]);

  // Handle manual craft submission
  const handleAnalyzeCrafted = async (e) => {
    e.preventDefault();
    setAnalyzingManual(true);
    try {
      const record = await processPacket(craftingData, 'Custom Crafter');
      if (record) {
        setSelectedPacket(record);
        setCrafterOpen(false);
      }
    } finally {
      setAnalyzingManual(false);
    }
  };

  // Telemetry aggregates
  const totalCount = packets.length;
  const attackCount = packets.filter(p => p.isAttack).length;
  const threatRate = totalCount > 0 ? ((attackCount / totalCount) * 100).toFixed(1) : '0.0';
  const avgLatency = totalCount > 0
    ? Math.round(packets.reduce((sum, p) => sum + p.latencyMs, 0) / totalCount)
    : 0;

  // Filtered packets
  const filteredPackets = packets.filter(p => {
    if (filterClass === 'ATTACKS' && !p.isAttack) return false;
    if (filterClass === 'NORMAL' && p.isAttack) return false;
    if (filterClass !== 'ALL' && filterClass !== 'ATTACKS' && filterClass !== 'NORMAL') {
      if (p.verdict !== filterClass) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const service = String(p.features.service || '').toLowerCase();
      const proto = String(p.features.protocol_type || '').toLowerCase();
      const flag = String(p.features.flag || '').toLowerCase();
      const verdict = String(p.verdict || '').toLowerCase();
      return service.includes(q) || proto.includes(q) || flag.includes(q) || verdict.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-entrance">
      {/* Stream Control Bar */}
      <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-5 shadow-[0_8px_30px_rgba(42,43,46,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${streamActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
              <h1 className="font-display font-bold text-xl text-[#2A2B2E] dark:text-white">
                Live Traffic Detection Engine
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                XGBoost Runtime
              </span>
            </div>
            <p className="text-xs text-[#6B6D70] dark:text-gray-400 mt-1">
              Simulate live ingress traffic streams, inject benchmark attack vectors, and inspect full decision attributions in real time.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStreamActive(!streamActive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                streamActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 dark:shadow-none'
                  : 'bg-[#2A2B2E] hover:bg-black text-white dark:bg-white dark:text-[#2A2B2E] dark:hover:bg-gray-100'
              }`}
            >
              {streamActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{streamActive ? 'Pause Stream' : 'Start Live Stream'}</span>
            </button>

            {/* Speed selector */}
            <div className="flex items-center text-xs border border-[#DADBD6] dark:border-[#3B3E45] rounded-xl bg-[#F6F5F1] dark:bg-[#161719] p-0.5">
              <button
                onClick={() => setStreamSpeed(1200)}
                className={`px-2.5 py-1 rounded-lg font-mono transition-colors ${streamSpeed === 1200 ? 'bg-white dark:bg-[#202226] shadow-xs font-bold text-[#2A2B2E] dark:text-white' : 'text-[#6B6D70] dark:text-gray-400'}`}
              >
                1.2s
              </button>
              <button
                onClick={() => setStreamSpeed(2500)}
                className={`px-2.5 py-1 rounded-lg font-mono transition-colors ${streamSpeed === 2500 ? 'bg-white dark:bg-[#202226] shadow-xs font-bold text-[#2A2B2E] dark:text-white' : 'text-[#6B6D70] dark:text-gray-400'}`}
              >
                2.5s
              </button>
              <button
                onClick={() => setStreamSpeed(5000)}
                className={`px-2.5 py-1 rounded-lg font-mono transition-colors ${streamSpeed === 5000 ? 'bg-white dark:bg-[#202226] shadow-xs font-bold text-[#2A2B2E] dark:text-white' : 'text-[#6B6D70] dark:text-gray-400'}`}
              >
                5.0s
              </button>
            </div>

            {/* Manual Crafter Toggle */}
            <button
              onClick={() => setCrafterOpen(!crafterOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#DADBD6] dark:border-[#3B3E45] text-xs font-medium bg-white dark:bg-[#202226] text-[#2A2B2E] dark:text-gray-200 hover:bg-[#F6F5F1] dark:hover:bg-[#2A2B2E] transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-[#6B6D70]" />
              <span>Packet Crafter</span>
            </button>

            {/* Reset / Clear */}
            <button
              onClick={() => {
                setPackets([]);
                setSelectedPacket(null);
              }}
              title="Clear packet history"
              className="p-2 rounded-xl border border-[#DADBD6] dark:border-[#3B3E45] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-white dark:bg-[#202226] hover:bg-[#F6F5F1] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Attack Injection Fast-Triggers */}
        <div className="mt-4 pt-4 border-t border-[#EDEEEA] dark:border-[#2E3036] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B6D70] dark:text-gray-400 mr-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            Inject Preset:
          </span>
          <button
            onClick={() => handleInject('normal')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#DADBD6] dark:border-[#3B3E45] bg-[#F6F5F1] dark:bg-[#161719] hover:border-zinc-400 text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            + Normal Web
          </button>
          <button
            onClick={() => handleInject('DoS')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
          >
            + DoS (SYN Flood)
          </button>
          <button
            onClick={() => handleInject('Probe')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
          >
            + Probe (Portscan)
          </button>
          <button
            onClick={() => handleInject('R2L')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-purple-200 dark:border-purple-900/60 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors"
          >
            + R2L (Password Guess)
          </button>
          <button
            onClick={() => handleInject('U2R')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-orange-200 dark:border-orange-900/60 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 transition-colors"
          >
            + U2R (Privilege Escalation)
          </button>
        </div>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#6B6D70] dark:text-gray-400 mb-1">
            <span>PACKETS INSPECTED</span>
            <Activity className="w-4 h-4 text-[#6B6D70]" />
          </div>
          <div className="text-2xl font-bold font-display text-[#2A2B2E] dark:text-white">
            {totalCount}
          </div>
          <p className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-0.5">
            Buffer window: latest 50
          </p>
        </div>

        <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#6B6D70] dark:text-gray-400 mb-1">
            <span>THREATS MITIGATED</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-display text-rose-600 dark:text-rose-400">
            {attackCount}
          </div>
          <p className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-0.5">
            Threat ratio: <strong className="text-[#2A2B2E] dark:text-white">{threatRate}%</strong>
          </p>
        </div>

        <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#6B6D70] dark:text-gray-400 mb-1">
            <span>INSPECTION LATENCY</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-display text-[#2A2B2E] dark:text-white">
            {avgLatency} <span className="text-sm font-normal text-zinc-500">ms</span>
          </div>
          <p className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-0.5">
            Model pipeline + SHAP
          </p>
        </div>

        <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#6B6D70] dark:text-gray-400 mb-1">
            <span>ATTACK DISTRIBUTION</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {CLASS_DISPLAY_ORDER.map(cls => {
              const count = packets.filter(p => p.verdict === cls).length;
              return (
                <div key={cls} className="flex-1" title={`${cls}: ${count}`}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      backgroundColor: CLASS_COLORS[cls],
                      opacity: count > 0 ? 1 : 0.2
                    }}
                  />
                  <span className="block text-[10px] text-center font-mono mt-0.5 text-zinc-500">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Manual Packet Crafter Modal / Panel */}
      {crafterOpen && (
        <div className="bg-white dark:bg-[#202226] border-2 border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-6 shadow-md animate-entrance">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white">
                Custom Packet Crafter & Tester
              </h2>
            </div>
            <button
              onClick={() => setCrafterOpen(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-[#6B6D70] dark:text-gray-400 mb-4">
            Fine-tune core protocol parameters to test boundary behavior and see how the model and SHAP attributions respond.
          </p>

          <form onSubmit={handleAnalyzeCrafted} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">protocol_type</label>
                <select
                  value={craftingData.protocol_type}
                  onChange={e => setCraftingData({ ...craftingData, protocol_type: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-[#DADBD6] dark:border-[#3B3E45] bg-[#F6F5F1] dark:bg-[#161719] text-[#2A2B2E] dark:text-white"
                >
                  <option value="tcp">tcp</option>
                  <option value="udp">udp</option>
                  <option value="icmp">icmp</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">service</label>
                <select
                  value={craftingData.service}
                  onChange={e => setCraftingData({ ...craftingData, service: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-[#DADBD6] dark:border-[#3B3E45] bg-[#F6F5F1] dark:bg-[#161719] text-[#2A2B2E] dark:text-white"
                >
                  <option value="http">http</option>
                  <option value="ftp">ftp</option>
                  <option value="smtp">smtp</option>
                  <option value="private">private</option>
                  <option value="telnet">telnet</option>
                  <option value="eco_i">eco_i</option>
                  <option value="domain_u">domain_u</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">flag</label>
                <select
                  value={craftingData.flag}
                  onChange={e => setCraftingData({ ...craftingData, flag: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-[#DADBD6] dark:border-[#3B3E45] bg-[#F6F5F1] dark:bg-[#161719] text-[#2A2B2E] dark:text-white"
                >
                  <option value="SF">SF (Normal Syn/Fin)</option>
                  <option value="S0">S0 (Syn, no ack)</option>
                  <option value="REJ">REJ (Rejected)</option>
                  <option value="RSTO">RSTO (Reset origin)</option>
                  <option value="SH">SH (Half open)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">src_bytes</label>
                <input
                  type="number"
                  value={craftingData.src_bytes}
                  onChange={e => setCraftingData({ ...craftingData, src_bytes: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-lg border border-[#DADBD6] dark:border-[#3B3E45] bg-[#F6F5F1] dark:bg-[#161719] text-[#2A2B2E] dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">dst_bytes</label>
                <input
                  type="number"
                  value={craftingData.dst_bytes}
                  onChange={e => setCraftingData({ ...craftingData, dst_bytes: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-lg border border-[#DADBD6] dark:border-[#3B3E45] bg-[#F6F5F1] dark:bg-[#161719] text-[#2A2B2E] dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">logged_in</label>
                <select
                  value={craftingData.logged_in}
                  onChange={e => setCraftingData({ ...craftingData, logged_in: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-lg border border-[#DADBD6] dark:border-[#3B3E45] bg-[#F6F5F1] dark:bg-[#161719] text-[#2A2B2E] dark:text-white"
                >
                  <option value="1">1 (Logged In)</option>
                  <option value="0">0 (Anonymous)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">count (Connections)</label>
                <input
                  type="number"
                  value={craftingData.count}
                  onChange={e => setCraftingData({ ...craftingData, count: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-lg border border-[#DADBD6] dark:border-[#3B3E45] bg-[#F6F5F1] dark:bg-[#161719] text-[#2A2B2E] dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">serror_rate [0.0 - 1.0]</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={craftingData.serror_rate}
                  onChange={e => setCraftingData({ ...craftingData, serror_rate: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-lg border border-[#DADBD6] dark:border-[#3B3E45] bg-[#F6F5F1] dark:bg-[#161719] text-[#2A2B2E] dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">num_failed_logins</label>
                <input
                  type="number"
                  value={craftingData.num_failed_logins}
                  onChange={e => setCraftingData({ ...craftingData, num_failed_logins: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-lg border border-[#DADBD6] dark:border-[#3B3E45] bg-[#F6F5F1] dark:bg-[#161719] text-[#2A2B2E] dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">root_shell</label>
                <select
                  value={craftingData.root_shell}
                  onChange={e => setCraftingData({ ...craftingData, root_shell: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-lg border border-[#DADBD6] dark:border-[#3B3E45] bg-[#F6F5F1] dark:bg-[#161719] text-[#2A2B2E] dark:text-white"
                >
                  <option value="0">0 (User Privileges)</option>
                  <option value="1">1 (Root Shell Obtained)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCraftingData(DEFAULT_PRESETS.normal)}
                className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700"
              >
                Reset to Normal
              </button>
              <button
                type="submit"
                disabled={analyzingManual}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50"
              >
                {analyzingManual ? 'Analyzing...' : 'Dispatch & Analyze Packet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Split: Left = Live Flow Table, Right = Deep Packet Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Feed Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Table Header & Controls */}
          <div className="p-4 border-b border-[#EDEEEA] dark:border-[#2E3036] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base text-[#2A2B2E] dark:text-white">
                Live Connection Log
              </h2>
              <span className="text-xs text-[#6B6D70] dark:text-gray-400">
                ({filteredPackets.length} shown)
              </span>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilterClass('ALL')}
                className={`px-2 py-1 text-[11px] rounded-lg transition-colors ${filterClass === 'ALL' ? 'bg-[#2A2B2E] text-white dark:bg-white dark:text-[#2A2B2E] font-semibold' : 'text-[#6B6D70] dark:text-gray-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterClass('ATTACKS')}
                className={`px-2 py-1 text-[11px] rounded-lg transition-colors ${filterClass === 'ATTACKS' ? 'bg-rose-600 text-white font-semibold' : 'text-[#6B6D70] dark:text-gray-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                Attacks
              </button>
              <button
                onClick={() => setFilterClass('NORMAL')}
                className={`px-2 py-1 text-[11px] rounded-lg transition-colors ${filterClass === 'NORMAL' ? 'bg-zinc-600 text-white font-semibold' : 'text-[#6B6D70] dark:text-gray-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                Normal
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-4 py-2 bg-[#F6F5F1]/50 dark:bg-[#161719]/40 border-b border-[#EDEEEA] dark:border-[#2E3036] flex items-center gap-2 text-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Search protocol, service, flag, or verdict..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-[#2A2B2E] dark:text-white placeholder-zinc-400 text-xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-zinc-600 text-xs">
                Clear
              </button>
            )}
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto max-h-[580px] overflow-y-auto divide-y divide-[#EDEEEA] dark:divide-[#2E3036]">
            {filteredPackets.length === 0 ? (
              <div className="p-12 text-center text-[#6B6D70] dark:text-gray-400 text-xs">
                {totalCount === 0 ? (
                  <div>
                    <Shield className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                    <p className="font-medium text-sm text-[#2A2B2E] dark:text-zinc-200">No packets captured yet</p>
                    <p className="mt-1">Click <strong>Start Live Stream</strong> or inject an attack preset above to begin telemetry.</p>
                  </div>
                ) : (
                  <p>No connections match current filter criteria.</p>
                )}
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F5F1] dark:bg-[#161719] sticky top-0 z-10 text-[11px] font-mono uppercase text-[#6B6D70] dark:text-gray-400">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-2">Proto</th>
                    <th className="py-2.5 px-2">Service</th>
                    <th className="py-2.5 px-2">Flag</th>
                    <th className="py-2.5 px-2">Verdict</th>
                    <th className="py-2.5 px-2 text-right">Conf</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEEEA] dark:divide-[#2E3036] font-mono">
                  {filteredPackets.map((pkt) => {
                    const isSelected = selectedPacket?.id === pkt.id;
                    const classColor = CLASS_COLORS[pkt.verdict] || '#7C7F86';

                    return (
                      <tr
                        key={pkt.id}
                        onClick={() => setSelectedPacket(pkt)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-zinc-100 dark:bg-zinc-800/80 font-semibold'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <td className="py-2 px-3 text-[11px] text-zinc-500 whitespace-nowrap">
                          {pkt.timestamp}
                        </td>
                        <td className="py-2 px-2 text-zinc-700 dark:text-zinc-300">
                          {pkt.features.protocol_type}
                        </td>
                        <td className="py-2 px-2 text-zinc-800 dark:text-zinc-200 font-bold">
                          {pkt.features.service}
                        </td>
                        <td className="py-2 px-2 text-zinc-500">
                          {pkt.features.flag}
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: classColor }}
                          >
                            {pkt.verdict}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right text-zinc-700 dark:text-zinc-300">
                          {pkt.confidence}%
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pkt.isAttack
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {pkt.isAttack ? 'BLOCKED' : 'PASS'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Deep Packet Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl shadow-sm p-6 sticky top-24">
          {selectedPacket ? (
            <div className="space-y-6">
              {/* Verdict Banner */}
              <div
                className="p-4 rounded-xl border flex items-center justify-between"
                style={{
                  backgroundColor: `${CLASS_COLORS[selectedPacket.verdict]}10`,
                  borderColor: `${CLASS_COLORS[selectedPacket.verdict]}40`
                }}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    Decision Verdict
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3
                      className="font-display font-extrabold text-2xl"
                      style={{ color: CLASS_COLORS[selectedPacket.verdict] }}
                    >
                      {selectedPacket.verdict}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        selectedPacket.isAttack
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}
                    >
                      {selectedPacket.isAttack ? 'Host Intrusion' : 'Benign Traffic'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                    {CLASS_DESCRIPTIONS[selectedPacket.verdict]}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-400">Confidence</span>
                  <div className="text-2xl font-bold font-mono text-[#2A2B2E] dark:text-white">
                    {selectedPacket.confidence}%
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">{selectedPacket.latencyMs}ms</span>
                </div>
              </div>

              {/* Honesty Callout if Normal or R2L/U2R */}
              {selectedPacket.verdict === 'normal' && (
                <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Benchmark Honesty Notice</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    A verdict of <strong>Normal</strong> does not guarantee absence of intrusion. Due to extreme benchmark rarity, low-footprint R2L or U2R exploits can pass undetected.
                  </p>
                </div>
              )}

              {/* Class Probability Distribution */}
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#6B6D70] dark:text-gray-400 block mb-2">
                  Multi-Class Probabilities
                </span>
                <div className="space-y-2">
                  {CLASS_DISPLAY_ORDER.map(cls => {
                    const prob = (selectedPacket.prediction.probabilities?.[cls] || 0) * 100;
                    const isWinner = selectedPacket.verdict === cls;
                    return (
                      <div key={cls} className="text-xs">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`font-mono ${isWinner ? 'font-bold text-[#2A2B2E] dark:text-white' : 'text-zinc-500'}`}>
                            {cls}
                          </span>
                          <span className="font-mono text-zinc-600 dark:text-zinc-300">
                            {prob.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${prob}%`,
                              backgroundColor: CLASS_COLORS[cls]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* XGBoost Top SHAP Log-Odds Contributions */}
              {selectedPacket.prediction.contributions && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#6B6D70] dark:text-gray-400">
                      Top Decision Drivers (SHAP)
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Log-odds shift
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedPacket.prediction.contributions.map((c, i) => {
                      const formatted = formatContribution(c.contribution, selectedPacket.verdict);
                      return (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-[#F6F5F1] dark:bg-[#161719] border border-[#EDEEEA] dark:border-[#2E3036] flex items-center justify-between text-xs"
                        >
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-[#2A2B2E] dark:text-white text-[11px]">
                              {c.feature}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              val: {String(c.value)} &bull; {formatted.direction}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-xs font-bold ${
                              formatted.isToward ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {formatted.rawMargin > 0 ? `+${formatted.rawMargin.toFixed(3)}` : formatted.rawMargin.toFixed(3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Core Feature Summary Grid */}
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#6B6D70] dark:text-gray-400 block mb-2">
                  Sample Feature Snapshot
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[10px] text-zinc-400 block">src_bytes</span>
                    <span className="font-bold text-[#2A2B2E] dark:text-white">{selectedPacket.features.src_bytes}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[10px] text-zinc-400 block">dst_bytes</span>
                    <span className="font-bold text-[#2A2B2E] dark:text-white">{selectedPacket.features.dst_bytes}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[10px] text-zinc-400 block">count</span>
                    <span className="font-bold text-[#2A2B2E] dark:text-white">{selectedPacket.features.count}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[10px] text-zinc-400 block">logged_in</span>
                    <span className="font-bold text-[#2A2B2E] dark:text-white">{selectedPacket.features.logged_in}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-400 text-xs">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Select any connection from the live table to inspect its full 41-feature payload and SHAP breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
