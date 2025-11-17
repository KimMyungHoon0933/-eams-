// app/main_content/components/messeage_component/messager_route/chatting_authorName/route.js

/** ---------- 공용 유틸 ---------- */
function json(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}
function toInt(v, dflt) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : dflt;
}
function normOrder(v, dflt = "desc") {
  const s = String(v || "").toLowerCase();
  return s === "asc" || s === "desc" ? s : dflt;
}

/** ---------- 공통 select_where_route 호출 헬퍼 ---------- */
async function callSelectWhere({ table, where, orderBy, limit, columns }) {
  const payload = { table, where, orderBy, limit };
  if (Array.isArray(columns) && columns.length) payload.columns = columns;

  // 1) POST 우선
  try {
    const res = await fetch("http://localhost:3000/api/univer_city/select_where_route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok === false) {
      throw { stage: "POST_select_where_route", resStatus: res.status, data };
    }
    const rows = data?.result?.rows ?? data?.rows ?? [];
    return { ok: true, from: "POST", rows, raw: data };
  } catch (e) {
    // 2) GET 폴백
    const qs = new URLSearchParams({
      table,
      where,
      orderBy,
      ...(limit ? { limit: String(limit) } : {}),
      ...(Array.isArray(columns) && columns.length
        ? { columns: columns.join(",") }
        : {}),
    }).toString();

    const res2 = await fetch(
      `http://localhost:3000/api/univer_city/select_where_route?${qs}`,
      { method: "GET", cache: "no-store" }
    );
    const data2 = await res2.json().catch(() => ({}));
    if (!res2.ok || data2?.ok === false) {
      throw {
        stage: "GET_select_where_route",
        resStatus: res2.status,
        data: data2,
        prevError: e,
      };
    }
    const rows2 = data2?.result?.rows ?? data2?.rows ?? [];
    return { ok: true, from: "GET", rows: rows2, raw: data2 };
  }
}

/** ---------- 메시지 + 작성자 이름 조합 ---------- */
async function fetchMessagesWithAuthor({ chatroom_id, limit = 50, order = "desc" }) {
  const safeOrder = normOrder(order, "desc").toUpperCase(); // ASC | DESC
  const safeLimit = Math.min(Math.max(limit, 1), 200);

  // (1) chatting에서 해당 방 메시지들 조회
  const whereMsg = `chatroom_id = ${chatroom_id}`;
  const orderByMsg = `message_time ${safeOrder}`;
  const msgRes = await callSelectWhere({
    table: "chatting",
    where: whereMsg,
    orderBy: orderByMsg,
    limit: safeLimit,
    columns: [
      "message_id",
      "chatroom_id",
      "author_id",
      "content",
      "file_path",
      "created_date", 
      "create_hours",
    ],
  });

  const messages = msgRes.rows || [];
  if (messages.length === 0) {
    return { source: msgRes.from, rows: [] };
  }

  // (2) author_id 고유값 모아 user 테이블에서 이름 일괄 조회
  const authorIds = Array.from(
    new Set(
      messages
        .map((r) => r.author_id)
        .filter((v) => Number.isFinite(Number(v)))
        .map((v) => Number(v))
    )
  );
  let nameMap = new Map();
  if (authorIds.length > 0) {
    const whereUser =
      authorIds.length === 1
        ? `user_id = ${authorIds[0]}`
        : `user_id IN (${authorIds.join(",")})`;

    const userRes = await callSelectWhere({
      table: "user",
      where: whereUser,
      orderBy: "user_id ASC",
      columns: ["user_id", "user_name"],
    });
    const users = userRes.rows || [];
    nameMap = new Map(users.map((u) => [Number(u.user_id), u.user_name]));
  }

  // (3) 메시지 + 이름 병합
  const merged = messages.map((r) => {
  const sid = Number(r.author_id);
  const sname = nameMap.get(sid) ?? "알수없음";

  // YYYY-MM-DD + HH:MM:SS를 함께 쓰고 싶으면 아래 message_datetime 활용
  const created_date = r.created_date ?? null;
  const create_hours = r.create_hours ?? null;
  const message_datetime =
    created_date && create_hours ? `${created_date} ${create_hours}` : null;

  return {
    message_id: r.message_id ?? r.id ?? null,
    chatroom_id: r.chatroom_id ?? chatroom_id,
    sender_id: sid || null,
    sender_name: sname,
    content: r.content ?? r.message ?? r.text ?? "",
    file_path: r.file_path ?? null,
    created_date,           // ← 추가
    create_hours,           // ← 추가
    message_datetime,       // ← (옵션) 합친 값
  };
});
  return { source: msgRes.from, rows: merged };
}

/** ---------- 핸들러 ---------- */
/** GET: (?chatroom_id=1&limit=20&order=desc) */
export async function GET(request) {
  const url = new URL(request.url);
  const sp = url.searchParams;

  const chatroom_id = toInt(sp.get("chatroom_id"), 1);
  const limit = toInt(sp.get("limit"), 50);
  const order = normOrder(sp.get("order"), "desc");

  if (!chatroom_id) {
    return json({ ok: false, reason: "INVALID_CHATROOM_ID" }, { status: 400 });
  }

  try {
    const r = await fetchMessagesWithAuthor({ chatroom_id, limit, order });
    return json({
      ok: true,
      mode: "GET",
      query: { chatroom_id, limit, order },
      count: r.rows.length,
      messages: r.rows,
      source: r.source, // POST or GET (select_where_route 기준)
      tip: "예: ?chatroom_id=2&limit=30&order=asc",
    });
  } catch (e) {
    console.error(e);
    return json(
      {
        ok: false,
        reason: "AUTHOR_JOIN_VIA_SELECT_ROUTE_FAILED",
        hint:
          "select_where_route 라우터가 열려 있고 chatting/user 테이블/컬럼명이 일치하는지 확인하세요.",
      },
      { status: 502 }
    );
  }
}

/** POST: { chatroom_id, limit?, order? } */
export async function POST(request) {
  const ctype = request.headers.get("content-type") || "";
  if (!ctype.toLowerCase().includes("application/json")) {
    return json({ ok: false, reason: "UNSUPPORTED_MEDIA_TYPE" }, { status: 415 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, reason: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const chatroom_id = toInt(body?.chatroom_id, 0);
  const limit = toInt(body?.limit, 50);
  const order = normOrder(body?.order, "desc");

  if (!chatroom_id) {
    return json({ ok: false, reason: "INVALID_CHATROOM_ID" }, { status: 400 });
  }

  try {
    const r = await fetchMessagesWithAuthor({ chatroom_id, limit, order });
    return json({
      ok: true,
      mode: "POST",
      query: { chatroom_id, limit, order },
      count: r.rows.length,
      messages: r.rows,
      source: r.source,
    });
  } catch (e) {
    console.error(e);
    return json(
      {
        ok: false,
        reason: "AUTHOR_JOIN_VIA_SELECT_ROUTE_FAILED",
        hint:
          "select_where_route 라우터/권한/컬럼명을 확인하세요.",
      },
      { status: 502 }
    );
  }
}

export function PUT()    { return json({ ok: false, reason: "METHOD_NOT_ALLOWED" }, { status: 405 }); }
export function PATCH()  { return json({ ok: false, reason: "METHOD_NOT_ALLOWED" }, { status: 405 }); }
export function DELETE() { return json({ ok: false, reason: "METHOD_NOT_ALLOWED" }, { status: 405 }); }
