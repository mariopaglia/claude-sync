import { describe, it, expect } from 'vitest';
import { computeDiff, hasDifferences, diffSummary } from '../../src/core/diff.js';

describe('diff', () => {
  describe('computeDiff', () => {
    it('detects added files', () => {
      const local = new Map([
        ['settings.json', '{}'],
        ['new-file.md', '# New'],
      ]);
      const remote = new Map([['settings.json', '{}']]);

      const diff = computeDiff(local, remote);

      expect(diff.added).toHaveLength(1);
      expect(diff.added[0].path).toBe('new-file.md');
      expect(diff.unchanged).toHaveLength(1);
    });

    it('detects modified files', () => {
      const local = new Map([['settings.json', '{"v2": true}']]);
      const remote = new Map([['settings.json', '{"v1": true}']]);

      const diff = computeDiff(local, remote);

      expect(diff.modified).toHaveLength(1);
      expect(diff.modified[0].localContent).toBe('{"v2": true}');
      expect(diff.modified[0].remoteContent).toBe('{"v1": true}');
    });

    it('detects removed files', () => {
      const local = new Map([['settings.json', '{}']]);
      const remote = new Map([
        ['settings.json', '{}'],
        ['old-file.md', '# Old'],
      ]);

      const diff = computeDiff(local, remote);

      expect(diff.removed).toHaveLength(1);
      expect(diff.removed[0].path).toBe('old-file.md');
    });

    it('detects unchanged files', () => {
      const local = new Map([['settings.json', '{}']]);
      const remote = new Map([['settings.json', '{}']]);

      const diff = computeDiff(local, remote);

      expect(diff.unchanged).toHaveLength(1);
      expect(diff.added).toHaveLength(0);
      expect(diff.modified).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
    });

    it('handles empty file maps', () => {
      const diff = computeDiff(new Map(), new Map());

      expect(diff.added).toHaveLength(0);
      expect(diff.modified).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
      expect(diff.unchanged).toHaveLength(0);
    });

    it('handles all types of changes together', () => {
      const local = new Map([
        ['settings.json', '{"new": true}'],  // modified
        ['CLAUDE.md', '# Same'],             // unchanged
        ['new.md', '# New file'],            // added
      ]);
      const remote = new Map([
        ['settings.json', '{"old": true}'],  // modified
        ['CLAUDE.md', '# Same'],             // unchanged
        ['old.md', '# Old file'],            // removed
      ]);

      const diff = computeDiff(local, remote);

      expect(diff.added).toHaveLength(1);
      expect(diff.modified).toHaveLength(1);
      expect(diff.removed).toHaveLength(1);
      expect(diff.unchanged).toHaveLength(1);
    });
  });

  describe('hasDifferences', () => {
    it('returns false when no differences', () => {
      const diff = computeDiff(
        new Map([['a', 'content']]),
        new Map([['a', 'content']]),
      );
      expect(hasDifferences(diff)).toBe(false);
    });

    it('returns true when there are differences', () => {
      const diff = computeDiff(
        new Map([['a', 'new']]),
        new Map([['a', 'old']]),
      );
      expect(hasDifferences(diff)).toBe(true);
    });
  });

  describe('diffSummary', () => {
    it('returns human-readable summary', () => {
      const diff = computeDiff(
        new Map([
          ['settings.json', '{"new": true}'],
          ['new.md', '# New'],
        ]),
        new Map([
          ['settings.json', '{"old": true}'],
          ['old.md', '# Old'],
        ]),
      );

      const summary = diffSummary(diff);
      expect(summary).toContain('1 added');
      expect(summary).toContain('1 modified');
      expect(summary).toContain('1 removed');
    });
  });
});
