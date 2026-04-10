import { NextResponse } from "next/server";
import twilio from "twilio";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { message: "Phone required" },
        { status: 400 }
      );
    }

    // ✅ Always use same format
    const formattedPhone = `+91${phone}`;

    // 🔐 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // 📩 Send SMS
    await client.messages.create({
      body: `Your ShaktiRise registration OTP is ${otp}. Kindly share this OTP with your agent to complete the registration process. Do not share it with anyone else.`,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      to: formattedPhone,
    });

    // 💾 Save OTP with SAME phone key
    await setDoc(doc(db, "phone_otps", formattedPhone), {
      otp: Number(otp),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
      phone: formattedPhone,
      createdAt: Date.now(),
    });

    console.log("OTP saved for:", formattedPhone);

    return NextResponse.json({
      message: "OTP sent successfully",
    });

  } catch (error: any) {
    console.error("SEND OTP ERROR:", error);

    return NextResponse.json(
      { message: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}