#!/bin/bash
# Convertit un token Meta de courte durée en token longue durée (60 jours)
# Usage: ./scripts/exchange-token.sh <short-lived-token> <app-id> <app-secret>

SHORT_TOKEN=$1
APP_ID=$2
APP_SECRET=$3

if [ -z "$SHORT_TOKEN" ] || [ -z "$APP_ID" ] || [ -z "$APP_SECRET" ]; then
  echo "Usage: ./scripts/exchange-token.sh <short-lived-token> <app-id> <app-secret>"
  echo ""
  echo "1. Va sur https://developers.facebook.com/tools/explorer/"
  echo "2. Sélectionne ton app, génère un User Token avec les permissions:"
  echo "   instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement"
  echo "3. Copie le token et lance ce script"
  exit 1
fi

echo "Échange du token..."
RESPONSE=$(curl -s "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${SHORT_TOKEN}")

echo ""
echo "Réponse :"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""
echo "Copie la valeur 'access_token' dans META_ACCESS_TOKEN de ton .env.local"
echo ""
echo "Pour trouver ton Instagram User ID :"
echo "curl -s 'https://graph.facebook.com/v19.0/me/accounts?access_token=TON_TOKEN' | python3 -m json.tool"
echo "Puis :"
echo "curl -s 'https://graph.facebook.com/v19.0/PAGE_ID?fields=instagram_business_account&access_token=TON_TOKEN' | python3 -m json.tool"
