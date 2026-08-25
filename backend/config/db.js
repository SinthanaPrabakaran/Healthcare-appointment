import mongoose from "mongoose";

const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 5000,
    tlsAllowInvalidCertificates: true,
    family: 4
  };

  const primaryURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/healthcare";
  const fallbackURI = "mongodb://127.0.0.1:27017/healthcare";

  try {
    await mongoose.connect(primaryURI, options);
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.warn("⚠️ Primary MongoDB Connection (Atlas) Warning/Failed:");
    console.warn(`   ${err.message}`);
    console.warn("ℹ️  MongoDB Atlas Tip: Ensure your current IP address is whitelisted in Atlas Security -> Network Access (e.g. 0.0.0.0/0).");

    if (primaryURI !== fallbackURI) {
      console.log("🔄 Attempting automatic fallback to Local MongoDB (127.0.0.1:27017)...");
      try {
        await mongoose.connect(fallbackURI, { serverSelectionTimeoutMS: 3000 });
        console.log("✅ Local MongoDB Connected Successfully!");
      } catch (fallbackErr) {
        console.error("❌ DB Connection Failed on both Primary & Fallback MongoDB:");
        console.error(fallbackErr.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;