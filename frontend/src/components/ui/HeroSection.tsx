import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal } from 'lucide-react';

interface HeroSectionProps {
  onExplorePhysics: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplorePhysics }) => {
  return (
    <section className="min-h-screen w-full flex items-center justify-start px-6 sm:px-12 md:px-20 pt-24 relative z-10">
      <div className="max-w-2xl">
        {/* Subtle Mono Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-ink-elevated/70 text-mist text-[11px] font-mono mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-moss inline-block" />
          <span className="tracking-wider uppercase">Field Telemetry · YOLOv8 Autonomous Model</span>
        </motion.div>

        {/* Editorial Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-display text-4xl sm:text-6xl lg:text-[68px] font-bold tracking-[-0.03em] leading-[1.04] text-bone mb-6"
        >
          Spatial vision for <br />
          <span className="font-serif italic font-normal text-sage">living landscapes.</span>
        </motion.h1>

        {/* Narrative Copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-base sm:text-lg text-mist leading-relaxed mb-8 max-w-xl font-normal"
        >
          Real-time canopy density estimation, biodiversity indexing, and spatial vegetation telemetry — mapped frame-by-frame with low-latency edge inference and interactive 3D reconstruction.
        </motion.p>

        {/* Understated CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-wrap items-center gap-3.5"
        >
          <a
            href="#architecture"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-bone text-ink font-medium text-sm hover:bg-white transition-all duration-200"
          >
            <span>Read Architecture</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <button
            onClick={onExplorePhysics}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line bg-ink-elevated/50 text-bone hover:border-line-strong hover:bg-ink-elevated text-sm transition-all duration-200"
          >
            <Terminal className="w-4 h-4 text-mist" />
            <span>Interactive Wasm Physics</span>
          </button>
        </motion.div>

        {/* Technical Specification Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-3 gap-6 mt-14 pt-8 border-t border-line max-w-lg text-left"
        >
          <div>
            <p className="font-mono text-xs text-dim uppercase">Inference Speed</p>
            <p className="text-xl sm:text-2xl font-display font-semibold text-bone mt-1">11.4 ms</p>
            <p className="text-[11px] text-mist mt-0.5">YOLOv8 Edge Core</p>
          </div>

          <div>
            <p className="font-mono text-xs text-dim uppercase">Precision (mAP)</p>
            <p className="text-xl sm:text-2xl font-display font-semibold text-bone mt-1">94.8%</p>
            <p className="text-[11px] text-mist mt-0.5">Forest Canopy v3</p>
          </div>

          <div>
            <p className="font-mono text-xs text-dim uppercase">Spatial Engine</p>
            <p className="text-xl sm:text-2xl font-display font-semibold text-bone mt-1">PBR 3D</p>
            <p className="text-[11px] text-mist mt-0.5">WebGL & WebGPU</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
