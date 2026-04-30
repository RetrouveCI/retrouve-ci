"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/admin/topbar";
import { DataTable } from "@/components/admin/data-table";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { BentoCard } from "@/components/admin/bento-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { mockUsers } from "@/lib/mock-data";
import type { User } from "@/lib/types";
import type { DateRange } from "react-day-picker";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  Trash2,
  Download,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export default function UsersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  let filteredUsers = mockUsers;
  if (statusFilter !== "all") {
    filteredUsers = filteredUsers.filter((u) => u.status === statusFilter);
  }
  if (dateRange?.from) {
    filteredUsers = filteredUsers.filter((u) => {
      const userDate = new Date(u.createdAt);
      return (
        userDate >= dateRange.from! &&
        (!dateRange.to || userDate <= dateRange.to)
      );
    });
  }

  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter((u) => u.status === "active").length;
  const inactiveUsers = mockUsers.filter((u) => u.status === "inactive").length;

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Nom",
      "Email",
      "Téléphone",
      "Statut",
      "QR Codes",
      "Posts",
      "Date d'inscription",
    ];
    const rows = filteredUsers.map((u) => [
      u.id,
      u.name,
      u.email,
      u.phone,
      u.status,
      u.qrCodesCount,
      u.postsCount,
      format(new Date(u.createdAt), "dd/MM/yyyy", { locale: fr }),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "utilisateurs.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  const handleDelete = () => {
    if (deleteUser) {
      toast.success(`Utilisateur ${deleteUser.name} supprimé`);
      setDeleteUser(null);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Utilisateur",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {row.original.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    { accessorKey: "phone", header: "Téléphone" },
    {
      accessorKey: "qrCodesCount",
      header: "QR Codes",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.qrCodesCount}</span>
      ),
    },
    {
      accessorKey: "postsCount",
      header: "Posts",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.postsCount}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Inscription",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "dd MMM yyyy", { locale: fr }),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.status === "active"
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : "bg-gray-100 text-gray-600 hover:bg-gray-100"
          }
        >
          {row.original.status === "active" ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/users/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" /> Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Ban className="mr-2 h-4 w-4" />
              {row.original.status === "active" ? "Désactiver" : "Activer"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteUser(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <TopBar title="Utilisateurs" />
      <div className="pt-16">
        <div className="p-4 lg:p-6 space-y-4">
          {/* Bento stat grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <BentoCard
              variant="highlight"
              title="Total utilisateurs"
              value={totalUsers}
              icon={Users}
            />
            <BentoCard
              variant="stat"
              title="Utilisateurs actifs"
              value={activeUsers}
              icon={UserCheck}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
            />
            <BentoCard
              variant="stat"
              title="Utilisateurs inactifs"
              value={inactiveUsers}
              icon={UserX}
              iconColor="text-gray-500"
              iconBgColor="bg-gray-100"
              className="col-span-2 lg:col-span-1"
            />
          </div>

          {/* Table bento card */}
          <BentoCard variant="table">
            <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-[150px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                  </SelectContent>
                </Select>
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" /> Exporter CSV
              </Button>
            </div>
            <div className="p-4">
              <DataTable
                columns={columns}
                data={filteredUsers}
                searchKey="name"
                searchPlaceholder="Rechercher par nom, email..."
              />
            </div>
          </BentoCard>
        </div>
      </div>

      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;utilisateur{" "}
              <strong>{deleteUser?.name}</strong> et toutes ses données seront
              supprimés.
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
