import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_PROJECTS = [
  {
    title: "AgentInterOp",
    description:
      "Healthcare AI agents can't talk to each other — each EHR integration is a custom one-off that breaks when APIs change",
    tags: ["A2A", "MCP", "Interoperability", "Agent"],
    artifactType: "Agent",
    status: "in-progress",
    lookingFor: ["Technical co-founder", "Clinical advisors", "Pilot sites"],
    repoUrl: "https://github.com/fhirbuilders/agentinterop",
    demoUrl: null,
    authorName: "Marcus Johnson",
    authorEmail: null,
    upvoteCount: 42,
  },
  {
    title: "NCQA Breast Cancer Screening CQL Measure",
    description:
      "Hospitals manually audit HEDIS breast cancer screening compliance — a 40-hour quarterly process that is error-prone and always behind",
    tags: ["CQL", "NCQA", "HEDIS", "Quality Measure", "Breast Cancer"],
    artifactType: "CQL Measure",
    status: "live",
    lookingFor: ["Pilot sites", "Clinical advisors"],
    repoUrl: "https://github.com/fhirbuilders/ncqa-breast-cancer-cql",
    demoUrl: "https://cql-runner.vercel.app/ncqa-brca",
    authorName: "Dr. Lisa Park",
    authorEmail: null,
    upvoteCount: 38,
  },
  {
    title: "NCQA Cholesterol Management CQL",
    description:
      "Identifying patients with uncontrolled LDL requires querying 3 separate systems — most practices miss 30% of eligible patients",
    tags: ["CQL", "NCQA", "HEDIS", "Quality Measure", "Cardiology"],
    artifactType: "CQL Measure",
    status: "live",
    lookingFor: ["Pilot sites"],
    repoUrl: "https://github.com/fhirbuilders/ncqa-cholesterol-cql",
    demoUrl: null,
    authorName: "Dr. Lisa Park",
    authorEmail: null,
    upvoteCount: 29,
  },
  {
    title: "Smart Health Connect",
    description:
      "Patients leave appointments with paper summaries they lose — no way to share a complete visit summary to their preferred app",
    tags: ["SMART on FHIR", "Patient Engagement", "React", "Patient Portal"],
    artifactType: "App",
    status: "live",
    lookingFor: ["Pilot sites", "Funding"],
    repoUrl: "https://github.com/fhirbuilders/smart-health-connect",
    demoUrl: "https://smart-health-connect.vercel.app",
    authorName: "Sarah Chen",
    authorEmail: null,
    upvoteCount: 24,
  },
  {
    title: "FHIR IQ Sandbox MCP",
    description:
      "AI coding agents hallucinate FHIR APIs — there's no MCP tool that lets Claude query a live FHIR sandbox directly during code generation",
    tags: ["MCP", "Claude", "AI Agent", "Developer Tools"],
    artifactType: "MCP Tool",
    status: "in-progress",
    lookingFor: ["Collaborators", "Technical co-founder"],
    repoUrl: "https://github.com/fhirbuilders/fhir-iq-mcp",
    demoUrl: null,
    authorName: "Dev Ramirez",
    authorEmail: null,
    upvoteCount: 51,
  },
  {
    title: "Firemetrics Analytics Engine",
    description:
      "Health system analytics teams spend 80% of their time cleaning FHIR data rather than generating insights — no standard pipeline exists",
    tags: ["Analytics", "Python", "Population Health", "ETL"],
    artifactType: "App",
    status: "in-progress",
    lookingFor: ["Healthcare domain expert", "Funding", "Pilot sites"],
    repoUrl: "https://github.com/fhirbuilders/firemetrics",
    demoUrl: null,
    authorName: "James Rodriguez",
    authorEmail: null,
    upvoteCount: 33,
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
