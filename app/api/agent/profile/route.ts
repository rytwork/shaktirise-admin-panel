import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { agentId } =
      Object.fromEntries(new URL(req.url).searchParams);

    /// ❌ VALIDATION
    if (!agentId) {
      return NextResponse.json(
        { message: "agentId is required" },
        { status: 400 }
      );
    }

    /// 🔍 QUERY
    const q = query(
      collection(db, "agents"),
      where("uid", "==", agentId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { message: "Agent not found" },
        { status: 404 }
      );
    }

    /// 📦 FORMAT DATA
    const agents: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      agents.push({
        id: doc.id,
        name: data.name || "",
        agentId: data.uid || "",
        image: data.profile || "",
        phone: data.phone || "",
        email: data.email || "",
        createdAt:
          data.createdAt?.toDate().toLocaleString() || null
      });
    });

    /// ✅ RESPONSE
    return NextResponse.json({
      status: "success",
      total: agents.length,
      data: agents
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}