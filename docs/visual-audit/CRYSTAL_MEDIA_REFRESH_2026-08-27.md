# Crystal Media Refresh

Date: 2026-08-27. Base commit: `bf717fa`.

## Source and Output

The client supplied `hibtidtas.mp4` from their desktop. The original file
remains outside the repository and was not modified.

| Property | Source | Web derivative |
| --- | --- | --- |
| Bytes | 57,747,629 | 7,123,247 |
| Resolution | 1440 x 1440 | 512 x 512 |
| Video frames / rate | 702 / 24 fps | 702 / 24 fps |
| Video duration | 29.25 seconds | 29.25 seconds |
| Audio | AAC stereo | None |
| Codec | H.264 | Full-range H.264, all I-frames |

The source container reports 29.29 seconds because its audio track runs
slightly longer than its video. No video frames were trimmed, duplicated,
crossfaded or retimed. The original loop edit is preserved.

Source SHA-256:
`81400D000D085EDEFF1C69FD88852E54E02E783690B0F1A224C4AE23885A508A`

Derivative SHA-256:
`6692FC2FA807ED7653D544A8069DBBF966CF757463C116F7E3E54C89BC822023`

Active assets:

- `public/videos/hibrid-stone-loop-20260827.mp4`
- `public/videos/hibrid-stone-loop-20260827.webp` (22,118 bytes; first frame)

Versioned filenames avoid stale cached media. Earlier video/poster files
remain available for rollback but are not loaded by the ecosystem.

## Integration

- Existing `scale: 0.85` and `playbackRate: 0.8` remain unchanged. One full
  clip playback takes 36.56 seconds; it contains multiple stone rotations.
- Bright silhouette bounds sampled at 512px are approximately 315 x 285,
  centered at (260, 251). Offsets of -4/512 and +5/512 align the new frame.
- Hover, scroll, dragging, orbit geometry, flat dots and particles are unchanged.
- The poster comes from the new derivative, including reduced-motion mode.
- The video remains lazy-loaded near the section, not above the fold. All
  702 frames were verified as independently decodable I-frames for seeking.
- This longer file transfers more than the previous 1.65 MB clip. Only one
  video is requested. The original 58 MB file is not shipped to browsers.
- The three-loop E2E timeout now derives from real duration and playback rate.

## Loop Boundary

At 128px RGB sampling, source last-to-first MAE is 8.556 versus 1.911 for
average adjacent frames; output values are 8.682 and 2.117 respectively.
The first and last frames have a visible difference in internal reflections.
The supplied edit was intentionally not re-cut or blended. Therefore this
update does not claim mathematically identical endpoints or repair the source
seam. Playback-continuity tests check missing frames, not artistic seamlessness.

All four output corners stay at channel values <= 1 across all 702 frames.
Full-range encoding and existing Canvas screen compositing avoid a gray matte.

## Encoding

```sh
ffmpeg -i "hibtidtas.mp4" -map 0:v:0 -an -map_metadata -1 \
  -vf "scale=512:512:flags=lanczos:in_range=tv:out_range=pc,setsar=1" \
  -c:v libx264 -preset slow -crf 22 -g 1 -bf 0 \
  -pix_fmt yuvj420p -color_range pc -movflags +faststart \
  public/videos/hibrid-stone-loop-20260827.mp4

ffmpeg -i public/videos/hibrid-stone-loop-20260827.mp4 \
  -frames:v 1 -c:v libwebp -quality 90 \
  public/videos/hibrid-stone-loop-20260827.webp
```

## Verification

- `npm run test`: 98/98 passed.
- `npm run lint`: no errors or warnings.
- `npm run typecheck`: passed.
- `npx playwright test --config=playwright.ecosystem.config.ts --workers=2`:
  29 passed, 1 explicitly skipped (WebKit cannot use the Chromium CDP touch
  injection test). Native tap behavior passed in both browsers.
- Both Chromium and Windows WebKit completed three full video loops with
  no sampled blank crystal frames. Hover, bidirectional scroll, dot dragging,
  reduced motion, lazy loading and 390/768/1440px pixel/layout checks passed.
- In-app browser visual checks at 1440px and 390px showed the new source,
  unchanged playback rate, a nonblank crystal and no horizontal overflow.
- `npm run build`: passed; 66 static pages, homepage First Load JS 142 kB.
- `git diff --check`: passed. No production deployment was performed.

Real-device iOS Safari and low-power mode were not tested. This was an
ecosystem-only E2E run, not a new whole-site performance audit.
