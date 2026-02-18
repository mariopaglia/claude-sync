import { homedir } from 'node:os';
import { join } from 'node:path';

export const CLAUDE_DIR = join(homedir(), '.claude');
export const SYNC_DIR = join(homedir(), '.claude-config-sync');
export const CONFIG_PATH = join(SYNC_DIR, 'config.json');
export const BACKUPS_DIR = join(SYNC_DIR, 'backups');

export const META_FILENAME = '.claude-config-sync-meta.json';

export const GIST_API_BASE = 'https://api.github.com';

export const SYNC_PATTERNS = [
  'settings.json',
  'keybindings.json',
  'CLAUDE.md',
  'agents/**/AGENT.md',
  'agents/**/*.md',
  'skills/**/SKILL.md',
  'skills/**/*.md',
  'skills/**/*.txt',
  'rules/*.md',
];

export const EXCLUDE_PATTERNS = [
  '*.local.json',
  '*.local.md',
  '*.bak',
  'agent-memory/**',
  'agent-memory-local/**',
  'ide/**',
  'statsig/**',
  'todo/**',
  'tmp/**',
];

// Patterns for sensitive data detection in file content
// These patterns will be redacted before upload to prevent leaking secrets
export const SENSITIVE_PATTERNS = [
  // Environment variable patterns for API keys and tokens
  /"ANTHROPIC_AUTH_TOKEN"\s*:\s*"[^"]*"/gi,
  /'ANTHROPIC_AUTH_TOKEN'\s*:\s*'[^']*'/gi,
  /ANTHROPIC_AUTH_TOKEN=[^\n]*/gi,

  /"API_KEY"\s*:\s*"[^"]*"/gi,
  /'API_KEY'\s*:\s*'[^']*'/gi,
  /API_KEY=[^\n]*/gi,

  /"APIKEY"\s*:\s*"[^"]*"/gi,
  /'APIKEY'\s*:\s*'[^']*'/gi,

  /"AUTH_TOKEN"\s*:\s*"[^"]*"/gi,
  /'AUTH_TOKEN'\s*:\s*'[^']*'/gi,

  /"GITHUB_TOKEN"\s*:\s*"[^"]*"/gi,
  /'GITHUB_TOKEN'\s*:\s*'[^']*'/gi,
  /GITHUB_TOKEN=[^\n]*/gi,

  // Generic secret patterns
  /"SECRET"\s*:\s*"[^"]*"/gi,
  /'SECRET'\s*:\s*'[^']*'/gi,

  /"PASSWORD"\s*:\s*"[^"]*"/gi,
  /'PASSWORD'\s*:\s*'[^']*'/gi,

  /"TOKEN"\s*:\s*"[^"]*"/gi,
  /'TOKEN'\s*:\s*'[^']*'/gi,

  // API keys and tokens (common prefixes)
  /"sk-[a-zA-Z0-9]{20,}"/g,
  /'sk-[a-zA-Z0-9]{20,}'/g,
  /sk-[a-zA-Z0-9]{20,}/g,

  /"anthropic-[a-zA-Z0-9_-]{20,}"/g,
  /'anthropic-[a-zA-Z0-9_-]{20,}'/g,
  /anthropic-[a-zA-Z0-9_-]{20,}/g,

  /"minimax-[a-zA-Z0-9_-]{20,}"/g,
  /'minimax-[a-zA-Z0-9_-]{20,}'/g,
  /minimax-[a-zA-Z0-9_-]{20,}/g,

  /"openai-[a-zA-Z0-9_-]{20,}"/g,
  /'openai-[a-zA-Z0-9_-]{20,}'/g,
  /openai-[a-zA-Z0-9_-]{20,}/g,

  // Azure OpenAI and other provider keys
  /"[a-zA-Z0-9_-]{86,}"/g, // Long alphanumeric strings likely to be keys
];

export const SENSITIVE_WARNING = `⚠️  Sensitive data detected in settings.json!
The following values will be REDACTED before upload to protect your secrets:
- ANTHROPIC_AUTH_TOKEN
- API_KEY, AUTH_TOKEN, GITHUB_TOKEN
- Any tokens starting with sk-, anthropic-, minimax-, openai-
- Long alphanumeric strings (likely API keys)

Your original local files remain unchanged.`;

export const PATH_SEPARATOR = '__';

export const MAX_BACKUPS_PER_FILE = 5;
