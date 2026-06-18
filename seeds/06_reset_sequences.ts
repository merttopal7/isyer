import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  const isPg = knex.client.config.client === "pg";
  if (!isPg) return;

  const tables = ["businesses", "users", "services", "staff_or_resources"];

  for (const table of tables) {
    await knex.raw(`
      SELECT setval(
        '${table}_id_seq', 
        COALESCE((SELECT MAX(id) FROM "${table}"), 1)
      )
    `);
  }
}
