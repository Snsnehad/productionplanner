const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
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
  console.log("SMTP Config:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER,
    passExists: !!process.env.SMTP_PASS,
  });

  const transporter = getTransporter();

  try {
    console.log("Verifying SMTP...");
    await transporter.verify();
    console.log("SMTP verified.");

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
    });

    console.log("Mail sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("SMTP ERROR:", err);
    console.error("Code:", err.code);
    console.error("Command:", err.command);
    throw err;
  }
};

const sendShortageAlertEmail = async (params) => {
  const { subject, body } = buildShortageEmail(params);
  return sendMail({ to: params.purchaserEmail, subject, text: body });
};

module.exports = { sendShortageAlertEmail, sendMail, buildShortageEmail };
