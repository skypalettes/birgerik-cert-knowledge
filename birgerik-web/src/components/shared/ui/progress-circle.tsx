type Props = { percentage: number; size?: number }

export function ProgressCircle({ percentage, size = 120 }: Props) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const strokeColor =
    percentage >= 80 ? '#10b981' : percentage >= 60 ? '#00ffff' : '#ff00ff'

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 6px ${strokeColor})` }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#1e293b"
        strokeWidth={8}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={strokeColor}
        strokeWidth={8}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#e2e8f0"
        fontSize={24}
        fontWeight="bold"
        fontFamily="var(--font-mono)"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
      >
        {percentage}%
      </text>
    </svg>
  )
}
