import type { Knex } from "knex";

// SQLite doesn't support ALTER COLUMN — recreate the table with updated CHECK constraint
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE appointments_new (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      service_id  INTEGER NOT NULL,
      staff_id    INTEGER,
      customer_id INTEGER,
      customer_name  VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(30)  NOT NULL,
      appointment_date VARCHAR(10) NOT NULL,
      start_time VARCHAR(5) NOT NULL,
      end_time   VARCHAR(5) NOT NULL,
      status VARCHAR(255) NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','approved','rejected','cancelled','cancel_requested')),
      reject_reason TEXT,
      booking_code  VARCHAR(20) NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await knex.raw(`
    INSERT INTO appointments_new
      (id, business_id, service_id, staff_id, customer_id,
       customer_name, customer_phone, appointment_date, start_time, end_time,
       status, reject_reason, booking_code, created_at)
    SELECT
      id, business_id, service_id, staff_id, customer_id,
      customer_name, customer_phone, appointment_date, start_time, end_time,
      status, reject_reason, booking_code, created_at
    FROM appointments
  `);
  await knex.raw("DROP TABLE appointments");
  await knex.raw("ALTER TABLE appointments_new RENAME TO appointments");
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE appointments_new (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      service_id  INTEGER NOT NULL,
      staff_id    INTEGER,
      customer_id INTEGER,
      customer_name  VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(30)  NOT NULL,
      appointment_date VARCHAR(10) NOT NULL,
      start_time VARCHAR(5) NOT NULL,
      end_time   VARCHAR(5) NOT NULL,
      status VARCHAR(255) NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','approved','rejected','cancelled')),
      reject_reason TEXT,
      booking_code  VARCHAR(20) NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await knex.raw("INSERT INTO appointments_new SELECT * FROM appointments WHERE status != 'cancel_requested'");
  await knex.raw("DROP TABLE appointments");
  await knex.raw("ALTER TABLE appointments_new RENAME TO appointments");
}
