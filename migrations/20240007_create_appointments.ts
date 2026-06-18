import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("appointments", (table) => {
    table.increments("id").primary();
    table.integer("business_id").unsigned().notNullable();
    table.integer("service_id").unsigned().notNullable();
    table.integer("staff_id").unsigned().nullable();
    table.string("customer_name", 255).notNullable();
    table.string("customer_phone", 30).notNullable();
    table.string("appointment_date", 10).notNullable(); // "YYYY-MM-DD"
    table.string("start_time", 5).notNullable();         // "HH:MM"
    table.string("end_time", 5).notNullable();           // "HH:MM"
    table.enum("status", ["pending", "approved", "rejected", "cancelled"])
      .notNullable()
      .defaultTo("pending");
    table.text("reject_reason").nullable();
    table.string("booking_code", 20).notNullable().unique();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("appointments");
}
