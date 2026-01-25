# CHL UI

A React application built with Vite, featuring onboarding and daily check-in UI mockups. The project is organized with a clean component structure, shared design tokens, and reusable UI components.

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

### Routes

- `/` or `/onboarding` - Onboarding flow (8 steps)
- `/checkin` - Daily check-in interface

Use the navigation bar at the top to switch between views.

### Build

Build for production:

```bash
npm run build
```

### Preview

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
chlui/
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
│   │   ├── designTokens.js   # Colors, fonts
│   │   └── animations.js     # CSS animations
│   ├── data/                # Static data and options
│   │   ├── checkinData.js    # Check-in options
│   │   └── onboardingData.js # Onboarding options
│   ├── pages/               # Page components
│   │   ├── DailyCheckIn.jsx  # Daily check-in page
│   │   └── Onboarding.jsx   # Onboarding flow page
│   ├── App.jsx              # Main app with routing
│   ├── App.css
│   ├── main.jsx             # Entry point with BrowserRouter
│   └── index.css
├── mocks/                   # Original mock files (preserved)
│   ├── daily-checkin-mockups-v7.jsx
│   └── onboarding-mockups-v6.jsx
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies
└── STRUCTURE.md             # Detailed structure documentation
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
- **DailyCheckIn** - Daily habit check-in interface with multiple views (check-in, completed, progress, recovery)

## Usage Examples

### Importing Components
```jsx
import { Button, Card, InfoBox } from '../components';
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

## Architecture Benefits

1. **Reusability** - Components can be shared across pages
2. **Maintainability** - Changes to design tokens affect entire app
3. **Organization** - Clear separation of concerns
4. **Scalability** - Easy to add new components, pages, or data
5. **Consistency** - Shared components ensure UI consistency

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

For more detailed structure information, see [STRUCTURE.md](./STRUCTURE.md).
