# student learning specification

## Purpose

Allow each student to resume entitled lessons, inspect protected materials and earn durable course progress by passing the final quiz.

## ADDED Requirements

### Requirement: Account overview and history

The student workspace SHALL show the student's assigned courses and one resume or start action with package, progress and access status; purchases and settings SHALL remain independently reachable.

#### Scenario: Resume available learning

- **WHEN** a student returns with a previously visited unfinished lesson that remains available
- **THEN** the course resumes that lesson, otherwise it offers an available incomplete lesson or the first available lesson.

#### Scenario: Expired course

- **WHEN** all grants for a course release have expired or were revoked
- **THEN** the record and previously earned progress remain visible while protected content cannot open.

#### Scenario: Upcoming session

- **WHEN** an applicable non-canceled session has not ended
- **THEN** the dashboard can show its schedule and course without disclosing meeting credentials in the overview.

#### Scenario: Purchase history

- **WHEN** a student visits purchases
- **THEN** the page reports orders for the member's email and distinguishes test enrollment from a paid purchase.

### Requirement: Lesson entitlement and curriculum navigation

Lesson reads and progress writes SHALL require a verified student with an active grant covering the lesson, its assigned release and any scheduling condition.

#### Scenario: Scheduled or introductory lesson

- **WHEN** a grant exists but the intake has not begun
- **THEN** an entitled introductory lesson can open once its own release permits; other lessons wait until the intake and lesson release conditions are met.

#### Scenario: Navigate among available lessons

- **WHEN** the student visits an available lesson without passing the preceding quiz
- **THEN** the lesson opens, offers an explicit next available lesson when one exists, and does not automatically navigate after viewing or grading.

#### Scenario: Current-lecture outline

- **WHEN** the player opens on desktop or the mobile curriculum drawer
- **THEN** lecture disclosures start closed. Opening the current lecture reveals its chapter links; scrolling updates the active chapter independently of progress.

### Requirement: Protected instructional media

The player SHALL request private media only after checking lesson entitlement and membership of the asset in the authorized lesson or matching recording.

#### Scenario: Media read and download

- **WHEN** the student opens an allowed ready private image, PDF, file or video
- **THEN** the response is private and uncached, returning temporary access. A download requests a fresh authorized URL when activated.

#### Scenario: Foreign asset

- **WHEN** a caller supplies a valid asset ID from another lesson without entitlement
- **THEN** the media route denies the read.

#### Scenario: Long photo lesson

- **WHEN** a student scrolls toward instructional photographs
- **THEN** image previews are prepared ahead of the viewport and can open in a zoomable, navigable viewer; loading a photo earns no progress.

#### Scenario: Reading and watching

- **WHEN** a student reads articles or tables, watches an embedded or uploaded lecture, or opens a PDF
- **THEN** the content remains usable without timer-based completion. Resume updates save location independently of earning credit.

#### Scenario: Return to an uploaded video

- **WHEN** a student returns to an uploaded video with a saved position and device preferences
- **THEN** the player restores the valid position, volume, mute state, speed and available selected caption language. The student controls when playback starts.

### Requirement: Quiz-only completion

The server SHALL grade the final quiz, record each accepted attempt once and preserve any earned completion across retries and revisions.

#### Scenario: Before and after grading

- **WHEN** the learner opens a quiz and then submits a complete answer selection for the current revision
- **THEN** initial content omits answer keys. Grading returns score, pass or fail and answer-level feedback so incorrect answers can be distinguished from correct ones.

#### Scenario: Progress calculation

- **WHEN** one of three lessons included in a student's assigned curriculum has a passing final quiz
- **THEN** the course shows approximately 33% even if another assigned lesson has a future release; all three passes give 100%.

#### Scenario: Retry after passing

- **WHEN** a student fails a later attempt or the quiz or lesson materials are revised
- **THEN** the earlier earned completion remains. Replaying a request ID cannot create an extra attempt.

#### Scenario: Legacy and interrupted clients

- **WHEN** an authorized client replays a legacy quiz submission or submits obsolete reading, attendance-related viewing or manual-reading data
- **THEN** a valid quiz is graded, while obsolete observation/manual events cannot create completion. A newer bookmark alone does not invalidate a delayed valid quiz submission.

### Requirement: Scheduled sessions

Zoom sessions SHALL expose their applicable times and calendar export to authorized students and keep participation distinct from quiz completion.

#### Scenario: Scheduled event

- **WHEN** a student opens their lesson's upcoming, live, finished, rescheduled or canceled meeting
- **THEN** the presentation reflects timing and status, displays a labeled time zone and permits the matching calendar export; a recording can appear when available.

#### Scenario: Attend or replay

- **WHEN** the student follows the Zoom link, is marked attended, or watches the recording
- **THEN** the final quiz remains the criterion for lesson completion.
