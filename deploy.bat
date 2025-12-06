@echo off
echo 🚀 Starting deployment process...

REM Check if backend deployment is requested
if "%1"=="--backend" goto :backend
if "%1"=="-b" goto :backend

REM Check if full deployment is requested
if "%1"=="--full" goto :full
if "%1"=="-f" goto :full

goto :frontend

:backend
echo 🔧 Deploying backend only...
firebase deploy --only functions
exit /b %errorlevel%

:full
echo 🔧 Deploying both frontend and backend...
echo 🔥 Deploying backend to Firebase App Hosting...
firebase deploy --only functions
if %errorlevel% neq 0 (
    echo ❌ Backend deployment failed!
    echo Please check the setup-secrets.md file for configuration instructions.
    exit /b 1
)

:frontend
REM Navigate to frontend directory
cd frontend

echo 📦 Installing dependencies...
call npm install

echo 🔨 Building the application...
call npm run build

REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    REM Navigate back to root
    cd ..
    
    echo 🔥 Deploying to Firebase...
    firebase deploy --only hosting
    
    if %errorlevel% equ 0 (
        echo 🎉 Deployment successful!
        echo Your app is now live on Firebase Hosting!
        
        if "%1"=="--full" (
            echo Backend is also deployed on Firebase App Hosting!
        )
        if "%1"=="-f" (
            echo Backend is also deployed on Firebase App Hosting!
        )
    ) else (
        echo ❌ Firebase deployment failed!
        exit /b 1
    )
) else (
    echo ❌ Build failed!
    exit /b 1
)

pause 