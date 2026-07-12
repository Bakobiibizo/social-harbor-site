#!/usr/bin/env sh
set -eu

releases_url="https://api.github.com/repos/Bakobiibizo/harbor/releases?per_page=20"
releases=$(curl -fsSL "$releases_url")
os=$(uname -s)
arch=$(uname -m)

case "$os:$arch" in
  Linux:x86_64|Linux:amd64)
    url=$(printf '%s' "$releases" | grep -Eo 'https://[^" ]+_amd64\.AppImage' | head -n1)
    destination="${HARBOR_INSTALL_DIR:-$HOME/.local/bin}/harbor"
    mkdir -p "$(dirname "$destination")"
    curl -fL "$url" -o "$destination"
    chmod +x "$destination"
    echo "Harbor installed at $destination"
    ;;
  Darwin:arm64|Darwin:aarch64)
    url=$(printf '%s' "$releases" | grep -Eo 'https://[^" ]+/Harbor_aarch64\.app\.tar\.gz' | head -n1)
    destination="${HARBOR_INSTALL_DIR:-$HOME/Applications}"
    mkdir -p "$destination"
    curl -fsSL "$url" | tar -xz -C "$destination"
    echo "Harbor installed at $destination/Harbor.app"
    ;;
  Darwin:x86_64)
    url=$(printf '%s' "$releases" | grep -Eo 'https://[^" ]+/Harbor_x64\.app\.tar\.gz' | head -n1)
    destination="${HARBOR_INSTALL_DIR:-$HOME/Applications}"
    mkdir -p "$destination"
    curl -fsSL "$url" | tar -xz -C "$destination"
    echo "Harbor installed at $destination/Harbor.app"
    ;;
  *)
    echo "Unsupported platform: $os $arch" >&2
    echo "See https://social-harbor.com/#beta for package downloads." >&2
    exit 1
    ;;
esac
