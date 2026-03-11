"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { useParams } from "next/navigation";

export default function AgentAdmissions() {

  const { id } = useParams();

  const [groupedData, setGroupedData] = useState<any>({});

  useEffect(() => {

    const q = query(
      collection(db, "customers"),
      where("createdByAgent", "==", id)
    );

    const unsub = onSnapshot(q, (snapshot) => {

      const groups: any = {};

      snapshot.forEach((doc) => {

        const data = doc.data();
        const date = data.addmissionDate?.toDate();

        if (!date) return;

        const month = date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        if (!groups[month]) {
          groups[month] = [];
        }

        groups[month].push({
          id: doc.id,
          ...data
        });

      });

      setGroupedData(groups);

    });

    return () => unsub();

  }, [id]);

  return (

    <div className="p-6 text-gray-800">

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Agent Admissions
      </h1>

      {Object.keys(groupedData).length === 0 && (

        <div className="text-center text-gray-500 mt-10">
          No admissions found
        </div>

      )}

      {Object.entries(groupedData).map(([month, admissions]: any) => (

        <div key={month} className="mb-10">

          {/* Month Heading */}
          <h2 className="text-xl font-semibold text-purple-600 mb-4">
            {month}
          </h2>

          {/* Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">

            <table className="w-full text-sm">

              <thead className="bg-gray-100">

                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="text-left">Phone</th>
                  <th className="text-left">Gender</th>
                  <th className="text-left">Status</th>
                </tr>

              </thead>

              <tbody>

                {admissions.map((c: any) => (

                  <tr key={c.id} className="border-t hover:bg-gray-50">

                    <td className="p-4 font-medium">
                      {c.name}
                    </td>

                    <td>
                      {c.phone}
                    </td>

                    <td>
                      {c.gender}
                    </td>

                    <td>

                      {c.verifiedByAdmin === true && (
                        <span className="text-green-600 font-semibold">
                          Approved
                        </span>
                      )}

                      {c.verifiedByAdmin === false && (
                        <span className="text-yellow-600 font-semibold">
                          Pending
                        </span>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      ))}

    </div>

  );

}