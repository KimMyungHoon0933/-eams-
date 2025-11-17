// app/main_content/components/messeage_component/messager_route/chatting_select/route.js

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

/** chatting 테이블에서 메시지 조회 (범용 select_where_route 사용) */
async function fetchMessages({ chatroom_id, limit = 20, order = "desc" }) {
  // where / order / limit 구성
  const where = `chatroom_id = ${chatroom_id}`;
  const orderBy = `message_time ${order.toUpperCase()}`;
  const safeLimit = Math.min(Math.max(limit, 1), 200);

  // 1) POST 방식(권장)
  try {
    const res = await fetch("http://localhost:3000/api/univer_city/select_where_route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 프로젝트의 select_where_route가 받던 포맷에 맞춰 주세요.
      body: JSON.stringify({
        table: "chatting",
        where,
        orderBy,
        limit: safeLimit,
        // 필요시 columns: ["message_id","chatroom_id","author_id","author_name","content","message_time"]
      }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok === false) {
      throw { stage: "POST_select_where_route", resStatus: res.status, data };
    }
    // data.result.rows 형태를 가정 (너의 기존 user_route 응답 포맷과 유사)
    const rows = data?.result?.rows ?? data?.rows ?? [];
    return { ok: true, from: "POST", rows, raw: data };
  } catch (e) {
    // 2) GET fallback (프로젝트 설정에 따라 필요 없으면 지워도 됨)
    const qs = new URLSearchParams({
      table: "chatting",
      where,
      orderBy,
      limit: String(safeLimit),
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

/** GET: 브라우저에서 바로 확인 가능 (기본 chatroom_id=1, limit=20, order=desc 로 실제 메시지 반환) */
export async function GET(request) {
  const url = new URL(request.url);
  const sp = url.searchParams;

  const chatroom_id = toInt(sp.get("chatroom_id"), 1);  // ← 기본값 1
  const limit = toInt(sp.get("limit"), 20);             // ← 기본값 20
  const order = normOrder(sp.get("order"), "desc");     // ← 기본값 desc

  try {
    const r = await fetchMessages({ chatroom_id, limit, order });

    // 필요 시 author 구조 평탄화/필드 이름 표준화
    const messages = (r.rows || []).map((row) => {
      const author =
        row.author ||
        (row.author_name || row.author_id
          ? { id: row.author_id ?? null, name: row.author_name ?? null }
          : null);

      return {
        message_id: row.message_id ?? row.id ?? null,
        chatroom_id: row.chatroom_id ?? chatroom_id,
        author,
        content: row.content ?? row.message ?? row.text ?? "",
        message_time: row.message_time ?? row.created_at ?? row.time ?? null,
      };
    });

    return json({
      ok: true,
      mode: "GET",
      query: { chatroom_id, limit, order },
      count: messages.length,
      messages,
      source: r.from,           // POST 또는 GET fallback
      // 필요하면 raw를 보고 싶을 때만 임시로 포함
      // raw: r.raw,
      tip: "파라미터로 ?chatroom_id=2&limit=10&order=asc 처럼 바꿔가며 바로 점검할 수 있습니다.",
      example_post: `curl -X POST -H "Content-Type: application/json" -d '{"chatroom_id":${chatroom_id},"limit":${limit},"order":"${order}"}' ${url.origin}${url.pathname}`,
    });
  } catch (e) {
    return json(
      {
        ok: false,
        reason: "MESSAGES_FETCH_FAILED",
        hint:
          "select_where_route 라우터가 열려 있고 chatting 테이블/컬럼명이 일치하는지 확인하세요.",
        chatroom_id,
        debug: {
          stage: e?.stage,
          status: e?.resStatus,
          // raw: e?.data, // 필요할 때만 열어보세요
        },
      },
      { status: 502 }
    );
  }
}

/** POST: (그대로 유지 가능) 실제 조회/권한검사 붙일 자리 */
export async function POST(request) {
  const ctype = request.headers.get("content-type") || "";
  if (!ctype.toLowerCase().includes("application/json")) {
    return json(
      { ok: false, reason: "UNSUPPORTED_MEDIA_TYPE" },
      { status: 415 }
    );
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
    const r = await fetchMessages({ chatroom_id, limit, order });
    return json({
      ok: true,
      mode: "POST",
      query: { chatroom_id, limit, order },
      count: r.rows?.length ?? 0,
      messages: r.rows,
      source: r.from,
    });
  } catch (e) {
    return json(
      {
        ok: false,
        reason: "MESSAGES_FETCH_FAILED",
        hint:
          "select_where_route 라우터/권한/컬럼명을 확인하세요.",
        chatroom_id,
      },
      { status: 502 }
    );
  }
}

// 방어
export function PUT() {
  return json({ ok: false, reason: "METHOD_NOT_ALLOWED" }, { status: 405 });
}
export function PATCH() {
  return json({ ok: false, reason: "METHOD_NOT_ALLOWED" }, { status: 405 });
}
export function DELETE() {
  return json({ ok: false, reason: "METHOD_NOT_ALLOWED" }, { status: 405 });
}
