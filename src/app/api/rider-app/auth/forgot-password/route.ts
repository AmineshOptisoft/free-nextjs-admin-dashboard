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

    if (!phoneRaw && !emailRaw) {
      return NextResponse.json({ error: "Phone or email is required" }, { status: 400 });
    }

    const rider = await prisma.rider.findFirst({
      where: phoneRaw ? { phone: phoneRaw } : { email: emailRaw },
    });

    // Do not leak existence details.
    if (!rider) {
      return NextResponse.json({ message: "If account exists, OTP has been sent" });
    }

    if (!rider.email) {
      return NextResponse.json({ error: "No email linked to this rider account" }, { status: 400 });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.rider.update({
      where: { id: rider.id },
      data: { resetOtpHash: otpHash, resetOtpExpiry: expiry },
    });

    await sendOtpEmail(rider.email, otp, "rider");

    return NextResponse.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Rider forgot-password error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
