import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: Request) {

    try {

        const body = await req.json();

        const verificationCode = Math.floor(
            100000 + Math.random() * 900000
        );

        if (!body.name) {
            return NextResponse.json(
                { message: "Name is required" },
                { status: 400 }
            );
        }

        if (!body.phone) {
            return NextResponse.json(
                { message: "Phone number is required" },
                { status: 400 }
            );
        }

        if (!body.adharNumber) {
            return NextResponse.json(
                { message: "Adhar number is required" },
                { status: 400 }
            );
        }   

        if (!body.photoUrl) {
            return NextResponse.json(
                { message: "Photo URL is required" },
                { status: 400 }
            );
        }

        if (!body.fatherIncomeCertificate) {
            return NextResponse.json(
                { message: "Father income certificate URL is required" },
                { status: 400 }
            );
        }
        

        await setDoc(doc(db, "customers", body.adharNumber), {
            name: body.name,
            phone: body.phone,
            adharNumber: body.adharNumber,
            gender: "female",
            photoUrl: body.photoUrl,
            fatherIncomeCertificate: body.fatherIncomeCertificate,
            createdByAgent: body.createdByAgent,
            phoneVerified: true,
            verificationCode,
            verifiedByAdmin: false,
            status: "pending",
            createdAt: new Date()
        });

        return NextResponse.json({
            message: "Customer created",
            verificationCode
        });

    } catch (error: any) {

        return NextResponse.json(
            { message: error.message || "Customer creation failed" },
            { status: 500 }
        );

    }
}