# 📢 Edit Match Notification Send API Documentation

This API is used to send notifications directly from the **Edit Match** dialog/modal to either players in the match or all players in the league.

---

## 📌 Endpoint Details

```http
PATCH /api/leagues/{leagueId}/matches/{matchId}
```

### **Headers**
```http
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: multipart/form-data (or application/json)
```

---

## 📥 Request Parameters & Payload

### **URL Parameters**
- `leagueId` (UUID / String): The ID of the league.
- `matchId` (UUID / String): The ID of the match being edited.

### **Body Parameters (Form Data / JSON)**

| Field | Type | Required | Description |
|---|---|---|---|
| `notificationMessage` | `String` | **Yes** | The text message entered in the notification box (Max 50 characters). |
| `notificationAudience` | `String` | **Yes** | Audience target: `"match"` (Players in this match) or `"league"` (All players in the league). |
| `homeTeamName` | `String` | No | Home team name (if updating match details). |
| `awayTeamName` | `String` | No | Away team name (if updating match details). |
| `homeTeamUsers` | `JSON String Array` | No | List of Home player user IDs e.g. `["uuid1", "uuid2"]`. |
| `awayTeamUsers` | `JSON String Array` | No | List of Away player user IDs e.g. `["uuid3", "uuid4"]`. |
| `date` | `String (ISO)` | No | Match start date e.g. `2026-08-13T13:26:00.000Z`. |
| `location` | `String` | No | Match venue location. |

---

## 📤 Response Format

### **Success Response (200 OK)**

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

### **Error Response (403 Forbidden - Non Admin)**

```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Only league admins can update matches"
}
```

---

## 📱 Flutter / Dart Integration Code (For Mobile App Developer)

```dart
import 'package:http/http.dart' as http;

Future<bool> sendEditMatchNotification({
  required String baseUrl, // e.g. 'http://your-domain.com/api'
  required String leagueId,
  required String matchId,
  required String adminToken,
  required String notificationMessage, // Max 50 chars
  required String notificationAudience, // 'match' or 'league'
}) async {
  final url = Uri.parse('$baseUrl/leagues/$leagueId/matches/$matchId');

  var request = http.MultipartRequest('PATCH', url);
  request.headers['Authorization'] = 'Bearer $adminToken';

  // Notification Specific Fields
  request.fields['notificationMessage'] = notificationMessage;
  request.fields['notificationAudience'] = notificationAudience;

  try {
    var streamedResponse = await request.send();
    var response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      print('✅ Notification sent successfully from Edit Match dialog');
      return true;
    } else {
      print('❌ Failed to send notification: ${response.body}');
      return false;
    }
  } catch (e) {
    print('⚠️ Error sending notification: $e');
    return false;
  }
}
```
