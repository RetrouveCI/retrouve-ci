"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, User, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/annonces", label: "Annonces" },
  { href: "/publier", label: "Publier" },
  { href: "/stickers", label: "Stickers QR" },
];

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b shadow-sm"
          : "bg-background border-b",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <Image
            src="/logo.png"
            alt="RetrouveCI logo"
            width={36}
            height={36}
            className="rounded-xl transition-transform group-hover:scale-105"
            priority
          />
          <span className="text-xl font-bold tracking-tight">
            Retrouve<span className="text-[var(--accent-orange)]">CI</span>
          </span>
        </Link>

        {/* Desktop Navigation - Pill style */}
        <nav className="hidden md:flex items-center">
          <div className="flex items-center gap-1 p-1 rounded-full bg-muted/50">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                  pathname === link.href
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm" className="gap-2 h-9">
                <Link href="/compte">
                  <div className="w-7 h-7 rounded-full bg-[var(--primary-green)]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[var(--primary-green)]" />
                  </div>
                  <span className="max-w-[100px] truncate font-medium">
                    {user?.name}
                  </span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-muted-foreground hover:text-destructive h-9 w-9"
                aria-label="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              asChild
              size="sm"
              className="h-9 px-4 bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white rounded-full"
            >
              <Link href="/auth" className="gap-2">
                <LogIn className="w-4 h-4" />
                Connexion
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mounted && (
        <MobileNav
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          links={navLinks}
          currentPath={pathname}
        />
      )}
    </header>
  );
}
