import { dataSource } from "../datasource";
import { Enterprise } from "../entities/Enterprise";
import { readCSV } from "./utils/csv";
import path from "path";

interface RawEnterprise {
  EnterpriseNumber: string;
  Status: string;
  JuridicalSituation: string;
  TypeOfEnterprise: string;
  JuridicalForm: string;
  JuridicalFormCAC: string;
  StartDate: string;
}

// ✅ Parseur de date dd-MM-yyyy → yyyy-MM-dd (format PostgreSQL)
function parseDate(d?: string): string | null {
  if (!d || !d.trim()) return null;

  const parts = d.split("-");
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;

  if (!day || !month || !year) return null;
  if (isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year)))
    return null;

  return `${year}-${month}-${day}`; // PostgreSQL accepte ce format
}

async function importEnterprises() {
  await dataSource.initialize();

  await dataSource.synchronize();

  const csvPath = path.join(__dirname, "csv/enterprise.csv");
  const rows = await readCSV<RawEnterprise>(csvPath);

  const repo = dataSource.getRepository(Enterprise);

  let count = 0;

  for (let row of rows) {
    if (!row.EnterpriseNumber) {
      console.warn("⚠️ Ligne ignorée (pas d'EnterpriseNumber):", row);
      continue;
    }

    const enterprise = repo.create({
      enterpriseNumber: row.EnterpriseNumber,
      status: row.Status || null,
      juridicalSituation: row.JuridicalSituation || null,
      typeOfEnterprise: row.TypeOfEnterprise || null,
      juridicalForm: row.JuridicalForm || null,
      juridicalFormCAC: row.JuridicalFormCAC || null,
      startDate: parseDate(row.StartDate),
    });

    try {
      await repo.save(enterprise);
      count++;
    } catch (err) {
      console.error("❌ Erreur sur la ligne :", row, err);
    }
  }

  process.exit(0);
}

importEnterprises();
