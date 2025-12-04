import { dataSource } from "../datasource";
import { Establishment } from "../entities/Establishment";
import { readCSV } from "./utils/csv";
import path from "path";

interface RawEstablishment {
  EstablishmentNumber: string;
  StartDate: string;
  EnterpriseNumber: string;
}

async function importEstablishments() {
  await dataSource.initialize();

  await dataSource.synchronize();

  const csvPath = path.join(__dirname, "csv/establishment.csv");

  const rows = await readCSV<RawEstablishment>(csvPath);

  const repo = dataSource.getRepository(Establishment);

  let count = 0;

  for (const row of rows) {
    if (!row.EstablishmentNumber) {
      console.warn("⚠️ Ligne ignorée (pas d'EstablishmentNumber):", row);
      continue;
    }

    const establishment = repo.create({
      establishmentNumber: row.EstablishmentNumber,
      startDate: row.StartDate || null,
      enterpriseNumber: row.EnterpriseNumber,
    });

    try {
      await repo
        .createQueryBuilder()
        .insert()
        .into(Establishment)
        .values(establishment)
        .orIgnore()
        .execute();

      count++;
    } catch (err) {
      console.error("❌ Erreur sur la ligne :", row, err);
    }
  }
  process.exit(0);
}

importEstablishments();
