import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("working_hours").del();

  const rows: Array<{
    business_id: number;
    staff_id: null;
    weekday: number;
    start_time: string;
    end_time: string;
  }> = [];

  // Modern Berber: Pazartesi-Cumartesi 09:00-19:00 (0=Pazar kapalı)
  for (let day = 1; day <= 6; day++) {
    rows.push({ business_id: 1, staff_id: null, weekday: day, start_time: "09:00", end_time: "19:00" });
  }

  // Sağlık Polikliniği: Pazartesi-Cuma 08:00-17:00
  for (let day = 1; day <= 5; day++) {
    rows.push({ business_id: 2, staff_id: null, weekday: day, start_time: "08:00", end_time: "17:00" });
  }

  // Lezzet Köşesi: Her gün 12:00-22:00
  for (let day = 0; day <= 6; day++) {
    rows.push({ business_id: 3, staff_id: null, weekday: day, start_time: "12:00", end_time: "22:00" });
  }

  await knex("working_hours").insert(rows);
}
