// src/scripts/import-activities-fast.ts
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
// Utilitaires
// ═══════════════════════════════════════════════════════════
function cleanEntityNumber(num: string): string {
  return num.trim();
}

// ═══════════════════════════════════════════════════════════
// Transform stream : Nettoyage + Formatage CSV
// ═══════════════════════════════════════════════════════════
function createCleanTransform(stats: { cleaned: number; skipped: number }) {
  return new Transform({
    objectMode: true,
    transform(row: any, encoding, callback) {
      // Valider EntityNumber
      if (!row.EntityNumber || row.EntityNumber.trim() === "") {
        stats.skipped++;
        return callback();
      }

      const entityNumber = cleanEntityNumber(row.EntityNumber);

      if (entityNumber.length > 15) {
        stats.skipped++;
        return callback();
      }

      // Nettoyer et formater les données
      const cleanedRow = [
        entityNumber,
        row.ActivityGroup || "",
        row.NaceVersion || "",
        row.NaceCode || "",
        row.Classification || "",
      ];

      stats.cleaned++;

      if (stats.cleaned % 10000 === 0) {
        console.log(`  📝 ${stats.cleaned} lignes traitées...`);
      }

      // Formater en ligne CSV avec échappement
      const line = cleanedRow
        .map((val) => {
          const str = String(val);
          // Échapper les guillemets et virgules
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
// Import direct avec streaming (sans fichier temporaire)
// ═══════════════════════════════════════════════════════════
async function importWithStreaming(inputPath: string) {
  console.log("🚀 Import avec streaming direct...");

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  const stats = { cleaned: 0, skipped: 0 };

  try {
    // ✅ Créer une table temporaire
    await queryRunner.query(`
      CREATE TEMP TABLE temp_activity (
        entity_number VARCHAR(15),
        activity_group VARCHAR,
        nace_version VARCHAR,
        nace_code VARCHAR,
        classification VARCHAR
      );
    `);

    console.log("  ✅ Table temporaire créée");

    // ✅ Obtenir le client PostgreSQL natif
    const client = (queryRunner as any).databaseConnection;

    // ✅ Créer le stream COPY
    const copyCommand = `
      COPY temp_activity(
        entity_number,
        activity_group,
        nace_version,
        nace_code,
        classification
      )
      FROM STDIN
      WITH (
        FORMAT csv,
        DELIMITER ',',
        NULL '',
        ENCODING 'UTF8'
      )
    `;

    const copyStream = client.query(copyFrom(copyCommand));

    // ✅ Pipeline : Fichier → Parser CSV → Nettoyage → COPY
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

    // ✅ Compter les lignes dans la table temporaire
    const countResult = await queryRunner.query(
      `SELECT COUNT(*) as count FROM temp_activity;`
    );
    const tempCount = parseInt(countResult[0].count);
    console.log(`  📊 ${tempCount} lignes dans la table temporaire`);

    // ✅ Créer les relations avec Enterprise
    console.log("  🔗 Création des relations avec les entreprises...");

    const insertResult = await queryRunner.query(`
      INSERT INTO activity(
        "entityNumber",
        "activityGroup",
        "naceVersion",
        "naceCode",
        classification
      )
      SELECT
        ta.entity_number,
        NULLIF(ta.activity_group, ''),
        NULLIF(ta.nace_version, ''),
        NULLIF(ta.nace_code, ''),
        NULLIF(ta.classification, '')
      FROM temp_activity ta
      INNER JOIN enterprise e ON e."enterpriseNumber" = ta.entity_number;
    `);

    console.log(`  ✅ Relations créées`);

    // ✅ Compter les orphelins (activités sans entreprise)
    const orphansResult = await queryRunner.query(`
     SELECT COUNT(*) AS count
FROM temp_activity ta
LEFT JOIN enterprise e ON e."enterpriseNumber" = ta.entity_number
WHERE e."enterpriseNumber" IS NULL;
    `);
    const orphansCount = parseInt(orphansResult[0].count);

    if (orphansCount > 0) {
      console.warn(
        `  ⚠️  ${orphansCount} activités sans entreprise associée (ignorées)`
      );
    }

    // ✅ Compter les activités dans la table finale
    const finalCountResult = await queryRunner.query(
      `SELECT COUNT(*) as count FROM activity;`
    );
    const finalCount = parseInt(finalCountResult[0].count);

    console.log(`  ✅ ${finalCount} activités dans la base de données\n`);

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

// ═══════════════════════════════════════════════════════════
// SCRIPT PRINCIPAL
// ═══════════════════════════════════════════════════════════
async function importActivitiesFast() {
  const startTime = Date.now();

  console.log("═══════════════════════════════════════════════════");
  console.log("🚀 Import rapide des Activities (Streaming direct)");
  console.log("═══════════════════════════════════════════════════\n");

  try {
    // Chemin du fichier CSV
    const inputPath = path.join(__dirname, "csv/activity.csv");

    // Vérifier que le fichier existe
    if (!fs.existsSync(inputPath)) {
      throw new Error(`❌ Fichier non trouvé: ${inputPath}`);
    }

    console.log(`📂 Fichier: ${inputPath}\n`);

    // Connexion à la base de données
    await dataSource.initialize();
    console.log("✅ Connexion à la base de données établie\n");

    // Import avec streaming direct
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
    console.log(`   💾 Activités en base: ${final}`);
    console.log("═══════════════════════════════════════════════════");

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erreur fatale:", error);
    await dataSource.destroy();
    process.exit(1);
  }
}

// Lancer l'import
importActivitiesFast();
