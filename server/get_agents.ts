import { PGlite } from "@electric-sql/pglite/dist/index.cjs";
const db = new PGlite("../data/pglite");
async function run() {
  const res = await db.query("SELECT id, name, adapter_type, adapter_config FROM agents LIMIT 10");
  console.log(JSON.stringify(res.rows, null, 2));
}
run();
