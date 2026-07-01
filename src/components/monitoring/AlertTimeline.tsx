import { useEffect, useState } from "react";
import { Patient } from "./useVitals";

interface AlertEntry {
  id: string;
  level: "critical" | "warning" | "info";
  patient: string;
  bed: string;
  message: string;
  time: string;
}

const fmt = (d: Date) =>
  `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;

export const AlertTimeline = ({ patients }: { patients: Patient[] }) => {
  const [alerts, setAlerts] = useState<AlertEntry[]>(() => [
    { id: "i1", level: "info", patient: "System", bed: "—", message: "Shift handover completed", time: "08:00:00" },
  ]);

  useEffect(() => {
    const lastStatus = new Map<string, Patient["status"]>();
    patients.forEach((p) => lastStatus.set(p.id, p.status));

    const interval = setInterval(() => {
      const candidates = patients.filter((p) => p.status !== "stable");
      if (candidates.length === 0) return;
      const p = candidates[Math.floor(Math.random() * candidates.length)];
      setAlerts((prev) => {
        const entry: AlertEntry = {
          id: `a${Date.now()}`,
          level: p.status === "critical" ? "critical" : "warning",
          patient: p.name,
          bed: p.bed,
          message: p.alertLabel ?? "Vitals out of range",
          time: fmt(new Date()),
        };
        return [entry, ...prev].slice(0, 12);
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [patients]);

  const styles = {
    critical: "bg-status-critical/5 border-status-critical text-status-critical",
    warning: "bg-status-warning/5 border-status-warning text-status-warning",
    info: "bg-surface-muted border-border text-muted-foreground",
  };

  return (
    <div className="p-4 space-y-3">
      {alerts.map((a) => (
        <div key={a.id} className={`p-3 border-l-4 rounded-r-lg ${styles[a.level]}`}>
          <div className="flex justify-between mb-1">
            <span className="text-[10px] font-bold uppercase">{a.level}</span>
            <span className="text-[10px] text-muted-foreground font-mono-tabular">{a.time}</span>
          </div>
          <p className="text-sm font-bold text-foreground">
            {a.patient} {a.bed !== "—" && <span className="text-muted-foreground font-normal">({a.bed})</span>}
          </p>
          <p className="text-xs text-muted-foreground">{a.message}</p>
        </div>
      ))}
    </div>
  );
};
