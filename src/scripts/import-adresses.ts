import { dataSource } from "../datasource";
import { Address } from "../entities/Address";
import { readCSV } from "./utils/csv";
import path from "path";

interface RawAddress {
  EntityNumber: string;
  TypeOfAddress: string;
  CountryFR: string;
  Zipcode: string;
  StreetFR: string;
  HouseNumber: string;
  Box: string;
  DateStrikingOff: string;
}

async function importAddresses() {
  await dataSource.initialize();

  await dataSource.synchronize();

  const csvPath = path.join(__dirname, "csv/address.csv");

  // ⚡ Lecture 100% en mémoire → très rapide
  const rows = await readCSV<RawAddress>(csvPath);

  const repo = dataSource.getRepository(Address);

  let count = 0;

  for (const row of rows) {
    if (!row.EntityNumber) {
      console.warn("⚠️ Ligne ignorée (pas d'EntityNumber):", row);
      continue;
    }

    const address = repo.create({
      entityNumber: row.EntityNumber,
      typeOfAddress: row.TypeOfAddress || null,
      countryFR: row.CountryFR || null,
      zipcode: row.Zipcode || null,
      streetFR: row.StreetFR || null,
      houseNumber: row.HouseNumber || null,
      box: row.Box || null,
      dateStrikingOff: row.DateStrikingOff || null,
    });

    try {
      await repo
        .createQueryBuilder()
        .insert()
        .into(Address)
        .values(address)
        .orIgnore() // 🔥 évite les erreurs de doublons
        .execute();

      count++;
    } catch (err) {
      console.error("❌ Erreur sur la ligne :", row, err);
    }
  }
  process.exit(0);
}

importAddresses();
