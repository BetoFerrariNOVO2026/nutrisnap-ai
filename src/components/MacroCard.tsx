interface MacroCardProps {
  label: string;
  value: number;
  unit: string;
  color: string;
  goal: number;
}

export function MacroCard({ label, value, unit, color, goal }: MacroCardProps) {
  const percentage = Math.min((value / goal) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-12 w-12">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-muted)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="14"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 0.88} 88`}
            className="transition-all duration-1000"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">
          {value}{unit}
        </p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
