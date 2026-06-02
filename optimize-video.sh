#!/usr/bin/env bash

# optimize-video.sh - Professional video transcoder and optimizer for Coherascent Labs
# Converts high-res screen recordings (.mov) to web-optimized, highly-compatible MP4 and WebM.

set -e

# Defaults
SPEED="1.0"
MUTE="true"
RESIZE=""
WEBM="true"
FPS="30"
CRF_MP4="24"
CRF_WEBM="30"

usage() {
  echo -e "\033[1;35mCoherascent Labs Video Optimizer Utility\033[0m"
  echo "------------------------------------------------"
  echo "Converts screen recordings (.mov) to high-performance, web-compatible MP4 and WebM."
  echo ""
  echo "Usage: $0 -i input_file.mov [options]"
  echo ""
  echo "Options:"
  echo "  -i  Input video file (e.g., recording.mov) [Required]"
  echo "  -o  Base output name (without extension, e.g., my-app-clip)"
  echo "      Default: input filename + '-optimized'"
  echo "  -s  Speed multiplier (e.g., 2.0 for double speed, 1.5, 0.5 for half speed) [Default: 1.0]"
  echo "  -m  Keep audio? (pass 'false' to preserve audio; default is 'true' to strip audio for web autoplay)"
  echo "  -r  Resize height (e.g., 720 for 720p, 1080 for 1080p, keeps aspect ratio) [Default: original]"
  echo "  -f  Target frame rate (fps) [Default: 30]"
  echo "  -w  Disable WebM generation? (pass 'false' to only build MP4; default: true)"
  echo "  -h  Show this help message"
  echo ""
  echo "Example:"
  echo "  $0 -i recording.mov -s 2.0 -r 720"
  exit 1
}

# Parse command line flags
while getopts "i:o:s:m:r:f:w:h" opt; do
  case $opt in
    i) INPUT="$OPTARG" ;;
    o) OUTPUT_BASE="$OPTARG" ;;
    s) SPEED="$OPTARG" ;;
    m) MUTE="$OPTARG" ;;
    r) RESIZE="$OPTARG" ;;
    f) FPS="$OPTARG" ;;
    w) WEBM="$OPTARG" ;;
    h) usage ;;
    *) usage ;;
  esac
done

# Ensure input is provided
if [ -z "$INPUT" ]; then
  echo -e "\033[0;31mError: Input file (-i) is required.\033[0m"
  usage
fi

# Ensure input file exists
if [ ! -f "$INPUT" ]; then
  echo -e "\033[0;31mError: Input file '$INPUT' does not exist.\033[0m"
  exit 1
fi

# Determine base output name if not provided
if [ -z "$OUTPUT_BASE" ]; then
  filename=$(basename -- "$INPUT")
  filename="${filename%.*}"
  OUTPUT_BASE="${filename}-optimized"
fi

# Calculate PTS multiplier (1 / speed) for ffmpeg's setpts filter
# Using awk for robust float math across macOS/Linux
PTS_MULT=$(awk "BEGIN {print 1.0 / $SPEED}")

# Build video filter chain
V_FILTER=""
if [ -n "$RESIZE" ]; then
  # scale=-2:height forces height to RESIZE, auto-scales width, and ensures width is divisible by 2 (H.264 requirement)
  V_FILTER="scale=-2:$RESIZE"
fi

if [ "$SPEED" != "1.0" ] && [ "$SPEED" != "1" ]; then
  if [ -n "$V_FILTER" ]; then
    V_FILTER="$V_FILTER,setpts=${PTS_MULT}*PTS"
  else
    V_FILTER="setpts=${PTS_MULT}*PTS"
  fi
fi

# Build audio filters/flags
A_FLAGS=""
if [ "$MUTE" = "true" ]; then
  A_FLAGS="-an"
else
  # Keep audio
  if [ "$SPEED" != "1.0" ] && [ "$SPEED" != "1" ]; then
    # atempo must be between 0.5 and 2.0
    is_valid_atempo=$(awk "BEGIN {print ($SPEED >= 0.5 && $SPEED <= 2.0) ? 1 : 0}")
    if [ "$is_valid_atempo" -eq 1 ]; then
      A_FLAGS="-filter:a atempo=$SPEED -c:a aac -b:a 128k"
    else
      echo -e "\033[0;33mWarning: Speed $SPEED is outside standard atempo range (0.5 to 2.0).\033[0m"
      echo "Silencing audio in output for safety/compatibility."
      A_FLAGS="-an"
    fi
  else
    A_FLAGS="-c:a aac -b:a 128k"
  fi
fi

echo -e "\033[1;36mProcessing configuration:\033[0m"
echo "  - Input file:       $INPUT"
echo "  - Speed factor:     ${SPEED}x"
echo "  - Mute/Silent:      $MUTE"
echo "  - Height cap:       ${RESIZE:-original}"
echo "  - Framerate cap:    ${FPS} fps"
echo "  - Output base name: $OUTPUT_BASE"

# Construct Video filters arguments
V_ARG=""
if [ -n "$V_FILTER" ]; then
  V_ARG="-filter:v $V_FILTER"
fi

# 1. ENCODE MP4
echo -e "\n\033[1;32mEncoding web-optimized MP4...\033[0m"
MP4_OUTPUT="${OUTPUT_BASE}.mp4"

# Explanation of critical flags:
# -c:v libx264      -> Standard H.264 video codec for universal support
# -pix_fmt yuv420p  -> 8-bit YUV 4:2:0 format, absolutely required for Safari (iOS & Desktop)
# -crf 24           -> Constant Rate Factor. 24 offers superb visual quality with very small file size
# -preset slow      -> Spend extra compression effort to reduce file size further
# -movflags +faststart -> Moves metadata index to the front so the video starts playing instantly online
# -r $FPS           -> Forces a stable frame rate, preventing massive files from sped-up frames
ffmpeg -y -i "$INPUT" \
  $V_ARG \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -crf "$CRF_MP4" \
  -preset slow \
  -r "$FPS" \
  $A_FLAGS \
  -movflags +faststart \
  "$MP4_OUTPUT"

echo -e "\033[1;32m✓ Created: $MP4_OUTPUT\033[0m"

# 2. ENCODE WEBM (if enabled)
if [ "$WEBM" = "true" ]; then
  echo -e "\n\033[1;32mEncoding web-optimized WebM (VP9)...\033[0m"
  WEBM_OUTPUT="${OUTPUT_BASE}.webm"

  # WebM VP9 encoding details:
  # -c:v libvpx-vp9   -> High-performance VP9 video codec (supported by Chrome, Firefox, Edge, newer Safari)
  # -crf 30 -b:v 0    -> Recommended constant quality mode for VP9
  # -deadline good -cpu-used 2 -> Balanced speed vs quality settings
  A_WEBM_FLAGS=""
  if [ "$MUTE" = "true" ]; then
    A_WEBM_FLAGS="-an"
  else
    # Vorbis is the standard audio codec for WebM
    if [ "$SPEED" != "1.0" ] && [ "$SPEED" != "1" ]; then
      is_valid_atempo=$(awk "BEGIN {print ($SPEED >= 0.5 && $SPEED <= 2.0) ? 1 : 0}")
      if [ "$is_valid_atempo" -eq 1 ]; then
        A_WEBM_FLAGS="-filter:a atempo=$SPEED -c:a libvorbis -b:a 128k"
      else
        A_WEBM_FLAGS="-an"
      fi
    else
      A_WEBM_FLAGS="-c:a libvorbis -b:a 128k"
    fi
  fi

  ffmpeg -y -i "$INPUT" \
    $V_ARG \
    -c:v libvpx-vp9 \
    -crf "$CRF_WEBM" \
    -b:v 0 \
    -deadline good \
    -cpu-used 2 \
    -r "$FPS" \
    $A_WEBM_FLAGS \
    "$WEBM_OUTPUT"

  echo -e "\033[1;32m✓ Created: $WEBM_OUTPUT\033[0m"
fi

echo -e "\n\033[1;35mOptimization Complete!\033[0m"
echo -e "You can now embed these files in your website with high compatibility and performance."
