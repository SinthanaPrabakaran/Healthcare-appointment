/**
 * PulseCare mock data layer.
 * Shapes mirror the REST API contract so components can be swapped to live
 * fetches without prop changes:
 *   GET  /api/doctors
 *   GET  /api/doctors/:id/slots?date=YYYY-MM-DD
 *   POST /api/appointments/hold
 *   POST /api/appointments/:id/confirm
 *   GET  /api/appointments/my | /api/appointments/doctor
 *   GET  /api/appointments/:id/previsit-summary
 *   POST /api/appointments/:id/complete
 *   GET  /api/calendar/status | POST /api/calendar/connect
 */

export type Role = "patient" | "doctor" | "admin";
export type Urgency = "LOW" | "MEDIUM" | "HIGH";
export type AppointmentStatus = "BOOKED" | "HELD" | "COMPLETED" | "CANCELLED";
export type SlotState = "AVAILABLE" | "BOOKED" | "HELD";

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experienceYears: number;
  rating: number;
  slotDuration: 15 | 30 | 45;
  workingHours: { start: string; end: string; days: string[] };
  leaveDates: string[];
  initials: string;
}

export interface Slot {
  time: string;
  state: SlotState;
}

export interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Triage {
  urgency: Urgency;
  chiefComplaint: string;
  questions: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  patientName: string;
  patientAge: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  symptoms: string;
  triage?: Triage;
  notes?: string;
  diagnosis?: string;
  patientSummary?: string;
  followUp?: string;
  prescriptions: Prescription[];
  calendarSynced?: boolean;
}

export interface MedicationReminder {
  id: string;
  medicine: string;
  dosage: string;
  times: string[];
  taken: string[];
  emailEnabled: boolean;
}

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  status: "SUCCESS" | "WARN";
}

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const TODAY = iso(0);

export const doctors: Doctor[] = [
  {
    id: "doc_1",
    name: "Dr. Ananya Rao",
    specialization: "Cardiology",
    experienceYears: 12,
    rating: 4.9,
    slotDuration: 30,
    workingHours: { start: "09:00", end: "17:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    leaveDates: [iso(4)],
    initials: "AR",
  },
  {
    id: "doc_2",
    name: "Dr. Marcus Lin",
    specialization: "Dermatology",
    experienceYears: 8,
    rating: 4.7,
    slotDuration: 15,
    workingHours: { start: "10:00", end: "16:00", days: ["Mon", "Wed", "Fri"] },
    leaveDates: [iso(2)],
    initials: "ML",
  },
  {
    id: "doc_3",
    name: "Dr. Priya Menon",
    specialization: "Pediatrics",
    experienceYears: 15,
    rating: 4.8,
    slotDuration: 30,
    workingHours: { start: "09:00", end: "15:00", days: ["Tue", "Wed", "Thu", "Sat"] },
    leaveDates: [],
    initials: "PM",
  },
  {
    id: "doc_4",
    name: "Dr. Samuel Osei",
    specialization: "Orthopedics",
    experienceYears: 20,
    rating: 4.6,
    slotDuration: 45,
    workingHours: { start: "08:00", end: "14:00", days: ["Mon", "Tue", "Thu"] },
    leaveDates: [iso(6)],
    initials: "SO",
  },
  {
    id: "doc_5",
    name: "Dr. Elena Whitfield",
    specialization: "Neurology",
    experienceYears: 10,
    rating: 4.9,
    slotDuration: 30,
    workingHours: { start: "11:00", end: "18:00", days: ["Mon", "Tue", "Wed", "Fri"] },
    leaveDates: [],
    initials: "EW",
  },
  {
    id: "doc_6",
    name: "Dr. Hana Suzuki",
    specialization: "General Medicine",
    experienceYears: 6,
    rating: 4.5,
    slotDuration: 15,
    workingHours: { start: "09:00", end: "17:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    leaveDates: [],
    initials: "HS",
  },
];

export const specializations = [
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Neurology",
  "General Medicine",
];

/** Mirrors GET /api/doctors/:id/slots?date=YYYY-MM-DD */
export function generateSlots(doctor: Doctor, date: string): Slot[] {
  const [sh = 9, sm = 0] = doctor.workingHours.start.split(":").map(Number);
  const [eh = 17] = doctor.workingHours.end.split(":").map(Number);
  const slots: Slot[] = [];
  let minutes = sh * 60 + sm;

  const end = eh * 60;
  let seed = [...date, ...doctor.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  while (minutes < end) {
    seed = (seed * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const label = `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
    slots.push({ time: label, state: r < 0.24 ? "BOOKED" : r > 0.94 ? "HELD" : "AVAILABLE" });
    minutes += doctor.slotDuration;
  }
  return slots;
}

export const initialAppointments: Appointment[] = [
  {
    id: "apt_1001",
    doctorId: "doc_1",
    doctorName: "Dr. Ananya Rao",
    specialization: "Cardiology",
    patientName: "Sinthana K",
    patientAge: 32,
    date: iso(1),
    time: "10:30 AM",
    status: "BOOKED",
    symptoms:
      "Intermittent chest tightness while climbing stairs for the past 8 days, mild shortness of breath, no radiating pain.",
    triage: {
      urgency: "HIGH",
      chiefComplaint:
        "Exertional chest tightness with dyspnoea over 8 days — needs cardiac risk evaluation.",
      questions: [
        "Does the tightness resolve within minutes of resting?",
        "Any family history of coronary artery disease before age 60?",
        "Have you noticed palpitations, dizziness or night-time breathlessness?",
      ],
    },
    prescriptions: [],
    calendarSynced: true,
  },
  {
    id: "apt_1002",
    doctorId: "doc_2",
    doctorName: "Dr. Marcus Lin",
    specialization: "Dermatology",
    patientName: "Sinthana K",
    patientAge: 32,
    date: iso(3),
    time: "11:15 AM",
    status: "BOOKED",
    symptoms: "Recurring itchy rash on both forearms, worse after sun exposure.",
    triage: {
      urgency: "LOW",
      chiefComplaint: "Photo-aggravated pruritic rash on forearms, recurring for 3 weeks.",
      questions: [
        "Any new detergents, sunscreens or topical products recently?",
        "Does the rash blister or only redden?",
        "Any joint pain or fever alongside the rash?",
      ],
    },
    prescriptions: [],
  },
  {
    id: "apt_0998",
    doctorId: "doc_6",
    doctorName: "Dr. Hana Suzuki",
    specialization: "General Medicine",
    patientName: "Sinthana K",
    patientAge: 32,
    date: iso(-6),
    time: "09:30 AM",
    status: "COMPLETED",
    symptoms: "Fever 101F for three days with sore throat and body ache.",
    triage: {
      urgency: "MEDIUM",
      chiefComplaint: "Acute febrile illness with pharyngitis, 3 days duration.",
      questions: [
        "Any difficulty swallowing liquids?",
        "Recent contact with someone with similar symptoms?",
        "Any rash or ear pain?",
      ],
    },
    diagnosis: "Acute viral pharyngitis",
    notes:
      "Throat mildly erythematous, no exudate. Chest clear. Vitals stable. Advised supportive care and hydration; return if fever persists beyond 48h.",
    patientSummary:
      "You have a throat infection caused by a virus. It usually clears on its own in a few days. Take the fever medicine when your temperature rises, drink plenty of warm fluids, and rest. If your fever stays above 100F after two more days, or swallowing becomes painful, please come back.",
    followUp: "Review in 5 days if symptoms persist. Gargle with warm salt water twice daily.",
    prescriptions: [
      {
        id: "rx_1",
        medicine: "Paracetamol",
        dosage: "500 mg",
        frequency: "Three times daily after meals",
        duration: "5 days",
        instructions: "Only if temperature is above 100F",
      },
      {
        id: "rx_2",
        medicine: "Cetirizine",
        dosage: "10 mg",
        frequency: "Once at night",
        duration: "5 days",
        instructions: "May cause drowsiness",
      },
    ],
    calendarSynced: true,
  },
  {
    id: "apt_0995",
    doctorId: "doc_4",
    doctorName: "Dr. Samuel Osei",
    specialization: "Orthopedics",
    patientName: "Sinthana K",
    patientAge: 32,
    date: iso(-14),
    time: "08:45 AM",
    status: "CANCELLED",
    symptoms: "Left knee pain after running.",
    prescriptions: [],
  },
];

/** Mirrors GET /api/appointments/doctor for the signed-in doctor. */
export const doctorQueue: Appointment[] = [
  {
    id: "apt_2001",
    doctorId: "doc_1",
    doctorName: "Dr. Ananya Rao",
    specialization: "Cardiology",
    patientName: "Rahul Verma",
    patientAge: 54,
    date: TODAY,
    time: "09:00 AM",
    status: "COMPLETED",
    symptoms: "Follow-up for hypertension, occasional morning headaches.",
    triage: {
      urgency: "MEDIUM",
      chiefComplaint: "Hypertension follow-up with morning headaches.",
      questions: [
        "What are your home BP readings this week?",
        "Any missed doses of the current medication?",
        "Any visual disturbance with the headaches?",
      ],
    },
    diagnosis: "Essential hypertension, sub-optimally controlled",
    prescriptions: [],
  },
  {
    id: "apt_2002",
    doctorId: "doc_1",
    doctorName: "Dr. Ananya Rao",
    specialization: "Cardiology",
    patientName: "Sinthana K",
    patientAge: 32,
    date: TODAY,
    time: "10:30 AM",
    status: "BOOKED",
    symptoms:
      "Intermittent chest tightness while climbing stairs for the past 8 days, mild shortness of breath.",
    triage: {
      urgency: "HIGH",
      chiefComplaint:
        "Exertional chest tightness with dyspnoea over 8 days — needs cardiac risk evaluation.",
      questions: [
        "Does the tightness resolve within minutes of resting?",
        "Any family history of coronary artery disease before age 60?",
        "Have you noticed palpitations, dizziness or night-time breathlessness?",
      ],
    },
    prescriptions: [],
  },
  {
    id: "apt_2003",
    doctorId: "doc_1",
    doctorName: "Dr. Ananya Rao",
    specialization: "Cardiology",
    patientName: "Nadia Haddad",
    patientAge: 41,
    date: TODAY,
    time: "11:30 AM",
    status: "BOOKED",
    symptoms: "Palpitations at rest, 2-3 episodes daily, each lasting under a minute.",
    triage: {
      urgency: "MEDIUM",
      chiefComplaint: "Short self-limiting palpitation episodes at rest.",
      questions: [
        "Any caffeine, thyroid medication or stimulant use?",
        "Do episodes start and stop abruptly?",
        "Any fainting or near-fainting?",
      ],
    },
    prescriptions: [],
  },
  {
    id: "apt_2004",
    doctorId: "doc_1",
    doctorName: "Dr. Ananya Rao",
    specialization: "Cardiology",
    patientName: "Tobias Kern",
    patientAge: 67,
    date: TODAY,
    time: "02:00 PM",
    status: "HELD",
    symptoms: "Swelling in both ankles for a week, worse in the evening.",
    triage: {
      urgency: "HIGH",
      chiefComplaint: "Bilateral pedal oedema for one week — evaluate cardiac failure risk.",
      questions: [
        "Any weight gain over the last two weeks?",
        "Do you sleep propped up on pillows?",
        "Any reduction in urine output?",
      ],
    },
    prescriptions: [],
  },
];

export const initialReminders: MedicationReminder[] = [
  {
    id: "rem_1",
    medicine: "Paracetamol",
    dosage: "500 mg",
    times: ["08:00 AM", "02:00 PM", "09:00 PM"],
    taken: ["08:00 AM"],
    emailEnabled: true,
  },
  {
    id: "rem_2",
    medicine: "Cetirizine",
    dosage: "10 mg",
    times: ["10:00 PM"],
    taken: [],
    emailEnabled: true,
  },
  {
    id: "rem_3",
    medicine: "Vitamin D3",
    dosage: "60000 IU",
    times: ["09:00 AM"],
    taken: ["09:00 AM"],
    emailEnabled: false,
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "log_1",
    at: `${TODAY} 09:42`,
    actor: "Dr. Ananya Rao",
    action: "Consultation completed",
    target: "apt_2001 · Rahul Verma",
    status: "SUCCESS",
  },
  {
    id: "log_2",
    at: `${TODAY} 09:15`,
    actor: "Sinthana K",
    action: "Slot hold created (5 min TTL)",
    target: "apt_2002 · Dr. Ananya Rao",
    status: "SUCCESS",
  },
  {
    id: "log_3",
    at: `${TODAY} 08:58`,
    actor: "System · Gemini",
    action: "Pre-visit triage generated",
    target: "apt_2004 · Tobias Kern",
    status: "SUCCESS",
  },
  {
    id: "log_4",
    at: `${iso(-1)} 18:20`,
    actor: "System · Nodemailer",
    action: "Reminder email dispatch",
    target: "3 recipients",
    status: "SUCCESS",
  },
  {
    id: "log_5",
    at: `${iso(-1)} 16:02`,
    actor: "Admin",
    action: "Leave marked · 2 appointments cancelled",
    target: "Dr. Marcus Lin",
    status: "WARN",
  },
  {
    id: "log_6",
    at: `${iso(-2)} 11:11`,
    actor: "System · Google Calendar",
    action: "Token refresh failed, retried",
    target: "patient_88",
    status: "WARN",
  },
];

const HIGH = ["chest", "breath", "bleeding", "faint", "numb", "severe", "swelling", "vision"];
const MEDIUM = ["fever", "pain", "cough", "vomit", "headache", "dizzy", "rash", "infection"];

/** Local stand-in for POST /api/appointments/:id/previsit-summary (Gemini). */
export function triageFromSymptoms(symptoms: string, specialization: string): Triage {
  const text = symptoms.toLowerCase();
  const urgency: Urgency = HIGH.some((k) => text.includes(k))
    ? "HIGH"
    : MEDIUM.some((k) => text.includes(k))
      ? "MEDIUM"
      : "LOW";
  const trimmed = symptoms.trim().replace(/\s+/g, " ");
  const short = trimmed.length > 150 ? `${trimmed.slice(0, 147)}...` : trimmed;
  return {
    urgency,
    chiefComplaint: short
      ? `${short} — flagged for ${specialization.toLowerCase()} review.`
      : `Consultation request for ${specialization.toLowerCase()}.`,
    questions: [
      "When did the symptoms first appear, and are they getting worse?",
      "Which medications or remedies have you already tried?",
      urgency === "HIGH"
        ? "Have you had any episode of fainting, severe breathlessness or bleeding?"
        : "Any known allergies or existing long-term conditions?",
    ],
  };
}

/** Local stand-in for the Gemini plain-language patient summary. */
export function buildPatientSummary(
  diagnosis: string,
  notes: string,
  prescriptions: Prescription[],
  followUp: string,
): string {
  const meds = prescriptions.filter((p) => p.medicine.trim());
  const medLine = meds.length
    ? `Your medicines: ${meds
        .map((m) => `${m.medicine} ${m.dosage} — ${m.frequency.toLowerCase() || "as advised"}`)
        .join("; ")}.`
    : "No medicines were prescribed today.";
  return [
    `In simple terms: ${diagnosis || "the doctor reviewed your symptoms"}.`,
    notes ? `What the doctor found: ${notes}` : "",
    medLine,
    followUp ? `Next steps: ${followUp}` : "Come back if anything feels worse.",
  ]
    .filter(Boolean)
    .join(" ");
}
