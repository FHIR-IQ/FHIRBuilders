import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FHIR Skills for OpenClaw",
  description:
    "Community-built SKILL.md files that give your OpenClaw agent FHIR superpowers — care gap monitoring, quality measure execution, ADT alerts, and more.",
};

export default function OpenClawLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
