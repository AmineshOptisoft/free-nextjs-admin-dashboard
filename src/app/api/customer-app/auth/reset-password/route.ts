import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailRaw = body.email ? String(body.email).trim().toLowerCase() : undefined;
    const phoneRaw = body.phone ? String(body.phone).trim().replace(/\s+/g, "") : undefined;
    const otp = body.otp;
    const newPassword = body.newPassword;

    if ((!emailRaw && !phoneRaw) || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email/phone, otp and newPassword are required" },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({
      where: emailRaw ? { email: emailRaw } : { phone: phoneRaw },
    });

    if (!customer || !customer.resetOtpHash || !customer.resetOtpExpiry) {
      return NextResponse.json({ error: "Invalid OTP request" }, { status: 400 });
    }

    if (new Date(customer.resetOtpExpiry).getTime() < Date.now()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    const incomingHash = hashOtp(String(otp));
    if (incomingHash !== customer.resetOtpHash) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
        resetOtpHash: null,
        resetOtpExpiry: null,
      },
    });

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Customer reset-password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
