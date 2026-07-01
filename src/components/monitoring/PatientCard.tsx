import { Patient } from "./useVitals";
import { Sparkline } from "./Sparkline";

const statusRing: Record<Patient["status"], string> = {
  critical: "ring-2 ring-status-critical/30",
  warning: "ring-2 ring-status-warning/25",
  stable: "",
};

const statusBadge: Record<Patient["status"], string> = {
  critical: "bg-status-critical/10 text-status-critical",
  warning: "bg-status-warning/10 text-status-warning",
  stable: "bg-status-stable/10 text-status-stable",
};

const statusLabel: Record<Patient["status"], string> = {
  critical: "Critical",
  warning: "Warning",
  stable: "Stable",
};

const sparkColor: Record<Patient["status"], string> = {
  critical: "hsl(var(--status-critical))",
  warning: "hsl(var(--status-warning))",
  stable: "hsl(var(--status-info))",
};

export const PatientCard = ({ patient }: { patient: Patient }) => {
  const isAlert = patient.status !== "stable";
  return (
    <article
      className={`bg-surface border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${statusRing[patient.status]}`}
    >
      <header className="flex justify-between items-start mb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Bed {patient.bed}
          </span>
          <h3 className="text-lg font-bold">{patient.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {patient.age}y · {patient.condition}
          </p>
        </div>
        <div className={`flex gap-1.5 items-center px-2.5 py-1 rounded text-xs font-bold ${statusBadge[patient.status]}`}>
          {isAlert && <span className="animate-ping size-1.5 bg-current rounded-full" />}
          {patient.alertLabel ?? statusLabel[patient.status]}
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4">
        <Vital label="HR" value={patient.hr} unit="bpm" highlight={patient.status === "critical"} />
        <Vital label="SpO₂" value={patient.spo2} unit="%" highlight={patient.spo2 < 95} />
        <Vital label="BP" value={`${patient.bpSys}/${patient.bpDia}`} />
        <Vital label="Resp" value={patient.resp} unit="/m" />
      </div>

      <div className="mt-5 h-14 bg-surface-muted rounded-lg border border-border p-2">
        <Sparkline data={patient.hrHistory} color={sparkColor[patient.status]} className="w-full h-full" />
      </div>
    </article>
  );
};

const Vital = ({ label, value, unit, highlight }: { label: string; value: string | number; unit?: string; highlight?: boolean }) => (
  <div className="space-y-1">
    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{label}</p>
    <p className={`text-2xl font-bold font-mono-tabular ${highlight ? "text-status-critical" : ""}`}>
      {value}
      {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
    </p>
  </div>
);
