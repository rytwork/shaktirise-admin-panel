import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { deleteDoc, doc, getDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { message: "Phone and OTP required" },
        { status: 400 }
      );
    }

    // ✅ SAME format (CRITICAL)
    const formattedPhone = `+91${phone}`;

    console.log("Verifying OTP for:", formattedPhone);

    const otpRef = doc(db, "phone_otps", formattedPhone);
    const otpDoc = await getDoc(otpRef);

    if (!otpDoc.exists()) {
      console.log("❌ OTP doc not found");
      return NextResponse.json(
        { message: "OTP not found" },
        { status: 400 }
      );
    }

    const data = otpDoc.data();

    console.log("Saved OTP:", data.otp);
    console.log("Entered OTP:", otp);

    // ✅ FIXED TYPE CHECK
    if (Number(data.otp) !== Number(otp)) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // ⏳ Expiry check
    if (Date.now() > data.expiresAt) {
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      );
    }

    // 🧹 Delete after success
    await deleteDoc(otpRef);

    return NextResponse.json({
      message: "Phone verified successfully",
    });

  } catch (error: any) {
    console.error("VERIFY OTP ERROR:", error);

    return NextResponse.json(
      { message: error.message || "OTP verification failed" },
      { status: 500 }
    );
  }
}