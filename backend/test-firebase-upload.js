const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Initialize Firebase Admin
try {
  const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS || "./e-health-7d458-firebase-adminsdk-fbsvc-3e7ca952b3.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.STORAGE_BUCKET || "e-health-7d458.appspot.com",
  });
  console.log("✓ Firebase Admin Initialized");
} catch (error) {
  console.error("✗ Firebase Init Error:", error.message);
  process.exit(1);
}

// Test upload function
async function testUpload() {
  try {
    const bucket = admin.storage().bucket();
    console.log("✓ Bucket accessed:", bucket.name);

    // Create test file
    const testContent = "Test prescription file - " + new Date().toISOString();
    const testFilename = `test_${Date.now()}.txt`;
    const testPath = path.join(__dirname, testFilename);
    fs.writeFileSync(testPath, testContent);
    console.log("✓ Test file created:", testFilename);

    // Upload to Firebase
    const filename = `uploads/${testFilename}`;
    await bucket.upload(testPath, {
      destination: filename,
      metadata: {
        contentType: "text/plain",
      },
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    console.log("✓ Upload successful!");
    console.log("✓ Public URL:", publicUrl);

    // Cleanup
    fs.unlinkSync(testPath);
    console.log("✓ Local file cleaned up");

    process.exit(0);
  } catch (error) {
    console.error("✗ Upload failed:", error.message);
    process.exit(1);
  }
}

testUpload();
