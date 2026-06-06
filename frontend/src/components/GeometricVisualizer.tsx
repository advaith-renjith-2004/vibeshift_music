import React, { useRef, useEffect, useState } from 'react';
import type { VibeState } from '../types';

interface GeometricVisualizerProps {
  vibe: VibeState;
}

interface MusicalNote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  alpha: number;
  size: number;
  rotation: number;
  rotSpeed: number;
}

export const GeometricVisualizer: React.FC<GeometricVisualizerProps> = ({ vibe }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; r: number; alpha: number } | null>(null);

  const notesRef = useRef<MusicalNote[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  // Musical note symbols to emit
  const noteSymbols = ['♩', '♪', '♫', '♬', '♭', '♮', '♯', '🎵', '🎶'];

  // Add click ripple and spawn notes
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setRipple({ x: clickX, y: clickY, r: 5, alpha: 1 });

    // Spawn a burst of notes
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      notesRef.current.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        text: noteSymbols[Math.floor(Math.random() * noteSymbols.length)],
        alpha: 1.0,
        size: 10 + Math.random() * 14,
        rotation: Math.random() * Math.PI,
        rotSpeed: -0.05 + Math.random() * 0.1
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setHoverPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.02 * (0.3 + vibe.energy * 1.7);
      
      const width = canvas.width;
      const height = canvas.height;

      // Get computed theme accent color from document root
      const computedColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#ff003c';
      
      // Hex to RGBA converter helper
      const getRGBA = (alpha: number) => {
        let hex = computedColor;
        if (hex.startsWith('#')) {
          hex = hex.slice(1);
        }
        if (hex.length === 3) {
          hex = hex.split('').map(x => x + x).join('');
        }
        const r = parseInt(hex.slice(0, 2), 16) || 255;
        const g = parseInt(hex.slice(2, 4), 16) || 0;
        const b = parseInt(hex.slice(4, 6), 16) || 60;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      // Clear with slight trailing opacity for motion blur
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid Matrix Background
      ctx.strokeStyle = getRGBA(0.025);
      ctx.lineWidth = 1;
      const spacing = 16;
      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw ripple if active
      if (ripple) {
        ctx.strokeStyle = getRGBA(ripple.alpha);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
        ctx.stroke();

        // Update ripple
        setRipple(prev => {
          if (!prev) return null;
          if (prev.alpha <= 0.05) return null;
          return {
            ...prev,
            r: prev.r + 3,
            alpha: prev.alpha - 0.05
          };
        });
      }

      // Target center of geometric shapes
      // If user hovers, pull the center slightly towards the hover position
      let centerX = width / 2;
      let centerY = height / 2;
      if (hoverPos) {
        centerX = centerX * 0.7 + hoverPos.x * 0.3;
        centerY = centerY * 0.7 + hoverPos.y * 0.3;
      }

      // Periodic emission of notes from the center
      if (Math.random() < 0.06 * (0.5 + vibe.energy * 1.5)) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        notesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          text: noteSymbols[Math.floor(Math.random() * noteSymbols.length)],
          alpha: 1.0,
          size: 10 + Math.random() * 10,
          rotation: Math.random() * Math.PI,
          rotSpeed: -0.02 + Math.random() * 0.04
        });
      }

      // Draw Concentric Geometric Shapes (Circles / Squares / Hexagons)
      const numShapes = 6;
      const baseRadius = 25;
      
      // Determine shape style: circle, square, hexagon based on valence
      const shapeType = vibe.valence < 0.35 ? 'square' : vibe.valence > 0.7 ? 'hexagon' : 'circle';

      for (let i = 0; i < numShapes; i++) {
        // Pulse distance scales with time and energy
        const phase = time - i * 0.4;
        const pulse = 1 + Math.sin(phase) * 0.25;
        const radius = (baseRadius + i * 20) * pulse;
        
        ctx.strokeStyle = getRGBA(Math.max(0.1, 0.7 - i * 0.12));
        ctx.lineWidth = i === 0 ? 2 : 1;
        ctx.beginPath();

        if (shapeType === 'circle') {
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        } else if (shapeType === 'square') {
          ctx.rect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        } else if (shapeType === 'hexagon') {
          // Draw hexagon
          for (let j = 0; j < 6; j++) {
            const angle = (j * Math.PI) / 3;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
        }
        ctx.stroke();
      }

      // Draw crosshairs for geometric focus
      ctx.strokeStyle = getRGBA(0.25);
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Horizontal crosshair lines
      ctx.moveTo(centerX - 120, centerY);
      ctx.lineTo(centerX - 15, centerY);
      ctx.moveTo(centerX + 15, centerY);
      ctx.lineTo(centerX + 120, centerY);
      // Vertical crosshair lines
      ctx.moveTo(centerX, centerY - 120);
      ctx.lineTo(centerX, centerY - 15);
      ctx.moveTo(centerX, centerY + 15);
      ctx.lineTo(centerX, centerY + 120);
      ctx.stroke();

      // Update and Draw floating musical notes
      notesRef.current.forEach((note, index) => {
        note.x += note.vx;
        note.y += note.vy;
        note.rotation += note.rotSpeed;
        note.alpha -= 0.012; // slow fade

        if (note.alpha <= 0) {
          notesRef.current.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.translate(note.x, note.y);
        ctx.rotate(note.rotation);
        ctx.font = `${note.size}px "Share Tech Mono", monospace`;
        ctx.fillStyle = getRGBA(note.alpha);
        ctx.fillText(note.text, -note.size / 2, note.size / 2);
        ctx.restore();
      });

      // Monospace readouts overlay inside visualizer box
      ctx.fillStyle = getRGBA(0.85);
      ctx.font = '10px "Share Tech Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`FREQ: ${(50 + vibe.energy * 200).toFixed(1)}HZ`, 15, 20);
      ctx.fillText(`TRIG: ${shapeType.toUpperCase()}`, 15, 32);
      ctx.fillText(`NODES: ${notesRef.current.length}`, 15, 44);

      ctx.textAlign = 'right';
      ctx.fillText(`OSCILLATOR ACTIVE //`, width - 15, 20);
      ctx.fillText(`VAL:${vibe.valence.toFixed(3)}`, width - 15, 32);

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [vibe, hoverPos, ripple]);

  // Handle Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 180; // Set explicit height for panel visualizer
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-100">
      <div className="flex justify-between items-end border-b border-red-950/40 pb-1.5 mb-2">
        <span className="text-[10px] text-red-500 font-mono tracking-wider font-bold">
          SPECTRUM OSCILLOSCOPE //
        </span>
        <span className="text-[9px] text-slate-500 font-mono uppercase">
          CLICK INTERFACE TO STIMULATE
        </span>
      </div>
      <div ref={containerRef} className="border border-red-950 bg-black overflow-hidden relative cursor-pointer" style={{ height: '180px' }}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};
