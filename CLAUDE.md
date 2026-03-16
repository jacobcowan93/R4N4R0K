# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working in this repository.

## Project Overview

**R4N4R0K** is a repository owned by [jacobcowan93](https://github.com/jacobcowan93), licensed under the BSD 3-Clause License. As of the initial commit, the project is a minimal scaffold — no source code has been added yet. The `.gitignore` is configured for a [Jekyll](https://jekyllrb.com/) static site, suggesting that is the intended direction.

## Repository Structure

```
R4N4R0K/
├── .gitignore       # Jekyll/Bundler ignore rules
├── LICENSE          # BSD 3-Clause License (Copyright jacobcowan93, 2025)
├── README.md        # Project title only — to be expanded
└── CLAUDE.md        # This file
```

## Tech Stack (Intended)

| Layer       | Technology                                  |
|-------------|---------------------------------------------|
| Site        | [Jekyll](https://jekyllrb.com/) static site |
| Language    | Ruby (Jekyll), Liquid (templating)          |
| Styles      | Sass/SCSS (Jekyll default pipeline)         |
| Package Mgr | Bundler (`Gemfile`)                         |
| Hosting     | GitHub Pages (typical Jekyll deployment)    |

> Until a `Gemfile`, source content, or other configuration is committed, treat this as a blank Jekyll project.

## Git Workflow

### Branches

| Branch                              | Purpose                          |
|-------------------------------------|----------------------------------|
| `main`                              | Stable, production-ready code    |
| `master`                            | Legacy default (mirrors `main`)  |
| `claude/<description>-<session-id>` | AI-generated feature branches    |

- All AI assistant work should be done on a `claude/` prefixed branch.
- Never push directly to `main` or `master` without a pull request.

### Commit Conventions

- Use clear, descriptive commit messages in the imperative mood (e.g., `Add Jekyll config`, `Fix navigation layout`).
- Commits are GPG-signed by the repository owner.
- Keep commits focused — one logical change per commit.

### Push Workflow

```bash
git push -u origin <branch-name>
```

- Branch names for AI sessions must start with `claude/` and end with the session ID to avoid 403 errors.
- On network failure, retry up to 4 times with exponential backoff: 2s, 4s, 8s, 16s.

## Development Setup (Jekyll)

Once a `Gemfile` is added, the standard Jekyll workflow will apply:

```bash
# Install dependencies
bundle install

# Serve locally with live reload
bundle exec jekyll serve --livereload

# Build for production
bundle exec jekyll build
```

Output is generated to `_site/` (already gitignored).

## Ignored Paths

The following are excluded from version control (see `.gitignore`):

```
_site/            # Jekyll build output
.sass-cache/      # Sass compilation cache
.jekyll-cache/    # Jekyll incremental build cache
.jekyll-metadata  # Jekyll build metadata
.bundle/          # Bundler local config
vendor/           # Bundler-installed gems
```

Do not commit any of these paths.

## Conventions for AI Assistants

1. **Minimal changes** — Only make changes directly relevant to the task. Avoid refactoring unrelated code.
2. **No speculative files** — Do not create files (config, docs, source) unless explicitly requested or clearly required.
3. **Preserve license headers** — The project uses BSD 3-Clause. Do not alter `LICENSE` or add incompatible dependencies.
4. **Branch discipline** — Always develop on the designated `claude/` branch; never commit to `main`/`master`.
5. **Commit before pushing** — Ensure all changes are committed with a clear message before pushing.
6. **No secrets** — Do not commit API keys, tokens, `.env` files, or credentials of any kind.
7. **Respect `.gitignore`** — Do not force-add ignored files.

## Current State

- **Working tree:** Clean (no uncommitted changes at project initialization)
- **Active branch:** `claude/add-claude-documentation-wPuUn`
- **CI/CD:** Not yet configured
- **Tests:** Not yet configured
- **Source code:** Not yet added
