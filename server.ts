import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import joinRouter from "./api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  // Use environment port if available (standard for production deployments), otherwise 3000
  const PORT: number = Number(process.env.PORT) || 3000;

  // API routes
  app.use("/api", joinRouter);

  // Path to the production build folder
  const distPath = path.join(__dirname, "kafaahbd-main", "dist");
  
  // Serve static files from the dist directory
  app.use(express.static(distPath));

  // Catch-all route to handle SPA client-side routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production server running on port ${PORT}`);
  });
}

startServer();