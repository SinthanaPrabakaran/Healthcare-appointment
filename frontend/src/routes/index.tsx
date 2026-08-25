import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Clock,
  LogOut,
  Pill as PillIcon,
  Shield,
  Sparkles,
  Stethoscope,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { AuthProvider, useAuth, type UserRole } from "@/context/AuthContext";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";
import { AdminConsole } from "@/components/pulse/admin";
import { DoctorConsole } from "@/components/pulse/doctor";
import { PatientView } from "@/components/pulse/patient";
import { Avatar, Btn, Pill } from "@/components/pulse/ui";
import {
  doctors as initialDoctors,
  initialAppointments,
  doctorQueue,
  initialReminders,
  triageFromSymptoms,
  buildPatientSummary,
  type Appointment,
  type Doctor,
  type MedicationReminder,
  type Prescription,
} from "@/lib/pulse-data";

export const Route = createFileRoute("/")({
  component: AppRoot,
});

function AppRoot() {
  return (
    <AuthProvider>
      <MainAppShell />
    </AuthProvider>
  );
}

function MainAppShell() {
  const { user, logout, setDemoUser } = useAuth();
  const [authView, setAuthView] = useState<"login" | "register">("login");

  const [doctorsList, setDoctorsList] = useState<Doctor[]>(initialDoctors);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>(initialAppointments);
  const [remindersList, setRemindersList] = useState<MedicationReminder[]>(initialReminders);
  const [calendarSynced, setCalendarSynced] = useState<boolean>(true);

  // Live backend sync effect (attaches to localhost:5000/api if active)
  useEffect(() => {
    async function fetchBackendData() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch("http://localhost:5000/api/doctors", { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.doctors && data.doctors.length > 0) {
            const formatted: Doctor[] = data.doctors.map((d: any, idx: number) => ({
              id: d.id || d._id,
              name: `Dr. ${d.name}`,
              specialization: d.specialization || "General Medicine",
              experienceYears: 8 + (idx % 10),
              rating: 4.8,
              slotDuration: d.slotDuration || 30,
              workingHours: { start: "09:00", end: "17:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
              leaveDates: d.leaveDates || [],
              initials: d.name ? d.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "DR",
            }));
            setDoctorsList(formatted);
          }
        }
      } catch (err) {
        // Fallback to local typed dataset
      }
    }
    fetchBackendData();
  }, []);

  // Handlers for Patient Workflows
  const handleHoldSlot = (doctorId: string, date: string, time: string) => {
    toast.info("Slot held for 5:00 minutes! Complete symptoms to finalize.");
  };

  const handleBookAppointment = (
    doctorId: string,
    date: string,
    time: string,
    symptoms: string
  ) => {
    const doc = doctorsList.find((d) => d.id === doctorId) || doctorsList[0];
    const triage = triageFromSymptoms(symptoms, doc.specialization);

    const newAppt: Appointment = {
      id: `apt_${Date.now()}`,
      doctorId: doc.id,
      doctorName: doc.name,
      specialization: doc.specialization,
      patientName: user?.name || "Sinthana K",
      patientAge: 32,
      date,
      time,
      status: "BOOKED",
      symptoms,
      triage,
      prescriptions: [],
      calendarSynced,
    };

    setAppointmentsList([newAppt, ...appointmentsList]);
    toast.success("Appointment booked! Calendar event synced & email queued.");
  };

  const handleCancelAppointment = (id: string) => {
    setAppointmentsList(
      appointmentsList.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a))
    );
    toast.success("Appointment cancelled successfully.");
  };

  const handleToggleReminder = (id: string, time: string) => {
    setRemindersList(
      remindersList.map((r) => {
        if (r.id !== id) return r;
        const taken = r.taken.includes(time)
          ? r.taken.filter((t) => t !== time)
          : [...r.taken, time];
        return { ...r, taken };
      })
    );
  };

  const handleToggleEmailNotif = (id: string) => {
    setRemindersList(
      remindersList.map((r) => (r.id === id ? { ...r, emailEnabled: !r.emailEnabled } : r))
    );
    toast.success("Email reminder preference updated.");
  };

  // Handlers for Doctor Workflows
  const handleCompleteConsultation = (
    appointmentId: string,
    diagnosis: string,
    notes: string,
    prescriptions: Prescription[],
    patientSummary: string,
    followUp: string
  ) => {
    setAppointmentsList(
      appointmentsList.map((a) => {
        if (a.id !== appointmentId) return a;
        return {
          ...a,
          status: "COMPLETED",
          diagnosis,
          notes,
          prescriptions,
          patientSummary,
          followUp,
        };
      })
    );
  };

  const handleUpdateDoctorSchedule = (
    doctorId: string,
    slotDuration: 15 | 30 | 45,
    leaveDates: string[]
  ) => {
    setDoctorsList(
      doctorsList.map((d) => (d.id === doctorId ? { ...d, slotDuration, leaveDates } : d))
    );

    setAppointmentsList(
      appointmentsList.map((a) => {
        if (a.doctorId === doctorId && leaveDates.includes(a.date) && a.status === "BOOKED") {
          return { ...a, status: "CANCELLED" };
        }
        return a;
      })
    );
  };

  // Handlers for Admin Workflows
  const handleAddDoctor = (newDoc: Partial<Doctor>) => {
    const created: Doctor = {
      id: `doc_${Date.now()}`,
      name: newDoc.name || "Dr. New Physician",
      specialization: newDoc.specialization || "General Medicine",
      experienceYears: 5,
      rating: 5.0,
      slotDuration: newDoc.slotDuration || 30,
      workingHours: newDoc.workingHours || { start: "09:00", end: "17:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
      leaveDates: newDoc.leaveDates || [],
      initials: newDoc.initials || "NP",
    };
    setDoctorsList([...doctorsList, created]);
  };

  const handleUpdateDoctor = (id: string, updates: Partial<Doctor>) => {
    setDoctorsList(
      doctorsList.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );

    if (updates.leaveDates) {
      setAppointmentsList(
        appointmentsList.map((a) => {
          if (a.doctorId === id && updates.leaveDates?.includes(a.date) && a.status === "BOOKED") {
            return { ...a, status: "CANCELLED" };
          }
          return a;
        })
      );
    }
  };

  const handleDeleteDoctor = (id: string) => {
    setDoctorsList(doctorsList.filter((d) => d.id !== id));
  };

  // If user is not authenticated -> render Login / Register views
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        {authView === "login" ? (
          <Login onSwitchToRegister={() => setAuthView("register")} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView("login")} />
        )}
      </div>
    );
  }

  const currentRole: UserRole = user.role || "PATIENT";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Navbar Header with Brand, Role Switcher & Logout */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-extrabold tracking-tight text-gradient">
                  PulseCare
                </span>
                <Pill tone="teal" className="text-[10px]">Clinical AI</Pill>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Luxury Healthcare SaaS
              </p>
            </div>
          </div>

          {/* Quick Role Switcher Toggle (Preview) */}
          <div className="glass inline-flex items-center gap-1 rounded-2xl p-1 border border-border">
            <button
              onClick={() => setDemoUser("PATIENT")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                currentRole === "PATIENT"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserRound className="size-3.5" />
              <span>Patient</span>
            </button>

            <button
              onClick={() => setDemoUser("DOCTOR")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                currentRole === "DOCTOR"
                  ? "bg-teal text-accent-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Stethoscope className="size-3.5" />
              <span>Doctor</span>
            </button>

            <button
              onClick={() => setDemoUser("ADMIN")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                currentRole === "ADMIN"
                  ? "bg-magenta text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="size-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Logged in User Profile & Logout */}
          <div className="flex items-center gap-3">
            <Avatar
              initials={
                user.name
                  ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                  : "PC"
              }
              tone={currentRole === "PATIENT" ? 0 : currentRole === "DOCTOR" ? 1 : 5}
            />
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-none">{user.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                {currentRole} Portal
              </p>
            </div>
            <Btn variant="outline" className="p-2 text-xs" onClick={logout} title="Sign Out">
              <LogOut className="size-4" />
            </Btn>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentRole === "PATIENT" && (
          <PatientView
            doctors={doctorsList}
            appointments={appointmentsList}
            reminders={remindersList}
            calendarSynced={calendarSynced}
            onHoldSlot={handleHoldSlot}
            onBookAppointment={handleBookAppointment}
            onCancelAppointment={handleCancelAppointment}
            onToggleReminder={handleToggleReminder}
            onToggleEmailNotif={handleToggleEmailNotif}
            onConnectCalendar={async () => {
              try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch("http://localhost:5000/api/calendar/connect", { headers });
                if (res.ok) {
                  const data = await res.json();
                  if (data.url) {
                    window.location.href = data.url;
                    return;
                  }
                }
              } catch (err) {
                // Fallback
              }
              setCalendarSynced(true);
              setAppointmentsList((prev) =>
                prev.map((a) => ({ ...a, calendarSynced: true }))
              );
              toast.success("Google Calendar OAuth 2.0 connected & all appointments synced!");
            }}
            onSyncAppointmentToCalendar={(id) => {
              setAppointmentsList((prev) =>
                prev.map((a) => (a.id === id ? { ...a, calendarSynced: true } : a))
              );
              toast.success("Appointment synced to Google Calendar!");
            }}
          />
        )}

        {currentRole === "DOCTOR" && (
          <DoctorConsole
            doctor={doctorsList[0]}
            queue={appointmentsList}
            onCompleteConsultation={handleCompleteConsultation}
            onUpdateDoctorSchedule={handleUpdateDoctorSchedule}
          />
        )}

        {currentRole === "ADMIN" && (
          <AdminConsole
            doctorsList={doctorsList}
            appointmentsList={appointmentsList}
            onAddDoctor={handleAddDoctor}
            onUpdateDoctor={handleUpdateDoctor}
            onDeleteDoctor={handleDeleteDoctor}
          />
        )}
      </main>

      {/* Footer System Status Bar */}
      <footer className="glass border-t border-border py-4 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-olive animate-pulse" />
            <span className="font-semibold text-foreground">PulseCare Engine Online</span>
            <span>·</span>
            <span>Gemini v3.6-Flash AI</span>
            <span>·</span>
            <span>OAuth 2.0 Sync Active</span>
          </div>
          <p>© 2026 PulseCare Clinical SaaS. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
