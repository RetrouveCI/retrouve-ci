import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  CheckCircle,
  Shield,
  Heart,
  Lock,
  MessageCircle,
  Power,
  Smartphone,
  RefreshCw,
  QrCode,
  Wallet,
  Key,
  Briefcase,
  Laptop,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Stickers QR",
  description:
    "Protégez vos objets avec nos stickers QR intelligents. Activation simple, récupération rapide.",
};

const processSteps = [
  {
    number: 1,
    icon: Package,
    title: "Commandez",
    description:
      "Recevez vos stickers QR avec un code unique pour chaque objet.",
  },
  {
    number: 2,
    icon: QrCode,
    title: "Activez",
    description:
      "Liez le QR code à votre compte en entrant simplement le code.",
  },
  {
    number: 3,
    icon: Shield,
    title: "Protégez",
    description: "Collez le sticker sur vos objets importants.",
  },
  {
    number: 4,
    icon: Heart,
    title: "Récupérez",
    description: "On vous contacte si quelqu'un retrouve votre objet.",
  },
];

const faqItems = [
  {
    question: "Mes coordonnées sont-elles publiques ?",
    answer:
      "Non, jamais. Vos coordonnées ne sont jamais affichées publiquement. Tout contact se fait via notre messagerie sécurisée, qui protège votre vie privée.",
    icon: Lock,
  },
  {
    question: "Comment suis-je contacté si quelqu'un trouve mon objet ?",
    answer:
      "Via l'application RetrouveCI ou par SMS/WhatsApp selon vos préférences de notification configurées dans votre compte.",
    icon: MessageCircle,
  },
  {
    question: "Puis-je désactiver un QR code ?",
    answer:
      "Oui, vous pouvez désactiver un QR code à tout moment depuis votre compte. Le sticker deviendra inactif.",
    icon: Power,
  },
  {
    question: "Que se passe-t-il si je perds mon téléphone ?",
    answer:
      "Connectez-vous depuis n'importe quel autre appareil. Vos QR codes restent liés à votre compte.",
    icon: Smartphone,
  },
  {
    question: "Les stickers sont-ils réutilisables ?",
    answer:
      "Oui, vous pouvez réaffecter un sticker à un autre objet depuis les paramètres de votre compte.",
    icon: RefreshCw,
  },
];

const objectExamples = [
  { icon: Wallet, name: "Portefeuille" },
  { icon: Key, name: "Clés" },
  { icon: Briefcase, name: "Sac" },
  { icon: Laptop, name: "Électronique" },
];

export default function StickersPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full bg-[var(--primary-green)]/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[var(--accent-orange)]/5 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                {/* Text */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-green)]/10 text-[var(--primary-green)] text-xs font-medium mb-5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Technologie QR intelligente
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
                    Protégez vos objets avec un simple{" "}
                    <span className="text-[var(--primary-green)]">QR code</span>
                  </h1>
                  <p className="text-muted-foreground text-lg mb-8 max-w-lg">
                    Collez, scannez, récupérez. Nos stickers QR permettent à
                    quiconque trouve votre objet de vous contacter en toute
                    sécurité.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Button
                      asChild
                      size="lg"
                      className="h-12 px-6 bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white"
                    >
                      <Link href="/stickers/commander">
                        Commander mes stickers
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="h-12 px-6"
                    >
                      <Link href="/auth">Créer un compte</Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    À partir de{" "}
                    <span className="font-semibold text-foreground">
                      1 500 FCFA
                    </span>{" "}
                    · Livraison gratuite
                  </p>
                </div>

                {/* QR Visual */}
                <div className="relative flex-shrink-0">
                  <div className="relative w-52 h-52 md:w-64 md:h-64">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-green)]/20 to-[var(--accent-orange)]/10 rounded-3xl rotate-6" />
                    <div className="absolute inset-0 bg-background rounded-2xl shadow-xl flex items-center justify-center border">
                      <div className="text-center">
                        <QrCode className="w-20 h-20 md:w-28 md:h-28 text-[var(--primary-green)] mx-auto mb-3" />
                        <p className="text-xs text-muted-foreground font-medium">
                          RCI-XXXX-XXXX
                        </p>
                      </div>
                    </div>
                    <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-xl bg-[var(--accent-orange)] shadow-lg flex items-center justify-center">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Comment ca marche
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                De la commande à la récupération, tout est simple et sécurisé.
              </p>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
              {processSteps.map((step) => (
                <div
                  key={step.number}
                  className="group relative bg-background rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[var(--primary-green)]/30"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center group-hover:bg-[var(--primary-green)] transition-colors">
                      <step.icon className="w-5 h-5 text-[var(--primary-green)] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-3xl font-bold text-muted-foreground/30">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What is a Sticker - Bento Card */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-5 gap-4">
                {/* Main card */}
                <div className="md:col-span-3 bg-gradient-to-br from-[var(--primary-green)]/5 to-transparent rounded-2xl border p-8">
                  <h2 className="text-2xl font-bold mb-3">
                    Qu&apos;est-ce qu&apos;un sticker RetrouveCI ?
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Un QR code unique et résistant que vous collez sur vos
                    objets importants. Chaque sticker possède un code unique lié
                    à votre compte, permettant une récupération sécurisée.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {objectExamples.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-background border text-sm"
                      >
                        <item.icon className="w-4 h-4 text-[var(--primary-green)]" />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats cards */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-2xl border p-5 flex flex-col justify-center">
                    <div className="text-3xl font-bold text-[var(--primary-green)]">
                      100%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Anonymat garanti
                    </p>
                  </div>
                  <div className="bg-background rounded-2xl border p-5 flex flex-col justify-center">
                    <div className="text-3xl font-bold text-[var(--accent-orange)]">
                      2 min
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pour activer
                    </p>
                  </div>
                  <div className="col-span-2 bg-[var(--primary-green)] rounded-2xl p-5 text-white">
                    <CheckCircle className="w-6 h-6 mb-2" />
                    <p className="font-medium">
                      Stickers réutilisables et transférables
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Questions fréquentes
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Tout ce que vous devez savoir sur la sécurité et
                l&apos;utilisation de nos stickers.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-background rounded-xl border px-5 data-[state=open]:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--primary-green)]/10 flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-[var(--primary-green)]" />
                        </div>
                        <span className="font-medium text-sm md:text-base">
                          {item.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pl-11 text-muted-foreground text-sm">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary-green)]/10 mb-6">
                <Shield className="w-7 h-7 text-[var(--primary-green)]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Prêt à protéger vos objets ?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Créez un compte gratuitement et commencez à protéger vos objets
                de valeur dès aujourd&apos;hui.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-8 bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white"
                >
                  <Link href="/stickers/commander">
                    Commander maintenant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 px-6"
                >
                  <Link href="/auth">Créer un compte</Link>
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
