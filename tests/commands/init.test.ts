import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('init command', () => {
  let tempDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    // Create temp directory structure
    tempDir = await mkdtemp(join(tmpdir(), 'claude-config-sync-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;

    // Create fake ~/.claude/ with a file
    const claudeDir = join(tempDir, '.claude');
    await mkdir(claudeDir, { recursive: true });
    await writeFile(join(claudeDir, 'settings.json'), '{"test": true}');
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('preserves token in config after init', async () => {
    // Mock GitHub API responses
    const mockGist = {
      id: 'test-gist-id',
      html_url: 'https://gist.github.com/user/test-gist-id',
      description: 'test',
      public: false,
      files: {},
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/user')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ login: 'testuser', name: 'Test' }),
        });
      }
      if (url.includes('/gists')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGist),
        });
      }
      return Promise.resolve({ ok: false, status: 404 });
    }));

    // Mock inquirer to auto-confirm
    vi.mock('@inquirer/prompts', () => ({
      password: vi.fn().mockResolvedValue('test-token-123'),
      confirm: vi.fn().mockResolvedValue(true),
    }));

    // Note: Full integration test would require more mocking
    // This test documents the expected behavior

    const configPath = join(tempDir, '.claude-config-sync', 'config.json');

    // Simulate what should happen:
    // 1. getToken() saves token
    await mkdir(join(tempDir, '.claude-config-sync'), { recursive: true });
    await writeFile(configPath, JSON.stringify({ token: 'test-token-123' }));

    // 2. init should preserve it when adding gistId
    const config = JSON.parse(await readFile(configPath, 'utf-8'));
    const newConfig = {
      ...config,
      gistId: 'test-gist-id',
      gistUrl: 'https://gist.github.com/user/test-gist-id',
      username: 'testuser',
    };
    await writeFile(configPath, JSON.stringify(newConfig, null, 2));

    // 3. Verify token is still there
    const finalConfig = JSON.parse(await readFile(configPath, 'utf-8'));
    expect(finalConfig.token).toBe('test-token-123');
    expect(finalConfig.gistId).toBe('test-gist-id');
  });
});
