#!/bin/bash

# WhaleWatch Setup Script
# Run this after cloning the repo to set up the project

echo "🐋 Setting up WhaleWatch..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Setting up environment variables..."
    cp .env.example .env
    echo "✅ Created .env file. Please add your API keys:"
    echo "   - BIRDEYE_API_KEY (get from https://docs.birdeye.so/)"
    echo "   - QUICKNODE_RPC_URL (get from https://www.quicknode.com/chains/sol)"
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next/
out/
build
dist

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Misc
.DS_Store
*.pem

# Environment variables
.env
.env*.local

# Vercel
.vercel

# IDE
.vscode
.idea
*.swp
*.swo
*~

# OS
Thumbs.db
EOF
fi

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "🔨 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: WhaleWatch project setup"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your API keys to .env file"
echo "2. Run 'pnpm dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Happy whale watching! 🐋"
