"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Check,
  Play,
  Loader2,
  Save,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  Activity,
  Pill,
  Stethoscope,
  FileText,
  Eye,
  AlertTriangle,
  ShieldCheck,
  Zap,
  BookOpen,
  Code,
  ShieldAlert,
  X,
  Bell,
  ArrowRight,
} from "lucide-react";
import { type MedConflict } from "@/lib/medplum";

// Demo sandbox configuration
const DEMO_SANDBOX = {
  id: "demo-sandbox-001",
  baseUrl: "https://api.medplum.com/fhir/R4",
  patientCount: 100,
  createdAt: new Date().toISOString(),
};

// Sample FHIR resources for the demo
const SAMPLE_RESOURCES = {
  Patient: {
    resourceType: "Patient",
    id: "example-patient-1",
    name: [{ family: "Smith", given: ["John", "Michael"] }],
    gender: "male",
    birthDate: "1970-01-15",
    address: [{ city: "Boston", state: "MA", postalCode: "02101" }],
  },
  Observation: {
    resourceType: "Observation",
    id: "example-obs-1",
    status: "final",
    code: { coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }] },
    valueQuantity: { value: 72, unit: "beats/minute" },
    effectiveDateTime: "2024-01-15T10:30:00Z",
  },
  Condition: {
    resourceType: "Condition",
    id: "example-condition-1",
    clinicalStatus: { coding: [{ code: "active" }] },
    code: { coding: [{ system: "http://snomed.info/sct", code: "44054006", display: "Type 2 diabetes mellitus" }] },
    subject: { reference: "Patient/example-patient-1" },
    onsetDateTime: "2020-06-15",
  },
};

// Quick queries for the explorer
const QUICK_QUERIES = [
  { label: "All Patients", method: "GET", path: "/Patient", description: "List all patients" },
  { label: "Patient by ID", method: "GET", path: "/Patient/example-patient-1", description: "Get specific patient" },
  { label: "Search by Name", method: "GET", path: "/Patient?name=Smith", description: "Find patients by name" },
  { label: "Observations", method: "GET", path: "/Observation?_count=10", description: "Recent observations" },
  { label: "Conditions", method: "GET", path: "/Condition?clinical-status=active", description: "Active conditions" },
  { label: "Medications", method: "GET", path: "/MedicationRequest?status=active", description: "Active medications" },
];

// Sample patients for visual explorer
const SAMPLE_PATIENTS = [
  {
    id: "patient-001",
    name: "John Michael Smith",
    gender: "Male",
    birthDate: "1970-01-15",
    age: 55,
    address: "Boston, MA",
    conditions: [
      { name: "Type 2 Diabetes Mellitus", status: "active", onset: "2020-06-15", code: "44054006" },
      { name: "Essential Hypertension", status: "active", onset: "2018-03-20", code: "59621000" },
      { name: "Hyperlipidemia", status: "active", onset: "2019-11-08", code: "55822004" },
    ],
    medications: [
      { id: "med-101", name: "Metformin 500mg", dosage: "Twice daily", status: "active", prescriber: "Dr. Chen" },
      { id: "med-102", name: "Lisinopril 10mg", dosage: "Once daily", status: "active", prescriber: "Dr. Chen" },
      { id: "med-103", name: "Atorvastatin 20mg", dosage: "Once daily at bedtime", status: "active", prescriber: "Dr. Patel" },
    ],
    observations: [
      { type: "Blood Pressure", value: "138/88 mmHg", date: "2024-01-15", status: "high" },
      { type: "Heart Rate", value: "72 bpm", date: "2024-01-15", status: "normal" },
      { type: "HbA1c", value: "7.2%", date: "2024-01-10", status: "elevated" },
      { type: "LDL Cholesterol", value: "110 mg/dL", date: "2024-01-10", status: "borderline" },
      { type: "Weight", value: "195 lbs", date: "2024-01-15", status: "normal" },
    ],
    encounters: [
      { type: "Office Visit", date: "2024-01-15", provider: "Dr. Chen", reason: "Diabetes follow-up" },
      { type: "Lab Work", date: "2024-01-10", provider: "Quest Diagnostics", reason: "Annual labs" },
      { type: "Office Visit", date: "2023-10-20", provider: "Dr. Patel", reason: "Lipid management" },
    ],
  },
  {
    id: "patient-002",
    name: "Emily Rose Johnson",
    gender: "Female",
    birthDate: "1985-08-22",
    age: 39,
    address: "Cambridge, MA",
    conditions: [
      { name: "Asthma", status: "active", onset: "2005-04-10", code: "195967001" },
      { name: "Seasonal Allergies", status: "active", onset: "2010-03-15", code: "232347008" },
    ],
    medications: [
      { id: "med-201", name: "Albuterol Inhaler", dosage: "As needed", status: "active", prescriber: "Dr. Williams" },
      { id: "med-202", name: "Fluticasone Nasal Spray", dosage: "Once daily", status: "active", prescriber: "Dr. Williams" },
    ],
    observations: [
      { type: "Blood Pressure", value: "118/76 mmHg", date: "2024-01-12", status: "normal" },
      { type: "Heart Rate", value: "68 bpm", date: "2024-01-12", status: "normal" },
      { type: "Peak Flow", value: "420 L/min", date: "2024-01-12", status: "normal" },
      { type: "SpO2", value: "98%", date: "2024-01-12", status: "normal" },
    ],
    encounters: [
      { type: "Office Visit", date: "2024-01-12", provider: "Dr. Williams", reason: "Asthma check-up" },
      { type: "Telehealth", date: "2023-11-05", provider: "Dr. Williams", reason: "Medication refill" },
    ],
  },
  {
    id: "patient-003",
    name: "Robert James Wilson",
    gender: "Male",
    birthDate: "1958-12-03",
    age: 66,
    address: "Somerville, MA",
    conditions: [
      { name: "Coronary Artery Disease", status: "active", onset: "2015-09-12", code: "53741008" },
      { name: "Atrial Fibrillation", status: "active", onset: "2018-02-28", code: "49436004" },
      { name: "Type 2 Diabetes Mellitus", status: "active", onset: "2012-05-15", code: "44054006" },
      { name: "Chronic Kidney Disease Stage 3", status: "active", onset: "2020-08-10", code: "709044004" },
    ],
    medications: [
      { id: "med-301", name: "Aspirin 81mg", dosage: "Once daily", status: "active", prescriber: "Dr. Martinez" },
      { id: "med-302", name: "Metoprolol 50mg", dosage: "Twice daily", status: "active", prescriber: "Dr. Martinez" },
      { id: "med-303", name: "Apixaban 5mg", dosage: "Twice daily", status: "active", prescriber: "Dr. Martinez" },
      { id: "med-304", name: "Metformin 1000mg", dosage: "Twice daily", status: "active", prescriber: "Dr. Lee" },
      { id: "med-305", name: "Atorvastatin 40mg", dosage: "Once daily", status: "active", prescriber: "Dr. Martinez" },
    ],
    observations: [
      { type: "Blood Pressure", value: "145/92 mmHg", date: "2024-01-14", status: "high" },
      { type: "Heart Rate", value: "78 bpm (irregular)", date: "2024-01-14", status: "abnormal" },
      { type: "eGFR", value: "45 mL/min", date: "2024-01-08", status: "low" },
      { type: "HbA1c", value: "7.8%", date: "2024-01-08", status: "elevated" },
      { type: "BNP", value: "280 pg/mL", date: "2024-01-08", status: "elevated" },
    ],
    encounters: [
      { type: "Cardiology Visit", date: "2024-01-14", provider: "Dr. Martinez", reason: "AFib management" },
      { type: "Lab Work", date: "2024-01-08", provider: "Boston Labs", reason: "Quarterly monitoring" },
      { type: "Nephrology Visit", date: "2023-12-15", provider: "Dr. Kim", reason: "CKD follow-up" },
    ],
  },
  {
    id: "patient-004",
    name: "Thomas B. Anderson (High Risk)",
    gender: "Male",
    birthDate: "1942-03-10",
    age: 82,
    address: "Brookline, MA",
    conditions: [
      { name: "Heart Failure", status: "active", onset: "2018-05-20", code: "84114007" },
      { name: "Hyperlipidemia", status: "active", onset: "2010-11-25", code: "55822004" },
      { name: "Hypertension", status: "active", onset: "2008-01-15", code: "38341003" },
    ],
    medications: [
      { id: "med-401", name: "Warfarin 5mg", dosage: "Daily (adjusted)", status: "active", prescriber: "Dr. Singh" },
      { id: "med-402", name: "Aspirin 325mg", dosage: "Once daily", status: "active", prescriber: "Dr. Singh" }, // Conflict 1
      { id: "med-403", name: "Lisinopril 20mg", dosage: "Once daily", status: "active", prescriber: "Dr. Singh" }, // Conflict 2 (Allergy)
      { id: "med-404", name: "Atorvastatin 80mg", dosage: "Once daily", status: "active", prescriber: "Dr. Chen" },
      { id: "med-405", name: "Simvastatin 40mg", dosage: "Once daily", status: "active", prescriber: "Dr. Singh" }, // Conflict 3
    ],
    observations: [
      { type: "INR", value: "3.2", date: "2024-01-18", status: "high" },
      { type: "Blood Pressure", value: "152/94 mmHg", date: "2024-01-18", status: "high" },
      { type: "Potassium", value: "5.1 mEq/L", date: "2024-01-12", status: "high" },
    ],
    encounters: [
      { type: "Urgent Care", date: "2024-01-18", provider: "MGH Urgent Care", reason: "Shortness of breath" },
    ],
  },
  {
    id: "patient-005",
    name: "Baby Jane Doe (Newborn)",
    gender: "Female",
    birthDate: "2024-01-20",
    age: 0,
    address: "Boston, MA",
    conditions: [],
    medications: [],
    observations: [
      { type: "Weight", value: "7 lbs 8 oz", date: "2024-01-20", status: "normal" },
    ],
    encounters: [
      { type: "Birth", date: "2024-01-20", provider: "MGH L&D", reason: "Standard delivery" },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  normal: "bg-green-100 text-green-800",
  high: "bg-red-100 text-red-800",
  low: "bg-blue-100 text-blue-800",
  elevated: "bg-amber-100 text-amber-800",
  borderline: "bg-yellow-100 text-yellow-800",
  abnormal: "bg-red-100 text-red-800",
  active: "bg-green-100 text-green-800",
};

const AUDIT_LOGIC = `
// Clinical Audit Logic (Simulated)
// 1. Duplicate Therapy Detection: Checks for multiple meds in same class (e.g. Statins)
// 2. Drug-Drug Interaction: References FDA cross-interaction table (e.g. Warfarin + NSAID)
// 3. Allergy Matching: Cross-checks Active Meds against AllergyIntolerance resources
// 4. Lab-Medication Conflict: Checks for contradictions with latest Observation (e.g. Potassium + ACEI)
`.trim();

const MedRecDashboard = ({
  patient,
  conflicts,
  onRunAudit,
  isAnalyzing,
  isAuthenticated,
}: {
  patient: typeof SAMPLE_PATIENTS[number];
  conflicts: MedConflict[];
  onRunAudit: () => void;
  isAnalyzing: boolean;
  isAuthenticated: boolean;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            AI Medication Audit
            {conflicts.length > 0 && (
              <Badge variant="destructive" className="ml-2 animate-in fade-in zoom-in duration-300">
                {conflicts.length} Risks Detected
              </Badge>
            )}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              Automated conflict detection and reconciliation assistant
            </p>
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
              AI-Powered Analysis
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const win = window.open("", "_blank");
              if (win) {
                win.document.write(`<html><head><title>Audit Logic | FHIRBuilders</title><style>body{font-family:sans-serif;padding:2rem;line-height:1.6;background:#f9fafb;}pre{background:#1e293b;color:#f1f5f9;padding:1rem;border-radius:0.5rem;overflow-x:auto;}</style></head><body><h1>Clinical Audit Logic</h1><p>The following rules are applied during the medication reconciliation audit:</p><pre>${AUDIT_LOGIC}</pre></body></html>`);
                win.document.close();
              }
            }}
          >
            <Code className="mr-2 h-4 w-4" />
            View Logic
          </Button>
          <Button
            onClick={onRunAudit}
            disabled={isAnalyzing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Run Audit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Conflict Analysis */}
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Potential Risks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conflicts.length > 0 ? (
              conflicts.map((c: any) => (
                <div key={c.id} className="p-4 rounded-lg bg-white border border-amber-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={c.severity === "high" ? "destructive" : "secondary"}>
                      {c.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-medium text-amber-700">Severity: {c.severity}</span>
                  </div>
                  <p className="text-sm font-medium">{c.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-2">
                      {c.resources.map((rId: string) => (
                        <Badge key={rId} variant="outline" className="text-[10px] font-mono whitespace-nowrap">
                          {rId}
                        </Badge>
                      ))}
                    </div>
                    {c.evidence && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 italic">
                        <BookOpen className="h-3 w-3" />
                        {c.evidence}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                {isAnalyzing ? (
                  <p className="text-muted-foreground italic">Analyzing FHIR resources...</p>
                ) : (
                  <p className="text-muted-foreground">No conflicts detected. Run audit to refresh.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medication List Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Reconciliation List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isAnalyzing ? (
                // Skeleton Loaders for Delight
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 animate-pulse">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                    <div className="h-4 bg-muted rounded w-16" />
                  </div>
                ))
              ) : patient.medications.length > 0 ? (
                patient.medications.map((med: any, i: number) => {
                  const isConflicting = conflicts.some(c => c.resources.includes(med.id));
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${isConflicting ? "border-amber-300 bg-amber-50 shadow-inner" : "bg-card px-4"
                        }`}
                    >
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          {med.name}
                          {isConflicting && <AlertCircle className="h-3 w-3 text-amber-600 animate-bounce" />}
                        </div>
                        <div className="text-xs text-muted-foreground">{med.dosage}</div>
                      </div>
                      <Badge variant="outline" className={isConflicting ? "bg-amber-100/50 text-amber-700" : "text-green-600 border-green-200 bg-green-50"}>
                        {isConflicting ? "Flagged" : "Verified"}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground italic text-sm bg-muted/10 rounded-xl border border-dashed animate-in fade-in zoom-in duration-500">
                  <Pill className="h-8 w-8 mb-2 opacity-20" />
                  No active medications found for reconciliation.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Insights */}
      <Card className="bg-slate-900 text-slate-100">
        <CardContent className="py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-400 font-semibold tracking-wider uppercase">Clinical Insight</p>
              <p className="font-medium">Combined medication load shows increased risk for renal stress (eGFR: 45).</p>
            </div>
          </div>
          <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
            View Analytics
          </Button>
        </CardContent>
      </Card>

      {/* Sign-in prompt for anonymous users viewing mock results */}
      {conflicts.length > 0 && !isAuthenticated && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-800">Want AI-powered analysis?</p>
                <p className="text-sm text-blue-700/80">
                  Sign in to get real-time AI medication conflict detection with Claude.
                </p>
              </div>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Full App CTA */}
      {conflicts.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">Build a Full Medication Management App</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Turn this demo into a deployable FHIR application with OpenClaw AI code generation.
                </p>
              </div>
              <Button asChild className="gap-2">
                <Link href="/openclaw?template=medication-tracker">
                  Generate Full App
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function DemoSandboxContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [query, setQuery] = useState("/Patient");
  const [method, setMethod] = useState("GET");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"api" | "visual">("visual");
  const [selectedPatient, setSelectedPatient] = useState(SAMPLE_PATIENTS[0]);
  const [useCaseMode, setUseCaseMode] = useState<"standard" | "medrec">("standard");
  const [conflicts, setConflicts] = useState<MedConflict[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "error" | "success" | "info" } | null>(null);

  // Handle ?useCase=medrec URL param
  useEffect(() => {
    if (searchParams.get("useCase") === "medrec") {
      setUseCaseMode("medrec");
      // Select high-risk patient for best demo experience
      const highRiskPatient = SAMPLE_PATIENTS.find((p) => p.id === "patient-004");
      if (highRiskPatient) {
        setSelectedPatient(highRiskPatient);
      }
    }
  }, [searchParams]);

  const handleRunMedRec = async () => {
    setIsAnalyzing(true);
    setConflicts([]);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medications: selectedPatient.medications,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "AI Analysis failed");
      }

      const data = await res.json();
      if (data.mock) {
        setNotification({ message: data.message, type: "info" });
        setTimeout(() => setNotification(null), 5000);
      }
      setConflicts(data.conflicts);
    } catch (error: unknown) {
      console.error("Analysis error:", error);
      const message = error instanceof Error ? error.message : "AI Analysis failed";
      setNotification({ message, type: "error" });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fullUrl = `${DEMO_SANDBOX.baseUrl}${query}`;

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    if (!query || query === "/") {
      setResponse(JSON.stringify({ error: "No resource path specified. Try /Patient or /Observation" }, null, 2));
      return;
    }

    setIsLoading(true);
    // Simulate API call with sample data
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return sample response based on query
    let sampleResponse;
    if (query.includes("/Patient") && !query.includes("?")) {
      sampleResponse = {
        resourceType: "Bundle",
        type: "searchset",
        total: 100,
        entry: [
          { resource: SAMPLE_RESOURCES.Patient },
          { resource: { ...SAMPLE_RESOURCES.Patient, id: "example-patient-2", name: [{ family: "Johnson", given: ["Emily"] }] } },
        ],
      };
    } else if (query.includes("Observation")) {
      sampleResponse = {
        resourceType: "Bundle",
        type: "searchset",
        total: 50,
        entry: [{ resource: SAMPLE_RESOURCES.Observation }],
      };
    } else if (query.includes("Condition")) {
      sampleResponse = {
        resourceType: "Bundle",
        type: "searchset",
        total: 25,
        entry: [{ resource: SAMPLE_RESOURCES.Condition }],
      };
    } else {
      sampleResponse = SAMPLE_RESOURCES.Patient;
    }

    setResponse(JSON.stringify(sampleResponse, null, 2));
    setIsLoading(false);
  };

  const handleQuickQuery = (q: typeof QUICK_QUERIES[0]) => {
    setMethod(q.method);
    setQuery(q.path);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/sandbox/demo" className="hover:text-foreground">Sandbox</Link>
          {useCaseMode === "medrec" && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span>Medication Reconciliation</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {useCaseMode === "medrec" ? "Medication Reconciliation Demo" : "Demo Sandbox"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {useCaseMode === "medrec"
                ? "AI-powered medication conflict detection with FHIR R4 data"
                : "Explore FHIR R4 with 100 synthetic patients"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              Synthetic Data
            </Badge>
            <Badge variant="secondary">Demo Mode</Badge>
            <Button variant="outline" asChild title="Save this sandbox configuration to your account for future use">
              <Link href="/login">
                <Save className="mr-2 h-4 w-4" />
                Save Meta
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Notification Toast */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center justify-between shadow-xl animate-in slide-in-from-top-4 duration-300 ${notification.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
              notification.type === "success" ? "bg-green-50 border-green-200 text-green-800" :
                "bg-blue-50 border-blue-200 text-blue-800"
            }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "error" ? <AlertCircle className="h-5 w-5" /> :
              notification.type === "success" ? <ShieldCheck className="h-5 w-5" /> :
                <Bell className="h-5 w-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="hover:opacity-70 transition-opacity">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Sandbox Info Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your FHIR Endpoint</CardTitle>
          <CardDescription>Use this URL in your application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono overflow-x-auto">
              {DEMO_SANDBOX.baseUrl}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(DEMO_SANDBOX.baseUrl)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
            <span>FHIR R4</span>
            <span>•</span>
            <span>100 Patients</span>
            <span>•</span>
            <span>Synthea Data</span>
          </div>
        </CardContent>
      </Card>

      {/* View Mode & Use Case Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">View:</span>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "visual" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("visual")}
            >
              <Eye className="mr-2 h-4 w-4" />
              Visual Explorer
            </Button>
            <Button
              variant={viewMode === "api" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("api")}
            >
              <FileText className="mr-2 h-4 w-4" />
              API Explorer
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-amber-600 flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Use Case:
          </span>
          <div className="flex gap-2 border border-amber-500/30 p-1 rounded-lg bg-amber-500/5">
            <Button
              variant={useCaseMode === "standard" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setUseCaseMode("standard")}
              className="text-xs h-8"
            >
              Standard
            </Button>
            <Button
              variant={useCaseMode === "medrec" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setUseCaseMode("medrec")}
              className="text-xs h-8"
            >
              MedRec AI
            </Button>
          </div>
        </div>
      </div>

      {/* Visual Explorer View */}
      {viewMode === "visual" && (
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {/* Patient List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Sample Patients</CardTitle>
                <CardDescription>Click to explore</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {SAMPLE_PATIENTS.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedPatient.id === patient.id
                      ? "bg-primary/10 border border-primary/50"
                      : "hover:bg-muted"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{patient.name.split(" ")[0]} {patient.name.split(" ").slice(-1)}</div>
                        <div className="text-xs text-muted-foreground">
                          {patient.age}yo {patient.gender}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {patient.conditions.length} conditions
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {patient.medications.length} meds
                      </Badge>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Patient Detail View */}
          <div className="lg:col-span-3 space-y-6">
            {/* Patient Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                      <div className="flex items-center gap-4 text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {selectedPatient.birthDate} ({selectedPatient.age}yo)
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {selectedPatient.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge>{selectedPatient.gender}</Badge>
                </div>
              </CardContent>
            </Card>

            {useCaseMode === "standard" ? (
              <>
                {/* Vitals/Observations */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Recent Observations</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {selectedPatient.observations.map((obs, i) => (
                        <div key={i} className="p-3 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{obs.type}</span>
                            <Badge variant="secondary" className={`text-xs ${STATUS_COLORS[obs.status]}`}>
                              {obs.status}
                            </Badge>
                          </div>
                          <div className="text-xl font-bold">{obs.value}</div>
                          <div className="text-xs text-muted-foreground mt-1">{obs.date}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Conditions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Active Conditions</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedPatient.conditions.map((condition, i) => (
                          <div key={i} className="flex items-start justify-between p-3 rounded-lg border">
                            <div>
                              <div className="font-medium text-sm">{condition.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Since {condition.onset}
                              </div>
                            </div>
                            <Badge variant="secondary" className={`text-xs ${STATUS_COLORS[condition.status] || "bg-muted"}`}>
                              {condition.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Medications */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Active Medications</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedPatient.medications.map((med, i) => (
                          <div key={i} className="p-3 rounded-lg border">
                            <div className="font-medium text-sm">{med.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {med.dosage} • {med.prescriber}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Encounters */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Recent Encounters</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPatient.encounters.map((encounter, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{encounter.type}</span>
                              <span className="text-xs text-muted-foreground">{encounter.date}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {encounter.provider} • {encounter.reason}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <MedRecDashboard
                patient={selectedPatient}
                conflicts={conflicts}
                onRunAudit={handleRunMedRec}
                isAnalyzing={isAnalyzing}
                isAuthenticated={!!session}
              />
            )}

            {/* Link to API View */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Want to see the raw FHIR data?</p>
                      <p className="text-sm text-muted-foreground">
                        Switch to API Explorer to see the JSON
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setViewMode("api")}>
                      <FileText className="mr-2 h-4 w-4" />
                      View JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">Ready to move to production?</p>
                      <p className="text-sm text-green-700/80">
                        Migrate this setup to a real Medplum project
                      </p>
                    </div>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                      title="Export this data and setup to a production Medplum instance"
                      onClick={() => setShowExportDialog(true)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Deploy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Export to Medplum Dialog Placeholder */}
      {showExportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Export to Medplum</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowExportDialog(false)}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Follow these steps to migrate your FHIR configuration to a production environment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted border space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="text-sm font-medium">Create a Medplum Account</p>
                    <p className="text-xs text-muted-foreground">Sign up at medplum.com if you haven't already.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="text-sm font-medium">Run the Migration Script</p>
                    <p className="text-xs text-muted-foreground">Use our CLI tool to push these resources to your project.</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded font-mono text-xs text-zinc-300">
                npx fhirbuilders-cli export --project YOUR_PROJECT_ID
              </div>

              <div className="flex flex-col gap-2">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" />
                  Download Configuration (JSON)
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setShowExportDialog(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Explorer View */}
      {viewMode === "api" && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Quick Queries Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Queries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {QUICK_QUERIES.map((q) => (
                  <button
                    key={q.path}
                    onClick={() => handleQuickQuery(q)}
                    className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {q.method}
                      </Badge>
                      <span className="text-sm font-medium">{q.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{q.description}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Resources Reference */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Available Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {["Patient", "Observation", "Condition", "Procedure", "MedicationRequest", "Encounter", "DiagnosticReport", "AllergyIntolerance"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setQuery(`/${r}`)}
                      className="block w-full text-left px-2 py-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Explorer Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">API Explorer</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Query Input */}
                <div className="flex gap-2 mb-4">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="px-3 py-2 rounded border bg-background text-sm font-mono"
                    aria-label="HTTP method"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <div className="flex-1 flex items-center bg-muted rounded px-3">
                    <span className="text-sm text-muted-foreground font-mono">
                      {DEMO_SANDBOX.baseUrl}
                    </span>
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="border-0 bg-transparent focus-visible:ring-0 font-mono"
                      placeholder="/Patient"
                    />
                  </div>
                  <Button onClick={handleExecute} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>

                {/* Response Area */}
                <Tabs defaultValue="response" className="w-full">
                  <TabsList>
                    <div className="flex gap-2">
                      <TabsTrigger value="response">Response</TabsTrigger>
                      <TabsTrigger value="headers">Headers</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="snippet">Snippet</TabsTrigger>
                    </div>
                    {response && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setResponse(null)}
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </Button>
                    )}
                  </TabsList>

                  <TabsContent value="response" className="mt-4">
                    {response ? (
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(response)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded overflow-x-auto text-sm font-mono max-h-[500px]">
                          {response}
                        </pre>
                      </div>
                    ) : (
                      <div className="bg-muted rounded p-8 text-center">
                        <p className="text-muted-foreground">
                          Click &quot;Send&quot; to execute the query
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="headers" className="mt-4">
                    <div className="bg-muted rounded p-4 font-mono text-sm space-y-1">
                      <div><span className="text-muted-foreground">Content-Type:</span> application/fhir+json</div>
                      <div><span className="text-muted-foreground">Accept:</span> application/fhir+json</div>
                      <div><span className="text-muted-foreground">Authorization:</span> Bearer [your-token]</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="curl" className="mt-4">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(`curl -X ${method} "${fullUrl}" \\\n  -H "Content-Type: application/fhir+json" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="bg-zinc-900 text-zinc-100 p-4 rounded overflow-x-auto text-sm font-mono">
                        {`curl -X ${method} "${fullUrl}" \\
  -H "Content-Type: application/fhir+json" \\
  -H "Authorization: Bearer YOUR_TOKEN"`}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="snippet" className="mt-4">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(`const fhirData = ${response || "{}"};`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="bg-zinc-900 text-zinc-100 p-4 rounded overflow-x-auto text-sm font-mono max-h-[500px]">
                        {`// Code Snippet (Generated)
const fetchFhirData = async () => {
  const response = await fetch('${fullUrl}');
  const data = await response.json();
  return data;
};

// Resulting Data Structure:
const result = ${response ? response.substring(0, 500) + (response.length > 500 ? "..." : "") : "{}"};`}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Demo Notice */}
            <Card className="mt-4 border-amber-500/50 bg-amber-500/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-600">Demo Mode</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This is a demo sandbox with simulated responses.
                      <Link href="/login" className="text-primary hover:underline ml-1">
                        Sign up
                      </Link>
                      to get a real FHIR endpoint with persistent data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Examples */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Use in Your App</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="javascript">
                  <TabsList>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>

                  <TabsContent value="javascript" className="mt-4">
                    <pre className="bg-zinc-900 text-zinc-100 p-4 rounded overflow-x-auto text-sm font-mono">
                      {`// Using fetch
const response = await fetch('${DEMO_SANDBOX.baseUrl}/Patient', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/fhir+json'
  }
});
const patients = await response.json();
console.log(patients.entry);`}
                    </pre>
                  </TabsContent>

                  <TabsContent value="python" className="mt-4">
                    <pre className="bg-zinc-900 text-zinc-100 p-4 rounded overflow-x-auto text-sm font-mono">
                      {`import requests

response = requests.get(
    '${DEMO_SANDBOX.baseUrl}/Patient',
    headers={
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/fhir+json'
    }
)
patients = response.json()
print(patients['entry'])`}
                    </pre>
                  </TabsContent>

                  <TabsContent value="curl" className="mt-4">
                    <pre className="bg-zinc-900 text-zinc-100 p-4 rounded overflow-x-auto text-sm font-mono">
                      {`curl "${DEMO_SANDBOX.baseUrl}/Patient" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/fhir+json"`}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DemoSandboxPage() {
  return (
    <Suspense fallback={<div className="container py-8"><p>Loading...</p></div>}>
      <DemoSandboxContent />
    </Suspense>
  );
}
