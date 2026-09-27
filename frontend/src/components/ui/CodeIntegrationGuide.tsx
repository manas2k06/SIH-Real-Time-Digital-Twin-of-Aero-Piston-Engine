import React, { useState } from 'react';
import { Terminal, Copy, Check, Sparkles } from 'lucide-react';

export const CodeIntegrationGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const snippets = [
    {
      title: 'Import & Render Online 3D Models (.glb)',
      tag: 'React Three Fiber',
      code: `import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';

function RemoteSpecimen({ url }: { url: string }) {
  // Streams and decompresses .glb models on the fly
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.2} />;
}

export function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <Environment preset="studio" />
      <RemoteSpecimen url="/assets/botanical_specimen.glb" />
    </Canvas>
  );
}`,
    },
    {
      title: 'Scroll-Interpolated Camera & Lighting Choreography',
      tag: 'GSAP 3.12',
      code: `import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Coordinates 3D camera pan with page scroll
gsap.to(camera.position, {
  x: 1.8,
  z: 3.5,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '#architecture',
    start: 'top 80%',
    end: 'bottom top',
    scrub: 1.2,
  },
});`,
    },
  ];

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="integration" className="min-h-screen w-full px-6 sm:px-12 md:px-20 py-24 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <p className="font-mono text-xs uppercase tracking-wider text-sage mb-2">
            Developer Reference
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-bone">
            Procedural 3D Web Pipeline
          </h2>
          <p className="text-mist text-sm sm:text-base mt-2 max-w-xl">
            Clean, declarative 3D composition with zero desktop software requirements.
          </p>
        </div>

        <div className="space-y-6">
          {snippets.map((snip, idx) => (
            <div
              key={idx}
              className="panel-minimal rounded-2xl overflow-hidden border border-line shadow-2xl"
            >
              <div className="bg-ink px-6 py-3.5 border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-mist" />
                  <span className="font-mono text-xs text-bone font-medium">{snip.title}</span>
                  <span className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-ink-elevated text-dim border border-line">
                    {snip.tag}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(snip.code, idx)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-line bg-ink-elevated hover:bg-ink-light text-xs font-mono text-mist hover:text-bone transition-all"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-moss" />
                      <span className="text-bone">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 bg-[#05070a]/95 overflow-x-auto">
                <pre className="text-xs font-mono text-mist/90 leading-relaxed">
                  <code>{snip.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Callout box */}
        <div className="mt-10 panel-minimal p-6 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-full bg-moss/20 border border-moss/40 flex items-center justify-center text-sage">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-bone">Ready for production deployments</p>
              <p className="text-[11px] text-mist">TypeScript definitions, WebAssembly physics workers, and GPU fallback shaders.</p>
            </div>
          </div>
          <a
            href="https://github.com/manas2k06/GreenVision-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-bone text-ink text-xs font-medium hover:bg-white transition-all whitespace-nowrap"
          >
            Explore Repo →
          </a>
        </div>
      </div>
    </section>
  );
};
