import { dataSource } from "../datasource";
import { Denomination } from "../entities/Denomination";
import { readCSV } from "./utils/csv";
import path from "path";

interface RawDenomination {
  EntityNumber: string;
  Language: string;
  TypeOfDenomination: string;
  Denomination: string;
}

async function importDenominations() {
  await dataSource.initialize();

  await dataSource.synchronize();

  const csvPath = path.join(__dirname, "csv/denomination.csv");

  // ⚡ Chargement total -> très rapide pour ce type de fichier
  const rows = await readCSV<RawDenomination>(csvPath);

  const repo = dataSource.getRepository(Denomination);

  let count = 0;

  for (const row of rows) {
    if (!row.EntityNumber) {
      console.warn("⚠️ Ligne ignorée (pas d'EntityNumber):", row);
      continue;
    }

    const denom = repo.create({
      entityNumber: row.EntityNumber,
      language: row.Language || null,
      typeOfDenomination: row.TypeOfDenomination || null,
      denomination: row.Denomination || null,
    });

    try {
      await repo
        .createQueryBuilder()
        .insert()
        .into(Denomination)
        .values(denom)
        .orIgnore()
        .execute();

      count++;
    } catch (err) {
      console.error("❌ Erreur sur la ligne :", row, err);
    }
  }

  process.exit(0);
}

importDenominations();
