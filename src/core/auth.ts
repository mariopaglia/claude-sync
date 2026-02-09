import { execSync } from 'node:child_process';
import { input, password } from '@inquirer/prompts';
import { loadConfig, saveConfig } from './config.js';
import { log } from '../utils/logger.js';
import { GIST_API_BASE } from '../utils/constants.js';

export async function getToken(): Promise<string> {
  // 1. Try gh CLI
  try {
    const token = execSync('gh auth token', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    if (token) {
      return token;
    }
  } catch {
    // gh CLI not available or not authenticated
  }

  // 2. Try environment variable
  const envToken = process.env.GITHUB_TOKEN;
  if (envToken) {
    return envToken;
  }

  // 3. Try stored config
  const config = await loadConfig();
  if (config?.token) {
    return config.token;
  }

  // 4. Prompt user
  log.info('No GitHub token found. You need a token with "gist" scope.');
  log.dim('Create one at: https://github.com/settings/tokens/new?scopes=gist');
  console.log();

  const token = await password({
    message: 'Enter your GitHub Personal Access Token:',
    mask: '*',
  });

  if (!token) {
    throw new Error('No token provided. Cannot continue.');
  }

  // Save token for future use
  const existingConfig = (await loadConfig()) ?? {};
  await saveConfig({ ...existingConfig, token });

  return token;
}

export interface GitHubUser {
  login: string;
  name: string | null;
}

export async function validateToken(token: string): Promise<GitHubUser> {
  const response = await fetch(`${GIST_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid or expired GitHub token. Please check your token and try again.');
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const user = (await response.json()) as GitHubUser;
  return user;
}
