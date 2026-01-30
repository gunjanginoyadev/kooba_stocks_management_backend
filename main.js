import express from "express";
import apiRoutes from "./lib/routes/router.js";
import { env } from "./lib/config/env.js";
import { globalErrorHandler } from "./lib/middleware/global_error_handler.js";
import { connectDB } from "./lib/config/db.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

app.use(globalErrorHandler);

connectDB();

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
