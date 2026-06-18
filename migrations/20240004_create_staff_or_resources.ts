import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("staff_or_resources", (table) => {
    table.increments("id").primary();
    table.integer("business_id").unsigned().notNullable();
    table.string("name", 255).notNullable();
    table.boolean("is_active").notNullable().defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("staff_or_resources");
}
