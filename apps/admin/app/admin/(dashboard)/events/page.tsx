"use client";

import { useState } from "react";
import { TopBar } from "@/components/admin/topbar";
import { DataTable } from "@/components/admin/data-table";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { BentoCard } from "@/components/admin/bento-card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { mockEvents } from "@/lib/mock-data";
import type { Event } from "@/lib/types";
import type { DateRange } from "react-day-picker";
import { Download, RefreshCw, Activity, Scan, Phone, Zap } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case "scan":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "contact":
      return "bg-orange-100 text-orange-700 hover:bg-orange-100";
    case "activation":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "generation":
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    case "revocation":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "scan":
      return "Scan";
    case "contact":
      return "Contact";
    case "activation":
      return "Activation";
    case "generation":
      return "Génération";
    case "revocation":
      return "Révocation";
    default:
      return type;
  }
};

export default function EventsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalScans = mockEvents.filter((e) => e.type === "scan").length;
  const totalContacts = mockEvents.filter((e) => e.type === "contact").length;
  const totalActivations = mockEvents.filter(
    (e) => e.type === "activation",
  ).length;

  let filteredEvents = mockEvents;
  if (typeFilter !== "all")
    filteredEvents = filteredEvents.filter((e) => e.type === typeFilter);
  if (sourceFilter !== "all")
    filteredEvents = filteredEvents.filter((e) => e.source === sourceFilter);
  if (dateRange?.from) {
    filteredEvents = filteredEvents.filter((e) => {
      const d = new Date(e.timestamp);
      return d >= dateRange.from! && (!dateRange.to || d <= dateRange.to);
    });
  }

  const handleExportCSV = () => {
    const headers = ["ID", "Type", "Token", "Utilisateur", "Date", "Source"];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.type,
      e.token || "-",
      e.user,
      format(new Date(e.timestamp), "dd/MM/yyyy HH:mm", { locale: fr }),
      e.source,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "evenements.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success("Événements actualisés");
  };

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge className={getTypeBadgeClass(row.original.type)}>
          {getTypeLabel(row.original.type)}
        </Badge>
      ),
    },
    {
      accessorKey: "token",
      header: "Token / Réf",
      cell: ({ row }) =>
        row.original.token ? (
          <span className="font-mono text-xs">{row.original.token}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: "user",
      header: "Utilisateur",
      cell: ({ row }) => (
        <span
          className={
            row.original.user === "Anonyme" ? "text-muted-foreground" : ""
          }
        >
          {row.original.user}
        </span>
      ),
    },
    {
      accessorKey: "timestamp",
      header: "Date",
      cell: ({ row }) =>
        format(new Date(row.original.timestamp), "dd MMM yyyy HH:mm", {
          locale: fr,
        }),
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => <Badge variant="outline">{row.original.source}</Badge>,
    },
  ];

  return (
    <>
      <TopBar title="Journal d'événements" />
      <div className="pt-16">
        <div className="p-4 lg:p-6 space-y-4">
          {/* Bento stat grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <BentoCard
              variant="highlight"
              title="Total événements"
              value={mockEvents.length}
              icon={Activity}
            />
            <BentoCard
              variant="stat"
              title="Scans"
              value={totalScans}
              icon={Scan}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
            />
            <BentoCard
              variant="stat"
              title="Contacts"
              value={totalContacts}
              icon={Phone}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
            />
            <BentoCard
              variant="stat"
              title="Activations"
              value={totalActivations}
              icon={Zap}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />
          </div>

          {/* Table bento card */}
          <BentoCard variant="table">
            <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-9 w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="scan">Scan</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="activation">Activation</SelectItem>
                    <SelectItem value="generation">Génération</SelectItem>
                    <SelectItem value="revocation">Révocation</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="h-9 w-[140px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes sources</SelectItem>
                    <SelectItem value="Mobile Web">Mobile Web</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="API">API</SelectItem>
                  </SelectContent>
                </Select>
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  Actualiser
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" /> Exporter CSV
                </Button>
              </div>
            </div>
            <div className="p-4">
              <DataTable
                columns={columns}
                data={filteredEvents}
                searchKey="user"
                searchPlaceholder="Rechercher par utilisateur..."
                pageSize={50}
              />
            </div>
          </BentoCard>
        </div>
      </div>
    </>
  );
}
