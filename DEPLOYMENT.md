# Firebase Deployment Guide

## Prerequisites

1. **Firebase CLI**: Install Firebase CLI globally

   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Make sure you have a Firebase project set up
   ```bash
   firebase login
   firebase init hosting
   firebase init apphosting
   ```

## Deployment Steps

### Option 1: Using the Deployment Script (Recommended)

#### For Windows:

```bash
# Deploy frontend only (default)
deploy.bat

# Deploy backend only
deploy.bat --backend

# Deploy both frontend and backend
deploy.bat --full
```

#### For Linux/Mac:

```bash
chmod +x deploy.sh

# Deploy frontend only (default)
./deploy.sh

# Deploy backend only
./deploy.sh --backend

# Deploy both frontend and backend
./deploy.sh --full
```

### Option 2: Manual Deployment

#### Frontend Deployment:

1. **Build the Frontend**:

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Firebase**:
   ```bash
   cd ..
   firebase deploy --only hosting
   ```

#### Backend Deployment:

1. **Set up environment variables** (see Environment Variables section below)

2. **Deploy backend**:
   ```bash
   firebase deploy --only apphosting
   ```

## Backend Configuration

### Environment Variables Setup

Your backend requires several environment variables. You have two options:

#### Option A: Using Google Cloud Secret Manager (Recommended for Production)

1. Follow the instructions in `setup-secrets.md`
2. Use the production configuration in `backend/apphosting.yaml`

#### Option B: Using Environment Variables (Development/Testing)

1. Edit `backend/apphosting-dev.yaml` with your actual values
2. Rename it to `apphosting.yaml` before deployment
3. **Warning**: This exposes sensitive data in your configuration file

### Required Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key
- `MONGODB_URL` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string for JWT token signing
- `AGORA_APP_ID` - Your Agora App ID for video calls
- `AGORA_APP_CERTIFICATE` - Your Agora App Certificate
- `PORT` - Server port (defaults to 5000)

## Configuration Files

### firebase.json

The Firebase configuration has been updated with:

- **Public directory**: `frontend/build` (where React builds the production files)
- **Rewrites**: All routes redirect to `index.html` for client-side routing
- **Error page**: Custom 404 page
- **App Hosting**: Backend configuration for Cloud Run

### Key Features Fixed

1. **Client-side Routing**: All routes now work properly with Firebase hosting
2. **Authentication**: Protected routes properly redirect to unauthorized page
3. **Error Handling**: Added error boundary for unexpected errors
4. **404 Handling**: Custom not found page for invalid routes
5. **Backend API**: Express.js server deployed on Cloud Run

## Troubleshooting

### Common Issues:

1. **Build Fails**:

   - Check if all dependencies are installed: `npm install`
   - Verify Node.js version compatibility
   - Check for syntax errors in your code

2. **Frontend Deployment Fails**:

   - Ensure you're logged into Firebase: `firebase login`
   - Check if you have the correct project selected: `firebase use <project-id>`
   - Verify Firebase project permissions

3. **Backend Deployment Fails**:

   - Check if environment variables are properly configured
   - Verify Google Cloud Secret Manager setup (if using secrets)
   - Check the build logs at the provided URL in the error message
   - Ensure all required dependencies are in `package.json`

4. **Routes Not Working**:

   - Ensure the `rewrites` section is in your `firebase.json`
   - Check that the build directory is correct
   - Verify that `index.html` exists in the build folder

5. **Authentication Issues**:

   - Check browser console for errors
   - Verify localStorage is working
   - Ensure token validation is working properly

6. **API Connection Issues**:
   - Verify the backend URL is correctly configured in your frontend
   - Check if CORS is properly configured
   - Ensure the backend is running and accessible

## Testing

After deployment, test the following:

1. **Public Routes**: Home, login, signup pages
2. **Protected Routes**: Dashboard pages (should redirect to unauthorized if not logged in)
3. **Invalid Routes**: Should show 404 page
4. **Authentication Flow**: Login/logout functionality
5. **Role-based Access**: Different user roles accessing appropriate pages
6. **API Endpoints**: Backend API calls should work properly
7. **Database Operations**: CRUD operations should function correctly

## Environment Variables

### Frontend Environment Variables

If you're using environment variables in the frontend:

1. Create a `.env` file in the frontend directory
2. Add it to `.gitignore`
3. Set up environment variables in Firebase hosting settings if needed

### Backend Environment Variables

For the backend, use one of the following approaches:

1. **Google Cloud Secret Manager** (Production): Follow `setup-secrets.md`
2. **Environment Variables** (Development): Edit `apphosting.yaml` directly

## Performance Optimization

- The build process optimizes your React app for production
- Static assets are served efficiently by Firebase CDN
- Client-side routing provides fast navigation
- Backend runs on Cloud Run with automatic scaling

## Security Considerations

- Use Google Cloud Secret Manager for production deployments
- Never commit sensitive credentials to version control
- Implement proper authentication and authorization
- Use HTTPS for all API communications
- Regularly update dependencies for security patches
