# Setting Up Secrets for Firebase App Hosting

Before deploying your backend, you need to set up the following secrets in Google Cloud Secret Manager:

## Required Secrets

1. **openai-api-key** - Your OpenAI API key
2. **mongodb-url** - Your MongoDB connection string
3. **jwt-secret** - A secure random string for JWT token signing
4. **agora-app-id** - Your Agora App ID for video calls
5. **agora-app-certificate** - Your Agora App Certificate

## Setup Steps

### 1. Install Google Cloud CLI (if not already installed)

```bash
# Download and install from: https://cloud.google.com/sdk/docs/install
```

### 2. Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project e-health-7d458
```

### 3. Create Secrets

Replace the placeholder values with your actual credentials:

```bash
# OpenAI API Key
echo "your-openai-api-key-here" | gcloud secrets create openai-api-key --data-file=-

# MongoDB URL
echo "your-mongodb-connection-string-here" | gcloud secrets create mongodb-url --data-file=-

# JWT Secret (generate a secure random string)
echo "your-secure-jwt-secret-here" | gcloud secrets create jwt-secret --data-file=-

# Agora App ID
echo "your-agora-app-id-here" | gcloud secrets create agora-app-id --data-file=-

# Agora App Certificate
echo "your-agora-app-certificate-here" | gcloud secrets create agora-app-certificate --data-file=-
```

### 4. Grant Access to Firebase App Hosting

```bash
# Get the service account email for your Firebase project
gcloud projects get-iam-policy e-health-7d458 --flatten="bindings[].members" --format="table(bindings.role)" --filter="bindings.members:serviceAccount"

# Grant access to secrets (replace with actual service account)
gcloud secrets add-iam-policy-binding openai-api-key --member="serviceAccount:YOUR_SERVICE_ACCOUNT@e-health-7d458.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding mongodb-url --member="serviceAccount:YOUR_SERVICE_ACCOUNT@e-health-7d458.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding jwt-secret --member="serviceAccount:YOUR_SERVICE_ACCOUNT@e-health-7d458.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding agora-app-id --member="serviceAccount:YOUR_SERVICE_ACCOUNT@e-health-7d458.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding agora-app-certificate --member="serviceAccount:YOUR_SERVICE_ACCOUNT@e-health-7d458.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

## Alternative: Using Environment Variables (Not Recommended for Production)

If you prefer to use environment variables instead of secrets (not recommended for production), you can modify the `apphosting.yaml` file:

```yaml
env:
  - variable: OPENAI_API_KEY
    value: "your-openai-api-key"
    availability:
      - BUILD
      - RUNTIME
  - variable: MONGODB_URL
    value: "your-mongodb-url"
    availability:
      - BUILD
      - RUNTIME
  # ... other variables
```

## After Setting Up Secrets

Once you've set up the secrets, you can deploy your backend:

```bash
firebase deploy --only apphosting
```

## Troubleshooting

If you encounter permission issues:

1. Make sure you have the necessary IAM roles:

   - `roles/secretmanager.admin` or `roles/secretmanager.secretAccessor`
   - `roles/apphosting.developer`

2. Verify your project ID is correct:

   ```bash
   gcloud config get-value project
   ```

3. Check if secrets exist:
   ```bash
   gcloud secrets list
   ```
