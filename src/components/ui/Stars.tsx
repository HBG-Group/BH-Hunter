interface Props {
  value: number;
  size?: number;
}

// Read-only star rating. Rounds to the nearest whole star for a clean look.
export function Stars({ value, size = 16 }: Props) {
  const filled = Math.round(value);
  return (
    <span className="inline-flex" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= filled ? "#f59e0b" : "none"}
          stroke={star <= filled ? "#f59e0b" : "#d4d4d4"}
          strokeWidth={1.5}
        >
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}
