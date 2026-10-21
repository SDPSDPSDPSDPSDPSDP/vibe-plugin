// Whole-project checks are too slow per edit, so they run once per turn on Stop.
const { spawnSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const path = require('path');

const input = JSON.parse(readFileSync(0, 'utf8'));
const root = input.cwd;

// Second Stop in a row means Claude already got one retry; blocking again risks an endless loop.
if (input.stop_hook_active) process.exit(0);

const status = spawnSync('git status --porcelain', { cwd: root, shell: true, encoding: 'utf8' });
const changed = status.stdout || '';

const run = (cmd) => spawnSync(cmd, { cwd: root, shell: true, encoding: 'utf8' });
const failures = [];

const tsc = path.join(root, 'node_modules', '.bin', 'tsc');
if (/\.tsx?$/m.test(changed) && existsSync(tsc) && existsSync(path.join(root, 'tsconfig.json'))) {
  const r = run(`"${tsc}" --noEmit`);
  if (r.status !== 0) failures.push(`tsc --noEmit fails:\n${r.stdout}${r.stderr}`);
}

const pyproject = path.join(root, 'pyproject.toml');
if (/\.py$/m.test(changed) && existsSync(pyproject) && run('uv --version').status === 0) {
  const ruff = run('uv run --frozen ruff check .');
  if (ruff.status !== 0) failures.push(`ruff check fails:\n${ruff.stdout}${ruff.stderr}`);

  // mypy only where the project configures it, on the API package (template layout).
  if (/^\[tool\.mypy\]/m.test(readFileSync(pyproject, 'utf8')) && existsSync(path.join(root, 'api'))) {
    const mypy = run('uv run --frozen mypy api');
    if (mypy.status !== 0) failures.push(`mypy api fails:\n${mypy.stdout}${mypy.stderr}`);
  }
}

if (failures.length === 0) process.exit(0);

process.stderr.write(`Fix before finishing:\n${failures.join('\n')}`);
process.exit(2);
