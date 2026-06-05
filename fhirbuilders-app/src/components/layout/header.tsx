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
import {
  FlaskConical,
  LogOut,
  User,
  LayoutDashboard,
  Menu,
  FolderOpen,
  BookOpen,
  BookOpenCheck,
  Lightbulb,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Navigation - color-coded by section category
const navigation = [
  { title: "Problems", href: "/problems", icon: Lightbulb, color: "text-rose-600 hover:text-rose-700" },
  { title: "Projects", href: "/projects", icon: FolderOpen, color: "text-teal-600 hover:text-teal-700" },
  { title: "MCP", href: "/mcp", icon: Wrench, color: "text-blue-600 hover:text-blue-700" },
  { title: "Agent Skills", href: "/openclaw", icon: Sparkles, color: "text-amber-600 hover:text-amber-700" },
  { title: "Sandbox", href: "/sandbox/demo", icon: FlaskConical, color: "text-blue-600 hover:text-blue-700" },
  { title: "Wiki", href: "/wiki", icon: BookOpenCheck, color: "text-violet-600 hover:text-violet-700" },
  { title: "Learn", href: "/learn", icon: BookOpen, color: "text-amber-600 hover:text-amber-700" },
];

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Cohort routes own their own chrome (left sidebar shell).
  if (pathname?.startsWith("/cohort")) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-sm">
              FB
            </div>
            <span className="font-semibold hidden sm:inline-block">FHIRBuilders</span>
          </Link>

          {/* Desktop Navigation - color-coded by section */}
          <nav className="hidden md:flex items-center gap-4">
            {navigation.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${item.color ?? "text-muted-foreground hover:text-foreground"}`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px]">
            <nav className="flex flex-col space-y-4 mt-8">
              {navigation.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center gap-2 py-2 text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Auth Section */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-7 w-7 rounded-full">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback className="text-xs">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
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
            <Button size="sm" asChild>
              <Link href="/login">
                Sign in
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
