import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { deleteDoc, doc, getDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {

    const { phone, otp } = await req.json();

    const otpDoc = await getDoc(doc(db, "phone_otps", phone));

    if (!otpDoc.exists()) {
      return NextResponse.json(
        { message: "OTP not found" },
        { status: 400 }
      );
    }

    const data = otpDoc.data();

    if (data.otp != otp) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (Date.now() > data.expiresAt) {
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      );
    }
    
    await deleteDoc(doc(db, "phone_otps", phone));


    return NextResponse.json({
      message: "Phone verified"
    });

  } catch (error: any) {

    return NextResponse.json(
      { message: error.message || "OTP verification failed" },
      { status: 500 }
    );

  }
}