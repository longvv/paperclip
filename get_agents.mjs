import { PGlite } from "@electric-sql/pglite";
const db = new PGlite("./data/pglite");
async function run() {
  const res = await db.query("SELECT name, adapter_config FROM agents");
  console.log(JSON.stringify(res.rows, null, 2));
}
run();
