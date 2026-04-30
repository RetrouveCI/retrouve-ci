"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/admin/topbar";
import { DataTable } from "@/components/admin/data-table";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { BentoCard } from "@/components/admin/bento-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { mockQRTokens } from "@/lib/mock-data";
import type { QRToken } from "@/lib/types";
import type { DateRange } from "react-day-picker";
import {
  MoreHorizontal,
  Eye,
  Copy,
  Link as LinkIcon,
  Ban,
  Download,
  Plus,
  QrCode,
  CheckCircle,
  Hash,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export default function QRCodesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const batches = [...new Set(mockQRTokens.map((t) => t.batch))];
  const totalGenerated = mockQRTokens.length;
  const totalActivated = mockQRTokens.filter(
    (t) => t.status === "activated",
  ).length;
  const totalRevoked = mockQRTokens.filter(
    (t) => t.status === "revoked",
  ).length;

  let filteredTokens = mockQRTokens;
  if (statusFilter !== "all")
    filteredTokens = filteredTokens.filter((t) => t.status === statusFilter);
  if (batchFilter !== "all")
    filteredTokens = filteredTokens.filter((t) => t.batch === batchFilter);
  if (dateRange?.from) {
    filteredTokens = filteredTokens.filter((t) => {
      const d = new Date(t.createdAt);
      return d >= dateRange.from! && (!dateRange.to || d <= dateRange.to);
    });
  }

  const handleExportCSV = () => {
    const headers = [
      "Token",
      "Statut",
      "Batch",
      "Créé le",
      "Activé le",
      "Utilisateur",
    ];
    const rows = filteredTokens.map((t) => [
      t.token,
      t.status,
      t.batch,
      format(new Date(t.createdAt), "dd/MM/yyyy", { locale: fr }),
      t.activatedAt
        ? format(new Date(t.activatedAt), "dd/MM/yyyy", { locale: fr })
        : "-",
      t.userName || "-",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-tokens.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié`);
  };

  const columns: ColumnDef<QRToken>[] = [
    {
      accessorKey: "token",
      header: "Token",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.token}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.status === "activated"
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : row.original.status === "generated"
                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                : "bg-red-100 text-red-700 hover:bg-red-100"
          }
        >
          {row.original.status === "activated"
            ? "Activé"
            : row.original.status === "generated"
              ? "Généré"
              : "Révoqué"}
        </Badge>
      ),
    },
    {
      accessorKey: "batch",
      header: "Batch",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.batch}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Créé le",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "dd MMM yyyy", { locale: fr }),
    },
    {
      accessorKey: "activatedAt",
      header: "Activé le",
      cell: ({ row }) =>
        row.original.activatedAt
          ? format(new Date(row.original.activatedAt), "dd MMM yyyy", {
              locale: fr,
            })
          : "-",
    },
    {
      accessorKey: "userName",
      header: "Utilisateur",
      cell: ({ row }) =>
        row.original.userName ? (
          <Link
            href={`/admin/users/${row.original.userId}`}
            className="text-primary hover:underline text-sm"
          >
            {row.original.userName}
          </Link>
        ) : (
          <span className="text-muted-foreground">-</span>
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
              <Link href={`/admin/qr/${row.original.token}`}>
                <Eye className="mr-2 h-4 w-4" /> Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => copyToClipboard(row.original.token, "Token")}
            >
              <Copy className="mr-2 h-4 w-4" /> Copier le token
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                copyToClipboard(
                  `https://retrouveci.com/q/${row.original.token}`,
                  "Lien",
                )
              }
            >
              <LinkIcon className="mr-2 h-4 w-4" /> Copier le lien
            </DropdownMenuItem>
            {row.original.status === "activated" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Ban className="mr-2 h-4 w-4" /> Révoquer
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <TopBar title="Stickers / QR Codes" />
      <div className="pt-16">
        <div className="p-4 lg:p-6 space-y-4">
          {/* Bento stat grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <BentoCard
              variant="highlight"
              title="Total générés"
              value={totalGenerated}
              icon={QrCode}
            />
            <BentoCard
              variant="stat"
              title="Activés"
              value={totalActivated}
              icon={CheckCircle}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
            />
            <BentoCard
              variant="stat"
              title="Révoqués"
              value={totalRevoked}
              icon={Hash}
              iconColor="text-red-500"
              iconBgColor="bg-red-100"
              className="col-span-2 lg:col-span-1"
            />
          </div>

          {/* Table bento card */}
          <BentoCard variant="table">
            <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-[140px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="activated">Activé</SelectItem>
                    <SelectItem value="generated">Généré</SelectItem>
                    <SelectItem value="revoked">Révoqué</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={batchFilter} onValueChange={setBatchFilter}>
                  <SelectTrigger className="h-9 w-[160px]">
                    <SelectValue placeholder="Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les batchs</SelectItem>
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" /> Exporter CSV
                </Button>
                <Button size="sm" asChild>
                  <Link href="/admin/qr/generate">
                    <Plus className="mr-2 h-4 w-4" /> Générer
                  </Link>
                </Button>
              </div>
            </div>
            <div className="p-4">
              <DataTable
                columns={columns}
                data={filteredTokens}
                searchKey="token"
                searchPlaceholder="Rechercher par token..."
              />
            </div>
          </BentoCard>
        </div>
      </div>
    </>
  );
}
