# Champion Footballer - Complete Mobile App API Documentation
## (Main Landing Page + Home Screen + All Leagues Page + All Matches Page + Static Data APIs)

This document provides detailed API documentation for Mobile App Developers (iOS / Android / Flutter / React Native) to integrate:
1. **All Matches Page (Matches List, Details, Availability, MOTM Voting, Stats & Management)**
2. **All Leagues Page (Leagues List, Standings, Seasons, Details & Actions)**
3. **Home Screen (User Dashboard After Login)**
4. **Main Landing Page (First Page)**
5. **General Platform Static Content & Rules**

---

## ⚡ REAL-TIME INSTANT SYNC INSTRUCTION FOR MOBILE APP DEVELOPER

To ensure that changes made in the Admin Panel update **immediately** on the Mobile App (without old cached data showing):
1. **Add Cache-Busting Query Parameter**: Always append `?_=${Date.now()}` to the request URL (e.g. `/api/static-content?_=${Date.now()}`).
2. **Add Headers**: Include `Cache-Control: no-cache, no-store, must-revalidate` and `Pragma: no-cache` in HTTP headers.

---

## 1. All Matches Page APIs (Mobile App Integration)

The **All Matches Page** allows users to view upcoming and completed match fixtures, set availability, vote for Man of the Match (MOTM), view team formations, submit match stats, view AI match predictions, and manage matches.

### 1.1 Get All Matches (Fixtures List)
Fetches all matches across leagues or filtered by league/season/status.

- **HTTP Method**: `GET`
- **Endpoint**: `/matches` (or `/profile/matches`)
- **Auth Required**: Yes (`Authorization: Bearer <USER_TOKEN>`)
- **Query Parameters**:
  - `leagueId` *(optional)* - Filter matches by league UUID.
  - `seasonId` *(optional)* - Filter matches by season UUID.
  - `status` *(optional)* - `UPCOMING`, `LIVE`, or `COMPLETED`.
- **Response Format**:
```json
{
  "success": true,
  "matches": [
    {
      "id": "match-uuid-1",
      "leagueId": "league-uuid-1",
      "leagueName": "Champions Premier League",
      "date": "2026-09-05T18:00:00.000Z",
      "venue": "Central Turf Arena",
      "homeTeamName": "Red Dragons",
      "awayTeamName": "Blue Eagles",
      "homeScore": 3,
      "awayScore": 2,
      "status": "COMPLETED",
      "hasStats": true,
      "userAvailability": "AVAILABLE"
    }
  ]
}
```

---

### 1.2 Get Match Details by ID
Fetches full details of a specific match fixture (Teams, Captains, Lineups, Availability list, Venue, and Scores).

- **HTTP Method**: `GET`
- **Endpoint**: `/matches/:matchId`
- **Auth Required**: Yes (`Authorization: Bearer <USER_TOKEN>`)
- **Path Parameter**: `matchId` (string, required) - Match UUID
- **Response Format**:
```json
{
  "success": true,
  "match": {
    "id": "match-uuid-1",
    "leagueId": "league-uuid-1",
    "date": "2026-09-05T18:00:00.000Z",
    "venue": "Central Turf Arena",
    "status": "UPCOMING",
    "homeTeamName": "Red Dragons",
    "awayTeamName": "Blue Eagles",
    "homeCaptain": { "id": "user-1", "name": "John Doe" },
    "awayCaptain": { "id": "user-2", "name": "Alex Smith" },
    "homeTeam": [
      { "id": "user-1", "name": "John Doe", "position": "CAM", "shirtNumber": "10" }
    ],
    "awayTeam": [
      { "id": "user-2", "name": "Alex Smith", "position": "ST", "shirtNumber": "9" }
    ]
  }
}
```

---

### 1.3 Get Match Availability List
Returns player availability responses for an upcoming match fixture.

- **HTTP Method**: `GET`
- **Endpoint**: `/matches/:matchId/availability`
- **Auth Required**: Yes (`Authorization: Bearer <USER_TOKEN>`)
- **Response Format**:
```json
{
  "success": true,
  "availability": {
    "available": [
      { "userId": "user-1", "name": "John Doe", "responseTime": "2026-08-28T10:00:00.000Z" }
    ],
    "unavailable": [
      { "userId": "user-3", "name": "Mark Wilson" }
    ],
    "totalAvailable": 10
  }
}
```

---

### 1.4 Get MOTM Voting Details
Returns current Man of the Match vote counts for a match.

- **HTTP Method**: `GET`
- **Endpoint**: `/matches/:matchId/votes`
- **Auth Required**: Yes (`Authorization: Bearer <USER_TOKEN>`)
- **Response Format**:
```json
{
  "success": true,
  "votes": [
    { "candidateId": "user-1", "candidateName": "John Doe", "voteCount": 5 }
  ],
  "userHasVoted": true,
  "votedForId": "user-1"
}
```

---

### 1.5 Get Match Stats (Goals, Assists & Clean Sheets)
Returns submitted individual stats for a completed match.

- **HTTP Method**: `GET`
- **Endpoint**: `/matches/:matchId/stats`
- **Auth Required**: Yes (`Authorization: Bearer <USER_TOKEN>`)
- **Response Format**:
```json
{
  "success": true,
  "stats": [
    { "userId": "user-1", "name": "John Doe", "goals": 2, "assists": 1, "cleanSheets": 0 }
  ]
}
```

---

### 1.6 Get Captain Picks (+Mentality & Defensive Impact)
Returns Captain Picks awarded for positive mentality and defensive impact.

- **HTTP Method**: `GET`
- **Endpoint**: `/matches/:matchId/captain-picks`
- **Auth Required**: Yes (`Authorization: Bearer <USER_TOKEN>`)
- **Response Format**:
```json
{
  "success": true,
  "picks": {
    "mentality": { "userId": "user-1", "name": "John Doe" },
    "defensiveImpact": { "userId": "user-2", "name": "Alex Smith" }
  }
}
```

---

### 1.7 Get Match XP Breakdown
Returns exact XP breakdown awarded to every player for a completed match.

- **HTTP Method**: `GET`
- **Endpoint**: `/matches/:matchId/xp-breakdown`
- **Auth Required**: Yes (`Authorization: Bearer <USER_TOKEN>`)
- **Response Format**:
```json
{
  "success": true,
  "xpBreakdown": [
    {
      "userId": "user-1",
      "name": "John Doe",
      "winBonusXp": 30,
      "goalXp": 6,
      "assistXp": 2,
      "motmXp": 10,
      "totalXp": 48
    }
  ]
}
```

---

### 1.8 Interactive Player Match Actions

#### A. Set Player Match Availability
- **HTTP Method**: `POST`
- **Endpoint**: `/matches/:matchId/availability`
- **Headers**: `Authorization: Bearer <USER_TOKEN>`
- **Body**: `{ "status": "AVAILABLE" }` or `{ "status": "UNAVAILABLE" }`

#### B. Vote for Man of the Match (MOTM)
- **HTTP Method**: `POST`
- **Endpoint**: `/matches/:matchId/votes`
- **Headers**: `Authorization: Bearer <USER_TOKEN>`
- **Body**: `{ "candidateId": "user-uuid-1" }`

#### C. Submit Score Prediction
- **HTTP Method**: `POST`
- **Endpoint**: `/matches/:matchId/prediction`
- **Body**: `{ "homeScore": 2, "awayScore": 1 }`

---

### 1.9 Match Management Actions (Captains & Admin)

#### A. Schedule New Match Fixture
- **HTTP Method**: `POST`
- **Endpoint**: `/matches` (or `/leagues/:leagueId/matches`)
- **Body**:
```json
{
  "leagueId": "league-uuid-1",
  "date": "2026-09-10T18:30:00.000Z",
  "venue": "Downtown Pitch 2"
}
```

#### B. Update Match Scores & Goals
- **HTTP Method**: `PATCH`
- **Endpoint**: `/matches/:matchId/goals`
- **Body**: `{ "homeScore": 3, "awayScore": 1 }`

#### C. Submit Player Stats (Goals / Assists)
- **HTTP Method**: `POST`
- **Endpoint**: `/matches/:matchId/stats`
- **Body**:
```json
{
  "stats": [
    { "userId": "user-1", "goals": 2, "assists": 1 },
    { "userId": "user-2", "goals": 1, "assists": 2 }
  ]
}
```

#### D. Submit Captain Picks
- **HTTP Method**: `POST`
- **Endpoint**: `/matches/:matchId/captain-picks`
- **Body**:
```json
{
  "mentalityUserId": "user-1",
  "defensiveImpactUserId": "user-2"
}
```

#### E. Delete / Cancel Match
- **HTTP Method**: `DELETE`
- **Endpoint**: `/matches/:matchId`

---

## 2. All Leagues Page APIs

- **`GET /leagues`** -> List all user leagues.
- **`GET /leagues/:id`** -> League details & member list.
- **`GET /leagues/:id/statistics`** -> League Standings & Leaderboard.
- **`GET /leagues/:id/seasons`** -> League seasons.
- **`POST /leagues`** -> Create league (supports logo upload).
- **`POST /leagues/join`** -> Join league via invite code.

---

## 3. Home Screen (App Dashboard After Login) APIs

- **`GET /users/me/global-stats`** -> Live Career Stats widget.
- **`GET /profile/me`** -> User Player Card widget data.
- **`GET /profile/leagues`** -> Joined leagues list.
- **`GET /api/static-content?_=${Date.now()}`** -> Home Screen static headings.

---

## 4. Main Landing Page (First Page) APIs

- **`GET /api/static-content?_=${Date.now()}`**
- **Keys**: `page_landing_images` (`hero_top_bg`, `feature1_img`, etc.), `page_main_card1_text`, `page_main_card2_text`, `page_main_feature1_title` to `page_main_feature4_title`.

---

## 5. Other Platform Static Content & Rules APIs

- **`GET /api/static-content/how_to_play`** -> How to play steps
- **`GET /api/static-content/game_rules`** -> Point scoring rules
- **`GET /api/static-content/xp_status`** -> Level milestones & colors
- **`GET /api/static-content/about_cf`** -> About description
- **`GET /api/static-content/privacy_policy`** & `terms_conditions` -> Legal policies

---

## 6. Flutter / Kotlin Code Example for All Matches Page

```dart
class MatchService {
  static const String baseUrl = 'https://api.championfootballer.com';

  // 1. Fetch All Matches List
  static Future<List<dynamic>> fetchMatches(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/matches'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body)['matches'];
    }
    throw Exception('Failed to load matches');
  }

  // 2. Set Availability (AVAILABLE / UNAVAILABLE)
  static Future<bool> setAvailability(String token, String matchId, String status) async {
    final response = await http.post(
      Uri.parse('$baseUrl/matches/$matchId/availability'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'status': status}),
    );
    return response.statusCode == 200;
  }

  // 3. Vote for Man of the Match (MOTM)
  static Future<bool> voteMotm(String token, String matchId, String candidateId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/matches/$matchId/votes'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'candidateId': candidateId}),
    );
    return response.statusCode == 200;
  }
}
```