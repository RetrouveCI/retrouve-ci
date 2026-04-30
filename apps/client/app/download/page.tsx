import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Apple,
  Smartphone,
  QrCode,
  Bell,
  Shield,
  Zap,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Télécharger l'app — RetrouveCI",
  description:
    "Téléchargez l'application RetrouveCI pour iOS et Android. Scannez les QR codes et gérez vos objets facilement.",
};

export default function DownloadPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative border-b overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[var(--primary-green)]/6 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[var(--accent-orange)]/5 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 pt-14 pb-12 relative">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              {/* Left */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border text-xs font-medium text-muted-foreground mb-5">
                  <Smartphone className="w-3.5 h-3.5" />
                  Application mobile — Bientôt disponible
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 text-balance">
                  Retrouvez vos objets{" "}
                  <span className="text-[var(--primary-green)]">plus vite</span>
                </h1>
                <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
                  Scannez les stickers QR, recevez des alertes instantanées et
                  gérez tous vos objets depuis votre téléphone.
                </p>

                {/* Store buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-10">
                  <button
                    disabled
                    className="flex items-center gap-3 px-5 py-3 rounded-xl bg-foreground text-background opacity-60 cursor-not-allowed"
                  >
                    <Apple className="w-6 h-6 shrink-0" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-widest opacity-70">
                        Bientôt sur
                      </p>
                      <p className="text-sm font-semibold">App Store</p>
                    </div>
                  </button>
                  <button
                    disabled
                    className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--primary-green)] text-white opacity-60 cursor-not-allowed"
                  >
                    <Smartphone className="w-6 h-6 shrink-0" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-widest opacity-70">
                        Bientôt sur
                      </p>
                      <p className="text-sm font-semibold">Google Play</p>
                    </div>
                  </button>
                </div>

                {/* Mini stats */}
                <div className="flex items-center justify-center md:justify-start gap-8 border-t pt-6">
                  {[
                    { value: "50K+", label: "Utilisateurs" },
                    { value: "4.8", label: "Note", suffix: "★" },
                    { value: "15K+", label: "Objets retrouvés" },
                  ].map((s) => (
                    <div key={s.label} className="text-center md:text-left">
                      <p className="text-xl font-bold">
                        {s.value}
                        {s.suffix ?? ""}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — phone mockup */}
              <div className="relative flex justify-center">
                <div className="relative">
                  <div className="relative w-[260px] h-[520px] rounded-[2.8rem] bg-foreground p-3 shadow-2xl">
                    <div className="w-full h-full rounded-[2.3rem] bg-background overflow-hidden relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground rounded-b-2xl z-10" />
                      <div className="h-full pt-9 px-4 pb-4 flex flex-col gap-3">
                        {/* App header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Image
                              src="/logo.png"
                              alt="logo"
                              width={24}
                              height={24}
                              className="rounded-md"
                            />
                            <span className="font-bold text-xs">
                              RetrouveCI
                            </span>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-muted" />
                        </div>
                        {/* Scanner */}
                        <div className="flex-1 rounded-2xl bg-muted/40 border border-dashed border-[var(--primary-green)]/30 flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center">
                            <QrCode className="w-6 h-6 text-[var(--primary-green)]" />
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Scanner un QR code
                          </p>
                          {/* Scan corners */}
                          <div className="absolute w-16 h-16 border-l-2 border-t-2 border-[var(--primary-green)] top-16 left-16 rounded-tl-lg pointer-events-none" />
                          <div className="absolute w-16 h-16 border-r-2 border-t-2 border-[var(--primary-green)] top-16 right-16 rounded-tr-lg pointer-events-none" />
                        </div>
                        {/* Notification pill */}
                        <div className="flex items-center gap-2 bg-[var(--primary-green)]/10 border border-[var(--primary-green)]/20 rounded-xl px-3 py-2">
                          <CheckCircle2 className="w-4 h-4 text-[var(--primary-green)] shrink-0" />
                          <p className="text-[10px] font-medium">
                            Objet retrouvé à Cocody !
                          </p>
                        </div>
                        {/* Bottom nav */}
                        <div className="flex justify-around bg-muted/30 rounded-2xl p-1.5">
                          {[QrCode, MapPin, Bell].map((Icon, i) => (
                            <div
                              key={i}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center ${i === 0 ? "bg-[var(--primary-green)]" : ""}`}
                            >
                              <Icon
                                className={`w-4 h-4 ${i === 0 ? "text-white" : "text-muted-foreground"}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -left-14 top-24 p-2.5 rounded-xl bg-background border shadow-lg animate-float">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[var(--primary-green)]/10 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary-green)]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold">Retrouvé !</p>
                        <p className="text-[9px] text-muted-foreground">
                          Il y a 2 min
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-12 bottom-28 p-2.5 rounded-xl bg-background border shadow-lg animate-float-delayed">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[var(--accent-orange)]/10 flex items-center justify-center">
                        <Bell className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold">Alerte</p>
                        <p className="text-[9px] text-muted-foreground">
                          Yopougon
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bento Features ── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Une app pensée pour retrouver vos objets rapidement et en toute
                sécurité.
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {/* Large — Scan QR */}
              <div className="sm:col-span-2 group p-8 rounded-2xl border bg-background hover:border-[var(--primary-green)]/40 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <QrCode className="w-6 h-6 text-[var(--primary-green)]" />
                  </div>
                  <span className="text-xs text-muted-foreground border rounded-full px-2 py-1">
                    Phare
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Scan QR instantané</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                  Pointez votre caméra vers n&apos;importe quel sticker
                  RetrouveCI pour identifier l&apos;objet et contacter son
                  propriétaire en moins de 3 secondes.
                </p>
              </div>

              {/* Notifications */}
              <div className="group p-6 rounded-2xl border bg-background hover:border-[var(--accent-orange)]/40 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-orange)]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Bell className="w-6 h-6 text-[var(--accent-orange)]" />
                </div>
                <h3 className="font-bold mb-2">Alertes push</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Notifié immédiatement quand votre objet est scanné.
                </p>
              </div>

              {/* Shield */}
              <div className="group p-6 rounded-2xl border bg-background hover:border-[var(--primary-green)]/40 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-[var(--primary-green)]" />
                </div>
                <h3 className="font-bold mb-2">Contact sécurisé</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Via WhatsApp, sans révéler votre numéro.
                </p>
              </div>

              {/* Offline */}
              <div className="group p-6 rounded-2xl border bg-background hover:border-[var(--primary-green)]/40 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-[var(--primary-green)]" />
                </div>
                <h3 className="font-bold mb-2">Mode hors-ligne</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Vos stickers accessibles même sans connexion.
                </p>
              </div>

              {/* Coverage — spans 1 col */}
              <div className="group p-6 rounded-2xl border bg-[var(--primary-green)] text-white hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Toute la Côte d&apos;Ivoire</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Couverture nationale, de Abidjan à Bouaké.
                </p>
              </div>

              {/* Rating */}
              <div className="group p-6 rounded-2xl border bg-background hover:border-[var(--accent-orange)]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-[var(--accent-orange)] text-[var(--accent-orange)]"
                    />
                  ))}
                </div>
                <blockquote className="text-sm text-muted-foreground italic leading-relaxed mb-4">
                  &ldquo;J&apos;ai retrouvé mon téléphone en 20 minutes grâce à
                  RetrouveCI. Incroyable !&rdquo;
                </blockquote>
                <p className="text-xs font-medium">— Kouamé A., Abidjan</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Steps ── */}
        <section className="py-16 md:py-20 border-y bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Comment ça marche ?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Trois étapes pour protéger vos objets.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  step: "01",
                  icon: Smartphone,
                  title: "Téléchargez l'app",
                  desc: "Installez RetrouveCI depuis l'App Store ou Google Play.",
                },
                {
                  step: "02",
                  icon: QrCode,
                  title: "Collez vos stickers",
                  desc: "Placez les stickers QR sur vos objets et activez-les dans l'app.",
                },
                {
                  step: "03",
                  icon: Bell,
                  title: "Restez serein",
                  desc: "Recevez des alertes dès que votre sticker est scanné.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative p-6 rounded-2xl border bg-background text-center"
                >
                  <div className="text-5xl font-bold text-muted-foreground/10 mb-3">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-[var(--primary-green)]" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  {i < 2 && (
                    <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 z-10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center p-10 rounded-2xl border bg-background relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[var(--primary-green)]/5 blur-2xl pointer-events-none" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] text-xs font-medium mb-5 border border-[var(--accent-orange)]/20">
                <Clock className="w-3.5 h-3.5" />
                En attendant l&apos;application mobile
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Utilisez la version web
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Consultez les annonces, publiez vos objets et commandez vos
                stickers QR dès maintenant.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="h-11 px-6 bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white rounded-xl"
                >
                  <Link href="/annonces" className="gap-2">
                    Voir les annonces
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 px-6 rounded-xl"
                >
                  <Link href="/stickers">Commander des stickers</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
