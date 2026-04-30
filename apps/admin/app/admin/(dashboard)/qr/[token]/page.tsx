"use client";

import { use, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/admin/topbar";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";
import { mockQRTokens, mockEvents } from "@/lib/mock-data";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Ban,
  Pause,
  AlertTriangle,
  CheckCircle,
  Package,
  Calendar,
  User,
  Box,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export default function QRTokenDetailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: tokenId } = use(params);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  const token = mockQRTokens.find((t) => t.token === tokenId);
  const tokenEvents = mockEvents.filter((e) => e.token === tokenId);

  if (!token) {
    return (
      <>
        <TopBar title="Token non trouvé" />
        <div className="pt-16">
          <div className="p-4 lg:p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Token non trouvé</h2>
              <p className="mt-2 text-muted-foreground">
                Le QR Token demandé n&apos;existe pas ou a été supprimé.
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/qr">Retour aux tokens</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const qrUrl = `https://retrouveci.com/q/${token.token}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié`);
  };

  const handleRevoke = () => {
    toast.success(`Token ${token.token} révoqué`);
    setShowRevokeDialog(false);
  };

  return (
    <>
      <TopBar title={`Token ${token.token}`} />
      <div className="pt-16">
        <div className="p-4 lg:p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - QR Code & Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Détails du Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 p-6">
                      <div className="rounded-lg bg-white p-4">
                        <QRCodeSVG value={qrUrl} size={180} />
                      </div>
                      <p className="mt-4 font-mono text-lg font-semibold">
                        {token.token}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(token.token, "Token")}
                        >
                          <Copy className="mr-2 h-3 w-3" />
                          Copier
                        </Button>
                      </div>
                    </div>

                    {/* Token Info */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Statut actuel
                        </p>
                        <Badge
                          className={`mt-1 ${
                            token.status === "activated"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : token.status === "generated"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : "bg-red-100 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {token.status === "activated"
                            ? "Activé"
                            : token.status === "generated"
                              ? "Généré"
                              : "Révoqué"}
                        </Badge>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Utilisateur lié
                          </p>
                          {token.userName ? (
                            <Link
                              href={`/admin/users/${token.userId}`}
                              className="text-primary hover:underline"
                            >
                              {token.userName}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Box className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Objet lié
                          </p>
                          <p>{token.linkedObject || "-"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Batch</p>
                          <p>{token.batch}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Créé le
                          </p>
                          <p>
                            {format(new Date(token.createdAt), "dd MMMM yyyy", {
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>

                      {token.activatedAt && (
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Activé le
                            </p>
                            <p>
                              {format(
                                new Date(token.activatedAt),
                                "dd MMMM yyyy",
                                { locale: fr },
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {token.revokedAt && (
                        <div className="flex items-start gap-3">
                          <Ban className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Révoqué le
                            </p>
                            <p>
                              {format(
                                new Date(token.revokedAt),
                                "dd MMMM yyyy",
                                { locale: fr },
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* URL Section */}
                  <div className="mt-6 rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      URL du QR Code
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 truncate text-sm">{qrUrl}</code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(qrUrl, "URL")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={qrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Historique</CardTitle>
                </CardHeader>
                <CardContent>
                  {tokenEvents.length > 0 ||
                  token.activatedAt ||
                  token.createdAt ? (
                    <div className="space-y-4">
                      {tokenEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 border-l-2 border-primary/20 pl-4 pb-4"
                        >
                          <div
                            className={`rounded-full p-1.5 ${
                              event.type === "scan"
                                ? "bg-green-100"
                                : event.type === "contact"
                                  ? "bg-orange-100"
                                  : event.type === "activation"
                                    ? "bg-blue-100"
                                    : event.type === "revocation"
                                      ? "bg-red-100"
                                      : "bg-gray-100"
                            }`}
                          >
                            <CheckCircle
                              className={`h-3 w-3 ${
                                event.type === "scan"
                                  ? "text-green-600"
                                  : event.type === "contact"
                                    ? "text-orange-600"
                                    : event.type === "activation"
                                      ? "text-blue-600"
                                      : event.type === "revocation"
                                        ? "text-red-600"
                                        : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium capitalize">
                              {event.type === "scan"
                                ? "Scanné"
                                : event.type === "contact"
                                  ? "Contact établi"
                                  : event.type === "activation"
                                    ? "Activé par l'utilisateur"
                                    : event.type === "generation"
                                      ? "Généré"
                                      : event.type === "revocation"
                                        ? "Révoqué"
                                        : event.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(event.timestamp),
                                "dd MMM yyyy 'à' HH:mm",
                                { locale: fr },
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                      {token.activatedAt &&
                        !tokenEvents.some((e) => e.type === "activation") && (
                          <div className="flex items-start gap-3 border-l-2 border-primary/20 pl-4 pb-4">
                            <div className="rounded-full bg-green-100 p-1.5">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Activé par l&apos;utilisateur
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  new Date(token.activatedAt),
                                  "dd MMM yyyy",
                                  { locale: fr },
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      <div className="flex items-start gap-3 border-l-2 border-primary/20 pl-4">
                        <div className="rounded-full bg-blue-100 p-1.5">
                          <Package className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Généré ({token.batch})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(token.createdAt), "dd MMM yyyy", {
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucun événement enregistré
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {token.status === "activated" && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-orange-600 hover:text-orange-700"
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Désactiver temporairement
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={() => setShowRevokeDialog(true)}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Révoquer définitivement
                      </Button>
                    </>
                  )}
                  {token.status === "generated" && (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={() => setShowRevokeDialog(true)}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Marquer comme révoqué
                    </Button>
                  )}
                  {token.status === "revoked" && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Ce token a été révoqué et ne peut plus être utilisé.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/qr">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour aux tokens
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Revoke Confirmation */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer ce token ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le token{" "}
              <strong>{token.token}</strong> ne pourra plus être utilisé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Révoquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
