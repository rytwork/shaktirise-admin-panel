"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from "firebase/firestore";

export default function Customers() {

    const [customers, setCustomers] = useState<any[]>([]);
    const [status, setStatus] = useState("pending");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchCustomers = async (searchValue = "") => {

        setLoading(true);

        let q;

        if (searchValue) {

            // Search by Aadhaar
            q = query(
                collection(db, "customers"),
                where("adharNumber", "==", searchValue)
            );

        } else {

            q = query(
                collection(db, "customers"),
                where("status", "==", status),
                orderBy("createdAt", "desc"),
                limit(20)
            );

        }

        const snapshot = await getDocs(q);

        const data:any[] = [];

        snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });

        setCustomers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCustomers();
    }, [status]);

    const handleSearch = () => {

        if (search.trim() === "") {
            fetchCustomers();
            return;
        }

        fetchCustomers(search);

    };

    return (

        <div className="p-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">

                <h1 className="text-2xl font-semibold text-blue-600">
                    Customers
                </h1>

                {/* Search Section */}
                <div className="flex gap-2">

                    <input
                        type="text"
                        placeholder="Search by Aadhaar Number"
                        className="border rounded-md border-gray-300 text-gray-700 px-4 py-3 text-sm w-72"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearch();
                            }
                        }}
                    />

                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-5 py-3 rounded-md text-sm hover:bg-blue-700"
                    >
                        Search
                    </button>

                </div>

            </div>

            {/* Status Switch */}
            <div className="flex gap-3 mb-6">

                <button
                    className={`px-4 py-2 rounded ${
                        status === "pending"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-300 text-gray-700"
                    }`}
                    onClick={() => {
                        setStatus("pending");
                        setSearch("");
                    }}
                >
                    Pending
                </button>

                <button
                    className={`px-4 py-2 rounded ${
                        status === "active"
                            ? "bg-teal-600 text-white"
                            : "bg-gray-300 text-gray-700"
                    }`}
                    onClick={() => {
                        setStatus("active");
                        setSearch("");
                    }}
                >
                    Active
                </button>

            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-x-auto">

                <table className="w-full text-sm">

                    <thead className="bg-gray-100">

                        <tr>
                            <th className="p-3 text-left text-blue-700">Name</th>
                            <th className="text-left text-blue-700">Phone</th>
                            <th className="text-left text-blue-700">Adhar Number</th>
                            <th className="text-left text-blue-700">Agent</th>
                            <th className="text-left text-blue-700">Status</th>
                            <th className="text-left text-blue-700">Action</th>
                        </tr>

                    </thead>

                    <tbody>

                        {loading && (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        )}

                        {!loading && customers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                    No customers found
                                </td>
                            </tr>
                        )}

                        {customers.map((c) => (

                            <tr key={c.id} className="border-t">

                                <td className="p-3 text-rose-700">{c.name}</td>

                                <td className="text-rose-700">{c.phone}</td>

                                <td className="text-rose-700">{c.adharNumber}</td>

                                <td className="text-rose-700">{c.createdByAgent}</td>

                                <td>

                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            c.status === "active"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-orange-100 text-orange-700"
                                        }`}
                                    >
                                        {c.status}
                                    </span>

                                </td>

                                <td className="flex gap-2 py-2">

                                    {c.status === "pending" && (

                                        <button
                                            className="bg-cyan-500 text-white px-3 py-1 rounded text-xs"
                                            onClick={() =>
                                                fetch("/api/admin/verify-customer", {
                                                    method: "POST",
                                                    body: JSON.stringify({
                                                        code: c.verificationCode
                                                    })
                                                }).then(() => fetchCustomers())
                                            }
                                        >
                                            Verify
                                        </button>

                                    )}

                                    {c.status === "active" && (

                                        <button
                                            className="bg-rose-600 text-white px-3 py-1 rounded text-xs"
                                            onClick={() =>
                                                window.open(`/api/customer/brochure/${c.id}`)
                                            }
                                        >
                                            Admission Brochure
                                        </button>

                                    )}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );
}