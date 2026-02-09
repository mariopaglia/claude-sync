# claude-sync

Sync your [Claude Code](https://claude.com/claude-code) configuration across machines using GitHub Gists.

[![CI](https://github.com/mariopaglia/claude-sync/actions/workflows/ci.yml/badge.svg)](https://github.com/mariopaglia/claude-sync/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/claude-sync.svg)](https://www.npmjs.com/package/claude-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why?

Claude Code stores all user configurations in `~/.claude/` (settings, keybindings, agents, skills, rules, CLAUDE.md). There is no native sync between machines. **claude-sync** fills that gap with a polished CLI tool that uses GitHub Gists as backend — the same approach VS Code uses for profile export/import.

## What gets synced

| Synced | Never synced |
|--------|-------------|
| `settings.json` | `~/.claude.json` (OAuth tokens) |
| `keybindings.json` | `*.local.json`, `*.local.md` |
| `CLAUDE.md` | `agent-memory/` |
| `agents/` (AGENT.md + supporting files) | `ide/` |
| `skills/` (SKILL.md + supporting files) | `statsig/`, `todo/`, `tmp/` |
| `rules/*.md` | `*.bak` files |

## Install

```bash
npm install -g claude-sync
```

Requires Node.js 18+.

## Quick start

```bash
# First machine — initialize
claude-sync init

# Push your config
claude-sync push

# Second machine — link to existing gist
claude-sync link <gist-id>
claude-sync pull
```

## Authentication

claude-sync looks for a GitHub token in this order:

1. `gh auth token` (GitHub CLI)
2. `GITHUB_TOKEN` environment variable
3. Saved token in `~/.claude-sync/config.json`
4. Interactive prompt (saved for future use)

The token only needs the `gist` scope. [Create one here](https://github.com/settings/tokens/new?scopes=gist).

## Commands

### `claude-sync init`

First-time setup. Scans `~/.claude/`, creates a secret gist, and saves the link locally.

### `claude-sync push`

Upload local config changes to the remote gist. Shows a diff summary before pushing.

```bash
claude-sync push          # interactive confirmation
claude-sync push --force  # skip confirmation
```

### `claude-sync pull`

Download remote config to local machine. Interactive conflict resolution for modified files.

```bash
claude-sync pull          # interactive per-file decisions
claude-sync pull --force  # accept all remote changes (creates backups)
```

### `claude-sync status`

Show diff between local and remote. No changes are made.

### `claude-sync share`

Create a **public** gist to share your config with others. You choose which files to include.

### `claude-sync import <url-or-id>`

Import config from a shared gist. Selective — you pick which items to import.

```bash
claude-sync import https://gist.github.com/user/abc123
claude-sync import abc123def456
```

### `claude-sync link <gist-id>`

Link to an existing gist on a new machine. Use this instead of `init` when you already have a sync gist.

### `claude-sync unlink`

Remove the local link to the gist. The gist itself is NOT deleted.

## Backups

Before overwriting any local file during `pull` or `import`, claude-sync creates a backup in `~/.claude-sync/backups/`. The last 5 backups per file are kept.

## Storage format

Gists don't support directories, so paths are encoded with `__` separator:

```
settings.json                         ← ~/.claude/settings.json
agents__code-reviewer__AGENT.md       ← ~/.claude/agents/code-reviewer/AGENT.md
skills__commit__SKILL.md              ← ~/.claude/skills/commit/SKILL.md
```

## License

MIT
