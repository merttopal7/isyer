import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("working_hours", (table) => {
    table.increments("id").primary();
    table.integer("business_id").unsigned().notNullable();
    table.integer("staff_id").unsigned().nullable();
    table.integer("weekday").notNullable(); // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
    table.string("start_time", 5).notNullable(); // "HH:MM"
    table.string("end_time", 5).notNullable();   // "HH:MM"
    table.unique(["business_id", "staff_id", "weekday"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("working_hours");
}
