const path = require("path");
const fs = require("fs");

const GENERATED_FILE_PATH = path.resolve("./src/apollo.generated.ts");

const content = fs
  .readFileSync(GENERATED_FILE_PATH, "utf-8")
  .replace("& { [typeName: string]: never }", "")
  .replace("& { [directiveName: string]: never }", "");

fs.writeFileSync(GENERATED_FILE_PATH, content);
