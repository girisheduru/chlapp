# Project Structure

This document describes the organized structure of the CHL UI React application.

## Directory Structure

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
│   ├── main.jsx             # Entry point
│   └── index.css
├── mocks/                   # Original mock files (preserved)
│   ├── daily-checkin-mockups-v7.jsx
│   └── onboarding-mockups-v6.jsx
└── package.json
```

## Component Organization

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

### Constants (`src/constants/`)
- **designTokens.js** - Colors and fonts used throughout the app
- **animations.js** - CSS keyframe animations

### Data (`src/data/`)
- **checkinData.js** - Obstacle options, helper options, default user data
- **onboardingData.js** - Identity options, fun options, habit options, anchor options, environment options

### Pages (`src/pages/`)
- **DailyCheckIn.jsx** - Daily habit check-in interface with multiple views
- **Onboarding.jsx** - 8-step onboarding flow

## Usage

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

## Benefits of This Structure

1. **Reusability** - Components can be shared across pages
2. **Maintainability** - Changes to design tokens affect entire app
3. **Organization** - Clear separation of concerns
4. **Scalability** - Easy to add new components, pages, or data
5. **Consistency** - Shared components ensure UI consistency
