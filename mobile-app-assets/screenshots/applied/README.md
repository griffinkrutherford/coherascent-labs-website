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

- `1.png`
- `2.png`
- `3.png`
- `4.png`
- `5.png`
- `6.png`
- `7.png`
- `8.png`
- `9.png`
- `10.png`
- `11.png`
- `12.png`
- `13.png`

These map to the large phone mock inside the handwritten response carousel.

## Workflow Screens

The first screenshot workflow card uses these files from `mobile-app-assets/screenshots/screenshot-workflow/1/`:

- `handwritten-page.png`
- `phone-mock.png`

Place the remaining workflow phone screenshots in `mobile-app-assets/screenshots/applied/workflow/`:

- `process-grading.png`
- `feedback-low.png`
- `feedback-mid.png`
- `feedback-high.png`

These map to the screenshot workflow phones:

- capture phone and handwritten page
- processing / grading
- low-score feedback
- mid-score feedback
- high-score feedback

## Voice Screen

Place this in `mobile-app-assets/screenshots/applied/voice/`:

- `voice-upload.png`

This maps to the voice upload phone mock.
