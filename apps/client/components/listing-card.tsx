import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Clock,
  ArrowRight,
  Package,
  Smartphone,
  Key,
  Wallet,
  Briefcase,
  Laptop,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  dateISO?: string;
  type: "lost" | "found";
  category: string;
  image?: string;
}

interface ListingCardProps {
  listing: Listing;
  variant?: "grid" | "list";
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  phones: Smartphone,
  keys: Key,
  wallets: Wallet,
  bags: Briefcase,
  electronics: Laptop,
  other: Package,
};

const CATEGORY_LABELS: Record<string, string> = {
  phones: "Téléphone",
  keys: "Clés",
  wallets: "Portefeuille",
  bags: "Sac",
  electronics: "Électronique",
  other: "Autre",
};

export function ListingCard({ listing, variant = "grid" }: ListingCardProps) {
  const isLost = listing.type === "lost";
  const CategoryIcon = CATEGORY_ICONS[listing.category] ?? Package;

  if (variant === "list") {
    return (
      <Link href={`/annonces/${listing.id}`} className="block group">
        <article className="flex gap-3 p-3 rounded-2xl border bg-background hover:border-[var(--primary-green)]/30 hover:shadow-md transition-all duration-200">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-muted">
            {listing.image ? (
              <Image
                src={listing.image}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <CategoryIcon className="w-8 h-8 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm leading-snug line-clamp-1 group-hover:text-[var(--primary-green)] transition-colors">
                  {listing.title}
                </h3>
                <span
                  className={cn(
                    "shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                    isLost
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-[var(--primary-green)]",
                  )}
                >
                  {isLost ? "Perdu" : "Retrouvé"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {listing.description}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[140px]">
                  {listing.location}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                {listing.date}
              </span>
              <span className="ml-auto flex items-center gap-1 text-[var(--primary-green)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Voir <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/annonces/${listing.id}`} className="block group h-full">
      <article className="relative flex flex-col h-full rounded-2xl border bg-background overflow-hidden hover:border-[var(--primary-green)]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted shrink-0">
          {listing.image ? (
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-muted/70">
              <CategoryIcon className="w-10 h-10 text-muted-foreground/25" />
              <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-widest">
                {CATEGORY_LABELS[listing.category] ?? "Objet"}
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Type badge */}
          <div
            className={cn(
              "absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm",
              isLost
                ? "bg-red-500 text-white"
                : "bg-[var(--primary-green)] text-white",
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
            {isLost ? "Perdu" : "Retrouvé"}
          </div>

          {/* Category chip top-right */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm border text-[10px] font-medium text-muted-foreground shadow-sm">
            <CategoryIcon className="w-3 h-3" />
            {CATEGORY_LABELS[listing.category] ?? "Autre"}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-3">
          <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-1 group-hover:text-[var(--primary-green)] transition-colors">
            {listing.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2.5 flex-1">
            {listing.description}
          </p>

          {/* Footer meta */}
          <div className="flex items-center justify-between pt-2.5 border-t">
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[110px]">
                  {listing.location}
                </span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3 shrink-0" />
                {listing.date}
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-[var(--primary-green)] translate-x-0 group-hover:translate-x-0.5 transition-transform">
              Voir
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
