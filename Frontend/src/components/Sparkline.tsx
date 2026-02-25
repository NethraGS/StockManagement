import React from "react";

interface SparklineProps {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, positive, width = 80, height = 30 }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${positive ? "up" : "down"}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={positive ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#grad-${positive ? "up" : "down"})`} />
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Sparkline;
