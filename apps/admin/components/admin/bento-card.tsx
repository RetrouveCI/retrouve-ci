"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface BentoCardProps {
  title?: string;
  value?: number | string;
  change?: number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
  variant?: "stat" | "highlight" | "table" | "content";
  children?: React.ReactNode;
}

export function BentoCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  className,
  variant = "stat",
  children,
}: BentoCardProps) {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString("fr-FR") : value;

  if (variant === "stat") {
    return (
      <Card
        className={cn(
          "group relative overflow-hidden p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
          className,
        )}
      >
        <div
          className={cn(
            "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-110",
            iconBgColor,
          )}
        />
        <div className="relative flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {formattedValue}
            </p>
            {typeof change === "number" && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  change > 0
                    ? "bg-green-100 text-green-700"
                    : change < 0
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700",
                )}
              >
                {change > 0 ? "+" : ""}
                {change}%
              </span>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110",
                iconBgColor,
              )}
            >
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (variant === "highlight") {
    return (
      <Card
        className={cn(
          "group relative overflow-hidden bg-primary p-5 text-primary-foreground transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
          className,
        )}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white_0%,_transparent_60%)]" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {formattedValue}
            </p>
            {typeof change === "number" && (
              <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
                {change > 0 ? "+" : ""}
                {change}%
              </span>
            )}
          </div>
          {Icon && (
            <div className="rounded-xl bg-white/20 p-2.5 transition-transform duration-300 group-hover:scale-110">
              <Icon className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
        {children}
      </Card>
    );
  }

  if (variant === "table") {
    return <Card className={cn("overflow-hidden", className)}>{children}</Card>;
  }

  // content variant — generic card with padding
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md",
        className,
      )}
    >
      {children}
    </Card>
  );
}
