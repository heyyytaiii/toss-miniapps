#!/bin/bash
set -e

APP_NAME="$1"
CATEGORY="${2:-}"
DESCRIPTION="${3:-}"

if [ -z "$APP_NAME" ]; then
  echo "Usage: pnpm create-app <app-name> [category] [description]"
  echo "  app-name:    kebab-case (e.g. my-cool-app)"
  echo "  category:    앱 카테고리 (e.g. 금융, 건강, 교육)"
  echo "  description: 앱 설명"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$ROOT_DIR/apps/template"
APP_DIR="$ROOT_DIR/apps/$APP_NAME"
REGISTRY="$ROOT_DIR/registry.json"

if [ -d "$APP_DIR" ]; then
  echo "Error: apps/$APP_NAME already exists."
  exit 1
fi

# Check category duplication
if [ -n "$CATEGORY" ] && [ -f "$REGISTRY" ]; then
  if grep -q "\"$CATEGORY\"" "$REGISTRY" 2>/dev/null; then
    echo "WARNING: Category '$CATEGORY' is already used by another app!"
    echo "Used categories:"
    cat "$REGISTRY" | grep -o '"usedCategories": \[.*\]' || true
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
fi

echo "Creating app: $APP_NAME ..."

# Copy template
cp -r "$TEMPLATE_DIR" "$APP_DIR"

# Update package.json name
sed -i '' "s|@toss-miniapps/template|@toss-miniapps/$APP_NAME|g" "$APP_DIR/package.json"

# Update granite.config.ts appName and displayName
sed -i '' "s|appName: 'template'|appName: '$APP_NAME'|g" "$APP_DIR/granite.config.ts"
sed -i '' "s|displayName: '템플릿'|displayName: '$APP_NAME'|g" "$APP_DIR/granite.config.ts"

# Register in registry.json
if [ -f "$REGISTRY" ]; then
  TODAY=$(date +%Y-%m-%d)
  CAT="${CATEGORY:-미분류}"
  DESC="${DESCRIPTION:-새 미니앱}"

  # Add app entry using node for reliable JSON manipulation
  node -e "
    const fs = require('fs');
    const reg = JSON.parse(fs.readFileSync('$REGISTRY', 'utf8'));
    reg.apps.push({
      name: '$APP_NAME',
      category: '$CAT',
      description: '$DESC',
      createdAt: '$TODAY',
      iconGenerated: false
    });
    if (!reg.usedCategories.includes('$CAT')) {
      reg.usedCategories.push('$CAT');
    }
    fs.writeFileSync('$REGISTRY', JSON.stringify(reg, null, 2) + '\n');
  "
  echo "Registered in registry.json (category: $CAT)"
fi

# Install dependencies
echo "Installing dependencies..."
cd "$ROOT_DIR" && pnpm install --silent

# Run tests
echo ""
echo "Running tests..."
pnpm --filter "@toss-miniapps/$APP_NAME" test:run 2>&1 || echo "Tests failed - please check and fix."

echo ""
echo "Done! App created at apps/$APP_NAME"
echo ""
echo "Next steps:"
echo "  cd apps/$APP_NAME"
echo "  pnpm dev"
