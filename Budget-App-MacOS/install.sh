#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}    Bütçem — Kurulum Başlıyor          ${NC}"
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Node.js kontrolü
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js bulunamadı!${NC}"
  echo "  → https://nodejs.org adresinden LTS sürümü indirin"
  exit 1
fi
echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "📦 Bağımlılıklar yükleniyor..."
npm install 2>&1 | tail -3

echo ""
echo "🔨 Uygulama paketleniyor..."
./node_modules/.bin/electron-forge package 2>&1 | grep -E "(Packaging|Copying|Squashing|Done|Error|error)" || true

# .app dosyasını bul
APP=$(find out -name "*.app" 2>/dev/null | head -1)

if [ -z "$APP" ]; then
  echo -e "${RED}✗ Paketleme başarısız.${NC}"
  echo ""
  echo "Doğrudan çalıştırmak için:"
  echo "  npm start"
  exit 1
fi

echo ""
echo "📋 Uygulamayı Applications klasörüne kopyalanıyor..."
rm -rf "/Applications/Bütçem.app" 2>/dev/null || true
cp -R "$APP" /Applications/ 2>/dev/null || cp -R "$APP" ~/Applications/ 2>/dev/null || true

# Gatekeeper imzasını kaldır
APP_DEST="/Applications/Bütçem.app"
[ -d "$APP_DEST" ] || APP_DEST="$HOME/Applications/Bütçem.app"

if [ -d "$APP_DEST" ]; then
  xattr -cr "$APP_DEST" 2>/dev/null || true
  xattr -d com.apple.quarantine "$APP_DEST" 2>/dev/null || true
  echo -e "${GREEN}✓ Gatekeeper kısıtlaması kaldırıldı${NC}"
fi

echo ""
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}  ✓ Kurulum tamamlandı!               ${NC}"
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Launchpad veya Applications klasöründen"
echo "  'Bütçem' uygulamasını açabilirsin."
echo ""

# Uygulamayı aç
open "$APP_DEST" 2>/dev/null || open "$APP" 2>/dev/null || true
