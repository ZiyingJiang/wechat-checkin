# Reading Club / 一起成长 — Project Handoff

> **Purpose:** This document is the canonical handoff for future AI-assisted development and human collaborators.  
> **Current checkpoint:** `v1.0.2-rc1` (Release Candidate — pre real multi-user/device testing)  
> **Product goal:** Quickly support a real small reading/habit group of roughly 10–20 members.

---

## 1. Project Overview

**Project:** Reading Club / 一起成长

**Platform**
- WeChat Mini Program
- WeChat CloudBase database
- JavaScript
- WXML / WXSS
- Native WeChat components; no third-party UI framework

**Core use case**

A creator creates a short-term growth/check-in activity. The creator receives a 6-character invitation code. Other users join with the code and record daily values for up to three user-defined metrics.

Current product flow:

```text
Home
 ├── Create Activity
 │      └── Creator automatically becomes participant
 │
 ├── Join Activity
 │      └── Invitation code
 │
 └── My Activities
        └── Activity
              ├── Activity dashboard
              ├── Creator: Edit / Delete
              ├── Participant: Leave
              └── Check-in
                    ├── Create today's check-in
                    └── Update today's check-in
```

---

## 2. Current Product Scope

### Implemented

- Create activity
- Creator identity using real WeChat OpenID
- Creator automatically added as a participant
- Join by invitation code
- Prevent duplicate participation
- Prevent joining expired activities
- Daily check-in
- Prevent duplicate check-in for the same activity/day/user
- Update user's own check-in
- Check-in ownership protection
- Activity dashboard
- Completion rate
- Checked-day count
- Current streak
- Activity finished state
- Participant count
- Creator-only edit
- Creator-only delete
- Participant-only leave
- Leave deletes the user's own check-ins
- Activity deletion removes activity, participants, and check-ins
- Loading/submitting/deleting/leaving states
- Input validation
- Navigation between Home → Activity → Check-in
- Empty states
- UI for small-group MVP

### Intentionally NOT in v1.0.2

- Leaderboard
- Advanced statistics/charts
- Notifications
- Sharing/QR-code invitation
- Multiple organizations
- Multiple administrators
- Admin roles/permissions beyond creator/member
- CSV export
- Sophisticated backend transaction architecture

These should not be introduced unless required by actual user testing.

---

## 3. Development Principles

The current development strategy is:

> **Correct > Usable > Elegant**

Priority order:

1. Multi-user correctness
2. Data correctness
3. Ownership/authorization
4. Basic usability
5. Code elegance/refactoring

The v1.0.2 goal is NOT a production-scale SaaS. It is:

> **A reliable MVP that a small real group can use for daily check-ins.**

---

## 4. Architecture

The project uses this architecture:

```text
Page
  ↓
Service
  ↓
CloudBase Database

Page
  ↓
Utils
```

### Main services

```text
miniprogram/services/
├── userService.js
├── activityService.js
├── participantService.js
├── checkinService.js
└── dashboardService.js
```

### Main utilities

```text
miniprogram/utils/
├── date.js
└── dashboard.js
```

### Important rule

Pages should not directly perform database operations.

Database operations belong in service files.

---

## 5. Authentication / OpenID

`userService.js` obtains the current user's OpenID through the `login` Cloud Function and caches it:

```text
getOpenId()
    ↓
wx.cloud.callFunction({ name: "login" })
    ↓
res.result.openId
```

The current design deliberately verifies identity in service functions for security-sensitive writes.

Examples:

```text
currentOpenId === supplied openId
```

and for updating a check-in:

```text
checkin.openId === openId
```

### Important security limitation

The current CloudBase database rules in the repository are permissive (`read: true`, `write: true`). Therefore the service-layer ownership checks are application-level protection, not a complete server-side authorization boundary.

For the intended small-group MVP, the current service protections have been tested. Before public/open distribution, CloudBase security rules or trusted cloud functions should be strengthened.

Do not assume that client-side service checks alone constitute production-grade authorization.

---

# 6. Data Model

## `activities`

Current code creates:

```text
_id
title
description
days
fields
status
createdAt
joinCode
startDate
endDate
creatorOpenId
maxParticipants
```

Important business fields:

| Field | Meaning |
|---|---|
| `_id` | Activity ID |
| `title` | Activity name |
| `description` | Activity description |
| `days` | Duration |
| `fields` | 1–3 user-defined check-in metrics |
| `status` | Current activity status value |
| `createdAt` | Creation time |
| `joinCode` | Six-character invitation code |
| `startDate` | Start date |
| `endDate` | Calculated end date |
| `creatorOpenId` | Creator identity |
| `maxParticipants` | Currently 100 |

### Important current behavior

`startDate` and `endDate` are generated by `createActivity()`.

`calculateEndDate(days)` uses:

```text
start + days - 1
```

---

## `participants`

Current code uses:

```text
activityId
openId
nickname
avatar
role
joinedAt
```

Roles currently used:

```text
creator
member
```

The creator is automatically inserted into `participants` when an activity is created.

### Important naming note

The current code consistently uses `openId`.

Older documentation contains `openid` in some places. Treat the current code as authoritative.

---

## `checkins`

Current code uses:

```text
activityId
openId
date
day
values
createdAt
note
```

`values` is an object keyed by the activity's `fields`.

Example:

```js
values: {
  "阅读": "30分钟",
  "运动": "20分钟"
}
```

The activity page converts this object into `valueList` for display.

---

# 7. Activity Ownership Model

Creator identity is determined by:

```text
activity.creatorOpenId === openId
```

Creator-only operations:

- Update activity title/description
- Delete activity

Participant operations:

- Check in
- Update own check-in
- Leave activity

Creator cannot leave their own activity.

---

# 8. Activity Service API

## `createActivity(activity, openId)`

Responsibilities:

1. Verify `openId` exists
2. Verify supplied OpenID matches current user
3. Generate join code
4. Generate start/end dates
5. Store creator OpenID
6. Create activity

Current implementation also sets:

```text
maxParticipants = 100
```

---

## `updateActivity(activityId, openId, values)`

Only the creator can update:

```text
title
description
```

The current MVP deliberately does NOT allow changing:

```text
days
fields
```

Reason: changing activity duration/metrics after users have started checking in would create data-consistency problems.

---

## `deleteActivity(activityId, openId)`

Only creator can delete.

Deletion order:

```text
participants
    ↓
checkins
    ↓
activity
```

This avoids leaving orphan participant/check-in records.

---

## `leaveActivity(activityId, openId)`

Participant only.

Behavior:

```text
verify activity exists
↓
verify current user identity
↓
creator cannot leave
↓
verify participant record exists
↓
delete user's checkins
↓
delete user's participant record
```

The activity itself remains.

---

## `findActivityByCode(joinCode)`

Finds activity using uppercase invitation code.

---

## `getActivityById(id)`

Returns activity by `_id`.

Pages are responsible for handling the case where no activity is returned.

---

# 9. Participant Service API

## `addParticipant(participant)`

Current implementation verifies:

```text
participant.openId exists
currentOpenId === participant.openId
```

before inserting.

The Join page separately verifies:

- activity exists
- activity has not expired
- user has not already joined

---

## `findParticipant(activityId, openId)`

Used to determine whether a user already participates.

---

## `listParticipantsByOpenId(openId)`

Used by dashboard loading to find activities joined by the current user.

---

## `listParticipantsByActivities(activityIds)`

Used to calculate participant counts for multiple activities.

---

# 10. Check-in Service API

## `createCheckin(checkin, openId)`

Current protection sequence:

```text
1. supplied OpenID exists
2. supplied OpenID matches current user
3. activity exists
4. user is creator OR participant
5. today's check-in does not already exist
6. service overwrites checkin.openId with verified openId
7. insert check-in
```

This prevents a caller from simply submitting another user's OpenID.

---

## `updateCheckin(checkinId, values, note, openId)`

Current protection sequence:

```text
1. supplied OpenID exists
2. supplied OpenID matches current user
3. check-in record exists
4. check-in.openId === openId
5. update only values and note
```

This prevents one user from modifying another user's check-in.

---

## `listCheckins(activityId, openId)`

Returns only the current user's check-ins for an activity.

---

## `listCheckinsByActivities(activityIds, openId)`

Returns only the current user's check-ins across multiple activities.

This is important for dashboard privacy.

---

## `todayCheckin(activityId, day, openId)`

Checks whether the current user already has a check-in for the activity/day.

---

# 11. Dashboard Architecture

`dashboardService.getDashboardActivities(openId)`:

```text
participants for current user
        ↓
activityIds
        ↓
activities
        ↓
all participants for those activities
        ↓
participant count map
        ↓
current user's check-ins
        ↓
check-in history map
        ↓
calculateDashboard()
        ↓
dashboard activity list
```

Each activity returned to the Home page contains:

```text
activity fields
+
participantCount
+
currentDay
+
checkedDays
+
streak
+
hasCheckedToday
+
completionRate
+
isFinished
```

---

# 12. Dashboard Calculations

`utils/dashboard.js` calls:

```text
calculateCurrentDay()
calculateStreak()
isActivityFinished()
```

### Completion rate

```text
checkedDays / activity.days × 100
```

rounded to an integer.

### Streak

The streak is based on consecutive `day` values in the user's own history.

If today's check-in is missing, the calculation starts from yesterday.

### Finished activity

The activity is considered finished when today's date is later than `endDate` at date-only precision.

---

# 13. Page Structure

```text
pages/
├── index/
│   ├── index.js
│   ├── index.wxml
│   ├── index.wxss
│   └── index.json
│
├── create/
├── join/
├── activity/
├── checkin/
└── example/
```

### Home page

Responsibilities:

- Load current user's activities
- Display dashboard summaries
- Navigate to create
- Navigate to join
- Navigate to activity
- Navigate directly to check-in

### Create page

Responsibilities:

- Collect activity information
- Validate title
- Validate duration
- Validate metrics
- Prevent duplicate metrics
- Create activity
- Add creator participant

### Join page

Responsibilities:

- Accept six-character invitation code
- Find activity
- Reject expired activity
- Reject duplicate participation
- Add participant

### Activity page

Responsibilities:

- Display activity
- Display current user's dashboard
- Determine creator/member UI
- Creator edit/delete
- Participant leave
- Navigate to check-in

### Check-in page

Responsibilities:

- Verify activity exists
- Reject expired activity
- Calculate current day
- Load today's existing check-in
- Collect metric values and note
- Create or update check-in

---

# 14. Navigation Design

Current preferred navigation:

```text
Home
  ↓ wx.navigateTo
Activity
  ↓ wx.navigateTo
Check-in
  ↓ wx.navigateBack
Activity
```

For the Home → Activity flow, `navigateTo` + `navigateBack` is currently preferred.

A previous DevTools-only visual artifact showed stale/residual content when switching activities. `redirectTo` reduced that artifact, but reverting to `navigateTo` was chosen because physical-device testing did not reproduce the problem and the normal navigation stack is preferable.

If the artifact reappears in real devices, investigate lifecycle/rendering before changing navigation architecture again.

---

# 15. Important UI / Rendering Finding

A DevTools-only residual-text artifact was observed when navigating between Activity pages.

Observed pattern:

- Previous Home page top text sometimes appeared as a thin residual fragment on Activity page.
- It depended on the Home page scroll position.
- Removing emoji did not eliminate it.
- Adding `page { background: ... }` did not eliminate it.
- `redirectTo` eliminated the artifact.
- Returning to `navigateTo` / `navigateBack` subsequently did not reproduce it on the preview phone.

Current decision:

> Treat this as a DevTools rendering/lifecycle artifact unless reproduced on a real device.

Do not spend more development time on it before real-device regression testing unless it reappears.

---

# 16. Security / Ownership Test Status

The following tests have been completed successfully according to the development test record:

### Test 1–3
Check-in creation / identity / ownership protections — PASS

### Test 4
Leave Activity ownership — PASS

### Test 5
Create Participant impersonation — PASS

### Test 6
Create Activity impersonation — PASS

The project also tested:

- Nonexistent activity protection in check-in page — PASS
- Nonexistent check-in handling for update — PASS
- Creator-only activity editing — PASS
- Creator-only activity deletion — PASS
- Participant leave behavior — PASS
- Expired activity cannot be joined — PASS
- Duplicate participation prevention — PASS
- Duplicate daily check-in prevention — PASS

### Important test artifact

During testing, `checkin/index.js` temporarily contained a call similar to:

```js
await this.testUpdateCheckin();
```

This was used for hard-coded security testing.

**It must be removed/commented out before uploading the release candidate.**

The test helper itself should also be removed or disabled from the release build.

---

# 17. Release Test Status

### Completed

```text
Phase 1  PASS
Phase 2  PASS
Phase 3  PASS
Phase 4  PASS
Phase 5  PASS
Phase 6  PASS
Phase 7  PASS
Phase 8  PASS
Phase 9  PASS
```

### Not yet completed

```text
Phase 10 — Multi-user final test
Phase 11 — Page navigation regression test
Phase 12 — Real-device test
```

These should be performed with the uploaded Experience/Test version.

---

# 18. Phase 10 — Multi-user Final Test

Recommended minimum real-user setup:

```text
User A = Creator
User B = Participant
User C = Participant
```

Test:

1. A creates activity
2. B joins
3. C joins
4. A sees correct participant count
5. B sees activity
6. C sees activity
7. A checks in
8. B checks in
9. C checks in
10. Each user sees only their own check-in values
11. B updates own check-in
12. B cannot modify A's check-in
13. B leaves
14. B's participant record disappears
15. B's check-ins disappear
16. Activity remains for A/C
17. A deletes activity
18. Activity/participants/check-ins are removed

The purpose is not load testing. Ten to twenty members is a small workload for this MVP.

---

# 19. Phase 11 — Navigation Regression

At minimum:

```text
Home
→ Create
→ Home
→ Join
→ Home
→ Activity A
→ Check-in
→ Activity A
→ Home
→ Activity B
→ Home
→ Activity A
```

Repeat with:

- activity with description
- activity without description
- creator activity
- participant activity
- finished activity
- activity with check-in history
- activity with no check-in history

Watch for:

- stale page data
- wrong creator/member state
- wrong activity title
- wrong check-in history
- wrong progress
- residual DevTools rendering
- incorrect loading states

---

# 20. Phase 12 — Real Device Test

Test on an actual phone before declaring v1.0.2 complete.

Minimum:

- Home scrolling
- Create activity
- Join activity
- Activity page
- Check-in
- Update check-in
- Leave activity
- Delete activity
- Long title
- Long description
- Empty description
- Finished activity
- Multiple participants
- Navigation back/forward
- Toast messages
- Buttons and loading states

The DevTools residual-rendering issue is specifically important here.

---

# 21. Current Known Documentation Drift

The repository contains older documents that no longer fully match the current code.

Before using those documents as authoritative, update them.

Known examples:

### `README.md`

Still describes older v1.0 security rules and roadmap.

### `CHANGELOG.md`

Contains older statements such as:

- placeholder OpenID
- creator management planned for v1.1
- OpenID integration planned

These are no longer correct.

### `docs/KNOWN_ISSUES.md`

Still describes:

- placeholder OpenID
- creator cannot edit/delete

These are now resolved.

### `docs/DatabaseDesign.md`

Some fields/constraints are stale:

- `openid` vs current `openId`
- duration documented as 1–30 while current create validation permits 1–100
- deletion lifecycle is outdated
- creator/participant behavior is outdated

**The current source code and this handoff document should be treated as the current implementation reference until those older documents are synchronized.**

---

# 22. Important Current Code Review Notes Before RC Upload

## A. Remove test code

Check:

```text
miniprogram/pages/checkin/index.js
```

and remove/comment out the temporary hard-coded test invocation.

## B. Update documentation

Synchronize:

```text
README.md
CHANGELOG.md
docs/KNOWN_ISSUES.md
docs/DatabaseDesign.md
```

Do not let old documentation tell future developers that OpenID/creator management is still unfinished.

## C. Consider improving error messages

Current pages sometimes show generic:

```text
加载失败
提交失败
保存失败
```

This is acceptable for the MVP, but future versions should distinguish expected business errors from system errors.

## D. `addParticipant()` is protected against identity impersonation

It is intentionally a service-level identity check.

However, the Join page remains responsible for:

- activity existence
- expiration
- duplicate participation

Keep this separation unless the business logic becomes more complex.

---

# 23. Current Git / Versioning Strategy

Recommended checkpoint:

```text
v1.0.2-rc1
```

Meaning:

> Core multi-user MVP implementation complete; awaiting real multi-user, navigation regression, and real-device validation.

Recommended Git flow:

```text
feature/openid-auth
        ↓
final MVP commit
        ↓
tag: v1.0.2-rc1
        ↓
Experience/Test version
        ↓
Phase 10
        ↓
Phase 11
        ↓
Phase 12
        ↓
fixes if needed
        ↓
v1.0.2
```

Suggested commit message:

```text
Complete v1.0.2 multi-user MVP
```

Suggested tag:

```text
v1.0.2-rc1
```

---

# 24. Recommended Next Development Sequence

Do NOT add new features before real-user testing.

### Step 1
Remove temporary test code.

### Step 2
Synchronize project documentation.

### Step 3
Commit current state.

### Step 4
Create:

```text
v1.0.2-rc1
```

### Step 5
Upload Experience/Test version.

### Step 6
Invite 2–3 real users.

### Step 7
Run Phase 10.

### Step 8
Run Phase 11.

### Step 9
Run Phase 12.

### Step 10
Fix only issues discovered by those tests.

### Step 11
Create final:

```text
v1.0.2
```

---

# 25. Future Feature Roadmap

Only after the real MVP is stable:

## v1.0.3

Potential:

- dashboard optimization
- query optimization
- batch query improvements
- usability improvements based on real users

## v1.1

Potential:

- CSV export
- sharing
- QR invitation
- statistics
- notifications
- better participant management

## v2.0

Potential:

- multiple organizations
- multiple administrators
- richer permission model
- scalable backend/cloud functions
- stronger CloudBase security rules
- activity archive/lifecycle management

---

# 26. Instructions for Future AI Developer

When starting a new chat, provide this file first.

Use the following rules:

1. Read this handoff before proposing architecture changes.
2. Treat current source code as authoritative where it differs from older documentation.
3. Preserve the Page → Service → Utils → Database architecture.
4. Do not move database operations directly into pages.
5. Do not redesign the authentication model without a concrete requirement.
6. Do not introduce third-party UI frameworks.
7. Work incrementally.
8. For code changes, clearly identify the exact file being changed.
9. Do not change unrelated files.
10. Do not introduce v1.1/v2 features into v1.0.2 unless required by a real test result.
11. Prioritize data correctness and user ownership over code elegance.
12. Before changing a tested security rule, explain the security implication.
13. Preserve the distinction between:
   - Creator
   - Participant
   - Current user OpenID
   - Check-in owner
14. When a bug is reported, reproduce/reason about the lifecycle first before redesigning navigation or architecture.
15. After a meaningful milestone, update this handoff document.

### Preferred collaboration style

```text
Understand current architecture
        ↓
Identify smallest required change
        ↓
Change one file
        ↓
Test
        ↓
Confirm result
        ↓
Move to next file/task
```

---

# 27. Current Bottom Line

The project has reached the point where additional feature development should pause.

The next objective is:

> **Prove that the existing implementation works for a small real group.**

The highest-value next work is therefore:

```text
v1.0.2-rc1
    ↓
Experience/Test version
    ↓
2–3 real users
    ↓
Multi-user test
    ↓
Navigation regression
    ↓
Real-device test
    ↓
Fix only observed problems
    ↓
v1.0.2
```

The project should remain intentionally small until real users reveal what actually needs to be built next.
