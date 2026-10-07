import React from 'react';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  Database,
  Cpu,
  FileCode,
  Layers,
  BookOpen,
  Award,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Lock,
  Flame,
  Search,
  KeyRound,
  Crown
} from 'lucide-react';
import {
  CLASS_DISPLAY_ORDER,
  CLASS_COLORS,
  CLASS_DESCRIPTIONS
} from '../api/client.js';

export default function About() {
  return (
    <div className="space-y-10 animate-entrance max-w-5xl mx-auto">
      {/* Hero Mission Card */}
      <div className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300">
            <Shield className="w-3.5 h-3.5 text-zinc-500" />
            <span>NSL-KDD Benchmark System &bull; DARPA 1999 &rarr; 2009 &rarr; 2026</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#2A2B2E] dark:text-white tracking-tight leading-tight">
            NERD Intrusion Detection System
          </h1>
          <p className="text-sm sm:text-base text-[#6B6D70] dark:text-gray-300 leading-relaxed">
            An end-to-end machine learning platform implementing transparent network intrusion detection on the NSL-KDD benchmark. NERD prioritizes scientific honesty, explainable tree decisions (TreeSHAP), and rigorous evaluation against unseen attack variants.
          </p>
        </div>
      </div>

      {/* Section 1: The NSL-KDD Benchmark Story */}
      <section className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-[#2A2B2E] dark:text-white">
              The NSL-KDD Dataset: History & Purpose
            </h2>
            <p className="text-xs text-[#6B6D70] dark:text-gray-400">
              Why the cybersecurity research community built NSL-KDD to replace KDD Cup 1999
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#6B6D70] dark:text-gray-300 leading-relaxed">
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#2A2B2E] dark:text-white">
              Flaws in the 1999 DARPA / KDD Cup Dataset
            </h3>
            <p>
              In 1998–1999, DARPA and MIT Lincoln Laboratory collected tcpdump network traffic to simulate an Air Force local-area network under attack. While widely adopted for machine learning research, researchers discovered catastrophic structural flaws in the original KDD Cup 99 dataset:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-300">
              <li><strong>78% redundant records</strong> in the training set and <strong>75% duplicates</strong> in the test set.</li>
              <li>Models could achieve &gt;98% accuracy by simply memorizing frequent duplicate normal and DoS records without learning generalizable attack patterns.</li>
              <li>Evaluations were artificially optimistic and masked severe weaknesses against stealthy attacks.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#2A2B2E] dark:text-white">
              The Tavallaee et al. (2009) Improvement
            </h3>
            <p>
              Researchers at the University of New Brunswick created <strong>NSL-KDD</strong> to eliminate redundant connections and enable realistic benchmarking:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-300">
              <li><strong>Zero duplicate connections:</strong> Classifiers can no longer bias toward frequent records.</li>
              <li><strong>Difficulty Level Scoring:</strong> Each connection was evaluated by 21 distinct learning algorithms to assign an intrinsic difficulty score.</li>
              <li><strong>Standardized Subsets:</strong> Established <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">KDDTrain+_20Percent</code>, <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">KDDTest+</code>, and the hard benchmark <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">KDDTest-21</code>.</li>
            </ul>
          </div>
        </div>

        {/* Test Splits Comparison Callout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#EDEEEA] dark:border-[#2E3036]">
          <div className="p-4 rounded-xl bg-[#F6F5F1] dark:bg-[#161719] border border-[#DADBD6] dark:border-[#2E3036]">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Training Partition</span>
            <div className="text-base font-bold text-[#2A2B2E] dark:text-white font-mono mt-1">KDDTrain+_20Percent</div>
            <p className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-1">
              25,192 records. Used for stratified 5-fold cross-validation and hyperparameter selection.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F6F5F1] dark:bg-[#161719] border border-[#DADBD6] dark:border-[#2E3036]">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Standard Test Set</span>
            <div className="text-base font-bold text-[#2A2B2E] dark:text-white font-mono mt-1">KDDTest+ (Full)</div>
            <p className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-1">
              22,544 records. Evaluates model generalizability, including 17 novel attack names unseen in training.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 uppercase">Hard Test Set</span>
            <div className="text-base font-bold text-[#2A2B2E] dark:text-white font-mono mt-1">KDDTest-21 (Hard)</div>
            <p className="text-[11px] text-[#6B6D70] dark:text-gray-400 mt-1">
              11,850 records. Strips all connections easily solved by 21 baseline systems. NERD accuracy drops to 56.7%.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Attack Taxonomy Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display font-bold text-xl text-[#2A2B2E] dark:text-white">
            NSL-KDD Attack Taxonomy
          </h2>
          <p className="text-xs text-[#6B6D70] dark:text-gray-400 mt-0.5">
            Connections are categorized into four distinct attack families alongside benign traffic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: DoS */}
          <div className="bg-white dark:bg-[#202226] border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white">
                  DoS (Denial of Service)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-mono">
                Recall: 83.0%
              </span>
            </div>
            <p className="text-xs text-[#6B6D70] dark:text-gray-300 leading-relaxed">
              Volumetric floods and malformed packet sequences designed to deplete server memory, bandwidth, or CPU resources, rendering network services unavailable to legitimate clients.
            </p>
            <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-xs font-mono space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase block font-sans font-semibold">Attacks:</span>
              <span className="text-rose-700 dark:text-rose-300">
                neptune (SYN flood), smurf (ICMP echo flood), back, teardrop (overlapping IP fragments), pod (ping of death), land
              </span>
            </div>
          </div>

          {/* Card: Probe */}
          <div className="bg-white dark:bg-[#202226] border border-amber-200 dark:border-amber-900/40 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white">
                  Probe (Reconnaissance)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-mono">
                Recall: 61.1%
              </span>
            </div>
            <p className="text-xs text-[#6B6D70] dark:text-gray-300 leading-relaxed">
              Surveillance sweeps scanning target IP subnets and open TCP/UDP ports to discover active host machines, running daemon versions, and known vulnerabilities prior to an exploit.
            </p>
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 text-xs font-mono space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase block font-sans font-semibold">Attacks:</span>
              <span className="text-amber-700 dark:text-amber-300">
                portsweep, ipsweep, nmap, satan, mscan, saint
              </span>
            </div>
          </div>

          {/* Card: R2L */}
          <div className="bg-white dark:bg-[#202226] border border-purple-200 dark:border-purple-900/40 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white">
                  R2L (Remote to Local)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-mono">
                Recall: 11.0% (Tuned)
              </span>
            </div>
            <p className="text-xs text-[#6B6D70] dark:text-gray-300 leading-relaxed">
              An unauthorized remote user attempts to gain local access on the victim machine by exploiting service vulnerabilities or guessing credentials without having an existing user account.
            </p>
            <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 text-xs font-mono space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase block font-sans font-semibold">Attacks:</span>
              <span className="text-purple-700 dark:text-purple-300">
                guess_passwd, ftp_write, imap, phf, multihop, warezmaster, warezclient, spy, snmpget
              </span>
            </div>
          </div>

          {/* Card: U2R */}
          <div className="bg-white dark:bg-[#202226] border border-orange-200 dark:border-orange-900/40 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="font-display font-bold text-lg text-[#2A2B2E] dark:text-white">
                  U2R (User to Root)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 font-mono">
                Recall: 6.0% (Severe Imbalance)
              </span>
            </div>
            <p className="text-xs text-[#6B6D70] dark:text-gray-300 leading-relaxed">
              A local user with standard unprivileged credentials exploits software vulnerabilities (e.g. stack buffer overflows, race conditions) to escalate privileges to root or system administrator.
            </p>
            <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 text-xs font-mono space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase block font-sans font-semibold">Attacks:</span>
              <span className="text-orange-700 dark:text-orange-300">
                buffer_overflow, loadmodule, rootkit, perl, ps, sqlattack, xterm
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Machine Learning & Preprocessing Architecture */}
      <section className="bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-[#2A2B2E] dark:text-white">
              Model Selection & Engineering Architecture
            </h2>
            <p className="text-xs text-[#6B6D70] dark:text-gray-400">
              Leakage-free scikit-learn transformers and XGBoost gradient boosting
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#6B6D70] dark:text-gray-300">
          <div className="p-4 rounded-xl bg-[#F6F5F1] dark:bg-[#161719] border border-[#DADBD6] dark:border-[#2E3036] space-y-2">
            <h3 className="font-bold text-[#2A2B2E] dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Train-Only Preprocessing
            </h3>
            <p className="leading-relaxed">
              Scalers and categorical encoders are strictly fit on <code className="font-mono text-zinc-600 dark:text-zinc-300">KDDTrain+_20Percent</code>. Test sets and live API payloads are strictly transformed to prevent any data leakage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F6F5F1] dark:bg-[#161719] border border-[#DADBD6] dark:border-[#2E3036] space-y-2">
            <h3 className="font-bold text-[#2A2B2E] dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              5-Fold Cross-Validation
            </h3>
            <p className="leading-relaxed">
              XGBoost achieved the highest Stratified 5-Fold Macro F1 (<strong className="text-[#2A2B2E] dark:text-white">0.885 &plusmn; 0.049</strong>), outperforming Random Forest (0.876), HistGradientBoosting (0.869), and Logistic Regression (0.751).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F6F5F1] dark:bg-[#161719] border border-[#DADBD6] dark:border-[#2E3036] space-y-2">
            <h3 className="font-bold text-[#2A2B2E] dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Threshold Factor Tuning
            </h3>
            <p className="leading-relaxed">
              R2L and U2R suffer from extreme class rarity in training (<strong className="text-purple-600">0.8%</strong> of records). Post-processing probability factor multipliers (<strong className="text-purple-600">5.0x</strong> for R2L) were tuned on validation splits to boost recall.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Critical Limitations & Scientific Honesty */}
      <section className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h2 className="font-display font-bold text-lg text-amber-900 dark:text-amber-200">
            Transparent Benchmark Limitations & Operational Honesty
          </h2>
        </div>

        <div className="space-y-3 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
          <p>
            <strong>1. The "Normal" Fallacy:</strong> A classification verdict of "Normal" does not guarantee network safety. In real evaluations on <code className="font-mono">KDDTest+</code>, the model correctly identifies only ~11.0% of R2L attacks and ~6.0% of U2R exploits. Stealthy intruders can blend into normal web patterns.
          </p>
          <p>
            <strong>2. Historical Traffic Environment:</strong> NSL-KDD originates from 1998/1999 synthetic traces. It predates modern HTTPS / TLS 1.3 encrypted payloads, cloud APIs, microservices, container networks, and modern zero-day malware.
          </p>
          <p>
            <strong>3. Defense in Depth:</strong> In real production security operations, machine learning classifiers must function as part of an ensemble alongside signature IDS (Snort / Suricata), behavioral network metadata analyzers (Zeek), and endpoint detection & response (EDR) agents.
          </p>
        </div>
      </section>
    </div>
  );
}
