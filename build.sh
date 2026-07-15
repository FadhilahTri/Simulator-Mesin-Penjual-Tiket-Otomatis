#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "====================="
echo "Building Frontend..."
echo "====================="
cd frontend
npm install
npm run build
cd ..

echo "====================="
echo "Installing Backend..."
echo "====================="
cd backend
pip install -r requirements.txt
cd ..

echo "Build complete!"
