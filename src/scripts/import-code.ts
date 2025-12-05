// src/scripts/import-codes-fast.ts
import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { dataSource } from "../datasource";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { Transform } from "stream";
import { from as copyFrom } from "pg-copy-streams";

// ═══════════════════════════════════════════════════════════
// Transform stream : Nettoyage + Formatage CSV
// ═══════════════════════════════════════════════════════════
function createCleanTransform(stats: { cleaned: number; skipped: number }) {
  return new Transform({
    objectMode: true,
    transform(row: any, encoding, callback) {
      // Valider Code (clé primaire)
      if (!row.Code || row.Code.trim() === "") {
        stats.skipped++;
        return callback();
      }

      // Nettoyer et formater les données
      const cleanedRow = [
        row.Code.trim(),
        row.Category || "",
        row.Language || "",
        row.Description || "",
      ];

      stats.cleaned++;

      if (stats.cleaned % 10000 === 0) {
        console.log(`  📝 ${stats.cleaned} lignes traitées...`);
      }

      // Formater en ligne CSV avec échappement
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

// ═══════════════════════════════════════════════════════════
// Import direct avec streaming
// ═══════════════════════════════════════════════════════════
async function importWithStreaming(inputPath: string) {
  console.log("🚀 Import avec streaming direct...");

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  const stats = { cleaned: 0, skipped: 0 };

  try {
    await queryRunner.query(`
      CREATE TEMP TABLE temp_code (
        code TEXT,
        category TEXT,
        language TEXT,
        description TEXT
      );
    `);

    console.log("  ✅ Table temporaire créée");

    const client = (queryRunner as any).databaseConnection;

    const copyCommand = `
      COPY temp_code(code, category, language, description)
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

    // ✅ Compter les doublons dans temp_code
    const duplicatesResult = await queryRunner.query(`
      SELECT code, COUNT(*) as count
      FROM temp_code
      GROUP BY code
      HAVING COUNT(*) > 1
      LIMIT 10;
    `);

    if (duplicatesResult.length > 0) {
      console.warn(
        `  ⚠️  ${duplicatesResult.length}+ codes en double détectés (exemples):`
      );
      duplicatesResult.forEach((dup: any) => {
        console.warn(`     - ${dup.code}: ${dup.count} occurrences`);
      });
    }

    // ✅ Compter les doublons totaux
    const totalDuplicatesResult = await queryRunner.query(`
      SELECT COUNT(*) as count
      FROM (
        SELECT code
        FROM temp_code
        GROUP BY code
        HAVING COUNT(*) > 1
      ) duplicates;
    `);
    const totalDuplicates = parseInt(totalDuplicatesResult[0].count);

    // ✅ Insérer avec DISTINCT ON pour éliminer les doublons
    // On garde la première occurrence de chaque code
    console.log("  🔄 Dédoublonnage et insertion...");

    await queryRunner.query(`
      INSERT INTO code(code, category, language, description)
      SELECT DISTINCT ON (code)
        code,
        NULLIF(category, ''),
        NULLIF(language, ''),
        NULLIF(description, '')
      FROM temp_code
      ORDER BY code
      ON CONFLICT (code) DO UPDATE SET
        category = EXCLUDED.category,
        language = EXCLUDED.language,
        description = EXCLUDED.description;
    `);

    const finalCountResult = await queryRunner.query(
      `SELECT COUNT(*) as count FROM code;`
    );
    const finalCount = parseInt(finalCountResult[0].count);

    console.log(`  ✅ ${finalCount} codes dans la base de données\n`);

    return {
      cleaned: stats.cleaned,
      skipped: stats.skipped,
      duplicates: totalDuplicates,
      final: finalCount,
    };
  } finally {
    await queryRunner.release();
  }
}

// ═══════════════════════════════════════════════════════════
// SCRIPT PRINCIPAL
// ═══════════════════════════════════════════════════════════
async function importCodesFast() {
  const startTime = Date.now();

  console.log("═══════════════════════════════════════════════════");
  console.log("🚀 Import rapide des Codes (Streaming direct)");
  console.log("═══════════════════════════════════════════════════\n");

  try {
    const inputPath = path.join(__dirname, "csv/code.csv");

    if (!fs.existsSync(inputPath)) {
      throw new Error(`❌ Fichier non trouvé: ${inputPath}`);
    }

    console.log(`📂 Fichier: ${inputPath}\n`);

    await dataSource.initialize();
    console.log("✅ Connexion à la base de données établie\n");

    const { cleaned, skipped, duplicates, final } = await importWithStreaming(
      inputPath
    );

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log("═══════════════════════════════════════════════════");
    console.log("✅ Import terminé !");
    console.log(`   ⏱️  Durée: ${duration}s`);
    console.log(`   📝 Lignes traitées: ${cleaned}`);
    console.log(`   ⚠️  Lignes ignorées: ${skipped}`);
    console.log(`   🔁 Doublons détectés: ${duplicates}`);
    console.log(`   💾 Codes en base: ${final}`);
    console.log("═══════════════════════════════════════════════════");

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erreur fatale:", error);
    await dataSource.destroy();
    process.exit(1);
  }
}

importCodesFast();
