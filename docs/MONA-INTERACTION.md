# MONA interactive scene

## Experience

- Route: `/[locale]/what-we-do/ai-creative-production` (TR and EN).
- Approved yellow-jacket/lilac-monitor character is the first viewport.
- The customer-supplied 15-second performance plays as native HTML video. Desktop pointer movement selects its original left/right poses, with eased seeking. Leaving the scene or moving onto a control resumes normal playback from that frame.
- Horizontal touch dragging on the character also tracks; vertical scrolling remains native. ArrowLeft/ArrowRight and Home work when the character has keyboard focus; Escape resumes playback. Dragging does not trigger the character's tap action.
- The character is one continuous video layer. There are no cropped body/head planes, projected textures or WebGL dependencies.
- Captions remain below the character. The television's graphics are baked into the supplied clip, not replaced with a live texture.
- All 28 customer questions are preserved in both languages. This is a curated FAQ experience, not an open-ended AI chat.
- Sound starts only after an explicit sound-enabled action. Mute, stop, replay, Escape, scrolling away and tab visibility are handled.
- Motion can be paused separately from voice; manual pause also disables pointer seeking. Reduced-motion starts with the poster and disables tracking; explicit normal playback is still available. Offscreen and hidden-tab playback pauses. Video failure retains its poster and working text/audio controls.

## Assets and scope

`public/videos/mona-performance-20260907.mp4` is the browser-compatible derivative of the customer's `hf_20260907_105240_217aec7d-7375-41fd-b4f3-7d958ed992ad.mp4`. The original Downloads file is unchanged. The derivative retains 1920x1080 resolution, 24fps and the complete 15.04-second picture. It uses H.264, yuv420p, CRF 18, faststart, a six-frame GOP and no B-frames for responsive seeking. Its audio track is omitted so it does not compete with localized FAQ voice playback. `preload="none"` defers video fetching until visible playback or an explicit interaction.

`public/images/mona/mona-video-poster.webp` is its first frame. The video loops normally; the beginning/end transition is the one in the supplied source. Tracking uses the calibrated 0.875s (viewer right), 1.75s (center) and 2.75s (viewer left) poses. The complete recorded frame, including the body, holds while the pointer is stationary. This is not independent 3D rotation or vertical tracking. Previous Blender experiments are not loaded or shipped as public models.

`public/audio/mona/{tr,en}` contains 58 local MP3s and sentence-timing JSON files (opening + 28 answers, in each language). Microsoft neural voices Emel and Jenny were generated using edge-tts. No Higgsfield or ElevenLabs credits were used. The live site does not send visitor content to the speech service; it plays same-origin files. Legacy compact/easter-egg lines can use browser speech as a fallback.

To regenerate edited FAQ audio, install `edge-tts` in a Python environment and run `scripts/generate-mona-audio.py` from that environment. The script also recognizes the optional local dependency directory `tmp/mona-tts-deps`. Existing files are preserved: remove only the specific MP3 being regenerated. Commit the resulting MP3, timing JSON and `src/data/mona-audio.json` together.

## Verification

- `npm test`: look calibration, smoothing, all FAQ texts, audio files and caption integrity.
- `PLAYWRIGHT_PORT=3211 npx playwright test e2e/mona.spec.ts --workers=1`: decoded left/right video pixels, pointer/keyboard/touch tracking, play/pause and visibility, audio opt-in/lifecycle, mobile, reduced motion, no-WebGL operation and video-error fallback.
- `NEXT_DIST_DIR=.next-mona-build npm run build`: isolated production build. The environment variable avoids disturbing another running local preview; it is optional in deployment.
