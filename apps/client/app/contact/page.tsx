"use client";

import { useState } from "react";
import {
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Send,
  Clock,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Comment publier une annonce ?",
    a: "Rendez-vous sur la page « Publier », choisissez le type d'annonce (perdu ou retrouvé), remplissez le formulaire et validez. Votre annonce est visible instantanément.",
  },
  {
    q: "Mes données personnelles sont-elles protégées ?",
    a: "Oui. Votre numéro de téléphone n'est jamais affiché publiquement. Tout contact se fait via notre messagerie sécurisée.",
  },
  {
    q: "Comment fonctionnent les stickers QR ?",
    a: "Chaque sticker contient un QR code unique lié à votre profil. Quand quelqu'un scanne le sticker sur votre objet, il peut vous contacter directement sans voir vos informations personnelles.",
  },
  {
    q: "Comment supprimer mon annonce ?",
    a: "Connectez-vous à votre compte, accédez à la section « Mes annonces » et cliquez sur « Supprimer ». L'annonce disparaît immédiatement.",
  },
  {
    q: "RetrouveCI est-il disponible en dehors d'Abidjan ?",
    a: "Oui ! La plateforme couvre 26 villes ivoiriennes dont Bouaké, Yamoussoukro, Daloa, San-Pédro et bien d'autres.",
  },
];

const channels = [
  {
    icon: Mail,
    title: "Email",
    value: "contact@retrouveci.ci",
    detail: "Réponse sous 24h ouvrées",
    color: "text-[var(--primary-green)]",
    bg: "bg-[var(--primary-green)]/10",
    href: "mailto:contact@retrouveci.ci",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp",
    value: "+225 07 00 00 00 00",
    detail: "Lun–Ven, 8h–18h",
    color: "text-[var(--accent-orange)]",
    bg: "bg-[var(--accent-orange)]/10",
    href: "https://wa.me/2250700000000",
  },
  {
    icon: MapPin,
    title: "Adresse",
    value: "Cocody, Abidjan",
    detail: "Côte d'Ivoire",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    href: null,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative border-b overflow-hidden">
          <div className="absolute inset-0 pointer-events-none dot-pattern opacity-40" />
          <div className="absolute -top-24 left-1/2 w-96 h-96 rounded-full bg-[var(--accent-orange)]/6 blur-3xl -translate-x-1/2" />
          <div className="container mx-auto px-4 py-14 md:py-20 relative text-center max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] text-xs font-semibold mb-5 border border-[var(--accent-orange)]/20">
              <MessageSquare className="w-3.5 h-3.5" />
              Nous sommes à votre écoute
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
              Contactez-nous
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Une question, un signalement ou une suggestion ? Notre équipe vous
              répond rapidement.
            </p>
          </div>
        </section>

        {/* Bento grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-4 md:grid-cols-12">
              {/* Contact form — large */}
              <div className="md:col-span-7 rounded-2xl border bg-background p-8">
                <h2 className="text-xl font-bold mb-6">Envoyer un message</h2>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--primary-green)]/10 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-[var(--primary-green)]" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-1">
                        Message envoyé !
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Nous vous répondrons dans les 24 heures.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setForm({
                          name: "",
                          email: "",
                          subject: "",
                          message: "",
                        });
                      }}
                      className="text-sm text-[var(--primary-green)] hover:underline"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Konan Yao"
                          value={form.name}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, name: e.target.value }))
                          }
                          className="w-full h-11 px-4 rounded-xl border bg-muted/30 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30 focus:border-[var(--primary-green)]/50 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Email</label>
                        <input
                          type="email"
                          required
                          placeholder="vous@exemple.ci"
                          value={form.email}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, email: e.target.value }))
                          }
                          className="w-full h-11 px-4 rounded-xl border bg-muted/30 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30 focus:border-[var(--primary-green)]/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Sujet</label>
                      <input
                        type="text"
                        required
                        placeholder="Comment pouvons-nous vous aider ?"
                        value={form.subject}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, subject: e.target.value }))
                        }
                        className="w-full h-11 px-4 rounded-xl border bg-muted/30 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30 focus:border-[var(--primary-green)]/50 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Message</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Décrivez votre demande..."
                        value={form.message}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, message: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border bg-muted/30 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30 focus:border-[var(--primary-green)]/50 transition-all resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Envoyer le message
                    </button>
                  </form>
                )}
              </div>

              {/* Right column */}
              <div className="md:col-span-5 flex flex-col gap-4">
                {/* Availability card */}
                <div className="rounded-2xl border bg-[var(--primary-green)] p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold">Disponibilité</h3>
                  </div>
                  <div className="space-y-1.5 text-sm text-white/90">
                    <div className="flex justify-between">
                      <span>Lundi – Vendredi</span>
                      <span className="font-medium">8h – 18h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi</span>
                      <span className="font-medium">9h – 13h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche</span>
                      <span className="font-medium text-white/60">Fermé</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-xs text-white/70">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse-soft" />
                    Temps de réponse moyen : 2h
                  </div>
                </div>

                {/* Channels */}
                {channels.map((ch) => {
                  const Icon = ch.icon;
                  const content = (
                    <div className="rounded-2xl border bg-background p-5 flex items-center gap-4 group hover:-translate-y-0.5 transition-transform duration-200">
                      <div
                        className={`w-11 h-11 rounded-xl ${ch.bg} flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`w-5 h-5 ${ch.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {ch.title}
                        </p>
                        <p className="font-semibold text-sm truncate">
                          {ch.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ch.detail}
                        </p>
                      </div>
                    </div>
                  );
                  return ch.href ? (
                    <a
                      key={ch.title}
                      href={ch.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={ch.title}>{content}</div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-2 text-center">
                Questions fréquentes
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Les réponses aux questions les plus posées.
              </p>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border bg-background overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="font-medium text-sm">{faq.q}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
                          openFaq === i && "rotate-180",
                        )}
                      />
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
