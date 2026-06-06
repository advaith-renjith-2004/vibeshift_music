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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 10;
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    
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

    // Draw Labels on the grid edges
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '700 10px monospace';
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

    // Draw Axis Numbers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '400 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // X-Axis Numbers: 0.00, 0.50, 1.00
    ctx.fillText('0.00', 18, height / 2 + 12);
    ctx.fillText('0.50', width / 2 - 16, height / 2 + 12);
    ctx.fillText('1.00', width - 18, height / 2 + 12);

    // Y-Axis Numbers: 1.00, 0.50, 0.00
    ctx.textAlign = 'left';
    ctx.fillText('1.00', width / 2 + 8, 12);
    ctx.fillText('0.50', width / 2 + 8, height / 2 - 12);
    ctx.fillText('0.00', width / 2 + 8, height - 12);

    // Calculate current pixel position based on inputs (normalized [0, 1])
    const dotX = energy * width;
    const dotY = (1 - valence) * height; // Invert Y coordinate

    // Draw Reticle Targeting Rings (Toxic Red)
    ctx.strokeStyle = 'rgba(255, 0, 60, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 0, 60, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Targeting Crosshairs
    ctx.strokeStyle = 'rgba(255, 0, 60, 0.7)';
    ctx.lineWidth = 1.2;
    
    // Horizontal crosshair ticks
    ctx.beginPath();
    ctx.moveTo(dotX - 15, dotY);
    ctx.lineTo(dotX - 4, dotY);
    ctx.moveTo(dotX + 4, dotY);
    ctx.lineTo(dotX + 15, dotY);
    ctx.stroke();
    
    // Vertical crosshair ticks
    ctx.beginPath();
    ctx.moveTo(dotX, dotY - 15);
    ctx.lineTo(dotX, dotY - 4);
    ctx.moveTo(dotX, dotY + 4);
    ctx.lineTo(dotX, dotY + 15);
    ctx.stroke();

    // Draw Inner red center dot
    ctx.fillStyle = '#ff003c';
    ctx.beginPath();
    ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw coordinate label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`X:${energy.toFixed(3)} Y:${valence.toFixed(3)}`, width - 15, height - 15);
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
          <Activity size={18} className="text-red-500" />
          THE VIBE GRID
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          DRAG THE RETICLE TO MAP COORDINATES
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
