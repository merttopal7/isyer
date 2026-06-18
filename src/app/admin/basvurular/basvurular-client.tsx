"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2, XCircle, Clock, User, Phone,
  Building2, MapPin, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import type { BusinessApplication } from "@/types";

interface Props {
  applications: (BusinessApplication & { customer_name: string; customer_phone: string | null })[];
}

export function BasvurularClient({ applications: initApps }: Props) {
  const [apps, setApps] = useState(initApps);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function handleAction(id: number, action: "approve" | "reject") {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/basvurular/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reject_reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "İşlem başarısız."); return; }
      setApps((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: action === "approve" ? "approved" : "rejected", reject_reason: rejectReason || null }
            : a
        )
      );
      setRejectId(null);
      setRejectReason("");
      toast.success(action === "approve" ? "Başvuru onaylandı. İşletme oluşturuldu." : "Başvuru reddedildi.");
    } finally {
      setLoading(null);
    }
  }

  const pending = apps.filter((a) => a.status === "pending");
  const others  = apps.filter((a) => a.status !== "pending");

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
        <Building2 className="h-10 w-10 opacity-30" />
        <p>Henüz başvuru yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
            Bekleyen ({pending.length})
          </h2>
          {pending.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              rejectId={rejectId}
              rejectReason={rejectReason}
              loading={loading}
              expanded={expanded}
              setRejectId={setRejectId}
              setRejectReason={setRejectReason}
              setExpanded={setExpanded}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
      {others.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            İşlenenler ({others.length})
          </h2>
          {others.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              rejectId={rejectId}
              rejectReason={rejectReason}
              loading={loading}
              expanded={expanded}
              setRejectId={setRejectId}
              setRejectReason={setRejectReason}
              setExpanded={setExpanded}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AppCard({
  app, rejectId, rejectReason, loading, expanded,
  setRejectId, setRejectReason, setExpanded, onAction,
}: {
  app: BusinessApplication & { customer_name: string; customer_phone: string | null };
  rejectId: number | null;
  rejectReason: string;
  loading: number | null;
  expanded: number | null;
  setRejectId: (id: number | null) => void;
  setRejectReason: (r: string) => void;
  setExpanded: (id: number | null) => void;
  onAction: (id: number, action: "approve" | "reject") => void;
}) {
  const isExpanded = expanded === app.id;
  const isLoading = loading === app.id;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(isExpanded ? null : app.id)}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{app.business_name}</p>
          <p className="text-xs text-muted-foreground capitalize">{app.category} · {app.customer_name}</p>
        </div>
        <StatusBadge status={app.status} />
        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </div>

      {/* Details */}
      {isExpanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{app.customer_name}</span>
            </div>
            {app.customer_phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{app.customer_phone}</span>
              </div>
            )}
            {app.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{app.phone} (işletme)</span>
              </div>
            )}
            {app.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{app.address}</span>
              </div>
            )}
          </div>
          {app.description && (
            <p className="text-sm text-muted-foreground">{app.description}</p>
          )}
          {app.reject_reason && (
            <p className="text-sm text-destructive">Red sebebi: {app.reject_reason}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {new Date(app.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>

          {app.status === "pending" && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => onAction(app.id, "approve")}
                disabled={isLoading}
                className="gap-1.5 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Onayla
              </Button>

              {rejectId === app.id ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    placeholder="Red sebebi (isteğe bağlı)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onAction(app.id, "reject")}
                    disabled={isLoading}
                    className="gap-1.5"
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                    Reddet
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setRejectId(null); setRejectReason(""); }}>
                    İptal
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setRejectId(app.id)} className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <XCircle className="h-3.5 w-3.5" /> Reddet
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "pending")  return <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 gap-1"><Clock className="h-3 w-3" />Bekliyor</Badge>;
  if (status === "approved") return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 gap-1"><CheckCircle2 className="h-3 w-3" />Onaylandı</Badge>;
  return <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 gap-1"><XCircle className="h-3 w-3" />Reddedildi</Badge>;
}
