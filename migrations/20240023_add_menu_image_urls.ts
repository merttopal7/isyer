import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("menu_categories", (t) => {
    t.text("image_url").nullable();
  });
  await knex.schema.alterTable("menu_items", (t) => {
    t.text("image_url").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("menu_categories", (t) => {
    t.dropColumn("image_url");
  });
  await knex.schema.alterTable("menu_items", (t) => {
    t.dropColumn("image_url");
  });
}
