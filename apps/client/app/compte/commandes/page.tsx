"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronRight,
  QrCode,
  MapPin,
  CreditCard,
  Calendar,
  Eye,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  pack: {
    name: string;
    quantity: number;
    price: number;
  };
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  deliveryAddress: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "CMD-2025-001847",
    date: "2025-04-20",
    pack: { name: "Famille", quantity: 8, price: 2500 },
    deliveryFee: 0,
    total: 2500,
    status: "delivered",
    paymentMethod: "Orange Money",
    deliveryAddress: "Cocody Riviera 3, Abidjan",
    trackingNumber: "TRK789456123",
  },
  {
    id: "2",
    orderNumber: "CMD-2025-002134",
    date: "2025-04-23",
    pack: { name: "Starter", quantity: 4, price: 1500 },
    deliveryFee: 1000,
    total: 2500,
    status: "shipped",
    paymentMethod: "MTN MoMo",
    deliveryAddress: "Plateau, Rue du Commerce, Abidjan",
    estimatedDelivery: "25 Avril 2025",
    trackingNumber: "TRK987654321",
  },
  {
    id: "3",
    orderNumber: "CMD-2025-002201",
    date: "2025-04-24",
    pack: { name: "Pro", quantity: 20, price: 7000 },
    deliveryFee: 1000,
    total: 8000,
    status: "confirmed",
    paymentMethod: "Wave",
    deliveryAddress: "Yopougon Sicogi, Abidjan",
    estimatedDelivery: "27 Avril 2025",
  },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  pending: {
    label: "En attente",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  confirmed: {
    label: "Confirmée",
    icon: CheckCircle2,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  shipped: {
    label: "En livraison",
    icon: Truck,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  delivered: {
    label: "Livrée",
    icon: CheckCircle2,
    color: "text-[var(--primary-green)]",
    bgColor: "bg-[var(--primary-green)]/10",
  },
  cancelled: {
    label: "Annulée",
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
};

const FILTER_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmées" },
  { value: "shipped", label: "En livraison" },
  { value: "delivered", label: "Livrées" },
  { value: "cancelled", label: "Annulées" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR").format(price);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Order detail modal/drawer
function OrderDetail({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-background rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Commande</p>
            <p className="font-bold">{order.orderNumber}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <XCircle className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-5 space-y-6">
          {/* Status */}
          <div
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl",
              statusConfig.bgColor,
            )}
          >
            <StatusIcon className={cn("w-6 h-6", statusConfig.color)} />
            <div>
              <p className={cn("font-semibold", statusConfig.color)}>
                {statusConfig.label}
              </p>
              {order.estimatedDelivery && order.status !== "delivered" && (
                <p className="text-sm text-muted-foreground">
                  Livraison estimée : {order.estimatedDelivery}
                </p>
              )}
            </div>
          </div>

          {/* Progress tracker */}
          {order.status !== "cancelled" && (
            <div className="flex items-center justify-between">
              {["confirmed", "shipped", "delivered"].map((step, idx) => {
                const steps = ["confirmed", "shipped", "delivered"];
                const currentIdx = steps.indexOf(order.status);
                const isCompleted = idx <= currentIdx;
                const isCurrent = step === order.status;
                return (
                  <div key={step} className="flex-1 flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        isCompleted
                          ? "bg-[var(--primary-green)] text-white"
                          : "bg-muted text-muted-foreground",
                        isCurrent && "ring-4 ring-[var(--primary-green)]/20",
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    {idx < 2 && (
                      <div
                        className={cn(
                          "flex-1 h-1 mx-1 rounded-full",
                          idx < currentIdx
                            ? "bg-[var(--primary-green)]"
                            : "bg-muted",
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pack info */}
          <div className="rounded-2xl border p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center">
                <QrCode className="w-7 h-7 text-[var(--primary-green)]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Pack {order.pack.name}</p>
                <p className="text-sm text-muted-foreground">
                  {order.pack.quantity} stickers QR
                </p>
              </div>
              <p className="font-bold">{formatPrice(order.pack.price)} FCFA</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 py-2 border-b">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-muted-foreground">Date de commande</p>
                <p className="font-medium">{formatDate(order.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2 border-b">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-muted-foreground">Adresse de livraison</p>
                <p className="font-medium">{order.deliveryAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2 border-b">
              <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-muted-foreground">Mode de paiement</p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
            </div>
            {order.trackingNumber && (
              <div className="flex items-start gap-3 py-2 border-b">
                <Truck className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-muted-foreground">Numéro de suivi</p>
                  <p className="font-medium font-mono">
                    {order.trackingNumber}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="rounded-2xl bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatPrice(order.pack.price)} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Livraison</span>
              {order.deliveryFee === 0 ? (
                <span className="text-[var(--primary-green)]">Gratuite</span>
              ) : (
                <span>{formatPrice(order.deliveryFee)} FCFA</span>
              )}
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(order.total)} FCFA</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {order.status === "delivered" && (
              <Button
                asChild
                className="flex-1 h-12 rounded-xl bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white"
              >
                <Link href="/compte/stickers">Voir mes stickers</Link>
              </Button>
            )}
            {(order.status === "pending" || order.status === "confirmed") && (
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                Annuler la commande
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={onClose}
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
        <Package className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Vous n&apos;avez pas encore passé de commande de stickers QR.
      </p>
      <Button
        asChild
        className="h-11 rounded-xl bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white"
      >
        <Link href="/stickers/commander" className="gap-2">
          <Plus className="w-4 h-4" />
          Commander des stickers
        </Link>
      </Button>
    </div>
  );
}

export default function CommandesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // In real app, orders would come from useAuth() or API
  const orders = mockOrders;
  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-[var(--primary-green)] border-t-transparent rounded-full" />
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Connectez-vous pour voir vos commandes.
            </p>
            <Button
              asChild
              className="bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white"
            >
              <Link href="/auth">Se connecter</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Header */}
        <section className="border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/compte"
                className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Mes Commandes</h1>
                <p className="text-muted-foreground text-sm">
                  {orders.length} commande{orders.length > 1 ? "s" : ""} au
                  total
                </p>
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    filter === option.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Orders list */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            {filteredOrders.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status];
                  const StatusIcon = statusConfig.icon;
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="w-full text-left group rounded-2xl border bg-background p-4 transition-all hover:border-[var(--primary-green)]/30 hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-[var(--primary-green)]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <QrCode className="w-6 h-6 text-[var(--primary-green)]" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold truncate">
                              Pack {order.pack.name}
                            </p>
                            <span
                              className={cn(
                                "shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                                statusConfig.bgColor,
                                statusConfig.color,
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {order.pack.quantity} stickers &middot;{" "}
                            {order.orderNumber}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(order.date)}
                            </p>
                            <p className="font-bold text-sm">
                              {formatPrice(order.total)} FCFA
                            </p>
                          </div>
                        </div>

                        {/* Chevron */}
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 mt-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/stickers/commander"
                className="group flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-[var(--primary-green)]/30 bg-[var(--primary-green)]/5 p-5 transition-all hover:border-[var(--primary-green)]/50 hover:bg-[var(--primary-green)]/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[var(--primary-green)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Nouvelle commande</p>
                    <p className="text-sm text-muted-foreground">
                      Commander des stickers QR
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}
