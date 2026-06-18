import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("businesses", (table) => {
    table.increments("id").primary();
    table.string("name", 255).notNullable();
    table.string("slug", 255).notNullable().unique();
    table.string("category", 100).notNullable();
    table.text("description").nullable();
    table.string("phone", 30).nullable();
    table.text("address").nullable();
    table.enum("status", ["active", "pending", "inactive"]).notNullable().defaultTo("pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("businesses");
}
