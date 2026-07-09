// Shared curriculum contract for cohort session Study Guides (Sessions 2+).
// Session 1 predates this and keeps its own local copy; new sessions import here.

export type DocLink = { label: string; href: string };

export type Example = {
  title: string;
  lang: "bash" | "typescript" | "markdown" | "json" | "text";
  code: string;
  note?: string;
};

export type FAQ = { q: string; a: string };

export type CurriculumBlock = {
  id: string;
  n: number;
  title: string;
  objectives: [string, string];
  faq: [FAQ, FAQ, FAQ];
  examples: [Example, Example];
  tryIt: string;
  docs: DocLink[];
};
