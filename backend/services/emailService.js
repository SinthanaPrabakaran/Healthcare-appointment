import nodemailer from 'nodemailer';

export const sendMedicationReminderEmail = async (patientEmail, patientName, reminder) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM } = process.env;

  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('Medication reminder email service is not configured.');
    throw new Error('Medication reminder email service is not configured.');
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(EMAIL_PORT, 10) || 587,
    secure: parseInt(EMAIL_PORT, 10) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: EMAIL_FROM || EMAIL_USER,
    to: patientEmail,
    subject: `Medication Reminder: ${reminder.medicine}`,
    text: `Hello ${patientName || 'Patient'},

This is a reminder to take:

Medicine: ${reminder.medicine}
Dosage: ${reminder.dosage}
Instructions: ${reminder.instructions || 'None'}

Please follow the prescription provided by your doctor.`
  };

  await transporter.sendMail(mailOptions);
};
