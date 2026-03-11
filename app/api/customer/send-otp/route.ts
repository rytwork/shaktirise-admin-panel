import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import twilio from "twilio";

// const client = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
// );

export async function POST(req: Request) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json(
                { message: "Phone number required" },
                { status: 400 }
            );
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        // await client.messages.create({
        //     body: `Your OTP is ${otp}`,
        //     from: process.env.TWILIO_PHONE,
        //     to: `+91${phone}`
        // });

        await setDoc(doc(db, "phone_otps", phone), {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        return NextResponse.json({
            message: "OTP sent successfully",
            otp // Remove this in production
        });

    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}