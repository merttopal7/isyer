import type { Knex } from "knex";

export async function up(knex: Knex) {
  await knex.schema.table("businesses", (t) => {
    t.text("default_tab").notNullable().defaultTo("duyurular");
  });
}

export async function down(knex: Knex) {
  await knex.schema.table("businesses", (t) => {
    t.dropColumn("default_tab");
  });
}
