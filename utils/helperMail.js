import nodemailer from "nodemailer"; // Import nodemailer to send emails

// Function to generate secure passwords (You can implement your own logic)
const generateSecurePassword = () => {
  // Example simple password generator
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Email sending function
export const sendMailHelper = async (email) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // 587 or 465 or other options depending on security
    secure: true, // true for 465, false for other ports
    auth: {
      user: "anhhcvhe161142@fpt.edu.vn",
      pass: "uxvw zvuj yugl hgsa",
    },
  });

  // Verify SMTP connection
  transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP connection error:", error);
      throw new Error("Failed to connect to SMTP server.");
    } else {
      console.log("SMTP connection successful. Ready to send emails.");
    }
  });

  // Enable debugging output
  transporter.on("debug", (info) => {
    console.log("Debugging info:", info);
  });

  // Generate a new random password
  const newPassword = generateSecurePassword();

  try {
    // Send email
    const info = await transporter.sendMail({
      from: "anhhcvhe161142@fpt.edu.vn",
      to: email,
      subject: "Your new password from AceInterview",
      html: `
        <h2>Password Reset</h2>
        <p>Hello,</p>
        <p>Your new password is: <strong>${newPassword}</strong></p>
        <p>Please make sure to change this password after logging in.</p>
        <br />
        <p>Best regards,</p>
        <p>AceInterview Team</p>
      `,
    });

    return { success: true, newPassword };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};
