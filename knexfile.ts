import type { Knex } from "knex";
import path from "path";

const isSQLite =
  !process.env.DB_CLIENT || process.env.DB_CLIENT === "better-sqlite3";

const config: { [key: string]: Knex.Config } = {
  development: isSQLite
    ? {
        client: "better-sqlite3",
        connection: {
          filename: process.env.DB_FILENAME ?? "./dev.sqlite3",
        },
        useNullAsDefault: true,
        migrations: {
          directory: path.resolve("./migrations"),
          extension: "ts",
        },
        seeds: {
          directory: path.resolve("./seeds"),
          extension: "ts",
        },
      }
    : {
        client: "pg",
        connection: {
          host: process.env.DB_HOST ?? "localhost",
          port: Number(process.env.DB_PORT ?? 5432),
          database: process.env.DB_NAME ?? "berber_db",
          user: process.env.DB_USER ?? "postgres",
          password: process.env.DB_PASSWORD ?? "",
        },
        migrations: {
          directory: path.resolve("./migrations"),
          extension: "ts",
        },
        seeds: {
          directory: path.resolve("./seeds"),
          extension: "ts",
        },
      },

  production: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: path.resolve("./migrations"),
      extension: "ts",
    },
    seeds: {
      directory: path.resolve("./seeds"),
      extension: "ts",
    },
  },
};

export default config;
