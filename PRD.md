# Product Requirement Document (PRD): Champion Footballer

**Version**: 1.0.0  
**Status**: Active / Production Blueprint  
**Target Audience**: Automated Testing Suites (E2E, Integration, Unit), Developers, QA Engineers  

---

## 1. Project Overview & Core Purpose

**Champion Footballer** is an end-to-end, high-performance web platform for amateur and semi-professional football league management, player career tracking, dynamic statistics calculation, and fantasy "Dream Team" analytics.

### Core Objectives & Value Proposition
* **League & Season Management**: Provide league organizers with full control over custom leagues, multi-season structures, invite codes, squad locks, and match scheduling.
* **Matchday Operations**: Streamline match creation, player availability RSVPs, tactical pitch layout building, team assignments, and matchday captain picks (Defensive Impact & Mentality players).
* **Statistical & XP Engine**: Calculate real-time player ratings, goals, assists, clean sheets, discipline, and XP (Experience Points) based on custom reward algorithms (`rewards_algorithm.csv`), updating global rankings and seasonal trophy rooms dynamically.
* **Player Career & Analytics**: Offer players an interactive career dashboard featuring positional radar charts, win percentage calculations, Man of the Match (MOTM) voting tally, and lifetime achievements.
* **Fantasy & Global Ranking**: Generate automated "Dream Team" squads across various pitch formations based on top-performing players across all leagues.

---

## 2. Key User Roles & Permissions

The platform uses a role-based authorization model combined with JWT authentication tokens passed via HTTP cookies or headers (`token` / `auth_token`).

| Role | Access Level | Responsibilities & Capabilities |
| :--- | :--- | :--- |
| **Guest (Unauthenticated)** | Public Pages Only | - Access `/`, `/login`, `/register`, `/about`, `/terms`, `/privacy`, `/contact`.<br>- View public health endpoints (`/health`, `/ping`).<br>- Forbidden from viewing leagues, matches, profiles, or leaderboards (redirected to `/`). |
| **Registered Player (Member)** | Authenticated User | - Update personal profile, skills radar, position, shirt number, avatar.<br>- RSVP availability (`AVAILABLE` / `UNAVAILABLE`) for scheduled matches.<br>- Participate in MOTM voting for matches played.<br>- View personal stats, career history, trophy room, leaderboards, and world ranking.<br>- Join leagues via unique 16-character invite code. |
| **League Captain** | Designated Match Admin | - Selected as `homeCaptain` or `awayCaptain` for specific matches.<br>- Nominate team picks (Defensive Impact player, Mentality player).<br>- Upload match results, goals, and individual player stats.<br>- Confirm or request revision of match scoreline/statistics. |
| **League Admin / Organizer** | Full League Owner | - Create and update leagues (name, max games, badge image).<br>- Start new seasons, archive/restore old seasons.<br>- Lock/Unlock leagues (`COMPLETED` vs `LIVE`).<br>- Create, schedule, edit, or delete matches.<br>- Assign captains, switch/replace players between teams, and remove members from leagues. |
| **System / Service Worker** | Automated Service | - Compute background XP awards upon match result confirmation.<br>- Process database hooks (`NOTIFY` / `LISTEN`) for real-time cache invalidation.<br>- Dispatch season announcement and match completion emails via Nodemailer/AWS SES. |

---

## 3. Detailed Feature Breakdown & Functionalities

### 3.1 Authentication & User Management
* **Account Registration**: First name, last name, unique email, password (hashed via `bcrypt`, minimum length validated), and basic football info.
* **Social Authentication**: Google OAuth 2.0, Facebook, Apple Sign-In support (password field set to `null`).
* **Password Reset Workflow**: Request 6-digit OTP reset code sent via email, valid for 15 minutes (`resetCodeExpiry`).
* **Profile Setup & Attributes**:
  * **Positions**: Forward (`FW`), Midfielder (`MF`), Defender (`DF`), Goalkeeper (`GK`).
  * **Position Type**: Detailed role (e.g., Striker, Winger, Central Midfielder, Fullback).
  * **Play Style & Preferred Foot**: Left, Right, Both.
  * **Skill Metrics** (Scale 1–99): Dribbling, Shooting, Passing, Pace, Defending, Physical.
  * **Avatar Upload**: Cloudinary image upload with automatic caching & cache-busting headers.

### 3.2 League & Season Architecture
* **League Creation**: Admin defines unique league name, max games limit, visibility settings (`showPoints`), and badge image.
* **Invite Code Generation**: Unique 16-character string auto-generated per league and per season.
* **Multi-Season Hierarchy**:
  * Each league contains multiple `Season` records (Season 1, Season 2, etc.).
  * Only one season can be `isActive: true` per league at a time.
  * Archiving a season freezes player stats snapshot (`trophyAwardSnapshot`) without deleting raw match data.
* **League Status Controls**:
  * `LIVE`: Matches can be scheduled, updated, and played.
  * `COMPLETED`: League is locked for edits. All matches are read-only.

### 3.3 Matchday & Formation Management
* **Match Creation & Assignment**:
  * Auto-links to the currently active season (`seasonId`).
  * Assigns date, start time, end time, location, home/away team names, and team badges.
* **Player Availability RSVP**:
  * Registered league members mark themselves as `AVAILABLE` or `UNAVAILABLE`.
  * Real-time availability count reflected on match cards.
* **Pitch Formation & Layout Screen (`team-view`)**:
  * Visual 2D pitch drag-and-drop / coordinate grid layout.
  * Admins set custom x/y coordinates (`MatchPlayerLayout`) for 5v5, 7v7, or 11v11 formations.
* **Squad Editing Tools**:
  * `makeCaptain`: Set home or away team captain (`homeCaptainId`, `awayCaptainId`).
  * `switchPlayerTeam`: Move player from Home to Away or vice-versa.
  * `replacePlayer`: Swap an existing match player with a reserve/available player.
  * `MatchGuest`: Support non-registered guest players in match lineups.

### 3.4 Match Lifecycle & Score Confirmation
Matches progress through a strict 5-stage lifecycle state machine:

```
[SCHEDULED] ──► [IN_PROGRESS] ──► [RESULT_UPLOADED] ──► [REVISION_REQUESTED] (Optional)
                                        │                      │
                                        ▼                      ▼
                                [RESULT_PUBLISHED] ◄───────────┘
```

1. **`SCHEDULED`**: Match created, accepting availability RSVPs.
2. **`IN_PROGRESS`**: Match start time reached. Lineups locked.
3. **`RESULT_UPLOADED`**: Captain/Admin enters goals, score, and player statistics (assists, clean sheets, cards, rating).
4. **`REVISION_REQUESTED`**: Opposing captain rejects uploaded result and proposes alternative goal counts (`suggestedHomeGoals`, `suggestedAwayGoals`).
5. **`RESULT_PUBLISHED`**: Both captains/admin approve. Score is finalized, XP is distributed, and leaderboard stats lock in.

### 3.5 Captain Picks & MOTM Voting
* **Captain Picks**:
  * `Defensive Impact Pick`: Selected player receives defensive bonus points.
  * `Mentality Pick`: Selected player receives team spirit bonus XP.
* **Man of the Match (MOTM) Voting**:
  * Open to all users who participated in the match.
  * 1 vote per user per match (`Vote` model).
  * Player with highest vote tally awarded MOTM badge & bonus XP.

### 3.6 XP, Leaderboard & Trophy Engine
* **XP Award Metrics**:
  * Goal scored: +XP
  * Assist: +XP
  * Clean Sheet (GK/DEF): +XP
  * Match Win: +XP | Draw: +XP
  * Yellow Card: -XP | Red Card: -XP
  * Defensive/Mentality Pick bonus: +XP
* **Leaderboards**:
  * Sorted by: Total XP, Goals, Assists, Clean Sheets, MOTM awards, Win Rate %.
  * Filterable by League, Season, or Global scope.
* **Trophy Room**:
  * Automatically grants badges (e.g., Golden Boot, Playmaker, Wall, Season Champion) upon season closure.

### 3.7 Fantasy Dream Team
* **Automated Squad Generator**:
  * Calculates top-performing players based on position rating and average XP.
  * Constructs optimal XI formation (4-3-3, 4-4-2, 3-5-2).

---

## 4. User Flows

### Flow 1: New User Onboarding & League Joining
```
[User Registration] ──► [Email/Social Verification] ──► [Complete Profile Setup]
                                                                  │
                                                                  ▼
                                                      [Enter 16-Char Invite Code]
                                                                  │
                                                                  ▼
                                                       [Added to League & Season]
```
1. User navigates to `/register` or chooses Google/Facebook/Apple login.
2. Upon authentication, user is redirected to profile completion if position/skills are missing.
3. User navigates to `/all-leagues` -> clicks "Join League" -> inputs 16-character invite code.
4. Server validates invite code, associates user with `LeagueMember` and `SeasonPlayers`, returns updated league dashboard.

---

### Flow 2: Matchday Creation to Result Publishing
```
[Admin Creates Match] ──► [Players Submit RSVP] ──► [Admin Sets Lineup & Captains]
                                                                  │
                                                                  ▼
[Match Played] ◄──────────────────────────────────────────────────┘
      │
      ▼
[Captain Uploads Stats] ──► [Opposing Captain Confirms] ──► [XP Calculated & Published]
```
1. Admin creates match under active league season (`POST /leagues/:id/matches`).
2. Members view match card on `/all-matches` and toggle `AVAILABLE` / `UNAVAILABLE`.
3. Admin navigates to `team-view` pitch screen, sets home/away rosters, assigns captains, saves pitch layout.
4. After match completes, captain navigates to match details -> inputs score, player goals, assists, cards, ratings, and captain picks -> clicks "Upload Result".
5. Match status transitions to `RESULT_UPLOADED`.
6. Opposing captain receives notification -> reviews stats -> clicks "Confirm Result".
7. Match status updates to `RESULT_PUBLISHED`. Database triggers calculate XP and clear memory cache.

---

### Flow 3: Season Transition & Archiving
```
[Season End Date Reached] ──► [Admin Clicks "Complete Season"] ──► [Snapshot Trophies]
                                                                        │
                                                                        ▼
[Create Season N+1] ◄───────────────────────────────────────── [Archive Current Season]
```
1. Admin views `/league/:id` season tab.
2. Admin clicks "Complete Season". Server takes JSON snapshot of top scorers/winners (`trophyAwardSnapshot`).
3. Admin marks season as archived (`POST /leagues/:id/seasons/:seasonId/archive`).
4. Admin creates new season (`Season 2`) with fresh invite code.
5. System emails league members notifying them of new season registration.

---

## 5. API Endpoints & Data Models

### 5.1 Database Schemas & Relations (Sequelize)

#### `users` Table
| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique user identifier |
| `email` | STRING | Unique, Not Null | User email address |
| `password` | STRING | Nullable | Bcrypt hash (null for social auth) |
| `firstName` | STRING | Not Null | Given name |
| `lastName` | STRING | Not Null | Family name |
| `position` | STRING | Nullable | Primary position (`FW`, `MF`, `DF`, `GK`) |
| `positionType` | STRING | Nullable | Tactical sub-role |
| `shirtNumber` | STRING | Nullable | Preferred jersey number |
| `skills` | JSONB | Default 50s | Dribbling, shooting, passing, pace, defending, physical |
| `xp` | INTEGER | Default 0 | Total experience points |
| `achievements` | ARRAY(STRING)| Default `[]` | Earned badge keys |
| `provider` | STRING | Nullable | Social provider (`google`, `facebook`, `apple`) |

#### `Leagues` Table
| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique league ID |
| `name` | STRING | Unique, Not Null | Public league name |
| `inviteCode` | STRING | Unique, Not Null | 16-character join code |
| `maxGames` | INTEGER | Nullable | Max matches allowed per season |
| `active` | BOOLEAN | Default `true` | Active status |
| `archived` | BOOLEAN | Default `false` | Archival flag |
| `showPoints` | BOOLEAN | Default `true` | Leaderboard points toggle |

#### `Seasons` Table
| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique season ID |
| `leagueId` | UUID | FK -> Leagues.id | Parent league link |
| `seasonNumber` | INTEGER | Not Null | Sequential season index (1, 2, 3...) |
| `name` | STRING | Not Null | Display name (e.g. "Winter 2026") |
| `inviteCode` | STRING(16)| Unique, Not Null | Season-specific join code |
| `isActive` | BOOLEAN | Default `true` | Currently running season |
| `trophyAwardSnapshot`| JSONB | Default `{}` | Winner snapshot data |

#### `Matches` Table
| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique match ID |
| `leagueId` | UUID | FK -> Leagues.id | Parent league |
| `seasonId` | UUID | FK -> Seasons.id | Parent season |
| `date` | DATE | Not Null | Scheduled match date |
| `start` / `end` | DATE | Not Null | Match duration timestamps |
| `location` | STRING | Not Null | Pitch location / venue |
| `status` | ENUM | Default `SCHEDULED` | `SCHEDULED`, `IN_PROGRESS`, `RESULT_UPLOADED`, `REVISION_REQUESTED`, `RESULT_PUBLISHED` |
| `homeTeamGoals` | INTEGER | Nullable | Final home team score |
| `awayTeamGoals` | INTEGER | Nullable | Final away team score |
| `homeCaptainId` | UUID | Nullable | Assigned home captain |
| `awayCaptainId` | UUID | Nullable | Assigned away captain |
| `homeDefensiveImpactId`| UUID | Nullable | Home Defensive Impact pick |
| `homeMentalityId` | UUID | Nullable | Home Mentality pick |

#### `MatchStatistics` Table
| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique stat entry ID |
| `match_id` | UUID | FK -> Matches.id | Target match |
| `user_id` | UUID | FK -> users.id | Target player |
| `goals` | INTEGER | Default 0 | Individual goals scored |
| `assists` | INTEGER | Default 0 | Assists provided |
| `cleanSheets` | INTEGER | Default 0 | Clean sheet credit (1 or 0) |
| `yellowCards` | INTEGER | Default 0 | Yellow card count |
| `redCards` | INTEGER | Default 0 | Red card count |
| `rating` | FLOAT | Default 0.0 | Match performance rating (1.0 - 10.0) |
| `xpAwarded` | INTEGER | Default 0 | XP calculated for this match |

---

### 5.2 Key REST API Endpoints Specification

#### Authentication Endpoints (`/`)
* `POST /auth/register`
  * **Auth Required**: No
  * **Body**: `{ firstName, lastName, email, password, position, shirtNumber }`
  * **Response**: `201 Created` -> `{ success: true, token, user }`
* `POST /auth/login`
  * **Auth Required**: No
  * **Body**: `{ email, password }`
  * **Response**: `200 OK` -> `{ success: true, token, user }`
* `POST /auth/forgot-password`
  * **Auth Required**: No
  * **Body**: `{ email }`
  * **Response**: `200 OK` -> `{ success: true, message: "OTP sent" }`

#### League Endpoints (`/leagues`)
* `GET /leagues`
  * **Auth Required**: Yes
  * **Response**: `200 OK` -> Array of user's active leagues.
* `POST /leagues`
  * **Auth Required**: Yes
  * **Body (Multipart)**: `name`, `maxGames`, `image` (file)
  * **Response**: `201 Created` -> `{ success: true, league }`
* `POST /leagues/join`
  * **Auth Required**: Yes
  * **Body**: `{ inviteCode }`
  * **Response**: `200 OK` -> `{ success: true, message: "Joined league successfully", league }`
* `POST /leagues/:id/matches`
  * **Auth Required**: Yes (League Admin)
  * **Body**: `{ date, start, end, location, homeTeamName, awayTeamName, seasonId }`
  * **Response**: `201 Created` -> `{ success: true, match }`

#### Match Endpoints (`/matches`)
* `POST /matches/:matchId/availability`
  * **Auth Required**: Yes
  * **Body**: `{ status: "AVAILABLE" | "UNAVAILABLE" }`
  * **Response**: `200 OK` -> `{ success: true, availability }`
* `POST /matches/:matchId/stats`
  * **Auth Required**: Yes (Captain / Admin)
  * **Body**: `{ homeTeamGoals, awayTeamGoals, playerStats: [{ userId, goals, assists, cleanSheets, yellowCards, redCards, rating }] }`
  * **Response**: `200 OK` -> `{ success: true, message: "Result uploaded", match }`
* `POST /matches/:matchId/confirm`
  * **Auth Required**: Yes (Opposing Captain)
  * **Body**: `{ confirm: true }` or `{ confirm: false, suggestedHomeGoals, suggestedAwayGoals }`
  * **Response**: `200 OK` -> Status updated to `RESULT_PUBLISHED` or `REVISION_REQUESTED`.
* `POST /matches/:id/votes`
  * **Auth Required**: Yes
  * **Body**: `{ votedForId }`
  * **Response**: `200 OK` -> `{ success: true, message: "MOTM vote cast" }`

#### Leaderboard & Analytics (`/leaderboard`, `/world-ranking`, `/dream-team`)
* `GET /leaderboard?leagueId=UUID&seasonId=UUID&sortBy=xp`
  * **Auth Required**: No / Yes
  * **Response**: `200 OK` -> Array of ranked players.
* `GET /world-ranking`
  * **Auth Required**: No
  * **Response**: `200 OK` -> Top global players by XP.
* `GET /dream-team`
  * **Auth Required**: Yes
  * **Response**: `200 OK` -> Optimal formation XI with top players.

---

## 6. Edge Cases & Validation Rules

To ensure reliable automated test generation, test suites must cover the following boundary conditions and error handlers:

### 6.1 Authentication & Authorization
1. **Duplicate Email Registration**: Expect `400 Bad Request` or `409 Conflict` with error message `"Email already in use"`.
2. **Expired JWT Token**: Requests with expired/invalid cookie token must return `401 Unauthorized` and redirect browser to `/`.
3. **Non-Member League Access**: Users attempting to view or edit a league they are not a member of must receive `403 Forbidden`.

### 6.2 Match Lifecycle & Score Confirmation
1. **Unassigned Captain Stat Upload**: Attempting to call `POST /matches/:id/stats` from a user who is neither `homeCaptain`, `awayCaptain`, nor `LeagueAdmin` must fail with `403 Forbidden`.
2. **Duplicate Stat Upload**: Uploading stats for a match already in `RESULT_PUBLISHED` state must fail with `400 Bad Request` (`"Match results already published and locked"`).
3. **Invalid Goal Totals**: Sum of player goals in `playerStats` exceeding team score (`homeTeamGoals` / `awayTeamGoals`) must be rejected with validation error `422 Unprocessable Entity`.
4. **Self-Voting for MOTM**: Attempting to vote for oneself in MOTM voting must fail validation (`"Cannot vote for yourself"`).

### 6.3 Season Archival & Soft Deletes
1. **Scheduling in Inactive Season**: Attempting to create a match in an archived or inactive season must return `400 Bad Request` (`"Cannot schedule matches in an inactive season"`).
2. **Cascading Deletes**: Deleting a league soft-deletes its seasons and matches, ensuring historical stats are preserved without orphaned foreign keys.

### 6.4 Pitch Layout & Player Assignment
1. **Duplicate Player Position**: Assigning the same player to both Home and Away rosters in the same match must throw `400 Bad Request`.
2. **Unregistered Substitute**: Attempting to add a player to a team who is not a member of the league/season must return `404 Not Found` or `400 Bad Request`.

### 6.5 Concurrency & Idempotency
1. **Simultaneous MOTM Votes**: Concurrent vote requests from the same user ID must be blocked by the unique composite index (`matchId`, `voterId`).
2. **Idempotent XP Awarding**: Recalculating XP (`recalc-match-xp-impact.ts`) multiple times must yield the exact same user XP total without cumulative inflation.

---

**End of Product Requirement Document**
