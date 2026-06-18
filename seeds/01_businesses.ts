import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Clear all referencing/dependent tables to avoid foreign key violations
  await knex("business_applications").del();
  await knex("appointments").del();
  await knex("closed_dates").del();
  await knex("working_hours").del();
  await knex("announcements").del();
  await knex("services").del();
  await knex("staff_or_resources").del();
  await knex("users").del();
  await knex("customers").del();
  await knex("businesses").del();

  await knex("businesses").insert([
    {
      id: 1,
      name: "Modern Berber",
      slug: "modern-berber",
      category: "berber",
      description: "Erkek ve çocuk saç kesimi, sakal traşı uzmanı.",
      phone: "0212 555 10 10",
      address: "Bağcılar Mah. 15. Sok. No:3, İstanbul",
      status: "active",
    },
    {
      id: 2,
      name: "Sağlık Polikliniği",
      slug: "saglik-poliklinigi",
      category: "hastane",
      description: "Genel cerrahi, dahiliye ve pediatri bölümleri.",
      phone: "0216 444 20 20",
      address: "Kadıköy Cad. No:55, İstanbul",
      status: "active",
    },
    {
      id: 3,
      name: "Lezzet Köşesi",
      slug: "lezzet-kosesi",
      category: "restoran",
      description: "Türk mutfağı, akşam yemeği rezervasyonu.",
      phone: "0312 333 30 30",
      address: "Kızılay Mah. No:7, Ankara",
      status: "active",
    },
  ]);
}
