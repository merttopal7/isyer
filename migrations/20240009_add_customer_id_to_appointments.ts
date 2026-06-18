import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("appointments", (table) => {
    table.integer("customer_id").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("appointments", (table) => {
    table.dropColumn("customer_id");
  });
}
