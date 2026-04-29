import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  navigation: [
    { href: "/", label: "Accueil" },
    { href: "/annonces", label: "Annonces" },
    { href: "/stickers", label: "Stickers QR" },
    { href: "/download", label: "Télécharger" },
  ],
  legal: [
    { href: "/about", label: "À propos" },
    { href: "/contact", label: "Contact" },
    { href: "/terms", label: "Conditions" },
    { href: "/privacy", label: "Politique de confidentialité" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="RetrouveCI logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold tracking-tight">
                Retrouve<span className="text-[var(--accent-orange)]">CI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Plateforme de gestion des objets perdus et retrouvés en Côte
              d&apos;Ivoire. Retrouver un objet devient simple.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[var(--primary-green)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground mb-4">
              Informations légales
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[var(--primary-green)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {currentYear} RetrouveCI. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
