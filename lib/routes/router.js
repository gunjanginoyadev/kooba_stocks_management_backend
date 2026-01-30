import express from "express";
import AuthRoutes from "./auth_routes.js";

const router = express.Router();

router.use("/auth", AuthRoutes);

export default router;
