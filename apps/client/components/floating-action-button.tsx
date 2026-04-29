"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function FloatingActionButton({
  href,
  label = "Publier",
  className,
}: FloatingActionButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "fixed bottom-6 right-6 z-50 group",
        "flex items-center gap-0 overflow-hidden",
        "h-12 rounded-full",
        "bg-foreground text-background",
        "shadow-lg shadow-foreground/20",
        "ring-1 ring-foreground/10",
        "transition-all duration-300",
        "hover:pr-4 hover:shadow-xl hover:shadow-foreground/25",
        "pr-0 pl-0",
        className,
      )}
    >
      {/* Icon circle */}
      <span className="flex items-center justify-center w-12 h-12 shrink-0">
        <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
      </span>
      {/* Animated label */}
      <span className="text-sm font-semibold whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100 transition-all duration-300 overflow-hidden">
        {label}
      </span>
    </Link>
  );
}
