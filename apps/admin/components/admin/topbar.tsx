"use client";

import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { mockNotifications } from "@/lib/mock-data";
import { MobileSidebar } from "./sidebar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-20 h-16 border-b bg-card/80 backdrop-blur-md lg:left-64">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <div>
            <h2 className="text-lg font-bold lg:text-xl">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            asChild
          >
            <Link href="/admin/notifications">
              <Bell size={18} />
              {unreadCount > 0 && (
                <>
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </span>
                </>
              )}
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 rounded-full px-2 hover:bg-muted"
              >
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {user?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className="hidden text-muted-foreground md:block"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">
                    {user?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "admin@retrouveci.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link
                  href="/admin/profile"
                  className="flex w-full items-center gap-2"
                >
                  <User size={16} />
                  Mon profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut size={16} className="mr-2" />
                Deconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
