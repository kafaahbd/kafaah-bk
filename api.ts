import { Router } from "express";
import multer from "multer";
import { Resend } from "resend";

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
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

router.post("/join", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "cv", maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      fullNameEn,
      email,
      phone,
      gender,
      emergencyContact,
      dob,
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
      isNotMuslim,
      islamicKnowledgeLevel,
      quranRecitation,
      madrasaBackground,
      madrasaDetails,
      skills,
      skillProficiencies,
      portfolioLink,
      yearsOfExp,
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
      linkedin,
      facebook,
      github,
      website,
      telegram,
      referralSource,
      additionalComments,
      imageLink,
      cvLink,
      isPurdahObserved
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const imageFile = files?.["image"]?.[0];
    const cvFile = files?.["cv"]?.[0];

    const isPurdahBool = isPurdahObserved === "true" || isPurdahObserved === true;
    const hasImage = imageFile || (imageLink && typeof imageLink === "string" && imageLink.trim() !== "");

    // Primary Validation
    if (!fullNameEn || !email || !phone || !primaryRole || (!hasImage && !isPurdahBool)) {
      return res.status(400).json({ error: "Required fields (Full Name, Email, Phone/WhatsApp, Primary Role, Profile Picture/Link or Purdah option) are missing." });
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

    const resendClient = getResend();

    const formatAddress = (addr: any) => {
      if (!addr || typeof addr !== 'object') return 'N/A';
      return `${addr.village || ''}, ${addr.union || ''}, ${addr.thana || ''}, ${addr.district || ''}, ${addr.division || ''} - ${addr.postCode || ''}`;
    };

    const isNonMuslimBool = isNotMuslim === "true" || isNotMuslim === true;

    // Formatting image & CV info for email body
    let imageInfoHtml = 'N/A';
    if (isPurdahBool) {
      imageInfoHtml = '<span style="background-color: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 4px; font-weight: bold;">Purdah Observed (No Photo Provided)</span>';
    } else if (imageFile) {
      imageInfoHtml = `Attached (${imageFile.originalname})`;
    } else if (imageLink) {
      imageInfoHtml = `<a href="${imageLink}" target="_blank" style="color: #059669;">${imageLink}</a>`;
    }

    let cvInfoHtml = 'N/A';
    if (cvFile) {
      cvInfoHtml = `Attached (${cvFile.originalname})`;
    } else if (cvLink) {
      cvInfoHtml = `<a href="${cvLink}" target="_blank" style="color: #059669;">${cvLink}</a>`;
    }

    const adminHtmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px;">
        <div style="background-color: #059669; padding: 20px; border-radius: 8px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 24px;">New Kafa'ah Team Join Request</h1>
          <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Comprehensive Application Digest</p>
        </div>

        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px; margin-top: 24px;">1. Basic Information</h2>
        <p><strong>Full Name:</strong> ${fullNameEn}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone / WhatsApp:</strong> ${phone}</p>
        <p><strong>Gender:</strong> ${gender || 'N/A'}</p>
        <p><strong>Emergency Contact:</strong> ${emergencyContact || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> ${dob}</p>
        <p><strong>Blood Group:</strong> ${bloodGroup || 'N/A'}</p>
        <p><strong>Profile Picture:</strong> ${imageInfoHtml}</p>
        <p><strong>CV / Resume:</strong> ${cvInfoHtml}</p>

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
        ${isNonMuslimBool ? `
          <p><strong>Applicant Status:</strong> <span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-weight: bold;">Non-Muslim Applicant</span></p>
        ` : `
          <p><strong>Knowledge Level:</strong> ${islamicKnowledgeLevel || 'N/A'}</p>
          <p><strong>Quran Recitation:</strong> ${quranRecitation || 'N/A'}</p>
          <p><strong>Madrasa Background:</strong> ${madrasaBackground || 'N/A'} ${madrasaDetails ? `(${madrasaDetails})` : ''}</p>
        `}

        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px;">5. Technical Skills & Portfolio</h2>
        <p><strong>Selected Skills:</strong> ${skills || 'N/A'}</p>
        <p><strong>Portfolio Link:</strong> ${portfolioLink ? `<a href="${portfolioLink}" target="_blank">${portfolioLink}</a>` : 'N/A'}</p>
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

        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px;">8. Social Links & Referral</h2>
        <p><strong>LinkedIn:</strong> ${linkedin || 'N/A'} | <strong>Facebook:</strong> ${facebook || 'N/A'} | <strong>Telegram:</strong> ${telegram || 'N/A'}</p>
        <p><strong>Referral Source:</strong> ${referralSource || 'N/A'}</p>
        <p><strong>Comments:</strong> ${additionalComments || 'None'}</p>
      </div>
    `;

    // Attachments array
    const attachments: any[] = [];

    if (imageFile) {
      attachments.push({
        filename: imageFile.originalname,
        content: imageFile.buffer,
      });
    }

    if (cvFile) {
      attachments.push({
        filename: cvFile.originalname,
        content: cvFile.buffer,
      });
    }

    // 1. Send Admin Email
    const adminEmailResult = await resendClient.emails.send({
      from: "Kafa'ah Recruitment <noreply@kafaahbd.com>",
      to: "kafaahbd@gmail.com",
      subject: `[Join Request] ${fullNameEn} - ${primaryRole}`,
      html: adminHtmlContent,
      attachments,
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
          <h2 style="color: #059669;">Application Received, ${fullNameEn}!</h2>
          <p>Thank you for submitting your application to join <strong>Team Kafa'ah</strong>.</p>
          <p>We have successfully received your application for the <strong>${primaryRole}</strong> position.</p>
          <p>Our recruitment board will carefully review your credentials and portfolio. If shortlisted, you will receive an interview invitation via email or phone/WhatsApp (${phone}).</p>
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

