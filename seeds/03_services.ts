import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("services").del();

  await knex("services").insert([
    // Berber hizmetleri
    { id: 1, business_id: 1, name: "Saç Kesimi", duration_minutes: 30, price: 150, is_active: true },
    { id: 2, business_id: 1, name: "Sakal Traşı", duration_minutes: 20, price: 100, is_active: true },
    { id: 3, business_id: 1, name: "Saç + Sakal", duration_minutes: 45, price: 220, is_active: true },
    { id: 4, business_id: 1, name: "Çocuk Saç Kesimi", duration_minutes: 20, price: 100, is_active: true },

    // Hastane hizmetleri
    { id: 5, business_id: 2, name: "Dahiliye Muayenesi", duration_minutes: 30, price: 300, is_active: true },
    { id: 6, business_id: 2, name: "Genel Cerrahi", duration_minutes: 45, price: 400, is_active: true },
    { id: 7, business_id: 2, name: "Pediatri", duration_minutes: 30, price: 280, is_active: true },

    // Restoran rezervasyonları
    { id: 8, business_id: 3, name: "2 Kişilik Masa", duration_minutes: 90, price: null, is_active: true },
    { id: 9, business_id: 3, name: "4 Kişilik Masa", duration_minutes: 90, price: null, is_active: true },
    { id: 10, business_id: 3, name: "Özel Kutlama (8+ kişi)", duration_minutes: 120, price: null, is_active: true },
  ]);
}
