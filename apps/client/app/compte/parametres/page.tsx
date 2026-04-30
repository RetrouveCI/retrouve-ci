"use client";

import Link from "next/link";
import {
  Settings,
  User,
  Bell,
  Shield,
  Trash2,
  ArrowLeft,
  Smartphone,
  Mail,
  Calendar,
  Check,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { Switch } from "@repo/ui/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ParametresPage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [notifications, setNotifications] = useState({
    whatsapp: true,
    email: false,
    stickerScans: true,
    matches: true,
  });

  if (!isLoading && !isAuthenticated) {
    redirect("/auth");
  }

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Préférences mises à jour");
  };

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
      <main className="flex-1">
        {/* Header */}
        <section className="relative border-b overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-muted/50 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 py-8 relative">
            <Link
              href="/compte"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au compte
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Settings className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Paramètres</h1>
                <p className="text-muted-foreground">
                  Gérez votre compte et vos préférences
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-2xl space-y-6">
            {/* Personal Info */}
            <div className="rounded-2xl border bg-background overflow-hidden">
              <div className="p-5 border-b bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--primary-green)]" />
                  Informations personnelles
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Nom complet</Label>
                      <p className="text-sm text-muted-foreground">
                        {user?.name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-t">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Téléphone</Label>
                      <p className="text-sm text-muted-foreground">
                        +225 {user?.phone}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-[var(--primary-green)]/10 text-[var(--primary-green)] font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Vérifié
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-t">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">
                        {user?.email || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs rounded-lg"
                  >
                    Modifier
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3 border-t">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Membre depuis
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {user?.createdAt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl border bg-background overflow-hidden">
              <div className="p-5 border-b bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[var(--primary-green)]" />
                  Notifications
                </h2>
              </div>
              <div className="p-5 space-y-1">
                <div className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      Notifications WhatsApp
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recevez des alertes directement sur WhatsApp
                    </p>
                  </div>
                  <Switch
                    checked={notifications.whatsapp}
                    onCheckedChange={() => handleNotificationChange("whatsapp")}
                  />
                </div>
                <div className="flex items-center justify-between py-4 border-t">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Notifications Email</p>
                    <p className="text-xs text-muted-foreground">
                      Recevez un résumé par email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={() => handleNotificationChange("email")}
                  />
                </div>
                <div className="flex items-center justify-between py-4 border-t">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Scans de stickers</p>
                    <p className="text-xs text-muted-foreground">
                      Soyez alerté quand quelqu&apos;un scanne vos stickers
                    </p>
                  </div>
                  <Switch
                    checked={notifications.stickerScans}
                    onCheckedChange={() =>
                      handleNotificationChange("stickerScans")
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-4 border-t">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      Correspondances trouvées
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Alertes pour les objets correspondant à vos recherches
                    </p>
                  </div>
                  <Switch
                    checked={notifications.matches}
                    onCheckedChange={() => handleNotificationChange("matches")}
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-2xl border bg-background overflow-hidden">
              <div className="p-5 border-b bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--primary-green)]" />
                  Sécurité
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">Changer le code PIN</p>
                    <p className="text-xs text-muted-foreground">
                      Modifiez votre code de connexion
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Modifier
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3 border-t">
                  <div>
                    <p className="font-medium text-sm">Sessions actives</p>
                    <p className="text-xs text-muted-foreground">
                      Gérez vos appareils connectés
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Voir
                  </Button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 overflow-hidden">
              <div className="p-5 border-b border-destructive/20 bg-destructive/10">
                <h2 className="font-semibold text-destructive flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Zone de danger
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Supprimer mon compte</p>
                    <p className="text-xs text-muted-foreground">
                      Cette action est irréversible et supprimera toutes vos
                      données.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl"
                      >
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action supprimera définitivement votre compte,
                          vos annonces et vos stickers. Cette action est
                          irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">
                          Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={logout}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                        >
                          Supprimer mon compte
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
