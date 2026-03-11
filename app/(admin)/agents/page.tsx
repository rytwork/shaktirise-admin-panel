"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";

export default function Agents() {

  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {

    const unsub = onSnapshot(collection(db, "agents"), (snapshot) => {

      const data: any[] = [];

      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      setAgents(data);

    });

    return () => unsub();

  }, []);

  const deactivateAgent = async (id: string) => {

    const confirm = window.confirm("Deactivate this agent?");

    if (!confirm) return;

    await updateDoc(doc(db, "agents", id), {
      active: false,
    });

  };

  return (

    <div className="p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Agents
          </h1>

          <p className="text-gray-500 text-sm">
            Manage your admission agents
          </p>
        </div>

        <Link href="/agents/add">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg shadow font-medium transition">
            + Add Agent
          </button>
        </Link>

      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <table className="w-full">

          {/* TABLE HEAD */}
          <thead className="bg-gray-50 text-gray-600 text-sm">

            <tr>
              <th className="p-4 text-left font-medium">Agent</th>
              <th className="text-left font-medium">Email</th>
              <th className="text-left font-medium">Status</th>
              <th className="text-left font-medium">Actions</th>
            </tr>

          </thead>

          {/* TABLE BODY */}
          <tbody>

            {agents.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-10 text-gray-400">
                  No agents found
                </td>
              </tr>
            )}

            {agents.map((agent) => (

              <tr
                key={agent.id}
                className="border-t hover:bg-gray-50 transition"
              >

                {/* AGENT */}
                <td className="p-4 flex items-center gap-3">

                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 font-semibold">
                    {agent.name ? agent.name[0].toUpperCase() : "A"}
                  </div>

                  <div>
                    <p className="font-medium text-gray-800">
                      {agent.name || "N/A"}
                    </p>
                  </div>

                </td>

                {/* EMAIL */}
                <td className="text-gray-700">
                  {agent.email || "N/A"}
                </td>

                {/* STATUS */}
                <td>

                  {agent.active === false ? (

                    <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600 font-medium">
                      Deactivated
                    </span>

                  ) : (

                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600 font-medium">
                      Active
                    </span>

                  )}

                </td>

                {/* ACTIONS */}
                <td className="space-x-4">

                  <Link href={`/agents/${agent.id}/admissions`}>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      View Admissions
                    </button>
                  </Link>

                  {agent.active !== false && (

                    <button
                      onClick={() => deactivateAgent(agent.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Deactivate
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