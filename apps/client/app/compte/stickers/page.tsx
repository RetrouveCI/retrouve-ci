"use client";

import { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Plus,
  Edit2,
  Power,
  PowerOff,
  Calendar,
  ArrowLeft,
  Shield,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth, type Sticker } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

// Sticker Card Component
function StickerCard({
  sticker,
  onToggle,
  onUpdate,
}: {
  sticker: Sticker;
  onToggle: () => void;
  onUpdate: (updates: Partial<Sticker>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(sticker.label);
  const [editObject, setEditObject] = useState(sticker.linkedObject || "");

  const handleSave = () => {
    onUpdate({ label: editLabel, linkedObject: editObject || undefined });
    setIsEditing(false);
    toast.success("Sticker mis à jour");
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-background overflow-hidden transition-all duration-300 hover:shadow-lg",
        sticker.isActive
          ? "border-[var(--primary-green)]/20 hover:border-[var(--primary-green)]/40"
          : "border-border opacity-70 hover:opacity-100",
      )}
    >
      {/* Status bar */}
      <div
        className={cn(
          "h-1.5",
          sticker.isActive ? "bg-[var(--primary-green)]" : "bg-muted",
        )}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  sticker.isActive
                    ? "bg-[var(--primary-green)]/10"
                    : "bg-muted",
                )}
              >
                <QrCode
                  className={cn(
                    "w-5 h-5",
                    sticker.isActive
                      ? "text-[var(--primary-green)]"
                      : "text-muted-foreground",
                  )}
                />
              </div>
              <div>
                <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {sticker.code}
                </code>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] ml-auto",
                  sticker.isActive
                    ? "border-[var(--primary-green)]/30 text-[var(--primary-green)] bg-[var(--primary-green)]/5"
                    : "border-muted text-muted-foreground",
                )}
              >
                {sticker.isActive ? "Actif" : "Inactif"}
              </Badge>
            </div>
            <h4 className="font-semibold text-lg truncate">{sticker.label}</h4>
            {sticker.linkedObject && (
              <p className="text-sm text-muted-foreground truncate mt-0.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                {sticker.linkedObject}
              </p>
            )}
            {sticker.activatedAt && (
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Activé le {sticker.activatedAt}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl gap-1.5 h-9"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Modifier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier le sticker</DialogTitle>
                <DialogDescription>
                  Modifiez les informations de votre sticker {sticker.code}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Nom / Label</Label>
                  <Input
                    id="label"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="Ex: Clés de maison"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="object">Description de l&apos;objet</Label>
                  <Input
                    id="object"
                    value={editObject}
                    onChange={(e) => setEditObject(e.target.value)}
                    placeholder="Ex: Trousseau avec 3 clés"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white rounded-xl"
                >
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex-1 rounded-xl gap-1.5 h-9",
              sticker.isActive
                ? "text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                : "text-[var(--primary-green)] border-[var(--primary-green)]/20 hover:bg-[var(--primary-green)]/10",
            )}
            onClick={onToggle}
          >
            {sticker.isActive ? (
              <>
                <PowerOff className="w-3.5 h-3.5" />
                Désactiver
              </>
            ) : (
              <>
                <Power className="w-3.5 h-3.5" />
                Activer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Activate Sticker Dialog
function ActivateStickerDialog({
  onActivate,
}: {
  onActivate: (code: string, label: string, object?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [linkedObject, setLinkedObject] = useState("");

  const handleSubmit = () => {
    if (!code || !label) {
      toast.error("Veuillez remplir le code et le nom");
      return;
    }
    onActivate(code.toUpperCase(), label, linkedObject || undefined);
    toast.success("Sticker activé avec succès");
    setCode("");
    setLabel("");
    setLinkedObject("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          Activer un sticker
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activer un nouveau sticker</DialogTitle>
          <DialogDescription>
            Entrez le code du sticker QR imprimé sur votre étiquette.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sticker-code">Code du sticker *</Label>
            <Input
              id="sticker-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: RCI-XXXXXX"
              className="font-mono uppercase h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sticker-label">Nom / Label *</Label>
            <Input
              id="sticker-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Clés de voiture"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sticker-object">
              Description de l&apos;objet (optionnel)
            </Label>
            <Input
              id="sticker-object"
              value={linkedObject}
              onChange={(e) => setLinkedObject(e.target.value)}
              placeholder="Ex: Clés Toyota avec porte-clés bleu"
              className="h-11 rounded-xl"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white rounded-xl"
          >
            Activer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function StickersPage() {
  const {
    isAuthenticated,
    isLoading,
    stickers,
    activateSticker,
    deactivateSticker,
    updateSticker,
  } = useAuth();

  if (!isLoading && !isAuthenticated) {
    redirect("/auth");
  }

  const activeStickers = stickers.filter((s) => s.isActive).length;

  const handleToggleSticker = (sticker: Sticker) => {
    if (sticker.isActive) {
      deactivateSticker(sticker.id);
      toast.success("Sticker désactivé");
    } else {
      updateSticker(sticker.id, {
        isActive: true,
        activatedAt: new Date().toISOString().split("T")[0],
      });
      toast.success("Sticker réactivé");
    }
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
            <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-[var(--primary-green)]/5 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 py-8 relative">
            <Link
              href="/compte"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au compte
            </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--primary-green)]/10 flex items-center justify-center">
                  <QrCode className="w-7 h-7 text-[var(--primary-green)]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Mes Stickers QR</h1>
                  <p className="text-muted-foreground">
                    {stickers.length} sticker{stickers.length > 1 ? "s" : ""} ·{" "}
                    {activeStickers} actif{activeStickers > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <ActivateStickerDialog onActivate={activateSticker} />
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--primary-green)]" />
                <span className="text-muted-foreground">
                  Actifs:{" "}
                  <span className="font-semibold text-foreground">
                    {activeStickers}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span className="text-muted-foreground">
                  Inactifs:{" "}
                  <span className="font-semibold text-foreground">
                    {stickers.length - activeStickers}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {stickers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stickers.map((sticker) => (
                  <StickerCard
                    key={sticker.id}
                    sticker={sticker}
                    onToggle={() => handleToggleSticker(sticker)}
                    onUpdate={(updates) => updateSticker(sticker.id, updates)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed bg-muted/30 py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                  <QrCode className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucun sticker</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Activez votre premier sticker QR pour protéger vos objets
                  précieux.
                </p>
                <ActivateStickerDialog onActivate={activateSticker} />
              </div>
            )}

            {/* Order more */}
            <Link
              href="/stickers/commander"
              className="group mt-8 flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-[var(--primary-green)]/30 bg-[var(--primary-green)]/5 p-6 transition-all hover:border-[var(--primary-green)]/50 hover:bg-[var(--primary-green)]/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-green)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Besoin de plus de stickers ?</p>
                  <p className="text-sm text-muted-foreground">
                    À partir de 1 500 FCFA · Livraison gratuite
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-xl border-[var(--primary-green)]/30 text-[var(--primary-green)] hover:bg-[var(--primary-green)]/10 shrink-0"
              >
                Commander
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
