// src/app/api/messenger/chat_insert/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

// 'YYYY-MM-DD' (KST)
function todayKST() {
  const fmt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [{ value: y }, , { value: m }, , { value: d }] = fmt.formatToParts(new Date());
  return `${y}-${m}-${d}`;
}

// 'HH:MM:SS' (KST)
function nowHmsKST() {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find(p => p.type === t)?.value ?? "00";
  return `${get("hour")}:${get("minute")}:${get("second")}`;
}

// 사람이 읽기 쉬운 KST 로깅용
function nowStrKST() {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date());
}

export async function POST(req) {
  try {
    // 1) 본문 파싱
    const body = await req.json().catch(() => ({}));
    const bodyChatroomId =
      typeof body?.chatroom_id === "string" || typeof body?.chatroom_id === "number"
        ? Number(body.chatroom_id)
        : undefined;
    const bodyContent = typeof body?.content === "string" ? body.content.trim() : "";
    const bodyCreateHours = typeof body?.create_hours === "string" ? body.create_hours.trim() : "";

    // 기본 테스트 값
    const chatroom_id = Number.isFinite(bodyChatroomId) ? bodyChatroomId : 1;
    const content =
      bodyContent && bodyContent.length > 0
        ? bodyContent
        : `[TEST] 기본 삽입 메시지 (생성시각: ${nowStrKST()})`;

    // create_hours 유효성 검사 (HH:MM:SS)
    const isHMS = /^\d{2}:\d{2}:\d{2}$/.test(bodyCreateHours);
    const create_hours = isHMS ? bodyCreateHours : nowHmsKST();

    const file_path = body?.file_path ?? null;

    // 2) 현재 사용자(user_id) 조회 (기존 로직 유지)
    const echoRes = await fetch(`http://localhost:3000/api/univer_city/user_route`, {
      headers: { cookie: req.headers.get("cookie") || "" },
      cache: "no-store",
    });
    if (!echoRes.ok) {
      const err = await echoRes.json().catch(() => ({}));
      return NextResponse.json(
        { ok: false, reason: "NO_SESSION", echo_error: err },
        { status: 401 }
      );
    }
    const echo = await echoRes.json();
    const author_id = echo?.session?.user_id;
    if (!author_id) {
      return NextResponse.json(
        { ok: false, reason: "NO_USER_ID_FROM_SESSION" },
        { status: 401 }
      );
    }

    // 3) INSERT 호출: ★ create_hours 추가
    const cols = ["chatroom_id", "created_date", "create_hours", "content", "file_path", "author_id"];
    const values = [[
      Number(chatroom_id),
      todayKST(),
      create_hours,      // ★ TIME(HH:MM:SS)
      content,
      file_path,
      Number(author_id),
    ]];

    const insUrl = new URL(`${req.nextUrl.origin}/api/univer_city/insert_route`);
    insUrl.searchParams.set("table", "chatting");
    insUrl.searchParams.set("cols", JSON.stringify(cols));
    insUrl.searchParams.set("values", JSON.stringify(values));

    const insRes = await fetch(insUrl.toString(), { cache: "no-store" });
    const bodyText = await insRes.text();
    let insertBody;
    try { insertBody = JSON.parse(bodyText); } catch { insertBody = { raw: bodyText }; }

    if (!insRes.ok) {
      return NextResponse.json(
        { ok: false, reason: "INSERT_FAILED", insert_response: insertBody },
        { status: insRes.status }
      );
    }

    // 4) 성공 응답
    return NextResponse.json({
      ok: true,
      mode: (bodyContent ? "payload" : "default-test"),
      insert: insertBody,
      message: {
        chatroom_id: Number(chatroom_id),
        author_id: Number(author_id),
        content,
        file_path,
        created_date: values[0][1],
        create_hours, // ★ 응답에도 포함
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "INTERNAL_ERROR", detail: String(e) },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  // GET → 기본 POST 로직 재사용
  const forward = new Request(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify({}),
  });
  return POST(forward);
}

