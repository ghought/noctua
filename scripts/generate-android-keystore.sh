#!/usr/bin/env bash
# Run this once to create the Android release signing keystore.
# Requires Java (comes bundled with Android Studio).
#
# Usage:
#   bash scripts/generate-android-keystore.sh
#
# After running:
#   1. Copy android/keystore.properties.example → android/keystore.properties
#   2. Fill in the passwords you chose below
#   3. NEVER commit keystore.properties or android/keystore/noctua-release.jks

set -e

KEYSTORE_DIR="$(dirname "$0")/../android/keystore"
KEYSTORE_PATH="$KEYSTORE_DIR/noctua-release.jks"

mkdir -p "$KEYSTORE_DIR"

if [ -f "$KEYSTORE_PATH" ]; then
  echo "⚠️  Keystore already exists at $KEYSTORE_PATH — skipping generation."
  exit 0
fi

echo "Generating Android release keystore..."
echo "You will be prompted to set a keystore password and a key password."
echo "Use the same password for both (simpler) or different ones (more secure)."
echo ""

keytool -genkeypair \
  -v \
  -keystore "$KEYSTORE_PATH" \
  -alias noctua \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=Noctua, OU=Mobile, O=Garrett Houghton, L=US, ST=US, C=US"

echo ""
echo "✓ Keystore written to $KEYSTORE_PATH"
echo ""
echo "Next steps:"
echo "  1. cp android/keystore.properties.example android/keystore.properties"
echo "  2. Edit android/keystore.properties and set your passwords"
echo "  3. Add to .gitignore (already done):"
echo "       android/keystore/"
echo "       android/keystore.properties"
