import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendOtpEmail } from "@/lib/mailer";

function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailRaw = body.email ? String(body.email).trim().toLowerCase() : undefined;
    const phoneRaw = body.phone ? String(body.phone).trim().replace(/\s+/g, "") : undefined;

    if (!emailRaw && !phoneRaw) {
      return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({
      where: emailRaw ? { email: emailRaw } : { phone: phoneRaw },
    });

    // Do not leak existence details.
    if (!customer) {
      return NextResponse.json({ message: "If account exists, OTP has been sent" });
    }

    if (!customer.email) {
      return NextResponse.json({ error: "No email linked to this account" }, { status: 400 });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.customer.update({
      where: { id: customer.id },
      data: { resetOtpHash: otpHash, resetOtpExpiry: expiry },
    });

    await sendOtpEmail(customer.email, otp, "customer");

    return NextResponse.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Customer forgot-password error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
