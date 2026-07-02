import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL;
const emailPass = process.env.PASS;

const getTransporter = () => {
  if (!emailUser || !emailPass || emailUser.includes("<") || emailPass.includes("<")) {
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: emailUser, pass: emailPass },
  });
};

export const sendMail = async (to: string, subject: string, html: string) => {
  const transporter = getTransporter();
  
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"FastGrocery" <${emailUser}>`,
        to,
        subject,
        html,
      });
      console.log(`Real OTP email sent to: ${to}`);
    } catch (error) {
      console.error("Error sending email via Nodemailer:", error);
      console.log("Fallback Simulated Email (due to error):");
      logSimulatedEmail(to, subject, html);
    }
  } else {
    logSimulatedEmail(to, subject, html);
  }
};

function logSimulatedEmail(to: string, subject: string, html: string) {
  console.log("\n=================== [SIMULATED EMAIL LOGGER] ===================");
  console.log(`Recipient: ${to}`);
  console.log(`Subject:   ${subject}`);
  // Extract OTP text from HTML
  const otpMatch = html.match(/<h2[^>]*>(.*?)<\/h2>/) || html.match(/\b\d{4}\b/);
  const otp = otpMatch ? otpMatch[1] || otpMatch[0] : "N/A";
  console.log(`OTP Code:  ${otp}`);
  console.log(`Full HTML Preview:\n${html}`);
  console.log("=================================================================\n");
}
