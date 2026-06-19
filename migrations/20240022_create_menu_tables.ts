import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("menu_categories", (t) => {
    t.increments("id").primary();
    t.integer("business_id").unsigned().notNullable()
      .references("id").inTable("businesses").onDelete("CASCADE");
    t.string("name", 100).notNullable();
    t.string("slug", 120).notNullable();
    t.text("description").nullable();
    t.boolean("is_published").notNullable().defaultTo(true);
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.unique(["business_id", "slug"]);
  });

  await knex.schema.createTable("menu_items", (t) => {
    t.increments("id").primary();
    t.integer("business_id").unsigned().notNullable()
      .references("id").inTable("businesses").onDelete("CASCADE");
    t.integer("category_id").unsigned().notNullable()
      .references("id").inTable("menu_categories").onDelete("CASCADE");
    t.string("name", 200).notNullable();
    t.text("description").nullable();
    t.decimal("price", 10, 2).nullable();
    t.boolean("is_available").notNullable().defaultTo(true);
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("menu_items");
  await knex.schema.dropTableIfExists("menu_categories");
}
