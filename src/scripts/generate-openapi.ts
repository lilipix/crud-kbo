import { writeFileSync } from "fs";

import path from "path";
import { swaggerSpec } from "../swagger/swagger";

const outputPath = path.join(__dirname, "../../docs/openapi.json");

writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), "utf8");
