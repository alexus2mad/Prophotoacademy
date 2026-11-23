## Design
A template declares stable, page-scoped locations at real section boundaries and an end location. An authored block can record its location. Its order among siblings follows the existing authored section array. Documents without placement continue to render at their previous end location. Public HTML is assembled on the server. Empty locations have no visual effect on the public layout.

The authenticated preview renders a target at each legal boundary and between neighboring blocks. The plus opens the existing library bound to that location. Dragging starts on a dedicated handle so ordinary scrolling, text editing and photo selection continue to work. The canvas indicates the candidate target and commits one move upon drop. A direct location choice supports keyboard and single-pointer users. Escape or cancellation discards a pending gesture. Selections and moves use stable IDs, and the server validates the destination before saving or publishing.

## Release
Keep production on its current release. Validate native content parity, old unplaced blocks, multiple blocks in a single location, independent tabs, draft privacy, and published order with JavaScript disabled. Retain one staging rollback after smoke checks.
