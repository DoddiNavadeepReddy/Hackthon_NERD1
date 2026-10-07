import React from 'react';
import { Shield, Activity, Moon, Sun, Play, Pause } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  motionEnabled,
  setMotionEnabled,
  serverStatus,
}) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'live', label: 'Live Detection' },
    { id: 'explainability', label: 'Explainability' },
    { id: 'about', label: 'About' },
    { id: 'batch', label: 'Batch Analysis' },
  ];

  return (
    <header className="sticky top-4 z-40 px-4 mb-6">
      <nav
        aria-label="Main Navigation"
        className="max-w-6xl mx-auto bg-white dark:bg-[#202226] border border-[#EDEEEA] dark:border-[#2E3036] rounded-2xl shadow-[0_8px_30px_rgba(42,43,46,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] px-4 py-3 flex items-center justify-between transition-colors duration-200"
      >
        {/* Brand Group */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-white to-[#EDEEEA] dark:from-[#2A2B2E] dark:to-[#202226] border border-[#DADBD6] dark:border-[#3B3E45] shadow-sm flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#2A2B2E] dark:text-gray-100" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg tracking-tight text-[#2A2B2E] dark:text-white leading-none">
              NERD
            </span>
            <span className="text-[10px] text-[#6B6D70] dark:text-gray-400 font-mono tracking-wider">
              NSL-KDD ML
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 rounded-lg ${
                  isActive
                    ? 'text-[#2A2B2E] dark:text-white font-semibold'
                    : 'text-[#6B6D70] dark:text-gray-400 hover:text-[#2A2B2E] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#2A2B2E] dark:bg-white rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Controls Pill Group */}
        <div className="flex items-center gap-2">
          {/* Server status pill */}
          <div
            title={`Backend: ${serverStatus}`}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-[#DADBD6] dark:border-[#3B3E45] bg-[#F6F5F1] dark:bg-[#161719] text-[#2A2B2E] dark:text-gray-200 font-mono"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === 'online'
                  ? 'bg-emerald-500'
                  : serverStatus === 'waking'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <span className="hidden sm:inline">
              {serverStatus === 'online' ? 'Live' : serverStatus === 'waking' ? 'Waking...' : 'Offline'}
            </span>
          </div>

          {/* Motion / Still Toggle */}
          <button
            onClick={() => setMotionEnabled(!motionEnabled)}
            title={motionEnabled ? 'Switch to Still (Reduce motion)' : 'Switch to Motion'}
            aria-label={motionEnabled ? 'Motion enabled, click for still' : 'Motion disabled, click to enable'}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border border-[#DADBD6] dark:border-[#3B3E45] bg-white dark:bg-[#202226] text-[#2A2B2E] dark:text-gray-200 hover:bg-[#F6F5F1] dark:hover:bg-[#2A2B2E] transition-colors"
          >
            {motionEnabled ? <Play className="w-3 h-3 text-[#2A2B2E] dark:text-white" /> : <Pause className="w-3 h-3 text-[#6B6D70] dark:text-gray-400" />}
            <span className="hidden sm:inline font-mono">{motionEnabled ? 'Motion' : 'Still'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Light / Dark theme"
            aria-label="Toggle theme"
            className="p-1.5 rounded-full border border-[#DADBD6] dark:border-[#3B3E45] bg-white dark:bg-[#202226] text-[#2A2B2E] dark:text-gray-200 hover:bg-[#F6F5F1] dark:hover:bg-[#2A2B2E] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#2A2B2E]" />}
          </button>
        </div>
      </nav>

      {/* Mobile nav row */}
      <div className="flex md:hidden items-center justify-center gap-1 mt-2 overflow-x-auto py-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#2A2B2E] text-white dark:bg-white dark:text-[#2A2B2E] font-medium'
                : 'text-[#6B6D70] dark:text-gray-400 bg-white/70 dark:bg-[#202226]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
