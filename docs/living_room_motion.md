# Living room animation

Requested by Jingheng on September 7, 2026: animate coffee steam and the hero record player, replace unreadable lettering with real publications, and avoid the ten featured books and songs.

The existing illustration was edited with imagegen, preserving its 1672 × 941 composition. The table shows Bloomberg Markets and The New Yorker mastheads on original illustrated covers, without invented issue dates or article headlines. In his follow-up, Jingheng asked to remove both cabinet book titles; those spines are now unlabelled. Small anonymous binding marks are decorative, not additional titles. The record is unlabelled and does not identify an album or song.

Assets in `public/images/`:

- `living-room-motion.webp`: edited base illustration, 1672 × 941.
- `room-vinyl.webp`: generated circular top-down vinyl with alpha, 512 × 512.
- `room-steam.webp`: generated ivory brushwork steam with alpha, 256 × 512.

WebP encoding and resizing preserve the generated artwork. The hero assets total about 132 KB. The base image is reused from the browser cache for the fixed tonearm and spindle masks. In the latest edit, the two left wall frames become an untitled abstract cinema print and a decorative Manhattan map; the right painting retains its composition. Coffee and record positions remain registered, with slight imagegen rendering variation outside the edited frames.

`components/room_scene.tsx` owns decorative animation and its pause button. The hero audio remains independent and user-initiated. A single artboard applies cover cropping to every image layer; the existing hero scroll transform applies outside it. The original narrow-screen crop is preserved, so the record can be outside the mobile viewport. Effects never move away from their source objects to compensate for that crop.

The circular record rotates before the plane is compressed into the illustrated ellipse. Following Jingheng's request for stronger motion, rotation takes 4 seconds and two steam layers rise and fade over 5.5 seconds with peak opacity 0.46. Motion pauses outside the viewport, in a hidden tab, or via the keyboard-accessible pause button. Reduced-motion and browsers without container-query units show the clean static illustration. No browser or interaction testing was performed; asset inspection and source-coordinate checks do not constitute browser QA.

## Bloomberg work desk

Jingheng's follow-up screenshot identified the closing desk illustration. `writing-terminal.webp` adds a dual-screen Bloomberg-style terminal and its recognizable colored keyboard to that existing sunny desk, keeping the walnut furniture, lamp, chair and trees. The asset was edited with imagegen, then updated using Jingheng’s three supplied hardware photographs. Silver articulated support arms have visible joints below the two thin monitors. The latest correction groups both mounts in the center and extends them outward to each display, while reducing the bezels. A small brick Statue of Liberty and generic Duke basketball figure sit beside the books. The low-profile black keyboard keeps Bloomberg’s green, yellow, cyan and red function clusters. The front-facing reference informed the screen density and colors; its round pedestal was not copied. The original warm illustrated scene remains intact. It is an original illustration; the small screen marks are decorative and do not represent current quotes, news, account data or a connected service.

`components/terminal_scene.tsx` reuses the same base image in two small masked details: the left chart at source rectangle (487,323,137,79), and the right screen's lower table at (661,402,130,50). A 12-second chart sweep and a staggered 7.5-second row highlight remain inside their perspective clips. The static image is complete without either effect. Both scenes use the shared visibility/pause lifecycle in `components/scene_motion.tsx`, with independent pause controls. Accessible controls remain outside decorative hidden subtrees.

The desk uses a shared 42% horizontal/vertical cover focal point. At widths of 2000px and above, its height grows to at least 600px and 24vw so the monitor tops and foreground keyboard remain visible. Arithmetic source-crop checks at widths 320,375,1280,1440,1920,2560 and3840 confirmed the entire terminal/keyboard bounds (378,278)–(977,605) stay inside the crop. These are geometry checks, not rendered browser tests. The desk artwork is 1672 × 941 and approximately 105 KB.
