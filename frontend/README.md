# CHL UI - React Frontend

A React application built with Vite, featuring onboarding and daily check-in UI with streak tracking. The project is organized with a clean component structure, shared design tokens, and reusable UI components.

## Features

- ✅ React 18 with Vite
- ✅ React Router for navigation
- ✅ Onboarding flow (8 steps) with habit preference collection
- ✅ Daily check-in interface with streak tracking
- ✅ Reusable component library
- ✅ Design system with tokens and animations
- ✅ LocalStorage integration for user/habit IDs
- ✅ API service layer with error handling
- ✅ Integration with FastAPI backend

## Getting Started

### Installation

Install dependencies:

```bash
npm install
```

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

- `/` or `/onboarding` - Onboarding flow (8 steps)
- `/checkin` - Daily check-in interface with streak display

Use the navigation bar at the top to switch between views.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ActionOption.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Confetti.jsx
│   │   ├── InfoBox.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── Quote.jsx
│   │   ├── SelectableOption.jsx
│   │   ├── SelectChip.jsx
│   │   ├── StoneJar.jsx
│   │   ├── StreakDisplay.jsx
│   │   ├── TodaysStone.jsx
│   │   └── index.js          # Component exports
│   ├── constants/            # Design tokens and constants
│   │   ├── designTokens.js   # Colors, fonts, spacing
│   │   └── animations.js     # CSS animations
│   ├── data/                # Static data and options
│   │   ├── checkinData.js    # Check-in options
│   │   └── onboardingData.js # Onboarding options
│   ├── pages/               # Page components
│   │   ├── DailyCheckIn.jsx  # Daily check-in page
│   │   └── Onboarding.jsx   # Onboarding flow page
│   ├── services/            # API service layer
│   │   └── api.js           # API client with error handling
│   ├── utils/               # Utilities
│   │   └── userStorage.js   # localStorage utilities
│   ├── App.jsx              # Main app with routing
│   ├── App.css
│   ├── main.jsx             # Entry point with BrowserRouter
│   └── index.css
├── mocks/                   # Original mock files (preserved)
│   ├── daily-checkin-mockups-v7.jsx
│   └── onboarding-mockups-v6.jsx
├── index.html               # HTML template
├── vite.config.js           # Vite configuration with API proxy
├── package.json             # Dependencies
└── README.md
```

## Components

### Shared Components (`src/components/`)

Reusable UI components used across multiple pages:

- **Button** - Styled button with variants (primary, secondary, celebration, ghost, success)
- **Card** - Container component with optional glow effect
- **ActionOption** - Selectable action option for check-in
- **SelectChip** - Multi-select chip component
- **SelectableOption** - Generic selectable option component
- **InfoBox** - Information box with color variants
- **Quote** - Quote display component
- **ProgressBar** - Progress indicator for multi-step flows
- **StoneJar** - Visual stone jar component
- **TodaysStone** - Today's stone indicator
- **Confetti** - Celebration confetti animation
- **StreakDisplay** - Streak counter display

### Pages (`src/pages/`)

- **Onboarding** - 8-step onboarding flow for setting up habits
  - Collects user preferences
  - Saves data to backend via `POST /api/v1/saveUserHabitPreference`
  - Generates userId and habitId using `userStorage` utility
  - Stores IDs in localStorage as `chl_userId` and `chl_habitId`

- **DailyCheckIn** - Daily habit check-in interface
  - Multiple views: check-in, completed, progress, recovery
  - Loads streak data on mount via `GET /api/v1/getUserHabitStreakById`
  - Updates streak on check-in via `POST /api/v1/updateUserHabitStreakById`
  - Displays current streak and longest streak

## API Integration

### API Service (`src/services/api.js`)

Centralized API client with error handling:

```javascript
import { habitsAPI, streaksAPI, reflectionsAPI } from '../services/api';

// Habits
await habitsAPI.saveUserHabitPreference(data);
await habitsAPI.getUserHabitById(userId, habitId);
await habitsAPI.generateIdentities(data);

// Streaks
await streaksAPI.getUserHabitStreakById(userId, habitId);
await streaksAPI.updateUserHabitStreakById(data);

// Reflections
await reflectionsAPI.getAll();
```

### User Storage (`src/utils/userStorage.js`)

Manages userId and habitId in localStorage:

```javascript
import { getOrCreateUserAndHabitIds, getUserId, getHabitId } from '../utils/userStorage';

// Get or create IDs (format: user_<timestamp>_<random>)
const { userId, habitId } = getOrCreateUserAndHabitIds();

// Get existing IDs
const userId = getUserId();
const habitId = getHabitId();
```

**Format**: 
- `userId`: `user_<timestamp>_<random>` (e.g., `user_1769767002465_jlo73t4f9`)
- `habitId`: `habit_<timestamp>_<random>` (e.g., `habit_1769767002465_4lkk1ns6n`)

**Storage keys**: `chl_userId` and `chl_habitId`

## Usage Examples

### Importing Components
```jsx
import { Button, Card, InfoBox, StreakDisplay } from '../components';
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

### Using API Services
```jsx
import { streaksAPI } from '../services/api';
import { getUserId, getHabitId } from '../utils/userStorage';

// Load streak data
const userId = getUserId();
const habitId = getHabitId();
const streakData = await streaksAPI.getUserHabitStreakById(userId, habitId);

// Update streak
await streaksAPI.updateUserHabitStreakById({
  userId,
  habitId,
  checkInDate: '2024-01-30'
});
```

## Vite Configuration

The `vite.config.js` includes:
- Proxy configuration for API calls (`/api` → `http://localhost:8000`)
- Port configuration (3000)
- React plugin

## Architecture Benefits

1. **Reusability** - Components can be shared across pages
2. **Maintainability** - Changes to design tokens affect entire app
3. **Organization** - Clear separation of concerns
4. **Scalability** - Easy to add new components, pages, or data
5. **Consistency** - Shared components ensure UI consistency
6. **API Integration** - Centralized API service with error handling
7. **State Management** - LocalStorage for user/habit IDs

## Technology Stack

- **React** 18.2 - UI library
- **Vite** 5.0 - Build tool and dev server
- **React Router** 6.20 - Client-side routing
- **ESLint** - Code linting

## Development Notes

- Original mock files are preserved in the `/mocks` folder for reference
- All components use inline styles with design tokens for consistency
- The app follows a component-based architecture with clear separation of concerns
- Design tokens (colors, fonts) are centralized for easy theming
- API calls are proxied through Vite to the backend at `http://localhost:8000`
- User/habit IDs are generated and stored in localStorage during onboarding
- Streak data is loaded and updated via API calls

## Data Flow

1. **Onboarding**:
   - User completes 8-step onboarding
   - Each step calls `POST /api/v1/saveUserHabitPreference`
   - userId and habitId generated using `getOrCreateUserAndHabitIds()`
   - IDs stored in localStorage as `chl_userId` and `chl_habitId`

2. **Daily Check-In**:
   - Page loads, fetches streak: `GET /api/v1/getUserHabitStreakById`
   - User completes check-in
   - Updates streak: `POST /api/v1/updateUserHabitStreakById`
   - Displays updated streak count

## Troubleshooting

### API Connection Issues

1. Ensure backend is running on `http://localhost:8000`
2. Check Vite proxy configuration in `vite.config.js`
3. Verify API calls use `/api` prefix (proxied to backend)

### User/Habit ID Issues

1. Check localStorage: `localStorage.getItem('chl_userId')`
2. Ensure IDs are generated during onboarding
3. Verify format matches backend expectations: `user_<timestamp>_<random>`

### Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

For more detailed structure information, see [STRUCTURE.md](./STRUCTURE.md).

## License

MIT
