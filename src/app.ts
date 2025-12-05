import express from "express";
import cors from "cors";
import enterpriseController from "./controllers/EnterpriseController";
import { setupSwagger, swaggerSpec } from "./swagger/swagger";

const app = express();

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use("/enterprise", enterpriseController);

app.get("/openapi.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

export default app;
