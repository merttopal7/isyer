import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Migrate existing rejected appointments to cancelled
  await knex("appointments")
    .where({ status: "rejected" })
    .update({ status: "cancelled" });

  // SQLite does not support ALTER COLUMN / DROP COLUMN on enums,
  // so we recreate the table without the "rejected" value and reject_reason column.
  await knex.schema.createTable("appointments_new", (table) => {
    table.increments("id").primary();
    table.integer("business_id").unsigned().notNullable();
    table.integer("service_id").unsigned().notNullable();
    table.integer("staff_id").unsigned().nullable();
    table.integer("customer_id").unsigned().nullable();
    table.string("customer_name", 255).notNullable();
    table.string("customer_phone", 30).notNullable();
    table.string("appointment_date", 10).notNullable();
    table.string("start_time", 5).notNullable();
    table.string("end_time", 5).notNullable();
    table.enum("status", ["pending", "approved", "cancelled", "cancel_requested"])
      .notNullable()
      .defaultTo("pending");
    table.string("booking_code", 20).notNullable().unique();
    table.boolean("checked_in").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.raw(`
    INSERT INTO appointments_new
      (id, business_id, service_id, staff_id, customer_id,
       customer_name, customer_phone, appointment_date, start_time, end_time,
       status, booking_code, checked_in, created_at)
    SELECT
      id, business_id, service_id, staff_id, customer_id,
      customer_name, customer_phone, appointment_date, start_time, end_time,
      status, booking_code, checked_in, created_at
    FROM appointments
  `);

  await knex.schema.dropTable("appointments");
  await knex.schema.renameTable("appointments_new", "appointments");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("appointments_old", (table) => {
    table.increments("id").primary();
    table.integer("business_id").unsigned().notNullable();
    table.integer("service_id").unsigned().notNullable();
    table.integer("staff_id").unsigned().nullable();
    table.integer("customer_id").unsigned().nullable();
    table.string("customer_name", 255).notNullable();
    table.string("customer_phone", 30).notNullable();
    table.string("appointment_date", 10).notNullable();
    table.string("start_time", 5).notNullable();
    table.string("end_time", 5).notNullable();
    table.enum("status", ["pending", "approved", "rejected", "cancelled", "cancel_requested"])
      .notNullable()
      .defaultTo("pending");
    table.text("reject_reason").nullable();
    table.string("booking_code", 20).notNullable().unique();
    table.boolean("checked_in").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.raw(`
    INSERT INTO appointments_old
      (id, business_id, service_id, staff_id, customer_id,
       customer_name, customer_phone, appointment_date, start_time, end_time,
       status, booking_code, checked_in, created_at)
    SELECT
      id, business_id, service_id, staff_id, customer_id,
      customer_name, customer_phone, appointment_date, start_time, end_time,
      status, booking_code, checked_in, created_at
    FROM appointments
  `);

  await knex.schema.dropTable("appointments");
  await knex.schema.renameTable("appointments_old", "appointments");
}
