# Habit Flywheel - React Frontend

A React application built with Vite, featuring Firebase authentication, habit tracking with onboarding flows, daily check-ins with streak tracking, and AI-powered reflection insights. The project includes a clean component structure, shared design tokens, and reusable UI components.

## Features

- ✅ React 18 with Vite
- ✅ React Router for navigation
- ✅ Firebase Authentication with Google Sign-In
- ✅ Home page with habit tiles and progress overview
- ✅ Onboarding flow (8 steps) with habit preference collection
- ✅ Daily check-in interface with streak tracking and stone jar visualization
- ✅ Reflection flow with AI-generated insights and experiment suggestions
- ✅ Route guards (CheckInRouteGuard, ReflectionRouteGuard)
- ✅ Reusable component library (21 components)
- ✅ Design system with tokens and animations
- ✅ LocalStorage integration for habit IDs
- ✅ API service layer with error handling and auth token injection
- ✅ Integration with FastAPI backend

## Getting Started

### Installation

Install dependencies:

```bash
npm install
```

### Environment Variables (Optional)

For Firebase authentication, create a `.env` file:

```bash
cp .example.env .env
```

Edit `.env` with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

If Firebase is not configured, the app runs without authentication.

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

The frontend will hot-reload on code changes.

### Build

Build for production:

```bash
npm run build
```

The built files will be in `dist/`.

### Preview

Preview the production build:

```bash
npm run preview
```

## Routes

- `/` or `/home` - Home page with habit tiles
- `/onboarding` - Onboarding flow (8 steps) with `?habitId=` query param
- `/checkin` - Daily check-in interface with `?habitId=` query param
- `/reflect` - Reflection flow with `?habitId=` query param

Use the navigation bar at the top to switch between views.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components (21 components)
│   │   ├── ActionOption.jsx
│   │   ├── AddHabitButton.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── CheckInRouteGuard.jsx
│   │   ├── Confetti.jsx
│   │   ├── HabitTile.jsx
│   │   ├── HeaderJarIcon.jsx
│   │   ├── InfoBox.jsx
│   │   ├── LoginGate.jsx
│   │   ├── MiniStoneJar.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── Quote.jsx
│   │   ├── ReflectionRouteGuard.jsx
│   │   ├── SelectableOption.jsx
│   │   ├── SelectChip.jsx
│   │   ├── StoneJar.jsx
│   │   ├── StreakDisplay.jsx
│   │   ├── SummaryRow.jsx
│   │   ├── TodaysStone.jsx
│   │   └── index.js          # Component exports
│   ├── config/              # Configuration
│   │   └── firebase.js      # Firebase initialization
│   ├── constants/           # Design tokens and constants
│   │   ├── designTokens.js  # Colors, fonts, spacing
│   │   └── animations.js    # CSS animations
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx  # Firebase auth state
│   ├── data/                # Static data and options
│   │   ├── checkinData.js   # Check-in options
│   │   └── onboardingData.js # Onboarding options
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Home page with habit tiles
│   │   ├── Onboarding.jsx   # Onboarding flow page
│   │   ├── DailyCheckIn.jsx # Daily check-in page
│   │   └── Reflection.jsx   # Reflection flow page
│   ├── services/            # API service layer
│   │   └── api.js           # API client with auth
│   ├── utils/               # Utilities
│   │   ├── userStorage.js   # localStorage utilities
│   │   └── dateUtils.js     # Date formatting utilities
│   ├── App.jsx              # Main app with routing
│   ├── App.css
│   ├── main.jsx             # Entry point with providers
│   └── index.css
├── mocks/                   # Original mock files (preserved)
│   ├── daily-checkin-mockups-v7.jsx
│   ├── home-screen-v8.jsx
│   ├── onboarding-mockups-v6.jsx
│   └── reflection-flow-mockups-v5.jsx
├── index.html               # HTML template
├── vite.config.js           # Vite configuration with API proxy
├── vercel.json              # Vercel deployment config
├── package.json             # Dependencies
└── README.md
```

## Components

### Pages (`src/pages/`)

- **Home** - Dashboard showing all user's habits as tiles with progress indicators
  - Displays habit tiles with current streak and stone jar
  - Quick access to check-in and reflection for each habit
  - Add new habit button

- **Onboarding** - 8-step onboarding flow for setting up habits
  - Collects user preferences (identity, habit, enjoyment, cue, etc.)
  - Saves data to backend via `POST /api/v1/saveUserHabitPreference`
  - Uses `habitId` from query parameter

- **DailyCheckIn** - Daily habit check-in interface
  - Multiple views: check-in, completed, progress, recovery
  - Loads streak data on mount via `GET /api/v1/getUserHabitStreakById`
  - Updates streak on check-in via `POST /api/v1/updateUserHabitStreakById`
  - Displays stone jar visualization with streak count

- **Reflection** - AI-powered reflection flow
  - Loads insights, questions, and experiment suggestions via `GET /api/v1/getReflectionItems`
  - Displays personalized insights based on habit and streak data
  - Shows loading spinner while fetching AI-generated content
  - Instant loading when cached (background generation after check-in)
  - Offers experiment suggestions for habit improvement

### Shared Components (`src/components/`)

Reusable UI components used across multiple pages:

- **ActionOption** - Selectable action option for check-in
- **AddHabitButton** - Button to add a new habit
- **Button** - Styled button with variants (primary, secondary, celebration, ghost, success)
- **Card** - Container component with optional glow effect
- **CheckInRouteGuard** - Route guard that validates habitId before showing check-in
- **Confetti** - Celebration confetti animation
- **HabitTile** - Habit card for home page showing name, streak, and actions
- **HeaderJarIcon** - Stone jar icon for navigation header
- **InfoBox** - Information box with color variants
- **LoginGate** - Login screen with Google Sign-In button
- **MiniStoneJar** - Compact stone jar visualization for tiles
- **ProgressBar** - Progress indicator for multi-step flows
- **Quote** - Quote display component
- **ReflectionRouteGuard** - Route guard that validates habitId before showing reflection
- **SelectableOption** - Generic selectable option component
- **SelectChip** - Multi-select chip component
- **StoneJar** - Visual stone jar component with stone count
- **StreakDisplay** - Streak counter display with flame icon
- **SummaryRow** - Summary row for reflection insights
- **TodaysStone** - Today's stone indicator

## Authentication

### Firebase Auth Context (`src/contexts/AuthContext.jsx`)

Provides authentication state and methods:

```javascript
import { useAuth } from './contexts/AuthContext';

const { user, loading, signInWithGoogle, signOut, getIdToken, isFirebaseConfigured } = useAuth();
```

- `user` - Current Firebase user object (null if not signed in)
- `loading` - True while auth state is being determined
- `signInWithGoogle()` - Trigger Google Sign-In popup
- `signOut()` - Sign out and clear localStorage
- `getIdToken()` - Get Firebase ID token for API calls
- `isFirebaseConfigured` - True if Firebase is configured

### Auth Flow

1. App checks if Firebase is configured
2. If configured and no user, shows `LoginGate`
3. User signs in with Google
4. Auth token is automatically injected into API calls
5. On sign out, localStorage is cleared

## API Integration

### API Service (`src/services/api.js`)

Centralized API client with error handling and auth token injection:

```javascript
import { habitsAPI, streaksAPI, reflectionsAPI } from '../services/api';

// Habits
await habitsAPI.saveUserHabitPreference(data);
await habitsAPI.getUserHabitById(userId, habitId);
await habitsAPI.getAllUserHabits(userId);
await habitsAPI.generateIdentities(data);

// Streaks
await streaksAPI.getUserHabitStreakById(userId, habitId);
await streaksAPI.updateUserHabitStreakById(data);

// Reflections
await reflectionsAPI.getReflectionItems(habitId);
```

### Token Injection

The API service automatically injects Firebase auth tokens:

```javascript
import { setApiTokenGetter } from './services/api';

// In App.jsx
setApiTokenGetter(getIdToken);
```

### User Storage (`src/utils/userStorage.js`)

Manages habitId in localStorage:

```javascript
import { createNewHabitId, getHabitId, clearUserAndHabitIds } from '../utils/userStorage';

// Create new habit ID (format: habit_<timestamp>_<random>)
const habitId = createNewHabitId();

// Get existing habit ID
const habitId = getHabitId();

// Clear on sign out
clearUserAndHabitIds();
```

## Usage Examples

### Importing Components
```jsx
import { Button, Card, InfoBox, StreakDisplay, HabitTile } from '../components';
```

### Importing Constants
```jsx
import { colors, fonts } from '../constants/designTokens';
import { animations } from '../constants/animations';
```

### Importing Data
```jsx
import { obstacleOptions, helperOptions } from '../data/checkinData';
import { identityOptions, funOptions } from '../data/onboardingData';
```

### Using API Services with Auth
```jsx
import { streaksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  
  const loadStreak = async (habitId) => {
    // Token is automatically injected
    const streakData = await streaksAPI.getUserHabitStreakById(user.uid, habitId);
    console.log(streakData);
  };
}
```

## Vite Configuration

The `vite.config.js` includes:
- Proxy configuration for API calls (`/api` → `http://localhost:8000`)
- Port configuration (3000)
- React plugin

## Deployment

### Vercel

See `VERCEL.md` for detailed deployment instructions.

Quick deploy:
```bash
vercel
```

The `vercel.json` includes rewrites for SPA routing.

## Architecture Benefits

1. **Authentication** - Firebase handles secure user authentication
2. **Reusability** - Components can be shared across pages
3. **Maintainability** - Changes to design tokens affect entire app
4. **Organization** - Clear separation of concerns
5. **Scalability** - Easy to add new components, pages, or data
6. **Consistency** - Shared components ensure UI consistency
7. **API Integration** - Centralized API service with auth and error handling
8. **Type Safety** - Route guards ensure valid parameters

## Technology Stack

- **React** 18.2 - UI library
- **Vite** 5.0 - Build tool and dev server
- **React Router** 6.20 - Client-side routing
- **Firebase** - Authentication
- **ESLint** - Code linting

## Development Notes

- Original mock files are preserved in the `/mocks` folder for reference
- All components use inline styles with design tokens for consistency
- The app follows a component-based architecture with clear separation of concerns
- Design tokens (colors, fonts) are centralized for easy theming
- API calls are proxied through Vite to the backend at `http://localhost:8000`
- Firebase auth is optional - app works without it for local development
- Route guards validate habitId before rendering check-in or reflection pages

## Data Flow

1. **Authentication**:
   - User signs in with Google via Firebase
   - Auth state is managed in AuthContext
   - ID token is automatically injected into API calls

2. **Home Page**:
   - Loads all user habits via `GET /api/v1/getAllUserHabits`
   - Displays habit tiles with streak info
   - Provides quick actions for check-in and reflection

3. **Onboarding**:
   - User navigates with `?habitId=` query param
   - Completes 8-step onboarding
   - Each step calls `POST /api/v1/saveUserHabitPreference`

4. **Daily Check-In**:
   - Page loads with `?habitId=` query param
   - Fetches streak: `GET /api/v1/getUserHabitStreakById`
   - User completes check-in
   - Updates streak: `POST /api/v1/updateUserHabitStreakById`
   - Displays updated streak and stone jar

5. **Reflection**:
   - Page loads with `?habitId=` query param
   - Fetches insights: `GET /api/v1/getReflectionItems`
   - Displays AI-generated insights and suggestions

## Troubleshooting

### API Connection Issues

1. Ensure backend is running on `http://localhost:8000`
2. Check Vite proxy configuration in `vite.config.js`
3. Verify API calls use `/api` prefix (proxied to backend)

### Firebase Auth Issues

1. Check that all `VITE_FIREBASE_*` env vars are set
2. Ensure Firebase project has Google Sign-In enabled
3. Check browser console for Firebase errors

### Route Guard Issues

1. Ensure `habitId` is passed as query parameter
2. Check that habit exists in database
3. Verify user is authenticated

### Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

For more detailed structure information, see [STRUCTURE.md](./STRUCTURE.md).
For troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## License

MIT
