import { Router } from "express";
import multer from "multer";
import { Resend } from "resend";

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
      fullNameEn,
      fullNameBn,
      email,
      phone,
      whatsapp,
      emergencyContact,
      dob,
      nidOrBirthReg,
      bloodGroup,
      presentAddress,
      permanentAddress,
      currentEduStatus,
      highestDegree,
      institutionName,
      subjectDept,
      passingYear,
      sscGpa,
      hscGpa,
      islamicKnowledgeLevel,
      quranRecitation,
      madrasaBackground,
      madrasaDetails,
      skills,
      skillProficiencies,
      portfolioLink,
      yearsOfExp,
      softSkills,
      primaryRole,
      secondaryRole,
      preferredDepartment,
      workMode,
      weeklyHours,
      preferredShift,
      availableStartDate,
      previousOrg,
      pastProjectLinks,
      keyAchievements,
      whyJoinKafaah,
      contributionVision,
      twoYearGoal,
      pcSpecs,
      internetType,
      powerBackup,
      linkedin,
      facebook,
      github,
      website,
      telegram,
      referralSource,
      additionalComments
    } = req.body;

    const file = req.file;

    // Primary Validation
    if (!fullNameEn || !email || !phone || !primaryRole || !file) {
      return res.status(400).json({ error: "Required fields (Full Name, Email, Phone, Role, Profile Picture) are missing." });
    }

    // Safely parse JSON string fields
    const parseJSON = (str: string, fallback: any = {}) => {
      try {
        return typeof str === "string" ? JSON.parse(str) : str || fallback;
      } catch (e) {
        return fallback;
      }
    };

    const parsedPresentAddr = parseJSON(presentAddress);
    const parsedPermanentAddr = parseJSON(permanentAddress);
    const parsedProficiencies = parseJSON(skillProficiencies);
    const parsedSoftSkills = parseJSON(softSkills);

    const resendClient = getResend();

    const formatAddress = (addr: any) => {
      if (!addr || typeof addr !== 'object') return 'N/A';
      return `${addr.village || ''}, ${addr.union || ''}, ${addr.thana || ''}, ${addr.district || ''}, ${addr.division || ''} - ${addr.postCode || ''}`;
    };

    const adminHtmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-w: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px;">
        <div style="background-color: #059669; padding: 20px; border-radius: 8px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 24px;">New Kafa'ah Team Join Request</h1>
          <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">14-Section Comprehensive Application Digest</p>
        </div>

        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px; margin-top: 24px;">1. Basic Information</h2>
        <p><strong>Full Name (EN):</strong> ${fullNameEn}</p>
        <p><strong>Full Name (BN):</strong> ${fullNameBn || 'N/A'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp || 'N/A'}</p>
        <p><strong>Emergency Contact:</strong> ${emergencyContact || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> ${dob}</p>
        <p><strong>NID / Birth Reg:</strong> ${nidOrBirthReg || 'N/A'}</p>
        <p><strong>Blood Group:</strong> ${bloodGroup || 'N/A'}</p>

        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px;">2. Address Details</h2>
        <p><strong>Present Address:</strong> ${formatAddress(parsedPresentAddr)}</p>
        <p><strong>Permanent Address:</strong> ${formatAddress(parsedPermanentAddr)}</p>

        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px;">3. Educational Background</h2>
        <p><strong>Current Status:</strong> ${currentEduStatus || 'N/A'}</p>
        <p><strong>Highest Degree:</strong> ${highestDegree || 'N/A'}</p>
        <p><strong>Institution Name:</strong> ${institutionName || 'N/A'}</p>
        <p><strong>Subject / Dept:</strong> ${subjectDept || 'N/A'}</p>
        <p><strong>Passing Year:</strong> ${passingYear || 'N/A'}</p>
        <p><strong>SSC / Dakhil GPA:</strong> ${sscGpa || 'N/A'}</p>
        <p><strong>HSC / Alim GPA:</strong> ${hscGpa || 'N/A'}</p>

        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px;">4. Islamic Knowledge & Ethics</h2>
        <p><strong>Knowledge Level:</strong> ${islamicKnowledgeLevel || 'N/A'}</p>
        <p><strong>Quran Recitation:</strong> ${quranRecitation || 'N/A'}</p>
        <p><strong>Madrasa Background:</strong> ${madrasaBackground || 'N/A'} ${madrasaDetails ? `(${madrasaDetails})` : ''}</p>

        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px;">5. Technical Skills & Portfolio</h2>
        <p><strong>Selected Skills:</strong> ${skills || 'N/A'}</p>
        <p><strong>Portfolio Link:</strong> <a href="${portfolioLink}" target="_blank">${portfolioLink}</a></p>
        <p><strong>Years of Experience:</strong> ${yearsOfExp || 'N/A'}</p>

        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px;">6. Preferred Role & Work Mode</h2>
        <p><strong>Primary Role:</strong> ${primaryRole}</p>
        <p><strong>Secondary Role:</strong> ${secondaryRole || 'N/A'}</p>
        <p><strong>Department:</strong> ${preferredDepartment || 'N/A'}</p>
        <p><strong>Work Mode:</strong> ${workMode} | <strong>Weekly Hours:</strong> ${weeklyHours} | <strong>Shift:</strong> ${preferredShift}</p>
        <p><strong>Earliest Start Date:</strong> ${availableStartDate || 'N/A'}</p>

        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px;">7. Experience & Motivation</h2>
        <p><strong>Previous Org:</strong> ${previousOrg || 'N/A'}</p>
        <p><strong>Past Projects:</strong> ${pastProjectLinks || 'N/A'}</p>
        <p><strong>Key Achievements:</strong> ${keyAchievements || 'N/A'}</p>
        <p><strong>Why Join Kafa'ah:</strong> ${whyJoinKafaah || 'N/A'}</p>
        <p><strong>Contribution Vision:</strong> ${contributionVision || 'N/A'}</p>

        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px;">8. Hardware & Social Links</h2>
        <p><strong>PC Specs:</strong> ${pcSpecs || 'N/A'}</p>
        <p><strong>Internet & Backup:</strong> ${internetType || 'N/A'} (${powerBackup || 'N/A'})</p>
        <p><strong>LinkedIn:</strong> ${linkedin || 'N/A'} | <strong>Facebook:</strong> ${facebook || 'N/A'} | <strong>Telegram:</strong> ${telegram || 'N/A'}</p>
        <p><strong>Referral Source:</strong> ${referralSource || 'N/A'}</p>
        <p><strong>Comments:</strong> ${additionalComments || 'None'}</p>
      </div>
    `;

    // 1. Send Admin Email
    const adminEmailResult = await resendClient.emails.send({
      from: "Kafa'ah Recruitment <noreply@kafaahbd.com>",
      to: "kafaahbd@gmail.com",
      subject: `[Join Request] ${fullNameEn} - ${primaryRole}`,
      html: adminHtmlContent,
      attachments: [
        {
          filename: file.originalname,
          content: file.buffer,
        },
      ],
    });

    if (adminEmailResult.error) {
      console.error("Resend Admin Email Error:", adminEmailResult.error);
    }

    // 2. Send User Confirmation Email
    const userEmailResult = await resendClient.emails.send({
      from: "Team Kafa'ah <noreply@kafaahbd.com>",
      to: email,
      subject: "Application Received - Team Kafa'ah",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #059669;">Jazakallahu Khairan, ${fullNameEn}!</h2>
          <p>Thank you for submitting your application to join <strong>Team Kafa'ah</strong>.</p>
          <p>We have successfully received your 14-section application for the <strong>${primaryRole}</strong> position.</p>
          <p>Our recruitment board will carefully review your credentials and portfolio. If shortlisted, you will receive an interview invitation via email or WhatsApp (${phone}).</p>
          <br/>
          <p style="color: #666; font-size: 13px;">Best regards,<br/><strong>Team Kafa'ah Recruitment Panel</strong><br/>Islamic Technology & Software Platform</p>
        </div>
      `,
    });

    if (userEmailResult.error) {
      console.error("Resend User Email Error:", userEmailResult.error);
    }

    res.status(200).json({ success: true, message: "Application submitted successfully" });
  } catch (error: any) {
    console.error("Error submitting join application:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;

