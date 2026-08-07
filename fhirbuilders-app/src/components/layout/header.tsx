"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, LayoutDashboard, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Monochrome editorial nav — no icons, no per-item colors. Order = importance.
const navigation = [
  { title: "Cohort", href: "/cohort-01" },
  { title: "Sandbox", href: "/sandbox/demo" },
  { title: "Agent Skills", href: "/openclaw" },
  { title: "MCP", href: "/mcp" },
  { title: "Projects", href: "/projects" },
  { title: "Problems", href: "/problems" },
  { title: "Wiki", href: "/wiki" },
];

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Cohort member routes own their own chrome (left sidebar shell).
  if (pathname?.startsWith("/cohort/")) return null;

  return (
    <header className="ed-surface sticky top-0 z-50 w-full border-b border-e-line bg-e-paper/85 backdrop-blur supports-[backdrop-filter]:bg-e-paper/70">
      <div className="container flex h-16 items-center justify-between gap-6">
        {/* Masthead wordmark */}
        <Link href="/" className="flex shrink-0 items-baseline gap-0.5">
          <span className="ed-display text-lg text-e-ink">Healthcare AI Builders</span>
          <span className="text-lg leading-none text-e-accent">.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => {
            const active =
              item.href === "/cohort-01"
                ? pathname?.startsWith("/cohort-01")
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`group relative py-1 text-sm transition-colors ${
                  active ? "text-e-ink" : "text-e-ink-soft hover:text-e-ink"
                }`}
              >
                {item.title}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-e-accent transition-all duration-300 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/cohort-01"
            className="hidden items-center gap-1.5 bg-e-ink px-4 py-2 text-sm font-medium text-e-paper transition-colors hover:bg-e-accent sm:inline-flex"
          >
            Enroll <span aria-hidden>→</span>
          </Link>

          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-e-line" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-8 w-8 rounded-full outline-none ring-e-accent focus-visible:ring-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback className="bg-e-accent-soft text-xs text-e-accent">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="text-sm text-e-ink-soft transition-colors hover:text-e-ink"
            >
              Sign in
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-e-ink">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[260px] border-e-line bg-e-paper">
              <nav className="mt-10 flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="border-b border-e-line py-3 text-e-ink-soft transition-colors hover:text-e-ink"
                  >
                    {item.title}
                  </Link>
                ))}
                <Link
                  href="/cohort-01"
                  className="mt-4 inline-flex items-center justify-center gap-1.5 bg-e-ink px-4 py-2.5 text-sm font-medium text-e-paper hover:bg-e-accent"
                >
                  Enroll <span aria-hidden>→</span>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
