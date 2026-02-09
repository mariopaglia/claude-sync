import { describe, it, expect } from 'vitest';
import {
  toGistFilename,
  fromGistFilename,
  fileMapToGistFiles,
  gistFilesToFileMap,
  categorizeFiles,
} from '../../src/core/scanner.js';

describe('scanner', () => {
  describe('toGistFilename', () => {
    it('converts root files', () => {
      expect(toGistFilename('settings.json')).toBe('settings.json');
    });

    it('converts nested paths', () => {
      expect(toGistFilename('agents/code-reviewer/AGENT.md')).toBe(
        'agents__code-reviewer__AGENT.md',
      );
    });

    it('converts deeply nested paths', () => {
      expect(toGistFilename('skills/commit/prompt.md')).toBe('skills__commit__prompt.md');
    });
  });

  describe('fromGistFilename', () => {
    it('converts root files', () => {
      expect(fromGistFilename('settings.json')).toBe('settings.json');
    });

    it('converts encoded paths back', () => {
      expect(fromGistFilename('agents__code-reviewer__AGENT.md')).toBe(
        'agents/code-reviewer/AGENT.md',
      );
    });

    it('is inverse of toGistFilename', () => {
      const paths = [
        'settings.json',
        'CLAUDE.md',
        'agents/my-agent/AGENT.md',
        'skills/commit/SKILL.md',
        'rules/security.md',
      ];
      for (const path of paths) {
        expect(fromGistFilename(toGistFilename(path))).toBe(path);
      }
    });
  });

  describe('fileMapToGistFiles', () => {
    it('converts file map to gist format', () => {
      const fileMap = new Map([
        ['settings.json', '{"key": "value"}'],
        ['agents/test/AGENT.md', '# Agent'],
      ]);

      const result = fileMapToGistFiles(fileMap);

      expect(result['settings.json']).toEqual({ content: '{"key": "value"}' });
      expect(result['agents__test__AGENT.md']).toEqual({ content: '# Agent' });
    });
  });

  describe('gistFilesToFileMap', () => {
    it('converts gist files to file map', () => {
      const gistFiles = {
        'settings.json': { content: '{"key": "value"}' },
        'agents__test__AGENT.md': { content: '# Agent' },
        '.claude-config-sync-meta.json': { content: '{}' },
      };

      const result = gistFilesToFileMap(gistFiles);

      expect(result.get('settings.json')).toBe('{"key": "value"}');
      expect(result.get('agents/test/AGENT.md')).toBe('# Agent');
      expect(result.has('.claude-config-sync-meta.json')).toBe(false);
    });
  });

  describe('categorizeFiles', () => {
    it('categorizes files correctly', () => {
      const fileMap = new Map([
        ['settings.json', '{}'],
        ['keybindings.json', '{}'],
        ['CLAUDE.md', '# Instructions'],
        ['agents/test/AGENT.md', '# Agent'],
        ['skills/commit/SKILL.md', '# Skill'],
        ['rules/security.md', '# Rules'],
      ]);

      const categories = categorizeFiles(fileMap);

      expect(categories.settings).toEqual(['settings.json', 'keybindings.json']);
      expect(categories.memory).toEqual(['CLAUDE.md']);
      expect(categories.agents).toEqual(['agents/test/AGENT.md']);
      expect(categories.skills).toEqual(['skills/commit/SKILL.md']);
      expect(categories.rules).toEqual(['rules/security.md']);
    });
  });
});
