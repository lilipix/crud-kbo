import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { dataSource } from "../datasource";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { Transform } from "stream";
import { from as copyFrom } from "pg-copy-streams";

function cleanNumber(num: string): string {
  return num.trim();
}

function createCleanTransform(stats: { cleaned: number; skipped: number }) {
  return new Transform({
    objectMode: true,
    transform(row: any, encoding, callback) {
      if (!row.EstablishmentNumber || row.EstablishmentNumber.trim() === "") {
        stats.skipped++;
        return callback();
      }

      if (!row.EnterpriseNumber || row.EnterpriseNumber.trim() === "") {
        stats.skipped++;
        return callback();
      }

      const establishmentNumber = cleanNumber(row.EstablishmentNumber);
      const enterpriseNumber = cleanNumber(row.EnterpriseNumber);

      const cleanedRow = [
        establishmentNumber,
        row.StartDate || "",
        enterpriseNumber,
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
      CREATE TEMP TABLE temp_establishment (
        establishment_number TEXT,
        start_date TEXT,
        enterprise_number VARCHAR(15)
      );
    `);

    console.log("  ✅ Table temporaire créée");

    const client = (queryRunner as any).databaseConnection;

    const copyCommand = `
      COPY temp_establishment(establishment_number, start_date, enterprise_number)
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
      `SELECT COUNT(*) as count FROM temp_establishment;`
    );
    const tempCount = parseInt(countResult[0].count);
    console.log(`  📊 ${tempCount} lignes dans la table temporaire`);

    console.log("  🔗 Création des relations avec les entreprises...");

    await queryRunner.query(`
      INSERT INTO establishment(
  "establishmentNumber",
  "startDate",
  "enterpriseNumber"
)
SELECT
  te.establishment_number,
  NULLIF(te.start_date, ''),
  te.enterprise_number
FROM temp_establishment te
INNER JOIN enterprise e ON e."enterpriseNumber" = te.enterprise_number
ON CONFLICT ("establishmentNumber") DO UPDATE SET
  "startDate" = EXCLUDED."startDate",
  "enterpriseNumber" = EXCLUDED."enterpriseNumber";
    `);

    console.log(`  ✅ Relations créées`);

    const orphansResult = await queryRunner.query(`
      SELECT COUNT(*) AS count
FROM temp_establishment te
LEFT JOIN enterprise e ON e."enterpriseNumber" = te.enterprise_number
WHERE e."enterpriseNumber" IS NULL;

    `);
    const orphansCount = parseInt(orphansResult[0].count);

    if (orphansCount > 0) {
      console.warn(
        `  ⚠️  ${orphansCount} establishments sans entreprise associée`
      );
    }

    const finalCountResult = await queryRunner.query(
      `SELECT COUNT(*) as count FROM establishment;`
    );
    const finalCount = parseInt(finalCountResult[0].count);

    console.log(`  ✅ ${finalCount} establishments dans la base de données\n`);

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

async function importEstablishmentsFast() {
  const startTime = Date.now();

  console.log("═══════════════════════════════════════════════════");
  console.log("🚀 Import rapide des Establishments (Streaming direct)");
  console.log("═══════════════════════════════════════════════════\n");

  try {
    const inputPath = path.join(__dirname, "csv/establishment.csv");

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
    console.log(`   💾 Establishments en base: ${final}`);
    console.log("═══════════════════════════════════════════════════");

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erreur fatale:", error);
    await dataSource.destroy();
    process.exit(1);
  }
}

importEstablishmentsFast();
