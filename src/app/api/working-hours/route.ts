import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { WorkingHour } from "@/types";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId gerekli." }, { status: 400 });

  const hours = await db<WorkingHour>("working_hours")
    .where({ business_id: Number(businessId) })
    .orderBy("weekday");

  return NextResponse.json(hours);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const { business_id, hours } = body as { business_id: number; hours: Array<{ weekday: number; start_time: string; end_time: string }> };

  if (session.role !== "platform_admin" && session.businessId !== Number(business_id)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  // Replace all working hours for this business (no staff filter)
  await db("working_hours")
    .where({ business_id: Number(business_id) })
    .whereNull("staff_id")
    .delete();

  if (hours.length > 0) {
    await db("working_hours").insert(
      hours.map((h) => ({
        business_id: Number(business_id),
        staff_id: null,
        weekday: h.weekday,
        start_time: h.start_time,
        end_time: h.end_time,
      }))
    );
  }

  const updated = await db<WorkingHour>("working_hours")
    .where({ business_id: Number(business_id) })
    .whereNull("staff_id")
    .orderBy("weekday");

  return NextResponse.json(updated);
}
