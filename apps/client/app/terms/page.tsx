import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Users,
  AlertTriangle,
  Ban,
  Scale,
  RefreshCw,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — RetrouveCI",
  description:
    "Consultez les conditions générales d'utilisation de la plateforme RetrouveCI.",
};

const sections = [
  {
    id: "acceptation",
    icon: FileText,
    title: "Acceptation des conditions",
    color: "text-[var(--primary-green)]",
    bg: "bg-[var(--primary-green)]/10",
    content: [
      "En accédant à RetrouveCI et en utilisant nos services, vous acceptez pleinement et sans réserve les présentes conditions générales d'utilisation.",
      "Si vous n'acceptez pas ces conditions, vous devez cesser immédiatement d'utiliser la plateforme. RetrouveCI se réserve le droit de modifier ces conditions à tout moment.",
      "L'utilisation continue du service après modification vaut acceptation des nouvelles conditions.",
    ],
  },
  {
    id: "compte",
    icon: Users,
    title: "Comptes utilisateurs",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    content: [
      "Pour publier une annonce ou commander des stickers QR, vous devez créer un compte en fournissant un numéro de téléphone valide.",
      "Vous êtes responsable de la confidentialité de votre mot de passe et de l'ensemble des activités effectuées depuis votre compte.",
      "Toute information fournie doit être exacte, complète et à jour. RetrouveCI se réserve le droit de suspendre tout compte contenant des informations frauduleuses.",
    ],
  },
  {
    id: "contenu",
    icon: AlertTriangle,
    title: "Contenu des annonces",
    color: "text-[var(--accent-orange)]",
    bg: "bg-[var(--accent-orange)]/10",
    content: [
      "Les annonces publiées doivent correspondre à de véritables objets perdus ou retrouvés sur le territoire ivoirien.",
      "Toute annonce frauduleuse, trompeuse ou visant à escroquer d'autres utilisateurs est strictement interdite et entraînera la suspension immédiate du compte.",
      "RetrouveCI se réserve le droit de supprimer toute annonce jugée inappropriée, sans préavis ni justification.",
    ],
  },
  {
    id: "interdictions",
    icon: Ban,
    title: "Comportements interdits",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    content: [
      "Il est formellement interdit d'utiliser RetrouveCI à des fins commerciales non autorisées, de spam, de harcèlement ou de toute activité illégale.",
      "La publication de contenu offensant, discriminatoire, obscène ou portant atteinte aux droits de tiers est prohibée.",
      "Le scraping automatisé, l'accès non autorisé aux systèmes, ou toute tentative de contournement des mesures de sécurité sont strictement prohibés.",
    ],
  },
  {
    id: "responsabilite",
    icon: Scale,
    title: "Limitation de responsabilité",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    content: [
      "RetrouveCI agit en qualité d'intermédiaire et ne peut être tenu responsable des échanges entre utilisateurs, ni de la véracité des informations publiées.",
      "La plateforme ne garantit pas la récupération des objets signalés. Toute transaction ou remise d'objet se fait sous la seule responsabilité des parties concernées.",
      "En aucun cas RetrouveCI ne pourra être tenu responsable de dommages indirects, accessoires ou consécutifs liés à l'utilisation du service.",
    ],
  },
  {
    id: "modifications",
    icon: RefreshCw,
    title: "Modifications du service",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    content: [
      "RetrouveCI se réserve le droit de modifier, suspendre ou interrompre tout ou partie du service à tout moment, avec ou sans préavis.",
      "Des fonctionnalités peuvent être ajoutées, modifiées ou supprimées selon les besoins de la plateforme et les retours de la communauté.",
      "Les présentes conditions sont régies par le droit ivoirien. Tout litige sera soumis à la compétence exclusive des tribunaux d'Abidjan.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative border-b overflow-hidden">
          <div className="absolute inset-0 pointer-events-none dot-pattern opacity-40" />
          <div className="container mx-auto px-4 py-14 md:py-20 relative">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold mb-5 border">
                <FileText className="w-3.5 h-3.5" />
                Dernière mise à jour : avril 2025
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
                {"Conditions d'utilisation"}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                {
                  "Veuillez lire attentivement ces conditions avant d'utiliser nos services. Elles définissent vos droits et obligations en tant qu'utilisateur de RetrouveCI."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Summary bento */}
        <section className="py-10 border-b">
          <div className="container mx-auto px-4">
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {sections.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="rounded-2xl border bg-background p-4 flex flex-col items-center gap-2 text-center group hover:-translate-y-1 transition-transform duration-200"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}
                    >
                      <Icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <span className="text-xs font-medium leading-snug">
                      {s.title}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-4 md:grid-cols-12">
              {/* Sticky sidebar on desktop */}
              <aside className="hidden md:block md:col-span-3">
                <div className="sticky top-24 rounded-2xl border bg-background p-5 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Sommaire
                  </p>
                  {sections.map((s, i) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      <span className="text-xs font-mono text-muted-foreground/50">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.title}
                    </a>
                  ))}
                </div>
              </aside>

              {/* Sections */}
              <div className="md:col-span-9 space-y-4">
                {sections.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.id}
                      id={s.id}
                      className="rounded-2xl border bg-background p-7 scroll-mt-24"
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div
                          className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}
                        >
                          <Icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <h2 className="text-xl font-bold">{s.title}</h2>
                      </div>
                      <div className="space-y-3">
                        {s.content.map((para, i) => (
                          <p
                            key={i}
                            className="text-sm text-muted-foreground leading-relaxed"
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Contact CTA */}
                <div className="rounded-2xl border bg-muted/30 p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[var(--primary-green)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        Une question sur ces conditions ?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Notre équipe vous répond sous 24h.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary-green)] text-white text-sm font-medium hover:bg-[var(--primary-green-dark)] transition-colors"
                  >
                    Nous contacter
                    <ArrowRight className="w-4 h-4" />
                  </Link>
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
