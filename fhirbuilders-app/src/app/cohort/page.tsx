import { redirect } from "next/navigation";

// /cohort → bounce to the active cohort. When Cohort 01+ ships, this picks
// the cohort with status === "active" from the lib/cohort module.
export default function CohortIndex() {
  redirect("/cohort/cohort-00");
}
