import { readdirSync, lstatSync, symlinkSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

function linkSkills() {
  const projectRoot = process.cwd();
  const bmadSkillsDir = resolve(projectRoot, ".agent/skills");
  const paperclipSkillsDir = resolve(projectRoot, "skills");

  if (!existsSync(paperclipSkillsDir)) {
    mkdirSync(paperclipSkillsDir, { recursive: true });
  }

  const skills = readdirSync(bmadSkillsDir);

  for (const skillName of skills) {
    const source = join(bmadSkillsDir, skillName);
    const target = join(paperclipSkillsDir, skillName);

    if (lstatSync(source).isDirectory()) {
      if (existsSync(target)) continue;

      try {
        symlinkSync(source, target);
        console.log(`Linked skill: ${skillName}`);
      } catch (err) {}
    }
  }
}

linkSkills();
