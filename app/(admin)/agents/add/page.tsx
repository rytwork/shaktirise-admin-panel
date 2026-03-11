"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AddAgent() {

    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const addAgent = async () => {

        if (!name || !email || !phone || !password) {
            alert("Please fill all fields");
            return;
        }

        setLoading(true);

        try {

            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const uid = userCredential.user.uid;

            // Save agent in Firestore
            await setDoc(doc(db, "agents", uid), {
                uid,
                name,
                email,
                phone,
                role: "agent",
                active: true,
                createdAt: new Date(),
            });

            alert("Agent account created successfully");

            router.push("/agents");

        } catch (error: any) {

            alert(error.message);

        }

        setLoading(false);

    };

    return (

        <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">

            <h1 className="text-2xl font-semibold text-gray-700 mb-6">
                Add Agent
            </h1>

            <div className="space-y-4">

                {/* Name */}
                <div>
                    <label className="text-sm text-gray-600">
                        Name
                    </label>

                    <input
                        type="text"
                        className="w-full border text-gray-600 rounded-md p-2 mt-1"
                        placeholder="Agent name"
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="text-sm text-gray-600">
                        Email
                    </label>

                    <input
                        type="email"
                        className="w-full border text-gray-600 rounded-md p-2 mt-1"
                        placeholder="Agent email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="text-sm text-gray-600">
                        Phone
                    </label>

                    <input
                        type="text"
                        className="w-full border text-gray-600 rounded-md p-2 mt-1"
                        placeholder="Phone number"
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="text-sm text-gray-600">
                        Password
                    </label>

                    <input
                        type="password"
                        className="w-full border text-gray-600 rounded-md p-2 mt-1"
                        placeholder="Create password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    onClick={addAgent}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md"
                >

                    {loading ? "Creating Agent..." : "Create Agent"}

                </button>

            </div>

        </div>

    );
}