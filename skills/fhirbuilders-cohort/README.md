# FHIRBuilders Cohort Skills

A small Claude Code **plugin** for FHIRBuilders cohort builders. Two skills:

| Skill | What it does |
|-------|--------------|
| [`security-review`](./skills/security-review/) | Teaching-grade security review focused on the two ways healthcare builders get burned — **leaked secrets** and **exposed PHI/PII**. Goes beyond the built-in `/security-review` with a whole-tree scan, a HIPAA layer, and a "here's *why*" explanation for every finding. |
| [`install-cohort-skills`](./skills/install-cohort-skills/) | A guided installer that sets up this pack the correct way and clears up the common `claude skills install <url>` confusion. |

## Why `claude skills install <url>` returns nothing

There is **no `claude skills install` CLI command**, and **a single `.md` file is
not a skill**. A Claude Code skill is a *directory* containing a `SKILL.md` file
(YAML frontmatter + instructions). So this does nothing useful:

```
claude skills install https://raw.githubusercontent.com/.../security-review.md
```

Skills are installed either as a **plugin** (recommended) or by dropping the
skill directory into `.claude/skills/` (project) or `~/.claude/skills/` (personal).

## Install (recommended — plugin marketplace)

```
/plugin marketplace add fhir-iq/fhirbuilders
/plugin install fhirbuilders-cohort@fhirbuilders
```

Skills then appear namespaced: `/fhirbuilders-cohort:security-review` and
`/fhirbuilders-cohort:install-cohort-skills`.

## Install (manual fallback)

From a clone of the repo:

```bash
bash skills/fhirbuilders-cohort/install.sh --personal     # ~/.claude/skills
bash skills/fhirbuilders-cohort/install.sh --project      # ./.claude/skills
bash skills/fhirbuilders-cohort/install.sh --personal --dry-run
```

## How `security-review` complements the built-in check

The built-in `/security-review` reviews the **diff** for code vulnerabilities
(injection, authz, crypto, SSRF, …). Run it. Then run this pack's
`security-review` for what a generic review misses:

- **Whole-tree + history surface** secret scan — secrets hide in files outside the diff.
- **HIPAA / PHI layer** — the 18 Safe Harbor identifiers, synthetic-data-only,
  no PHI in logs/URLs/LLM prompts, BAA boundaries.
- **Teaching + remediation** — every finding explains the risk and the fix,
  including the rule cohort builders forget: *a secret that ever reached a commit
  or a client bundle must be rotated, not just deleted.*

## Repo layout

```
.claude-plugin/marketplace.json          # repo-root marketplace (discovery)
skills/fhirbuilders-cohort/
├── .claude-plugin/plugin.json           # plugin manifest
├── README.md                            # this file
├── install.sh                           # manual installer
└── skills/
    ├── security-review/SKILL.md
    └── install-cohort-skills/SKILL.md
```

## Validate before shipping

```bash
claude plugin validate .                          # marketplace, from repo root
claude plugin validate ./skills/fhirbuilders-cohort   # the plugin
```

## License

MIT.
