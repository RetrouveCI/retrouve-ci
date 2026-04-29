import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  MapPin,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Publier une annonce",
  description:
    "Publiez une annonce pour un objet perdu ou retrouvé en Côte d'Ivoire.",
};

export default function PublierPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative border-b overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-[var(--primary-green)]/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[var(--accent-orange)]/5 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 pt-12 pb-10 relative text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium mb-5 border">
              <Clock className="w-3.5 h-3.5" />
              Publication en moins de 2 minutes
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-balance">
              Que souhaitez-vous
              <br className="hidden sm:block" /> signaler ?
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
              Choisissez le type d&apos;annonce à publier pour commencer.
            </p>
          </div>
        </section>

        {/* Cards */}
        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-5 md:grid-cols-2 max-w-3xl mx-auto">
              {/* Lost */}
              <Link href="/publier/perdu" className="group block">
                <div className="relative h-full rounded-2xl border-2 border-transparent bg-background overflow-hidden transition-all duration-300 group-hover:border-[var(--accent-orange)]/40 group-hover:shadow-lg group-hover:-translate-y-1">
                  {/* Top accent bar */}
                  <div className="h-1.5 bg-[var(--accent-orange)] w-full" />
                  <div className="p-8">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent-orange)]/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <AlertCircle className="w-7 h-7 text-[var(--accent-orange)]" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      J&apos;ai perdu un objet
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Signalez votre perte et laissez la communauté vous aider à
                      le retrouver.
                    </p>
                    <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)]" />
                        Visible instantanément
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)]" />
                        Notifications si quelqu&apos;un retrouve votre objet
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)]" />
                        Contact sécurisé via WhatsApp
                      </li>
                    </ul>
                    <div className="flex items-center gap-2 font-semibold text-[var(--accent-orange)]">
                      Publier un objet perdu
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Found */}
              <Link href="/publier/retrouve" className="group block">
                <div className="relative h-full rounded-2xl border-2 border-transparent bg-background overflow-hidden transition-all duration-300 group-hover:border-[var(--primary-green)]/40 group-hover:shadow-lg group-hover:-translate-y-1">
                  {/* Top accent bar */}
                  <div className="h-1.5 bg-[var(--primary-green)] w-full" />
                  <div className="p-8">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary-green)]/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-7 h-7 text-[var(--primary-green)]" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      J&apos;ai retrouvé un objet
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Aidez le propriétaire à récupérer son bien en publiant
                      votre trouvaille.
                    </p>
                    <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-green)]" />
                        Simple et rapide à remplir
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-green)]" />
                        Le propriétaire vous contactera directement
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-green)]" />
                        Votre numéro reste privé
                      </li>
                    </ul>
                    <div className="flex items-center gap-2 font-semibold text-[var(--primary-green)]">
                      Publier un objet retrouvé
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="max-w-3xl mx-auto mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[var(--primary-green)]" />
                Données protégées
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[var(--primary-green)]" />
                Publication instantanée
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[var(--primary-green)]" />
                Toute la Côte d&apos;Ivoire
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
