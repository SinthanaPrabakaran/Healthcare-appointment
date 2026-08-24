import nodemailer from 'nodemailer';

let transporterInstance = null;

const getTransporter = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('Email service is not configured.');
    return null;
  }

  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      host: EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(EMAIL_PORT, 10) || 587,
      secure: parseInt(EMAIL_PORT, 10) === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      }
    });
  }

  return transporterInstance;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!to || typeof to !== 'string' || to.trim() === '') {
    throw new Error('Recipient email is required.');
  }

  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('Email service is not configured.');
  }

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html: html || text
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export const sendMedicationReminderEmail = async (patientEmail, patientName, reminder) => {
  const template = medicationReminderTemplate({
    patientName,
    medicine: reminder.medicine,
    dosage: reminder.dosage,
    instructions: reminder.instructions
  });

  return await sendEmail({
    to: patientEmail,
    subject: template.subject,
    text: template.text,
    html: template.html
  });
};

// ==========================================
// EMAIL TEMPLATES
// ==========================================

export const bookingConfirmationTemplate = ({ patientName, doctorName, specialization, date, startTime, endTime }) => {
  const subject = `Appointment Confirmation - Dr. ${doctorName}`;
  const text = `Hello ${patientName || 'Patient'},

Your appointment has been successfully confirmed.

Appointment Details:
- Doctor: Dr. ${doctorName} (${specialization || 'General'})
- Date: ${date}
- Time: ${startTime} - ${endTime}

Please arrive 10 minutes prior to your scheduled time.`;

  const html = `<div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Appointment Confirmation</h2>
    <p>Hello <strong>${patientName || 'Patient'}</strong>,</p>
    <p>Your appointment has been successfully confirmed.</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
      <p><strong>Doctor:</strong> Dr. ${doctorName} (${specialization || 'General'})</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
    </div>
    <p>Please arrive 10 minutes prior to your scheduled time.</p>
  </div>`;

  return { subject, text, html };
};

export const doctorBookingNotificationTemplate = ({ doctorName, patientName, date, startTime, endTime, symptoms }) => {
  const subject = `New Appointment Booking - ${patientName}`;
  const text = `Hello Dr. ${doctorName},

You have a new appointment booking.

Patient Details:
- Patient Name: ${patientName}
- Date: ${date}
- Time: ${startTime} - ${endTime}
- Symptoms: ${symptoms || 'Not provided'}

Please log into the portal to review pre-visit notes.`;

  const html = `<div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>New Appointment Booking</h2>
    <p>Hello <strong>Dr. ${doctorName}</strong>,</p>
    <p>You have a new appointment booked.</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
      <p><strong>Patient Name:</strong> ${patientName}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
      <p><strong>Reported Symptoms:</strong> ${symptoms || 'Not provided'}</p>
    </div>
  </div>`;

  return { subject, text, html };
};

export const cancellationTemplate = ({ recipientName, otherPartyName, date, startTime, endTime }) => {
  const subject = `Appointment Cancelled`;
  const text = `Hello ${recipientName || 'User'},

Your appointment on ${date} from ${startTime} to ${endTime} with ${otherPartyName} has been cancelled.

If you have any questions, please contact support or rebook via the portal.`;

  const html = `<div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Appointment Cancelled</h2>
    <p>Hello <strong>${recipientName || 'User'}</strong>,</p>
    <p>Your appointment on <strong>${date} (${startTime} - ${endTime})</strong> with <strong>${otherPartyName}</strong> has been cancelled.</p>
  </div>`;

  return { subject, text, html };
};

export const appointmentReminderTemplate = ({ patientName, doctorName, date, startTime, endTime }) => {
  const subject = `Reminder: Upcoming Appointment with Dr. ${doctorName}`;
  const text = `Hello ${patientName || 'Patient'},

This is a reminder for your upcoming appointment with Dr. ${doctorName}.

Details:
- Date: ${date}
- Time: ${startTime} - ${endTime}

Please be ready on time.`;

  const html = `<div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Upcoming Appointment Reminder</h2>
    <p>Hello <strong>${patientName || 'Patient'}</strong>,</p>
    <p>This is a reminder for your upcoming appointment with <strong>Dr. ${doctorName}</strong>.</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
  </div>`;

  return { subject, text, html };
};

export const doctorLeaveTemplate = ({ patientName, doctorName, date, startTime, endTime }) => {
  const subject = `Important: Doctor Unavailable for Appointment on ${date}`;
  const text = `Hello ${patientName || 'Patient'},

Dr. ${doctorName} is unavailable on ${date} due to scheduled leave.
Your appointment scheduled for ${startTime} - ${endTime} on ${date} could not take place as scheduled.

Please log in to the platform to reschedule your appointment at your earliest convenience.`;

  const html = `<div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Doctor Leave Notice</h2>
    <p>Hello <strong>${patientName || 'Patient'}</strong>,</p>
    <p>Dr. <strong>${doctorName}</strong> is unavailable on <strong>${date}</strong> due to scheduled leave.</p>
    <p>Your appointment scheduled for <strong>${startTime} - ${endTime}</strong> could not take place.</p>
    <p>Please log in to reschedule your consultation.</p>
  </div>`;

  return { subject, text, html };
};

export const medicationReminderTemplate = ({ patientName, medicine, dosage, instructions }) => {
  const subject = `Medication Reminder: ${medicine}`;
  const text = `Hello ${patientName || 'Patient'},

This is a reminder to take:

Medicine: ${medicine}
Dosage: ${dosage}
Instructions: ${instructions || 'None'}

Please follow the prescription provided by your doctor.`;

  const html = `<div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Medication Reminder</h2>
    <p>Hello <strong>${patientName || 'Patient'}</strong>,</p>
    <p>This is a reminder to take your medication:</p>
    <ul>
      <li><strong>Medicine:</strong> ${medicine}</li>
      <li><strong>Dosage:</strong> ${dosage}</li>
      <li><strong>Instructions:</strong> ${instructions || 'None'}</li>
    </ul>
    <p>Please follow your doctor's prescription instructions.</p>
  </div>`;

  return { subject, text, html };
};
