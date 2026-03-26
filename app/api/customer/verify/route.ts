import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(req: Request) {

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json(
            { message: "Verification code required" },
            { status: 400 }
        );
    }

    const q = query(
        collection(db, "customers"),
        where("verificationCode", "==", Number(code))
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return NextResponse.json({
            valid: false,
            message: "Invalid admission record"
        });
    }

    const data = snapshot.docs[0].data();

    return NextResponse.json({
        valid: true,
        customer: {
            name: data.name,
            dob: data.dob,
            adharNumber: data.adharNumber,
            photoUrl: data.photoUrl,
            phone: data.phone,
            gender: data.gender,
            verificationCode: data.verificationCode,
            status: data.status
        }
    });

}