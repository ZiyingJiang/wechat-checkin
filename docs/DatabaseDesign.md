# Database Design

## 一起成长每日打卡 — v1.0.2

**Last Updated:** 2026-08-31  
**Version:** v1.0.2  
**Status:** Multi-user MVP / User Testing & Release Preparation

---

## 1. Overview

The application uses **WeChat Cloud Database** as its backend database.

The v1.0.2 database design supports:

- Multiple WeChat users
- User identification through `openId`
- Activity creators and participants
- Multiple participants in the same activity
- Daily check-ins
- Check-in ownership
- Participant leave functionality
- Activity deletion with related data cleanup
- Creator-only activity editing and deletion
- Protection against duplicate participants
- Protection against duplicate daily check-ins
- Protection against unauthorized check-in modification
- Expired activity restrictions

The fundamental design principle is:

> **The database records the relationship between users, activities, participants, and check-ins explicitly rather than relying on page-level state.**

---

# 2. Collections

The current application uses four main collections:

```text
activities
participants
checkins
users
```

The core application relationship is:

```text
                ┌──────────────┐
                │     User     │
                │   openId     │
                └──────┬───────┘
                       │
             creates / participates
                       │
                       ▼
                ┌──────────────┐
                │   Activity   │
                │     _id      │
                │ creatorOpenId│
                └──────┬───────┘
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      ┌──────────────┐    ┌──────────────┐
      │ Participants │    │   Checkins   │
      │              │    │              │
      │ activityId   │    │ activityId   │
      │ openId       │    │ openId       │
      └──────────────┘    └──────────────┘
```

---

# 3. `activities`

The `activities` collection stores the definition and lifecycle information for each challenge/activity.

## Main fields

| Field | Type | Description |
|---|---|---|
| `_id` | String | WeChat Cloud Database document ID |
| `title` | String | Activity name |
| `description` | String | Activity description |
| `fields` | Array | Metrics/items participants record during check-in |
| `days` | Number | Activity duration |
| `createdAt` | Date | Activity start date |
| `endDate` | Date | Activity calculated end date |
| `joinCode` | String | Code used to join the activity |
| `creatorOpenId` | String | OpenID of the activity creator |
| `maxParticipants` | Number | Maximum number of participants |

### Example

```js
{
  _id: "activity-id",

  title: "每天喝水",
  description: "连续坚持14天",

  fields: [
    "饮水量"
  ],

  days: 14,

  createdAt: new Date(),
  endDate: new Date(),

  joinCode: "ABC123",

  creatorOpenId: "oXXXXXX",

  maxParticipants: 100
}
```

---

# 4. Activity Ownership

Every activity has one creator:

```text
activities.creatorOpenId
```

The creator is identified by:

```js
activity.creatorOpenId === openId
```

The creator has additional permissions:

- Edit activity title
- Edit activity description
- Delete activity

Participants do not have these permissions.

The creator is also treated as an activity participant for participant counting purposes through the `participants` collection.

Therefore, an activity with:

```text
Creator A
Participant B
Participant C
```

should have:

```text
participant count = 3
```

The application does not calculate creator count separately. Participant count is derived from participant records.

---

# 5. `participants`

The `participants` collection stores the relationship between a user and an activity.

## Main fields

| Field | Type | Description |
|---|---|---|
| `_id` | String | Participant record ID |
| `activityId` | String | Related activity ID |
| `openId` | String | User's WeChat OpenID |
| `role` | String | User role, e.g. `member` |
| `joinedAt` | Date | Time the user joined |

### Example

```js
{
  _id: "participant-id",

  activityId: "activity-id",

  openId: "oXXXXXX",

  role: "member",

  joinedAt: new Date()
}
```

---

# 6. Participant Relationship

One user can participate in multiple activities.

One activity can have multiple participants.

Therefore the relationship is:

```text
User
  │
  ├── Activity A
  ├── Activity B
  └── Activity C
```

and:

```text
Activity A
  │
  ├── User A
  ├── User B
  └── User C
```

This is effectively a many-to-many relationship implemented through the `participants` collection.

---

# 7. Participant Uniqueness

A user should not be added to the same activity more than once.

Before creating a participant record, the application checks:

```js
findParticipant(activityId, openId)
```

If a record already exists:

```text
Do not create another participant record.
```

The join flow therefore follows:

```text
Enter join code
       ↓
Find activity
       ↓
Check activity validity
       ↓
Check whether user already joined
       ↓
Already joined?
   ┌───┴───┐
   Yes     No
   ↓        ↓
Notify   addParticipant()
```

---

# 8. Participant Identity Protection

Participant creation must use the identity of the current WeChat user.

The application verifies that:

```js
participant.openId
```

matches:

```js
getOpenId()
```

Conceptually:

```text
provided openId
       ↓
compare with current user's openId
       ↓
same?
 ┌─────┴─────┐
Yes          No
 ↓            ↓
allow       reject
```

This prevents one user from creating a participant record on behalf of another user.

---

# 9. Leave Activity

A participant can leave an activity.

The operation is implemented by:

```js
leaveActivity(activityId, openId)
```

The service performs the following checks:

### 1. Activity exists

```text
Activity not found
        ↓
reject
```

### 2. Creator cannot leave

```js
activity.creatorOpenId === openId
```

If true:

```text
Creator cannot leave activity
```

### 3. User must actually be a participant

The service verifies the participant record.

### 4. Delete the user's check-ins

```text
checkins
where:
activityId
openId
```

### 5. Delete the user's participant record

```text
participants
where:
activityId
openId
```

Therefore:

```text
Leave Activity
      ↓
Delete user's checkins
      ↓
Delete user's participant record
      ↓
Activity remains
```

The activity itself is never deleted when a normal participant leaves.

---

# 10. `checkins`

The `checkins` collection stores daily activity records.

## Main fields

| Field | Type | Description |
|---|---|---|
| `_id` | String | Check-in record ID |
| `activityId` | String | Related activity |
| `openId` | String | User who created the check-in |
| `day` | Number | Activity day number |
| `values` | Object | Recorded metrics |
| `note` | String | Optional note |
| `createdAt` | Date | Creation time, if stored |

### Example

```js
{
  _id: "checkin-id",

  activityId: "activity-id",

  openId: "oXXXXXX",

  day: 5,

  values: {
    "饮水量": "1800ml"
  },

  note: "今天状态不错"
}
```

---

# 11. Check-in Ownership

Every check-in belongs to the user identified by:

```js
checkin.openId
```

A user can only modify their own check-in.

The update flow is:

```text
updateCheckin(checkinId, values, note, openId)
              ↓
verify current user identity
              ↓
retrieve check-in
              ↓
check checkin.openId === openId
              ↓
          ┌───┴───┐
         Yes      No
          ↓        ↓
       update    reject
```

This prevents a user from modifying another user's check-in even if they know the check-in document ID.

---

# 12. Check-in Creation Protection

Creating a check-in requires several validations.

The service verifies:

### User identity

```text
openId exists
```

and:

```text
currentOpenId === openId
```

### Activity existence

The activity must exist.

### Activity participation

The user must either:

```text
be the creator
```

or:

```text
be a participant
```

### Duplicate daily check-in

The service checks:

```js
todayCheckin(activityId, day, openId)
```

If a record already exists:

```text
Today already checked in
```

and another record is not created.

---

# 13. Check-in Identity Rule

The service does not blindly trust the `openId` contained in the incoming check-in object.

Instead, the service creates the final data using the authenticated identity:

```js
const data = {
  ...checkin,
  openId: openId
};
```

The design principle is:

> **The service determines the user identity; the page does not determine whose data is written.**

---

# 14. Check-in Queries

### User's check-ins for one activity

```js
listCheckins(activityId, openId)
```

Query:

```js
{
  activityId,
  openId
}
```

This means a participant normally sees only their own check-in history.

---

### User's check-ins across multiple activities

```js
listCheckinsByActivities(activityIds, openId)
```

This is used by the dashboard.

Conceptually:

```text
User A
  ↓
Activities A, B, C
  ↓
Checkins belonging to User A
  ↓
Dashboard
```

---

# 15. Activity Deletion

Activity deletion is restricted to the creator.

The service:

```js
deleteActivity(activityId, openId)
```

first verifies:

```js
activity.creatorOpenId === openId
```

If the user is not the creator:

```text
reject
```

If authorized, related records are removed.

Deletion sequence:

```text
Delete Activity
       ↓
Delete participants
       ↓
Delete checkins
       ↓
Delete activity
```

This prevents orphan participant and check-in records from remaining after an activity has been deleted.

---

# 16. Activity Editing

Activity editing is also restricted to the creator.

Current v1.0.2 editing scope:

```text
title
description
```

The creator cannot use the current editing function to modify:

```text
days
fields
startDate
endDate
joinCode
creatorOpenId
```

This is intentional.

Changing duration or metrics after participants have already started checking in could create inconsistent historical data.

---

# 17. Activity Lifecycle

An activity has:

```text
startDate
endDate
```

The current day is calculated from the activity dates.

Conceptually:

```text
Before start
     ↓
Activity active
     ↓
Day 1 → Day 2 → ... → Day N
     ↓
Activity finished
```

Once an activity has finished:

### Check-in

Not allowed.

### Joining

Not allowed.

The join page validates that the activity is still active before allowing the participant record to be created.

This prevents users from joining an already completed challenge.

---

# 18. Join Code

Each activity receives a generated:

```text
joinCode
```

during activity creation.

Example:

```js
joinCode: generateJoinCode()
```

The join code identifies the activity for users who want to participate.

The join process is:

```text
User enters join code
        ↓
findActivityByCode()
        ↓
Activity exists?
        ↓
Activity still active?
        ↓
Already participant?
        ↓
addParticipant()
```

---

# 19. Dashboard Participant Count

The dashboard obtains activities through the user's participant records.

Conceptually:

```text
listParticipantsByOpenId(openId)
        ↓
activityIds
        ↓
listActivitiesByIds(activityIds)
        ↓
listParticipantsByActivities(activityIds)
        ↓
buildParticipantCountMap()
        ↓
dashboardActivities
```

The count is generated from:

```js
participants
```

rather than from a stored `participantCount` field in `activities`.

This avoids maintaining a second manually updated count.

### Count algorithm

```js
for (const participant of participants) {

  const activityId = participant.activityId;

  if (participantCountMap[activityId]) {
    participantCountMap[activityId]++;
  } else {
    participantCountMap[activityId] = 1;
  }

}
```

Therefore:

```text
Activity A

Participant records:
A
B
C

participantCount = 3
```

---

# 20. Important Data Integrity Principle

The application follows:

> **Derived data should preferably be calculated from source records rather than duplicated in multiple places.**

For example:

```text
participants
     ↓
participant count
```

rather than:

```text
activities.participantCount
```

This reduces the risk of:

```text
participant records = 3
participantCount = 2
```

However, participant-count inconsistencies were observed during development with historical test data and could not be reproduced after clearing the test database. The issue remains a monitoring item for future releases.

---

# 21. Data Ownership Model

The v1.0.2 ownership model can be summarized as:

| Data | Owner | Who can modify? |
|---|---|---|
| Activity | Creator | Creator |
| Participant record | Participant | System/service flow |
| Check-in | Check-in owner | Owner |
| Other user's check-in | Another user | Not allowed |
| Activity deletion | Creator | Creator |
| Activity title/description | Creator | Creator |

---

# 22. Service-layer Security Principle

Page-level UI restrictions are not considered sufficient protection.

For example:

```js
wx:if="{{isCreator}}"
```

only controls whether a button is displayed.

The actual service must also verify:

```js
activity.creatorOpenId === openId
```

Therefore:

```text
Page
 ↓
UI permission
 ↓
Service
 ↓
Identity verification
 ↓
Database operation
```

The service layer is the final application-level protection before database modification.

---

# 23. Current Security Checks

The v1.0.2 service layer includes protections for:

### Activity

- Creator identity verification
- Creator-only editing
- Creator-only deletion
- Activity existence validation

### Participants

- User identity verification
- Duplicate participant prevention
- Creator cannot leave
- Participant must actually belong to activity

### Check-ins

- Current user identity verification
- Activity existence validation
- Participant/creator authorization
- Duplicate daily check-in prevention
- Check-in ownership verification
- Unauthorized update prevention

---

# 24. Deletion Relationships

Current deletion behavior:

### Participant leaves

```text
Participant
   │
   ├── own checkins → DELETE
   │
   └── participant record → DELETE
```

### Creator deletes activity

```text
Activity
   │
   ├── participants → DELETE
   │
   ├── checkins → DELETE
   │
   └── activity → DELETE
```

### Important

Leaving an activity does **not** delete the activity.

Deleting an activity **does** delete all associated participant and check-in records.

---

# 25. Known Data Issue

During v1.0.2 real-device testing, an inconsistent participant count was observed under some existing test-data conditions.

Observed behavior included:

```text
Creator's device → count -1
Other users' devices → correct count
```

The underlying participant records were inspected and contained the expected users.

After clearing the test database and recreating the test data, the problem could no longer be reproduced.

### v1.0.2 decision

No workaround was added.

The issue is classified as:

```text
Known / Not currently reproducible
```

It should be monitored during real-world use.

If reproduced with production data, the next investigation should focus on:

- participant record duplication
- participant query results
- activity ID consistency
- dashboard activity ID construction
- timing/race conditions
- cached page state
- database query behavior

---

# 26. Future Database Considerations

The current schema is intentionally simple for the v1.0.2 MVP.

Potential future improvements include:

### v1.0.3

- More robust participant-count handling
- Batch query optimization
- Better dashboard aggregation
- Data consistency diagnostics
- Improved error handling

### v1.1+

Potential features:

- Activity statistics
- Export
- Ranking/leaderboard
- More detailed participation analytics

### v2.0+

Potential architecture:

```text
Organization
     ↓
Activities
     ↓
Administrators
     ↓
Participants
     ↓
Checkins
```

This would support multiple organizations or reading clubs.

---

# 27. Current Database Design Philosophy

The v1.0.2 design follows four core principles:

### 1. Identity must be explicit

Every user-owned record uses:

```text
openId
```

### 2. Relationships must be explicit

Activity membership is stored in:

```text
participants
```

rather than inferred from check-ins.

### 3. Ownership must be validated

The service verifies ownership before modifying or deleting data.

### 4. Derived information should come from source data

For example:

```text
participants → participant count
checkins → completion statistics
```

rather than storing unnecessary duplicated values.

---

# 28. Current Version

```text
Version: v1.0.2

Purpose:
First multi-user MVP suitable for real-world testing.

Current target:
Approximately 10–20 participants in real activities.

Status:
Experience version tested successfully with multiple real users.

Next milestone:
Official WeChat Mini Program release.
```

---

## Document History

| Date | Version | Changes |
|---|---|---|
| 2026-07-09 | Earlier version | Initial database design |
| 2026-08-31 | v1.0.2 | Updated for OpenID authentication, multi-user architecture, participant ownership, leave activity, check-in ownership, activity deletion/editing, lifecycle protection, and current data-integrity status |