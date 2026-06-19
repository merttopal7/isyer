import type { Knex } from "knex";

export async function up(knex: Knex) {
  await knex.schema.table("businesses", (t) => {
    t.boolean("announcements_enabled").notNullable().defaultTo(true);
  });
}

export async function down(knex: Knex) {
  await knex.schema.table("businesses", (t) => {
    t.dropColumn("announcements_enabled");
  });
}
