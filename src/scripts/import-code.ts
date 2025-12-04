import { dataSource } from "../datasource";
import { Code } from "../entities/Code";
import { readCSV } from "./utils/csv";
import path from "path";

interface RawCode {
  Code: string;
  Category: string;
  Language: string;
  Description: string;
}

async function importCodes() {
  await dataSource.initialize();

  await dataSource.synchronize();

  const csvPath = path.join(__dirname, "csv/codes.csv");

  // Chargement complet en mémoire (OK car fichiers codes = petits)
  const rows = await readCSV<RawCode>(csvPath);

  const repo = dataSource.getRepository(Code);

  let count = 0;

  for (const row of rows) {
    if (!row.Code) {
      console.warn("⚠️ Ligne ignorée (pas de code) :", row);
      continue;
    }

    const codeEntity = repo.create({
      code: row.Code,
      category: row.Category || null,
      language: row.Language || null,
      description: row.Description || null,
    });

    try {
      await repo
        .createQueryBuilder()
        .insert()
        .into(Code)
        .values(codeEntity)
        .orIgnore()
        .execute();

      count++;
    } catch (err) {
      console.error("❌ Erreur sur la ligne :", row, err);
    }
  }
  process.exit(0);
}

importCodes();
