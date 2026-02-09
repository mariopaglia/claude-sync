import { CONFIG_PATH, SYNC_DIR } from '../utils/constants.js';
import { readTextFile, writeTextFile, fileExists, ensureDir } from '../utils/fs.js';

export interface SyncConfig {
  gistId?: string;
  gistUrl?: string;
  username?: string;
  token?: string;
  createdAt?: string;
  lastPush?: string;
  lastPull?: string;
}

export async function loadConfig(): Promise<SyncConfig | null> {
  if (!(await fileExists(CONFIG_PATH))) {
    return null;
  }

  try {
    const content = await readTextFile(CONFIG_PATH);
    return JSON.parse(content) as SyncConfig;
  } catch {
    return null;
  }
}

export async function saveConfig(config: SyncConfig): Promise<void> {
  await ensureDir(SYNC_DIR);
  await writeTextFile(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

export async function removeConfig(): Promise<void> {
  const { unlink } = await import('node:fs/promises');
  try {
    await unlink(CONFIG_PATH);
  } catch {
    // ignore if doesn't exist
  }
}

export async function requireConfig(): Promise<SyncConfig> {
  const config = await loadConfig();
  if (!config?.gistId) {
    throw new Error(
      'Not initialized. Run `claude-config-sync init` first, or `claude-config-sync link <gist-id>` to link an existing gist.',
    );
  }
  return config;
}
