# Raider Syndicate

> ARC Raiders community hub — blueprint tracker & marketplace

A fully functional mobile app (React Native + Expo) backed by a Node.js/Express API with Firebase/Firestore, built to mirror and extend **[raider-syndicate.com](https://raider-syndicate.com)**.

## Features

| Feature | Description |
|---|---|
| **Blueprint Tracker** | Browse, filter, and bookmark ARC Raiders blueprints |
| **Marketplace** | G2G-style listing cards with filters, sort, seller ratings, and instant/manual delivery badges |
| **Auth** | Register & log in via Firebase Authentication |
| **Profile** | View credits, tracked blueprints, and active listings |

## Project Structure

```
R4N4R0K/
├── mobile/          # React Native (Expo) app
│   ├── src/
│   │   ├── screens/         # HomeScreen, BlueprintsScreen, MarketplaceScreen, …
│   │   ├── components/      # Card, RarityBadge, SearchBar, LoadingSpinner
│   │   ├── navigation/      # Stack + Tab navigator
│   │   ├── context/         # AuthContext (Firebase auth state)
│   │   ├── services/        # api.ts — typed Axios wrappers
│   │   └── theme/           # Colors, Spacing, FontSize, Radius, Shadow
│   ├── App.tsx
│   └── app.json
├── backend/         # Node.js + Express API
│   └── src/
│       ├── routes/          # blueprints, marketplace, auth, tracker
│       ├── middleware/       # JWT auth (Firebase token verification)
│       └── config/          # Firebase Admin SDK init
└── CLAUDE.md        # AI assistant guidance
```

## Quick Start

### Prerequisites
- Node.js 18+
- Yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Firebase project (Firestore + Authentication enabled)

### Backend

```bash
cd backend
cp .env.example .env        # fill in Firebase credentials
yarn install
yarn dev                    # starts on http://localhost:3001
```

### Mobile

```bash
cd mobile
cp .env.example .env        # set EXPO_PUBLIC_API_URL
yarn install
yarn start                  # opens Expo DevTools
# then press 'a' for Android, 'i' for iOS, or scan QR with Expo Go
```

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo SDK 51 |
| Navigation | React Navigation v6 (Native Stack + Bottom Tabs) |
| Backend | Node.js + Express 4 |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Icons | @expo/vector-icons (Ionicons) |

## License

BSD 3-Clause — see [LICENSE](./LICENSE).