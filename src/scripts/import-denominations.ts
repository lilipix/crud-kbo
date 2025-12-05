// src/scripts/import-denominations-fast.ts
import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { dataSource } from "../datasource";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { Transform } from "stream";
import { from as copyFrom } from "pg-copy-streams";

function cleanEntityNumber(num: string): string {
  return num.trim();
}

function createCleanTransform(stats: { cleaned: number; skipped: number }) {
  return new Transform({
    objectMode: true,
    transform(row: any, encoding, callback) {
      if (!row.EntityNumber || row.EntityNumber.trim() === "") {
        stats.skipped++;
        return callback();
      }

      const entityNumber = cleanEntityNumber(row.EntityNumber);

      if (entityNumber.length > 15) {
        stats.skipped++;
        return callback();
      }

      const cleanedRow = [
        entityNumber,
        row.Language || "",
        row.TypeOfDenomination || "",
        row.Denomination || "",
      ];

      stats.cleaned++;

      if (stats.cleaned % 10000 === 0) {
        console.log(`  📝 ${stats.cleaned} lignes traitées...`);
      }

      const line = cleanedRow
        .map((val) => {
          const str = String(val);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",");

      callback(null, line + "\n");
    },
  });
}

async function importWithStreaming(inputPath: string) {
  console.log("🚀 Import avec streaming direct...");

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  const stats = { cleaned: 0, skipped: 0 };

  try {
    await queryRunner.query(`
      CREATE TEMP TABLE temp_denomination (
        entity_number VARCHAR(15),
        language TEXT,
        type_of_denomination TEXT,
        denomination TEXT
      );
    `);

    console.log("  ✅ Table temporaire créée");

    const client = (queryRunner as any).databaseConnection;

    const copyCommand = `
      COPY temp_denomination(entity_number, language, type_of_denomination, denomination)
      FROM STDIN
      WITH (FORMAT csv, DELIMITER ',', NULL '', ENCODING 'UTF8')
    `;

    const copyStream = client.query(copyFrom(copyCommand));

    await new Promise<void>((resolve, reject) => {
      const fileStream = fs.createReadStream(inputPath);
      const parser = csvParser();
      const cleaner = createCleanTransform(stats);

      fileStream.on("error", reject);
      parser.on("error", reject);
      cleaner.on("error", reject);
      copyStream.on("error", reject);
      copyStream.on("finish", resolve);

      fileStream.pipe(parser).pipe(cleaner).pipe(copyStream);
    });

    console.log(
      `  ✅ ${stats.cleaned} lignes importées, ${stats.skipped} ignorées`
    );

    const countResult = await queryRunner.query(
      `SELECT COUNT(*) as count FROM temp_denomination;`
    );
    const tempCount = parseInt(countResult[0].count);
    console.log(`  📊 ${tempCount} lignes dans la table temporaire`);

    console.log("  🔗 Création des relations avec les entreprises...");

    await queryRunner.query(`
      INSERT INTO denomination(
  "entityNumber",
  language,
  "typeOfDenomination",
  denomination
)
SELECT
  td.entity_number,
  NULLIF(td.language, ''),
  NULLIF(td.type_of_denomination, ''),
  NULLIF(td.denomination, '')
FROM temp_denomination td
INNER JOIN enterprise e ON e."enterpriseNumber" = td.entity_number;
    `);

    console.log(`  ✅ Relations créées`);

    const orphansResult = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM denomination
      WHERE "enterpriseEnterpriseNumber" IS NULL;
    `);
    const orphansCount = parseInt(orphansResult[0].count);

    if (orphansCount > 0) {
      console.warn(
        `  ⚠️  ${orphansCount} denominations sans entreprise associée`
      );
    }

    const finalCountResult = await queryRunner.query(
      `SELECT COUNT(*) as count FROM denomination;`
    );
    const finalCount = parseInt(finalCountResult[0].count);

    console.log(`  ✅ ${finalCount} denominations dans la base de données\n`);

    return {
      cleaned: stats.cleaned,
      skipped: stats.skipped,
      orphans: orphansCount,
      final: finalCount,
    };
  } finally {
    await queryRunner.release();
  }
}

async function importDenominationsFast() {
  const startTime = Date.now();

  console.log("═══════════════════════════════════════════════════");
  console.log("🚀 Import rapide des Denominations (Streaming direct)");
  console.log("═══════════════════════════════════════════════════\n");

  try {
    const inputPath = path.join(__dirname, "csv/denomination.csv");

    if (!fs.existsSync(inputPath)) {
      throw new Error(`❌ Fichier non trouvé: ${inputPath}`);
    }

    console.log(`📂 Fichier: ${inputPath}\n`);

    await dataSource.initialize();
    console.log("✅ Connexion à la base de données établie\n");

    const { cleaned, skipped, orphans, final } = await importWithStreaming(
      inputPath
    );

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log("═══════════════════════════════════════════════════");
    console.log("✅ Import terminé !");
    console.log(`   ⏱️  Durée: ${duration}s`);
    console.log(`   📝 Lignes traitées: ${cleaned}`);
    console.log(`   ⚠️  Lignes ignorées: ${skipped}`);
    console.log(`   👻 Orphelins (sans entreprise): ${orphans}`);
    console.log(`   💾 Denominations en base: ${final}`);
    console.log("═══════════════════════════════════════════════════");

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erreur fatale:", error);
    await dataSource.destroy();
    process.exit(1);
  }
}

importDenominationsFast();
