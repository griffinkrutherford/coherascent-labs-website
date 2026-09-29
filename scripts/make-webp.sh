#!/usr/bin/env bash
#
# Generate WebP twins for the heavy PNG art that the Lune Synth landing page
# ships. The PNG originals stay on disk as the source of truth; the pages
# reference the .webp twins.
#
# Requires: cwebp (brew install webp)
#
# Usage: scripts/make-webp.sh [--force]
#
set -euo pipefail

cd "$(dirname "$0")/.."

QUALITY=82
FORCE=${1:-}

if ! command -v cwebp >/dev/null 2>&1; then
  echo "error: cwebp not found. Install it with: brew install webp" >&2
  exit 1
fi

# Directories whose PNGs are served to browsers.
DIRS=(
  "lune-synth/screenshots/applied"
  "lune-synth/lune-synth-landing-medals"
)

total_png=0
total_webp=0
converted=0
skipped=0

while IFS= read -r -d '' png; do
  webp="${png%.png}.webp"

  # Skip when an up-to-date twin already exists.
  if [ -z "$FORCE" ] && [ -f "$webp" ] && [ "$webp" -nt "$png" ]; then
    skipped=$((skipped + 1))
    continue
  fi

  cwebp -q "$QUALITY" -quiet "$png" -o "$webp"

  png_size=$(stat -f%z "$png")
  webp_size=$(stat -f%z "$webp")
  total_png=$((total_png + png_size))
  total_webp=$((total_webp + webp_size))
  converted=$((converted + 1))

  printf '%-58s %8.1f KB -> %7.1f KB  (-%.0f%%)\n' \
    "$png" \
    "$(echo "$png_size/1024" | bc -l)" \
    "$(echo "$webp_size/1024" | bc -l)" \
    "$(echo "(1-$webp_size/$png_size)*100" | bc -l)"
done < <(find "${DIRS[@]}" -name '*.png' -print0 | sort -z)

echo "---"
if [ "$converted" -gt 0 ]; then
  printf 'converted %d file(s): %.1f MB -> %.1f MB (saved %.1f MB)\n' \
    "$converted" \
    "$(echo "$total_png/1048576" | bc -l)" \
    "$(echo "$total_webp/1048576" | bc -l)" \
    "$(echo "($total_png-$total_webp)/1048576" | bc -l)"
fi
[ "$skipped" -gt 0 ] && echo "skipped $skipped up-to-date file(s)"
exit 0
