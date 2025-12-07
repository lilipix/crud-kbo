import swaggerUi from "swagger-ui-express";
import { Application } from "express";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

import { CodeSchema } from "../validators/code.validator";
import {
  CreateEnterpriseSchema,
  EnterpriseSchema,
  UpdateEnterpriseSchema,
} from "../validators/enterprise.validator";
import { ActivitySchema } from "../validators/activities.validator";
import { AddressSchema } from "../validators/addresses.validator";
import { ContactSchema } from "../validators/contact.validator";
import { DenominationSchema } from "../validators/denomination.validator";
import {
  CreateEstablishmentSchema,
  EstablishmentSchema,
  UpdateEstablishmentSchema,
} from "../validators/establishment.validator";

registry.register("Enterprise", EnterpriseSchema);
registry.register("CreateEnterprise", CreateEnterpriseSchema);
registry.register("UpdateEnterprise", UpdateEnterpriseSchema);
registry.register("Activity", ActivitySchema);
registry.register("Address", AddressSchema);
registry.register("Codes", CodeSchema);
registry.register("Contact", ContactSchema);
registry.register("Denomination", DenominationSchema);
registry.register("Establishment", EstablishmentSchema);
registry.register("CreateEstablishment", CreateEstablishmentSchema);
registry.register("UpdateEstablishment", UpdateEstablishmentSchema);

import "./routes/enterprise.routes.swagger";

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "KBO API",
      description: "API pour les données KBO de Belgique",
    },
    servers: [{ url: "http://localhost:3000" }],
  });
}

export function setupSwagger(app: Application): void {
  const openApiDocument = generateOpenApiDocument();

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.get("/api-docs.json", (req, res) => {
    res.json(openApiDocument);
  });
}
