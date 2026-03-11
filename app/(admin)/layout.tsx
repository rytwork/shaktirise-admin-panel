"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase"; // your firebase config
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Header";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, (user) => {

            if (!user) {
                router.push("/login");
            } else {
                setLoading(false);
            }

        });

        return () => unsubscribe();

    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                Loading...
            </div>
        );
    }

    return (

        <div className="flex h-screen bg-gray-100">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Section */}
            <div className="flex-1 flex flex-col">

                {/* Top Navbar */}
                <Navbar />

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>

            </div>

        </div>

    );
}