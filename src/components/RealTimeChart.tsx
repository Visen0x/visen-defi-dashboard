import React, { useEffect, useRef, useState } from 'react';
import './RealTimeChart.css';

interface DataPoint {
  timestamp: number;
  value: number;
}

interface RealTimeChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  label?: string;
  unit?: string;
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({
  data,
  color = '#3AFF73',
  height = 150,
  showGrid = true,
  animated = true,
  label,
  unit = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; value: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Calculate bounds
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;
    
    const padding = 20;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(58, 255, 115, 0.1)';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(rect.width - padding, y);
        ctx.stroke();
      }
      
      // Vertical grid lines
      for (let i = 0; i <= 6; i++) {
        const x = padding + (chartWidth / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, rect.height - padding);
        ctx.stroke();
      }
    }

    // Draw area under curve
    ctx.fillStyle = `${color}20`;
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, rect.height - padding);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(rect.width - padding, rect.height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = color;
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw current value
    if (data.length > 0) {
      const currentValue = data[data.length - 1].value;
      ctx.fillStyle = '#fff';
      ctx.font = '12px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(`${currentValue.toFixed(1)}${unit}`, rect.width - padding - 5, padding + 15);
    }

  }, [data, color, height, showGrid]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = 20;
    const chartWidth = rect.width - padding * 2;
    
    // Find closest data point
    const dataIndex = Math.round(((x - padding) / chartWidth) * (data.length - 1));
    if (dataIndex >= 0 && dataIndex < data.length) {
      const point = data[dataIndex];
      setHoverPoint({ x, y, value: point.value });
    }
  };

  return (
    <div className="real-time-chart">
      {label && <div className="chart-label">{label}</div>}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoverPoint(null);
        }}
        onMouseMove={handleMouseMove}
      />
      {hoverPoint && (
        <div 
          className="chart-tooltip"
          style={{
            left: hoverPoint.x,
            top: hoverPoint.y - 30
          }}
        >
          {hoverPoint.value.toFixed(1)}{unit}
        </div>
      )}
    </div>
  );
};

export default RealTimeChart; 