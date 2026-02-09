# Contributing to claude-sync

Thanks for your interest in contributing!

## Development setup

```bash
# Clone the repo
git clone https://github.com/mariopaglia/claude-sync.git
cd claude-sync

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run test:watch

# Link locally to test the CLI
npm link
claude-sync --help
```

## Project structure

```
src/
  commands/    # CLI command implementations
  core/        # Business logic (auth, gist API, scanner, diff, backup)
  ui/          # Interactive prompts, spinners, diff display
  utils/       # Constants, logger, file system helpers
tests/
  core/        # Unit tests for core modules
  commands/    # Tests for CLI commands
  fixtures/    # Sample ~/.claude/ structures
```

## Guidelines

- Write tests for new features
- Use `vitest` for testing
- Keep dependencies minimal — no `octokit`, use native `fetch`
- Follow existing code style (Prettier + ESLint)
- Commits should follow conventional commit format

## Pull requests

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes with tests
4. Run `npm test` and `npm run build`
5. Open a PR against `main`
