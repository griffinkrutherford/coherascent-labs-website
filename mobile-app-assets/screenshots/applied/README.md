# Applied Phone Mock Screenshots

Drop real app screenshots into the paths below to replace the current in-phone mock content on `/applied/`.

The phone shell, device frame, and hardware styling stay the same. Only the screen contents are swapped.

## How It Works

- The applied page looks for the exact files listed below.
- If a file exists, it is loaded into the matching phone mock automatically.
- If a file does not exist, the current handcrafted mock UI remains visible.

## Recommended Export

- Use portrait screenshots.
- Match the current phone aspect ratio as closely as possible.
- PNG is the expected format for the current wiring.
- If you want to use a different filename or extension later, update the `data-screenshot-src` value in `applied/index.html`.

## Question Prompt Screens

Place these in `mobile-app-assets/screenshots/applied/question-prompts/`:

- `calculus-question.png`
- `history-question.png`
- `lsat-question.png`
- `sat-question.png`
- `grade-4-question.png`
- `mcat-question.png`
- `gre-question.png`
- `phd-exam-question.png`
- `algorithms-question.png`
- `act-question.png`
- `ap-bio-question.png`
- `ib-math-question.png`
- `usmle-step-2-question.png`

These map to the large phone mock inside the handwritten response carousel.

## Workflow Screens

Place these in `mobile-app-assets/screenshots/applied/workflow/`:

- `capture-camera.png`
- `process-grading.png`
- `feedback-low.png`
- `feedback-mid.png`
- `feedback-high.png`

These map to the screenshot workflow phones:

- capture camera
- processing / grading
- low-score feedback
- mid-score feedback
- high-score feedback

## Voice Screen

Place this in `mobile-app-assets/screenshots/applied/voice/`:

- `voice-upload.png`

This maps to the voice upload phone mock.
