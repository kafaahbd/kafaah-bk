import express from "express";
import cors from "cors";
import joinRouter from "./api.js";

async function startServer() {
	const app = express();
	// Use environment port if available (standard for production deployments), otherwise 10000
	const PORT: number = Number(process.env.PORT) || 10000;

	// Enable CORS for the frontend domain
	app.use(cors({
		origin: process.env.FRONTEND_URL || "*", // Allow all origins by default, or restrict to FRONTEND_URL
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"]
	}));

	// Parse JSON and URL-encoded bodies
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	// API routes
	app.use("/api", joinRouter);

	// Root route for health check
	app.get("/", (req, res) => {
		res.send("API is running...");
	});

	app.listen(PORT, "0.0.0.0", () => {
		console.log(`Production API server running on port ${PORT}`);
	});
}

startServer();
