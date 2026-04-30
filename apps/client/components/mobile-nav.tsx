"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Newspaper,
  PlusCircle,
  QrCode,
  LogIn,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/ui/sheet";
import { cn } from "@repo/ui/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: { href: string; label: string }[];
  currentPath: string;
}

const NAV_ICONS: Record<string, React.ElementType> = {
  "/": Home,
  "/annonces": Newspaper,
  "/publier": PlusCircle,
  "/stickers": QrCode,
};

export function MobileNav({
  open,
  onOpenChange,
  links,
  currentPath,
}: MobileNavProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[300px] sm:w-[360px] flex flex-col p-0"
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-6 pb-5 border-b">
          <SheetTitle className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="RetrouveCI logo"
              width={34}
              height={34}
              className="rounded-xl"
            />
            <span className="text-lg font-bold tracking-tight">
              Retrouve<span className="text-[var(--accent-orange)]">CI</span>
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Menu de navigation principal
          </SheetDescription>
        </SheetHeader>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = NAV_ICONS[link.href] ?? Home;
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-[var(--primary-green)] text-white shadow-sm"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span className="flex-1">{link.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Auth Section */}
        <div className="px-3 pb-6 pt-3 border-t space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/compte"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/60 hover:bg-muted transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--primary-green)]/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[var(--primary-green)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Voir mon compte
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </Button>
            </>
          ) : (
            <Button
              className="w-full h-12 bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white rounded-xl gap-2"
              asChild
            >
              <Link href="/auth" onClick={() => onOpenChange(false)}>
                <LogIn className="w-4 h-4" />
                Se connecter
              </Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
