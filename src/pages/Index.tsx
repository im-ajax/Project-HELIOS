import { Link } from "react-router-dom";
import { useVitals } from "@/components/monitoring/useVitals";
import { PatientCard } from "@/components/monitoring/PatientCard";
import { AlertTimeline } from "@/components/monitoring/AlertTimeline";
import { AppShell } from "@/components/monitoring/AppShell";

const Index = () => {
  const patients = useVitals();
  const critical = patients.filter((p) => p.status === "critical").length;
  const warning = patients.filter((p) => p.status === "warning").length;
  const featured = patients.slice(0, 2);
  const overview = patients.slice(2);

  return (
    <AppShell
      active="overview"
      title="North Wing Ward B"
      subtitle={`${patients.length} monitored · ${critical} critical · ${warning} warning`}
      headerAccessory={
        <Link
          to="/patients"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          View all patients
        </Link>
      }
    >
      <div className="flex">
        <div className="flex-1 p-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {featured.map((p) => (
              <Link key={p.id} to={`/patients/${p.id}`} className="block">
                <PatientCard patient={p} />
              </Link>
            ))}

            <div className="xl:col-span-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Ward Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {overview.map((p) => (
                  <Link
                    key={p.id}
                    to={`/patients/${p.id}`}
                    className="bg-surface border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground">{p.bed}</span>
                      <span
                        className={`size-2 rounded-full ${
                          p.status === "critical"
                            ? "bg-status-critical animate-pulse"
                            : p.status === "warning"
                            ? "bg-status-warning"
                            : "bg-status-stable"
                        }`}
                      />
                    </div>
                    <p className="font-medium text-sm mt-1 truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono-tabular">
                      HR {p.hr} · SpO₂ {p.spo2}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="w-[380px] border-l border-border bg-surface flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-0">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-bold">Alert Timeline</h2>
            <span className="bg-secondary text-muted-foreground text-[10px] px-2 py-0.5 rounded font-medium">
              LIVE
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AlertTimeline patients={patients} />
          </div>
        </aside>
      </div>
    </AppShell>
  );
};

export default Index;
