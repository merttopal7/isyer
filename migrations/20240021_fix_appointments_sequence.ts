import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const client = knex.client.config.client;
  if (client === "pg" || client === "postgresql") {
    // After table rename from appointments_new → appointments, the sequence value
    // was not updated. Reset it to current MAX(id) so next insert won't conflict.
    await knex.raw(`
      SELECT setval(
        pg_get_serial_sequence('appointments', 'id'),
        COALESCE((SELECT MAX(id) FROM appointments), 0)
      )
    `);
  }
}

export async function down(_knex: Knex): Promise<void> {
  // No rollback needed — sequence value is not critical to reverse
}
