import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const verificationCode = Math.floor(
            100000 + Math.random() * 900000
        );

        /// ================= VALIDATIONS =================

        if (!body.name) {
            return NextResponse.json(
                { message: "Name is required" },
                { status: 400 }
            );
        }



        if (!body.dob) {
            return NextResponse.json(
                { message: "Date of birth is required" },
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
                { message: "Aadhar number is required" },
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

        /// ===== NEW VALIDATIONS =====

        if (!body.higherEducation) {
            return NextResponse.json(
                { message: "Education is required" },
                { status: 400 }
            );
        }

        // Minimum 8th validation (basic backend safety)
        const education = body.higherEducation.toLowerCase();
        if (
            education.includes("5") ||
            education.includes("6") ||
            education.includes("7")
        ) {
            return NextResponse.json(
                { message: "Minimum qualification should be 8th pass" },
                { status: 400 }
            );
        }

        if (!body.bankName) {
            return NextResponse.json(
                { message: "Bank name is required" },
                { status: 400 }
            );
        }

        if (!body.accountNumber) {
            return NextResponse.json(
                { message: "Account number is required" },
                { status: 400 }
            );
        }

        if (!body.ifscCode) {
            return NextResponse.json(
                { message: "IFSC code is required" },
                { status: 400 }
            );
        }

        if (!body.branch) {
            return NextResponse.json(
                { message: "Branch is required" },
                { status: 400 }
            );
        }

        /// ================= SAVE DATA =================

        await setDoc(doc(db, "customers", body.adharNumber), {
            name: body.name,
            phone: body.phone,
            dob: new Date(body.dob),
            adharNumber: body.adharNumber,
            gender: "female",

            photoUrl: body.photoUrl,
            fatherIncomeCertificate: body.fatherIncomeCertificate,

            createdByAgent: body.createdByAgent,

            /// NEW FIELDS
            higherEducation: body.higherEducation,
            bankName: body.bankName,
            accountNumber: body.accountNumber,
            ifscCode: body.ifscCode,
            branch: body.branch,

            /// SYSTEM FIELDS
            phoneVerified: true,
            verificationCode,
            verifiedByAdmin: false,
            status: "pending",
            createdAt: new Date(),
        });

        return NextResponse.json({
            message: "Customer created successfully",
            verificationCode,
        });

    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Customer creation failed" },
            { status: 500 }
        );
    }
}