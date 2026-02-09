# claude-config-sync

<div align="center">

Sync your [Claude Code](https://claude.com/claude-code) configuration across machines using GitHub Gists.

[![npm version](https://img.shields.io/npm/v/claude-config-sync?color=blue)](https://www.npmjs.com/package/claude-config-sync)
[![npm downloads](https://img.shields.io/npm/dm/claude-config-sync)](https://www.npmjs.com/package/claude-config-sync)
[![CI](https://github.com/mariopaglia/claude-config-sync/actions/workflows/ci.yml/badge.svg)](https://github.com/mariopaglia/claude-config-sync/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/claude-config-sync)](https://nodejs.org)

</div>

---

## ✨ Features

- 🔄 **Sync config** across machines using GitHub Gists
- 🔐 **Secure** — never syncs OAuth tokens or secrets
- 💾 **Automatic backups** before overwriting files
- 🎯 **Selective import** — choose what to import from shared configs
- 🚀 **Fast** — minimal dependencies, small bundle size
- 📦 **Zero setup** — works out of the box with GitHub CLI

## 📦 Installation

```bash
npm install -g claude-config-sync
```

**Requirements:** Node.js 18+

## 🚀 Quick Start

```bash
# First machine — initialize
ccs init

# Push your config to GitHub Gist
ccs push

# Second machine — sync from gist
ccs link <gist-id>
ccs pull
```

> **💡 Tip:** `ccs` is a short alias for `claude-config-sync`

## 📚 Usage

### Initialize sync

```bash
ccs init
```

Creates a secret gist and syncs your current config.

### Push changes

```bash
ccs push          # with confirmation
ccs push --force  # skip confirmation
```

Upload local changes to your gist.

### Pull changes

```bash
ccs pull          # interactive conflict resolution
ccs pull --force  # accept all remote changes
```

Download changes from your gist.

### Check status

```bash
ccs status
```

See what's different between local and remote.

### Share your config

```bash
ccs share
```

Create a public gist to share with others. You choose which files to include.

### Import from others

```bash
ccs import https://gist.github.com/user/abc123
ccs import abc123def456
```

Selectively import config from a shared gist.

### Link existing gist

```bash
ccs link <gist-id>
```

Connect to an existing gist on a new machine.

### Unlink

```bash
ccs unlink
```

Remove local connection (doesn't delete the gist).

## 🔐 Authentication

The tool looks for a GitHub token in this order:

1. **GitHub CLI** — `gh auth token` (automatic if installed)
2. **Environment** — `GITHUB_TOKEN` variable
3. **Saved token** — `~/.claude-config-sync/config.json`
4. **Interactive prompt** — asks once, saves for future use

**Create a token:** [github.com/settings/tokens/new?scopes=gist](https://github.com/settings/tokens/new?scopes=gist) (needs `gist` scope only)

## 📁 What Gets Synced

| ✅ Synced | ❌ Never Synced |
|-----------|-----------------|
| `settings.json` | `~/.claude.json` (OAuth tokens) |
| `keybindings.json` | `*.local.json`, `*.local.md` |
| `CLAUDE.md` | `agent-memory/` |
| `agents/` (all files) | `ide/` |
| `skills/` (all files) | `statsig/`, `todo/`, `tmp/` |
| `rules/*.md` | `*.bak` files |

## 💾 Backups

Before overwriting any file during `pull` or `import`, automatic backups are created in:

```
~/.claude-config-sync/backups/
```

The last 5 backups per file are kept automatically.

## 🗂️ Storage Format

Gists don't support directories, so paths are encoded with `__`:

```
settings.json                         ← ~/.claude/settings.json
agents__code-reviewer__AGENT.md       ← ~/.claude/agents/code-reviewer/AGENT.md
skills__commit__SKILL.md              ← ~/.claude/skills/commit/SKILL.md
```

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository: [github.com/mariopaglia/claude-config-sync/fork](https://github.com/mariopaglia/claude-config-sync/fork)
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/claude-config-sync.git`
3. **Create a branch**: `git checkout -b feature/my-feature`
4. **Make changes** and add tests
5. **Run tests**: `npm test`
6. **Commit**: `git commit -m "feat: add amazing feature"`
7. **Push**: `git push origin feature/my-feature`
8. **Open a PR**: [github.com/mariopaglia/claude-config-sync/compare](https://github.com/mariopaglia/claude-config-sync/compare)

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

### Development

```bash
# Clone and install
git clone https://github.com/mariopaglia/claude-config-sync.git
cd claude-config-sync
npm install

# Build
npm run build

# Run tests
npm test

# Link locally for testing
npm link
ccs --version
```

## 📄 License

MIT © [Mario Paglia](https://github.com/mariopaglia)

## 🔗 Links

- [npm package](https://www.npmjs.com/package/claude-config-sync)
- [GitHub repository](https://github.com/mariopaglia/claude-config-sync)
- [Report issues](https://github.com/mariopaglia/claude-config-sync/issues)
- [Claude Code](https://claude.com/claude-code)

---

<div align="center">

**Made with ❤️ for the Claude Code community**

[⭐ Star on GitHub](https://github.com/mariopaglia/claude-config-sync) • [📦 View on npm](https://www.npmjs.com/package/claude-config-sync)

</div>
