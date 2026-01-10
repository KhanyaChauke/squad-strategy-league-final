# Comprehensive Application Logic Documentation

This document explicitly details all business logic, rules, and algorithms implemented in the Squad Strategy League application.

---

## 1. Authentication & User Profile Logic (`AuthContext.tsx`)

### **A. Login Process**
1.  **Input:** User provides Email & Password.
2.  **Logic:**
    *   Authenticate against Firebase Auth.
    *   **On Success:** Trigger "Auth State Listener".
    *   **State Listener:**
        *   Checks if a Firestore document exists for `users/{uid}`.
        *   **If Exists:** Loads profile (Squad, Budget, Team Name).
            *   *Crucial Data Handling:* Parses `budget` strictly as a Number (strips commas/strings) to prevent math errors.
        *   **If Missing (Self-Healing):** Automatically creates a new default profile with:
            *   Budget: 1,000,000,000 (1 Billion)
            *   Squad: Empty []
            *   Free Transfers: 1

### **B. Budget & Transfer Market Rules**
1.  **Adding a Player (Buying):**
    *   **Constraint 1 - Squad Size:**
        *   Total players (Squad + Bench) cannot exceed **15**.
        *   Bench cannot exceed **4**.
    *   **Constraint 2 - Budget:**
        *   User's `budget` must be greater than or equal to `player.price`.
        *   *Formula:* `NewBudget = CurrentBudget - PlayerPrice`
    *   **Constraint 3 - Duplicates:**
        *   Cannot add a player ID that already exists in Squad or Bench.
    *   **Constraint 4 - Formation limits (if active):**
        *   Example: A 4-4-2 formation only allows 4 DEF. If user tries to add a 5th DEF to the starting XI, it is rejected.

2.  **Removing a Player (Selling):**
    *   **Logic:**
        *   Player is removed from array.
        *   User is refunded the **full original price** (no depreciation implemented yet).
        *   *Formula:* `NewBudget = CurrentBudget + PlayerPrice`
    *   **Transfer Hits (Cost):**
        *   If the user has filled their team (15/15) and continues making changes, "Transfers Made" counter increments.
        *   If `TransfersMade > FreeTransfersAvailable`, a **-4 Point Penalty** is applied to the next Gameweek score.

---

## 2. Player Database & Economy Logic (`playersData.ts`)

### **A. Player Generation**
1.  **Source:** `footballDataApi.ts` (Static list of real PSL players).
2.  **Pricing Algorithm:**
    *   **Base Requirement:** The economy is balanced around a **1 Billion** total budget.
    *   **Target:** A user should spend approx 100% of budget to get 15 players.
    *   **Formula:**
        *   `AverageCost = 1,000,000,000 / 15` (~66M per player).
        *   **Multipliers:**
            *   ATT (Attackers): 1.4x cost (Most expensive).
            *   MID (Midfielders): 1.0x cost.
            *   DEF (Defenders): 0.8x cost.
            *   GK (Goalkeepers): 0.7x cost (Cheapest).
        *   **Rating Scaling:** Higher rated players cost exponentially more (`rating / 80`).
    *   **Constraints:**
        *   Minimum Price: **R20,000,000** (20M).
        *   All prices rounded to nearest **5,000,000**.

---

## 3. Gameplay Simulation Logic (`gameweekService.ts`)

### **A. Gameweek Scoring**
*   **Trigger:** User clicks "Simulate Gameweek" (or Admin runs it globally).
*   **Algorithm:**
    *   Iterates through every player in the **Starting XI** (Bench players score 0 unless substituted - auto-sub logic not fully implemented yet).
    *   **Base Score:** Every player wraps a random base performance (simulated match rating).
    *   **Event Simulation:**
        *   **Goal:** Random chance based on `Shooting` stat (Attackers have highest chance). +4/5/6 points based on position.
        *   **Assist:** Random chance based on `Passing` stat. +3 points.
        *   **Clean Sheet:** Defenders/GK get +4 points if the "Opponent Team" (abstracted) scores 0 goals (Random low probability).
    *   **Total Score:** Sum of all 11 players' points minus **Transfer Cost Hits**.

---

## 4. Live Data Sync Logic (`newsService.ts`)

### **A. Caching Strategy (Efficiency Rule)**
*   **Goal:** Do not spam external APIs (save money/quota) and load fast for user.
*   **Logic:**
    1.  **Check Firestore:** Determine when data was last saved (`syncedAt`).
    2.  **Staleness Check:**
        *   **News:** Considered stale after **12 Hours**.
        *   **Live Scores:** Considered stale after **10 Minutes**.
        *   **Standings:** Considered stale after **12 Hours**.
    3.  **Decision:**
        *   If Fresh -> Return DB data immediately.
        *   If Stale -> specific `syncWithAPI()` function is called.

### **B. External Sync (`syncFixturesWithAPI`)**
1.  **Fetch:** Calls RapidAPI (LiveScore endpoint).
2.  **Filter:**
    *   Iterates through *all* world matches.
    *   **Relevance Filter:** Checks if league name contains "PSL", "Premiership", "South Africa" OR if team names match "Chiefs", "Pirates", "Sundowns", "Bafana".
3.  **Normalization:**
    *   Maps raw API status (`1H`, `FT`) to app status (`In Progress`, `Finished`).
    *   Extracts **Team Logos** if available.
4.  **Persistence:** Saves strictly to `fixtures` collection in Firestore to utilize caching next time.

---

## 5. UI/Presentation Logic

### **A. Dashboard Access**
*   **Route:** `/`
*   **Logic:**
    *   Checks `user` object.
    *   **If Logged In:** Shows full dashboard (News, Squad, Leaderboard).
    *   **If Guest:** Shows public Dashboard (News Only).
    *   **Gatekeeping:** If Guest tries to click "My Squad", `AuthModal` is forced open.

### **B. Player Cards (`FifaCard.tsx`)**
*   **Visual Logic:**
    *   **Jersey Selection:** Checks team name string.
        *   If `team.includes('Chiefs')` -> Load Gold/Black Jersey.
        *   If `team.includes('Pirates')` -> Load Black/White Jersey.
        *   Else -> Load Default Generic Jersey.
    *   **Display:** Renders dynamic HTML overlays mimicking a real FUT card.
