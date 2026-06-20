export interface Pack {
  id: string;
  name: string;
  tagline: string;
  price: number;
  qty: number;
  popular?: boolean;
  features: string[];
}

export const PACKS: Pack[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Idéal pour protéger vos essentiels',
    price: 1500,
    qty: 4,
    features: ['4 stickers QR uniques', 'Support WhatsApp'],
  },
  {
    id: 'famille',
    name: 'Famille',
    tagline: 'Protégez toute la famille',
    price: 2500,
    qty: 8,
    popular: true,
    features: ['8 stickers QR uniques', 'Support prioritaire', 'Économisez 500 FCFA'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Pour les entreprises et familles nombreuses',
    price: 7000,
    qty: 20,
    features: ['20 stickers QR uniques', 'Support dédié', 'Économisez 3000 FCFA'],
  },
];

export interface PaymentMethod {
  id: string;
  label: string;
  color: string;
  dark?: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'orange', label: 'Orange Money', color: '#FF6B00' },
  { id: 'mtn', label: 'MTN MoMo', color: '#FFCC00', dark: true },
  { id: 'moov', label: 'Moov Money', color: '#1A57C4' },
  { id: 'wave', label: 'Wave', color: '#1DC4F2', dark: true },
];

export const DELIVERY_FEE = 1000;
export const PROMO_CODE = 'RETROUVECI';
