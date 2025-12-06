#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if backend deployment is requested
if [ "$1" = "--backend" ] || [ "$1" = "-b" ]; then
    echo "🔧 Deploying backend only..."
    firebase deploy --only apphosting
    exit $?
fi

# Check if full deployment is requested
if [ "$1" = "--full" ] || [ "$1" = "-f" ]; then
    echo "🔧 Deploying both frontend and backend..."
    
    # Deploy backend first
    echo "🔥 Deploying backend to Firebase App Hosting..."
    firebase deploy --only apphosting
    
    if [ $? -ne 0 ]; then
        echo "❌ Backend deployment failed!"
        echo "Please check the setup-secrets.md file for configuration instructions."
        exit 1
    fi
fi

# Navigate to frontend directory
cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Navigate back to root
    cd ..
    
    echo "🔥 Deploying to Firebase..."
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "Your app is now live on Firebase Hosting!"
        
        if [ "$1" = "--full" ] || [ "$1" = "-f" ]; then
            echo "Backend is also deployed on Firebase App Hosting!"
        fi
    else
        echo "❌ Firebase deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi 