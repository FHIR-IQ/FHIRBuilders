import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_PROJECTS = [
  {
    title: "AgentInterOp",
    description:
      "Healthcare AI agents can't talk to each other — each EHR integration is a custom one-off that breaks when APIs change. AgentInterOp provides an A2A JSON-RPC agent gateway that lets any FHIR-connected agent delegate tasks to another agent over a standard protocol.",
    tags: ["A2A", "MCP", "Interoperability", "Agent", "JSON-RPC"],
    artifactType: "Agent",
    status: "in-progress",
    lookingFor: ["Technical co-founder", "Clinical advisors", "Pilot sites"],
    repoUrl: "https://github.com/aks129/AgentInterOp",
    demoUrl: null,
    authorName: "Eugene Vestel",
    authorEmail: null,
    upvoteCount: 42,
    makerComment:
      "Built this after spending 3 months integrating the same data into 4 different agent frameworks. The protocol is minimal by design — if your agent can speak JSON-RPC over HTTP it can join the mesh. Would love pilot partners who have > 2 EHR integrations today.",
    forkCount: 7,
    trendingScore: 134,
    verified: true,
  },
  {
    title: "FhirQueryConverter",
    description:
      "Translates CQL (Clinical Quality Language) queries into optimized SQL for FHIR R4 data warehouses. Eliminates the need for a CQL engine at query time — run measures directly against your analytics database.",
    tags: ["CQL", "SQL", "FHIR", "Analytics", "Quality Measure"],
    artifactType: "CQL Measure",
    status: "live",
    lookingFor: ["Pilot sites", "Clinical advisors"],
    repoUrl: "https://github.com/aks129/FhirQueryConverter",
    demoUrl: null,
    authorName: "Eugene Vestel",
    authorEmail: null,
    upvoteCount: 38,
    makerComment:
      "CQL engines are fantastic but hard to embed in every analytics tool. This converter lets you write standard CQL measures and deploy them anywhere SQL runs — Snowflake, BigQuery, Postgres. Open to PRs for additional FHIR resource mappings.",
    forkCount: 5,
    trendingScore: 118,
    verified: true,
  },
  {
    title: "SmartHealthConnect",
    description:
      "Patients leave appointments with paper summaries they lose — no way to share a complete visit summary to their preferred app. SmartHealthConnect uses SMART on FHIR to export full visit data to any patient-chosen destination in one tap.",
    tags: ["SMART on FHIR", "Patient Engagement", "React", "Patient Portal"],
    artifactType: "App",
    status: "live",
    lookingFor: ["Pilot sites", "Funding"],
    repoUrl: "https://github.com/aks129/SmartHealthConnect",
    demoUrl: null,
    authorName: "Eugene Vestel",
    authorEmail: null,
    upvoteCount: 24,
    makerComment:
      "This started as a weekend hack after my own frustrating hospital visit. The SMART launch flow works against any R4-compliant EHR — tested on Epic, Cerner, and Medplum. Looking for a hospital willing to do a 30-patient pilot.",
    forkCount: 3,
    trendingScore: 77,
    verified: true,
  },
  {
    title: "ModelContextProtocolFHIR",
    description:
      "AI coding agents hallucinate FHIR APIs — there's no guardrail that grounds them in real FHIR R4 spec. ModelContextProtocolFHIR is an MCP server that gives Claude and other agents live access to FHIR R4 resource schemas, search parameters, and validation rules.",
    tags: ["MCP", "Claude", "AI Agent", "Developer Tools", "FHIR R4"],
    artifactType: "MCP Tool",
    status: "in-progress",
    lookingFor: ["Collaborators", "Technical co-founder"],
    repoUrl: "https://github.com/aks129/ModelContextProtocolFHIR",
    demoUrl: null,
    authorName: "Eugene Vestel",
    authorEmail: null,
    upvoteCount: 51,
    makerComment:
      "After watching Claude hallucinate a non-existent FHIR search parameter for the 10th time I built this. The MCP server exposes the official HL7 FHIR R4 spec as structured tools — Claude now cites the spec correctly 95%+ of the time in my testing. PRs for R5 coverage welcome.",
    forkCount: 12,
    trendingScore: 163,
    verified: true,
  },
  {
    title: "s77 CQL Measure Builder",
    description:
      "Writing CQL from scratch is intimidating for most clinicians and informaticists. s77 is an interactive visual builder that generates valid CQL measure bundles from a guided form — no CQL syntax knowledge required.",
    tags: ["CQL", "Quality Measure", "HEDIS", "Visual Builder", "No-Code"],
    artifactType: "CQL Measure",
    status: "live",
    lookingFor: ["Pilot sites", "Healthcare domain expert"],
    repoUrl: "https://github.com/FHIR-IQ/s77",
    demoUrl: null,
    authorName: "FHIR-IQ Team",
    authorEmail: null,
    upvoteCount: 29,
    makerComment:
      "Built for quality teams who know what they want to measure but not how to write CQL. The builder covers the most common HEDIS measure patterns — denominator exclusions, numerator criteria, value sets. We're expanding to custom SNOMED/LOINC value set lookup next.",
    forkCount: 4,
    trendingScore: 93,
    verified: true,
  },
  {
    title: "FHIRBuilders Platform",
    description:
      "FHIRBuilders.com itself — an open-source healthcare app marketplace and sandbox platform for building, sharing, and collaborating on AI-powered FHIR applications. Includes the OpenClaw SKILL.md skill gallery, AI app generator, and community project board.",
    tags: ["Next.js", "FHIR", "AI", "Community", "Open Source"],
    artifactType: "App",
    status: "live",
    lookingFor: ["Collaborators", "Pilot sites"],
    repoUrl: "https://github.com/FHIR-IQ/FHIRBuilders",
    demoUrl: "https://fhir-builders.vercel.app",
    authorName: "Eugene Vestel",
    authorEmail: null,
    upvoteCount: 33,
    makerComment:
      "FHIRBuilders is the platform you're on right now — fully open source. Built with Next.js 16, Prisma, Medplum, and Claude. The OpenClaw skill gallery and AI app generator are the newest additions. Issues and PRs very welcome — especially for new FHIR skill templates.",
    forkCount: 6,
    trendingScore: 106,
    verified: true,
  },
];

async function main() {
  console.log("Seeding SharedProject table...");

  // Delete existing seed entries (by matching known titles)
  const seedTitles = SEED_PROJECTS.map((p) => p.title);
  const deleted = await prisma.sharedProject.deleteMany({
    where: { title: { in: seedTitles } },
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
