# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by **Keep a Changelog**, and this project follows **Semantic Versioning**.

---
# v1.0.2

## Fixed

- Fixed expired activities still allowing check-in.
- Fixed "Invitation code not found" toast disappearing too quickly on physical devices.
- Fixed participant identity by replacing placeholder openId with real WeChat OpenID.

## Changed

- Introduced shared activity status utility based on endDate.
- Improved participant permission logic.

## Security

- Updated CloudBase database permissions to support OpenID-based access.

---

## [v1.0.1] - 2026-07-09

### Fixed

* Prevented duplicate activity metrics when creating an activity.
* Added validation to ensure activity metrics are unique.
* Added maximum length validation for activity metrics.
* Improved long activity description wrapping to prevent text overflow.
* Improved Join Activity validation and user feedback.
* Improved overall form validation consistency.

### Improved

* Refined user experience for activity creation and joining.
* Minor UI polish and layout improvements.
* Updated project documentation and release notes.

---

## [v1.0.0] - 2026-07-09

### Initial Release

Reading Club WeChat Mini Program MVP released.

### Features

#### Activity Management

* Create a reading challenge or habit tracking activity.
* Generate unique invitation codes.
* Automatically join the creator as the activity owner.
* Join activities using invitation codes.

#### Daily Check-in

* Submit daily check-ins.
* Update existing daily check-ins.
* Optional notes for each check-in.
* Automatic current-day calculation.

#### Dashboard

* Current streak calculation.
* Completion rate calculation.
* Total participant count.
* Recent check-in history.
* Progress visualization.

#### User Experience

* Responsive mobile-first interface.
* Empty state handling.
* Loading and submitting state management.
* Duplicate submission prevention.
* Input validation.
* Consistent UI styling.

#### Technical

* CloudBase Database integration.
* Modular service layer.
* Utility functions for dashboard calculations.
* Git version control.
* Release Candidate workflow.
* Semantic version tagging.

#### CloudBase Security Rules (v1.0)

activity
{
  "read": true,
  "write": true
}

participant
{
  "read": true,
  "write": true
}

checkin
{
  "read": true,
  "write": true
}

---

## [v1.0.0-rc1] - 2026-07-08

### Release Candidate

* Completed Sprint Day 9.
* Final testing before production release.
* Code refactoring.
* Dashboard optimization.
* UI consistency improvements.
* Documentation updates.

---

## [Unreleased]

Planned for v1.1:

* OpenID integration
* Real participant identity
* Activity sharing
* Invitation QR code
* Activity owner management
* Participant management
* Statistics enhancements
* Push notification support
