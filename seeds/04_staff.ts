import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("staff_or_resources").del();

  await knex("staff_or_resources").insert([
    // Berber personeli
    { id: 1, business_id: 1, name: "Ahmet Usta", is_active: true },
    { id: 2, business_id: 1, name: "Mehmet Bey", is_active: true },

    // Hastane doktorları
    { id: 3, business_id: 2, name: "Dr. Ayşe Kaya", is_active: true },
    { id: 4, business_id: 2, name: "Dr. Fatih Demir", is_active: true },
    { id: 5, business_id: 2, name: "Dr. Selin Yılmaz", is_active: true },

    // Restoran masaları
    { id: 6, business_id: 3, name: "Masa 1 (Pencere)", is_active: true },
    { id: 7, business_id: 3, name: "Masa 2 (Bahçe)", is_active: true },
    { id: 8, business_id: 3, name: "Masa 3 (İç Mekan)", is_active: true },
  ]);
}
