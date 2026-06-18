import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("businesses", (table) => {
    table.text("map_embed").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("businesses", (table) => {
    table.dropColumn("map_embed");
  });
}
