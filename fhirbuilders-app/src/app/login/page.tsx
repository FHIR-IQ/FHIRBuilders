"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Github, Loader2, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [mode, setMode] = useState<"options" | "signin" | "signup">("options");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleOAuth = async (provider: string) => {
    setIsLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setIsLoading(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading("email");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(null);
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("Invalid email or password");
      setIsLoading(null);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading("email");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(null);
        return;
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Account created — please sign in");
        setMode("signin");
        setIsLoading(null);
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("created") || msg.includes("register")) {
        setError("Account created — please sign in");
        setMode("signin");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setIsLoading(null);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md">
        <button
          onClick={() => mode === "options" ? router.push("/") : setMode("options")}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {mode === "options" ? "Back to home" : "Other sign-in options"}
        </button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-lg">
              FB
            </div>
            <CardTitle className="text-2xl">
              {mode === "signup" ? "Create your account" : "Welcome to FHIRBuilders"}
            </CardTitle>
            <CardDescription>
              {mode === "signup"
                ? "Sign up to submit your FHIR apps and join the community"
                : "Sign in to submit apps, share projects, and collaborate"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {mode === "options" && (
              <>
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => handleOAuth("github")}
                  disabled={isLoading !== null}
                >
                  {isLoading === "github" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Github className="mr-2 h-5 w-5" />}
                  Continue with GitHub
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => handleOAuth("google")}
                  disabled={isLoading !== null}
                >
                  {isLoading === "google" ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </Button>

                <div className="relative my-2">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                    or
                  </span>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => setMode("signin")}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Continue with Email
                </Button>

                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    New here?{" "}
                    <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">
                      Create an account
                    </button>
                  </p>
                </div>

                <div className="text-center border-t pt-4">
                  <Button variant="ghost" asChild size="sm">
                    <Link href="/sandbox/demo">Try the sandbox without signing in</Link>
                  </Button>
                </div>
              </>
            )}

            {mode === "signin" && (
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                {error && <p className="text-sm text-destructive text-center bg-destructive/10 rounded p-2">{error}</p>}
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading !== null}>
                  {isLoading === "email" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  No account?{" "}
                  <button type="button" onClick={() => { setMode("signup"); setError(""); }} className="text-primary hover:underline">
                    Create one
                  </button>
                </p>
              </form>
            )}

            {mode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-3">
                {error && <p className="text-sm text-destructive text-center bg-destructive/10 rounded p-2">{error}</p>}
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading !== null}>
                  {isLoading === "email" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button type="button" onClick={() => { setMode("signin"); setError(""); }} className="text-primary hover:underline">
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
