#!/bin/bash

# AlphaPulse Redesign Push Script
# Run this script locally to push changes to GitHub

echo "🚀 AlphaPulse Redesign Push Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in AlphaPulse directory"
    exit 1
fi

echo "✅ Found AlphaPulse project"

# Show current status
echo ""
echo "📋 Current Git Status:"
git status --short

echo ""
echo "📊 Changes Summary:"
git diff --stat --cached

echo ""
echo "🔄 Ready to push to GitHub..."
echo "Repository: https://github.com/alphaonlines/AlphaPulse"
echo "Username: AlphaonlineS"
echo ""

# Push command (will prompt for password/token)
echo "🔐 Pushing to GitHub (you'll be prompted for password/token)..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! AlphaPulse redesign pushed to GitHub"
    echo ""
    echo "🌐 View at: https://github.com/alphaonlines/AlphaPulse"
    echo ""
    echo "📋 What was pushed:"
    echo "  • Complete color system overhaul (dark → light theme)"
    echo "  • Typography system (Playfair Display + Inter)"
    echo "  • Modern layout with responsive grid"
    echo "  • Glassmorphism effects and animations"
    echo "  • Component redesign (buttons, cards, tabs)"
    echo "  • Documentation for Phase 2 continuation"
    echo ""
    echo "🎯 Next Steps:"
    echo "  1. Visit GitHub to verify push"
    echo "  2. Continue with Phase 2 (HTML structure updates)"
    echo "  3. Add data visualization components"
    echo "  4. Test and deploy"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "  • GitHub username: AlphaonlineS"
    echo "  • Password/token is correct"
    echo "  • Internet connection is active"
    echo "  • Repository URL is correct"
fi