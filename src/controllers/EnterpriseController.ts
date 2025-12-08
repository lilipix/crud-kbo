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
  UpdateEstablishmentPartialSchema,
  UpdateEstablishmentSchema,
} from "../validators/establishment.validator";

const router = Router();
const service = new EnterpriseService();
const establishment = new EstablishmentService();

// ENTERPRISE

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

router.post("/", validate(CreateEnterpriseSchema), async (req, res) => {
  try {
    const result = await service.create(req.body);
    if (!result) {
      return res.status(404).json({ error: "Enterprise not found" });
    }
    return res.status(201).json(result);
  } catch (err: any) {
    if (err.message === "Enterprise already exists") {
      return res.status(409).json({ error: err.message });
    }
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Enterprise already exists (duplicate enterpriseNumber)",
      });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

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
    } catch (err: any) {
      console.error(err);
      if (err.message === "Establishment already exists") {
        return res.status(409).json({ error: err.message });
      }
      // if (err.code === "23505") {
      //   return res.status(409).json({
      //     error: "Establishment already exists (duplicate enterpriseNumber)",
      //   });
      // }
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.put(
  "/enterpriseNumber/:establishmentNumber",
  validate(UpdateEstablishmentPartialSchema),
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
