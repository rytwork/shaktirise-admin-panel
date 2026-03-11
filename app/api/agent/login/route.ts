import { NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { stat } from "fs";

export async function POST(req: Request) {

    try {

        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password required" },
                { status: 400 }
            );
        }

        // Firebase login
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const uid = userCredential.user.uid;

        // Fetch user from Firestore
        const userDoc = await getDoc(doc(db, "agents", uid));

        if (!userDoc.exists()) {
            return NextResponse.json(
                { message: "User not found in database" },
                { status: 404 }
            );
        }

        const userData = userDoc.data();

        // createdAt to ISO string
        if (userData.createdAt) {
            userData.createdAt = userData.createdAt.toDate().toISOString();
        }

        return NextResponse.json({
            status: "success",
            message: "Login successful",
            user: userData,
        });

    } catch (error: any) {

        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );

    }

}


