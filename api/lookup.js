import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { number } = req.query;

  // Check if number passed
  if (!number) {
    return res.status(400).json({
      success: false,
      message: "Mobile number missing",
      developer: "@istgrehu"
    });
  }

  try {
    // Read all Excel files from /data folder
    const dataFolder = path.join(process.cwd(), "data");
    const files = fs.readdirSync(dataFolder).filter(f => f.endsWith(".xlsx"));

    for (const file of files) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(path.join(dataFolder, file));

      const sheet = workbook.worksheets[0];

      let headers = [];

      sheet.eachRow((row, index) => {
        const rowData = row.values;

        // Header row
        if (index === 1) {
          headers = rowData.slice(1);
          return;
        }

        // Mobile number is column 1
        const mobileValue = String(rowData[1] || "").trim();

        if (mobileValue === number) {
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
      });
    }

    // If no file matched the number
    return res.status(404).json({
      success: false,
      message: "Number not found in any file",
      developer: "@istgrehu"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while reading Excel files",
      error: error.message,
      developer: "@istgrehu"
    });
  }
      }
