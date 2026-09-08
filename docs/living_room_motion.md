# Living room animation

Requested by Jingheng on September 7, 2026: animate coffee steam and the hero record player, replace unreadable lettering with real publications, and avoid the ten featured books and songs.

The existing illustration was edited with imagegen, preserving its 1672 × 941 composition. The table now shows Bloomberg Markets and The New Yorker mastheads on original illustrated covers, without invented issue dates or article headlines. The cabinet uses Love in the Time of Cholera and Love in a Fallen City, both retained preferences in `content-direction.md` and absent from the featured ten. Small anonymous binding marks are decorative, not additional titles. The record is unlabelled and does not identify an album or song.

Assets in `public/images/`:

- `living-room-motion.webp`: edited base illustration, 1672 × 941.
- `room-vinyl.webp`: generated circular top-down vinyl with alpha, 512 × 512.
- `room-steam.webp`: generated ivory brushwork steam with alpha, 256 × 512.

WebP encoding and resizing preserve the generated artwork. Together these assets are about 142 KB. The base image is reused from the browser cache for the fixed tonearm and spindle masks.

`components/room_scene.tsx` owns decorative animation and its pause button. The hero audio remains independent and user-initiated. A single artboard applies cover cropping to every image layer; the existing hero scroll transform applies outside it. The original narrow-screen crop is preserved, so the record can be outside the mobile viewport. Effects never move away from their source objects to compensate for that crop.

The circular record rotates before the plane is compressed into the illustrated ellipse. Two faint steam layers rise and fade over 6.5 seconds. Motion pauses outside the viewport, in a hidden tab, or via the keyboard-accessible pause button. Reduced-motion and browsers without container-query units show the clean static illustration. No browser or interaction testing was performed; asset inspection and source-coordinate checks do not constitute browser QA.
