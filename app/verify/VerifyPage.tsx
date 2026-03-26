"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function VerifyPage() {

  const params = useSearchParams();
  const code = params.get("code");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!code) return;

    fetch(`/api/customer/verify?code=${code}`)
      .then(res => res.json())
      .then(res => {
        setData(res);
        setLoading(false);
      });

  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Checking verification...
      </div>
    );
  }

  if (!data.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-10 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            ❌ Invalid Record
          </h1>
          <p>This admission record is not valid.</p>
        </div>
      </div>
    );
  }

  const customer = data.customer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-xl overflow-hidden">

        <div className="bg-pink-600 text-white text-center py-5">
          <h1 className="text-2xl font-bold">Shakti Rise</h1>
          <p className="text-sm opacity-90">Official Admission Verification</p>
        </div>

        <div className="flex flex-col items-center mt-6">

          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-pink-500 shadow-md">
            <Image
              src={customer.photoUrl || "/user.png"}
              alt="Customer"
              fill
              className="object-cover"
            />
          </div>

          <h2 className="text-xl text-violet-600 font-semibold mt-3">
            {customer.name}
          </h2>

          <span className="text-green-600 font-semibold mt-1">
            ✔ Verified Member
          </span>

        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 text-gray-700">

            <div className="font-semibold">Phone</div>
            <div>{customer.phone}</div>

            <div className="font-semibold">Date of Birth</div>
            <div>{new Date(customer.dob).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}</div>

            <div className="font-semibold">Adhar Number</div>
            <div>{customer.adharNumber}</div>

            <div className="font-semibold">Gender</div>
            <div>{customer.gender}</div>

            <div className="font-semibold">Verification Code</div>
            <div>{customer.verificationCode}</div>

            <div className="font-semibold">Status</div>
            <div className="text-green-600 font-semibold">
              {customer.status}
            </div>

          </div>
        </div>

        <div className="bg-gray-50 text-center text-sm text-gray-500 py-4">
          Verified by Shakti Rise Authority
        </div>

      </div>
    </div>
  );
}