import express from "express";
import cors from "cors";
import enterpriseController from "./controllers/EnterpriseController";
import { setupSwagger } from "./swagger";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/enterprises", enterpriseController);

setupSwagger(app);

export default app;
