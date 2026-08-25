import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGoogleCalendarUrl(appointment: { doctorName: string; date: string; time: string; symptoms?: string }) {
  const title = encodeURIComponent(`Consultation with ${appointment.doctorName}`);
  const details = encodeURIComponent(`Medical consultation appointment with ${appointment.doctorName}.\nSymptoms: ${appointment.symptoms || "N/A"}`);
  
  const dateClean = (appointment.date || new Date().toISOString().slice(0, 10)).replace(/-/g, "");
  
  let hours = 10;
  let minutes = 0;
  if (appointment.time) {
    const parts = appointment.time.trim().split(" ");
    if (parts.length >= 2) {
      const [hStr, mStr] = parts[0].split(":");
      hours = parseInt(hStr, 10) || 10;
      minutes = parseInt(mStr, 10) || 0;
      if (parts[1].toUpperCase() === "PM" && hours < 12) hours += 12;
      if (parts[1].toUpperCase() === "AM" && hours === 12) hours = 0;
    }
  }

  const startTime = `${dateClean}T${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}00`;
  
  let endHours = hours;
  let endMinutes = minutes + 30;
  if (endMinutes >= 60) {
    endHours += 1;
    endMinutes -= 60;
  }
  const endTime = `${dateClean}T${String(endHours).padStart(2, "0")}${String(endMinutes).padStart(2, "0")}00`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&ctz=Asia/Kolkata`;
}

export function openGoogleCalendarEvent(appointment: { doctorName: string; date: string; time: string; symptoms?: string }) {
  const url = getGoogleCalendarUrl(appointment);
  window.open(url, "_blank", "noopener,noreferrer");
}
