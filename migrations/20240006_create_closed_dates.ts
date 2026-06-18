import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("closed_dates", (table) => {
    table.increments("id").primary();
    table.integer("business_id").unsigned().notNullable();
    table.string("date", 10).notNullable(); // "YYYY-MM-DD"
    table.string("reason", 255).nullable();
    table.unique(["business_id", "date"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("closed_dates");
}
