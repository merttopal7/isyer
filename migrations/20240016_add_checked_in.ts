import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("appointments", (table) => {
    table.boolean("checked_in").nullable().defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("appointments", (table) => {
    table.dropColumn("checked_in");
  });
}
