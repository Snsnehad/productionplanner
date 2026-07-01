const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

// Builds the shortage alert email body, following the template from the spec
const buildShortageEmail = ({ purchaserName, plan, material, requiredQty, availableQty, shortageQty, isReminder, reminderCount }) => {
  const subject = `Material Shortage Alert - ${plan.department} Plan${isReminder ? ` (Reminder ${reminderCount})` : ""}`;

  const body = `Hello ${purchaserName},

The following material is required for production.

Department: ${plan.department}
Plan Number: ${plan.planNumber}
Start Date: ${formatDate(plan.startDate)}

Material: ${material.materialName}
Required Qty: ${requiredQty} ${material.unit}
Available Qty: ${availableQty} ${material.unit}
Shortage Qty: ${shortageQty} ${material.unit}

Please arrange procurement before the production start date.

Regards,
Planning System`;

  return { subject, body };
};

const sendMail = async ({ to, subject, text }) => {
  // In development, if SMTP isn't configured, log instead of failing the whole flow
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[emailService] SMTP not configured. Skipping send, logging instead:");
    console.warn({ to, subject, text });
    return { skipped: true };
  }

  const mailTransporter = getTransporter();

  const info = await mailTransporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });

  return info;
};

const sendShortageAlertEmail = async (params) => {
  const { subject, body } = buildShortageEmail(params);
  return sendMail({ to: params.purchaserEmail, subject, text: body });
};

module.exports = { sendShortageAlertEmail, sendMail, buildShortageEmail };
