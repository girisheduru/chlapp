#!/bin/sh
# Capacitor iOS needs full Xcode.app — Command Line Tools alone are not enough.
set -e

XCODE_DEV="/Applications/Xcode.app/Contents/Developer"

if [ ! -d "/Applications/Xcode.app" ]; then
  echo ""
  echo "  iOS sync requires full Xcode (not only Command Line Tools)."
  echo "  Install Xcode from the Mac App Store, open it once to finish setup,"
  echo "  then run:"
  echo ""
  echo "    sudo xcode-select -s ${XCODE_DEV}"
  echo ""
  exit 1
fi

CURRENT="$(xcode-select -p 2>/dev/null || true)"
if [ "$CURRENT" != "$XCODE_DEV" ]; then
  echo ""
  echo "  xcode-select points to: $CURRENT"
  echo "  CocoaPods needs the full Xcode developer directory. Run:"
  echo ""
  echo "    sudo xcode-select -s ${XCODE_DEV}"
  echo ""
  exit 1
fi

exit 0
