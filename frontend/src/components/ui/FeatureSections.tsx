import React from 'react';
import { motion } from 'framer-motion';
import { Focus, Eye, Cpu, Cuboid, Orbit, Compass } from 'lucide-react';

export const FeatureSections: React.FC = () => {
  const chapters = [
    {
      num: '01',
      title: 'Neural Canopy Segmentation',
      category: 'Inference Layer',
      desc: 'Optimized YOLOv8 backbone performing real-time multi-class vegetation classification, biomass health indexing, and automated anomaly flagging under adverse lighting.',
      icon: Focus,
      metric: '512×512 Tensor input',
    },
    {
      num: '02',
      title: 'Procedural Botanical Spatial 3D',
      category: 'Three.js / WebGL',
      desc: 'Physics-based transmission shaders and procedural botanical structures rendered directly in-browser with physical lighting and neutral studio reflection mapping.',
      icon: Cuboid,
      metric: 'Physical PBR Transmission',
    },
    {
      num: '03',
      title: 'Wasm Collision Dynamics',
      category: 'Rapier Physics',
      desc: 'High-precision WebAssembly rigid body simulations executing ground plane collision detection, restitution, and gravity physics without frame drops.',
      icon: Orbit,
      metric: '60 Hz Deterministic Loop',
    },
    {
      num: '04',
      title: 'Web Asset Ingestion Pipeline',
      category: 'GLTF / Draco Loader',
      desc: 'Stream and parse open-access .glb assets from online repositories with automatic mesh optimization, Level of Detail (LOD), and zero Blender dependencies.',
      icon: Compass,
      metric: 'Meshopt & Draco Decompression',
    },
    {
      num: '05',
      title: 'Edge Sensor Synchronization',
      category: 'Hardware Interface',
      desc: 'Synchronous telemetry ingestion matching drone footage timestamps with spatial coordinates, wind vector matrices, and elevation profiles.',
      icon: Eye,
      metric: '< 4ms Socket Latency',
    },
    {
      num: '06',
      title: 'Scroll-Synchronized Trajectory',
      category: 'GSAP Choreography',
      desc: 'Smooth interpolated camera dolly, focal distance adjustments, and section pins tied directly to scroll progress with sub-pixel precision.',
      icon: Cpu,
      metric: 'Lenis Momentum Easing',
    },
  ];

  return (
    <section id="architecture" className="min-h-screen w-full px-6 sm:px-12 md:px-20 py-32 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <p className="font-mono text-xs uppercase tracking-wider text-sage mb-3">
            System Architecture
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-bone leading-[1.08]">
            Built around motion and precision, <br />
            <span className="font-serif italic font-normal text-mist">engineered for the field.</span>
          </h2>
          <p className="text-mist mt-5 text-sm sm:text-base leading-relaxed">
            Every layer of the platform is designed for responsiveness — from low-latency computer vision tensors to hardware-accelerated 3D spatial representations.
          </p>
        </div>

        {/* Feature Grid with Scrolltide Style Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {chapters.map((chapter, idx) => {
            const Icon = chapter.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="panel-minimal p-7 rounded-2xl flex flex-col justify-between group transition-all duration-300 hover:bg-ink-elevated/80"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-xs text-dim tracking-widest">{chapter.num}</span>
                    <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full border border-line bg-ink text-mist">
                      {chapter.category}
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-ink-elevated border border-line flex items-center justify-center text-bone mb-4 group-hover:border-moss transition-colors">
                    <Icon className="w-4 h-4 text-sage" />
                  </div>

                  <h3 className="font-display text-lg font-semibold text-bone mb-2">
                    {chapter.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-mist leading-relaxed font-normal">
                    {chapter.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-line flex items-center justify-between text-xs font-mono text-dim">
                  <span>Specification</span>
                  <span className="text-mist font-medium">{chapter.metric}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
