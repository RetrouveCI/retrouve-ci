"use client";

import { AuthGuard } from "@/components/admin/auth-guard";
import { Sidebar } from "@/components/admin/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:pl-64">{children}</main>
      </div>
    </AuthGuard>
  );
}
