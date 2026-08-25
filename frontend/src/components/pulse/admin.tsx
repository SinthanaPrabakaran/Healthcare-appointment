import {
  Activity,
  AlertTriangle,
  CalendarX,
  CheckCircle2,
  Clock,
  Edit3,
  Plus,
  ShieldAlert,
  Stethoscope,
  Trash2,
  UserPlus,
  Users,
  ShieldCheck,
  Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  Avatar,
  Btn,
  EmptyState,
  Field,
  GlassCard,
  Modal,
  Pill,
  SectionHeading,
  StatCard,
  Tabs,
  inputClass,
} from "@/components/pulse/ui";
import {
  auditLogs,
  type AuditLog,
  type Doctor,
  type Appointment,
} from "@/lib/pulse-data";

export function AdminConsole({
  doctorsList,
  appointmentsList,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
}: {
  doctorsList: Doctor[];
  appointmentsList: Appointment[];
  onAddDoctor: (doc: Partial<Doctor>) => void;
  onUpdateDoctor: (id: string, updates: Partial<Doctor>) => void;
  onDeleteDoctor: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"Physician Directory" | "Audit Logs">("Physician Directory");

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formSpecialization, setFormSpecialization] = useState("");
  const [formDuration, setFormDuration] = useState<15 | 30 | 45>(30);
  const [formLeaveDates, setFormLeaveDates] = useState("");

  // Leave cancellation preview modal state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [pendingLeaveDocId, setPendingLeaveDocId] = useState<string | null>(null);
  const [leaveInput, setLeaveInput] = useState("");
  const [affectedCount, setAffectedCount] = useState(0);

  const filteredDoctors = doctorsList.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingDocId(null);
    setFormName("");
    setFormSpecialization("General Medicine");
    setFormDuration(30);
    setFormLeaveDates("");
    setModalOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDocId(doc.id);
    setFormName(doc.name);
    setFormSpecialization(doc.specialization);
    setFormDuration(doc.slotDuration);
    setFormLeaveDates(doc.leaveDates.join(", "));
    setModalOpen(true);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter a physician name.");
      return;
    }

    const leaveParsed = formLeaveDates
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    if (editingDocId) {
      onUpdateDoctor(editingDocId, {
        name: formName,
        specialization: formSpecialization,
        slotDuration: formDuration,
        leaveDates: leaveParsed,
      });
      toast.success("Doctor profile updated successfully!");
    } else {
      const newDoc: Partial<Doctor> = {
        name: formName,
        specialization: formSpecialization,
        slotDuration: formDuration,
        experienceYears: 5,
        rating: 5.0,
        workingHours: { start: "09:00", end: "17:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
        leaveDates: leaveParsed,
        initials: formName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "DR",
      };
      onAddDoctor(newDoc);
      toast.success("New physician registered successfully!");
    }
    setModalOpen(false);
  };

  const handleOpenLeaveModal = (doc: Doctor) => {
    setPendingLeaveDocId(doc.id);
    setLeaveInput(doc.leaveDates.join(", "));
    const count = appointmentsList.filter(
      (a) => a.doctorId === doc.id && doc.leaveDates.includes(a.date) && a.status === "BOOKED"
    ).length;
    setAffectedCount(count);
    setLeaveModalOpen(true);
  };

  const handleConfirmLeave = () => {
    if (!pendingLeaveDocId) return;
    const parsed = leaveInput
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    onUpdateDoctor(pendingLeaveDocId, { leaveDates: parsed });
    setLeaveModalOpen(false);
    toast.success("Leave dates saved & cancellation dispatches triggered for affected bookings!");
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove Dr. ${name}?`)) {
      onDeleteDoctor(id);
      toast.success(`Dr. ${name} removed from clinical directory.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold">Admin Governance Console</h1>
            <Pill tone="magenta">System Control</Pill>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Manage physician profiles, slot durations, leave cancellations, and audit telemetry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Btn variant="primary" onClick={handleOpenAdd}>
            <UserPlus className="size-4" />
            <span>Add New Doctor</span>
          </Btn>
          <Tabs
            tabs={["Physician Directory", "Audit Logs"] as const}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </GlassCard>

      {/* Global Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Stethoscope className="size-5" />}
          label="Registered Physicians"
          value={doctorsList.length}
          hint="Active clinical staff"
          tone="primary"
        />
        <StatCard
          icon={<Users className="size-5" />}
          label="Total Bookings"
          value={appointmentsList.length}
          hint="System appointments"
          tone="teal"
        />
        <StatCard
          icon={<ShieldCheck className="size-5" />}
          label="RBAC Status"
          value="JWT Active"
          hint="Role authorization"
          tone="olive"
        />
        <StatCard
          icon={<Activity className="size-5" />}
          label="Audit Telemetry"
          value={auditLogs.length}
          hint="Log records"
          tone="violet"
        />
      </div>

      {/* TAB 1: Physician Directory */}
      {activeTab === "Physician Directory" && (
        <div className="space-y-4">
          <SectionHeading
            title="Clinical Directory & Schedule Management"
            subtitle="Search, configure slot durations, and manage physician leave schedules"
          />

          {/* Search Bar */}
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by physician name or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>

          {filteredDoctors.length === 0 ? (
            <EmptyState
              icon={<Stethoscope className="size-6" />}
              text="No physicians matched your search criteria."
            />
          ) : (
            <div className="glass rounded-2xl overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/70 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border">
                    <tr>
                      <th className="p-4">Physician</th>
                      <th className="p-4">Specialization</th>
                      <th className="p-4">Slot Duration</th>
                      <th className="p-4">Leave Schedule</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDoctors.map((doc, idx) => (
                      <tr key={doc.id} className="hover:bg-secondary/40 transition">
                        <td className="p-4 flex items-center gap-3">
                          <Avatar initials={doc.initials} tone={idx} />
                          <div>
                            <p className="font-bold text-sm text-foreground">{doc.name}</p>
                            <p className="text-muted-foreground text-[11px]">
                              {doc.experienceYears} Yrs Exp · Rating ⭐ {doc.rating}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Pill tone="teal">{doc.specialization}</Pill>
                        </td>
                        <td className="p-4 font-semibold text-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5 text-primary" />
                            <span>{doc.slotDuration} mins</span>
                          </span>
                        </td>
                        <td className="p-4">
                          {doc.leaveDates.length > 0 ? (
                            <span className="text-gold font-bold">{doc.leaveDates.join(", ")}</span>
                          ) : (
                            <span className="text-muted-foreground">None scheduled</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Btn variant="outline" className="px-3 py-1 text-xs" onClick={() => handleOpenEdit(doc)}>
                            <Edit3 className="size-3.5" />
                            <span>Edit</span>
                          </Btn>
                          <Btn variant="ghost" className="px-3 py-1 text-xs text-gold" onClick={() => handleOpenLeaveModal(doc)}>
                            <CalendarX className="size-3.5" />
                            <span>Leave</span>
                          </Btn>
                          <Btn variant="danger" className="px-3 py-1 text-xs" onClick={() => handleDelete(doc.id, doc.name)}>
                            <Trash2 className="size-3.5" />
                          </Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: System Audit Telemetry */}
      {activeTab === "Audit Logs" && (
        <div className="space-y-4">
          <SectionHeading
            title="System Audit & Dispatch Telemetry"
            subtitle="Immutable activity stream tracking consultation events, AI runs, and email dispatches"
          />

          <div className="glass rounded-2xl overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/70 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Actor</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Target Resource</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-secondary/40 transition">
                      <td className="p-4 text-muted-foreground font-mono">{log.at}</td>
                      <td className="p-4 font-bold text-foreground">{log.actor}</td>
                      <td className="p-4 font-semibold">{log.action}</td>
                      <td className="p-4 text-muted-foreground">{log.target}</td>
                      <td className="p-4 text-right">
                        <Pill tone={log.status === "SUCCESS" ? "olive" : "gold"}>
                          {log.status}
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Physician Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDocId ? "Edit Physician Profile" : "Register New Physician"}
        subtitle="Configure clinical credentials, specialization, and slot duration"
      >
        <form onSubmit={handleSaveDoctor} className="space-y-4">
          <Field label="Physician Name *">
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Dr. Sarah Jenkins"
              className={inputClass}
            />
          </Field>

          <Field label="Specialization">
            <select
              value={formSpecialization}
              onChange={(e) => setFormSpecialization(e.target.value)}
              className={inputClass}
            >
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Neurology">Neurology</option>
              <option value="General Medicine">General Medicine</option>
            </select>
          </Field>

          <Field label="Slot Duration (Minutes)">
            <select
              value={formDuration}
              onChange={(e) => setFormDuration(Number(e.target.value) as 15 | 30 | 45)}
              className={inputClass}
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
            </select>
          </Field>

          <Field label="Leave Dates (Comma-separated YYYY-MM-DD)">
            <input
              type="text"
              value={formLeaveDates}
              onChange={(e) => setFormLeaveDates(e.target.value)}
              placeholder="2026-08-30, 2026-09-02"
              className={inputClass}
            />
          </Field>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Btn variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Btn>
            <Btn variant="primary" type="submit">
              Save Physician Profile
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Leave Cancellation Preview Modal */}
      <Modal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Admin Leave Management & Cancellation Alert"
        subtitle="Review cancellation impact on booked patient appointments"
      >
        <div className="space-y-4">
          <Field label="Leave Dates (Comma-separated YYYY-MM-DD)">
            <input
              type="text"
              value={leaveInput}
              onChange={(e) => setLeaveInput(e.target.value)}
              placeholder="2026-08-30, 2026-09-02"
              className={inputClass}
            />
          </Field>

          {affectedCount > 0 ? (
            <div className="glass p-4 rounded-xl border border-destructive/30 bg-destructive/10 space-y-2">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                <ShieldAlert className="size-5" />
                <span>Impact Alert: {affectedCount} Patient Booking(s) Affected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Saving these leave dates will automatically set affected booked appointments to CANCELLED and dispatch cancellation emails to patients via Nodemailer.
              </p>
            </div>
          ) : (
            <div className="glass p-4 rounded-xl border border-olive/30 bg-olive/10 space-y-2">
              <div className="flex items-center gap-2 text-olive font-bold text-sm">
                <CheckCircle2 className="size-5" />
                <span>No Bookings Affected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                No patient bookings fall on the specified leave dates.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Btn variant="outline" onClick={() => setLeaveModalOpen(false)}>
              Cancel
            </Btn>
            <Btn variant="danger" onClick={handleConfirmLeave}>
              Save Leave & Dispatch Notifications
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
