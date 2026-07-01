interface SparklineProps {
  data: number[];
  color: string;
  className?: string;
}

export const Sparkline = ({ data, color, className }: SparklineProps) => {
  if (data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 100;
  const H = 32;
  const step = W / (data.length - 1 || 1);
  const points = data
    .map((v, i) => `${(i * step).toFixed(2)},${(H - ((v - min) / range) * H).toFixed(2)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={className}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
