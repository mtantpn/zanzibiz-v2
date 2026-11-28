#!/bin/bash

PWA_META='    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#22C55E">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <link rel="apple-touch-icon" href="/Zanzibiz.com-logo.png">
    <link rel="icon" type="image/png" href="/Zanzibiz.com-logo.png">
'

FILES=(
  "business/dashboard.html"
  "user/profile.html"
  "user/settings.html"
  "user/liked.html"
  "admin/dashboard.html"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."

    if ! grep -q 'rel="manifest"' "$file"; then
      sed -i '/<title>/a\
'"$PWA_META" "$file"
      echo "  ✓ Added PWA meta tags to $file"
    else
      echo "  - Already has PWA meta tags"
    fi
  fi
done

echo "Done!"
