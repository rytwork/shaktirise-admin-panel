import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {

    try {

        const body = await req.json();
        const code = body.code;

        if (!code) {
            return NextResponse.json(
                { message: "Verification code is required" },
                { status: 400 }
            );
        }

        const q = query(
            collection(db, "customers"),
            where("verificationCode", "==", code)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json(
                { message: "Invalid verification code" },
                { status: 400 }
            );
        }

        const customerDoc = snapshot.docs[0];

        await updateDoc(doc(db, "customers", customerDoc.id), {
            verifiedByAdmin: true,
            status: "active",
            addmissionDate: new Date()
        });

        return NextResponse.json({
            message: "Customer verified successfully"
        });

    } catch (error: any) {

        return NextResponse.json(
            { message: error.message || "Verification failed" },
            { status: 500 }
        );

    }
}