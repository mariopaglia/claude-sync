# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2026-02-09

### Changed
- Renamed package to `claude-config-sync` (from `claudesync`)
- Added `ccs` as a short command alias
- Updated all documentation and code references
- Changed config directory to `~/.claude-config-sync/`

## [1.0.1] - 2026-02-09

### Fixed
- **Token persistence bug**: Fixed issue where the GitHub token was not preserved after `init` and `link` commands, causing subsequent commands to prompt for the token again. The token is now correctly reloaded after authentication and preserved in the config file.

## [1.0.0] - 2026-02-09

### Added
- Initial release
- `init` command to create sync gist
- `push` command to upload local changes
- `pull` command to download remote changes with conflict resolution
- `status` command to view sync status
- `share` command to create public shareable gists
- `import` command to selectively import from shared gists
- `link` command to connect to existing gist on new machine
- `unlink` command to remove local connection
- Automatic backups before overwriting local files
- Support for multiple authentication methods (gh CLI, env var, config, prompt)
- Sync for settings, keybindings, CLAUDE.md, agents, skills, and rules
- Hardcoded exclusions for sensitive files (tokens, local overrides)
