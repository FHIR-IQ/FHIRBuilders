"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  Send,
  RefreshCw,
  Search,
  Copy,
  Check,
} from "lucide-react";

interface WaitlistEntry {
  id: string;
  email: string;
  persona: string | null;
  building: string;
  painPoint: string | null;
  lookingFor: string | null;
  canInterview: boolean;
  status: string;
  notes: string | null;
  sandboxCreated: boolean;
  welcomeEmailSent: boolean;
  interviewCompleted: boolean;
  feedbackReceived: boolean;
  createdAt: string;
}

const PERSONA_LABELS: Record<string, string> = {
  developer: "Developer",
  healthcare: "Healthcare Pro",
  investor: "Investor",
  learner: "Learner",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SELECTED: "bg-blue-100 text-blue-800",
  ONBOARDING: "bg-purple-100 text-purple-800",
  ACTIVE: "bg-green-100 text-green-800",
  CHURNED: "bg-red-100 text-red-800",
  CONVERTED: "bg-emerald-100 text-emerald-800",
};

// Welcome email template for copy/paste
const getWelcomeEmailTemplate = (entry: WaitlistEntry) => `Subject: Your FHIRBuilders Sandbox is Ready 🚀

Hi there,

Your personal FHIR sandbox is live! Here's everything you need:

**Your Sandbox**
- URL: https://api.medplum.com/fhir/R4/[PROJECT_ID]
- Client ID: [CLIENT_ID]
- Client Secret: [CLIENT_SECRET]

**Quick Start**
Try these queries right now:

1. Get all patients:
   curl "[URL]/Patient" -H "Authorization: Bearer [TOKEN]"

2. Search by condition:
   curl "[URL]/Condition?code=44054006" -H "Authorization: Bearer [TOKEN]"

3. Recent observations:
   curl "[URL]/Observation?_sort=-date&_count=10" -H "Authorization: Bearer [TOKEN]"

**What's Included**
- 100 synthetic patients (Synthea-generated)
- Full FHIR R4 support
- Read/write access
- 30-day sandbox lifetime (extendable)

**One Ask**
I'd love to hear what you're building and how the sandbox helps (or doesn't).
Reply to this email or book a 15-min call: [CALENDLY_LINK]

Happy building!
The FHIRBuilders Team

---
Persona: ${entry.persona ? PERSONA_LABELS[entry.persona] || entry.persona : "Not specified"}
Project they're building: ${entry.building}
Pain point: ${entry.painPoint || "Not specified"}
Looking for: ${entry.lookingFor || "Not specified"}
Open to interview: ${entry.canInterview ? "Yes" : "No"}
`;

export default function WaitlistAdminPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/waitlist");
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to fetch waitlist:", error);
    }
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/waitlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchEntries();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const toggleFlag = async (id: string, field: string, value: boolean) => {
    try {
      await fetch(`/api/admin/waitlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      fetchEntries();
    } catch (error) {
      console.error("Failed to toggle flag:", error);
    }
  };

  const copyEmailTemplate = (entry: WaitlistEntry) => {
    navigator.clipboard.writeText(getWelcomeEmailTemplate(entry));
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: entries.length,
    pending: entries.filter((e) => e.status === "PENDING").length,
    selected: entries.filter((e) => e.status === "SELECTED").length,
    active: entries.filter((e) => e.status === "ACTIVE").length,
    interviewReady: entries.filter((e) => e.canInterview && !e.interviewCompleted).length,
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Waitlist Management</h1>
            <p className="text-muted-foreground mt-1">
              Manual sandbox provisioning for first 20 users
            </p>
          </div>
          <Button onClick={fetchEntries} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total signups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{stats.selected}</span>
            </div>
            <p className="text-sm text-muted-foreground">Selected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active sandboxes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">{stats.interviewReady}</span>
            </div>
            <p className="text-sm text-muted-foreground">Ready to interview</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or project..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading waitlist entries...
            </CardContent>
          </Card>
        ) : filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No waitlist entries yet. Share the early access page to get signups!
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {entry.email}
                      {entry.canInterview && (
                        <Badge variant="outline" className="text-xs">
                          <Phone className="mr-1 h-3 w-3" />
                          Open to call
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Signed up {new Date(entry.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={STATUS_COLORS[entry.status] || ""}>
                    {entry.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Project Description */}
                  <div>
                    <p className="text-sm font-medium mb-1">Building:</p>
                    <p className="text-sm text-muted-foreground">{entry.building}</p>
                  </div>

                  {entry.painPoint && (
                    <div>
                      <p className="text-sm font-medium mb-1">Pain point:</p>
                      <p className="text-sm text-muted-foreground">{entry.painPoint}</p>
                    </div>
                  )}

                  {/* Progress Checkboxes */}
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={entry.sandboxCreated}
                        onChange={(e) => toggleFlag(entry.id, "sandboxCreated", e.target.checked)}
                      />
                      Sandbox created
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={entry.welcomeEmailSent}
                        onChange={(e) => toggleFlag(entry.id, "welcomeEmailSent", e.target.checked)}
                      />
                      Welcome email sent
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={entry.interviewCompleted}
                        onChange={(e) => toggleFlag(entry.id, "interviewCompleted", e.target.checked)}
                      />
                      Interview done
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={entry.feedbackReceived}
                        onChange={(e) => toggleFlag(entry.id, "feedbackReceived", e.target.checked)}
                      />
                      Feedback received
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {entry.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(entry.id, "SELECTED")}
                      >
                        Select for onboarding
                      </Button>
                    )}
                    {entry.status === "SELECTED" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(entry.id, "ONBOARDING")}
                      >
                        Start onboarding
                      </Button>
                    )}
                    {entry.status === "ONBOARDING" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(entry.id, "ACTIVE")}
                      >
                        Mark as active
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyEmailTemplate(entry)}
                    >
                      {copiedId === entry.id ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" />
                          Copy email template
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`mailto:${entry.email}`)}
                    >
                      <Mail className="mr-1 h-3 w-3" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Manual Process Reminder */}
      <Card className="mt-8 border-blue-500/50 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-lg">Manual Onboarding Process</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Review waitlist entries and select top 20 based on engagement potential</li>
            <li>Create Medplum project for each selected user manually</li>
            <li>Load 100 Synthea patients into their project</li>
            <li>Generate API credentials (client ID + secret)</li>
            <li>Copy welcome email template, fill in credentials, and send</li>
            <li>Schedule 15-min call with users who opted in</li>
            <li>Track sandbox usage and follow up after 7 days</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
