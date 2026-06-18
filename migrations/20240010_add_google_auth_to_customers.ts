import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientName: string = (knex as any).client?.config?.client ?? "better-sqlite3";
  const isSqlite = clientName.includes("sqlite");

  if (isSqlite) {
    // SQLite doesn't support ALTER COLUMN — recreate the table
    await knex.raw(`
      CREATE TABLE customers_new (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        phone    VARCHAR(20) UNIQUE,
        name     VARCHAR(100) NOT NULL,
        password_hash TEXT,
        google_id    VARCHAR(255) UNIQUE,
        email        VARCHAR(255),
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await knex.raw(`
      INSERT INTO customers_new (id, phone, name, password_hash, created_at, updated_at)
      SELECT id, phone, name, password_hash, created_at, updated_at FROM customers
    `);
    await knex.raw(`DROP TABLE customers`);
    await knex.raw(`ALTER TABLE customers_new RENAME TO customers`);
  } else {
    // PostgreSQL
    await knex.schema.alterTable("customers", (table) => {
      table.string("google_id", 255).nullable().unique();
      table.string("email", 255).nullable();
    });
    await knex.raw(`ALTER TABLE customers ALTER COLUMN phone DROP NOT NULL`);
    await knex.raw(`ALTER TABLE customers ALTER COLUMN password_hash DROP NOT NULL`);
  }
}

export async function down(knex: Knex): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientName: string = (knex as any).client?.config?.client ?? "better-sqlite3";
  const isSqlite = clientName.includes("sqlite");

  if (isSqlite) {
    await knex.raw(`
      CREATE TABLE customers_new (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        phone    VARCHAR(20) NOT NULL UNIQUE,
        name     VARCHAR(100) NOT NULL,
        password_hash TEXT NOT NULL,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await knex.raw(`
      INSERT INTO customers_new (id, phone, name, password_hash, created_at, updated_at)
      SELECT id, COALESCE(phone, ''), name, COALESCE(password_hash, ''), created_at, updated_at FROM customers
      WHERE phone IS NOT NULL AND password_hash IS NOT NULL
    `);
    await knex.raw(`DROP TABLE customers`);
    await knex.raw(`ALTER TABLE customers_new RENAME TO customers`);
  } else {
    await knex.schema.alterTable("customers", (table) => {
      table.dropColumn("google_id");
      table.dropColumn("email");
    });
  }
}
