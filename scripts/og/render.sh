#!/usr/bin/env bash
# Renders the social share image and the Apple touch icon into public/.
# Needs Google Chrome installed (uses its headless screenshot mode).
set -euo pipefail

cd "$(dirname "$0")/../.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

render() { # <source> <output> <width> <height>
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --virtual-time-budget=8000 --window-size="$3,$4" \
    --screenshot="$PWD/$2" "file://$PWD/$1" >/dev/null 2>&1
  echo "wrote $2"
}

render scripts/og/card.html public/og.png 1200 630
render scripts/og/touch-icon.html public/apple-touch-icon.png 180 180
