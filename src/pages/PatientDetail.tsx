import { Link, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Package, BedDouble } from "lucide-react";
import { usePatient, Patient } from "@/components/monitoring/useVitals";
import { Sparkline } from "@/components/monitoring/Sparkline";
import { AppShell } from "@/components/monitoring/AppShell";

const statusBadge: Record<Patient["status"], string> = {
  critical: "bg-status-critical/10 text-status-critical border-status-critical/30",
  warning: "bg-status-warning/10 text-status-warning border-status-warning/30",
  stable: "bg-status-stable/10 text-status-stable border-status-stable/30",
};

const sparkColor: Record<Patient["status"], string> = {
  critical: "hsl(var(--status-critical))",
  warning: "hsl(var(--status-warning))",
  stable: "hsl(var(--status-info))",
};

const PatientDetail = () => {
  const { id } = useParams();
  const patient = usePatient(id);

  if (!patient) {
    return (
      <AppShell active="patients" title="Patient not found">
        <div className="p-8">
          <Link to="/patients" className="text-primary text-sm font-medium inline-flex items-center gap-1">
            <ArrowLeft className="size-4" /> Back to patients
          </Link>
        </div>
      </AppShell>
    );
  }

  const color = sparkColor[patient.status];
  const lowSupply = patient.supplies.some((s) => s.available <= 2);

  return (
    <AppShell
      active="patients"
      title={patient.name}
      subtitle={`Bed ${patient.bed} · ${patient.ward}`}
      headerAccessory={
        <Link to="/patients" className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="size-4" /> All patients
        </Link>
      }
    >
      <div className="p-8 space-y-6 max-w-7xl">
        {/* Summary */}
        <section className="bg-surface border border-border rounded-xl p-6 flex flex-wrap gap-6 items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{patient.name}</h2>
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${statusBadge[patient.status]}`}>
                {patient.alertLabel ?? patient.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {patient.age}y · {patient.sex === "M" ? "Male" : "Female"} · {patient.condition} · Admitted {patient.admitted}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-surface-muted">Full history</button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">Notify doctor</button>
          </div>
        </section>

        {patient.status !== "stable" && (
          <section className="bg-status-critical/5 border border-status-critical/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="size-5 text-status-critical mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm text-status-critical">{patient.alertLabel}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Thresholds breached. Doctors panel notified. Continuous monitoring active.
              </p>
            </div>
          </section>
        )}

        {/* Latest readings */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Latest Readings</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Reading label="Heart Rate" value={patient.hr} unit="bpm" alert={patient.hr > 100 || patient.hr < 50} />
            <Reading label="SpO₂" value={patient.spo2} unit="%" alert={patient.spo2 < 95} />
            <Reading label="BP" value={`${patient.bpSys}/${patient.bpDia}`} unit="mmHg" alert={patient.bpSys > 140 || patient.bpSys < 100} />
            <Reading label="Respiration" value={patient.resp} unit="/min" alert={patient.resp > 20 || patient.resp < 12} />
            <Reading label="Temperature" value={patient.temp} unit="°C" alert={patient.temp > 38 || patient.temp < 36} />
          </div>
        </section>

        {/* Trends */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Trends · last {patient.hrHistory.length} samples</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TrendCard title="Heart Rate" unit="bpm" data={patient.hrHistory} color={color} />
            <TrendCard title="SpO₂" unit="%" data={patient.spo2History} color="hsl(var(--status-info))" />
            <TrendCard title="Systolic BP" unit="mmHg" data={patient.bpHistory} color="hsl(var(--status-warning))" />
            <TrendCard title="Respiration" unit="/min" data={patient.respHistory} color="hsl(var(--status-stable))" />
          </div>
        </section>

        {/* Supplies + bed info */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-bold">Required Supplies</h3>
              {lowSupply && (
                <span className="ml-auto text-[10px] font-bold uppercase bg-status-warning/10 text-status-warning px-2 py-0.5 rounded">
                  Low stock
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {patient.supplies.map((s) => {
                const low = s.available <= 2;
                return (
                  <li key={s.item} className="flex items-center justify-between text-sm border-b border-border last:border-0 py-2">
                    <span>{s.item}</span>
                    <span className={`font-mono-tabular font-bold ${low ? "text-status-warning" : "text-foreground"}`}>
                      {s.available} {s.unit}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BedDouble className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-bold">Ward Capacity</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Capacity label="ICU" available={0} total={4} />
              <Capacity label="General" available={2} total={12} />
              <Capacity label="Cabin" available={1} total={6} />
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Emergency transfer routing is active when ICU capacity hits zero.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

const Reading = ({ label, value, unit, alert }: { label: string; value: string | number; unit: string; alert?: boolean }) => (
  <div className={`bg-surface border rounded-xl p-4 ${alert ? "border-status-critical/30" : "border-border"}`}>
    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</p>
    <p className={`text-3xl font-bold font-mono-tabular mt-1 ${alert ? "text-status-critical" : ""}`}>{value}</p>
    <p className="text-xs text-muted-foreground">{unit}</p>
  </div>
);

const TrendCard = ({ title, unit, data, color }: { title: string; unit: string; data: number[]; color: string }) => {
  const last = data[data.length - 1];
  const first = data[0];
  const delta = last - first;
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-mono-tabular mt-0.5">
            {last}
            <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>
          </p>
        </div>
        <span className={`text-xs font-mono-tabular ${delta > 0 ? "text-status-warning" : delta < 0 ? "text-status-info" : "text-muted-foreground"}`}>
          {delta > 0 ? "▲" : delta < 0 ? "▼" : "·"} {Math.abs(delta).toFixed(1)}
        </span>
      </div>
      <div className="h-24">
        <Sparkline data={data} color={color} className="w-full h-full" />
      </div>
    </div>
  );
};

const Capacity = ({ label, available, total }: { label: string; available: number; total: number }) => {
  const tone = available === 0 ? "text-status-critical" : available <= 2 ? "text-status-warning" : "text-status-stable";
  return (
    <div className="bg-surface-muted border border-border rounded-lg p-3">
      <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold font-mono-tabular ${tone}`}>{available}</p>
      <p className="text-[10px] text-muted-foreground">of {total} free</p>
    </div>
  );
};

export default PatientDetail;
