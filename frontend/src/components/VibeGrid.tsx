import React, { useRef, useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

interface VibeGridProps {
  energy: number;
  valence: number;
  onChange: (energy: number, valence: number) => void;
}

export const VibeGrid: React.FC<VibeGridProps> = ({ energy, valence, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Redraw the canvas when dimensions or coordinates change
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw Grid Lines (Subtle background grid)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 8;
    for (let i = 1; i < gridSize; i++) {
      const x = (width / gridSize) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      const y = (height / gridSize) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Major Center Crosshairs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]); // Dashed line for technical look
    
    // Horizontal Center
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Vertical Center
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw Labels on the grid edges
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '500 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // X Axis: Left "Chill" -> Right "Energy"
    ctx.fillText('CHILL', 35, height / 2 - 12);
    ctx.fillText('ENERGY', width - 35, height / 2 - 12);

    // Y Axis: Bottom "Melancholy" -> Top "Euphoria"
    ctx.save();
    ctx.translate(width / 2 + 12, 25);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('EUPHORIA', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2 + 12, height - 25);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('MELANCHOLY', 0, 0);
    ctx.restore();

    // Calculate current pixel position based on inputs (normalized [0, 1])
    const dotX = energy * width;
    const dotY = (1 - valence) * height; // Invert Y coordinate

    // Draw Radar rings around the dot
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
    ctx.beginPath();
    ctx.arc(dotX, dotY, 40, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Glowing Dot Shadow
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 15;
    
    // Draw outer glowing core
    ctx.fillStyle = 'rgba(139, 92, 246, 0.6)';
    ctx.beginPath();
    ctx.arc(dotX, dotY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Draw Inner white hot core
    ctx.shadowBlur = 0; // Turn off shadow blur for inner core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw subtle coordinate display overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`X: ${energy.toFixed(2)}  Y: ${valence.toFixed(2)}`, width - 15, height - 15);
  };

  // Resize canvas to fill the wrapper element
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      draw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [energy, valence]);

  // Handle Dragging / Clicks
  const handleInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Normalize coordinates clamped between 0.0 and 1.0
    const rawEnergy = Math.max(0, Math.min(1, x / rect.width));
    const rawValence = Math.max(0, Math.min(1, 1 - y / rect.height)); // Invert Y

    onChange(rawEnergy, rawValence);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    handleInteraction(e.clientX, e.clientY);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    if (e.touches.length > 0) {
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  return (
    <div className="vibe-grid-container">
      <div className="vibe-grid-header">
        <h3 className="vibe-grid-title">
          <Activity size={18} className="text-purple-400" />
          The Vibe Grid
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          Drag the dot to map your soundscape
        </span>
      </div>

      <div ref={containerRef} className="vibe-grid-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="vibe-grid-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
        />
      </div>
    </div>
  );
};
