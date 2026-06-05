#!/bin/bash
# Script to generate mid-resolution screenshots using sips

set -e

echo "Generating mid-resolution phone screenshots (width: 480px)..."
PHONE_SCREENS=(
  "mobile-app-assets/screenshots/applied/text/text-input.png"
  "mobile-app-assets/screenshots/applied/voice/voice-mode.png"
  "mobile-app-assets/screenshots/screenshot-workflow/1/phone-mock.png"
  "mobile-app-assets/screenshots/screenshot-workflow/2/loading-screen.png"
)

# Add all question prompts (1.png to 13.png)
for i in {1..13}; do
  PHONE_SCREENS+=("mobile-app-assets/screenshots/applied/question-prompts/$i.png")
done

# Add all result screens
RESULT_SCREENS=("45-percent" "80-percent" "90-percent" "95-percent")
for name in "${RESULT_SCREENS[@]}"; do
  PHONE_SCREENS+=("mobile-app-assets/screenshots/applied/results/$name.png")
done

for img in "${PHONE_SCREENS[@]}"; do
  if [ -f "$img" ]; then
    out="${img%.*}-mid.png"
    echo "Resizing $img -> $out"
    sips --resampleWidth 480 "$img" --out "$out" > /dev/null
  else
    echo "Warning: File not found: $img"
  fi
done

echo "Generating mid-resolution iPad screenshots (width: 768px)..."
IPAD_SCREENS=(
  "mobile-app-assets/screenshots/applied/text/text-input-ipad.png"
  "mobile-app-assets/screenshots/applied/voice/voice-mode-ipad.png"
)

for img in "${IPAD_SCREENS[@]}"; do
  if [ -f "$img" ]; then
    out="${img%.*}-mid.png"
    echo "Resizing $img -> $out"
    sips --resampleWidth 768 "$img" --out "$out" > /dev/null
  else
    echo "Warning: File not found: $img"
  fi
done

echo "Done generating mid-resolution images!"
