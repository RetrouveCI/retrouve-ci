import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MapPin,
  Calendar,
  Tag,
  Share2,
  Flag,
  MessageCircle,
  Lock,
  ArrowLeft,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";

// Mock data - in production this would come from a database
const mockListings = [
  {
    id: "1",
    title: "iPhone 14 Pro noir",
    description:
      "Téléphone perdu dans un taxi à Cocody vers 18h. L'écran est légèrement fissuré au coin supérieur droit. Il y a une coque transparente avec des autocollants. Le téléphone était presque déchargé au moment de la perte. Récompense offerte pour toute information permettant de le retrouver.",
    location: "Cocody, Abidjan",
    date: "2 avril 2026",
    type: "lost" as const,
    category: "Téléphone",
    image: "/placeholder.svg?height=600&width=800",
    contact: {
      name: "Kouamé A.",
      method: "WhatsApp",
    },
  },
  {
    id: "2",
    title: "Trousseau de clés avec porte-clés rouge",
    description:
      "Clés trouvées près de la pharmacie du marché de Treichville ce matin. Le trousseau contient 4 clés (2 grandes, 2 petites) avec un porte-clés en forme de coeur rouge. Il y a aussi une petite clé USB bleue attachée. Les clés semblent être pour un appartement ou une maison.",
    location: "Treichville, Abidjan",
    date: "5 avril 2026",
    type: "found" as const,
    category: "Clés",
    contact: {
      name: "Marie K.",
      method: "Application",
    },
  },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = mockListings.find((l) => l.id === id);

  if (!listing) {
    return { title: "Annonce non trouvée" };
  }

  return {
    title: listing.title,
    description: listing.description.substring(0, 160),
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = mockListings.find((l) => l.id === id);

  if (!listing) {
    notFound();
  }

  const isLost = listing.type === "lost";

  return (
    <>
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link
            href="/annonces"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux annonces
          </Link>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Left Column - Image & Details */}
            <div className="lg:col-span-3 space-y-6">
              {/* Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                {listing.image ? (
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <Package className="w-24 h-24 text-muted-foreground/30" />
                  </div>
                )}

                {/* Badge */}
                <Badge
                  className={cn(
                    "absolute top-4 left-4 text-sm px-3 py-1",
                    isLost
                      ? "bg-[var(--accent-orange)] text-white border-0"
                      : "bg-[var(--primary-green)] text-white border-0",
                  )}
                >
                  {isLost ? "Objet perdu" : "Objet retrouvé"}
                </Badge>
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-4">
                  {listing.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-[var(--primary-green)]" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-[var(--primary-green)]" />
                    <span>{listing.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="w-4 h-4 text-[var(--primary-green)]" />
                    <span>{listing.category}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="prose prose-gray max-w-none">
                  <h2 className="text-lg font-semibold mb-3">Description</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Partager
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-destructive"
                >
                  <Flag className="w-4 h-4" />
                  Signaler
                </Button>
              </div>
            </div>

            {/* Right Column - Contact Card */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <Card className="glass-effect border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isLost
                        ? "Vous avez trouvé cet objet ?"
                        : "C'est votre objet ?"}
                    </CardTitle>
                    <CardDescription>
                      {isLost
                        ? "Contactez le propriétaire pour lui rendre."
                        : "Contactez la personne qui l'a trouvé."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full h-12 bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Envoyer un message
                    </Button>

                    {/* Privacy Note */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                      <Lock className="w-5 h-5 text-[var(--primary-green)] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Vos coordonnées restent privées. Tout contact se fait
                        via notre messagerie sécurisée.
                      </p>
                    </div>

                    {/* Contact Info (anonymized) */}
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Publié par{" "}
                        <span className="font-medium text-foreground">
                          {listing.contact.name}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Contact préféré : {listing.contact.method}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Extended Privacy Note */}
                <div className="mt-6 p-4 rounded-xl border border-border bg-background">
                  <h3 className="font-medium mb-2 text-sm">
                    Conseils de sécurité
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>Ne partagez jamais vos informations bancaires</li>
                    <li>Privilégiez les rencontres dans des lieux publics</li>
                    <li>Signalez tout comportement suspect</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
