import { Router } from "express";
import { bmadService } from "../services/bmad-service.js";
import { assertBoard } from "./authz.js";

export function bmadRoutes() {
  const router = Router();
  const svc = bmadService();

  router.get("/roles", async (req, res) => {
    assertBoard(req);
    const roles = await svc.listRoles();
    res.json(roles);
  });

  router.get("/persona/:key", async (req, res) => {
    assertBoard(req);
    const key = req.params.key;
    const persona = await svc.resolvePersona(key);
    if (!persona) {
      res.status(404).json({ error: "BMad persona not found" });
      return;
    }
    res.json(persona);
  });

  return router;
}
