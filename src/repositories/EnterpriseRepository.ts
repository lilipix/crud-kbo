import { dataSource } from "../datasource";
import { Enterprise } from "../entities/Enterprise";

export const EnterpriseRepository = dataSource.getRepository(Enterprise);
