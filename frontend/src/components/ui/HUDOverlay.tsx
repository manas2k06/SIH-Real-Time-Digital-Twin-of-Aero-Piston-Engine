import React, { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';

interface HUDOverlayProps {
  scrollProgress: number;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({ scrollProgress }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = ((e.clientX / window.innerWidth) * 2 - 1).toFixed(2);
      const normY = (-(e.clientY / window.innerHeight) * 2 + 1).toFixed(2);
      setMousePos({ x: parseFloat(normX), y: parseFloat(normY) });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-8">
      {/* Top Left Subtle Coordinate Stamp */}
      <div className="mt-16 flex items-center gap-3">
        <div className="panel-minimal rounded-full px-3.5 py-1 text-[11px] font-mono text-dim flex items-center gap-3">
          <span>X: {mousePos.x}</span>
          <span className="text-line-strong">|</span>
          <span>Y: {mousePos.y}</span>
        </div>
      </div>

      {/* Bottom Subtle Scroll Status */}
      <div className="flex items-end justify-between w-full">
        <div className="panel-minimal rounded-full px-4 py-1.5 text-[11px] font-mono text-dim flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-moss" />
          <span>STUDIO PBR / 60 FPS</span>
        </div>

        <div className="panel-minimal rounded-full px-4 py-1.5 text-[11px] font-mono text-dim flex items-center gap-2">
          <Compass className="w-3 h-3 text-mist" />
          <span>DEPTH: {(scrollProgress * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};
