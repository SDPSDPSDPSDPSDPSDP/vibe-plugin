// Repo gate for the AGENTS.md hard rules. Run by .githooks/pre-commit and CI. Node, no dependencies.
const { execSync } = require('child_process');
const { readFileSync, readdirSync, existsSync } = require('fs');

const git = (cmd) => execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();
const errors = [];

// Same ranges as the template's no-dashes-or-emojis hook: en/em dash, symbols/dingbats, emoji.
const BANNED = /[\u2013\u2014\u2600-\u27bf\u{1f300}-\u{1faff}]/u;
for (const file of git('ls-files').split('\n').filter(Boolean)) {
  if (!existsSync(file)) continue; // deleted in the working tree, not yet staged
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (BANNED.test(line)) errors.push(`${file}:${i + 1}: em/en dash or emoji, use plain hyphen`);
  });
}

const PLUGIN = 'shirin-vibe/.claude-plugin/plugin.json';
const MARKETPLACE = '.claude-plugin/marketplace.json';
const pluginVersion = (text) => JSON.parse(text).version;
const marketVersion = (text) => JSON.parse(text).plugins.find((p) => p.name === 'shirin-vibe').version;
const version = pluginVersion(readFileSync(PLUGIN, 'utf8'));
if (marketVersion(readFileSync(MARKETPLACE, 'utf8')) !== version) {
  errors.push(`${MARKETPLACE}: version differs from ${PLUGIN} (${version})`);
}

// Every change bumps the version. Compared against origin/main, so one bump per branch is enough.
let base = '';
try {
  base = git('merge-base HEAD origin/main');
} catch {
  errors.push('origin/main not found: run `git fetch origin main`');
}
if (base) {
  const changed = git(`diff --name-only ${base}`) + '\n' + git('ls-files --others --exclude-standard');
  const baseVersion = pluginVersion(git(`show ${base}:${PLUGIN}`));
  if (changed.trim() && version === baseVersion) {
    errors.push(`${PLUGIN}: version still ${version}, same as main. Bump it (and ${MARKETPLACE})`);
  }
}

const SKILLS = 'shirin-vibe/skills';
for (const name of readdirSync(SKILLS)) {
  const file = `${SKILLS}/${name}/SKILL.md`;
  const front = existsSync(file) && readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!front) { errors.push(`${file}: missing or no frontmatter`); continue; }
  if (!new RegExp(`^name: ${name}\s*$`, 'm').test(front[1])) errors.push(`${file}: frontmatter name must be ${name}`);
  if (!/^description: \S/m.test(front[1])) errors.push(`${file}: frontmatter description missing`);
}

const HOOKS = 'shirin-vibe/hooks';
JSON.parse(readFileSync(`${HOOKS}/hooks.json`, 'utf8'));
for (const js of readdirSync(HOOKS).filter((f) => f.endsWith('.js'))) {
  try {
    execSync(`node --check "${HOOKS}/${js}"`, { stdio: 'pipe' });
  } catch (e) {
    errors.push(`${HOOKS}/${js}: ${e.stderr.toString().trim().split('\n')[0]}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('check: ok');
