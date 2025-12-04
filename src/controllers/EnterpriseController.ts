import { Router } from "express";
import { EnterpriseService } from "../services/EnterpriseService";
import { EstablishmentService } from "../services/EstablishmentService";

const router = Router();
const service = new EnterpriseService();
const establishment = new EstablishmentService();

// ENTERPRISE

/**
 * @openapi
 * /enterprises/number/{enterpriseNumber}:
 *   get:
 *     summary: Récupère une entreprise via son enterpriseNumber
 *     tags:
 *       - Enterprises
 *     parameters:
 *       - in: path
 *         name: enterpriseNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro unique de l'entreprise (clé primaire)
 *     responses:
 *       200:
 *         description: Une entreprise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Enterprise"
 *       404:
 *         description: Entreprise introuvable
 */

router.get("/number/:enterpriseNumber", async (req, res) => {
  const enterprise = await service.findOne(req.params.enterpriseNumber);
  res.json(enterprise);
});

router.get("/name/:denomination", async (req, res) => {
  const enterprise = await service.findOneByName(req.params.denomination);
  res.json(enterprise);
});

router.post("/", async (req, res) => {
  const result = await service.create(req.body);
  res.json(result);
});

router.put("/:enterpriseNumber", async (req, res) => {
  const updated = await service.updateByEnterpriseNumber(
    req.params.enterpriseNumber,
    req.body
  );
  res.json(updated);
});

router.delete("/:enterpriseNumber", async (req, res) => {
  await service.delete(req.params.enterpriseNumber);
  res.json({ message: "Enterprise deleted." });
});

// ESTABLISHMENT
router.post("/:enterpriseNumber/establishments", async (req, res) => {
  const result = await establishment.createEstablishment(
    req.params.enterpriseNumber,
    req.body
  );
  res.json(result);
});

router.put("/establishments/:establishmentNumber", async (req, res) => {
  const result = await establishment.updateEstablishment(
    req.params.establishmentNumber,
    req.body
  );
  res.json(result);
});

export default router;
