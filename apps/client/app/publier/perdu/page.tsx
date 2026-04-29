"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ABIDJAN_COMMUNES, CI_VILLES } from "@/lib/ci-locations";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MatchingSuggestions } from "@/components/matching-suggestions";
import { cn } from "@/lib/utils";

const objectTypes = [
  { value: "phone", label: "Téléphone" },
  { value: "keys", label: "Clés" },
  { value: "wallet", label: "Portefeuille" },
  { value: "bag", label: "Sac" },
  { value: "electronics", label: "Électronique" },
  { value: "clothing", label: "Vêtement" },
  { value: "jewelry", label: "Bijoux" },
  { value: "documents", label: "Documents" },
  { value: "other", label: "Autre" },
];

export default function PublierPerduPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    objectType: "",
    description: "",
    ville: "",
    commune: "",
    date: "",
    name: "",
    whatsapp: "",
  });

  const update = (key: keyof typeof formData) => (value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const completedFields = [
    formData.objectType,
    formData.description.length >= 20,
    formData.ville,
    formData.name,
    formData.whatsapp,
  ].filter(Boolean).length;

  const progress = Math.round((completedFields / 5) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.objectType || !formData.description || !formData.ville) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (formData.description.length < 20) {
      toast.error("La description doit contenir au moins 20 caractères");
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Annonce publiée !", {
      description: "Votre annonce est maintenant visible par tous.",
    });
    router.push("/annonces");
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Back */}
          <Link
            href="/publier"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8 max-w-5xl mx-auto">
            {/* ── Form ── */}
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--accent-orange)]/10 shrink-0">
                  <AlertCircle className="w-5 h-5 text-[var(--accent-orange)]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Objet perdu</h1>
                  <p className="text-sm text-muted-foreground">
                    Décrivez votre objet pour que quelqu&apos;un puisse vous
                    aider.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Section: Objet */}
                <div className="bg-background rounded-2xl border p-6 space-y-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Informations sur l&apos;objet
                  </h2>

                  <div className="space-y-2">
                    <Label htmlFor="objectType">
                      Type d&apos;objet{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.objectType}
                      onValueChange={update("objectType")}
                    >
                      <SelectTrigger id="objectType" className="h-11">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {objectTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Couleur, marque, signes distinctifs, contenu..."
                      value={formData.description}
                      onChange={(e) => update("description")(e.target.value)}
                      className="min-h-[110px] resize-none"
                    />
                    <p
                      className={cn(
                        "text-xs",
                        formData.description.length >= 20
                          ? "text-[var(--primary-green)]"
                          : "text-muted-foreground",
                      )}
                    >
                      {formData.description.length >= 20
                        ? "✓ Suffisant"
                        : `Minimum 20 caractères (${formData.description.length}/20)`}
                    </p>
                  </div>

                  {/* Photo */}
                  <div className="space-y-2">
                    <Label>
                      Photo{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        (optionnel)
                      </span>
                    </Label>
                    {imagePreview ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted border">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setImagePreview(null)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/40 transition-colors group">
                        <ImageIcon className="w-7 h-7 text-muted-foreground mb-1.5 group-hover:text-foreground transition-colors" />
                        <span className="text-sm text-muted-foreground">
                          Cliquez pour ajouter une photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Section: Lieu & Date */}
                <div className="bg-background rounded-2xl border p-6 space-y-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Lieu & date de perte
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="ville" className="text-sm">
                        Ville <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.ville}
                        onValueChange={(v) =>
                          setFormData((p) => ({ ...p, ville: v, commune: "" }))
                        }
                      >
                        <SelectTrigger id="ville" className="h-11">
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          {CI_VILLES.map((v) => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="commune" className="text-sm">
                        Commune{" "}
                        {formData.ville !== "Abidjan" && (
                          <span className="text-muted-foreground font-normal text-xs">
                            (optionnel)
                          </span>
                        )}
                      </Label>
                      <Select
                        value={formData.commune}
                        onValueChange={update("commune")}
                        disabled={formData.ville !== "Abidjan"}
                      >
                        <SelectTrigger id="commune" className="h-11">
                          <SelectValue
                            placeholder={
                              formData.ville === "Abidjan"
                                ? "Sélectionnez"
                                : "—"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {ABIDJAN_COMMUNES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-sm">
                      Date de perte{" "}
                      <span className="text-muted-foreground font-normal text-xs">
                        (optionnel)
                      </span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => update("date")(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Section: Contact */}
                <div className="bg-background rounded-2xl border p-6 space-y-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Vos coordonnées
                  </h2>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nom / Prénom</Label>
                    <Input
                      id="name"
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={(e) => update("name")(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 h-11 border rounded-md bg-muted text-muted-foreground text-sm shrink-0">
                        +225
                      </div>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="07 XX XX XX XX"
                        value={formData.whatsapp}
                        onChange={(e) => update("whatsapp")(e.target.value)}
                        className="h-11 flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="sm:flex-1 h-12 bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-dark)] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Publication...
                      </>
                    ) : (
                      "Publier l'annonce"
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-4 lg:sticky lg:top-24 self-start">
              {/* Progress */}
              <div className="bg-background rounded-2xl border p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold">Complétion</p>
                  <span className="text-sm font-bold text-[var(--accent-orange)]">
                    {progress}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-orange)] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <ul className="mt-4 space-y-2">
                  {[
                    { label: "Type d'objet", done: !!formData.objectType },
                    {
                      label: "Description (20 car. min)",
                      done: formData.description.length >= 20,
                    },
                    { label: "Lieu de perte", done: !!formData.ville },
                    { label: "Votre nom", done: !!formData.name },
                    { label: "WhatsApp", done: !!formData.whatsapp },
                  ].map(({ label, done }) => (
                    <li key={label} className="flex items-center gap-2 text-sm">
                      <CheckCircle2
                        className={cn(
                          "w-4 h-4 shrink-0",
                          done
                            ? "text-[var(--accent-orange)]"
                            : "text-muted-foreground/30",
                        )}
                      />
                      <span
                        className={
                          done ? "text-foreground" : "text-muted-foreground"
                        }
                      >
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Matching suggestions or Tips */}
              {formData.objectType && formData.ville ? (
                <MatchingSuggestions
                  objectType={formData.objectType}
                  ville={formData.ville}
                  commune={formData.commune}
                  formType="perdu"
                />
              ) : (
                <div className="bg-[var(--accent-orange)]/5 border border-[var(--accent-orange)]/15 rounded-2xl p-5">
                  <p className="text-sm font-semibold mb-2 text-[var(--accent-orange)]">
                    Conseils
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>Soyez précis sur la couleur et la marque</li>
                    <li>Ajoutez une photo pour de meilleurs résultats</li>
                    <li>Mentionnez le lieu exact de la perte</li>
                    <li>Vos coordonnées restent privées</li>
                  </ul>
                  <p className="text-xs text-muted-foreground/60 mt-3 pt-3 border-t border-[var(--accent-orange)]/10">
                    Remplissez le type d&apos;objet et la ville pour voir les
                    correspondances.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
