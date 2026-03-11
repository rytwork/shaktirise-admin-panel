"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Dashboard() {

    const [agents, setAgents] = useState(0);
    const [customers, setCustomers] = useState(0);

    useEffect(() => {

        const unsubAgents = onSnapshot(collection(db, "agents"), (snapshot) => {
            setAgents(snapshot.size);
        });

        const unsubCustomers = onSnapshot(collection(db, "customers"), (snapshot) => {
            setCustomers(snapshot.size);
        });

        return () => {
            unsubAgents();
            unsubCustomers();
        };

    }, []);

    return (

        <div className="min-h-screen bg-gray-100">

            {/* Header */}
            <div className="bg-white shadow-sm border-b p-4 flex items-center justify-between">

                <h1 className="text-xl md:text-2xl font-semibold text-gray-700">
                    Dashboard Overview
                </h1>

                <span className="text-gray-500 text-sm md:text-base">
                    Welcome Admin
                </span>

            </div>

            {/* Content */}
            <div className="p-4 md:p-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Agents */}
                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">

                        <div className="flex justify-between items-center">

                            <div>
                                <h3 className="text-gray-500 text-sm">
                                    Total Agents
                                </h3>

                                <p className="text-3xl font-bold mt-2 text-purple-600">
                                    {agents}
                                </p>
                            </div>

                            <div className="text-3xl">
                                👩‍💼
                            </div>

                        </div>

                    </div>

                    {/* Customers */}
                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">

                        <div className="flex justify-between items-center">

                            <div>
                                <h3 className="text-gray-500 text-sm">
                                    Total Customers
                                </h3>

                                <p className="text-3xl font-bold mt-2 text-pink-600">
                                    {customers}
                                </p>
                            </div>

                            <div className="text-3xl">
                                👩
                            </div>

                        </div>

                    </div>

                    {/* Total Users */}
                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">

                        <div className="flex justify-between items-center">

                            <div>
                                <h3 className="text-gray-500 text-sm">
                                    Total Users
                                </h3>

                                <p className="text-3xl font-bold mt-2 text-indigo-600">
                                    {agents + customers}
                                </p>
                            </div>

                            <div className="text-3xl">
                                📊
                            </div>

                        </div>

                    </div>

                </div>

                {/* Future Section */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Activity */}
                    <div className="bg-white p-6 rounded-xl shadow">

                        <h2 className="text-lg font-semibold text-gray-700 mb-4">
                            Recent Activity
                        </h2>

                        <p className="text-gray-500 text-sm">
                            No recent activity yet.
                        </p>

                    </div>

                    {/* System Info */}
                    <div className="bg-white p-6 rounded-xl shadow">

                        <h2 className="text-lg font-semibold text-gray-700 mb-4">
                            Overview
                        </h2>

                        <p className="text-gray-500 text-sm">
                            Shakti Rise admin dashboard.
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );
}