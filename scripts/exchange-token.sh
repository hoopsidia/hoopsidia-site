#!/bin/bash
# Convertit un token Instagram court (1h) en token longue durée (60 jours)
# et l'écrit directement dans .env.local (META_ACCESS_TOKEN).
#
# Usage: ./scripts/exchange-token.sh <short-lived-token>
#
# Le client_secret est lu automatiquement depuis .env.local (META_APP_SECRET).
#
# Pour obtenir un token court :
#   Meta App Dashboard -> Instagram -> "API setup with Instagram login"
#   -> Generate token (sur le compte @hoopsidia connecté).
#   (Ce bouton donne souvent directement un token 60 jours : dans ce cas
#    tu peux le coller tel quel dans META_ACCESS_TOKEN sans ce script.)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env.local"

SHORT_TOKEN="${1:-}"

if [ -z "$SHORT_TOKEN" ]; then
  echo "Usage: ./scripts/exchange-token.sh <short-lived-token>"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Erreur : .env.local introuvable ($ENV_FILE)"
  exit 1
fi

read_env() {
  grep "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'"
}

APP_SECRET="$(read_env META_APP_SECRET)"

if [ -z "$APP_SECRET" ]; then
  echo "Erreur : META_APP_SECRET absent de .env.local"
  exit 1
fi

echo "Échange du token (Instagram Login, 60 jours)..."
RESPONSE=$(curl -s "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${APP_SECRET}&access_token=${SHORT_TOKEN}")

LONG_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || true)

if [ -z "$LONG_TOKEN" ]; then
  echo "Échec de l'échange. Réponse de l'API :"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

EXPIRES=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('expires_in',0))" 2>/dev/null || echo 0)

# Réécrit META_ACCESS_TOKEN dans .env.local (remplace la ligne existante)
TMP=$(mktemp)
if grep -q "^META_ACCESS_TOKEN=" "$ENV_FILE"; then
  sed "s|^META_ACCESS_TOKEN=.*|META_ACCESS_TOKEN=${LONG_TOKEN}|" "$ENV_FILE" > "$TMP"
else
  cp "$ENV_FILE" "$TMP"
  echo "META_ACCESS_TOKEN=${LONG_TOKEN}" >> "$TMP"
fi
mv "$TMP" "$ENV_FILE"

echo ""
echo "✓ META_ACCESS_TOKEN mis à jour dans .env.local"
echo "  Expire dans ~$((EXPIRES / 86400)) jours."
echo ""
echo "N'oublie pas de mettre la même valeur dans Vercel :"
echo "  Settings -> Environment Variables -> META_ACCESS_TOKEN"
echo "  (ou : vercel env add META_ACCESS_TOKEN)"
