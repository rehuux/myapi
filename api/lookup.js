import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({
      success: false,
      message: "Mobile number missing",
      developer: "@istgrehu"
    });
  }

  try {
    const dataFolder = path.join(process.cwd(), "data");
    const files = fs.readdirSync(dataFolder).filter(f => f.endsWith(".xlsx"));

    for (const file of files) {
      const workbook = new ExcelJS.stream.xlsx.WorkbookReader(
        path.join(dataFolder, file),
        { entries: "emit", sharedStrings: "cache", worksheets: "emit" }
      );

      let headers = [];

      for await (const worksheet of workbook) {
        for await (const row of worksheet) {
          const rowData = row.values;

          // Header row handling
          if (row.number === 1) {
            headers = rowData.slice(1);
            continue;
          }

          const mobile = String(rowData[1] || "").trim();

          if (mobile === number) {
            let result = {};

            for (let i = 1; i < rowData.length; i++) {
              result[headers[i - 1]] = rowData[i];
            }

            return res.status(200).json({
              success: true,
              from_file: file,
              data: result,
              developer: "@istgrehu"
            });
          }
        }
      }
    }

    return res.status(404).json({
      success: false,
      message: "Number not found in any file",
      developer: "@istgrehu"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server crashed while streaming XLSX",
      error: err.message,
      developer: "@istgrehu"
    });
  }
}
