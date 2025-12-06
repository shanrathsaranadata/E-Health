// Quick test for prescription upload
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected"))
  .catch(err => console.error("Error:", err));

const prescriptionSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  doctorId: { type: String, required: true },
  patientId: { type: String, required: true },
  description: { type: String, required: true },
  fileUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);

async function test() {
  try {
    const prescription = new Prescription({
      appointmentId: new mongoose.Types.ObjectId(),
      doctorId: "TEST_DOC",
      patientId: "TEST_PAT",
      description: "Test prescription",
      fileUrl: "/uploads/test.pdf",
    });
    await prescription.save();
    console.log("SUCCESS: Prescription saved");
    process.exit(0);
  } catch (error) {
    console.error("FAILED:", error.message);
    process.exit(1);
  }
}

test();
