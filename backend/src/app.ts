import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.route";

const app = express();

// ✅ CORS first (frontend runs on 3000)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://spur-eta.vercel.app"
    ],
    methods: ["GET", "POST", "OPTIONS"],
  })
);

// ✅ Body parsing
app.use(express.json());

// ✅ Routes
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/chat", chatRoutes);

export default app;
