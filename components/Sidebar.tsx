"use client";

import { useState } from "react";
import Link from "next/link";

export default function Sidebar() {

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-start justify-between bg-black text-white p-4">
        <button
          onClick={() => setOpen(true)}
          className="text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative top-0 left-0 h-full w-64 bg-black text-white p-5
        transform transition-transform duration-300 z-50
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        `}
      >

        {/* Mobile Close Button */}
        <div className="flex justify-between items-center mb-10 md:hidden">
          <h2 className="text-xl font-bold">Admin</h2>

          <button
            onClick={() => setOpen(false)}
            className="text-xl"
          >
            ✕
          </button>
        </div>

        {/* Desktop Title */}
        <h2 className="text-2xl font-bold mb-10 hidden md:block">
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-4">

          <Link
            href="/dashboard"
            className="hover:bg-gray-800 p-2 rounded"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/agents"
            className="hover:bg-gray-800 p-2 rounded"
            onClick={() => setOpen(false)}
          >
            Agents
          </Link>

          <Link
            href="/customers"
            className="hover:bg-gray-800 p-2 rounded"
            onClick={() => setOpen(false)}
          >
            Customers
          </Link>

        </nav>

      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

    </>
  );
}