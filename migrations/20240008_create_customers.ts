import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("customers", (table) => {
    table.increments("id").primary();
    table.string("phone", 20).notNullable().unique();
    table.string("name", 100).notNullable();
    table.string("password_hash").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("customers");
}
