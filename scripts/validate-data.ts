import path from "node:path";
import process from "node:process";
import { readFile, stat } from "node:fs/promises";
import Ajv2020, { type ErrorObject } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

interface ValidationTarget {
  name: string;
  schema: string;
  dataFile: string;
  required: boolean;
}

const REQUIRED_TARGETS: ValidationTarget[] = [
  { name: "National", schema: "national.schema.json", dataFile: "national.json", required: true },
  { name: "Subnational", schema: "subnational.schema.json", dataFile: "subnational.json", required: true },
  { name: "Time Series", schema: "timeseries.schema.json", dataFile: "timeseries.json", required: true },
  { name: "Economic", schema: "economic.schema.json", dataFile: "economic.json", required: true },
  { name: "Narrative", schema: "narrative.schema.json", dataFile: "narrative.json", required: true },
  { name: "Spatial", schema: "spatial.schema.json", dataFile: "spatial.json", required: true },
];

const OPTIONAL_TARGETS: ValidationTarget[] = [
  {
    name: "Ecosystem Services",
    schema: "ecosystemServices.schema.json",
    dataFile: "ecosystemServices.json",
    required: false,
  },
  {
    name: "Natural Capital",
    schema: "naturalCapital.schema.json",
    dataFile: "naturalCapital.json",
    required: false,
  },
  {
    name: "Results",
    schema: "results.schema.json",
    dataFile: "results.json",
    required: false,
  },
  {
    name: "Socioeconomic",
    schema: "socioeconomic.schema.json",
    dataFile: "socioeconomic.json",
    required: false,
  },
  {
    name: "Maritime Overview",
    schema: "overview.schema.json",
    dataFile: "maritime/overview.json",
    required: false,
  },
  {
    name: "Maritime Fleet",
    schema: "fleet.schema.json",
    dataFile: "maritime/fleet.json",
    required: false,
  },
  {
    name: "Maritime Crew",
    schema: "crew.schema.json",
    dataFile: "maritime/crew.json",
    required: false,
  },
  {
    name: "Maritime Traffic",
    schema: "traffic.schema.json",
    dataFile: "maritime/traffic.json",
    required: false,
  },
  {
    name: "Maritime Strategic",
    schema: "strategic.schema.json",
    dataFile: "maritime/strategic.json",
    required: false,
  },
];

const schemaDir = path.join(process.cwd(), "schemas");

const requestedDir = process.argv[2] ?? process.env.NEXT_PUBLIC_DATA_PATH ?? "generic";
const dataDir = path.join(process.cwd(), "public", "data", requestedDir);

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

const formatErrors = (errors: ErrorObject[] | null | undefined) => {
  if (!errors) return "Unknown validation error";
  return errors
    .map((error) => {
      const instancePath = error.instancePath ? error.instancePath : "<root>";
      return `${instancePath} ${error.message ?? "is invalid"}`.trim();
    })
    .join("\n");
};

async function validate() {
  let hasErrors = false;
  console.log(`\nValidating data directory: ${dataDir}\n`);

  const targets = [...REQUIRED_TARGETS, ...OPTIONAL_TARGETS];

  for (const target of targets) {
    const schemaPath = path.join(schemaDir, target.schema);
    const dataPath = path.join(dataDir, target.dataFile);

    try {
      const [schemaPresent, dataPresent] = await Promise.all([
        fileExists(schemaPath),
        fileExists(dataPath),
      ]);

      if (!schemaPresent) {
        hasErrors = true;
        console.error(`✖ Missing schema for ${target.name} (${target.schema})`);
        continue;
      }

      if (!dataPresent) {
        if (target.required) {
          hasErrors = true;
          console.error(`✖ Missing required data file for ${target.name} (${target.dataFile})`);
        } else {
          console.log(`○ Skipping optional data file (${target.dataFile})`);
        }
        continue;
      }

      const [schemaRaw, dataRaw] = await Promise.all([
        readFile(schemaPath, "utf-8"),
        readFile(dataPath, "utf-8"),
      ]);

      const schema = JSON.parse(schemaRaw);
      const data = JSON.parse(dataRaw);
      const validator = ajv.compile(schema);
      const valid = validator(data);

      if (!valid) {
        hasErrors = true;
        console.error(`✖ ${target.name} data failed validation (${target.dataFile})`);
        console.error(formatErrors(validator.errors));
        console.error("");
      } else {
        console.log(`✔ ${target.name} data valid (${target.dataFile})`);
      }
    } catch (error) {
      hasErrors = true;
      console.error(`✖ ${target.name} validation encountered an error`);
      console.error(error instanceof Error ? error.message : error);
      console.error("");
    }
  }

  if (hasErrors) {
    console.error("Data validation failed.");
    process.exit(1);
  } else {
    console.log("\nAll data files valid.");
  }
}

validate().catch((error) => {
  console.error("Unexpected validation failure", error);
  process.exit(1);
});
