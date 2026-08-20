# 📲 Champion Footballer - Notification API Documentation

This document provides complete API documentation for the Notification System (Sending notifications via Match update and managing user notifications for Flutter/Dart Mobile App Developers).

---

## 📌 Base URL & Headers

```http
Base URL: http://YOUR_SERVER_IP_OR_DOMAIN/api
```

All requests require JWT authentication:
```http
Authorization: Bearer <USER_JWT_TOKEN>
```

---

## 1️⃣ Send Match Notification API (Admin UI Feature)

When an admin updates a match and triggers custom notifications to players or the league:

### **Endpoint**
```http
PATCH /leagues/{leagueId}/matches/{matchId}
```

### **Content-Type**
`multipart/form-data` or `application/json`

### **Request Body Fields**

| Field | Type | Description | Required / Optional |
|---|---|---|---|
| `notificationMessage` | `String` | Message content (Max 50 characters) | Optional |
| `notificationAudience` | `String` | `"match"` (Players in this match) or `"league"` (All players in league) | Optional |
| `homeTeamName` | `String` | Home team name | Optional |
| `awayTeamName` | `String` | Away team name | Optional |
| `homeTeamUsers` | `String (JSON Array)` | Array of user IDs e.g. `["user_id_1", "user_id_2"]` | Optional |
| `awayTeamUsers` | `String (JSON Array)` | Array of user IDs e.g. `["user_id_3", "user_id_4"]` | Optional |
| `homeCaptainId` | `String` | Home team captain user ID | Optional |
| `awayCaptainId` | `String` | Away team captain user ID | Optional |
| `date` | `ISO Date String` | e.g. `2026-08-13T13:26:00.000Z` | Optional |
| `location` | `String` | Venue/Location name | Optional |

### **Example Response (200 OK)**

```json
{
  "success": true,
  "match": {
    "id": "8b082fc4-5a21-4f91-88df-b593ef9081a2",
    "leagueId": "9c123456-7890-1234-5678-901234567890",
    "homeTeamName": "Home Team",
    "awayTeamName": "Away Team",
    "date": "2026-08-13T13:26:00.000Z",
    "location": "fsd"
  },
  "message": "Match updated"
}
```

### **Flutter / Dart Request Example**

```dart
import 'package:http/http.dart' as http;

Future<void> updateMatchAndSendNotification({
  required String leagueId,
  required String matchId,
  required String token,
  required String notificationMessage,
  required String notificationAudience, // 'match' or 'league'
}) async {
  final url = Uri.parse('http://YOUR_SERVER_IP_OR_DOMAIN/api/leagues/$leagueId/matches/$matchId');
  
  var request = http.MultipartRequest('PATCH', url);
  request.headers['Authorization'] = 'Bearer $token';
  
  // Notification fields
  request.fields['notificationMessage'] = notificationMessage;
  request.fields['notificationAudience'] = notificationAudience;
  
  var streamedResponse = await request.send();
  var response = await http.Response.fromStream(streamedResponse);

  if (response.statusCode == 200) {
    print('Match updated and Notification sent successfully!');
  } else {
    print('Error sending notification: ${response.body}');
  }
}
```

---

## 2️⃣ Fetch User Notifications (In-App Notification List)

Retrieves up to 50 recent notifications for the logged-in user.

### **Endpoint**
```http
GET /notifications
```

### **Example Response (200 OK)**

```json
{
  "success": true,
  "notifications": [
    {
      "id": "e5b88137-9759-4b68-8090-d47565df4b3a",
      "user_id": "c7116a44-2457-41ab-85cf-257a070f80bc",
      "type": "MATCH_NOTIFICATION",
      "title": "Match Update - Super League",
      "body": "Match time shifted to 4:00 PM today!",
      "read": false,
      "meta": {
        "matchId": "8b082fc4-5a21-4f91-88df-b593ef9081a2",
        "leagueId": "9c123456-7890-1234-5678-901234567890",
        "leagueName": "Super League",
        "sentBy": "admin-id-here",
        "homeTeamName": "Home",
        "awayTeamName": "Away"
      },
      "created_at": "2026-08-18T16:30:00.000Z"
    }
  ]
}
```

---

## 3️⃣ Mark Notification as Read

Marks a specific notification as read.

### **Endpoint**
```http
PATCH /notifications/{notificationId}/read
```

### **Example Response (200 OK)**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 4️⃣ Delete Notification

Deletes a single notification or all user notifications.

### **Endpoint**
- **Single Notification**: `DELETE /notifications/{notificationId}`
- **Clear All Notifications**: `DELETE /notifications/clear-all`

### **Example Response**
```http
HTTP 204 No Content
```

---

## 5️⃣ Season Action Notification (Join / Decline)

Processes user action when a `NEW_SEASON` notification prompt is received.

### **Endpoint**
```http
POST /notifications/{notificationId}/season-action
```

### **Request Body**
```json
{
  "action": "join" // Options: "join" | "decline"
}
```

### **Example Response (200 OK)**
```json
{
  "success": true,
  "message": "You have joined Season 2!",
  "action": "joined",
  "seasonId": "season-uuid-here"
}
```

---

## 📱 Data Model (Dart Class Schema for Mobile App)

```dart
class AppNotification {
  final String id;
  final String userId;
  final String type; // 'MATCH_NOTIFICATION', 'NEW_SEASON', 'MATCH_ENDED', etc.
  final String title;
  final String body;
  final bool read;
  final Map<String, dynamic>? meta;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.body,
    required this.read,
    this.meta,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'],
      userId: json['user_id'] ?? '',
      type: json['type'] ?? 'GENERAL',
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      read: json['read'] ?? false,
      meta: json['meta'] != null ? Map<String, dynamic>.from(json['meta']) : null,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
    );
  }
}
```
