# claudesync

Sync your [Claude Code](https://claude.com/claude-code) configuration across machines using GitHub Gists.

[![CI](https://github.com/mariopaglia/claudesync/actions/workflows/ci.yml/badge.svg)](https://github.com/mariopaglia/claudesync/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/claudesync.svg)](https://www.npmjs.com/package/claudesync)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why?

Claude Code stores all user configurations in `~/.claude/` (settings, keybindings, agents, skills, rules, CLAUDE.md). There is no native sync between machines. **claudesync** fills that gap with a polished CLI tool that uses GitHub Gists as backend — the same approach VS Code uses for profile export/import.

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
npm install -g claudesync
```

Requires Node.js 18+.

## Quick start

```bash
# First machine — initialize
claudesync init

# Push your config
claudesync push

# Second machine — link to existing gist
claudesync link <gist-id>
claudesync pull
```

## Authentication

claudesync looks for a GitHub token in this order:

1. `gh auth token` (GitHub CLI)
2. `GITHUB_TOKEN` environment variable
3. Saved token in `~/.claudesync/config.json`
4. Interactive prompt (saved for future use)

The token only needs the `gist` scope. [Create one here](https://github.com/settings/tokens/new?scopes=gist).

## Commands

### `claudesync init`

First-time setup. Scans `~/.claude/`, creates a secret gist, and saves the link locally.

### `claudesync push`

Upload local config changes to the remote gist. Shows a diff summary before pushing.

```bash
claudesync push          # interactive confirmation
claudesync push --force  # skip confirmation
```

### `claudesync pull`

Download remote config to local machine. Interactive conflict resolution for modified files.

```bash
claudesync pull          # interactive per-file decisions
claudesync pull --force  # accept all remote changes (creates backups)
```

### `claudesync status`

Show diff between local and remote. No changes are made.

### `claudesync share`

Create a **public** gist to share your config with others. You choose which files to include.

### `claudesync import <url-or-id>`

Import config from a shared gist. Selective — you pick which items to import.

```bash
claudesync import https://gist.github.com/user/abc123
claudesync import abc123def456
```

### `claudesync link <gist-id>`

Link to an existing gist on a new machine. Use this instead of `init` when you already have a sync gist.

### `claudesync unlink`

Remove the local link to the gist. The gist itself is NOT deleted.

## Backups

Before overwriting any local file during `pull` or `import`, claudesync creates a backup in `~/.claudesync/backups/`. The last 5 backups per file are kept.

## Storage format

Gists don't support directories, so paths are encoded with `__` separator:

```
settings.json                         ← ~/.claude/settings.json
agents__code-reviewer__AGENT.md       ← ~/.claude/agents/code-reviewer/AGENT.md
skills__commit__SKILL.md              ← ~/.claude/skills/commit/SKILL.md
```

## License

MIT
