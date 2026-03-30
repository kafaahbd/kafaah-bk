import { Router } from "express";
import multer from "multer";
import { Resend } from "resend";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY environment variable is required");
    resend = new Resend(key);
  }
  return resend;
}

router.post("/join", upload.single("image"), async (req, res) => {
  try {
    const {
      fullName,
      email,
      dob,
      presentAddress,
      permanentAddress,
      experience,
      previousWork,
      motivation,
      skills,
    } = req.body;
    const file = req.file;

    // Validation: Ensure no fields are null/empty
    if (
      !fullName ||
      !email ||
      !dob ||
      !presentAddress ||
      !permanentAddress ||
      !experience ||
      !previousWork ||
      !motivation ||
      !skills ||
      !file
    ) {
      return res.status(400).json({ error: "All fields are required, including the image." });
    }

    const resendClient = getResend();

    // 1. Send email to Admin
    await resendClient.emails.send({
      from: "Join Form <noreply@kafaahbd.com>", // Replace with noreply@kafaahbd.com when domain is verified
      to: "kafaahbd@gmail.com",
      subject: `New Join Request from ${fullName}`,
      html: `
        <h2>New Join Request</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date of Birth:</strong> ${dob}</p>
        <p><strong>Present Address:</strong> ${presentAddress}</p>
        <p><strong>Permanent Address:</strong> ${permanentAddress}</p>
        <p><strong>Experience:</strong> ${experience}</p>
        <p><strong>Previous Work:</strong> ${previousWork}</p>
        <p><strong>Motivation:</strong> ${motivation}</p>
        <p><strong>Skills:</strong> ${skills}</p>
      `,
      attachments: [
        {
          filename: file.originalname,
          content: file.buffer,
        },
      ],
    });

    // 2. Send confirmation email to User
    await resendClient.emails.send({
      from: "Kafaah Team <noreply@kafaahbd.com>", // Replace with noreply@kafaahbd.com when domain is verified
      to: email,
      subject: "Thank you for joining Kafaah!",
      html: `
        <h2>Thank you for submitting your form, ${fullName}!</h2>
        <p>We have received your information:</p>
        <ul>
          <li><strong>Full Name:</strong> ${fullName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Date of Birth:</strong> ${dob}</li>
          <li><strong>Present Address:</strong> ${presentAddress}</li>
          <li><strong>Permanent Address:</strong> ${permanentAddress}</li>
          <li><strong>Experience:</strong> ${experience}</li>
          <li><strong>Previous Work:</strong> ${previousWork}</li>
          <li><strong>Motivation:</strong> ${motivation}</li>
          <li><strong>Skills:</strong> ${skills}</li>
        </ul>
        <p>Our team will check your form and you will receive another email if you are selected or not. Please wait for our message.</p>
        <br/>
        <p>Best regards,<br/>The Kafaah Team</p>
      `,
    });

    res.status(200).json({ success: true, message: "Form submitted successfully" });
  } catch (error: any) {
    console.error("Error submitting form:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
