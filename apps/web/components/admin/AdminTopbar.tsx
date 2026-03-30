"use client";

import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

const MOCK_NOTIFICATIONS = [
  { id: "1", title: "Low Stock: Royal Canin 3kg", body: "Only 2 units left", created_at: new Date().toISOString(), read: false },
  { id: "2", title: "New Order #ORD-7H2A", body: "₹1,499 — Awaiting confirmation", created_at: new Date().toISOString(), read: false },
  { id: "3", title: "Review posted", body: "5★ review on Pedigree Adult", created_at: new Date().toISOString(), read: true },
];

export default function AdminTopbar({ user }: { user: AdminUser }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
      {/* Left: search */}
      <div className="relative hidden md:flex items-center w-72">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search products, orders…"
          className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
        />
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline cursor-pointer">
                  Mark all read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex flex-col items-start gap-0.5 px-4 py-3 cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-center gap-2 w-full">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    <p className="text-sm font-medium">{n.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground pl-3.5">{n.body}</p>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user.full_name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-tight">{user.full_name}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
