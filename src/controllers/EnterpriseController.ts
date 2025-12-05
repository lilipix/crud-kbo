import { Router } from "express";
import { EnterpriseService } from "../services/EnterpriseService";
import { EstablishmentService } from "../services/EstablishmentService";

import { validate } from "../middleware/validate";
import {
  CreateEnterpriseSchema,
  UpdateEnterpriseSchema,
} from "../validators/enterprise.validator";
import {
  CreateEstablishmentSchema,
  UpdateEstablishmentSchema,
} from "../validators/establishment.validator";

const router = Router();
const service = new EnterpriseService();
const establishment = new EstablishmentService();

// ENTERPRISE

/**
 * @openapi
 * /enterprise/number/{enterpriseNumber}:
 *   get:
 *     summary: Get an enterprise by its enterpriseNumber
 *     tags:
 *       - Enterprise
 *     parameters:
 *       - in: path
 *         name: enterpriseNumber
 *         required: true
 *         schema:
 *           type: string
 *         example: "0550.479.651"
 *     responses:
 *       200:
 *         description: Enterprise found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Enterprise"
 *       404:
 *         description: Enterprise not found
 *       500:
 *         description: Internal server error
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

/**
 * @openapi
 * /enterprise/name/{denomination}:
 *   get:
 *     summary: Search an enterprise by denomination
 *     tags:
 *       - Enterprise
 *     parameters:
 *       - in: path
 *         name: denomination
 *         required: true
 *         schema:
 *           type: string
 *         example: "google"
 *     responses:
 *       200:
 *         description: Enterprise found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Enterprise"
 *       404:
 *         description: No enterprise matches this name
 *       500:
 *         description: Internal server error
 */

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

/**
 * @openapi
 * /enterprise:
 *   post:
 *     summary: Create a new enterprise
 *     tags:
 *       - Enterprise
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateEnterpriseInput"
 *     responses:
 *       201:
 *         description: Enterprise successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Enterprise"
 *       400:
 *         description: Invalid payload
 *       500:
 *         description: Internal server error
 */

router.post("/", validate(CreateEnterpriseSchema), async (req, res) => {
  try {
    const result = await service.create(req.body);
    if (!result) {
      return res.status(404).json({ error: "Enterprise not found" });
    }
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @openapi
 * /enterprise/{enterpriseNumber}:
 *   put:
 *     summary: Update an existing enterprise
 *     tags:
 *       - Enterprise
 *     parameters:
 *       - in: path
 *         name: enterpriseNumber
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateEnterpriseInput"
 *     responses:
 *       200:
 *         description: Enterprise updated successfully
 *       404:
 *         description: Enterprise not found
 *       500:
 *         description: Internal server error
 */

router.put(
  "/:enterpriseNumber",
  validate(UpdateEnterpriseSchema),
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

/**
 * @openapi
 * /enterprise/{enterpriseNumber}:
 *   delete:
 *     summary: Delete an enterprise by its number
 *     tags:
 *       - Enterprise
 *     parameters:
 *       - in: path
 *         name: enterpriseNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enterprise deleted
 *       404:
 *         description: Enterprise not found
 *       500:
 *         description: Internal server error
 */

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

/**
 * @openapi
 * /enterprise/{enterpriseNumber}/establishments:
 *   post:
 *     summary: Create a new establishment for an enterprise
 *     tags:
 *       - Establishment
 *     parameters:
 *       - in: path
 *         name: enterpriseNumber
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateEstablishmentInput"
 *     responses:
 *       201:
 *         description: Establishment created
 *       404:
 *         description: Enterprise not found
 *       500:
 *         description: Internal server error
 */

router.post(
  "/:enterpriseNumber/establishment",
  validate(CreateEstablishmentSchema),
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

/**
 * @openapi
 * /enterprise/enterpriseNumber/{establishmentNumber}:
 *   put:
 *     summary: Update an establishment
 *     tags:
 *       - Establishment
 *     parameters:
 *       - in: path
 *         name: establishmentNumber
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateEstablishmentInput"
 *     responses:
 *       200:
 *         description: Establishment updated
 *       404:
 *         description: Establishment not found
 *       500:
 *         description: Internal server error
 */

router.put(
  "/enterpriseNumber/:establishmentNumber",
  validate(UpdateEstablishmentSchema),
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

/**
 * @openapi
 * /enterprise/{enterpriseNumber}/{establishmentNumber}:
 *   delete:
 *     summary: Delete an establishment
 *     tags:
 *       - Establishment
 *     parameters:
 *       - in: path
 *         name: enterpriseNumber
 *         required: true
 *       - in: path
 *         name: establishmentNumber
 *         required: true
 *     responses:
 *       200:
 *         description: Establishment deleted
 *       404:
 *         description: Establishment not found
 *       500:
 *         description: Internal server error
 */

router.delete("/:enterpriseNumber/:establishmentNumber", async (req, res) => {
  try {
    const deleted = await establishment.delete(req.params.establishmentNumber);

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
