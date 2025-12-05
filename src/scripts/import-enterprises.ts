import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { dataSource } from "../datasource";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { Transform, pipeline } from "stream";
import { from as copyFrom } from "pg-copy-streams";

// ═══════════════════════════════════════════════════════════
// Utilitaires
// ═══════════════════════════════════════════════════════════
function parseDate(d?: string): string | null {
  if (!d || !d.trim()) return null;
  const parts = d.split("-");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  if (!day || !month || !year) return null;
  if (isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year)))
    return null;
  return `${year}-${month}-${day}`;
}

// ═══════════════════════════════════════════════════════════
// Transform stream : Nettoyage + Formatage CSV
// ═══════════════════════════════════════════════════════════
function createCleanTransform(stats: { cleaned: number; skipped: number }) {
  return new Transform({
    objectMode: true,
    transform(row: any, encoding, callback) {
      // Valider EnterpriseNumber
      if (!row.EnterpriseNumber || row.EnterpriseNumber.trim() === "") {
        stats.skipped++;
        return callback();
      }

      const enterpriseNumber = row.EnterpriseNumber.trim();

      // Nettoyer et formater les données
      const cleanedRow = [
        enterpriseNumber,
        row.Status || "",
        row.JuridicalSituation || "",
        row.TypeOfEnterprise || "",
        row.JuridicalForm || "",
        row.JuridicalFormCAC || "",
        parseDate(row.StartDate) || "",
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
      CREATE TEMP TABLE temp_enterprise (
        enterprise_number VARCHAR(15),
        status VARCHAR,
        juridical_situation VARCHAR,
        type_of_enterprise VARCHAR,
        juridical_form VARCHAR,
        juridical_form_cac VARCHAR,
        start_date DATE
      );
    `);

    console.log("  ✅ Table temporaire créée");

    // ✅ Obtenir le client PostgreSQL natif
    const client = (queryRunner as any).databaseConnection;

    // ✅ Créer le stream COPY
    const copyCommand = `
      COPY temp_enterprise(
        enterprise_number,
        status,
        juridical_situation,
        type_of_enterprise,
        juridical_form,
        juridical_form_cac,
        start_date
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
      `SELECT COUNT(*) as count FROM temp_enterprise;`
    );
    const tempCount = parseInt(countResult[0].count);
    console.log(`  📊 ${tempCount} lignes dans la table temporaire`);

    // ✅ Insérer dans la table finale (en ignorant les doublons)
    const insertResult = await queryRunner.query(`
      INSERT INTO enterprise(
        "enterpriseNumber",
        status,
        "juridicalSituation",
        "typeOfEnterprise",
        "juridicalForm",
        "juridicalFormCAC",
        "startDate"
      )
      SELECT
        enterprise_number,
        NULLIF(status, ''),
        NULLIF(juridical_situation, ''),
        NULLIF(type_of_enterprise, ''),
        NULLIF(juridical_form, ''),
        NULLIF(juridical_form_cac, ''),
        NULLIF(start_date::text, '')::date
      FROM temp_enterprise
      ON CONFLICT ("enterpriseNumber") DO UPDATE SET
        status = EXCLUDED.status,
        "juridicalSituation" = EXCLUDED."juridicalSituation",
        "typeOfEnterprise" = EXCLUDED."typeOfEnterprise",
        "juridicalForm" = EXCLUDED."juridicalForm",
        "juridicalFormCAC" = EXCLUDED."juridicalFormCAC",
        "startDate" = EXCLUDED."startDate";
    `);

    // ✅ Compter les entreprises dans la table finale
    const finalCountResult = await queryRunner.query(
      `SELECT COUNT(*) as count FROM enterprise;`
    );
    const finalCount = parseInt(finalCountResult[0].count);

    console.log(`  ✅ ${finalCount} entreprises dans la base de données\n`);

    return {
      cleaned: stats.cleaned,
      skipped: stats.skipped,
      final: finalCount,
    };
  } finally {
    await queryRunner.release();
  }
}

// ═══════════════════════════════════════════════════════════
// SCRIPT PRINCIPAL
// ═══════════════════════════════════════════════════════════
async function importEnterprisesFast() {
  const startTime = Date.now();

  console.log("═══════════════════════════════════════════════════");
  console.log("🚀 Import rapide des Enterprises (Streaming direct)");
  console.log("═══════════════════════════════════════════════════\n");

  try {
    // Chemin du fichier CSV
    const inputPath = path.join(__dirname, "csv/enterprise.csv");

    // Vérifier que le fichier existe
    if (!fs.existsSync(inputPath)) {
      throw new Error(`❌ Fichier non trouvé: ${inputPath}`);
    }

    console.log(`📂 Fichier: ${inputPath}\n`);

    // Connexion à la base de données
    await dataSource.initialize();
    console.log("✅ Connexion à la base de données établie\n");

    // Import avec streaming direct
    const { cleaned, skipped, final } = await importWithStreaming(inputPath);

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log("═══════════════════════════════════════════════════");
    console.log("✅ Import terminé !");
    console.log(`   ⏱️  Durée: ${duration}s`);
    console.log(`   📝 Lignes traitées: ${cleaned}`);
    console.log(`   ⚠️  Lignes ignorées: ${skipped}`);
    console.log(`   💾 Entreprises en base: ${final}`);
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
importEnterprisesFast();
