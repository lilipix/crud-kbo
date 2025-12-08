import { registry } from "../swagger";
import { z } from "../../lib/zod-openapi";
import {
  EnterpriseSchema,
  CreateEnterpriseSchema,
  UpdateEnterpriseSchema,
} from "../../validators/enterprise.validator";
import {
  EstablishmentSchema,
  CreateEstablishmentSchema,
  UpdateEstablishmentSchema,
  UpdateEstablishmentPartialSchema,
} from "../../validators/establishment.validator";

// ============================================
// ENTERPRISE ROUTES
// ============================================

// GET /enterprise/number/:enterpriseNumber
registry.registerPath({
  method: "get",
  path: "/enterprise/number/{enterpriseNumber}",
  summary: "Get an enterprise by its enterpriseNumber",
  tags: ["Enterprise"],
  request: {
    params: z.object({
      enterpriseNumber: z
        .string()
        .describe("Enterprise number")
        .openapi({ example: "0201.310.929" }),
    }),
  },
  responses: {
    200: {
      description: "Enterprise found",
      content: {
        "application/json": {
          schema: EnterpriseSchema,
        },
      },
    },
    404: {
      description: "Enterprise not found",
    },
    500: {
      description: "Internal server error",
    },
  },
});

// GET /enterprise/name/:denomination
registry.registerPath({
  method: "get",
  path: "/enterprise/name/{denomination}",
  summary: "Search an enterprise by denomination",
  tags: ["Enterprise"],
  request: {
    params: z.object({
      denomination: z
        .string()
        .describe("Denomination to search")
        .openapi({ example: "google" }),
    }),
  },
  responses: {
    200: {
      description: "Enterprise found",
      content: {
        "application/json": {
          schema: EnterpriseSchema,
        },
      },
    },
    404: {
      description: "No enterprise matches this name",
    },
    500: {
      description: "Internal server error",
    },
  },
});

// POST /enterprise
registry.registerPath({
  method: "post",
  path: "/enterprise",
  summary: "Create a new enterprise",
  tags: ["Enterprise"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateEnterpriseSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Enterprise successfully created",
      content: {
        "application/json": {
          schema: EnterpriseSchema,
        },
      },
    },
    400: {
      description: "Invalid payload",
    },
    409: {
      description: "Already exists",
    },
    500: {
      description: "Internal server error",
    },
  },
});

// PUT /enterprise/:enterpriseNumber
registry.registerPath({
  method: "put",
  path: "/enterprise/{enterpriseNumber}",
  summary: "Update an existing enterprise",
  tags: ["Enterprise"],
  request: {
    params: z.object({
      enterpriseNumber: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateEnterpriseSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Enterprise updated successfully",
      content: {
        "application/json": {
          schema: EnterpriseSchema,
        },
      },
    },
    404: {
      description: "Enterprise not found",
    },
    500: {
      description: "Internal server error",
    },
  },
});

// DELETE /enterprise/:enterpriseNumber
registry.registerPath({
  method: "delete",
  path: "/enterprise/{enterpriseNumber}",
  summary: "Delete an enterprise by its number",
  tags: ["Enterprise"],
  request: {
    params: z.object({
      enterpriseNumber: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Enterprise deleted",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Enterprise not found",
    },
    500: {
      description: "Internal server error",
    },
  },
});

// ============================================
// ESTABLISHMENT ROUTES
// ============================================

// POST /enterprise/:enterpriseNumber/establishment
registry.registerPath({
  method: "post",
  path: "/enterprise/{enterpriseNumber}/establishment",
  summary: "Create a new establishment for an enterprise",
  tags: ["Establishment"],
  request: {
    params: z.object({
      enterpriseNumber: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: CreateEstablishmentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Establishment created",
      content: {
        "application/json": {
          schema: EstablishmentSchema,
        },
      },
    },
    404: {
      description: "Enterprise not found",
    },
    409: {
      description: "Already exists",
    },
    500: {
      description: "Internal server error",
    },
  },
});

// PUT /enterprise/enterpriseNumber/:establishmentNumber
registry.registerPath({
  method: "put",
  path: "/enterprise/enterpriseNumber/{establishmentNumber}",
  summary: "Update an establishment",
  tags: ["Establishment"],
  request: {
    params: z.object({
      establishmentNumber: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateEstablishmentPartialSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Establishment updated",
      content: {
        "application/json": {
          schema: EstablishmentSchema,
        },
      },
    },
    404: {
      description: "Establishment not found",
    },
    500: {
      description: "Internal server error",
    },
  },
});

// DELETE /enterprise/:enterpriseNumber/:establishmentNumber
registry.registerPath({
  method: "delete",
  path: "/enterprise/{enterpriseNumber}/{establishmentNumber}",
  summary: "Delete an establishment",
  tags: ["Establishment"],
  request: {
    params: z.object({
      enterpriseNumber: z.string(),
      establishmentNumber: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Establishment deleted",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Establishment not found",
    },
    500: {
      description: "Internal server error",
    },
  },
});
