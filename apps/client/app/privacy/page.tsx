import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Database,
  Eye,
  Share2,
  Lock,
  UserX,
  Cookie,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité — RetrouveCI",
  description:
    "Découvrez comment RetrouveCI collecte, utilise et protège vos données personnelles.",
};

const sections = [
  {
    id: "collecte",
    icon: Database,
    title: "Données collectées",
    color: "text-[var(--primary-green)]",
    bg: "bg-[var(--primary-green)]/10",
    content: [
      "Lors de votre inscription, nous collectons votre numéro de téléphone et votre nom d'affichage. Ces informations sont indispensables au fonctionnement du service.",
      "Lors de la publication d'annonces, nous enregistrons le titre, la description, la localisation approximative, la catégorie et la date de publication de l'objet.",
      "Nous collectons également automatiquement des données techniques : adresse IP, type de navigateur, système d'exploitation et pages visitées, à des fins statistiques et de sécurité.",
    ],
  },
  {
    id: "utilisation",
    icon: Eye,
    title: "Utilisation des données",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    content: [
      "Vos données sont utilisées pour faire fonctionner la plateforme : afficher vos annonces, gérer vos stickers QR et faciliter le contact entre utilisateurs.",
      "Nous pouvons utiliser votre adresse email ou numéro de téléphone pour vous envoyer des notifications relatives à vos annonces (correspondance trouvée, messages reçus).",
      "Les données agrégées et anonymisées peuvent être utilisées pour améliorer nos services, sans jamais permettre de vous identifier individuellement.",
    ],
  },
  {
    id: "partage",
    icon: Share2,
    title: "Partage des données",
    color: "text-[var(--accent-orange)]",
    bg: "bg-[var(--accent-orange)]/10",
    content: [
      "Votre numéro de téléphone n'est jamais affiché publiquement. Il est partagé uniquement si vous choisissez explicitement de le communiquer via WhatsApp depuis une annonce.",
      "Nous ne vendons, ne louons et ne partageons pas vos données personnelles avec des tiers à des fins commerciales.",
      "Dans le cas où la loi ivoirienne l'exige, nous pourrions être contraints de partager certaines informations avec les autorités compétentes.",
    ],
  },
  {
    id: "securite",
    icon: Lock,
    title: "Sécurité des données",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    content: [
      "Toutes les communications entre votre appareil et nos serveurs sont chiffrées via le protocole HTTPS/TLS.",
      "Les mots de passe sont stockés sous forme de hash sécurisé (bcrypt) et ne sont jamais conservés en clair dans nos bases de données.",
      "Nous effectuons des audits de sécurité réguliers et mettons à jour nos systèmes pour protéger vos données contre les accès non autorisés.",
    ],
  },
  {
    id: "droits",
    icon: UserX,
    title: "Vos droits",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    content: [
      "Conformément aux lois applicables, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.",
      "Vous pouvez demander la suppression de votre compte et de l'ensemble de vos données à tout moment depuis les paramètres de votre compte ou en nous contactant directement.",
      "Vous avez également le droit de vous opposer au traitement de vos données à des fins de communication ou d'analyse.",
    ],
  },
  {
    id: "conservation",
    icon: ShieldCheck,
    title: "Conservation des données",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    content: [
      "Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données personnelles sont effacées dans un délai de 30 jours.",
      "Les annonces supprimées sont retirées de l'affichage public immédiatement mais peuvent être conservées dans nos logs pendant 90 jours à des fins de sécurité.",
      "Les données techniques anonymisées peuvent être conservées indéfiniment à des fins statistiques.",
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    content: [
      "RetrouveCI utilise des cookies essentiels au fonctionnement du service (session utilisateur, préférences).",
      "Des cookies analytiques anonymes peuvent être utilisés pour comprendre comment les utilisateurs naviguent sur la plateforme, sans jamais collecter d'informations personnelles identifiables.",
      "Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités du service.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative border-b overflow-hidden">
          <div className="absolute inset-0 pointer-events-none dot-pattern opacity-40" />
          <div className="absolute -top-24 right-0 w-80 h-80 rounded-full bg-[var(--primary-green)]/6 blur-3xl" />
          <div className="container mx-auto px-4 py-14 md:py-20 relative">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-green)]/10 text-[var(--primary-green)] text-xs font-semibold mb-5 border border-[var(--primary-green)]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Dernière mise à jour : avril 2025
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
                Politique de confidentialité
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                La protection de vos données personnelles est une priorité
                absolue pour RetrouveCI. Cette politique explique comment nous
                collectons, utilisons et protégeons vos informations.
              </p>
            </div>
          </div>
        </section>

        {/* Trust bento row */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-[var(--primary-green)] p-6 text-white flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Chiffrement HTTPS</p>
                  <p className="text-white/70 text-sm">
                    Toutes vos données sont chiffrées
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border bg-background p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold">Aucune revente</p>
                  <p className="text-muted-foreground text-sm">
                    Vos données ne sont jamais vendues
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border bg-background p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                  <UserX className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-bold">Suppression sur demande</p>
                  <p className="text-muted-foreground text-sm">
                    Effacement complet en 30 jours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick nav chips */}
        <section className="py-6 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2">
              {sections.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-background text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
                  >
                    <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                    {s.title}
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
              {/* Sticky sidebar */}
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
                        Exercer vos droits
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Contactez-nous pour toute demande relative à vos
                        données.
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
