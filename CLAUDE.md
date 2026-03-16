# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working in this repository.

## Project Overview

**Raider Syndicate** is an ARC Raiders community hub — blueprint tracker & marketplace — owned by [jacobcowan93](https://github.com/jacobcowan93), licensed under BSD 3-Clause.

The app is based on [raider-syndicate.com](https://raider-syndicate.com) and consists of:
- **`mobile/`** — React Native (Expo) app
- **`backend/`** — Node.js/Express REST API backed by Firebase/Firestore

## Repository Structure

```
R4N4R0K/
├── mobile/                  # React Native (Expo) app
│   ├── App.tsx              # Root component — AuthProvider + AppNavigator
│   ├── app.json             # Expo config (dark theme, portrait, icons)
│   ├── babel.config.js      # Babel with module-resolver (@/ alias → src/)
│   ├── tsconfig.json        # Strict TypeScript with @/ path alias
│   └── src/
│       ├── screens/
│       │   ├── HomeScreen.tsx           # Dashboard: quick actions + recent items
│       │   ├── BlueprintsScreen.tsx     # Searchable + filterable blueprint list
│       │   ├── BlueprintDetailScreen.tsx# Detail view with materials + track button
│       │   ├── MarketplaceScreen.tsx    # G2G-style listings: sort, filters, cards
│       │   ├── TrackerScreen.tsx        # Bookmarked blueprints for logged-in user
│       │   ├── ProfileScreen.tsx        # User stats, settings, logout
│       │   ├── LoginScreen.tsx          # Email/password login
│       │   └── RegisterScreen.tsx       # New account creation
│       ├── components/
│       │   ├── Card.tsx                 # Touchable/static dark card
│       │   ├── RarityBadge.tsx          # Color-coded rarity chip
│       │   ├── SearchBar.tsx            # Styled search input with icon
│       │   └── LoadingSpinner.tsx       # Full-screen activity indicator
│       ├── navigation/
│       │   ├── index.tsx                # Stack navigator wrapping bottom tabs
│       │   └── types.ts                 # RootStackParamList + TabParamList
│       ├── context/
│       │   └── AuthContext.tsx          # User/token state + login/register/logout
│       ├── services/
│       │   └── api.ts                   # Axios client + typed API helpers
│       └── theme/
│           └── index.ts                 # Colors, Spacing, FontSize, Radius, Shadow
├── backend/                 # Node.js + Express API
│   └── src/
│       ├── index.js         # Entry: helmet, cors, rate-limit, route mounting
│       ├── config/
│       │   └── firebase.js  # Firebase Admin SDK init (env-based)
│       ├── middleware/
│       │   └── auth.js      # authenticate / optionalAuth — Firebase ID token
│       └── routes/
│           ├── auth.js      # POST /register, POST /login, GET /me
│           ├── blueprints.js# GET /blueprints, GET /blueprints/:id
│           ├── marketplace.js# GET /marketplace, POST, DELETE /:id
│           └── tracker.js   # GET /tracker, POST /:id, DELETE /:id
├── .gitignore
├── LICENSE                  # BSD 3-Clause (jacobcowan93, 2025)
├── package.json             # Yarn workspaces root
├── README.md
└── CLAUDE.md                # This file
```

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native 0.74 + Expo SDK 51 |
| Navigation | React Navigation v6 (NativeStack + BottomTabs) |
| HTTP client | Axios (typed wrappers in `src/services/api.ts`) |
| Backend | Node.js + Express 4 |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (ID tokens) |
| Icons | @expo/vector-icons (Ionicons set) |

## Theme System

All visual constants live in `mobile/src/theme/index.ts`:

- **`Colors`** — dark palette (`bg: #0a0a0a`), `primary: #e8a020` (amber/gold), rarity tier colors
- **`Spacing`** — xs/sm/md/lg/xl/xxl (4–48px)
- **`FontSize`** — xs through hero
- **`Radius`** — sm/md/lg/xl/full
- **`Shadow`** — `card` and `glow` presets

Always use these constants; never hardcode pixel values or color strings.

## API Routes

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account (Firebase Auth + Firestore user doc) |
| POST | `/api/auth/login` | — | Sign in (Firebase REST API), returns `idToken` |
| GET | `/api/auth/me` | ✓ | Get current user profile |

### Blueprints
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/blueprints` | optional | List all blueprints |
| GET | `/api/blueprints/:id` | optional | Get blueprint by ID |

### Marketplace
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/marketplace` | optional | Paginated listings (filter by category, rarity, search) |
| POST | `/api/marketplace` | ✓ | Create listing |
| DELETE | `/api/marketplace/:id` | ✓ (owner) | Remove listing |

### Tracker
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tracker` | ✓ | List tracked blueprints |
| POST | `/api/tracker/:blueprintId` | ✓ | Track blueprint |
| DELETE | `/api/tracker/:blueprintId` | ✓ | Untrack blueprint |

## Development Setup

### Backend

```bash
cd backend
cp .env.example .env    # add FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_WEB_API_KEY
yarn install
yarn dev                # nodemon on port 3001
```

### Mobile

```bash
cd mobile
cp .env.example .env    # set EXPO_PUBLIC_API_URL=http://localhost:3001/api
yarn install
yarn start              # Expo DevTools; press a/i for Android/iOS
```

## Git Workflow

| Branch | Purpose |
|---|---|
| `main` | Stable, production-ready |
| `master` | Legacy default |
| `claude/<desc>-<session-id>` | AI work branches |

- AI work must stay on `claude/` branches.
- Never push directly to `main`/`master`.
- Push: `git push -u origin <branch-name>`
- On network failure: retry up to 4× with 2s/4s/8s/16s backoff.

## Conventions for AI Assistants

1. **Minimal changes** — Only change what the task requires.
2. **Use theme constants** — Always import from `@/theme`, never hardcode.
3. **Type everything** — TypeScript strict mode is enabled; no `any` without justification.
4. **No secrets** — `.env` files are gitignored; never commit credentials.
5. **No speculative additions** — Don't add features, error handling, or abstractions not asked for.
6. **Preserve BSD-3 license** — Don't alter `LICENSE` or introduce GPL-incompatible dependencies.
7. **Branch discipline** — `claude/` prefix required; never commit to `main`/`master`.

## Current State

- **Active branch:** `claude/add-claude-documentation-wPuUn`
- **CI/CD:** Not yet configured
- **Tests:** Not yet configured
- **Backend:** Fully scaffolded — requires Firebase credentials to run
- **Mobile:** All screens implemented — requires Expo Go + running backend
