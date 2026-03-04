type Props = { percentage: number; size?: number }

export function ProgressCircle({ percentage, size = 120 }: Props) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const strokeColor =
    percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#3b82f6' : '#ef4444'

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e5e7eb"
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
        fill="#111"
        fontSize={24}
        fontWeight="bold"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
      >
        {percentage}%
      </text>
    </svg>
  )
}
