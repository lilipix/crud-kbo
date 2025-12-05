import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

import { AddressSchema } from "./schemas/address.schema";
import { ActivitySchema } from "./schemas/activity.schema";
import { DenominationSchema } from "./schemas/denomination.schema";
import { ContactSchema } from "./schemas/contact.schema";
import { EstablishmentSchema } from "./schemas/establishment.schema";
import { EnterpriseSchema } from "./schemas/enterprise.schemas";

import { CreateEnterpriseSchema } from "./schemas/create-enterprise.schema";
import { UpdateEnterpriseSchema } from "./schemas/update-enterprise.schema";
import { CreateEstablishmentSchema } from "./schemas/create-establishment.shema";
import { UpdateEstablishmentSchema } from "./schemas/update-establishment.schema";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API CRUD Entreprises",
      version: "1.0.0",
      description: "Documentation Swagger automatique",
    },
    components: {
      schemas: {
        Address: AddressSchema,
        Activity: ActivitySchema,
        Denomination: DenominationSchema,
        Contact: ContactSchema,
        Establishment: EstablishmentSchema,
        Enterprise: EnterpriseSchema,

        CreateEnterpriseInput: CreateEnterpriseSchema,
        UpdateEnterpriseInput: UpdateEnterpriseSchema,

        CreateEstablishmentInput: CreateEstablishmentSchema,
        UpdateEstablishmentInput: UpdateEstablishmentSchema,
      },
    },
  },
  apis: ["./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
