import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("services", (table) => {
    table.increments("id").primary();
    table.integer("business_id").unsigned().notNullable();
    table.string("name", 255).notNullable();
    table.integer("duration_minutes").notNullable().defaultTo(30);
    table.decimal("price", 10, 2).nullable();
    table.boolean("is_active").notNullable().defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("services");
}
