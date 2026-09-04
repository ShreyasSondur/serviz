#!/bin/bash
set -e

# Automatically set up JDK 17 & Android SDK environment
export JAVA_HOME="${JAVA_HOME:-$HOME/.jdk17}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

echo "============================================="
echo "  Building Serviz APK Locally"
echo "  JAVA_HOME: $JAVA_HOME"
echo "  ANDROID_HOME: $ANDROID_HOME"
echo "============================================="

npx eas build --platform android --profile preview --local --non-interactive --output=./serviz-release.apk

if [ -f "./serviz-release.apk" ]; then
  echo ""
  echo "============================================="
  echo "  BUILD SUCCESSFUL!"
  echo "  APK generated at: ./serviz-release.apk"
  ls -lh ./serviz-release.apk
  echo "============================================="
fi
