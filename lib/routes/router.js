import express from "express";
import AuthRoutes from "./auth_routes.js";
import StocksRoutes from "./stocks_routes.js";

const router = express.Router();

router.use("/auth", AuthRoutes);
router.use("/stocks", StocksRoutes);

export default router;
