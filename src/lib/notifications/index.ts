// Bildirim soyutlama katmanı — gerçek SMS/e-posta sağlayıcısı için hazır altyapı

export interface NotificationPayload {
  to: string; // telefon veya e-posta
  customerName: string;
  businessName: string;
  appointmentDate: string;
  appointmentTime: string;
  bookingCode: string;
  status: "approved" | "cancelled";
}

export async function sendAppointmentNotification(
  payload: NotificationPayload
): Promise<void> {
  // TODO: Gerçek SMS sağlayıcısı entegrasyonu (Twilio, Netgsm, vb.)
  // TODO: E-posta sağlayıcısı entegrasyonu (Resend, Nodemailer, vb.)
  console.log("[NOTIFICATION]", JSON.stringify(payload, null, 2));
}
