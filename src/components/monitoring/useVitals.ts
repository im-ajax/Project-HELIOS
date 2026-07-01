import { useEffect, useRef, useState } from "react";

export type Status = "stable" | "warning" | "critical";

export interface Supply {
  item: string;
  available: number;
  unit: string;
}

export interface Patient {
  id: string;
  bed: string;
  ward: "ICU" | "General" | "Cabin";
  name: string;
  age: number;
  sex: "M" | "F";
  condition: string;
  admitted: string;
  hr: number;
  spo2: number;
  bpSys: number;
  bpDia: number;
  resp: number;
  temp: number;
  status: Status;
  hrHistory: number[];
  spo2History: number[];
  bpHistory: number[];
  respHistory: number[];
  tempHistory: number[];
  alertLabel?: string;
  supplies: Supply[];
}

const seed: Omit<Patient, "hrHistory" | "spo2History" | "bpHistory" | "respHistory" | "tempHistory">[] = [
  { id: "p1", bed: "402", ward: "ICU", name: "Elena Rodriguez", age: 67, sex: "F", condition: "Post-op cardiac bypass", admitted: "2d ago", hr: 138, spo2: 94, bpSys: 118, bpDia: 72, resp: 24, temp: 38.4, status: "critical", alertLabel: "Tachycardia", supplies: [{ item: "Oxygen cylinder", available: 4, unit: "units" }, { item: "Cardiac monitor leads", available: 12, unit: "sets" }] },
  { id: "p2", bed: "405", ward: "General", name: "Marcus Chen", age: 54, sex: "M", condition: "Pneumonia recovery", admitted: "5d ago", hr: 72, spo2: 96, bpSys: 124, bpDia: 80, resp: 16, temp: 37.1, status: "stable", supplies: [{ item: "Nebulizer solution", available: 8, unit: "vials" }] },
  { id: "p3", bed: "408", ward: "General", name: "Sarah Jenkins", age: 41, sex: "F", condition: "Observation", admitted: "1d ago", hr: 68, spo2: 99, bpSys: 116, bpDia: 74, resp: 14, temp: 36.8, status: "stable", supplies: [{ item: "IV saline", available: 24, unit: "bags" }] },
  { id: "p4", bed: "410", ward: "ICU", name: "Timothy Vance", age: 72, sex: "M", condition: "COPD exacerbation", admitted: "3d ago", hr: 104, spo2: 93, bpSys: 142, bpDia: 88, resp: 22, temp: 37.4, status: "warning", alertLabel: "Low SpO2", supplies: [{ item: "Oxygen cylinder", available: 1, unit: "units" }, { item: "Bronchodilator", available: 3, unit: "vials" }] },
  { id: "p5", bed: "412", ward: "General", name: "Maria Garcia", age: 58, sex: "F", condition: "Diabetic ketoacidosis", admitted: "12h ago", hr: 74, spo2: 98, bpSys: 128, bpDia: 78, resp: 15, temp: 37.0, status: "stable", supplies: [{ item: "Insulin (rapid)", available: 6, unit: "vials" }] },
  { id: "p6", bed: "414", ward: "ICU", name: "James O'Brien", age: 63, sex: "M", condition: "Sepsis monitoring", admitted: "1d ago", hr: 96, spo2: 95, bpSys: 108, bpDia: 66, resp: 19, temp: 38.9, status: "warning", alertLabel: "Hypotension watch", supplies: [{ item: "Broad-spectrum antibiotic", available: 5, unit: "vials" }] },
  { id: "p7", bed: "416", ward: "Cabin", name: "Aisha Patel", age: 34, sex: "F", condition: "Post-surgical", admitted: "6h ago", hr: 78, spo2: 98, bpSys: 120, bpDia: 76, resp: 16, temp: 36.9, status: "stable", supplies: [{ item: "Analgesic", available: 14, unit: "doses" }] },
  { id: "p8", bed: "418", ward: "General", name: "Robert Kim", age: 69, sex: "M", condition: "Heart failure", admitted: "4d ago", hr: 88, spo2: 94, bpSys: 134, bpDia: 82, resp: 18, temp: 37.2, status: "stable", supplies: [{ item: "Diuretic", available: 9, unit: "doses" }] },
];

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const drift = (v: number, amp: number) => v + (Math.random() - 0.5) * amp;

function computeStatus(p: { hr: number; spo2: number; bpSys: number }): { status: Status; alertLabel?: string } {
  if (p.hr > 130 || p.hr < 45 || p.spo2 < 90) return { status: "critical", alertLabel: p.hr > 130 ? "Tachycardia" : p.spo2 < 90 ? "Hypoxia" : "Bradycardia" };
  if (p.hr > 100 || p.spo2 < 95 || p.bpSys > 140 || p.bpSys < 100) return { status: "warning", alertLabel: p.spo2 < 95 ? "Low SpO2" : p.hr > 100 ? "Elevated HR" : "BP watch" };
  return { status: "stable" };
}

const HIST = 40;

let _patients: Patient[] = seed.map((p) => ({
  ...p,
  hrHistory: Array.from({ length: HIST }, () => clamp(drift(p.hr, 6), 40, 180)),
  spo2History: Array.from({ length: HIST }, () => clamp(drift(p.spo2, 1.5), 85, 100)),
  bpHistory: Array.from({ length: HIST }, () => clamp(drift(p.bpSys, 5), 80, 180)),
  respHistory: Array.from({ length: HIST }, () => clamp(drift(p.resp, 2), 10, 30)),
  tempHistory: Array.from({ length: HIST }, () => clamp(drift(p.temp, 0.3), 35, 40)),
}));

const subscribers = new Set<(p: Patient[]) => void>();

function step() {
  _patients = _patients.map((p) => {
    const hr = Math.round(clamp(drift(p.hr, p.status === "critical" ? 6 : 3), 45, 165));
    const spo2 = Math.round(clamp(drift(p.spo2, 0.8), 86, 100) * 10) / 10;
    const bpSys = Math.round(clamp(drift(p.bpSys, 2), 90, 170));
    const bpDia = Math.round(clamp(drift(p.bpDia, 1.5), 50, 105));
    const resp = Math.round(clamp(drift(p.resp, 1), 10, 30));
    const temp = Math.round(clamp(drift(p.temp, 0.15), 35.5, 40) * 10) / 10;
    const { status, alertLabel } = computeStatus({ hr, spo2, bpSys });
    return {
      ...p,
      hr, spo2, bpSys, bpDia, resp, temp, status, alertLabel,
      hrHistory: [...p.hrHistory.slice(-(HIST - 1)), hr],
      spo2History: [...p.spo2History.slice(-(HIST - 1)), spo2],
      bpHistory: [...p.bpHistory.slice(-(HIST - 1)), bpSys],
      respHistory: [...p.respHistory.slice(-(HIST - 1)), resp],
      tempHistory: [...p.tempHistory.slice(-(HIST - 1)), temp],
    };
  });
  subscribers.forEach((cb) => cb(_patients));
}

let interval: ReturnType<typeof setInterval> | null = null;

export function useVitals(): Patient[] {
  const [patients, setPatients] = useState<Patient[]>(_patients);
  const ref = useRef(setPatients);
  ref.current = setPatients;

  useEffect(() => {
    const cb = (p: Patient[]) => ref.current(p);
    subscribers.add(cb);
    if (!interval) interval = setInterval(step, 1500);
    return () => {
      subscribers.delete(cb);
      if (subscribers.size === 0 && interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  }, []);

  return patients;
}

export function usePatient(id: string | undefined): Patient | undefined {
  const all = useVitals();
  return all.find((p) => p.id === id);
}
