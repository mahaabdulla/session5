
require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

// =========================
// Start Server
// =========================
const startServer = async () => {
  try {
    if (!MONGO_URL) {
      throw new Error("MONGO_URL is not defined");
    }

    await mongoose.connect(MONGO_URL);

    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(
        `Server is running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
// السيرفر ما يبدأ يستقبل الطلبات إلا بعد نجاح الاتصال بقاعدة البيانات