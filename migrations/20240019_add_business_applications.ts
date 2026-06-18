import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("customers", (table) => {
    table.integer("business_id").unsigned().nullable()
      .references("id").inTable("businesses");
  });

  await knex.schema.createTable("business_applications", (table) => {
    table.increments("id");
    table.integer("customer_id").unsigned().notNullable()
      .references("id").inTable("customers");
    table.string("business_name", 255).notNullable();
    table.string("category", 100).notNullable();
    table.string("phone", 30).nullable();
    table.text("address").nullable();
    table.text("description").nullable();
    table.enum("status", ["pending", "approved", "rejected"]).defaultTo("pending");
    table.text("reject_reason").nullable();
    table.integer("business_id").unsigned().nullable()
      .references("id").inTable("businesses");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("business_applications");
  await knex.schema.alterTable("customers", (table) => {
    table.dropColumn("business_id");
  });
}
