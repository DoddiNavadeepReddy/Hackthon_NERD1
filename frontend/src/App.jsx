import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import ServerWakeBanner from './components/ServerWakeBanner.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LiveDetection from './pages/LiveDetection.jsx';
import Explainability from './pages/Explainability.jsx';
import About from './pages/About.jsx';
import BatchAnalysis from './pages/BatchAnalysis.jsx';
import { getHealth, waitForServer } from './api/client.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [serverStatus, setServerStatus] = useState('waking'); // 'online' | 'waking' | 'offline'
  const [retryState, setRetryState] = useState({ attempt: 1, maxRetries: 15 });

  // Sync theme to root class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle prefers-reduced-motion and tab visibility pause
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setMotionEnabled(false);
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.classList.add('motion-still');
      } else if (motionEnabled) {
        document.body.classList.remove('motion-still');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [motionEnabled]);

  // Sync motion state to document body
  useEffect(() => {
    if (!motionEnabled) {
      document.body.classList.add('motion-still');
    } else {
      document.body.classList.remove('motion-still');
    }
  }, [motionEnabled]);

  // Connect to API and handle Render wake-up
  const checkServer = useCallback(async () => {
    setServerStatus('waking');
    try {
      await waitForServer((retryInfo) => {
        setRetryState(retryInfo);
      }, 15, 2000);
      setServerStatus('online');
    } catch {
      setServerStatus('offline');
    }
  }, []);

  useEffect(() => {
    checkServer();
  }, [checkServer]);

  return (
    <div className="min-h-screen bg-mesh-gradient flex flex-col font-sans transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        motionEnabled={motionEnabled}
        setMotionEnabled={setMotionEnabled}
        serverStatus={serverStatus}
      />

      <ServerWakeBanner
        serverStatus={serverStatus}
        retryState={retryState}
        onManualRetry={checkServer}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pb-16">
        {activeTab === 'dashboard' && <Dashboard onRetry={checkServer} onNavigate={setActiveTab} />}
        {activeTab === 'live' && <LiveDetection />}
        {activeTab === 'explainability' && <Explainability />}
        {activeTab === 'about' && <About />}
        {activeTab === 'batch' && <BatchAnalysis />}
      </main>

      <footer className="py-6 border-t border-[#EDEEEA] dark:border-[#2E3036] text-center text-xs text-[#6B6D70] dark:text-gray-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NERD Intrusion Detection &bull; NSL-KDD Benchmark (2009, derived from 1999 DARPA traffic)</span>
          <span>Baseline model: XGBoost on KDDTrain+_20Percent</span>
        </div>
      </footer>
    </div>
  );
}
