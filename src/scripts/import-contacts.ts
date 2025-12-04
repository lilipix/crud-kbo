import { dataSource } from "../datasource";
import { Contact } from "../entities/Contact";
import { readCSV } from "./utils/csv";
import path from "path";

interface RawContact {
  EntityNumber: string;
  EntityContact: string;
  ContactType: string;
  Value: string;
}

async function importContacts() {
  await dataSource.initialize();

  await dataSource.synchronize();

  const csvPath = path.join(__dirname, "csv/contacts.csv");

  // ⚡ Chargement total en mémoire (OK pour un fichier de taille moyenne)
  const rows = await readCSV<RawContact>(csvPath);

  const repo = dataSource.getRepository(Contact);

  let count = 0;

  for (const row of rows) {
    if (!row.EntityNumber) {
      console.warn("⚠️ Ligne ignorée (pas d'EntityNumber):", row);
      continue;
    }

    const contact = repo.create({
      entityNumber: row.EntityNumber,
      entityContact: row.EntityContact || null,
      contactType: row.ContactType || null,
      value: row.Value || null,
    });

    try {
      await repo
        .createQueryBuilder()
        .insert()
        .into(Contact)
        .values(contact)
        .orIgnore()
        .execute();

      count++;
    } catch (err) {
      console.error("❌ Erreur sur la ligne :", row, err);
    }
  }

  process.exit(0);
}

importContacts();
