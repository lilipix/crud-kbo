import { Router } from "express";
import { EnterpriseService } from "../services/EnterpriseService";
import { EstablishmentService } from "../services/EstablishmentService";
import {
  createEnterpriseSchema,
  updateEnterpriseSchema,
} from "../validators/enterprise.schema";
import { validate } from "../middleware/validate";
import {
  createEstablishmentSchema,
  updateEstablishmentSchema,
} from "../validators/establishment.schema";

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
  try {
    const enterprise = await service.findOne(req.params.enterpriseNumber);

    if (!enterprise) {
      return res.status(404).json({
        error: "Enterprise not found",
      });
    }

    res.json(enterprise);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error while fetching enterprise",
    });
  }
});

router.get("/name/:denomination", async (req, res) => {
  try {
    const enterprise = await service.findOneByName(req.params.denomination);

    if (!enterprise) {
      return res.status(404).json({
        error: "Enterprise not found",
      });
    }

    res.json(enterprise);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error while searching enterprise by name",
    });
  }
});

router.post("/", validate(createEnterpriseSchema), async (req, res) => {
  try {
    const result = await service.create(req.body);
    if (!result) {
      return res.status(404).json({ error: "Enterprise not found" });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put(
  "/:enterpriseNumber",
  validate(updateEnterpriseSchema),
  async (req, res) => {
    try {
      const updated = await service.updateByEnterpriseNumber(
        req.params.enterpriseNumber,
        req.body
      );
      if (!updated) {
        return res.status(404).json({ error: "Enterprise not found" });
      }
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.delete("/:enterpriseNumber", async (req, res) => {
  try {
    const result = await service.delete(req.params.enterpriseNumber);

    if (result.affected === 0) {
      return res.status(404).json({
        error: "Enterprise not found",
      });
    }

    res.json({ message: "Enterprise deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error while deleting enterprise",
    });
  }
});

// ESTABLISHMENT
router.post(
  "/:enterpriseNumber/establishments",
  validate(createEstablishmentSchema),
  async (req, res) => {
    try {
      const result = await establishment.createEstablishment(
        req.params.enterpriseNumber,
        req.body
      );
      if (!result) {
        return res.status(404).json({ error: "Establishment not found" });
      }
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.put(
  "/enterpriseNumber/:establishmentNumber",
  validate(updateEstablishmentSchema),
  async (req, res) => {
    try {
      const result = await establishment.updateEstablishment(
        req.params.establishmentNumber,
        req.body
      );
      if (!result) {
        return res.status(404).json({ error: "Establishment not found" });
      }
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.delete("/:enterpriseNumber/:establishmentNumber", async (req, res) => {
  try {
    const deleted = await service.delete(req.params.establishmentNumber);

    if (deleted.affected === 0) {
      return res.status(404).json({
        error: "Establishment not found",
      });
    }

    res.json({ message: "Establishment deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error while deleting establishment",
    });
  }
});
export default router;
