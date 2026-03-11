"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Header() {

    const router = useRouter();

    const logout = async () => {

        const confirmLogout = window.confirm("Are you sure you want to logout?");

        if (!confirmLogout) return;

        await signOut(auth);

        router.push("/login");

    };

    return (

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 shadow bg-white">

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent text-center md:text-left">
                Shakti Rise
            </h1>

            <button
                className="bg-purple-600 hover:bg-purple-700 transition text-white px-4 py-2 rounded-md text-sm md:text-base"
                onClick={logout}
            >
                Logout
            </button>

        </div>

    );
}