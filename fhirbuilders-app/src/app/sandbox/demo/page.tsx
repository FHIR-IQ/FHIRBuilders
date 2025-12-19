"use client";

import { useState } from "react";
import Link from "next/link";
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
  Heart,
  Thermometer,
  Eye,
} from "lucide-react";

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
      { name: "Metformin 500mg", dosage: "Twice daily", status: "active", prescriber: "Dr. Chen" },
      { name: "Lisinopril 10mg", dosage: "Once daily", status: "active", prescriber: "Dr. Chen" },
      { name: "Atorvastatin 20mg", dosage: "Once daily at bedtime", status: "active", prescriber: "Dr. Patel" },
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
      { name: "Albuterol Inhaler", dosage: "As needed", status: "active", prescriber: "Dr. Williams" },
      { name: "Fluticasone Nasal Spray", dosage: "Once daily", status: "active", prescriber: "Dr. Williams" },
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
      { name: "Aspirin 81mg", dosage: "Once daily", status: "active", prescriber: "Dr. Martinez" },
      { name: "Metoprolol 50mg", dosage: "Twice daily", status: "active", prescriber: "Dr. Martinez" },
      { name: "Apixaban 5mg", dosage: "Twice daily", status: "active", prescriber: "Dr. Martinez" },
      { name: "Metformin 1000mg", dosage: "Twice daily", status: "active", prescriber: "Dr. Lee" },
      { name: "Atorvastatin 40mg", dosage: "Once daily", status: "active", prescriber: "Dr. Martinez" },
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

export default function DemoSandboxPage() {
  const [query, setQuery] = useState("/Patient");
  const [method, setMethod] = useState("GET");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"api" | "visual">("visual");
  const [selectedPatient, setSelectedPatient] = useState(SAMPLE_PATIENTS[0]);

  const fullUrl = `${DEMO_SANDBOX.baseUrl}${query}`;

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
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
          <span>Sandbox</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Demo Sandbox</h1>
            <p className="text-muted-foreground mt-1">
              Explore FHIR R4 with 100 synthetic patients
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Demo Mode</Badge>
            <Button variant="outline" asChild>
              <Link href="/login">
                <Save className="mr-2 h-4 w-4" />
                Save Sandbox
              </Link>
            </Button>
          </div>
        </div>
      </div>

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

      {/* View Mode Toggle */}
      <div className="flex items-center gap-4 mb-6">
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
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedPatient.id === patient.id
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
                        <Badge variant="secondary" className={`text-xs ${STATUS_COLORS[condition.status]}`}>
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

            {/* Link to API View */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Want to see the raw FHIR data?</p>
                    <p className="text-sm text-muted-foreground">
                      Switch to API Explorer to see the JSON and make queries
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setViewMode("api")}>
                    <FileText className="mr-2 h-4 w-4" />
                    View as JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
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
                        Click "Send" to execute the query
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
                    This is a demo sandbox with simulated responses.{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Sign up
                    </Link>{" "}
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
