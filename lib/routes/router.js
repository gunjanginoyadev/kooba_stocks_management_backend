import express from "express";
import AuthRoutes from "./auth_routes.js";
import StocksRoutes from "./stocks_routes.js";
import StocksEntriesRoutes from "./stock_entry_routes.js";

const router = express.Router();

router.use("/auth", AuthRoutes);
router.use("/stocks", StocksRoutes);
router.use("/stockEntries", StocksEntriesRoutes);

export default router;
