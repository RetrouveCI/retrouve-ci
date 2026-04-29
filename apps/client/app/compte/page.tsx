"use client";

import Link from "next/link";
import {
  User,
  LogIn,
  LogOut,
  QrCode,
  FileText,
  Settings,
  Eye,
  ChevronRight,
  Smartphone,
  ArrowRight,
  Shield,
  Bell,
  Plus,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

// Not logged in view
function NotLoggedInView() {
  return (
    <main className="flex-1 flex items-center justify-center py-16 md:py-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[var(--primary-green)]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[var(--accent-orange)]/5 blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--primary-green)]/10 mb-6">
            <User className="w-10 h-10 text-[var(--primary-green)]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            Connectez-vous
          </h1>
          <p className="text-muted-foreground mb-8">
            Accédez à votre compte pour gérer vos annonces et vos stickers QR.
          </p>
          <Button
            asChild
            size="lg"
            className="w-full h-12 bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white rounded-xl"
          >
            <Link href="/auth" className="gap-2">
              <LogIn className="w-5 h-5" />
              Se connecter
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Pas encore de compte ?{" "}
            <Link
              href="/auth"
              className="text-[var(--primary-green)] font-medium hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

// Dashboard View
function DashboardView() {
  const { user, logout, stickers, listings } = useAuth();

  const activeStickers = stickers.filter((s) => s.isActive).length;
  const activeListings = listings.filter((l) => l.status === "active").length;
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);

  const menuItems = [
    {
      href: "/compte/stickers",
      icon: QrCode,
      label: "Mes Stickers QR",
      description: "Gérez vos stickers et protégez vos objets",
      stat: `${activeStickers} actif${activeStickers > 1 ? "s" : ""}`,
      color: "primary-green",
      featured: true,
    },
    {
      href: "/compte/annonces",
      icon: FileText,
      label: "Mes Annonces",
      description: "Objets perdus et retrouvés",
      stat: `${activeListings} active${activeListings > 1 ? "s" : ""}`,
      color: "accent-orange",
      featured: true,
    },
    {
      href: "/compte/commandes",
      icon: Package,
      label: "Mes Commandes",
      description: "Historique et suivi de vos commandes",
      stat: "3 commandes",
      color: "primary-green",
      featured: true,
    },
    {
      href: "/compte/parametres",
      icon: Settings,
      label: "Paramètres",
      description: "Informations et notifications",
      color: "muted-foreground",
      featured: false,
    },
  ];

  return (
    <main className="flex-1">
      {/* Profile Header */}
      <section className="relative border-b overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-[var(--primary-green)]/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 rounded-full bg-[var(--accent-orange)]/5 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-10 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-[var(--primary-green)] to-[var(--primary-green-dark)] flex items-center justify-center shadow-lg shadow-[var(--primary-green)]/20">
                  <User className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--primary-green)] border-2 border-background flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">
                  Bienvenue
                </p>
                <h1 className="text-2xl md:text-3xl font-bold">{user?.name}</h1>
                <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Smartphone className="w-4 h-4" />
                  +225 {user?.phone}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10 rounded-xl gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-background border border-border/50 hover:border-[var(--primary-green)]/40 p-4 hover:shadow-sm transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <QrCode className="w-5 h-5 text-[var(--primary-green)]" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold">
                {stickers.length}
              </p>
              <p className="text-xs text-muted-foreground">Stickers total</p>
            </div>
            <div className="rounded-2xl bg-background border border-border/50 hover:border-[var(--primary-green)]/40 p-4 hover:shadow-sm transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-[var(--primary-green)]" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold">{activeStickers}</p>
              <p className="text-xs text-muted-foreground">Stickers actifs</p>
            </div>
            <div className="rounded-2xl bg-background border border-border/50 hover:border-[var(--accent-orange)]/40 p-4 hover:shadow-sm transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-orange)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-[var(--accent-orange)]" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold">{activeListings}</p>
              <p className="text-xs text-muted-foreground">Annonces actives</p>
            </div>
            <div className="rounded-2xl bg-background border border-border/50 hover:border-blue-400/40 p-4 hover:shadow-sm transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold">{totalViews}</p>
              <p className="text-xs text-muted-foreground">Vues totales</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Navigation */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menuItems
              .filter((m) => m.featured)
              .map((item) => {
                const Icon = item.icon;
                const colorVar = `var(--${item.color})`;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative rounded-2xl bg-background border border-border/50 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                      item.color === "primary-green"
                        ? "hover:border-[var(--primary-green)]/40"
                        : "hover:border-[var(--accent-orange)]/40",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0 left-6 right-6 h-1 rounded-b-full transition-all duration-300 group-hover:left-4 group-hover:right-4",
                        item.color === "primary-green"
                          ? "bg-[var(--primary-green)]"
                          : "bg-[var(--accent-orange)]",
                      )}
                    />
                    <div className="flex items-start justify-between gap-4 mt-2">
                      <div className="flex-1">
                        <div
                          className={cn(
                            "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform group-hover:scale-110",
                            item.color === "primary-green"
                              ? "bg-[var(--primary-green)]/10"
                              : "bg-[var(--accent-orange)]/10",
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-6 h-6",
                              item.color === "primary-green"
                                ? "text-[var(--primary-green)]"
                                : "text-[var(--accent-orange)]",
                            )}
                          />
                        </div>
                        <h3 className="text-xl font-bold mb-1">{item.label}</h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {item.description}
                        </p>
                        {item.stat && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
                              item.color === "primary-green"
                                ? "bg-[var(--primary-green)]/10 text-[var(--primary-green)]"
                                : "bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]",
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {item.stat}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all mt-2" />
                    </div>
                  </Link>
                );
              })}
          </div>

          {/* Settings link - smaller */}
          <Link
            href="/compte/parametres"
            className="group flex items-center justify-between gap-4 mt-4 rounded-2xl bg-background border border-border/50 hover:border-border p-5 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Paramètres</h3>
                <p className="text-sm text-muted-foreground">
                  Informations et notifications
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Quick Actions */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href="/publier"
              className="group flex items-center gap-3 rounded-xl border-2 border-dashed border-[var(--accent-orange)]/30 bg-[var(--accent-orange)]/5 p-4 transition-all hover:border-[var(--accent-orange)]/50 hover:bg-[var(--accent-orange)]/10"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-orange)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Nouvelle annonce</p>
                <p className="text-xs text-muted-foreground">
                  Objet perdu ou retrouvé
                </p>
              </div>
            </Link>
            <Link
              href="/stickers"
              className="group flex items-center gap-3 rounded-xl border-2 border-dashed border-[var(--primary-green)]/30 bg-[var(--primary-green)]/5 p-4 transition-all hover:border-[var(--primary-green)]/50 hover:bg-[var(--primary-green)]/10"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-green)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Commander des stickers</p>
                <p className="text-xs text-muted-foreground">
                  Protégez vos objets
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ComptePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-[var(--primary-green)] border-t-transparent rounded-full" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      {isAuthenticated ? <DashboardView /> : <NotLoggedInView />}
      <Footer />
    </>
  );
}
