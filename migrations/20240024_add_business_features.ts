import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("businesses", (t) => {
    t.boolean("menu_enabled").notNullable().defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("businesses", (t) => {
    t.dropColumn("menu_enabled");
  });
}
