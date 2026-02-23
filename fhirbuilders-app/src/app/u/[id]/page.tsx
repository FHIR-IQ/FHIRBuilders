"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  ArrowUp,
  Calendar,
  ExternalLink,
  Github,
  Loader2,
  User,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  persona: string;
  skills: string[];
  interests: string[];
  lookingFor: string[];
  githubUsername: string | null;
  huggingfaceUsername: string | null;
  createdAt: string;
}

interface UserApp {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  appType: string | null;
  fhirResources: string[];
  icon: string | null;
  upvoteCount: number;
  builtWith: string[];
  createdAt: string;
}

const PERSONA_LABELS: Record<string, string> = {
  BUILDER: "Builder",
  INVESTOR: "Investor",
  SUPPORTER: "Supporter",
  USER: "User",
};

const PERSONA_COLORS: Record<string, string> = {
  BUILDER: "bg-blue-100 text-blue-800",
  INVESTOR: "bg-green-100 text-green-800",
  SUPPORTER: "bg-purple-100 text-purple-800",
  USER: "bg-gray-100 text-gray-800",
};

const CATEGORY_LABELS: Record<string, string> = {
  AI_AGENT: "AI Agent",
  CLINICAL: "Clinical",
  PATIENT_ENGAGEMENT: "Patient Engagement",
  ANALYTICS: "Analytics",
  INTEGRATION: "Integration",
  TEMPLATE: "Template",
};

export default function PublicProfilePage() {
  const params = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [apps, setApps] = useState<UserApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${params.id}`);
        if (!res.ok) {
          setError("User not found");
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setApps(data.apps);
      } catch {
        setError("Failed to load profile");
      }
      setIsLoading(false);
    };
    if (params.id) fetchProfile();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container py-12 text-center">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">User not found</h2>
        <p className="text-muted-foreground mb-4">
          This profile does not exist or is not public.
        </p>
        <Button asChild>
          <Link href="/showcase">Browse Showcase</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-3xl">
      <Link
        href="/showcase"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Showcase
      </Link>

      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold">{user.name || "Anonymous"}</h1>
                <Badge
                  className={`text-xs ${PERSONA_COLORS[user.persona] || ""}`}
                >
                  {PERSONA_LABELS[user.persona] || user.persona}
                </Badge>
              </div>

              {user.bio && (
                <p className="text-muted-foreground mt-2">{user.bio}</p>
              )}

              {/* External links */}
              <div className="flex gap-3 mt-3 justify-center sm:justify-start">
                {user.githubUsername && (
                  <a
                    href={`https://github.com/${user.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Github className="h-4 w-4" />
                    {user.githubUsername}
                  </a>
                )}
                {user.huggingfaceUsername && (
                  <a
                    href={`https://huggingface.co/${user.huggingfaceUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                    HF: {user.huggingfaceUsername}
                  </a>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1 justify-center sm:justify-start">
                <Calendar className="h-3 w-3" />
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Skills, Interests, Looking For */}
          <div className="mt-6 space-y-3">
            {user.skills.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {user.skills.map(s => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {user.interests.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Healthcare Interests
                </p>
                <div className="flex flex-wrap gap-1">
                  {user.interests.map(i => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {i}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {user.lookingFor.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Looking For
                </p>
                <div className="flex flex-wrap gap-1">
                  {user.lookingFor.map(l => (
                    <Badge
                      key={l}
                      className="text-xs bg-amber-100 text-amber-800"
                    >
                      {l}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Apps */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Showcase Apps ({apps.length})
        </h2>

        {apps.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No published apps yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {apps.map(app => (
              <Link key={app.id} href={`/showcase/${app.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      {app.icon ? (
                        <img
                          src={app.icon}
                          alt=""
                          className="h-8 w-8 rounded"
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {app.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{app.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {app.tagline}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORY_LABELS[app.category] || app.category}
                        </Badge>
                        {app.appType && (
                          <Badge variant="outline" className="text-xs">
                            {app.appType}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                      <ArrowUp className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {app.upvoteCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
