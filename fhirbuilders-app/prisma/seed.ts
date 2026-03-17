import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_PROJECTS = [
  {
    title: "AgentInterOp",
    description:
      "A2A JSON-RPC agent gateway for FHIR R4. Any agent can query patient data, trigger care protocols, or delegate to specialist agents using a standard message envelope over FHIR Task resources.",
    tags: ["A2A", "FHIR R4", "Task", "Patient", "MCP"],
    artifactType: "Agent",
    status: "in-progress",
    lookingFor: ["Clinical advisors", "Pilot sites"],
    repoUrl: "https://github.com/aks129/AgentInterOp",
    demoUrl: null,
    authorName: "Eugene Vestel",
    authorEmail: null,
    upvoteCount: 31,
    makerComment:
      "I kept hitting the same wall: two AI agents built by different teams couldn't coordinate a patient handoff because they had no shared protocol. One agent knew the patient had been discharged. The other agent, responsible for scheduling the follow-up, had no way to receive that signal. I built AgentInterOp because FHIR already has the data model for coordination — Task, Communication, Subscription — but nobody had built the agent messaging layer on top of it. That's this. Looking for clinical informaticists who have tried and failed to connect two AI systems in a care workflow.",
    forkCount: 7,
    trendingScore: 134,
    verified: true,
  },
  {
    title: "FHIR IQ Sandbox MCP",
    description:
      "MCP server that lets Claude query any FHIR R4 endpoint directly from a conversation. Ask natural language questions against real patient data and get structured FHIR responses.",
    tags: ["MCP", "Claude", "FHIR R4", "Observation", "Patient"],
    artifactType: "MCP Tool",
    status: "live",
    lookingFor: ["Technical co-founder", "Healthcare domain expert"],
    repoUrl: null,
    demoUrl: "https://fhiriq.com",
    authorName: "FHIR IQ",
    authorEmail: null,
    upvoteCount: 28,
    makerComment:
      "Every time I set up a new FHIR demo I spent 45 minutes explaining to non-technical stakeholders why they couldn't just ask questions about the patient data in plain English. Now they can. You ask Claude 'which patients have uncontrolled HbA1c?' and it queries the FHIR endpoint, reasons over the results, and answers. No SQL. No JSON parsing. I built this during a FHIR connectathon weekend. The reaction from clinicians in the room told me this needed to exist.",
    forkCount: 5,
    trendingScore: 113,
    verified: true,
  },
  {
    title: "NCQA Breast Cancer Screening dQM",
    description:
      "Digital quality measure for breast cancer screening compliance (HEDIS BCS-E) implemented in CQL on FHIR R4. Runs against Observation and Procedure resources with full VSAC value set bindings.",
    tags: ["CQL", "NCQA", "HEDIS", "Observation", "Procedure"],
    artifactType: "CQL Measure",
    status: "live",
    lookingFor: ["Pilot sites", "Healthcare domain expert"],
    repoUrl: null,
    demoUrl: null,
    authorName: "FHIR IQ",
    authorEmail: null,
    upvoteCount: 19,
    makerComment:
      "Quality measure logic has lived in spreadsheets and proprietary systems for too long. When a payer wants to know their BCS-E performance rate, someone is manually running a report that was designed in 2009. This CQL measure runs directly against a FHIR endpoint and produces a conformant MeasureReport in seconds. The denominator logic handles all the VSAC exclusions correctly. If you are running HEDIS measures at a health plan and want to pilot a FHIR-native approach, I want to talk to you.",
    forkCount: 3,
    trendingScore: 76,
    verified: true,
  },
  {
    title: "Smart Health Connect",
    description:
      "SMART on FHIR patient-facing app that pulls records from any compliant EHR. Patients authorize once and see their conditions, medications, labs, and appointments in a unified mobile-friendly view.",
    tags: ["SMART on FHIR", "Patient", "Observation", "MedicationRequest"],
    artifactType: "App",
    status: "in-progress",
    lookingFor: ["Clinical advisors", "Pilot sites", "Funding"],
    repoUrl: "https://github.com/aks129/SmartHealthConnect",
    demoUrl: null,
    authorName: "FHIR Builders Community",
    authorEmail: null,
    upvoteCount: 22,
    makerComment:
      "My mother has four doctors and none of them can see what the others prescribed. She carries a paper list in her purse. In 2026. I started building this because I was embarrassed that I work in health tech and couldn't solve my own mother's problem. It works. SMART on FHIR authorization against Epic and Cerner both work in our test environment. We need a clinical pilot site and a primary care physician who will look at the reconciled medication view with us.",
    forkCount: 4,
    trendingScore: 90,
    verified: true,
  },
  {
    title: "Firemetrics FHIR Analytics Engine",
    description:
      "SQL-on-FHIR analytics engine connecting FHIR R4 resources to Databricks and major cloud data warehouses. Query population health data using familiar SQL syntax at scale.",
    tags: ["SQL-on-FHIR", "Analytics", "Databricks", "Population Health"],
    artifactType: "App",
    status: "live",
    lookingFor: ["Pilot sites", "Healthcare domain expert", "Funding"],
    repoUrl: null,
    demoUrl: "https://firemetrics.de",
    authorName: "Firemetrics",
    authorEmail: null,
    upvoteCount: 17,
    makerComment:
      "Health plans have petabytes of claims and clinical data and no way to run a cohort query that finishes before the meeting where they need the answer. We built a SQL-on-FHIR layer that maps FHIR resources to columnar format so your existing analytics team can query patient populations with the tools they already know. Built in Germany, expanding to the US. Looking for US health plan or ACO partners for a paid pilot.",
    forkCount: 2,
    trendingScore: 67,
    verified: true,
  },
  {
    title: "NCQA Cholesterol Management dQM",
    description:
      "CQL digital quality measure for LDL cholesterol control in cardiovascular disease patients (HEDIS COL-E). Includes CQL-to-SQL transpilation support for Databricks-based analytics pipelines.",
    tags: ["CQL", "NCQA", "HEDIS", "Observation", "MedicationRequest"],
    artifactType: "CQL Measure",
    status: "live",
    lookingFor: ["Pilot sites"],
    repoUrl: null,
    demoUrl: null,
    authorName: "FHIR IQ",
    authorEmail: null,
    upvoteCount: 14,
    makerComment:
      "The COL-E measure has a complex denominator that most implementations get wrong — specifically around the exclusion logic for patients on PCSK9 inhibitors. This CQL implementation handles it correctly and includes a transpiled SQL version you can run in Databricks directly against your FHIR data lake. If you are a health plan running HEDIS and want to validate your COL-E logic against a conformant CQL reference implementation, reach out.",
    forkCount: 1,
    trendingScore: 52,
    verified: true,
  },
];

async function main() {
  console.log("Seeding SharedProject table...");

  // Delete all existing projects to start fresh
  const allTitlesToDelete = [
    ...SEED_PROJECTS.map((p) => p.title),
    "AgentInterOp",
    "FhirQueryConverter",
    "SmartHealthConnect",
    "ModelContextProtocolFHIR",
    "s77 CQL Measure Builder",
    "FHIRBuilders Platform",
  ];
  const deleted = await prisma.sharedProject.deleteMany({
    where: { title: { in: allTitlesToDelete } },
  });
  if (deleted.count > 0) {
    console.log(`Deleted ${deleted.count} existing seed records.`);
  }

  for (const project of SEED_PROJECTS) {
    const created = await prisma.sharedProject.create({ data: project });
    console.log(`  Created: ${created.title} (${created.id})`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
