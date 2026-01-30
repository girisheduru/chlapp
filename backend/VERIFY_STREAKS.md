# Verifying Streaks Collection in MongoDB

## Quick Verification

### Using MongoDB Shell (mongosh)

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use chl_datastore_db

# List all collections
show collections

# View streaks collection
db.streaks.find().pretty()

# Count documents
db.streaks.countDocuments({})

# Find specific streak
db.streaks.findOne({
  userId: ObjectId("507f1f77bcf86cd799439011"),
  habitId: ObjectId("507f1f77bcf86cd799439012")
})
```

### Using Python Script

```bash
cd backend
python3 test_streak_insert.py
```

## Important Notes

1. **Collection Creation**: MongoDB creates collections automatically on first insert. The `streaks` collection will only appear after the first document is inserted.

2. **Database Name**: Make sure you're looking in the correct database:
   - Default: `chl_datastore_db`
   - Check your `.env` file: `DATABASE_NAME=chl_datastore_db`

3. **Collection Name**: The collection is named `streaks` (lowercase, plural)

4. **When Collection Appears**: The collection will appear in MongoDB after:
   - First successful API call to `POST /api/v1/updateUserHabitStreakById`
   - Or first successful insert operation

## Testing the API

### Test with curl:

```bash
# Update streak (this will create the collection if it doesn't exist)
curl -X POST "http://localhost:8000/api/v1/updateUserHabitStreakById" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "habitId": "507f1f77bcf86cd799439012",
    "checkInDate": "2024-01-30"
  }'

# Get streak
curl "http://localhost:8000/api/v1/getUserHabitStreakById?userId=507f1f77bcf86cd799439011&habitId=507f1f77bcf86cd799439012"
```

### Test via Swagger UI:

1. Go to http://localhost:8000/docs
2. Find `POST /api/v1/updateUserHabitStreakById`
3. Click "Try it out"
4. Enter test data and execute
5. Check MongoDB for the new collection/document

## Troubleshooting

### Collection Not Appearing

1. **Check MongoDB is running:**
   ```bash
   # macOS
   brew services list | grep mongodb
   
   # Linux
   sudo systemctl status mongod
   ```

2. **Check database connection:**
   - Verify `.env` file has correct `MONGODB_URL`
   - Check backend logs for connection errors

3. **Check API is working:**
   - Test the health endpoint: `curl http://localhost:8000/health`
   - Check Swagger docs: http://localhost:8000/docs

4. **Verify database name:**
   ```bash
   mongosh
   show dbs
   use chl_datastore_db
   show collections
   ```

### Documents Not Inserting

1. **Check backend logs** for errors
2. **Verify ObjectId format** - must be valid 24-character hex string
3. **Check date format** - must be YYYY-MM-DD
4. **Test with the test script:**
   ```bash
   python3 test_streak_insert.py
   ```

## Expected Collection Structure

After inserting, you should see documents like:

```javascript
{
  "_id": ObjectId("..."),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "habitId": ObjectId("507f1f77bcf86cd799439012"),
  "currentStreak": 1,
  "longestStreak": 1,
  "lastCheckInDate": ISODate("2024-01-30T00:00:00.000Z"),
  "createdAt": ISODate("2024-01-30T14:35:49.000Z"),
  "updatedAt": ISODate("2024-01-30T14:35:49.000Z")
}
```

## Creating Indexes (Optional but Recommended)

For better query performance, you can create indexes:

```javascript
// In mongosh
use chl_datastore_db

// Create compound index on userId and habitId
db.streaks.createIndex({ userId: 1, habitId: 1 }, { unique: true })

// Verify index
db.streaks.getIndexes()
```
