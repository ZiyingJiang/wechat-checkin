# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by **Keep a Changelog** and uses semantic versioning where practical.

---

## [1.0.2] - 2026-08-31

### Added
- Multi-user OpenID authentication
- Creator permission control
- Activity editing
- Activity deletion
- Participant leave activity
- Participant ownership validation
- Check-in ownership validation
- Activity existence validation
- Expired activity join protection

### Fixed
- Duplicate participant protection
- Duplicate check-in protection
- Activity deletion cleanup
- Page navigation issues

### Testing
- DevTools functional testing completed
- Multi-user testing completed with three real users
- Real-device testing completed

### Known Issue
- Participant count previously showed inconsistent results in some
  existing test-data scenarios. After clearing test database data,
  the issue could not be reproduced. No workaround was added in v1.0.2.
  Monitor during real-world use and investigate in a future release
  if reproduced.

---

## [Unreleased] — v1.0.2 RC1

> Current target: first real multi-user MVP for a small group of approximately 10–20 members.

### Added

- Real WeChat OpenID identity through shared `getOpenId()` service.
- Creator ownership using `activity.creatorOpenId`.
- Creator-only activity editing.
- Creator-only activity deletion.
- Participant Leave Activity.
- Automatic deletion of a participant's own check-ins when leaving an activity.
- Participant-based Dashboard activity loading.
- Participant count calculation across activities.
- Identity and ownership protection for Activity, Participant, and Check-in operations.
- Protection against duplicate participation.
- Protection against duplicate daily check-ins.
- Protection against updating another user's check-in.
- Protection against checking in to an activity the user has not joined.

### Changed

- `openId` is now the consistent user identity field across current business collections and services.
- Activity creation stores the real creator OpenID.
- Creator is automatically added to `participants` with role `creator`.
- Activity editing is intentionally limited to `title` and `description`.
- Activity duration and check-in fields are not editable after creation.
- Join Activity now rejects activities whose `endDate` has passed.
- Leave Activity removes only the current user's participation and check-in data; the Activity remains available to other members.
- Check-in creation overwrites the stored `openId` with the verified current user's OpenID.
- Check-in update verifies both current-user identity and check-in ownership.

### Fixed

- Expired activities could previously still be joined.
- Placeholder user identity was replaced by real WeChat OpenID.
- Creator/member permission behavior was incomplete in the earlier MVP.
- Activity Dashboard previously did not fully distinguish creator/member ownership.
- Activity deletion could otherwise leave orphan participant/check-in records.
- DevTools/page lifecycle rendering behavior was investigated; no corresponding issue has been reproduced on the preview phone. Navigation remains `navigateTo` / `navigateBack`.

### Security

Service-layer checks now protect the main ownership-sensitive operations:

- current OpenID must match the supplied OpenID;
- only the creator may update/delete an Activity;
- only the owner may update a Check-in;
- only a creator or participant may create a Check-in;
- only a participant may leave an Activity;
- creator cannot leave their own Activity.

**Known limitation:** current CloudBase database rules remain permissive. Service-layer checks therefore provide application-level protection but should not yet be considered a complete server-side authorization boundary.

### Testing status

Passed:

- Phase 1–9 release test matrix
- Check-in identity/ownership tests
- Leave ownership test
- Participant impersonation test
- Activity creator impersonation test
- Nonexistent Activity / Check-in protection
- Creator-only edit/delete
- Expired Activity join protection
- Duplicate join/check-in protection

Pending after Experience/Test Version upload:

- Phase 10 — Multi-user final test
- Phase 11 — Navigation regression test
- Phase 12 — Real-device test

---

## [1.0.1] - 2026-07-09

### Fixed

- Prevented duplicate activity metrics when creating an activity.
- Added validation to ensure activity metrics are unique.
- Added maximum length validation for activity metrics.
- Improved long activity description wrapping to prevent text overflow.
- Improved Join Activity validation and user feedback.
- Improved overall form validation consistency.
- Fixed activity expiration/check-in related issues.

### Improved

- Refined user experience for activity creation and joining.
- Minor UI polish and layout improvements.
- Updated project documentation and release notes.

---

## [1.0.0] - 2026-07-09

### Initial Release

First MVP release of the Reading Club WeChat Mini Program.

### Features

- Create activity
- Generate invitation code
- Automatically add creator as participant
- Join by invitation code
- Daily check-in
- Update existing check-in
- Optional note
- Current-day calculation
- Completion rate
- Streak calculation
- Participant count
- Activity history
- Progress visualization
- Loading/submitting state management
- Duplicate submission prevention
- Form validation
- CloudBase database integration
- Modular Service / Utils architecture
- Git version control

---

## Release direction

### v1.0.2

Focus:

> Stable small-group multi-user MVP.

No major new feature development should occur before real-user testing is complete.

### v1.0.3

Potential:

- Dashboard/query optimization
- Batch query improvements
- Usability improvements based on actual user feedback

### v1.1+

Potential:

- CSV export
- Sharing / QR invitation
- Statistics
- Notifications
- Improved participant management

### v2.0+

Potential:

- Multiple organizations/groups
- Multiple administrators
- More advanced permissions
- AI-generated growth summaries
