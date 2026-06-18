import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("businesses", (table) => {
    table.text("logo_url").nullable();
    table.text("favicon_url").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("businesses", (table) => {
    table.dropColumn("logo_url");
    table.dropColumn("favicon_url");
  });
}
