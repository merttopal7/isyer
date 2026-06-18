import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("announcements", (table) => {
    table.increments("id").primary();
    table.integer("business_id").notNullable().references("id").inTable("businesses").onDelete("CASCADE");
    table.string("title", 200).notNullable();
    table.text("content").notNullable();
    table.boolean("is_pinned").notNullable().defaultTo(false);
    table.boolean("is_published").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("announcements");
}
