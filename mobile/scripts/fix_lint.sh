#!/bin/bash


cd "$(dirname "$0")/.." || exit

FLUTTER_PATH="/opt/hostedtoolcache/flutter/stable-3.19.3-x64/bin/flutter"

echo "Running flutter format..."
$FLUTTER_PATH format .

echo "Running flutter analyze with auto-fix..."
$FLUTTER_PATH analyze --fix

echo "Lint fixes completed!"
