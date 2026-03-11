import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    getDocs
} from "firebase/firestore";

export async function GET(req: Request) {

    try {

        const { agentId, page = 1, limit = 10 } = Object.fromEntries(new URL(req.url).searchParams);

        if (!agentId) {
            return NextResponse.json(
                { message: "agentId is required" },
                { status: 400 }
            );
        }

        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const offset = (pageNumber - 1) * limitNumber;

        const q = query(
            collection(db, "customers"),
            where("createdByAgent", "==", agentId),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const monthly: any = {};

        snapshot.forEach((doc) => {

            const data = doc.data();

            if (!data.createdAt) return;

            const date = data.createdAt.toDate();

            const month = date.toLocaleString("default", {
                month: "long",
                year: "numeric"
            });

            if (!monthly[month]) {
                monthly[month] = [];
            }

            monthly[month].push({
                id: doc.id,
                ...data
            });

        });

        const months = Object.keys(monthly);

        const paginatedMonths = months.slice(offset, offset + limitNumber);

        const result = paginatedMonths.map((month) => ({
            month,
            total: monthly[month].length,
            admissions: monthly[month].map((admission: any) => ({
            ...admission,
            addmissionDate: admission.addmissionDate?.toDate().toLocaleString() || null,
            createdAt: admission.createdAt?.toDate().toLocaleString() || null
            }))
        }));

        return NextResponse.json({
            status: "success",
            page: pageNumber,
            limit: limitNumber,
            totalMonths: months.length,
            data: result
        });

    } catch (error: any) {

        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );

    }

}