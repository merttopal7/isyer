import knex from "knex";
import path from "path";

const isSQLite =
  !process.env.DB_CLIENT || process.env.DB_CLIENT === "better-sqlite3";

function createConnection() {
  if (isSQLite) {
    return knex({
      client: "better-sqlite3",
      connection: {
        filename: path.resolve(process.env.DB_FILENAME ?? "./dev.sqlite3"),
      },
      useNullAsDefault: true,
    });
  }

  return knex({
    client: "pg",
    connection: {
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME ?? "berber_db",
      user: process.env.DB_USER ?? "postgres",
      password: process.env.DB_PASSWORD ?? "",
    },
    pool: { min: 2, max: 10 },
  });
}

// Singleton for Next.js dev HMR
const globalForKnex = globalThis as unknown as { db: ReturnType<typeof knex> };

export const db = globalForKnex.db ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalForKnex.db = db;
}

export default db;
