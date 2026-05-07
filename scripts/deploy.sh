#!/bin/bash

# WhaleWatch Deployment Script
# Run this to deploy to Vercel

echo "🚀 Deploying WhaleWatch to Vercel..."

# Check if Vercel CLI is installed
if ! command -p vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found. Please create it from .env.example"
    exit 1
fi

# Check if API keys are set
if grep -q "your_birdeye_api_key_here" .env; then
    echo "⚠️  Warning: BIRDEYE_API_KEY is not set in .env"
    echo "   The app will use mock data for demo purposes"
fi

# Build the project
echo "🔨 Building project..."
pnpm build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Add environment variables in Vercel dashboard:"
echo "   - BIRDEYE_API_KEY"
echo "   - QUICKNODE_RPC_URL"
echo "2. Test the deployed URL"
echo "3. Record your demo video"
echo "4. Submit to Superteam Earn"
echo ""
echo "Good luck! 🍀"
