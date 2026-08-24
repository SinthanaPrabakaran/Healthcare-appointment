import EmailNotification from '../models/EmailNotification.js';
import {
  bookingConfirmationTemplate,
  doctorBookingNotificationTemplate,
  cancellationTemplate,
  appointmentReminderTemplate,
  doctorLeaveTemplate,
  medicationReminderTemplate
} from './emailService.js';

export const createBookingConfirmationNotifications = async (appointment) => {
  try {
    if (!appointment || !appointment.patient || !appointment.doctor) return;

    const patient = appointment.patient;
    const doctor = appointment.doctor;
    const doctorUser = doctor.userId;

    if (!patient.email || !doctorUser || !doctorUser.email) return;

    // 1. Patient Notification
    const patientExists = await EmailNotification.exists({
      appointment: appointment._id,
      notificationType: 'BOOKING_CONFIRMATION',
      recipient: patient.email
    });

    if (!patientExists) {
      const pTmpl = bookingConfirmationTemplate({
        patientName: patient.name,
        doctorName: doctorUser.name,
        specialization: doctor.specialization,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime
      });

      await EmailNotification.create({
        notificationType: 'BOOKING_CONFIRMATION',
        recipient: patient.email,
        recipientName: patient.name,
        subject: pTmpl.subject,
        body: pTmpl.text,
        html: pTmpl.html,
        appointment: appointment._id,
        status: 'PENDING'
      });
    }

    // 2. Doctor Notification
    const doctorExists = await EmailNotification.exists({
      appointment: appointment._id,
      notificationType: 'BOOKING_CONFIRMATION',
      recipient: doctorUser.email
    });

    if (!doctorExists) {
      const dTmpl = doctorBookingNotificationTemplate({
        doctorName: doctorUser.name,
        patientName: patient.name,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        symptoms: appointment.symptoms
      });

      await EmailNotification.create({
        notificationType: 'BOOKING_CONFIRMATION',
        recipient: doctorUser.email,
        recipientName: doctorUser.name,
        subject: dTmpl.subject,
        body: dTmpl.text,
        html: dTmpl.html,
        appointment: appointment._id,
        status: 'PENDING'
      });
    }
  } catch (error) {
    console.error('[NotificationService] Error creating booking notifications:', error.message);
  }
};

export const createCancellationNotifications = async (appointment) => {
  try {
    if (!appointment || !appointment.patient || !appointment.doctor) return;

    const patient = appointment.patient;
    const doctorUser = appointment.doctor.userId;

    if (!patient.email || !doctorUser || !doctorUser.email) return;

    // 1. Patient cancellation email
    const patientExists = await EmailNotification.exists({
      appointment: appointment._id,
      notificationType: 'APPOINTMENT_CANCELLATION',
      recipient: patient.email
    });

    if (!patientExists) {
      const pTmpl = cancellationTemplate({
        recipientName: patient.name,
        otherPartyName: `Dr. ${doctorUser.name}`,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime
      });

      await EmailNotification.create({
        notificationType: 'APPOINTMENT_CANCELLATION',
        recipient: patient.email,
        recipientName: patient.name,
        subject: pTmpl.subject,
        body: pTmpl.text,
        html: pTmpl.html,
        appointment: appointment._id,
        status: 'PENDING'
      });
    }

    // 2. Doctor cancellation email
    const doctorExists = await EmailNotification.exists({
      appointment: appointment._id,
      notificationType: 'APPOINTMENT_CANCELLATION',
      recipient: doctorUser.email
    });

    if (!doctorExists) {
      const dTmpl = cancellationTemplate({
        recipientName: `Dr. ${doctorUser.name}`,
        otherPartyName: patient.name,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime
      });

      await EmailNotification.create({
        notificationType: 'APPOINTMENT_CANCELLATION',
        recipient: doctorUser.email,
        recipientName: doctorUser.name,
        subject: dTmpl.subject,
        body: dTmpl.text,
        html: dTmpl.html,
        appointment: appointment._id,
        status: 'PENDING'
      });
    }
  } catch (error) {
    console.error('[NotificationService] Error creating cancellation notifications:', error.message);
  }
};

export const createAppointmentReminderNotification = async (appointment) => {
  try {
    if (!appointment || !appointment.patient || !appointment.doctor) return;

    const patient = appointment.patient;
    const doctorUser = appointment.doctor.userId;

    if (!patient.email) return;

    const exists = await EmailNotification.exists({
      appointment: appointment._id,
      notificationType: 'APPOINTMENT_REMINDER',
      recipient: patient.email
    });

    if (!exists) {
      const tmpl = appointmentReminderTemplate({
        patientName: patient.name,
        doctorName: doctorUser ? doctorUser.name : 'Doctor',
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime
      });

      await EmailNotification.create({
        notificationType: 'APPOINTMENT_REMINDER',
        recipient: patient.email,
        recipientName: patient.name,
        subject: tmpl.subject,
        body: tmpl.text,
        html: tmpl.html,
        appointment: appointment._id,
        status: 'PENDING'
      });
    }
  } catch (error) {
    console.error('[NotificationService] Error creating appointment reminder notification:', error.message);
  }
};

export const createDoctorLeaveNotifications = async (affectedAppointments, doctorName) => {
  try {
    if (!Array.isArray(affectedAppointments) || affectedAppointments.length === 0) return;

    for (const app of affectedAppointments) {
      if (!app.patient || !app.patient.email) continue;

      const exists = await EmailNotification.exists({
        appointment: app._id,
        notificationType: 'DOCTOR_LEAVE',
        recipient: app.patient.email
      });

      if (!exists) {
        const tmpl = doctorLeaveTemplate({
          patientName: app.patient.name,
          doctorName,
          date: app.date,
          startTime: app.startTime,
          endTime: app.endTime
        });

        await EmailNotification.create({
          notificationType: 'DOCTOR_LEAVE',
          recipient: app.patient.email,
          recipientName: app.patient.name,
          subject: tmpl.subject,
          body: tmpl.text,
          html: tmpl.html,
          appointment: app._id,
          status: 'PENDING'
        });
      }
    }
  } catch (error) {
    console.error('[NotificationService] Error creating doctor leave notifications:', error.message);
  }
};
