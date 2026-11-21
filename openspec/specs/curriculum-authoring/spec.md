# curriculum-authoring Specification

## Purpose

Enable Academy administrators to build private lessons, review materials, and assign immutable published versions to specific course packages.

## Requirements

### Requirement: Draft a curriculum

An administrator SHALL be able to seed one private draft per catalog program and edit its ordered modules, numbered lessons and materials before publication.

#### Scenario: Create from a public program

- **WHEN** an administrator selects a known program without a learning course
- **THEN** the editor creates a draft with the program title and topic outline. Empty topic lessons remain unpublished.

#### Scenario: Reorder and number lessons

- **WHEN** the editor reorders lessons or sets an explicit lecture number
- **THEN** the outline retains stable IDs and course-wide unique numbers; duplicate IDs or duplicate explicit lecture numbers are rejected.

#### Scenario: Compose a lesson

- **WHEN** an editor adds ordered text, images, video, PDFs, file links, Zoom information or a quiz
- **THEN** the draft can retain up to 300 blocks per lesson and administrators can inspect the selected material and preview the saved lesson without student progress writes.

### Requirement: Draft revision safety

Explicit draft saves and publication SHALL check the saved revision and preserve stable course and program identity.

#### Scenario: Concurrent save

- **WHEN** another administrator saved since the draft was loaded
- **THEN** the stale save returns a conflict and does not replace the newer draft.

#### Scenario: Edit an existing block

- **WHEN** material is changed or kept when saving a draft
- **THEN** an unchanged type, media attachment, recording link, text body and quiz definition retain their revision. Changing one of these gives the block a new revision.

### Requirement: Authorized media authoring

An administrator SHALL be able to obtain upload sessions and inspect ready media associated with the selected course; private learning assets SHALL use the designated private storage or signed video provider.

#### Scenario: Upload material

- **WHEN** an administrator requests an image, PDF or video upload for a course
- **THEN** an authorized upload destination is returned. The service checks readiness before exposing a signed preview, and the editor can distinguish processing and failed material.

#### Scenario: Wrong asset or public storage

- **WHEN** the selected media belongs to another course, is not ready, or the required private storage is configured publicly
- **THEN** the protected preview or applicable signing operation refuses access.

#### Scenario: Video processing event

- **WHEN** a signed Mux ready or errored event identifies a known video upload
- **THEN** the Academy checks provider state before updating its media record. An invalid signature cannot change that record.

#### Scenario: External recording

- **WHEN** an editor provides a recognized HTTPS YouTube recording
- **THEN** the editor and player can embed that recording, with a direct link fallback. Publication rejects a video block that mixes an uploaded asset and an external recording.

### Requirement: Publish an immutable curriculum

Publication SHALL include only the selected, validated lessons in a new immutable release.

#### Scenario: Selected lessons

- **WHEN** an administrator publishes a saved draft with a subset of its lesson IDs
- **THEN** the release retains their original sequence and resolved lecture numbers, omits empty modules and preserves the rest of the draft for later use.

#### Scenario: Publication fails validation

- **WHEN** a selected lesson lacks a valid single final quiz, ready course-owned media, required image alternative text or article text
- **THEN** publication fails and the incomplete lesson does not become available to students.

#### Scenario: Unusable quiz

- **WHEN** the final quiz has an invalid passing threshold, an empty question or option, a missing correct option or a missing explanation
- **THEN** the proposed lesson cannot be published.

#### Scenario: Map an offering

- **WHEN** a manager assigns an offering and package to a release, lesson IDs and duration
- **THEN** the rule must belong to that program and reference only lessons in the selected release. Known lifetime or fixed-month promises are checked. Existing grants retain their assigned release until explicitly changed.

### Requirement: Schedule a Zoom meeting

An administrator SHALL be able to schedule, reschedule or cancel a meeting for a published Zoom lesson and attach an eligible course recording.

#### Scenario: Schedule with a local clock

- **WHEN** a manager enters a Kyiv time during a daylight-saving transition
- **THEN** a nonexistent local time is rejected; a repeated local time can resolve to a specified occurrence.

#### Scenario: Update an existing meeting

- **WHEN** the administrator changes a schedule or supplies a recording
- **THEN** the update preserves course, lesson and intake identity. A recording must be a ready video from that course.
