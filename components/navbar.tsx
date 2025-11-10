"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bug, Grid2X2Check, ListTodo, Bell, User, LogOut, CheckCheck,
  Circle, CheckCircle2
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

type NavLink = { label: string; href: string; active?: boolean; icon: React.ComponentType<{className?:string}> };
type Notification = { id: string; message: string; timestamp: Date; read: boolean };

const seed: Notification[] = [
  { id: "1", message: "Bug #123 assigned to you", timestamp: new Date(Date.now()-8*60_000), read: false },
  { id: "2", message: "Scenario test 'Tutorial' updated", timestamp: new Date(Date.now()-18*60_000), read: false },
  { id: "3", message: "Task board 'Sprint 1' created", timestamp: new Date(Date.now()-5*60_000), read: true },
];

export default function Navbar({ currentPath="/"}:{currentPath?:string}) {
  const router = useRouter();
  const [notis, setNotis] = useState(seed);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unread = notis.filter(n => !n.read).length;

  const nav: NavLink[] = [
    { label:"Issue Tracker",    href:"/issues",    active: currentPath==="/issues",    icon: Bug },
    { label:"Scenario Testing", href:"/scenarios", active: currentPath==="/scenarios", icon: Grid2X2Check },
    { label:"Task Boards",    href:"/boards",    active: currentPath==="/boards",    icon: ListTodo },
  ];

  const markAll = () => setNotis(n => n.map(x => ({...x, read:true})));
  const toggleRead = (id: string) => setNotis(n => n.map(x => x.id===id ? ({...x, read:!x.read}) : x));

  const ago = (d: Date) => {
    const s = Math.floor((Date.now()-d.getTime())/1000);
    if (s<60) return "just now";
    if (s<3600) return `${Math.floor(s/60)}m ago`;
    if (s<86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-[hsl(var(--background))] border-[hsl(var(--border))]">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3">
        {/* Brand + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-0.5 group">
            <div className="h-11 w-11 rounded-lg flex items-center justify-center  text-[hsl(var(--primary-foreground))] transition-transform group-hover:scale-105">
              <Image src="/beaver_icon.svg" width={26} height={26} alt="BeaverBoard" />
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
          {/* Notifications trigger (styled like nav item) */}
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
                {unread > 0 && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 min-w-4 h-4 px-1",
                      "rounded-full text-[10px] font-extrabold leading-none",
                      "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center"
                    )}
                  >
                    {unread > 9 ? "9+" : unread}
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
                  onClick={markAll}
                  disabled={unread===0}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                    unread===0
                      ? "text-[hsl(var(--muted-foreground))]"
                      : "text-[hsl(var(--primary))] hover:bg-[hsl(var(--hover-light))]"
                  )}
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all as read
                </button>
              </div>

              <ScrollArea className="h-96">
                <ul className="divide-y divide-[hsl(var(--border))]">
                  {notis.map(n => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => toggleRead(n.id)}
                        className={cn(
                          "w-full text-left px-6 py-4 transition-colors",
                          "hover:bg-[hsl(var(--hover-light))] focus-visible:bg-[hsl(var(--hover-light))] focus-visible:outline-none",
                          
                        )}
                      >
                        <div className="flex gap-3 items-center ">
                          <div className="h-5 w-5 shrink-0 flex items-center justify-center">
                            {n.read ? (
                              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--muted))]" />
                            ) : (
                              <Circle className="h-5 w-5 text-[hsl(var(--primary))]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium line-clamp-2">{n.message}</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1.5 font-medium">
                              {ago(n.timestamp)}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
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
                <span className="hidden sm:inline text-base font-bold">John Doe</span>
                <Avatar className="h-10 w-10 border border-[hsl(var(--primary))]">
                  <AvatarFallback className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-sm">JD</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-60 p-0 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))] rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-[hsl(var(--border))] ">
                <p className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] tracking-wide">SIGNED IN AS</p>
                <p className="text-base font-bold mt-1.5">John Doe</p>
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
