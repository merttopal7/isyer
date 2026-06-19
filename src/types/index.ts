export type UserRole = "platform_admin" | "business_admin";
export type BusinessStatus = "active" | "pending" | "inactive";
export type AppointmentStatus = "pending" | "approved" | "cancelled" | "cancel_requested";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  business_id: number | null;
  created_at: string;
}

export interface Business {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  map_embed: string | null;
  booking_advance_days: number;
  slot_interval_minutes: number | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  announcements_enabled: boolean;
  menu_enabled: boolean;
  booking_enabled: boolean;
  navbar_enabled: boolean;
  default_tab: string;
  status: BusinessStatus;
  created_at: string;
}

export interface Service {
  id: number;
  business_id: number;
  name: string;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
}

export interface StaffOrResource {
  id: number;
  business_id: number;
  name: string;
  is_active: boolean;
}

export interface WorkingHour {
  id: number;
  business_id: number;
  staff_id: number | null;
  weekday: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
}

export interface ClosedDate {
  id: number;
  business_id: number;
  date: string; // "YYYY-MM-DD"
  reason: string | null;
}

export interface Appointment {
  id: number;
  business_id: number;
  service_id: number;
  staff_id: number | null;
  customer_id: number | null;
  customer_name: string;
  customer_phone: string;
  appointment_date: string; // "YYYY-MM-DD"
  start_time: string;       // "HH:MM"
  end_time: string;         // "HH:MM"
  status: AppointmentStatus;
  reject_reason: string | null;
  booking_code: string;
  checked_in: boolean | null;
  created_at: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Customer {
  id: number;
  phone: string | null;
  name: string;
  password_hash: string | null;
  google_id: string | null;
  email: string | null;
  business_id: number | null;
  created_at: string;
}

export interface BusinessApplication {
  id: number;
  customer_id: number;
  customer_name?: string;
  business_name: string;
  category: string;
  phone: string | null;
  address: string | null;
  description: string | null;
  status: ApplicationStatus;
  reject_reason: string | null;
  business_id: number | null;
  created_at: string;
}

export interface Announcement {
  id: number;
  business_id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: number;
  business_id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface MenuItem {
  id: number;
  business_id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  businessId: number | null;
}

export interface CustomerJwtPayload {
  customerId: number;
  phone: string | null;
  name: string;
  businessId?: number | null;
}
