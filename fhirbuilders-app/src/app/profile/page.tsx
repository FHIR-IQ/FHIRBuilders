"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Loader2,
  Check,
  Code2,
  TrendingUp,
  Users,
  Building2,
  Github,
  Sparkles,
} from "lucide-react";

// Persona options matching the Prisma enum
const PERSONAS = [
  {
    value: "BUILDER",
    label: "Builder",
    icon: Code2,
    desc: "Developing FHIR apps",
  },
  {
    value: "INVESTOR",
    label: "Investor",
    icon: TrendingUp,
    desc: "Exploring opportunities",
  },
  {
    value: "SUPPORTER",
    label: "Supporter",
    icon: Users,
    desc: "Mentor or advisor",
  },
  {
    value: "USER",
    label: "User",
    icon: Building2,
    desc: "Healthcare organization",
  },
];

// Predefined skill options
const SKILLS_OPTIONS = [
  "FHIR",
  "HL7",
  "AI/ML",
  "React",
  "Python",
  "TypeScript",
  "Node.js",
  "Healthcare IT",
  "Clinical Workflows",
  "Data Engineering",
  "DevOps",
  "Security",
];

// Predefined interest options
const INTERESTS_OPTIONS = [
  "Oncology",
  "Patient Engagement",
  "Interoperability",
  "Clinical Decision Support",
  "Population Health",
  "Telemedicine",
  "Mental Health",
  "Pediatrics",
  "Cardiology",
  "Emergency Medicine",
];

// Looking for options
const LOOKING_FOR_OPTIONS = [
  "Co-founder",
  "Investor",
  "Mentor",
  "Collaborator",
  "Technical Partner",
  "Domain Expert",
  "Pilot Sites",
  "Feedback",
];

interface ProfileData {
  name: string;
  bio: string;
  persona: string;
  skills: string[];
  interests: string[];
  lookingFor: string[];
  githubUsername: string;
  huggingfaceUsername: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    bio: "",
    persona: "BUILDER",
    skills: [],
    interests: [],
    lookingFor: [],
    githubUsername: "",
    huggingfaceUsername: "",
  });

  // Redirect if not authenticated, fetch profile when authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const loadProfile = async () => {
        try {
          const response = await fetch("/api/profile");
          if (response.ok) {
            const data = await response.json();
            setFormData({
              name: data.user.name || "",
              bio: data.user.bio || "",
              persona: data.user.persona || "BUILDER",
              skills: data.user.skills || [],
              interests: data.user.interests || [],
              lookingFor: data.user.lookingFor || [],
              githubUsername: data.user.githubUsername || "",
              huggingfaceUsername: data.user.huggingfaceUsername || "",
            });
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
        setIsLoading(false);
      };
      loadProfile();
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to save profile");
        setSaveStatus("error");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
      setSaveStatus("error");
    }
    setIsSaving(false);
  };

  const toggleArrayItem = (
    field: "skills" | "interests" | "lookingFor",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-2xl">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to dashboard
      </Link>

      {/* Header with Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={session?.user?.image || ""} />
          <AvatarFallback className="text-xl">
            {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">{session?.user?.email}</p>
        </div>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Help others in the community find and connect with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Your name"
                maxLength={100}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell others about yourself, your background, and what you're working on..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bio.length}/500
              </p>
            </div>

            {/* Persona Selection */}
            <div className="space-y-3">
              <Label>I am a...</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {PERSONAS.map((persona) => (
                  <label
                    key={persona.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.persona === persona.value
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="persona"
                      value={persona.value}
                      checked={formData.persona === persona.value}
                      onChange={(e) =>
                        setFormData({ ...formData, persona: e.target.value })
                      }
                      className="sr-only"
                    />
                    <persona.icon
                      className={`h-5 w-5 ${
                        formData.persona === persona.value
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div>
                      <div className="text-sm font-medium">{persona.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {persona.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2">
                {SKILLS_OPTIONS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleArrayItem("skills", skill)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      formData.skills.includes(skill)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary/50"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {formData.skills.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formData.skills.length} selected
                </p>
              )}
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <Label>Healthcare Interests</Label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleArrayItem("interests", interest)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      formData.interests.includes(interest)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary/50"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {formData.interests.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formData.interests.length} selected
                </p>
              )}
            </div>

            {/* Looking For */}
            <div className="space-y-3">
              <Label>Looking for...</Label>
              <div className="flex flex-wrap gap-2">
                {LOOKING_FOR_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayItem("lookingFor", item)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      formData.lookingFor.includes(item)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary/50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {formData.lookingFor.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formData.lookingFor.length} selected
                </p>
              )}
            </div>

            {/* Integration Usernames */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="github" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub Username
                </Label>
                <Input
                  id="github"
                  value={formData.githubUsername}
                  onChange={(e) =>
                    setFormData({ ...formData, githubUsername: e.target.value })
                  }
                  placeholder="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="huggingface" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Hugging Face Username
                </Label>
                <Input
                  id="huggingface"
                  value={formData.huggingfaceUsername}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      huggingfaceUsername: e.target.value,
                    })
                  }
                  placeholder="username"
                />
              </div>
            </div>

            {/* Error Message */}
            {saveStatus === "error" && errorMessage && (
              <p className="text-sm text-red-500 text-center">{errorMessage}</p>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saveStatus === "success" ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
