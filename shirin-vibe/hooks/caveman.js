// Style rules in CLAUDE.md fade over long sessions and after compaction; this
// re-injects them next to every user prompt, where they carry the most weight.
const RULE = [
  'Response style: caveman. Terse fragments. All technical substance stays, only fluff dies.',
  'Drop articles (a/an/the), filler (just/really/basically), pleasantries, hedging, recaps.',
  'Pattern: [thing] [action] [reason]. [next step]. Technical terms and code exact.',
  'Normal prose only for security warnings, irreversible actions, a confused user, and for code, commits, PRs.',
].join('\n');

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: RULE },
  }),
);
