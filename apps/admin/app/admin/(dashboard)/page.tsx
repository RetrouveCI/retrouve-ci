"use client";

import { useState } from "react";
import { TopBar } from "@/components/admin/topbar";
import { BentoCard } from "@/components/admin/bento-card";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  mockDashboardStats,
  mockChartData,
  mockActivities,
} from "@/lib/mock-data";
import type { DateRange } from "react-day-picker";
import {
  QrCode,
  CheckCircle,
  Scan,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Users,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "scan":
      return <Scan className="h-4 w-4 text-green-600" />;
    case "user":
      return <Users className="h-4 w-4 text-blue-600" />;
    case "post":
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    case "contact":
      return <Phone className="h-4 w-4 text-purple-600" />;
    default:
      return <CheckCircle className="h-4 w-4 text-gray-600" />;
  }
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="pt-16">
        <div className="p-4 lg:p-6">
          {/* Header with greeting and date picker */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
                Bienvenue sur RetrouveCI
              </h1>
              <p className="mt-1 text-muted-foreground">
                Voici un apercu de votre plateforme
              </p>
            </div>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>

          {/* Bento Grid Layout */}
          <div className="grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Highlighted QR Stats - Takes 2 columns */}
            <BentoCard
              title="QR Codes Actifs"
              value={mockDashboardStats.qrActivated.value}
              change={mockDashboardStats.qrActivated.change}
              icon={QrCode}
              variant="highlight"
              className="md:col-span-2"
            />

            {/* Regular Stats */}
            <BentoCard
              title="Scans Totaux"
              value={mockDashboardStats.scans.value}
              change={mockDashboardStats.scans.change}
              icon={Scan}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100"
            />

            <BentoCard
              title="Contacts"
              value={mockDashboardStats.contacts.value}
              change={mockDashboardStats.contacts.change}
              icon={Phone}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
            />

            {/* Activity Chart - Takes 2 columns and 2 rows */}
            <Card className="overflow-hidden md:col-span-2 md:row-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Activite des 30 derniers jours
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+12%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={mockChartData.activity}>
                    <defs>
                      <linearGradient
                        id="colorScans"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#1E7F43"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#1E7F43"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorActivations"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#F57C00"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#F57C00"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      stroke="#9CA3AF"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="#9CA3AF"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow:
                          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="scans"
                      name="Scans"
                      stroke="#1E7F43"
                      strokeWidth={2}
                      fill="url(#colorScans)"
                    />
                    <Area
                      type="monotone"
                      dataKey="activations"
                      name="Activations"
                      stroke="#F57C00"
                      strokeWidth={2}
                      fill="url(#colorActivations)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Posts Stats */}
            <BentoCard
              title="Posts Perdus"
              value={mockDashboardStats.postsLost.value}
              change={mockDashboardStats.postsLost.change}
              icon={AlertTriangle}
              iconColor="text-red-600"
              iconBgColor="bg-red-100"
            />

            <BentoCard
              title="Posts Retrouves"
              value={mockDashboardStats.postsFound.value}
              change={mockDashboardStats.postsFound.change}
              icon={CheckCircle2}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-100"
            />

            {/* Bar Chart - Takes 2 columns */}
            <Card className="overflow-hidden md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  Posts par categorie
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={mockChartData.postsByCategory} barGap={8}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11 }}
                      stroke="#9CA3AF"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="#9CA3AF"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="lost"
                      name="Perdus"
                      fill="#EF4444"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="found"
                      name="Retrouves"
                      fill="#1E7F43"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* New Users & QR Generated */}
            <BentoCard
              title="Nouveaux Utilisateurs"
              value={mockDashboardStats.newUsers.value}
              change={mockDashboardStats.newUsers.change}
              icon={Users}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />

            <BentoCard
              title="QR Generes"
              value={mockDashboardStats.qrGenerated.value}
              change={mockDashboardStats.qrGenerated.change}
              icon={QrCode}
              iconColor="text-indigo-600"
              iconBgColor="bg-indigo-100"
            />

            {/* Recent Activity - Takes 2 columns */}
            <Card className="overflow-hidden md:col-span-2 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">
                  Activite Recente
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href="/admin/events"
                    className="gap-1 text-primary hover:text-primary/80"
                  >
                    Voir tout <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockActivities.slice(0, 6).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
                    >
                      <div
                        className={cn(
                          "rounded-full p-2.5",
                          activity.type === "scan" && "bg-green-100",
                          activity.type === "user" && "bg-blue-100",
                          activity.type === "post" && "bg-orange-100",
                          activity.type === "contact" && "bg-purple-100",
                        )}
                      >
                        <ActivityIcon type={activity.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
