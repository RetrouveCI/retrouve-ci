import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Users,
  MapPin,
  ShieldCheck,
  Zap,
  QrCode,
  ArrowRight,
  Globe,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "À propos — RetrouveCI",
  description:
    "Découvrez la mission, les valeurs et l'équipe derrière RetrouveCI, la plateforme des objets perdus et retrouvés en Côte d'Ivoire.",
};

const stats = [
  { value: "2 000+", label: "Objets retrouvés" },
  { value: "15 000+", label: "Utilisateurs actifs" },
  { value: "26", label: "Villes couvertes" },
  { value: "94%", label: "Taux de satisfaction" },
];

const values = [
  {
    icon: Heart,
    title: "Solidarité",
    description:
      "Nous croyons que chaque objet retrouvé est un acte de générosité envers un inconnu.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Confiance",
    description:
      "La sécurité des données et la confidentialité de nos utilisateurs sont au cœur de tout ce que nous faisons.",
    color: "text-[var(--primary-green)]",
    bg: "bg-[var(--primary-green)]/10",
  },
  {
    icon: Zap,
    title: "Simplicité",
    description:
      "Une interface pensée pour tous, accessible même sans expertise technologique.",
    color: "text-[var(--accent-orange)]",
    bg: "bg-[var(--accent-orange)]/10",
  },
  {
    icon: Globe,
    title: "Inclusion",
    description:
      "RetrouveCI est conçu pour chaque habitant de Côte d'Ivoire, en ville comme en région.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
];

const team = [
  { name: "Konan Yao", role: "Fondateur & CEO", initials: "KY" },
  { name: "Amina Traoré", role: "Directrice Produit", initials: "AT" },
  { name: "Brice Assi", role: "Lead Développeur", initials: "BA" },
  { name: "Fatou Koné", role: "Community Manager", initials: "FK" },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative border-b overflow-hidden">
          <div className="absolute inset-0 pointer-events-none dot-pattern opacity-40" />
          <div className="absolute -top-24 right-0 w-80 h-80 rounded-full bg-[var(--primary-green)]/8 blur-3xl" />
          <div className="container mx-auto px-4 py-14 md:py-20 relative">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-green)]/10 text-[var(--primary-green)] text-xs font-semibold mb-5 border border-[var(--primary-green)]/20">
                <Heart className="w-3.5 h-3.5" />
                Notre histoire
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 text-balance">
                Retrouver ce qui compte,{" "}
                <span className="text-[var(--primary-green)]">ensemble</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                RetrouveCI est née d&apos;une conviction simple : en Côte
                d&apos;Ivoire, la solidarité peut transformer la perte en
                retrouvaille. Notre plateforme connecte les personnes ayant
                perdu un objet avec celles qui l&apos;ont trouvé.
              </p>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-[var(--primary-green)]">
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission + Bento */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-4 md:grid-cols-12">
              {/* Mission card — large */}
              <div className="md:col-span-7 rounded-2xl border bg-background p-8 flex flex-col justify-between min-h-64">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary-green)]/10 mb-5">
                  <Heart className="w-6 h-6 text-[var(--primary-green)]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Notre mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Réduire la perte définitive d&apos;objets en Côte
                    d&apos;Ivoire grâce à une plateforme communautaire moderne,
                    accessible et fiable. Chaque annonce publiée est une chance
                    de redonner un objet à son propriétaire.
                  </p>
                </div>
              </div>

              {/* Founded card */}
              <div className="md:col-span-5 rounded-2xl border bg-[var(--primary-green)] text-white p-8 flex flex-col justify-between min-h-48">
                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">
                  Fondée en
                </p>
                <div>
                  <p className="text-6xl font-bold">2024</p>
                  <p className="text-white/80 mt-1 text-sm">
                    Abidjan, Côte d&apos;Ivoire
                  </p>
                </div>
              </div>

              {/* QR Technology card */}
              <div className="md:col-span-4 rounded-2xl border bg-background p-8 flex flex-col gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--accent-orange)]/10">
                  <QrCode className="w-6 h-6 text-[var(--accent-orange)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1.5">Stickers QR</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Notre technologie de stickers QR permet d&apos;identifier
                    instantanément l&apos;objet et de contacter son propriétaire
                    sans jamais exposer ses données.
                  </p>
                </div>
              </div>

              {/* Coverage card */}
              <div className="md:col-span-4 rounded-2xl border bg-background p-8 flex flex-col gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10">
                  <MapPin className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1.5">
                    Couverture nationale
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Présent dans 26 villes ivoiriennes, de l&apos;Abidjan
                    cosmopolite aux villes de l&apos;intérieur comme Bouaké,
                    Yamoussoukro et San-Pédro.
                  </p>
                </div>
              </div>

              {/* Community card */}
              <div className="md:col-span-4 rounded-2xl border bg-muted/30 p-8 flex flex-col gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-500/10">
                  <Users className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1.5">
                    Communauté active
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Plus de 15 000 utilisateurs font confiance à RetrouveCI
                    chaque mois pour signaler, chercher et retrouver leurs
                    objets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 md:py-16 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mb-10">
              <h2 className="text-3xl font-bold mb-3">Nos valeurs</h2>
              <p className="text-muted-foreground">
                Les principes qui guident chaque décision que nous prenons.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div
                    key={v.title}
                    className="rounded-2xl border bg-background p-6 group hover:-translate-y-1 transition-transform duration-300"
                  >
                    <div
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${v.bg} mb-4`}
                    >
                      <Icon className={`w-5 h-5 ${v.color}`} />
                    </div>
                    <h3 className="font-bold mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-12 md:py-16 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mb-10">
              <h2 className="text-3xl font-bold mb-3">L&apos;équipe</h2>
              <p className="text-muted-foreground">
                Des passionnés qui croient en la puissance de la communauté.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="rounded-2xl border bg-background p-6 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--primary-green)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--primary-green)]/20 transition-colors">
                    <span className="text-xl font-bold text-[var(--primary-green)]">
                      {member.initials}
                    </span>
                  </div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 border-t">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl bg-[var(--primary-green)] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Rejoignez la communauté
                </h2>
                <p className="text-white/80">
                  Publiez votre première annonce gratuitement dès
                  aujourd&apos;hui.
                </p>
              </div>
              <Link
                href="/publier"
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[var(--primary-green)] font-semibold text-sm hover:bg-white/90 transition-colors"
              >
                Publier une annonce
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
