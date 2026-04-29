import { LucideIcon } from "lucide-react";

interface StepCardProps {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: StepCardProps) {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Number Badge */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-green)] to-[var(--primary-green-light)] flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-white">{number}</span>
        </div>
        {/* Icon floating */}
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--accent-orange)]" />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
        {description}
      </p>

      {/* Connector line (hidden on mobile, visible on desktop for first two cards) */}
      <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-[var(--primary-green)]/30 to-[var(--primary-green)]/10 -z-10 last:hidden" />
    </div>
  );
}
