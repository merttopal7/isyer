import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "knex",
    "better-sqlite3",
    "pg",
    "pg-native",
    "sqlite3",
    "mysql",
    "mysql2",
    "oracledb",
    "tedious",
  ],
};

export default nextConfig;
