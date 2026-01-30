# Streak Integration Guide

This document explains how the streak functionality is integrated into the daily check-in page.

## Backend API Endpoints

### GET /api/v1/getUserHabitStreakById

**Query Parameters:**
- `userId` (string, required): User ObjectId
- `habitId` (string, required): Habit ObjectId

**Response:**
```json
{
  "currentStreak": 5,
  "longestStreak": 10,
  "lastCheckInDate": "2024-01-25"
}
```

**Behavior:**
- Returns streak data if exists
- Returns default values (all 0, lastCheckInDate: null) if streak doesn't exist
- Never returns 404 - always returns valid data

### POST /api/v1/updateUserHabitStreakById

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "habitId": "507f1f77bcf86cd799439012",
  "checkInDate": "2024-01-25"
}
```

**Response:**
```json
{
  "currentStreak": 6,
  "longestStreak": 10,
  "lastCheckInDate": "2024-01-25"
}
```

**Behavior:**
- If consecutive day (1 day after last check-in): increments `currentStreak`
- If day missed (more than 1 day gap): resets `currentStreak` to 1
- If same day: keeps streak unchanged
- Updates `longestStreak` if `currentStreak` exceeds it
- Creates new streak record if none exists

## Frontend Integration

### API Service

The streak API methods are available in `frontend/src/services/api.js`:

```javascript
import { streaksAPI } from '../services/api';

// Get streak
const streak = await streaksAPI.getUserHabitStreakById(userId, habitId);

// Update streak
const updated = await streaksAPI.updateUserHabitStreakById({
  userId,
  habitId,
  checkInDate: '2024-01-25'
});
```

### DailyCheckIn Component

The `DailyCheckIn` component now:

1. **Loads streak data on mount:**
   - Fetches current streak when component loads
   - Displays loading state while fetching
   - Shows error message if fetch fails (graceful degradation)

2. **Updates streak on check-in:**
   - When user saves a check-in, calls the update API
   - Automatically calculates consecutive days
   - Updates UI with new streak values
   - Handles errors gracefully

3. **Uses real data:**
   - `streakCount` comes from API `currentStreak`
   - `totalStones` uses `currentStreak` (can be updated if you have separate stone count)
   - `longestStreak` is tracked separately

## User ID and Habit ID

Currently, the component uses placeholder values that can be retrieved from:

1. **Local Storage** (recommended for now):
   ```javascript
   localStorage.getItem('userId')
   localStorage.getItem('habitId')
   ```

2. **React Router Params**:
   ```javascript
   import { useParams } from 'react-router-dom';
   const { userId, habitId } = useParams();
   ```

3. **Context/State Management**:
   - Redux, Zustand, or React Context
   - Set during onboarding flow

4. **Props**:
   - Pass from parent component

## MongoDB Collection Structure

The `streaks` collection stores:

```javascript
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),        // Required
  "habitId": ObjectId("..."),        // Required
  "currentStreak": Number,           // Default: 0
  "longestStreak": Number,           // Default: 0
  "lastCheckInDate": Date,           // Optional
  "createdAt": Date,                 // Auto-generated
  "updatedAt": Date                  // Auto-generated
}
```

## Usage Example

```javascript
// In DailyCheckIn component
useEffect(() => {
  const loadStreak = async () => {
    const data = await streaksAPI.getUserHabitStreakById(userId, habitId);
    setStreakCount(data.currentStreak);
  };
  loadStreak();
}, [userId, habitId]);

// On check-in save
const handleSave = async () => {
  const today = new Date().toISOString().split('T')[0];
  const updated = await streaksAPI.updateUserHabitStreakById({
    userId,
    habitId,
    checkInDate: today
  });
  setStreakCount(updated.currentStreak);
};
```

## Next Steps

1. ✅ Backend API endpoints implemented
2. ✅ Frontend API service updated
3. ✅ DailyCheckIn component integrated
4. ⏭️ Connect userId/habitId from onboarding flow
5. ⏭️ Add separate stone count tracking (if needed)
6. ⏭️ Add streak history/analytics

## Testing

Test the integration:

1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:3000/checkin
4. Check browser console for API calls
5. Verify streak updates when saving check-ins

## Troubleshooting

**Issue:** Streak not loading
- Check browser console for errors
- Verify backend is running on port 8000
- Check userId and habitId are valid ObjectIds
- Verify MongoDB connection

**Issue:** Streak not updating
- Check network tab for API request/response
- Verify checkInDate format is YYYY-MM-DD
- Check backend logs for errors

**Issue:** CORS errors
- Verify backend CORS is configured
- Check Vite proxy in `vite.config.js`
