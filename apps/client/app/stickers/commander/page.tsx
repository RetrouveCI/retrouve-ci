"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Check,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Phone,
  User,
  QrCode,
  Shield,
  Truck,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Loader2,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";

const DELIVERY_FEE = 1000;
const VALID_COUPONS = ["RETROUVECI", "LIVRAISON0", "WELCOME2025"];

// Pack data
const PACKS = [
  {
    id: "pack-4",
    name: "Starter",
    quantity: 4,
    price: 1500,
    description: "Idéal pour protéger vos essentiels",
    popular: false,
    features: ["4 stickers QR uniques", "Support WhatsApp"],
  },
  {
    id: "pack-8",
    name: "Famille",
    quantity: 8,
    price: 2500,
    description: "Protégez toute la famille",
    popular: true,
    features: [
      "8 stickers QR uniques",
      "Support prioritaire",
      "Économisez 500 FCFA",
    ],
  },
  {
    id: "pack-20",
    name: "Pro",
    quantity: 20,
    price: 7000,
    description: "Pour les entreprises et familles nombreuses",
    popular: false,
    features: [
      "20 stickers QR uniques",
      "Support dédié",
      "Économisez 3000 FCFA",
    ],
  },
];

// Payment methods
const PAYMENT_METHODS = [
  {
    id: "orange-money",
    name: "Orange Money",
    icon: "/payments/orange-money.png",
    color: "#FF6600",
    prefix: "07",
  },
  {
    id: "mtn-momo",
    name: "MTN MoMo",
    icon: "/payments/mtn-momo.png",
    color: "#FFCC00",
    prefix: "05",
  },
  {
    id: "moov-money",
    name: "Moov Money",
    icon: "/payments/moov-money.png",
    color: "#0066CC",
    prefix: "01",
  },
  {
    id: "wave",
    name: "Wave",
    icon: "/payments/wave.png",
    color: "#1DC9FF",
    prefix: "07",
  },
];

type Step = "select" | "delivery" | "payment" | "confirmation";

export default function CommanderPage() {
  const [step, setStep] = useState<Step>("select");
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Abidjan",
    paymentPhone: "",
  });

  const selectedPackData = PACKS.find((p) => p.id === selectedPack);
  const selectedPaymentData = PAYMENT_METHODS.find(
    (p) => p.id === paymentMethod,
  );
  const deliveryFee = appliedCoupon ? 0 : DELIVERY_FEE;
  const totalPrice = (selectedPackData?.price ?? 0) + deliveryFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (VALID_COUPONS.includes(code)) {
      setAppliedCoupon(code);
      setCouponError("");
      toast.success("Coupon appliqué ! Livraison offerte.");
    } else {
      setCouponError("Code invalide ou expiré.");
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handleNext = () => {
    if (step === "select" && selectedPack) {
      setStep("delivery");
    } else if (step === "delivery") {
      if (!formData.name || !formData.phone || !formData.address) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      setStep("payment");
    } else if (step === "payment") {
      if (!paymentMethod || !formData.paymentPhone) {
        toast.error(
          "Veuillez sélectionner un moyen de paiement et entrer votre numéro",
        );
        return;
      }
      handlePayment();
    }
  };

  const handleBack = () => {
    if (step === "delivery") setStep("select");
    else if (step === "payment") setStep("delivery");
    else if (step === "confirmation") setStep("payment");
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsProcessing(false);
    setOrderComplete(true);
    setStep("confirmation");
    toast.success("Paiement effectué avec succès!");
  };

  const stepNumber =
    step === "select"
      ? 1
      : step === "delivery"
        ? 2
        : step === "payment"
          ? 3
          : 4;

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/30">
        {/* Progress bar */}
        <div className="border-b bg-background sticky top-16 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {["Pack", "Livraison", "Paiement", "Confirmation"].map(
                (label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                        i + 1 < stepNumber
                          ? "bg-[var(--primary-green)] text-white"
                          : i + 1 === stepNumber
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i + 1 < stepNumber ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm hidden sm:block",
                        i + 1 === stepNumber
                          ? "font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                    {i < 3 && (
                      <div className="w-8 md:w-16 h-px bg-border mx-2" />
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Step 1: Pack Selection */}
            {step === "select" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-2">
                    Choisissez votre pack
                  </h1>
                  <p className="text-muted-foreground">
                    Sélectionnez le pack qui correspond à vos besoins
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {PACKS.map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedPack(pack.id)}
                      className={cn(
                        "relative text-left rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-lg",
                        selectedPack === pack.id
                          ? "border-[var(--primary-green)] bg-[var(--primary-green)]/5 shadow-md"
                          : "border-border bg-background hover:border-[var(--primary-green)]/30",
                      )}
                    >
                      {pack.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="px-3 py-1 rounded-full bg-[var(--accent-orange)] text-white text-xs font-semibold">
                            Populaire
                          </span>
                        </div>
                      )}

                      {selectedPack === pack.id && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--primary-green)] flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary-green)]/10 mb-3">
                          <Package className="w-6 h-6 text-[var(--primary-green)]" />
                        </div>
                        <h3 className="text-lg font-bold">{pack.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pack.description}
                        </p>
                      </div>

                      <div className="mb-4">
                        <span className="text-3xl font-bold">
                          {formatPrice(pack.price)}
                        </span>
                        <span className="text-muted-foreground ml-1">FCFA</span>
                        <p className="text-sm text-muted-foreground">
                          {pack.quantity} stickers
                        </p>
                      </div>

                      <ul className="space-y-2">
                        {pack.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[var(--primary-green)] shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={!selectedPack}
                    className="h-12 px-8 bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white rounded-xl"
                  >
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Delivery */}
            {step === "delivery" && (
              <div className="grid md:grid-cols-5 gap-8">
                <div className="md:col-span-3 space-y-6">
                  <div>
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleBack();
                      }}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </Link>
                    <h1 className="text-2xl font-bold mb-1">
                      Informations de livraison
                    </h1>
                    <p className="text-muted-foreground">
                      Où souhaitez-vous recevoir vos stickers ?
                    </p>
                  </div>

                  <div className="bg-background rounded-2xl border p-6 space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Kouadio Jean"
                          className="h-12 pl-10 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="07 XX XX XX XX"
                          className="h-12 pl-10 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse de livraison *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          placeholder="Cocody Riviera 2, près de la pharmacie..."
                          className="pl-10 rounded-xl min-h-[80px] resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        placeholder="Abidjan"
                        className="h-12 rounded-xl"
                      />
                    </div>

                    {/* Coupon */}
                    <div className="space-y-2 pt-2 border-t">
                      <Label
                        htmlFor="coupon"
                        className="flex items-center gap-1.5"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        Code promo{" "}
                        <span className="text-muted-foreground font-normal">
                          (livraison offerte)
                        </span>
                      </Label>
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between h-12 px-4 rounded-xl border-2 border-[var(--primary-green)] bg-[var(--primary-green)]/5">
                          <span className="text-sm font-medium text-[var(--primary-green)] flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            {appliedCoupon} — Livraison offerte
                          </span>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            id="coupon"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value);
                              setCouponError("");
                            }}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleApplyCoupon()
                            }
                            placeholder="RETROUVECI"
                            className="h-12 rounded-xl uppercase"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={!couponInput.trim()}
                            className="px-4 h-12 rounded-xl border font-medium text-sm transition-colors hover:bg-muted disabled:opacity-40 shrink-0"
                          >
                            Appliquer
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="text-xs text-destructive">
                          {couponError}
                        </p>
                      )}
                      {!appliedCoupon && (
                        <p className="text-xs text-muted-foreground">
                          Sans coupon, la livraison est facturée{" "}
                          <span className="font-medium">
                            {formatPrice(DELIVERY_FEE)} FCFA
                          </span>{" "}
                          partout à Abidjan.
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={handleNext}
                    className="w-full h-12 bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white rounded-xl"
                  >
                    Continuer vers le paiement
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Order summary */}
                <div className="md:col-span-2">
                  <div className="bg-background rounded-2xl border p-6 sticky top-36">
                    <h3 className="font-semibold mb-4">Récapitulatif</h3>
                    {selectedPackData && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b">
                          <div className="w-12 h-12 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center">
                            <QrCode className="w-6 h-6 text-[var(--primary-green)]" />
                          </div>
                          <div>
                            <p className="font-medium">
                              Pack {selectedPackData.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedPackData.quantity} stickers QR
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Sous-total
                            </span>
                            <span>
                              {formatPrice(selectedPackData.price)} FCFA
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Livraison
                            </span>
                            {deliveryFee === 0 ? (
                              <span className="text-[var(--primary-green)] flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Gratuite
                              </span>
                            ) : (
                              <span>{formatPrice(deliveryFee)} FCFA</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between pt-4 border-t font-semibold text-lg">
                          <span>Total</span>
                          <span>{formatPrice(totalPrice)} FCFA</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === "payment" && !orderComplete && (
              <div className="grid md:grid-cols-5 gap-8">
                <div className="md:col-span-3 space-y-6">
                  <div>
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleBack();
                      }}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </Link>
                    <h1 className="text-2xl font-bold mb-1">Paiement mobile</h1>
                    <p className="text-muted-foreground">
                      Choisissez votre moyen de paiement
                    </p>
                  </div>

                  <div className="bg-background rounded-2xl border p-6 space-y-5">
                    <RadioGroup
                      value={paymentMethod || ""}
                      onValueChange={setPaymentMethod}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {PAYMENT_METHODS.map((method) => (
                          <label
                            key={method.id}
                            className={cn(
                              "relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              paymentMethod === method.id
                                ? "border-[var(--primary-green)] bg-[var(--primary-green)]/5"
                                : "border-border hover:border-[var(--primary-green)]/30",
                            )}
                          >
                            <RadioGroupItem
                              value={method.id}
                              className="sr-only"
                            />
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                              style={{ backgroundColor: method.color }}
                            >
                              <Smartphone className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm">
                              {method.name}
                            </span>
                            {paymentMethod === method.id && (
                              <Check className="w-4 h-4 text-[var(--primary-green)] absolute top-2 right-2" />
                            )}
                          </label>
                        ))}
                      </div>
                    </RadioGroup>

                    {paymentMethod && (
                      <div className="space-y-2 pt-4 border-t">
                        <Label htmlFor="payment-phone">
                          Numéro {selectedPaymentData?.name} *
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="payment-phone"
                            value={formData.paymentPhone}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                paymentPhone: e.target.value,
                              }))
                            }
                            placeholder={`${selectedPaymentData?.prefix} XX XX XX XX`}
                            className="h-12 pl-10 rounded-xl"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Vous recevrez une demande de paiement sur ce numéro.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/20 rounded-xl p-4">
                    <p className="text-sm text-[var(--accent-orange)] font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Paiement sécurisé et crypté
                    </p>
                  </div>

                  <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={
                      !paymentMethod || !formData.paymentPhone || isProcessing
                    }
                    className="w-full h-12 bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white rounded-xl"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        Payer {formatPrice(totalPrice)} FCFA
                        <CreditCard className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Order summary */}
                <div className="md:col-span-2">
                  <div className="bg-background rounded-2xl border p-6 sticky top-36">
                    <h3 className="font-semibold mb-4">Récapitulatif</h3>
                    {selectedPackData && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b">
                          <div className="w-12 h-12 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center">
                            <QrCode className="w-6 h-6 text-[var(--primary-green)]" />
                          </div>
                          <div>
                            <p className="font-medium">
                              Pack {selectedPackData.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedPackData.quantity} stickers QR
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">{formData.name}</p>
                              <p className="text-muted-foreground">
                                {formData.address}
                              </p>
                              <p className="text-muted-foreground">
                                {formData.city}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm pb-4 border-b">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Sous-total
                            </span>
                            <span>
                              {formatPrice(selectedPackData.price)} FCFA
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Livraison
                            </span>
                            {deliveryFee === 0 ? (
                              <span className="text-[var(--primary-green)] flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Gratuite
                              </span>
                            ) : (
                              <span>{formatPrice(deliveryFee)} FCFA</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between pt-2 font-semibold text-lg">
                          <span>Total</span>
                          <span>{formatPrice(totalPrice)} FCFA</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === "confirmation" && orderComplete && (
              <div className="max-w-lg mx-auto text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--primary-green)]/10 mb-6">
                  <CheckCircle2 className="w-10 h-10 text-[var(--primary-green)]" />
                </div>
                <h1 className="text-3xl font-bold mb-3">Commande confirmée!</h1>
                <p className="text-muted-foreground mb-8">
                  Merci pour votre commande. Vous recevrez vos{" "}
                  {selectedPackData?.quantity} stickers QR dans les prochains
                  jours.
                </p>

                <div className="bg-background rounded-2xl border p-6 text-left mb-8">
                  <h3 className="font-semibold mb-4">Détails de la commande</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between pb-3 border-b">
                      <span className="text-muted-foreground">
                        Numéro de commande
                      </span>
                      <span className="font-mono font-medium">
                        RCI-{Date.now().toString().slice(-8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pack</span>
                      <span>
                        {selectedPackData?.name} ({selectedPackData?.quantity}{" "}
                        stickers)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>
                        {selectedPackData &&
                          formatPrice(selectedPackData.price)}{" "}
                        FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      {deliveryFee === 0 ? (
                        <span className="text-[var(--primary-green)]">
                          Gratuite (coupon)
                        </span>
                      ) : (
                        <span>{formatPrice(deliveryFee)} FCFA</span>
                      )}
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted-foreground">Total payé</span>
                      <span>{formatPrice(totalPrice)} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paiement</span>
                      <span>{selectedPaymentData?.name}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t">
                      <span className="text-muted-foreground">Livraison</span>
                      <span>
                        {formData.address}, {formData.city}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href="/compte/stickers">Mes stickers</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white rounded-xl"
                  >
                    <Link href="/">Retour à l&apos;accueil</Link>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-8">
                  Un SMS de confirmation a été envoyé au {formData.phone}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
