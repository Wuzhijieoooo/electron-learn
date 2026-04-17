#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="$ROOT_DIR/.dmgbuild-venv"
DMGBUILD_BIN="$VENV_DIR/bin/dmgbuild"

if [[ ! -x "$DMGBUILD_BIN" ]]; then
  echo "[build:mac] preparing local dmgbuild environment..."
  python3 -m venv "$VENV_DIR"
  "$VENV_DIR/bin/pip" install -U pip dmgbuild ds-store mac-alias
fi

npm_config_electron_mirror= \
NPM_CONFIG_ELECTRON_MIRROR= \
ELECTRON_MIRROR= \
CUSTOM_DMGBUILD_PATH="$DMGBUILD_BIN" \
electron-builder --mac
