"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type Mode = "login" | "register" | "forgot";
type Step = "phone" | "otp" | "password" | "create-password" | "new-password";

const OTP_EXPIRY_SECONDS = 120;

const MODE_CONFIG: Record<Mode, { title: string; description: string }> = {
  login: {
    title: "Bon retour !",
    description: "Connectez-vous pour accéder à votre compte.",
  },
  register: {
    title: "Créer un compte",
    description: "Rejoignez la communauté RetrouveCI.",
  },
  forgot: {
    title: "Mot de passe oublié",
    description: "Réinitialisez votre mot de passe.",
  },
};

// ── OTP Slot helper ─────────────────────────────────────────────────────────

function OtpSlots({ error }: { error: boolean }) {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <InputOTPSlot
          key={i}
          index={i}
          className={cn(
            "w-11 h-12 text-lg font-semibold border-2 rounded-xl transition-all",
            error
              ? "border-destructive bg-destructive/5"
              : "border-border bg-background data-[active=true]:border-[var(--primary-green)] data-[active=true]:ring-2 data-[active=true]:ring-[var(--primary-green)]/20",
          )}
        />
      ))}
    </>
  );
}

// ── Password input helper ────────────────────────────────────────────────────

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  disabled,
  autoFocus,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder ?? "••••••••"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 pr-11 rounded-xl border-2 border-border bg-background focus:border-[var(--primary-green)] focus:ring-2 focus:ring-[var(--primary-green)]/20 transition-all"
          autoComplete={id === "password" ? "current-password" : "new-password"}
          disabled={disabled}
          autoFocus={autoFocus}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label={
            show ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const router = useRouter();
  const { login, register, resetPassword, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("phone");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");

  // Timer
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) router.push("/compte");
  }, [isAuthenticated, router]);

  // OTP countdown
  useEffect(() => {
    if (step !== "otp") return;
    setTimeLeft(OTP_EXPIRY_SECONDS);
    setCanResend(false);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneNumber.replace(/\s/g, "");
    if (!cleaned || cleaned.length < 8) {
      toast.error("Veuillez entrer un numéro valide");
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);

    toast.success("Code envoyé !", {
      description: "Vérifiez vos SMS ou WhatsApp.",
    });
    setOtp("");
    setOtpError(false);
    setStep("otp");
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Entrez le code complet à 6 chiffres");
      setOtpError(true);
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    if (otp.startsWith("9")) {
      setOtpError(true);
      toast.error("Code incorrect", {
        description: "Vérifiez le code reçu et réessayez.",
      });
      setOtp("");
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    if (mode === "register") setStep("create-password");
    else setStep("new-password");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      setPasswordError("Mot de passe trop court.");
      return;
    }
    setPasswordError("");
    setIsSubmitting(true);
    const result = await login(phoneNumber, password);
    if (!result.success) {
      setPasswordError(result.error ?? "Mot de passe incorrect.");
      setIsSubmitting(false);
      return;
    }
    router.push("/compte");
  };

  const handleCreatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setConfirmError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError("Les mots de passe ne correspondent pas.");
      return;
    }
    setConfirmError("");
    setIsSubmitting(true);
    await register(phoneNumber, newPassword);
    toast.success("Compte créé !", {
      description: "Bienvenue sur RetrouveCI.",
    });
    router.push("/compte");
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setConfirmError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError("Les mots de passe ne correspondent pas.");
      return;
    }
    setConfirmError("");
    setIsSubmitting(true);
    await resetPassword(phoneNumber, newPassword);
    toast.success("Mot de passe réinitialisé !", {
      description: "Vous pouvez maintenant vous connecter.",
    });
    switchMode("login");
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Nouveau code envoyé !");
    setOtp("");
    setOtpError(false);
    setIsSubmitting(false);
    setStep("phone");
    setTimeout(() => setStep("otp"), 0);
  };

  // ── Mode/step helpers ────────────────────────────────────────────────────────

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep("phone");
    setPhoneNumber("");
    setOtp("");
    setOtpError(false);
    setPassword("");
    setPasswordError("");
    setNewPassword("");
    setConfirmPassword("");
    setConfirmError("");
  };

  const goBack = () => {
    if (step === "otp") setStep("phone");
    else if (step === "create-password" || step === "new-password")
      setStep("otp");
  };

  // ── Step titles ──────────────────────────────────────────────────────────────

  const stepTitle = () => {
    if (step === "phone") return MODE_CONFIG[mode].title;
    if (step === "otp") return "Vérification";
    if (step === "create-password") return "Sécurisez votre compte";
    return "Nouveau mot de passe";
  };

  const stepDescription = () => {
    if (step === "phone") return MODE_CONFIG[mode].description;
    if (step === "otp")
      return (
        <>
          Code envoyé au{" "}
          <span className="font-semibold text-foreground">
            +225 {phoneNumber}
          </span>
        </>
      );
    if (step === "create-password")
      return "Choisissez un mot de passe sécurisé.";
    return "Choisissez un nouveau mot de passe.";
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-[var(--primary-green)] to-[var(--primary-green-dark)] overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-white/15 blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <Image
              src="/logo.png"
              alt="RetrouveCI"
              width={48}
              height={48}
              className="rounded-xl transition-transform group-hover:scale-105"
              priority
            />
            <span className="text-2xl font-bold">
              Retrouve<span className="text-white/80">CI</span>
            </span>
          </Link>

          {/* Main message */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4 text-balance">
                Retrouvez ce qui compte pour vous
              </h1>
              <p className="text-lg xl:text-xl text-white/80 max-w-md leading-relaxed">
                La plateforme de confiance pour retrouver vos objets perdus en
                Cote d&apos;Ivoire.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Alertes instantanees</p>
                  <p className="text-sm text-white/70">
                    Soyez notifie des qu&apos;un objet correspond
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Couverture nationale</p>
                  <p className="text-sm text-white/70">
                    Toutes les villes de Cote d&apos;Ivoire
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">100% securise</p>
                  <p className="text-sm text-white/70">
                    Vos donnees restent privees
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div>
              <p className="text-3xl xl:text-4xl font-bold">2,500+</p>
              <p className="text-sm text-white/70">Objets retrouves</p>
            </div>
            <div>
              <p className="text-3xl xl:text-4xl font-bold">15,000+</p>
              <p className="text-sm text-white/70">Utilisateurs actifs</p>
            </div>
            <div>
              <p className="text-3xl xl:text-4xl font-bold">50+</p>
              <p className="text-sm text-white/70">Villes couvertes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="RetrouveCI"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold">
              Retrouve<span className="text-[var(--accent-orange)]">CI</span>
            </span>
          </Link>
        </header>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Back button */}
            <div className="mb-6">
              {step === "phone" ? (
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Link>
              ) : (
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
              )}
            </div>

            {/* Title */}
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                {stepTitle()}
              </h2>
              <p className="text-muted-foreground">{stepDescription()}</p>
            </div>

            {/* ── Step: Phone (+ password for login) ── */}
            {step === "phone" && (
              <form
                onSubmit={
                  mode === "login" ? handleLoginSubmit : handlePhoneSubmit
                }
                className="space-y-5"
              >
                {/* Phone field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Numéro de téléphone
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-4 h-12 border-2 rounded-xl bg-muted/50 text-muted-foreground text-sm font-medium shrink-0">
                      <Image
                        src="/logo.png"
                        alt=""
                        width={18}
                        height={18}
                        className="mr-2 rounded-sm"
                      />
                      +225
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="07 XX XX XX XX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-12 flex-1 rounded-xl border-2 border-border bg-background focus:border-[var(--primary-green)] focus:ring-2 focus:ring-[var(--primary-green)]/20 transition-all"
                      autoComplete="tel"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mode === "login"
                      ? "Entrez le numéro associé à votre compte."
                      : "Un code de vérification vous sera envoyé."}
                  </p>
                </div>

                {/* Password field — login only */}
                {mode === "login" && (
                  <>
                    <PasswordInput
                      id="password"
                      label="Mot de passe"
                      value={password}
                      onChange={(v) => {
                        setPassword(v);
                        setPasswordError("");
                      }}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                    {passwordError && (
                      <p className="text-xs text-destructive -mt-3">
                        {passwordError}
                      </p>
                    )}
                    <div className="flex justify-end -mt-2">
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white font-semibold text-base transition-all hover:scale-[1.02]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      {mode === "login" ? "Connexion..." : "Envoi en cours..."}
                    </>
                  ) : mode === "login" ? (
                    "Se connecter"
                  ) : (
                    "Continuer"
                  )}
                </Button>

                {/* Mode switchers */}
                <div className="pt-2 space-y-3 text-center text-sm">
                  {mode === "login" && (
                    <p className="text-muted-foreground">
                      Pas encore de compte ?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("register")}
                        className="text-[var(--primary-green)] hover:underline font-semibold"
                      >
                        Créer un compte
                      </button>
                    </p>
                  )}
                  {mode === "register" && (
                    <p className="text-muted-foreground">
                      Déjà un compte ?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="text-[var(--primary-green)] hover:underline font-semibold"
                      >
                        Se connecter
                      </button>
                    </p>
                  )}
                  {mode === "forgot" && (
                    <p className="text-muted-foreground">
                      Retour à{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="text-[var(--primary-green)] hover:underline font-semibold"
                      >
                        la connexion
                      </button>
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* ── Step: OTP ── */}
            {step === "otp" && (
              <form onSubmit={handleOTPSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(val) => {
                        setOtp(val);
                        setOtpError(false);
                      }}
                      disabled={isSubmitting}
                      containerClassName="gap-2"
                    >
                      <InputOTPGroup className="gap-2">
                        <OtpSlots error={otpError} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {otpError && (
                    <p className="text-sm text-destructive text-center">
                      Code incorrect. Verifiez et reessayez.
                    </p>
                  )}
                </div>

                {/* Countdown / resend */}
                <div className="flex justify-center">
                  {timeLeft > 0 ? (
                    <div
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full",
                        timeLeft <= 30
                          ? "text-destructive bg-destructive/10"
                          : "text-[var(--primary-green)] bg-[var(--primary-green)]/10",
                      )}
                    >
                      <span className="tabular-nums text-base">
                        {formatTime(timeLeft)}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        avant expiration
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary-green)] hover:text-[var(--primary-green-dark)] transition-colors disabled:opacity-50"
                    >
                      <RefreshCw
                        className={cn(
                          "w-4 h-4",
                          isSubmitting && "animate-spin",
                        )}
                      />
                      Renvoyer le code
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white font-semibold text-base transition-all hover:scale-[1.02]"
                  disabled={isSubmitting || otp.length < 6 || timeLeft === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      Verification...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Confirmer
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* ── Step: Create password (register) ── */}
            {step === "create-password" && (
              <form onSubmit={handleCreatePasswordSubmit} className="space-y-6">
                <PasswordInput
                  id="new-password"
                  label="Choisir un mot de passe"
                  value={newPassword}
                  onChange={(v) => {
                    setNewPassword(v);
                    setConfirmError("");
                  }}
                  placeholder="Minimum 6 caracteres"
                  hint="Au moins 6 caracteres."
                  disabled={isSubmitting}
                  autoFocus
                />
                <PasswordInput
                  id="confirm-password"
                  label="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(v) => {
                    setConfirmPassword(v);
                    setConfirmError("");
                  }}
                  disabled={isSubmitting}
                />
                {confirmError && (
                  <p className="text-sm text-destructive">{confirmError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white font-semibold text-base transition-all hover:scale-[1.02]"
                  disabled={isSubmitting || newPassword.length < 6}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creation du
                      compte...
                    </>
                  ) : (
                    "Creer mon compte"
                  )}
                </Button>
              </form>
            )}

            {/* ── Step: New password (forgot) ── */}
            {step === "new-password" && (
              <form onSubmit={handleNewPasswordSubmit} className="space-y-6">
                <PasswordInput
                  id="new-password"
                  label="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(v) => {
                    setNewPassword(v);
                    setConfirmError("");
                  }}
                  placeholder="Minimum 6 caracteres"
                  hint="Au moins 6 caracteres."
                  disabled={isSubmitting}
                  autoFocus
                />
                <PasswordInput
                  id="confirm-password"
                  label="Confirmer le nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(v) => {
                    setConfirmPassword(v);
                    setConfirmError("");
                  }}
                  disabled={isSubmitting}
                />
                {confirmError && (
                  <p className="text-sm text-destructive">{confirmError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white font-semibold text-base transition-all hover:scale-[1.02]"
                  disabled={isSubmitting || newPassword.length < 6}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      Reinitialisation...
                    </>
                  ) : (
                    "Reinitialiser le mot de passe"
                  )}
                </Button>
              </form>
            )}

            {/* Terms */}
            <div className="mt-8 pt-6 border-t">
              <p className="text-xs text-muted-foreground text-center">
                En continuant, vous acceptez nos{" "}
                <Link
                  href="/terms"
                  className="text-[var(--primary-green)] hover:underline"
                >
                  conditions d&apos;utilisation
                </Link>{" "}
                et notre{" "}
                <Link
                  href="/privacy"
                  className="text-[var(--primary-green)] hover:underline"
                >
                  politique de confidentialite
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
