import express from "express";
import { z } from "zod";
import { emailService } from "../lib/email.service";

const router = express.Router();

const escalateSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  summary: z.string().min(1).max(20_000),
});

router.post("/escalate", async (req, res) => {
  const parsed = escalateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request",
      details: parsed.error.flatten(),
    });
  }

  const { name, email, summary } = parsed.data;
  const supportDest =
    process.env.SUPPORT_EMAIL ||
    process.env.SMTP_FROM ||
    "support@yourdrive.io";

  try {
    await emailService.sendSupportTicketEmail(supportDest, name, email, summary);
  } catch (err: any) {
    console.error("[Support] Failed to send ticket email:", err?.message ?? err);
    // Do not fail the request — ticket is still logged
  }

  console.log(`[Support] Ticket received from ${name} <${email}>`);

  return res.json({ success: true, message: "Support ticket submitted." });
});

export default router;
