import { LucideIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: "green" | "orange";
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor = "green",
}: FeatureCardProps) {
  return (
    <div className="group relative glass-effect rounded-2xl p-4 md:p-6 elevated-card border border-white/20 shadow-sm transition-all duration-300 hover:shadow-lg">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--primary-green)]/0 to-[var(--accent-orange)]/0 group-hover:from-[var(--primary-green)]/5 group-hover:to-[var(--accent-orange)]/5 transition-all duration-300" />

      <div className="relative">
        {/* Icon */}
        <div
          className={cn(
            "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 animate-float",
            iconColor === "green"
              ? "bg-[var(--primary-green)]/10"
              : "bg-[var(--accent-orange)]/10",
          )}
        >
          <Icon
            className={cn(
              "w-6 h-6 transition-transform group-hover:scale-110 group-hover:rotate-3",
              iconColor === "green"
                ? "text-[var(--primary-green)]"
                : "text-[var(--accent-orange)]",
            )}
          />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-1.5 text-foreground">
          {title}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
