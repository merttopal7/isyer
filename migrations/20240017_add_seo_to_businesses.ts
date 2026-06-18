import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("businesses", (table) => {
    table.string("meta_title", 100).nullable();
    table.text("meta_description").nullable();
    table.string("meta_keywords", 500).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("businesses", (table) => {
    table.dropColumn("meta_title");
    table.dropColumn("meta_description");
    table.dropColumn("meta_keywords");
  });
}
