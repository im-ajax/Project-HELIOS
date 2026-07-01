import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, LayoutGrid, ListChecks, BellRing, BarChart3 } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  active: "overview" | "patients" | "alerts" | "analytics";
  title: string;
  subtitle?: string;
  headerAccessory?: ReactNode;
}

const items = [
  { key: "overview", to: "/", icon: LayoutGrid, label: "Ward Overview" },
  { key: "patients", to: "/patients", icon: ListChecks, label: "Patient List" },
  { key: "alerts", to: "/alerts", icon: BellRing, label: "Critical Alerts" },
  { key: "analytics", to: "/analytics", icon: BarChart3, label: "Ward Analytics" },
] as const;

export const AppShell = ({ children, active, title, subtitle, headerAccessory }: AppShellProps) => {
  const loc = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <nav className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <div className="size-8 bg-primary rounded-lg grid place-items-center text-primary-foreground">
              <Activity className="size-4" />
            </div>
            <span className="tracking-tight">VITALSYS</span>
          </Link>
        </div>
        <div className="p-4 flex-1 space-y-1">
          {items.map((it) => {
            const isActive = active === it.key || loc.pathname === it.to;
            return (
              <Link
                key={it.key}
                to={it.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <it.icon className="size-4" />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="p-4 mt-auto border-t border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-to-br from-primary to-status-stable" />
            <div>
              <p className="text-sm font-semibold">Dr. Aris Thorne</p>
              <p className="text-xs text-muted-foreground">Attending, ICU</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-lg font-semibold">
              {title}
              {subtitle && <span className="text-muted-foreground font-normal ml-2 text-sm">{subtitle}</span>}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {headerAccessory}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full text-xs font-medium">
              <span className="size-2 bg-status-stable rounded-full animate-pulse" />
              Live
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
};
