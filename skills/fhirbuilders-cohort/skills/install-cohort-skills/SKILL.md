---
name: install-cohort-skills
description: >-
  Installs the FHIRBuilders cohort skill pack into a builder's Claude Code setup,
  the correct way. Use when someone asks to "install the cohort skills", "set up
  the FHIRBuilders skills", "add the security skill", or is confused about why a
  command like `claude skills install <url>` returned nothing. Explains what a
  Claude Code skill actually is and walks through plugin install or a manual copy.
when_to_use: >-
  Trigger when a cohort member wants to install/update the FHIRBuilders skills,
  or hits an error trying to install a skill from a URL or a single .md file.
version: 1.0.0
author: FHIRBuilders Cohort
homepage: https://fhirbuilders.com
metadata: {"fhirbuilders":{"emoji":"📦","audience":"cohort","tags":["install","onboarding","skills","plugins"]}}
---

# Install the FHIRBuilders Cohort Skill Pack

You help a cohort builder install the FHIRBuilders skills correctly, and you
clear up the #1 confusion first.

## First: why `claude skills install <url>` does nothing

There is **no `claude skills install` command**, and **a single `.md` file is not
a skill**. A Claude Code skill is a *directory* containing a `SKILL.md` file with
YAML frontmatter. So a command like:

```
claude skills install https://raw.githubusercontent.com/.../security-review.md
```

fails silently / returns no contents because (a) the subcommand doesn't exist and
(b) a raw markdown file isn't an installable skill. Skills are installed one of
two supported ways:

1. **As a plugin** via the `/plugin` marketplace (recommended — versioned, updatable).
2. **By placing the skill directory** under `.claude/skills/` (project) or
   `~/.claude/skills/` (personal).

When you explain this, be brief and kind — most people hit this once.

## Decide the install method

Ask (or infer) which the builder wants:

- **Plugin install (recommended)** — gets updates, namespaced, one command.
- **Project install** — skills live in *this* repo's `.claude/skills/`, shared
  with anyone who clones it.
- **Personal install** — skills in `~/.claude/skills/`, available in all their
  projects on this machine.

## Method 1 — Plugin (recommended)

The cohort pack ships as a plugin in the `fhir-iq/fhirbuilders` repo, advertised
by a marketplace at the repo root (`.claude-plugin/marketplace.json`).

Run in Claude Code:

```
/plugin marketplace add fhir-iq/fhirbuilders
/plugin install fhirbuilders-cohort@fhirbuilders
```

Then the skills are available namespaced:

- `/fhirbuilders-cohort:security-review`
- `/fhirbuilders-cohort:install-cohort-skills`

To update later: `/plugin marketplace update fhirbuilders` then reinstall.

## Method 2 — Manual copy (project or personal)

From a clone of the repo, run the bundled installer script, which copies the
skill directories into the target `.claude/skills/`:

```bash
# Personal (all your projects on this machine):
bash skills/fhirbuilders-cohort/install.sh --personal

# Project (this repo only):
bash skills/fhirbuilders-cohort/install.sh --project

# Preview without copying:
bash skills/fhirbuilders-cohort/install.sh --personal --dry-run
```

If a script can't be run, do the copy directly — for a personal install:

```bash
mkdir -p ~/.claude/skills
cp -R skills/fhirbuilders-cohort/skills/security-review ~/.claude/skills/
cp -R skills/fhirbuilders-cohort/skills/install-cohort-skills ~/.claude/skills/
```

Project install is the same but targets `./.claude/skills/` instead of
`~/.claude/skills/`. Skills are picked up within the current session — no restart
needed.

## Verify

Confirm the install:

```bash
# Personal
ls ~/.claude/skills
# Project
ls .claude/skills
```

Then in Claude Code, the skill should appear in the `/` menu and respond to
`/security-review` (built-in) vs `/fhirbuilders-cohort:security-review` (this pack).
Tell the builder to try the security skill on their repo:

> "Run the cohort security review on my staged changes."

## What's in the pack

- **security-review** — secrets + PHI/PII hygiene review (the flagship learning skill).
- **install-cohort-skills** — this installer.

## Troubleshooting

- *"`claude skills install` not found"* → expected; use Method 1 or 2 above.
- *Skill doesn't show in `/` menu* → check the directory has `SKILL.md` (exact
  name, with frontmatter) at `<skills-dir>/<name>/SKILL.md`.
- *Plugin install fails* → validate manifests with `claude plugin validate .`
  from the repo root, and confirm the marketplace name is `fhirbuilders`.
