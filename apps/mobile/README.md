# TicketFlow Mobile

React Native (Expo) app for the TicketFlow event booking platform.

## Stack

| Layer | Library |
|---|---|
| Framework | [Expo SDK 53](https://expo.dev) + [Expo Router v5](https://expo.github.io/router/docs) |
| Language | TypeScript (strict) |
| Auth | Bearer token via `expo-secure-store` |
| Shared types | `@repo/types` (workspace package) |

## Getting Started

### 1. Install dependencies (from monorepo root)

```bash
bun install
```

### 2. Create your local env file

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Edit `EXPO_PUBLIC_API_URL` to point to your backend:
- **Simulator (iOS):** `http://localhost:4000`
- **Emulator (Android):** `http://10.0.2.2:4000`
- **Physical device:** `http://<your-machine-lan-ip>:4000`

### 3. Start the dev server

```bash
# From the monorepo root (starts all apps via Turborepo)
bun dev

# Or just the mobile app
bun --filter mobile dev

# Platform-specific shortcut
bun --filter mobile android
bun --filter mobile ios
```

Scan the QR code with the **Expo Go** app (iOS / Android) or press `i` / `a` to open a simulator.

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router file-based routes
│   ├── _layout.tsx         # Root layout (AuthProvider, StatusBar)
│   ├── index.tsx           # Redirect → login or /events
│   ├── login.tsx           # Sign-in screen
│   ├── register.tsx        # Create account screen
│   ├── (tabs)/             # Bottom tab navigator
│   │   ├── _layout.tsx     # Tab bar config
│   │   ├── events.tsx      # Events list + search + category filter
│   │   └── account.tsx     # Profile + my bookings + sign out
│   ├── events/[id].tsx     # Event detail + seat selector
│   ├── reservation/[id].tsx # Countdown + confirm/cancel reservation
│   └── booking/[id].tsx    # Booking confirmed + share
├── components/
│   ├── EventCard.tsx        # Event card with image, meta, seats count
│   ├── SeatGrid.tsx         # FlatList seat grid (available/selected/reserved/booked)
│   └── LoadingScreen.tsx    # Full-screen activity indicator
├── context/
│   └── AuthContext.tsx      # Auth state, login/register/logout, SecureStore session
├── lib/
│   ├── api.ts               # All API calls (typed, bearer-auth, ApiError class)
│   └── storage.ts           # SecureStore wrapper (web fallback to localStorage)
├── app.json                 # Expo config
├── metro.config.js          # Metro + monorepo resolver config
├── babel.config.js          # babel-preset-expo
├── tsconfig.json            # Expo TypeScript config
└── .env.example             # Environment variable template
```

## Screens

| Route | Description |
|---|---|
| `/login` | Email + password sign-in |
| `/register` | Create new account |
| `/(tabs)/events` | Browse all events, search, filter by category |
| `/(tabs)/account` | Profile card, booking history, sign out |
| `/events/[id]` | Event detail, seat grid, reserve selected seats |
| `/reservation/[id]` | 10-min countdown, confirm or cancel reservation |
| `/booking/[id]` | Booking confirmed with share sheet |

## Building for Production

This project uses [EAS Build](https://docs.expo.dev/build/introduction/).

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project (first time)
eas build:configure

# Build
eas build --platform android
eas build --platform ios
```

Update the `projectId` in `app.json` → `expo.extra.eas.projectId` with your EAS project ID.
