import { Router } from "express";
import { masterTraceService } from "../services/index.js";

const router = Router();

router.get("/", async (req, res) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 1000;
  
  const logs = await masterTraceService.getLogs(offset, limit);
  res.json(logs);
});

export default router;
