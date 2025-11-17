// app/api/univer_city/logout_route/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

function readCookie(cookieHeader = "", name) {
  const parts = cookieHeader.split(";").map((v) => v.trim());
  for (const part of parts) {
    if (part.startsWith(name + "=")) {
      const raw = part.slice(name.length + 1);
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}

async function handleLogout(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const sid = readCookie(cookieHeader, "sid");

  if (sid) {
    await deleteSession(sid);
  }

  // 🔹 여기서는 JSON만 응답 (리다이렉트는 클라이언트에서)
  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: "sid",
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}

export async function GET(req) {
  return handleLogout(req);
}

export async function POST(req) {
  return handleLogout(req);
}
