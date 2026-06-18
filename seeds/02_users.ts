import type { Knex } from "knex";
import bcrypt from "bcryptjs";

export async function seed(knex: Knex): Promise<void> {
  await knex("users").del();

  const platformHash = await bcrypt.hash("admin123", 10);
  const berberHash = await bcrypt.hash("berber123", 10);
  const hastaneHash = await bcrypt.hash("hastane123", 10);
  const restoranHash = await bcrypt.hash("restoran123", 10);

  await knex("users").insert([
    {
      id: 1,
      email: "admin@platform.com",
      password_hash: platformHash,
      role: "platform_admin",
      business_id: null,
    },
    {
      id: 2,
      email: "admin@modern-berber.com",
      password_hash: berberHash,
      role: "business_admin",
      business_id: 1,
    },
    {
      id: 3,
      email: "admin@saglik-poliklinigi.com",
      password_hash: hastaneHash,
      role: "business_admin",
      business_id: 2,
    },
    {
      id: 4,
      email: "admin@lezzet-kosesi.com",
      password_hash: restoranHash,
      role: "business_admin",
      business_id: 3,
    },
  ]);
}
