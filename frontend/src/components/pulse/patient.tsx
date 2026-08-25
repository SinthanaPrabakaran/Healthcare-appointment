import {
  Activity,
  AlarmClock,
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Link2,
  Mail,
  Pill as PillIcon,
  Search,
  Sparkles,
  Star,
  Stethoscope,
  Timer,
  TriangleAlert,
  Unlink,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Avatar,
  Btn,
  EmptyState,
  Field,
  GlassCard,
  Modal,
  Pill,
  Progress,
  SectionHeading,
  StatCard,
  StatusBadge,
  Tabs,
  Toggle,
  UrgencyBadge,
  inputClass,
} from "@/components/pulse/ui";
import {
  doctors,
  generateSlots,
  specializations,
  triageFromSymptoms,
  type Appointment,
  type Doctor,
  type MedicationReminder,
  type Slot,
  type Triage,
} from "@/lib/pulse-data";
import { cn, getGoogleCalendarUrl } from "@/lib/utils";

const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const nextDates = (count: number) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

/* ------------------------------- Dashboard ------------------------------- */

export function PatientDashboard({
  appointments,
  reminders,
  calendarConnected,
  onConnectCalendar,
  onGoFind,
}: {
  appointments: Appointment[];
  reminders: MedicationReminder[];
  calendarConnected: boolean;
  onConnectCalendar: () => void;
  onGoFind: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const upcoming = appointments.filter((a) => a.status === "BOOKED" || a.status === "HELD");
  const activeRx = appointments.flatMap((a) => a.prescriptions).length;
  const remindersToday = reminders.reduce((n, r) => n + r.times.length, 0);
  const urgent = upcoming.find((a) => a.triage?.urgency === "HIGH");

  return (
    <div className="space-y-6">
      <GlassCard className="relative overflow-hidden p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-primary)" }}
        />
        <Pill tone="teal">
          <Activity className="size-3" /> Live patient workspace
        </Pill>
        <h1 className="font-display mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
          Good day, <span className="text-gradient">Sinthana</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Your care timeline, AI pre-visit triage and medication schedule — all in one calm place.
        </p>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={<CalendarCheck className="size-5" />}
          label="Upcoming visits"
          value={upcoming.length}
          hint={upcoming[0] ? `Next: ${fmtDate(upcoming[0].date)} · ${upcoming[0].time}` : "None"}
        />
        <StatCard
          icon={<PillIcon className="size-5" />}
          label="Prescriptions active"
          value={activeRx}
          hint="Across completed consultations"
          tone="violet"
        />
        <StatCard
          icon={<AlarmClock className="size-5" />}
          label="Reminders today"
          value={remindersToday}
          hint={`${reminders.reduce((n, r) => n + r.taken.length, 0)} already taken`}
          tone="gold"
        />
      </div>

      {urgent ? (
        <div className="gradient-ring flex flex-wrap items-center gap-3 rounded-2xl border border-magenta/30 bg-magenta/10 p-4">
          <TriangleAlert className="size-5 shrink-0 text-magenta" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Urgency triage alert</p>
            <p className="text-sm text-muted-foreground">
              Your booking with {urgent.doctorName} on {fmtDate(urgent.date)} was flagged{" "}
              <strong>HIGH</strong> by AI triage. Please arrive 10 minutes early.
            </p>
          </div>
          <UrgencyBadge level="HIGH" />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <GlassCard>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Google Calendar sync
              </p>
              <p className="font-display mt-1 text-lg font-semibold">
                {calendarConnected ? "Connected" : "Not connected"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {calendarConnected
                  ? "Confirmed appointments are pushed to your primary calendar automatically."
                  : "Connect once and every confirmed appointment lands in your calendar."}
              </p>
            </div>
            <Pill tone={calendarConnected ? "olive" : "danger"}>
              {calendarConnected ? <Link2 className="size-3" /> : <Unlink className="size-3" />}
              {calendarConnected ? "ACTIVE" : "OFFLINE"}
            </Pill>
          </div>
          <Btn className="mt-4 w-full sm:w-auto" onClick={onConnectCalendar}>
            <CalendarPlus className="size-4" />
            {calendarConnected ? "Re-sync calendar" : "Sync with Google (1-click OAuth)"}
          </Btn>
        </GlassCard>

        <GlassCard>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Quick doctor search
          </p>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onGoFind(query);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name or specialization…"
                className={cn(inputClass, "pl-9")}
              />
            </div>
            <Btn type="submit">Search</Btn>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {specializations.slice(0, 5).map((s) => (
              <button key={s} onClick={() => onGoFind(s)}>
                <Pill tone="primary">{s}</Pill>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ---------------------------- Doctor directory ---------------------------- */

export function DoctorDirectory({
  initialQuery,
  onBook,
}: {
  initialQuery: string;
  onBook: (d: Doctor) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [spec, setSpec] = useState("All");

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  const list = doctors.filter((d) => {
    const q = query.trim().toLowerCase();
    const matchQ =
      !q || d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q);
    return matchQ && (spec === "All" || d.specialization === spec);
  });

  return (
    <div>
      <SectionHeading
        title="Find doctors"
        subtitle="GET /api/doctors — filter by name or specialization"
      />
      <GlassCard className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by doctor name or specialization…"
              className={cn(inputClass, "pl-9")}
            />
          </div>
          <select value={spec} onChange={(e) => setSpec(e.target.value)} className={cn(inputClass, "sm:w-56")}>
            <option value="All">All specializations</option>
            {specializations.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {list.length === 0 ? (
        <EmptyState icon={<Stethoscope className="size-5" />} text="No doctors match your search." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((d, i) => (
            <GlassCard key={d.id} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar initials={d.initials} tone={i} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{d.name}</p>
                  <Pill tone="primary" className="mt-1">
                    {d.specialization}
                  </Pill>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-secondary/70 p-2">
                  <p className="font-display text-base font-semibold">{d.slotDuration}m</p>
                  <p className="text-muted-foreground">slot</p>
                </div>
                <div className="rounded-xl bg-secondary/70 p-2">
                  <p className="font-display text-base font-semibold">{d.experienceYears}y</p>
                  <p className="text-muted-foreground">exp</p>
                </div>
                <div className="rounded-xl bg-secondary/70 p-2">
                  <p className="font-display flex items-center justify-center gap-1 text-base font-semibold">
                    <Star className="size-3.5 fill-gold text-gold" />
                    {d.rating}
                  </p>
                  <p className="text-muted-foreground">rating</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {d.workingHours.days.join(" · ")} — {d.workingHours.start} to {d.workingHours.end}
              </p>
              <Btn className="w-full" onClick={() => onBook(d)}>
                <CalendarDays className="size-4" /> Book consultation
              </Btn>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Booking modal ----------------------------- */

export function BookingModal({
  doctor,
  onClose,
  onConfirm,
}: {
  doctor: Doctor | null;
  onClose: () => void;
  onConfirm: (payload: { doctor: Doctor; date: string; time: string; symptoms: string; triage: Triage }) => void;
}) {
  const dates = useMemo(() => nextDates(10), []);
  const [date, setDate] = useState<string>(dates[0] ?? "");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [held, setHeld] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [symptoms, setSymptoms] = useState("");

  useEffect(() => {
    if (!doctor) return;
    setSlots(generateSlots(doctor, date));
    setHeld(null);
  }, [doctor, date]);

  useEffect(() => {
    if (!held) return;
    setSecondsLeft(300);
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setHeld(null);
          toast.error("Slot hold expired", { description: "Please select a slot again." });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [held]);

  const triage = useMemo(
    () => (doctor && symptoms.trim().length > 8 ? triageFromSymptoms(symptoms, doctor.specialization) : null),
    [symptoms, doctor],
  );

  if (!doctor) return null;
  const onLeave = doctor.leaveDates.includes(date);
  const clock = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <Modal
      open={!!doctor}
      onClose={onClose}
      wide
      title={`Book with ${doctor.name}`}
      subtitle={`${doctor.specialization} · ${doctor.slotDuration} min slots`}
    >
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            1 · Select date
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dates.map((d) => {
              const leave = doctor.leaveDates.includes(d);
              return (
                <button
                  key={d}
                  disabled={leave}
                  onClick={() => setDate(d)}
                  className={cn(
                    "min-w-[4.5rem] rounded-xl border px-3 py-2 text-center text-xs transition-all",
                    date === d
                      ? "border-transparent bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "border-border bg-white/60 hover:border-primary/40",
                    leave && "cursor-not-allowed opacity-40 line-through",
                  )}
                >
                  <span className="block font-semibold">{fmtDate(d).split(",")[0]}</span>
                  <span className="block text-[11px] opacity-80">
                    {fmtDate(d).split(", ")[1] ?? ""}
                  </span>
                </button>
              );
            })}
          </div>
          {onLeave ? (
            <p className="mt-2 text-xs text-destructive">Doctor is on leave on this date.</p>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              2 · Pick a slot
            </p>
            <div className="flex gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <i className="inline-block size-2 rounded-full bg-olive" /> Available
              </span>
              <span className="flex items-center gap-1">
                <i className="inline-block size-2 rounded-full bg-destructive" /> Booked
              </span>
              <span className="flex items-center gap-1">
                <i className="inline-block size-2 rounded-full bg-gold" /> Held
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {slots.map((s) => {
              const isHeldByMe = held === s.time;
              const disabled = s.state !== "AVAILABLE";
              return (
                <button
                  key={s.time}
                  disabled={disabled}
                  onClick={() => {
                    setHeld(s.time);
                    toast.success("Slot held for 5 minutes", {
                      description: "POST /api/appointments/hold",
                    });
                  }}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-xs font-medium transition-all",
                    s.state === "AVAILABLE" &&
                      "border-olive/40 bg-olive/10 text-olive hover:bg-olive/20",
                    s.state === "BOOKED" &&
                      "cursor-not-allowed border-destructive/30 bg-destructive/10 text-destructive/70",
                    s.state === "HELD" &&
                      "animate-hold cursor-not-allowed border-gold/50 bg-gold/20 text-[oklch(0.42_0.1_92)]",
                    isHeldByMe &&
                      "animate-hold border-transparent bg-primary text-primary-foreground",
                  )}
                >
                  {s.time}
                </button>
              );
            })}
          </div>
        </div>

        {held ? (
          <div className="gradient-ring flex flex-wrap items-center gap-3 rounded-2xl border border-gold/40 bg-gold/15 p-4">
            <Timer className="size-5 text-[oklch(0.42_0.1_92)]" />
            <p className="flex-1 text-sm font-medium">
              Slot held! Confirm within{" "}
              <span className="font-display text-lg font-bold tabular-nums">{clock}</span>
            </p>
            <Pill tone="gold" glow>
              {held}
            </Pill>
          </div>
        ) : null}

        <Field label="3 · Symptoms & chief complaint">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            placeholder="Describe what you're feeling, when it started and anything that makes it worse…"
            className={cn(inputClass, "resize-none")}
          />
        </Field>

        <div className="gradient-ring rounded-2xl border border-violet/25 bg-violet/8 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-violet" /> AI pre-visit triage preview
            </p>
            {triage ? <UrgencyBadge level={triage.urgency} /> : <Pill>Awaiting input</Pill>}
          </div>
          {triage ? (
            <div className="mt-3 space-y-3 text-sm">
              <p>
                <span className="font-semibold">Chief complaint: </span>
                <span className="text-muted-foreground">{triage.chiefComplaint}</span>
              </p>
              <div>
                <p className="font-semibold">Suggested questions for the doctor</p>
                <ol className="mt-1 list-decimal space-y-1 pl-5 text-muted-foreground">
                  {triage.questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Write a few words about your symptoms — the summary generates live.
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Btn variant="outline" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            disabled={!held || !symptoms.trim() || onLeave}
            onClick={() =>
              held &&
              onConfirm({
                doctor,
                date,
                time: held,
                symptoms,
                triage: triage ?? triageFromSymptoms(symptoms, doctor.specialization),
              })
            }
          >
            <BadgeCheck className="size-4" /> Confirm booking
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

/* --------------------------- My appointments ---------------------------- */

const APT_TABS = ["All", "Upcoming", "Completed", "Cancelled"] as const;

export function MyAppointments({
  appointments,
  onOpen,
}: {
  appointments: Appointment[];
  onOpen: (a: Appointment) => void;
}) {
  const [tab, setTab] = useState<(typeof APT_TABS)[number]>("All");
  const list = appointments.filter((a) =>
    tab === "All"
      ? true
      : tab === "Upcoming"
        ? a.status === "BOOKED" || a.status === "HELD"
        : tab === "Completed"
          ? a.status === "COMPLETED"
          : a.status === "CANCELLED",
  );

  return (
    <div>
      <SectionHeading
        title="My appointments"
        subtitle="GET /api/appointments/my"
        action={<Tabs tabs={APT_TABS} value={tab} onChange={setTab} />}
      />
      {list.length === 0 ? (
        <EmptyState icon={<ClipboardList className="size-5" />} text="Nothing here yet." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((a, i) => (
            <GlassCard key={a.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={a.doctorName.split(" ")[1]?.slice(0, 2).toUpperCase() ?? "DR"} tone={i} />
                  <div>
                    <p className="font-semibold">{a.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{a.specialization}</p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Pill tone="primary">
                  <CalendarDays className="size-3" /> {fmtDate(a.date)}
                </Pill>
                <Pill tone="teal">
                  <Clock className="size-3" /> {a.time}
                </Pill>
                {a.triage ? <UrgencyBadge level={a.triage.urgency} /> : null}
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{a.symptoms}</p>
              <Btn variant="outline" className="w-full" onClick={() => onOpen(a)}>
                <FileText className="size-4" /> View details & timeline
              </Btn>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------- Appointment detail --------------------------- */

export function AppointmentDetail({
  appointment,
  onBack,
  onAddToCalendar,
}: {
  appointment: Appointment;
  onBack: () => void;
  onAddToCalendar: (a: Appointment) => void;
}) {
  const a = appointment;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Btn variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" /> Back to appointments
        </Btn>
        <div className="flex items-center gap-2">
          <StatusBadge status={a.status} />
          <a
            href={getGoogleCalendarUrl(a)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onAddToCalendar(a)}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all bg-accent text-accent-foreground hover:opacity-90 border border-transparent"
          >
            <CalendarPlus className="size-4" /> Add to Google Calendar
          </a>
        </div>
      </div>

      <GlassCard className="flex flex-wrap items-center gap-4">
        <Avatar initials={a.doctorName.split(" ")[1]?.slice(0, 2).toUpperCase() ?? "DR"} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold">{a.doctorName}</h1>
          <p className="text-sm text-muted-foreground">
            {a.specialization} · {fmtDate(a.date)} · {a.time}
          </p>
        </div>
        <Pill tone={a.calendarSynced ? "olive" : "muted"}>
          {a.calendarSynced ? "Calendar synced" : "Not on calendar"}
        </Pill>
      </GlassCard>

      <ol className="relative space-y-4 border-l border-border pl-6">
        <TimelineItem icon={<Sparkles className="size-3.5" />} label="Pre-visit AI triage">
          {a.triage ? (
            <div className="space-y-3">
              <UrgencyBadge level={a.triage.urgency} />
              <p className="text-sm">
                <span className="font-semibold">Chief complaint: </span>
                <span className="text-muted-foreground">{a.triage.chiefComplaint}</span>
              </p>
              <div className="text-sm">
                <p className="font-semibold">Questions for the doctor</p>
                <ol className="mt-1 list-decimal space-y-1 pl-5 text-muted-foreground">
                  {a.triage.questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No triage generated.</p>
          )}
        </TimelineItem>

        <TimelineItem icon={<Stethoscope className="size-3.5" />} label="Consultation notes & diagnosis">
          {a.diagnosis || a.notes ? (
            <div className="space-y-2 text-sm">
              {a.diagnosis ? (
                <p>
                  <span className="font-semibold">Diagnosis: </span>
                  {a.diagnosis}
                </p>
              ) : null}
              {a.notes ? <p className="text-muted-foreground">{a.notes}</p> : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Available after the consultation.</p>
          )}
        </TimelineItem>

        <TimelineItem icon={<UserRound className="size-3.5" />} label="Plain-language summary (AI)">
          {a.patientSummary ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{a.patientSummary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your doctor will generate this after the visit.
            </p>
          )}
        </TimelineItem>

        <TimelineItem icon={<PillIcon className="size-3.5" />} label="Digital prescription">
          {a.prescriptions.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[38rem] text-left text-sm">
                <thead className="text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="py-2 pr-3">Medicine</th>
                    <th className="py-2 pr-3">Dosage</th>
                    <th className="py-2 pr-3">Frequency</th>
                    <th className="py-2 pr-3">Duration</th>
                    <th className="py-2">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {a.prescriptions.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="py-2 pr-3 font-medium">{p.medicine}</td>
                      <td className="py-2 pr-3">{p.dosage}</td>
                      <td className="py-2 pr-3">{p.frequency}</td>
                      <td className="py-2 pr-3">{p.duration}</td>
                      <td className="py-2 text-muted-foreground">{p.instructions || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No medicines prescribed.</p>
          )}
        </TimelineItem>

        <TimelineItem icon={<CalendarCheck className="size-3.5" />} label="Follow-up care">
          <p className="text-sm text-muted-foreground">
            {a.followUp || "No follow-up instructions recorded."}
          </p>
        </TimelineItem>
      </ol>
    </div>
  );
}

function TimelineItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative">
      <span className="absolute -left-[2.05rem] grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
        {icon}
      </span>
      <GlassCard>
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {children}
      </GlassCard>
    </li>
  );
}

/* ------------------------------- Reminders ------------------------------- */

export function MedicationReminders({
  reminders,
  onToggleTaken,
  onToggleEmail,
}: {
  reminders: MedicationReminder[];
  onToggleTaken: (id: string, time: string) => void;
  onToggleEmail: (id: string, value: boolean) => void;
}) {
  const total = reminders.reduce((n, r) => n + r.times.length, 0);
  const taken = reminders.reduce((n, r) => n + r.taken.length, 0);
  const pct = total ? Math.round((taken / total) * 100) : 0;

  return (
    <div>
      <SectionHeading
        title="Medication reminders"
        subtitle="Daily schedule with Nodemailer email notifications"
      />
      <GlassCard className="mb-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <p className="font-semibold">Today's compliance</p>
          <Pill tone={pct === 100 ? "olive" : "gold"}>
            {taken}/{total} doses · {pct}%
          </Pill>
        </div>
        <Progress value={pct} />
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {reminders.map((r, i) => (
          <GlassCard key={r.id} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar initials={r.medicine.slice(0, 2).toUpperCase()} tone={i + 2} />
                <div>
                  <p className="font-semibold">{r.medicine}</p>
                  <p className="text-xs text-muted-foreground">{r.dosage}</p>
                </div>
              </div>
              <Pill tone={r.taken.length === r.times.length ? "olive" : "gold"}>
                {r.taken.length}/{r.times.length} taken
              </Pill>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.times.map((t) => {
                const done = r.taken.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => onToggleTaken(r.id, t)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                      done
                        ? "border-olive/40 bg-olive/15 text-olive"
                        : "border-border bg-white/60 hover:border-primary/40",
                    )}
                  >
                    <CheckCircle2 className={cn("size-4", done ? "opacity-100" : "opacity-30")} />
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2">
              <span className="flex items-center gap-2 text-xs font-medium">
                <Mail className="size-4 text-primary" /> Email reminder
              </span>
              <Toggle
                checked={r.emailEnabled}
                onChange={(v) => onToggleEmail(r.id, v)}
                label={`Email reminders for ${r.medicine}`}
              />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- Calendar sync page ---------------------------- */

export function CalendarSyncPage({
  connected,
  onConnect,
  appointments,
  onAddToCalendar,
}: {
  connected: boolean;
  onConnect: () => void;
  appointments: Appointment[];
  onAddToCalendar: (a: Appointment) => void;
}) {
  return (
    <div>
      <SectionHeading
        title="Google Calendar sync"
        subtitle="GET /api/calendar/status · POST /api/calendar/connect"
      />
      <GlassCard className="mb-5 flex flex-wrap items-center gap-4">
        <div
          className="grid size-12 place-items-center rounded-2xl"
          style={{ background: "var(--gradient-aqua)" }}
        >
          <CalendarDays className="size-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold">
            {connected ? "Connected to Google Calendar" : "Calendar not connected"}
          </p>
          <p className="text-sm text-muted-foreground">
            {connected
              ? "Scope: calendar.events · token refreshed automatically"
              : "Authorize once to push appointments to your calendar."}
          </p>
        </div>
        <Btn onClick={onConnect}>{connected ? "Re-authorize" : "Connect Google"}</Btn>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {appointments
          .filter((a) => a.status !== "CANCELLED")
          .map((a) => (
            <GlassCard key={a.id} className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{a.doctorName}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtDate(a.date)} · {a.time}
                </p>
              </div>
              {a.calendarSynced ? (
                <Pill tone="olive">
                  <CheckCircle2 className="size-3" /> Synced
                </Pill>
              ) : (
                <a
                  href={getGoogleCalendarUrl(a)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onAddToCalendar(a)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all border border-input bg-transparent text-foreground hover:bg-secondary"
                >
                  <CalendarPlus className="size-4" /> Add to Google Calendar
                </a>
              )}
            </GlassCard>
          ))}
      </div>
    </div>
  );
}


export function PatientView({
  doctors,
  appointments,
  reminders,
  calendarSynced,
  onHoldSlot,
  onBookAppointment,
  onCancelAppointment,
  onToggleReminder,
  onToggleEmailNotif,
  onConnectCalendar,
  onSyncAppointmentToCalendar,
}: {
  doctors: Doctor[];
  appointments: Appointment[];
  reminders: MedicationReminder[];
  calendarSynced: boolean;
  onHoldSlot: (doctorId: string, date: string, time: string) => void;
  onBookAppointment: (doctorId: string, date: string, time: string, symptoms: string) => void;
  onCancelAppointment: (id: string) => void;
  onToggleReminder: (id: string, time: string) => void;
  onToggleEmailNotif: (id: string) => void;
  onConnectCalendar: () => void;
  onSyncAppointmentToCalendar?: (id: string) => void;
}) {
  const [tab, setTab] = useState<"Dashboard" | "Find Doctors" | "My Visits" | "Medications" | "Calendar Sync">("Dashboard");
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSyncAppt = (appt: Appointment) => {
    if (onSyncAppointmentToCalendar) {
      onSyncAppointmentToCalendar(appt.id);
    } else {
      appt.calendarSynced = true;
      toast.success("Appointment synced to Google Calendar!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Navbar Tabs for Patient */}
      <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-3">
        <div className="flex items-center gap-2">
          <BadgeCheck className="size-5 text-accent-foreground" />
          <h2 className="font-display font-bold text-lg">Patient Healthcare Portal</h2>
        </div>
        <Tabs
          tabs={["Dashboard", "Find Doctors", "My Visits", "Medications", "Calendar Sync"] as const}
          value={tab}
          onChange={(t) => {
            setTab(t);
            if (t !== "Find Doctors") setBookingDoctor(null);
            if (t !== "My Visits") setSelectedAppointment(null);
          }}
        />
      </GlassCard>

      {tab === "Dashboard" && (
        <PatientDashboard
          appointments={appointments}
          reminders={reminders}
          calendarConnected={calendarSynced}
          onConnectCalendar={onConnectCalendar}
          onGoFind={(q) => {
            setSearchQuery(q || "");
            setTab("Find Doctors");
          }}
        />
      )}

      {tab === "Find Doctors" && (
        <>
          <DoctorDirectory
            initialQuery={searchQuery}
            onBook={(d) => setBookingDoctor(d)}
          />
          <BookingModal
            doctor={bookingDoctor}
            onClose={() => setBookingDoctor(null)}
            onConfirm={({ doctor, date, time, symptoms }) => {
              onBookAppointment(doctor.id, date, time, symptoms);
              setBookingDoctor(null);
              setTab("My Visits");
            }}
          />
        </>
      )}

      {tab === "My Visits" && (
        selectedAppointment ? (
          <AppointmentDetail
            appointment={selectedAppointment}
            onBack={() => setSelectedAppointment(null)}
            onAddToCalendar={(a) => handleSyncAppt(a)}
          />
        ) : (
          <MyAppointments
            appointments={appointments}
            onOpen={(appt) => setSelectedAppointment(appt)}
          />
        )
      )}

      {tab === "Medications" && (
        <MedicationReminders
          reminders={reminders}
          onToggle={onToggleReminder}
          onToggleEmailNotif={onToggleEmailNotif}
        />
      )}

      {tab === "Calendar Sync" && (
        <CalendarSync
          connected={calendarSynced}
          onConnect={onConnectCalendar}
          appointments={appointments}
          onAddToCalendar={(a) => handleSyncAppt(a)}
        />
      )}
    </div>
  );
}



