"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, Loader2, Mail, MessageSquare, Sparkles } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [mode, setMode] = useState<"options" | "magic" | "magic-sent" | "signin" | "signup" | "zulip">("options");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zulipEmail, setZulipEmail] = useState("");
  const [zulipPassword, setZulipPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");

  const handleOAuth = async (provider: string) => {
    setIsLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setIsLoading(null);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading("magic");
    try {
      const result = await signIn("resend", {
        email: magicEmail,
        callbackUrl,
        redirect: false,
      });
      if (result?.error) {
        setError("Couldn't send the link — double-check the email and try again.");
        setIsLoading(null);
      } else {
        setMode("magic-sent");
        setIsLoading(null);
      }
    } catch {
      setError("Something went wrong sending the link.");
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

  const handleZulipSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading("zulip");
    try {
      const result = await signIn("zulip-fhir", {
        email: zulipEmail,
        password: zulipPassword,
        redirect: false,
      });
      if (result?.error) {
        setError("Could not verify your chat.fhir.org account. Check your email and password/API key.");
        setIsLoading(null);
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("Could not verify your chat.fhir.org account.");
      setIsLoading(null);
    }
  };

  const resetForm = () => {
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setZulipEmail("");
    setZulipPassword("");
    setMagicEmail("");
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md">
        <button
          onClick={() => {
            if (mode === "options") router.push("/");
            else { setMode("options"); resetForm(); }
          }}
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
              {mode === "signup" ? "Create your account" :
               mode === "zulip" ? "Sign in with FHIR Chat" :
               mode === "magic" ? "Email me a sign-in link" :
               mode === "magic-sent" ? "Check your inbox" :
               "Welcome to FHIRBuilders"}
            </CardTitle>
            <CardDescription>
              {mode === "signup"
                ? "Sign up to submit your FHIR apps and join the community"
                : mode === "zulip"
                ? "Use your chat.fhir.org account to sign in"
                : mode === "magic"
                ? "No password needed. We'll send a link that signs you in."
                : mode === "magic-sent"
                ? `We sent a sign-in link to ${magicEmail}. It expires in 24 hours.`
                : "Sign in to submit apps, share projects, and collaborate"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* ── Options screen ── */}
            {mode === "options" && (
              <>
                {/* GitHub */}
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => handleOAuth("github")}
                  disabled={isLoading !== null}
                >
                  {isLoading === "github" ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  )}
                  Continue with GitHub
                </Button>

                {/* Google */}
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
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </Button>

                {/* FHIR Zulip Chat */}
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => { resetForm(); setMode("zulip"); }}
                  disabled={isLoading !== null}
                >
                  <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
                  Sign in with FHIR Chat (chat.fhir.org)
                </Button>

                <div className="relative my-2">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                    or
                  </span>
                </div>

                {/* Magic link — primary email path (no password) */}
                <Button
                  type="button"
                  className="w-full h-11"
                  onClick={() => { resetForm(); setMode("magic"); }}
                  disabled={isLoading !== null}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Email me a sign-in link
                </Button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { resetForm(); setMode("signin"); }}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Use password instead
                  </button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    New here?{" "}
                    <button onClick={() => { resetForm(); setMode("signup"); }} className="text-primary hover:underline font-medium">
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

            {/* ── Magic link request ── */}
            {mode === "magic" && (
              <form onSubmit={handleMagicLink} className="space-y-3">
                {error && (
                  <p className="text-sm text-destructive text-center bg-destructive/10 rounded p-2">
                    {error}
                  </p>
                )}
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading !== null}>
                  {isLoading === "magic" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Send sign-in link
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  We send the link from{" "}
                  <span className="font-mono">notifications@fhirbuilders.com</span>. Check
                  spam if you don&apos;t see it in 30 seconds.
                </p>
              </form>
            )}

            {/* ── Magic link sent confirmation ── */}
            {mode === "magic-sent" && (
              <div className="space-y-4 text-center py-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Open the email and click the button. The link is good for{" "}
                  <span className="font-medium text-foreground">24 hours</span>.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => { resetForm(); setMode("magic"); }}
                >
                  Use a different email
                </Button>
                <p className="text-xs text-muted-foreground">
                  Didn&apos;t arrive? Check spam, then try again — or{" "}
                  <button
                    type="button"
                    onClick={() => { resetForm(); setMode("options"); }}
                    className="text-primary hover:underline"
                  >
                    use another sign-in method
                  </button>
                  .
                </p>
              </div>
            )}

            {/* ── Email sign-in ── */}
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
                  <button type="button" onClick={() => { resetForm(); setMode("signup"); }} className="text-primary hover:underline">
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* ── Sign up ── */}
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
                  <button type="button" onClick={() => { resetForm(); setMode("signin"); }} className="text-primary hover:underline">
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* ── Zulip FHIR Chat sign-in ── */}
            {mode === "zulip" && (
              <form onSubmit={handleZulipSignIn} className="space-y-3">
                {error && <p className="text-sm text-destructive text-center bg-destructive/10 rounded p-2">{error}</p>}
                <p className="text-xs text-muted-foreground text-center">
                  Enter your <a href="https://chat.fhir.org" target="_blank" rel="noopener" className="underline">chat.fhir.org</a> login credentials
                </p>
                <div>
                  <label className="text-sm font-medium">chat.fhir.org Email</label>
                  <input
                    type="email"
                    required
                    value={zulipEmail}
                    onChange={e => setZulipEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Password or API Key</label>
                  <input
                    type="password"
                    required
                    value={zulipPassword}
                    onChange={e => setZulipPassword(e.target.value)}
                    placeholder="Your password or Zulip API key"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Find your API key at chat.fhir.org → Settings → Your account → API key
                  </p>
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading !== null}>
                  {isLoading === "zulip" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="mr-2 h-4 w-4" />
                  )}
                  Sign in with FHIR Chat
                </Button>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
