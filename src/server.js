import app from "./app.js";
import dotenv from "dotenv";
import { verifyEmailConnection } from "./services/email.js";

dotenv.config();

const PORT = process.env.PORT || 9000;

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Verify email connection
  if (process.env.NODE_ENV !== 'test') {
    await verifyEmailConnection();
  }
});

// --- Graceful Shutdown ---
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
