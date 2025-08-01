import "dotenv/config.js";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema.js";

const db_url = process.env.DATABASE_URL;

if (db_url === undefined) {
  throw new Error("unable to load dsn/db url from env file:");
} else {
  var db = drizzle(db_url, { schema });
}

export { db };
