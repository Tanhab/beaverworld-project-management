"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bug, Grid2X2Check, ListTodo, Bell, User, LogOut, CheckCheck,
  Circle, CheckCircle2, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useCurrentUser } from "@/lib/hooks/useUser";

type NavLink = { label: string; href: string; active?: boolean; icon: React.ComponentType<{className?:string}> };

export default function Navbar({ currentPath="/"}:{currentPath?:string}) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Get current user
  const { data: user } = useCurrentUser();

  // Get notifications
  const {
    notifications,
    unreadCount,
    hasMore,
    isLoading,
    loadMore,
    handleNotificationClick,
    markAllAsRead,
    deleteNotification,
    isMarkingAllAsRead,
    isDeletingNotification,
  } = useNotifications({
    userId: user?.id || null,
    limit: 20,
    enableRealtime: true,
  });

  const nav: NavLink[] = [
    { label:"Issue Tracker",    href:"/issues",    active: currentPath==="/issues",    icon: Bug },
    { label:"Scenario Testing", href:"/scenarios", active: currentPath==="/scenarios", icon: Grid2X2Check },
    { label:"Task Boards",    href:"/boards",    active: currentPath==="/boards",    icon: ListTodo },
  ];

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationDelete = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationItemClick = async (
    notification: typeof notifications[0]
  ) => {
    await handleNotificationClick(notification);
    setNotifOpen(false);
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffSecs / 3600);
    const diffDays = Math.floor(diffSecs / 86400);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-[hsl(var(--background))] border-[hsl(var(--border))]">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3">
        {/* Brand + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-0.5 group">
            <div className="h-11 w-11 rounded-lg flex items-center justify-center  text-[hsl(var(--primary-foreground))] transition-transform group-hover:scale-105">
              <Image src="/beaver_icon.png" width={26} height={26} alt="BeaverBoard" />
            </div>
            <span className="text-xl font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
              BeaverWorldDev
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({label, href, icon:Icon, active}) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-base font-semibold transition-colors",
                  active
                    ? "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"
                    : "text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications trigger */}
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Notifications"
                className={cn(
                  "relative inline-flex items-center justify-center h-11 w-11 rounded-lg",
                  "text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors",
                  "focus-visible:outline-none data-[state=open]:bg-[hsl(var(--accent))]"
                )}
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 min-w-4 h-4 px-1",
                      "rounded-full text-[10px] font-extrabold leading-none",
                      "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center"
                    )}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-96 p-0 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))] rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-[hsl(var(--border))] ">
                <h2 className="text-lg font-bold">Notifications</h2>
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0 || isMarkingAllAsRead}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                    unreadCount === 0
                      ? "text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                      : "text-[hsl(var(--primary))] hover:bg-[hsl(var(--hover-light))]"
                  )}
                >
                  {isMarkingAllAsRead ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4" />
                  )}
                  Mark all as read
                </button>
              </div>

              <ScrollArea className="h-96">
                {isLoading && notifications.length === 0 ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Bell className="h-12 w-12 text-[hsl(var(--muted-foreground))] mb-4" />
                    <p className="text-[hsl(var(--muted-foreground))] font-medium">
                      No notifications
                    </p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                      You're all caught up!
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-[hsl(var(--border))]">
                    {notifications.map((n) => (
                      <li key={n.id} className="relative group">
                        <div
                          onClick={() => handleNotificationItemClick(n)}
                          className={cn(
                            "w-full text-left px-6 py-4 transition-colors cursor-pointer",
                            "hover:bg-[hsl(var(--hover-light))] focus-visible:bg-[hsl(var(--hover-light))] focus-visible:outline-none"
                          )}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="h-5 w-5 shrink-0 flex items-center justify-center mt-0.5">
                              {n.read ? (
                                <CheckCircle2 className="h-5 w-5 text-[hsl(var(--muted))]" />
                              ) : (
                                <Circle className="h-5 w-5 text-[hsl(var(--primary))]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold mb-1 line-clamp-1">
                                {n.title}
                              </p>
                              <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-2">
                                {n.message}
                              </p>
                              <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                                {formatTimestamp(n.created_at)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleNotificationDelete(e, n.id)}
                              className={cn(
                                "opacity-0 group-hover:opacity-100 transition-opacity",
                                "h-6 w-6 rounded-md flex items-center justify-center",
                                "hover:bg-red-100 hover:text-red-600",
                                "focus-visible:opacity-100"
                              )}
                              aria-label="Delete notification"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {hasMore && (
                  <div className="p-4 border-t border-[hsl(var(--border))]">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={loadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5",
                  "text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors",
                  "focus-visible:outline-none data-[state=open]:bg-[hsl(var(--bg-accent))]"
                )}
              >
                <span className="hidden sm:inline text-base font-bold">
                  {user?.username || "Loading..."}
                </span>
                <Avatar className="h-10 w-10 border border-[hsl(var(--primary))]">
                  <AvatarFallback className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-sm">
                    {user?.initials || "??"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-60 p-0 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))] rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-[hsl(var(--border))] ">
                <p className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] tracking-wide">SIGNED IN AS</p>
                <p className="text-base font-bold mt-1.5">{user?.username || "Loading..."}</p>
              </div>

              <DropdownMenuItem className="cursor-pointer px-4 py-3 text-[15px] font-semibold gap-2 hover:bg-[hsl(var(--hover-light))] focus-visible:bg-[hsl(var(--hover-light))] ">
                <User className="h-5 w-5 text-[hsl(var(--primary))]" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[hsl(var(--border))] my-0" />
              <DropdownMenuItem
                onClick={() => router.push("/login")}
                className="cursor-pointer px-4 py-3 text-[15px] font-semibold gap-2 hover:bg-[hsl(var(--hover-light))] focus-visible:bg-[hsl(var(--hover-light))]"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}