import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { useVitals, Patient } from "@/components/monitoring/useVitals";
import { AppShell } from "@/components/monitoring/AppShell";

const statusDot: Record<Patient["status"], string> = {
  critical: "bg-status-critical animate-pulse",
  warning: "bg-status-warning",
  stable: "bg-status-stable",
};

const statusBadge: Record<Patient["status"], string> = {
  critical: "bg-status-critical/10 text-status-critical",
  warning: "bg-status-warning/10 text-status-warning",
  stable: "bg-status-stable/10 text-status-stable",
};

const Patients = () => {
  const patients = useVitals();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Patient["status"]>("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return patients.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        p.bed.toLowerCase().includes(term) ||
        p.condition.toLowerCase().includes(term) ||
        p.ward.toLowerCase().includes(term)
      );
    });
  }, [patients, q, filter]);

  const counts = {
    all: patients.length,
    critical: patients.filter((p) => p.status === "critical").length,
    warning: patients.filter((p) => p.status === "warning").length,
    stable: patients.filter((p) => p.status === "stable").length,
  };

  return (
    <AppShell active="patients" title="Patient List" subtitle={`${filtered.length} of ${patients.length} patients`}>
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="relative md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, bed, condition, ward…"
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            {(["all", "critical", "warning", "stable"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md border transition-colors capitalize ${
                  filter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f} <span className="opacity-70 ml-1 font-mono-tabular">{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-surface-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-3">Patient</div>
            <div className="col-span-1">Bed</div>
            <div className="col-span-3">Condition</div>
            <div className="col-span-1 text-right">HR</div>
            <div className="col-span-1 text-right">SpO₂</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1" />
          </div>
          <div className="divide-y divide-border">
            {filtered.map((p) => (
              <Link
                to={`/patients/${p.id}`}
                key={p.id}
                className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-surface-muted transition-colors"
              >
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${statusDot[p.status]}`} />
                    <span className="font-semibold text-sm">{p.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.age}y · {p.sex} · {p.ward}</p>
                </div>
                <div className="col-span-1 text-sm font-mono-tabular text-muted-foreground">{p.bed}</div>
                <div className="col-span-3 text-sm">{p.condition}</div>
                <div className={`col-span-1 text-right text-sm font-bold font-mono-tabular ${p.hr > 100 ? "text-status-critical" : ""}`}>{p.hr}</div>
                <div className={`col-span-1 text-right text-sm font-bold font-mono-tabular ${p.spo2 < 95 ? "text-status-warning" : ""}`}>{p.spo2}</div>
                <div className="col-span-2">
                  <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${statusBadge[p.status]}`}>
                    {p.alertLabel ?? p.status}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                No patients match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Patients;
