"use client";

import { use, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockPosts } from "@/lib/mock-data";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Eye,
  MessageSquare,
  Check,
  EyeOff,
  Trash2,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [showHideDialog, setShowHideDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hideReason, setHideReason] = useState("");

  const post = mockPosts.find((p) => p.id === parseInt(id));

  if (!post) {
    return (
      <>
        <TopBar title="Post non trouvé" />
        <div className="pt-16">
          <div className="p-4 lg:p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Post non trouvé</h2>
              <p className="mt-2 text-muted-foreground">
                Le post demandé n&apos;existe pas ou a été supprimé.
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/posts">Retour aux posts</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleApprove = () => {
    toast.success(`Post "${post.title}" approuvé et publié`);
  };

  const handleHide = () => {
    toast.success(`Post "${post.title}" masqué`);
    setShowHideDialog(false);
    setHideReason("");
  };

  const handleDelete = () => {
    toast.success(`Post "${post.title}" supprimé`);
    setShowDeleteDialog(false);
    router.push("/admin/posts");
  };

  return (
    <>
      <TopBar title="Détail du post" />
      <div className="pt-16">
        <div className="p-4 lg:p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Post Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image */}
              <Card>
                <CardContent className="p-0">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-64 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-muted flex flex-col items-center justify-center rounded-t-lg">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Aucune image disponible
                      </p>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold">{post.title}</h2>
                        <Badge
                          className={`mt-2 ${
                            post.type === "lost"
                              ? "bg-red-100 text-red-700 hover:bg-red-100"
                              : "bg-green-100 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {post.type === "lost" ? "Perdu" : "Retrouvé"}
                        </Badge>
                      </div>
                    </div>

                    <p className="mt-4 text-muted-foreground whitespace-pre-wrap">
                      {post.description}
                    </p>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{post.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(post.date), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Link
                          href={`/admin/users/${post.authorId}`}
                          className="text-primary hover:underline"
                        >
                          {post.authorName}
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Moderation */}
            <div className="space-y-6">
              {/* Moderation Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Modération</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Statut actuel
                    </p>
                    <Badge
                      className={
                        post.status === "published"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : post.status === "pending"
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                      }
                    >
                      {post.status === "published"
                        ? "Publié"
                        : post.status === "pending"
                          ? "En attente"
                          : "Masqué"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {post.status === "pending" && (
                      <Button className="w-full" onClick={handleApprove}>
                        <Check className="mr-2 h-4 w-4" />
                        Approuver
                      </Button>
                    )}

                    {post.status !== "hidden" && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowHideDialog(true)}
                      >
                        <EyeOff className="mr-2 h-4 w-4" />
                        Masquer
                      </Button>
                    )}

                    {post.status === "hidden" && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleApprove}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Afficher
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Créé le</span>
                    <span>
                      {format(new Date(post.createdAt), "dd MMM yyyy HH:mm", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Dernière modification
                    </span>
                    <span>
                      {format(new Date(post.updatedAt), "dd MMM yyyy HH:mm", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      Vues
                    </span>
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      Contacts
                    </span>
                    <span>{post.contacts}</span>
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/posts">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour aux posts
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hide Dialog */}
      <Dialog open={showHideDialog} onOpenChange={setShowHideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Masquer ce post ?</DialogTitle>
            <DialogDescription>
              Le post ne sera plus visible publiquement. Vous pouvez indiquer
              une raison (optionnel).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Raison du masquage (optionnel)..."
            value={hideReason}
            onChange={(e) => setHideReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHideDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleHide}>Masquer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce post ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le post{" "}
              <strong>&quot;{post.title}&quot;</strong> sera définitivement
              supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
