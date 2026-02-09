import { homedir } from 'node:os';
import { join } from 'node:path';

export const VERSION = '1.0.3';

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

export const PATH_SEPARATOR = '__';

export const MAX_BACKUPS_PER_FILE = 5;
