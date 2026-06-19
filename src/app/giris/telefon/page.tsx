import { PhoneForm } from "./phone-form";

export default async function TelefonPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectUrl = redirect ?? "/";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Telefon Numaranızı Ekleyin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Randevu hatırlatmaları için telefon numaranız gereklidir.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <PhoneForm redirectUrl={redirectUrl} />
        </div>
      </div>
    </div>
  );
}
