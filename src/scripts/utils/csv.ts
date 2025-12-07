import fs from "fs";
import { parse } from "csv-parse";

export async function readCSV<T = any>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const records: T[] = [];

    fs.createReadStream(filePath)
      .pipe(
        parse({
          delimiter: ",",
          columns: true,
          trim: true,
          skip_empty_lines: true,
          relax_quotes: true,
          relax_column_count: true,
        })
      )
      .on("data", (row) => records.push(row))
      .on("end", () => resolve(records))
      .on("error", reject);
  });
}
