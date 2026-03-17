import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_PROBLEMS = [
  {
    title: "We lose 30% of CHF patients between discharge and first follow-up",
    description:
      "Every week I discharge 8-10 congestive heart failure patients. About 3 of them will be readmitted within 30 days. I know it's happening but I have no way to know which 3, and by the time I find out they've been readmitted — sometimes to a different hospital entirely — it's too late to intervene. I have no visibility into what happens to my patients after they leave my unit. No alerts, no ADT notifications from other systems, nothing.",
    category: "Care Coordination",
    status: "unclaimed",
    affectedRoles: ["Physicians", "Nurses", "Patients"],
    frequency: "Daily",
    postedByRole: "Hospitalist, academic medical center",
    contactEmail: null,
    willingToAdvise: true,
    supportCount: 47,
    linkedProjects: [],
  },
  {
    title: "Medication reconciliation at admission still takes 20 minutes of manual work",
    description:
      "Every patient who comes in for a procedure has a medication list that's at least partially wrong. The list in Epic doesn't match what the pharmacy has, which doesn't match what the patient says they're taking. I spend 15-20 minutes on every admission reconciling these manually. Multiply that by 12 admissions a day across the unit. We know the data exists — it's in FHIR somewhere. Nobody has built the tool that pulls it all together and flags the conflicts automatically.",
    category: "Medication Safety",
    status: "being-built",
    affectedRoles: ["Pharmacists", "Physicians", "Nurses", "Patients"],
    frequency: "Daily",
    postedByRole: "Pharmacist, community hospital",
    contactEmail: null,
    willingToAdvise: true,
    supportCount: 63,
    linkedProjects: [],
  },
  {
    title: "Quality measure reporting requires re-extracting data we already submitted to CMS",
    description:
      "We submit HEDIS measures to our payer every year. We submit quality data to CMS every year. We submit data to our ACO every quarter. All three extractions pull from the same underlying patient data but use different formats, different code sets, and different timelines. Each one requires its own custom extract that takes our analytics team 2-3 weeks. If the data were in FHIR and the measures were in CQL we could run this in an afternoon. Nobody at our organization knows how to get from here to there.",
    category: "Quality Measurement",
    status: "unclaimed",
    affectedRoles: ["Administrators", "Physicians"],
    frequency: "Monthly",
    postedByRole: "VP Quality, regional health system",
    contactEmail: null,
    willingToAdvise: true,
    supportCount: 38,
    linkedProjects: [],
  },
  {
    title: "My specialist can't see the labs my PCP ordered last week",
    description:
      "I have Type 2 diabetes and I see four doctors. My endocrinologist ordered an HbA1c last Tuesday. My cardiologist is seeing me Friday and wants to know my latest HbA1c. There is no way for her to see it unless my endocrinologist's office faxes it or I remember to bring a printout. I tried to use the patient portal to share it but each portal is its own walled garden. I've been told FHIR is supposed to fix this. It hasn't fixed it for me yet.",
    category: "Data Access",
    status: "unclaimed",
    affectedRoles: ["Patients", "Physicians"],
    frequency: "Weekly",
    postedByRole: "Patient, type 2 diabetes and CAD",
    contactEmail: null,
    willingToAdvise: false,
    supportCount: 89,
    linkedProjects: [],
  },
  {
    title: "Prior auth denials arrive as PDFs with no structured data",
    description:
      "We get 40-60 prior authorization requests denied per week. Every denial comes as a PDF fax (yes, still fax). Someone on our team reads the PDF, manually enters the denial reason into our EHR, manually looks up the appeal criteria, and manually drafts the appeal letter. This is a full-time job for two people. We know payers have this data structured internally. Da Vinci has an IG for this. Nobody has actually implemented it end to end.",
    category: "Workflow Automation",
    status: "unclaimed",
    affectedRoles: ["Administrators", "Physicians", "Patients"],
    frequency: "Daily",
    postedByRole: "Practice manager, multi-specialty group",
    contactEmail: null,
    willingToAdvise: true,
    supportCount: 52,
    linkedProjects: [],
  },
];

async function main() {
  console.log("Seeding ClinicalProblem table...");

  const seedTitles = SEED_PROBLEMS.map((p) => p.title);
  const deleted = await prisma.clinicalProblem.deleteMany({
    where: { title: { in: seedTitles } },
  });
  if (deleted.count > 0) {
    console.log(`Deleted ${deleted.count} existing problem records.`);
  }

  for (const problem of SEED_PROBLEMS) {
    const created = await prisma.clinicalProblem.create({ data: problem });
    console.log(`  Created: ${created.title.slice(0, 60)}... (${created.id})`);
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
