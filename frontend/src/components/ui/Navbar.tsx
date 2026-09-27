import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  activeTab: 'specimen' | 'physics';
  setActiveTab: (tab: 'specimen' | 'physics') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full pt-4 px-4 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="panel-minimal rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300">
          {/* Brand */}
          <a href="#" className="flex items-center gap-2.5 group">
            <span className="w-2 h-2 rounded-full bg-moss inline-block animate-pulse" />
            <span className="text-sm font-semibold tracking-tight text-bone">
              green<span className="text-mist font-normal">vision</span>
            </span>
            <span className="hidden sm:inline-block font-mono text-[10px] uppercase text-dim tracking-wider pl-1">
              v0.9.4
            </span>
          </a>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-mist">
            <a href="#overview" className="hover:text-bone transition-colors">Overview</a>
            <a href="#architecture" className="hover:text-bone transition-colors">Neural Pipeline</a>
            <a href="#benchmarks" className="hover:text-bone transition-colors">Benchmarks</a>
            <a href="#integration" className="hover:text-bone transition-colors">SDK</a>
          </nav>

          {/* Mode Switcher & CTA */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-black/40 rounded-full p-0.5 border border-line text-xs">
              <button
                onClick={() => setActiveTab('specimen')}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                  activeTab === 'specimen'
                    ? 'bg-bone text-ink font-semibold'
                    : 'text-mist hover:text-bone'
                }`}
              >
                Specimen
              </button>
              <button
                onClick={() => setActiveTab('physics')}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                  activeTab === 'physics'
                    ? 'bg-bone text-ink font-semibold'
                    : 'text-mist hover:text-bone'
                }`}
              >
                Physics
              </button>
            </div>

            <a
              href="#integration"
              className="hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-moss/20 text-sage hover:bg-moss/30 border border-moss/40 text-xs font-medium transition-all"
            >
              <span>Get Access</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
