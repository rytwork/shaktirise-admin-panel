"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { log } from "console";


export default function Login() {

    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const login = async () => {

        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        setLoading(true);

        try {

            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            console.log("userCredential", userCredential);


            const userRef = doc(collection(db, "users"), userCredential.user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                alert("User does not exist");
                setLoading(false);
                return;
            }

            const userData = userDoc.data();

            if (userData.role !== "admin") {
                alert("Not an admin");
                setLoading(false);
                return;
            }

            const ip = await getUserIP();
            
            if (userData.ipAddress !== ip) {
                alert("Login from unauthorized device");
                setLoading(false);
                return;
            }
            router.push("/dashboard");

        } catch (err) {
            console.log("Login error", err);
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            alert("error logging in: " + errorMessage);
            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200">

            <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8 border">

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold text-purple-700">
                        Shakti Rise
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Admin Control Panel
                    </p>

                </div>

                {/* Email */}
                <div className="mb-5">

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>

                    <input
                        type="email"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="admin@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                </div>

                {/* Password */}
                <div className="mb-6">

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>

                    <div className="relative">

                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter password"
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2 text-sm text-gray-500 hover:text-purple-600"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>

                    </div>

                </div>

                {/* Button */}
                <button
                    onClick={login}
                    disabled={loading}
                    className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 transition text-white font-semibold py-2 rounded-md shadow disabled:opacity-60"
                >

                    {loading ? (
                        <div className="flex items-center gap-2">

                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                            Signing In...

                        </div>
                    ) : (
                        "Login to Dashboard"
                    )}

                </button>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Secure access for authorized administrators only
                </p>

            </div>

        </div>

    );
}


const getUserIP = async () => {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
};