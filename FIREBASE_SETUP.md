# Firebase Storage Setup Guide

## Issue
The prescription upload feature requires Firebase Storage to be properly configured. If you're seeing "Failed to upload prescription" errors, follow these steps.

## Steps to Fix

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `e-health-7d458`
3. Click the gear icon ⚙️ → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Save the JSON file as `firebase-service-account.json` in the `backend` folder

### 2. Update Environment Variables

Update your `backend/.env` file with the correct path:

```env
GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json"
STORAGE_BUCKET="e-health-7d458.appspot.com"
```

### 3. Enable Firebase Storage

1. In Firebase Console, go to "Storage" in the left menu
2. Click "Get Started"
3. Choose your security rules (start in test mode for development)
4. Select a location for your storage bucket

### 4. Configure Storage Rules (Optional)

For development, you can use these rules in Firebase Console → Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**Note:** For production, implement proper authentication rules.

### 5. Restart Your Backend Server

After making these changes:

```bash
cd backend
npm install firebase-admin
node server.js
```

## Alternative: Use Local Storage (Quick Fix)

If you want to quickly test without Firebase, modify `server.js`:

1. Comment out Firebase initialization
2. Use local file storage instead:

```javascript
// In server.js, replace uploadToFirebase function:
async function uploadToFirebase(file) {
  if (!file) return null;
  
  const filename = `${Date.now()}_${file.originalname}`;
  const filepath = path.join(uploadDir, filename);
  
  fs.writeFileSync(filepath, file.buffer);
  return `/uploads/${filename}`;
}
```

## Troubleshooting

### Error: "Firebase Admin Initialization Error"
- Check if `firebase-service-account.json` exists
- Verify the path in `GOOGLE_APPLICATION_CREDENTIALS`

### Error: "Error uploading file to storage"
- Ensure Firebase Storage is enabled in Firebase Console
- Check storage rules allow write access
- Verify the storage bucket name is correct

### Error: "Description is required"
- Make sure you enter a prescription description before uploading

## Testing

1. Login as a doctor
2. Go to Dashboard
3. Click "Upload" on a confirmed appointment
4. Enter a description
5. Optionally select a file
6. Click "Upload"

You should see "Prescription saved successfully!"
