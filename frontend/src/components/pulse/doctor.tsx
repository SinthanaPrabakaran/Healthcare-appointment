import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Sparkles,
  Stethoscope,
  Trash2,
  UserCheck,
  Users,
  CalendarX,
  ShieldAlert
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
  StatusBadge,
  Tabs,
  UrgencyBadge,
  inputClass,
} from "@/components/pulse/ui";
import {
  buildPatientSummary,
  type Appointment,
  type Doctor,
  type Prescription,
} from "@/lib/pulse-data";

export function DoctorConsole({
  doctor,
  queue,
  onCompleteConsultation,
  onUpdateDoctorSchedule,
}: {
  doctor: Doctor;
  queue: Appointment[];
  onCompleteConsultation: (
    appointmentId: string,
    diagnosis: string,
    notes: string,
    prescriptions: Prescription[],
    patientSummary: string,
    followUp: string
  ) => void;
  onUpdateDoctorSchedule: (
    doctorId: string,
    slotDuration: 15 | 30 | 45,
    leaveDates: string[]
  ) => void;
}) {
  const [activeTab, setActiveTab] = useState<"Today's Queue" | "Consultation Room" | "Schedule Settings">("Today's Queue");
  const [selectedApptId, setSelectedApptId] = useState<string | null>(queue[0]?.id || null);
  const [queueFilter, setQueueFilter] = useState<"All" | "BOOKED" | "HELD" | "COMPLETED">("All");

  // Schedule modal states
  const [slotDuration, setSlotDuration] = useState<15 | 30 | 45>(doctor.slotDuration);
  const [leaveDatesInput, setLeaveDatesInput] = useState<string>(doctor.leaveDates.join(", "));
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [affectedCount, setAffectedCount] = useState(0);

  const selectedAppt = queue.find((a) => a.id === selectedApptId) || queue[0];

  // Metrics calculation
  const totalToday = queue.length;
  const pendingCount = queue.filter((a) => a.status === "BOOKED" || a.status === "HELD").length;
  const completedCount = queue.filter((a) => a.status === "COMPLETED").length;
  const urgentCount = queue.filter((a) => a.triage?.urgency === "HIGH").length;

  const filteredQueue = queue.filter((a) => {
    if (queueFilter === "All") return true;
    return a.status === queueFilter;
  });

  // Consultation state
  const [diagnosis, setDiagnosis] = useState(selectedAppt?.diagnosis || "");
  const [notes, setNotes] = useState(selectedAppt?.notes || "");
  const [followUp, setFollowUp] = useState(selectedAppt?.followUp || "");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(
    selectedAppt?.prescriptions?.length
      ? selectedAppt.prescriptions
      : [
          {
            id: "rx_new_1",
            medicine: "Paracetamol",
            dosage: "500 mg",
            frequency: "Three times daily after meals",
            duration: "5 days",
            instructions: "Only if fever > 100F",
          },
        ]
  );
  const [aiSummary, setAiSummary] = useState(selectedAppt?.patientSummary || "");

  const handleSelectConsultation = (appt: Appointment) => {
    setSelectedApptId(appt.id);
    setDiagnosis(appt.diagnosis || "");
    setNotes(appt.notes || "");
    setFollowUp(appt.followUp || "");
    setPrescriptions(
      appt.prescriptions?.length
        ? appt.prescriptions
        : [
            {
              id: `rx_${Date.now()}`,
              medicine: "Paracetamol",
              dosage: "500 mg",
              frequency: "Three times daily",
              duration: "5 days",
              instructions: "After meals",
            },
          ]
    );
    setAiSummary(appt.patientSummary || "");
    setActiveTab("Consultation Room");
  };

  const handleAddMedicine = () => {
    setPrescriptions([
      ...prescriptions,
      {
        id: `rx_${Date.now()}_${Math.random()}`,
        medicine: "",
        dosage: "",
        frequency: "Twice daily",
        duration: "5 days",
        instructions: "",
      },
    ]);
  };

  const handleRemoveMedicine = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  };

  const handleUpdateMedicine = (id: string, field: keyof Prescription, val: string) => {
    setPrescriptions(
      prescriptions.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleGenerateSummary = () => {
    const generated = buildPatientSummary(diagnosis, notes, prescriptions, followUp);
    setAiSummary(generated);
    toast.success("Gemini AI patient-friendly summary generated!");
  };

  const handleFinishConsultation = () => {
    if (!selectedAppt) return;
    if (!notes.trim()) {
      toast.error("Please record clinical assessment notes before completing.");
      return;
    }
    const finalSummary = aiSummary || buildPatientSummary(diagnosis, notes, prescriptions, followUp);
    onCompleteConsultation(
      selectedAppt.id,
      diagnosis,
      notes,
      prescriptions,
      finalSummary,
      followUp
    );
    toast.success("Consultation completed & digital prescription issued!");
    setActiveTab("Today's Queue");
  };

  const handlePreviewLeave = () => {
    const parsed = leaveDatesInput
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    
    // Count affected patient bookings
    const count = queue.filter((a) => parsed.includes(a.date) && a.status === "BOOKED").length;
    setAffectedCount(count);
    setLeaveModalOpen(true);
  };

  const handleConfirmSaveSchedule = () => {
    const parsed = leaveDatesInput
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    onUpdateDoctorSchedule(doctor.id, slotDuration, parsed);
    setLeaveModalOpen(false);
    toast.success("Physician schedule & slot duration updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar initials={doctor.initials} tone={1} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{doctor.name}</h1>
              <Pill tone="teal">{doctor.specialization}</Pill>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Clinical Workspace · {doctor.experienceYears} Yrs Exp · Slot Duration:{" "}
              <strong className="text-foreground">{doctor.slotDuration} mins</strong>
            </p>
          </div>
        </div>
        <Tabs
          tabs={["Today's Queue", "Consultation Room", "Schedule Settings"] as const}
          value={activeTab}
          onChange={setActiveTab}
        />
      </GlassCard>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Users className="size-5" />}
          label="Today's Visits"
          value={totalToday}
          hint="Total scheduled"
          tone="primary"
        />
        <StatCard
          icon={<Clock className="size-5" />}
          label="Pending Queue"
          value={pendingCount}
          hint="Awaiting consultation"
          tone="gold"
        />
        <StatCard
          icon={<UserCheck className="size-5" />}
          label="Completed"
          value={completedCount}
          hint="Discharged today"
          tone="olive"
        />
        <StatCard
          icon={<AlertTriangle className="size-5" />}
          label="Urgent Cases"
          value={urgentCount}
          hint="High priority triage"
          tone="magenta"
        />
      </div>

      {/* TAB 1: Today's Queue */}
      {activeTab === "Today's Queue" && (
        <div className="space-y-4">
          <SectionHeading
            title="Patient Consultation Queue"
            subtitle="Real-time timeline of today's scheduled patient visits"
            action={
              <Tabs
                tabs={["All", "BOOKED", "HELD", "COMPLETED"] as const}
                value={queueFilter}
                onChange={setQueueFilter}
              />
            }
          />

          {filteredQueue.length === 0 ? (
            <EmptyState
              icon={<Users className="size-6" />}
              text="No patient appointments found matching the selected filter."
            />
          ) : (
            <div className="grid gap-4">
              {filteredQueue.map((appt) => (
                <GlassCard
                  key={appt.id}
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <Avatar initials={appt.patientName.slice(0, 2).toUpperCase()} tone={0} />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display font-semibold text-lg">{appt.patientName}</h3>
                        <span className="text-xs text-muted-foreground">({appt.patientAge} yrs)</span>
                        <StatusBadge status={appt.status} />
                        {appt.triage?.urgency && <UrgencyBadge level={appt.triage.urgency} />}
                      </div>

                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="size-3.5 text-accent-foreground" />
                        <span>{appt.time}</span>
                        <span>·</span>
                        <span>{appt.specialization}</span>
                      </p>

                      <p className="text-xs text-muted-foreground line-clamp-1 italic bg-secondary/50 p-2 rounded-lg mt-2">
                        "{appt.symptoms}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Btn
                      variant={appt.status === "COMPLETED" ? "outline" : "primary"}
                      onClick={() => handleSelectConsultation(appt)}
                    >
                      <Stethoscope className="size-4" />
                      <span>{appt.status === "COMPLETED" ? "View Records" : "Consult Room"}</span>
                    </Btn>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Consultation Suite */}
      {activeTab === "Consultation Room" && selectedAppt && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Patient File & AI Pre-Visit Triage */}
          <div className="space-y-4 lg:col-span-5">
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={selectedAppt.patientName.slice(0, 2).toUpperCase()} tone={2} />
                  <div>
                    <h3 className="font-display font-semibold text-lg">{selectedAppt.patientName}</h3>
                    <p className="text-xs text-muted-foreground">
                      Age: {selectedAppt.patientAge} · Visit: {selectedAppt.time}
                    </p>
                  </div>
                </div>
                <StatusBadge status={selectedAppt.status} />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Logged Symptoms
                </p>
                <p className="text-xs bg-secondary/80 p-3 rounded-xl border border-border">
                  {selectedAppt.symptoms}
                </p>
              </div>

              {/* Gemini AI Pre-Visit Triage Card */}
              {selectedAppt.triage && (
                <div className="glass gradient-ring rounded-xl p-4 space-y-3 bg-accent/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="size-4 text-accent-foreground animate-pulse" />
                      <span>Gemini AI Pre-Visit Triage</span>
                    </span>
                    <UrgencyBadge level={selectedAppt.triage.urgency} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Chief Complaint Summary
                    </p>
                    <p className="text-xs font-medium text-foreground">
                      {selectedAppt.triage.chiefComplaint}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Suggested Diagnostic Questions
                    </p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {selectedAppt.triage.questions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-primary font-bold">?</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column: Live Clinical Workspace */}
          <div className="space-y-4 lg:col-span-7">
            <GlassCard className="space-y-5">
              <SectionHeading
                title="Clinical Suite & Prescription"
                subtitle="Record diagnosis notes, build digital prescriptions, and issue patient summary"
              />

              <Field label="Diagnosis">
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                  className={inputClass}
                />
              </Field>

              <Field label="Clinical Assessment & Doctor Notes *">
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detailed clinical evaluation, examination findings, and treatment plan..."
                  className={inputClass}
                />
              </Field>

              {/* Dynamic Prescription Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="size-4 text-primary" />
                    <span>Digital Prescription Builder</span>
                  </span>
                  <Btn variant="outline" className="text-xs py-1 px-3" onClick={handleAddMedicine}>
                    <Plus className="size-3.5" />
                    <span>Add Medicine</span>
                  </Btn>
                </div>

                <div className="space-y-3">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="glass p-3 rounded-xl space-y-2 relative border border-border">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="Medicine Name"
                          value={rx.medicine}
                          onChange={(e) => handleUpdateMedicine(rx.id, "medicine", e.target.value)}
                          className={inputClass}
                        />
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 500mg)"
                          value={rx.dosage}
                          onChange={(e) => handleUpdateMedicine(rx.id, "dosage", e.target.value)}
                          className={inputClass}
                        />
                        <input
                          type="text"
                          placeholder="Frequency (e.g. 2x daily)"
                          value={rx.frequency}
                          onChange={(e) => handleUpdateMedicine(rx.id, "frequency", e.target.value)}
                          className={inputClass}
                        />
                        <div className="flex gap-1">
                          <input
                            type="text"
                            placeholder="Duration (5 days)"
                            value={rx.duration}
                            onChange={(e) => handleUpdateMedicine(rx.id, "duration", e.target.value)}
                            className={inputClass}
                          />
                          <button
                            onClick={() => handleRemoveMedicine(rx.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Field label="Follow-up Instructions">
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="e.g. Review in 5 days if symptoms persist. Drink warm fluids."
                  className={inputClass}
                />
              </Field>

              {/* Gemini AI Plain Language Summary */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="size-4 text-accent-foreground animate-pulse" />
                    <span>Gemini AI Patient Summary</span>
                  </span>
                  <Btn variant="aqua" className="text-xs py-1 px-3" onClick={handleGenerateSummary}>
                    <span>Auto-Generate</span>
                  </Btn>
                </div>
                {aiSummary && (
                  <p className="text-xs italic bg-secondary/80 p-3 rounded-xl border border-border">
                    "{aiSummary}"
                  </p>
                )}
              </div>

              <Btn
                variant="primary"
                className="w-full py-3 text-base font-bold shadow-lg"
                onClick={handleFinishConsultation}
              >
                <CheckCircle2 className="size-5" />
                <span>Complete Consultation & Issue Digital Prescription</span>
              </Btn>
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 3: Schedule Settings */}
      {activeTab === "Schedule Settings" && (
        <GlassCard className="max-w-2xl mx-auto space-y-6">
          <SectionHeading
            title="Physician Working Hours & Leave Settings"
            subtitle="Configure consultation slot duration and mark planned leave dates"
          />

          <Field label="Slot Duration (Minutes)">
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value) as 15 | 30 | 45)}
              className={inputClass}
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes (Recommended)</option>
              <option value={45}>45 Minutes</option>
            </select>
          </Field>

          <Field
            label="Planned Leave Dates (Comma-separated YYYY-MM-DD)"
            hint="Marking leave dates will check for affected patient bookings"
          >
            <input
              type="text"
              value={leaveDatesInput}
              onChange={(e) => setLeaveDatesInput(e.target.value)}
              placeholder="2026-08-30, 2026-09-02"
              className={inputClass}
            />
          </Field>

          <Btn variant="primary" className="w-full py-3" onClick={handlePreviewLeave}>
            <CalendarX className="size-4" />
            <span>Save Schedule & Check Affected Appointments</span>
          </Btn>
        </GlassCard>
      )}

      {/* Leave Confirmation & Cancellation Preview Modal */}
      <Modal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Confirm Schedule Update & Leave Dates"
        subtitle="Review cancellation alerts for affected patient bookings"
      >
        <div className="space-y-4">
          {affectedCount > 0 ? (
            <div className="glass p-4 rounded-xl border border-destructive/30 bg-destructive/10 space-y-2">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                <ShieldAlert className="size-5" />
                <span>Warning: {affectedCount} Patient Appointment(s) Will Be Cancelled</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Marking these leave dates will automatically set affected booked appointments to CANCELLED and trigger automated email notification dispatches via Nodemailer.
              </p>
            </div>
          ) : (
            <div className="glass p-4 rounded-xl border border-olive/30 bg-olive/10 space-y-2">
              <div className="flex items-center gap-2 text-olive font-bold text-sm">
                <CheckCircle2 className="size-5" />
                <span>No Patient Bookings Affected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                There are no existing patient appointments scheduled on the selected leave dates.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Btn variant="outline" onClick={() => setLeaveModalOpen(false)}>
              Cancel
            </Btn>
            <Btn variant="danger" onClick={handleConfirmSaveSchedule}>
              Confirm Schedule Update
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
