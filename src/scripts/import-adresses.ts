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

  const csvPath = path.join(__dirname, "csv/address.csv");
  const rows = await readCSV<RawAddress>(csvPath);
  const repo = dataSource.getRepository(Address);

  const BATCH_SIZE = 1000;
  let buffer: Address[] = [];

  for (const raw of rows) {
    if (!raw.EntityNumber || raw.EntityNumber.trim() === "") {
      console.warn("⚠️ Adresse ignorée (pas d'EntityNumber)", raw);
      continue;
    }

    const address = repo.create({
      entityNumber: raw.EntityNumber.trim(),
      typeOfAddress: raw.TypeOfAddress || null,
      countryFR: raw.CountryFR || null,
      zipcode: raw.Zipcode || null,
      streetFR: raw.StreetFR || null,
      houseNumber: raw.HouseNumber || null,
      box: raw.Box || null,
      dateStrikingOff: raw.DateStrikingOff || null,
    });

    buffer.push(address);

    if (buffer.length >= BATCH_SIZE) {
      await repo
        .createQueryBuilder()
        .insert()
        .into(Address)
        .values(buffer)
        .orIgnore()
        .execute();
      buffer = [];
    }
  }

  if (buffer.length > 0) {
    await repo
      .createQueryBuilder()
      .insert()
      .into(Address)
      .values(buffer)
      .orIgnore()
      .execute();
  }

  console.log("✅ Import terminé !");
  process.exit();
}

importAddresses();
