import { dataSource } from "../datasource";
import { Activity } from "../entities/Activity";
import path from "path";
import fs from "fs";
import { parse } from "csv-parse";

interface RawActivity {
  EntityNumber: string;
  ActivityGroup: string;
  NaceVersion: string;
  NaceCode: string;
  Classification: string;
}

async function importActivities() {
  await dataSource.initialize();

  await dataSource.synchronize();

  const activityRepo = dataSource.getRepository(Activity);

  const csvPath = path.join(__dirname, "csv/activity.csv");
  const stream = fs.createReadStream(csvPath);

  const parser = parse({
    delimiter: ",",
    columns: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
    skip_empty_lines: true,
  });

  let total = 0;
  let imported = 0;

  stream.pipe(parser);

  for await (const row of parser) {
    total++;

    if (!row.EntityNumber) {
      console.warn("⚠️ Ligne ignorée (pas d'EntityNumber):", row);
      continue;
    }

    const activity = activityRepo.create({
      entityNumber: row.EntityNumber,
      activityGroup: row.ActivityGroup || null,
      naceVersion: row.NaceVersion || null,
      naceCode: row.NaceCode || null,
      classification: row.Classification || null,
    });

    try {
      await activityRepo
        .createQueryBuilder()
        .insert()
        .into(Activity)
        .values(activity)
        .orIgnore() // ignore les doublons d'id
        .execute();

      imported++;
    } catch (err) {
      console.error("❌ Erreur sur la ligne :", row, err);
    }
  }
  process.exit(0);
}

importActivities();
