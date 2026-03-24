import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Health CLAW Skills Files', () => {
  const skillsDir = path.resolve(__dirname, '../../../skills/health-claw');

  const skills = [
    'medication-refills',
    'care-completion',
    'diet-exercise',
    'kids-health',
    'healthy-habits',
    'research-monitor',
  ];

  for (const skill of skills) {
    test(`${skill}/SKILL.md exists and has valid frontmatter`, async () => {
      const skillPath = path.join(skillsDir, skill, 'SKILL.md');
      expect(fs.existsSync(skillPath)).toBe(true);

      const content = fs.readFileSync(skillPath, 'utf-8');

      // Must start with YAML frontmatter
      expect(content.startsWith('---')).toBe(true);

      // Must have name field
      expect(content).toContain(`name: ${skill}`);

      // Must have description field
      expect(content).toMatch(/^description: .+/m);

      // Must have metadata with openclaw config
      expect(content).toContain('"openclaw"');
      expect(content).toContain('"requires"');

      // Must have Available MCP Tools section
      expect(content).toContain('## Available MCP Tools');

      // Must have Behavior section
      expect(content).toContain('## Behavior');

      // Must have Safety section
      expect(content).toContain('## Safety');
    });
  }

  test('README.md exists in health-claw directory', async () => {
    const readmePath = path.join(skillsDir, 'README.md');
    expect(fs.existsSync(readmePath)).toBe(true);

    const content = fs.readFileSync(readmePath, 'utf-8');
    expect(content).toContain('Health CLAW');
    expect(content).toContain('OpenClaw');
    // Should list all 6 skills
    for (const skill of skills) {
      expect(content).toContain(skill);
    }
  });
});
