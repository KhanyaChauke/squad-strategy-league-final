# Admin System Documentation

## Overview
The Squad Strategy League app now has an admin system that grants special privileges to designated administrators.

## Admin User
**Admin Email:** `khc.chauke@gmail.com`

Any user who registers or logs in with this email address will automatically be granted admin privileges.

## Admin Features

### 1. Admin Badge
Admin users will see an "ADMIN" badge in the Admin Zone section of the dashboard.

### 2. Simulate My Gameweek
Admins can simulate their own gameweek just like any other user. This generates random match statistics and updates their squad's points.

### 3. Simulate ALL Users Gameweek (Admin Only)
This is the primary admin feature. When clicked, it:
- Simulates the next gameweek for **ALL users** in the database who have squads
- Generates random match statistics for each player
- Calculates points based on performance
- Updates each user's total points and history
- Resets transfers and applies free transfer rollover
- Skips users who don't have a squad set up

### How It Works

1. **Admin Detection:**
   - When a user registers or logs in, the system checks if their email matches the admin email
   - If it matches, the `isAdmin` flag is set to `true` in their user profile

2. **Admin Controls:**
   - The "Admin Zone" section only appears in the dashboard for admin users
   - Non-admin users won't see any admin controls

3. **Security:**
   - The `simulateGameweekForAllUsers` function checks if the current user is an admin before executing
   - If a non-admin tries to call this function, it will fail with an "Unauthorized" error

## Usage Instructions

### For Admin Users:

1. **Log in** with the admin email (`khc.chauke@gmail.com`)
2. Navigate to the **Fpls** tab in the dashboard
3. Scroll down to the **Quick Actions** card
4. You'll see the **Admin Zone** section with two buttons:
   - **Simulate My Gameweek**: Simulates only your gameweek
   - **Simulate ALL Users Gameweek**: Simulates gameweek for all users in the system

5. Click **Simulate ALL Users Gameweek** to process the next gameweek for everyone
6. Wait for the success notification
7. Check the **Leaderboard** to see updated standings

## Technical Details

### Database Structure
- Admin status is stored in the `isAdmin` field in the user document in Firestore
- This field is automatically set during registration and login based on email matching

### Simulation Process
The simulation:
1. Fetches all users from Firestore
2. For each user with a squad:
   - Generates random match statistics (goals, assists, clean sheets, etc.)
   - Calculates points using the points system
   - Updates total points (accounting for transfer costs)
   - Adds the gameweek result to their history
   - Resets transfers and applies free transfer rollover (max 2)
3. Saves all updates back to Firestore

### Points Calculation
Points are calculated based on:
- Minutes played
- Goals scored (weighted by position)
- Assists
- Clean sheets (for GK and DEF)
- Saves (for GK)
- Penalties saved
- Yellow/Red cards (negative points)
- Own goals (negative points)

## Future Enhancements

Potential future admin features:
- Manual gameweek result entry
- User management (view/edit user squads)
- System statistics and analytics
- Gameweek scheduling
- Points adjustment tools
- Bulk operations (reset season, etc.)
