// app/api/messenger/chatrooms/route.js
// (사용자가 속한 모든 채팅방 "메타"만 조회 — 메시지 조회 없음)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

/** 공통 에러 JSON */
function jerr(status, reason, extra = {}) {
  return NextResponse.json({ ok: false, reason, ...extra }, { status });
}

/** 요청 단위 trace id */
function makeTraceId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** 프록시/리버스프록시 대응 origin 계산 */
function resolveOrigin(req) {
  const url = new URL(req.url);
  const xfProto = req.headers.get("x-forwarded-proto");
  const xfHost  = req.headers.get("x-forwarded-host");
  if (xfProto && xfHost) return `${xfProto}://${xfHost}`;
  const host = req.headers.get("host") || url.host || "localhost:3000";
  const proto = url.protocol?.replace(":", "") || "http";
  return `${proto}://${host}`;
}

/** ⬅️ 변경점 #1: 상류 API JSON fetch — 요청 쿠키를 그대로 포워딩 */
async function fetchJSON(req, url) {
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      ...(cookie ? { cookie } : {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    let body = null;
    try { body = await res.json(); } catch {}
    const err = new Error("UPSTREAM_API_ERROR");
    err.status = 502;
    err.detail = { url, status: res.status, body };
    throw err;
  }
  try {
    return await res.json();
  } catch {
    const err = new Error("INVALID_JSON");
    err.status = 502;
    err.detail = { url };
    throw err;
  }
}

/** 2번(user_route) 호출로 user_id 획득 */
async function getUserIdFromUserRoute(req, { includeRaw = false } = {}) {
  const origin = resolveOrigin(req);
  const userRoutePath = process.env.USER_ROUTE_PATH || "/api/univer_city/user_route";
  const url = new URL(userRoutePath, origin);

  const data = await fetchJSON(req, url.toString());

  const candidate =
    data?.session?.user_id ??
    data?.user?.user_id ??
    data?.result?.rows?.[0]?.user_id ??
    data?.rows?.[0]?.user_id ??
    null;

  const userId = Number(candidate);
  if (!Number.isInteger(userId) || userId <= 0) {
    const err = new Error("USER_ID_NOT_FOUND");
    err.status = 401;
    err.detail = includeRaw ? { user_route_raw: data } : undefined;
    throw err;
  }
  return { userId, userRouteRaw: includeRaw ? data : undefined };
}

/** select_where_route URL 빌더 (2번 계열 라우트 스타일) */
function buildSelectWhereURL(origin, { table, select, where, orderBy, limit }) {
  const u = new URL("/api/univer_city/select_where_route", origin);
  if (table) u.searchParams.set("table", table);
  if (select) u.searchParams.set("select", JSON.stringify(select));
  if (where) u.searchParams.set("where", where);
  if (orderBy) u.searchParams.set("orderBy", orderBy);
  if (limit) u.searchParams.set("limit", String(limit));
  return u.toString();
}

export async function GET(req) {
  const traceId = makeTraceId();

  try {
    const url = new URL(req.url);
    const debug = url.searchParams.get("debug") === "1";
    const origin = resolveOrigin(req);

    // 1) 2번(user_route) 통해 user_id 확보
    let userId, userRouteRaw;
    try {
      const got = await getUserIdFromUserRoute(req, { includeRaw: debug });
      userId = got.userId;
      userRouteRaw = got.userRouteRaw;
    } catch (e) {
      if (e?.message === "USER_ID_NOT_FOUND") {
        return jerr(e.status || 401, "USER_ID_NOT_FOUND", {
          traceId,
          hint: "user_route에서 user_id를 찾지 못했습니다. 세션 만료/미로그인 또는 응답 구조 변경 확인.",
          ...(debug && e.detail ? { debug: e.detail } : {}),
        });
      }
      if (e?.message === "UPSTREAM_API_ERROR" || e?.message === "INVALID_JSON") {
        return jerr(e.status || 502, "USER_ROUTE_FETCH_FAILED", {
          traceId,
          hint: "user_route 호출 실패. 엔드포인트/응답/쿠키 포워딩 확인.",
          ...(debug && e.detail ? { debug: e.detail } : {}),
        });
      }
      throw e;
    }

    // 2) Chatroom_List에서 member_id = user_id 로 사용자의 채팅방 ID들만 조회
    let listApiRaw, idRows;
    try {
      const listUrl = buildSelectWhereURL(origin, {
        table: "Chatroom_List",
        select: ["chatroom_id"],
        where: `member_id = ${userId}`,
        orderBy: "chatroom_id DESC",
        limit: 500,
      });
      const listData = await fetchJSON(req, listUrl); // ⬅️ 변경점 #2: req 전달
      listApiRaw = debug ? listData : undefined;
      idRows = listData?.result?.rows ?? listData?.rows ?? [];
    } catch (e) {
      return jerr(e?.status || 502, "SELECT_API_ERROR_CHATROOM_LIST", {
        traceId,
        hint: "Chatroom_List 조회 실패",
        ...(debug && e?.detail ? { debug: e.detail } : {}),
      });
    }

    const ids = Array.from(
      new Set(
        idRows
          .map((r) => Number(r?.chatroom_id))
          .filter((n) => Number.isInteger(n) && n > 0)
      )
    );

    if (ids.length === 0) {
      return NextResponse.json({ ok: true, traceId, user_id: userId, chatrooms: [] });
    }

    // 3) Chatroom 메타를 IN 절로 일괄 조회 (메시지 조회 없음)
    const MAX_IN = 100;
    const chunks = [];
    for (let i = 0; i < ids.length; i += MAX_IN) chunks.push(ids.slice(i, i + MAX_IN));

    const metaRows = [];
    for (const chunk of chunks) {
      const inClause = chunk.join(",");
      try {
        const metaUrl = buildSelectWhereURL(origin, {
          table: "Chatroom",
          select: ["chatroom_id", "chatroom_name", "is_group", "last_message_time"],
          where: `chatroom_id IN (${inClause})`,
          orderBy: "last_message_time DESC",
          limit: chunk.length,
        });
        const metaData = await fetchJSON(req, metaUrl); // ⬅️ req 전달
        const rows = metaData?.result?.rows ?? metaData?.rows ?? [];
        metaRows.push(...rows);
      } catch (e) {
        return jerr(e?.status || 502, "SELECT_API_ERROR_CHATROOM_META", {
          traceId,
          hint: "Chatroom 메타 조회 실패",
          ...(debug && e?.detail ? { debug: e.detail } : {}),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      traceId,
      user_id: userId,
      chatrooms: metaRows.map((r) => ({
        chatroom_id: r.chatroom_id,
        chatroom_name: r.chatroom_name,
        is_group: r.is_group,
        last_message_time: r.last_message_time,
      })),
      ...(debug ? { debug: { user_route_raw: userRouteRaw, list_api_raw: listApiRaw } } : {}),
    });
  } catch (err) {
    return jerr(err?.status || 500, "INTERNAL_ERROR", {
      traceId,
      detail: String(err?.message || err),
      ...(err?.detail ? { debug: err.detail } : {}),
    });
  }
}
