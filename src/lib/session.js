// lib/session.js
import crypto from "crypto";

const ORIGIN =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  "http://localhost:3000";

function b64u(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function randId26() {
  const bytes = crypto.randomBytes(19);
  return b64u(bytes);
}

function createRawToken() {
  return b64u(crypto.randomBytes(32));
}

function sha256hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function callRoute(pathWithQuery) {
  const url = new URL(pathWithQuery, ORIGIN);
  const res = await fetch(url.toString(), { cache: "no-store" });
  let data;
  try {
    data = await res.json();
  } catch {
    const txt = await res.text().catch(() => "");
    throw new Error(`Route ${url.pathname} invalid JSON: ${txt}`);
  }
  if (!res.ok) {
    throw new Error(
      `Route ${url.pathname} error ${res.status}: ${JSON.stringify(data)}`
    );
  }
  return data;
}

// ────────────────────────────────────────────────────────────────
// 세션 발급 (기본 12시간)
// ────────────────────────────────────────────────────────────────
export async function createSession(data, { maxAgeSec = 60 * 60 * 12 } = {}) {
  if (!data || !Number.isInteger(data.user_id)) {
    throw new Error("createSession: data.user_id (int) is required");
  }

  const session_id = randId26();
  const token = createRawToken();
  const token_hash = sha256hex(token);

  const now = new Date();
  const expires_at = new Date(now.getTime() + maxAgeSec * 1000);

  const ts = (d) => d.toISOString().slice(0, 19).replace("T", " ");

  const cols = [
    "session_id",
    "token_hash",
    "user_id",
    "state",
    "created_at",
    "last_access_at",
    "expires_at",
  ];
  const values = [
    [
      session_id,
      token_hash,
      data.user_id,
      "active",
      ts(now),
      ts(now),
      ts(expires_at),
    ],
  ];

  const insertUrl = `/api/univer_city/insert_route?table=session&cols=${encodeURIComponent(
    JSON.stringify(cols)
  )}&values=${encodeURIComponent(JSON.stringify(values))}`;

  await callRoute(insertUrl);

  // 클라이언트 쿠키 값
  const sid = `${session_id}.${token}`;
  return { sid, maxAgeSec };
}

// ────────────────────────────────────────────────────────────────
/** 세션 조회
 *  @param {string} sid "session_id.token" 형태
 *  @returns {null | { user_id: number, exp: number }}
 */
export async function getSession(sid) {
  if (typeof sid !== "string" || !sid.includes(".")) return null;
  const [session_id, token] = sid.split(".");
  if (!session_id || !token) return null;

  const token_hash = sha256hex(token);
  const nowStr = new Date().toISOString().slice(0, 19).replace("T", " ");

  // session_id, token_hash, state, 만료시간 체크
  const selectCols = encodeURIComponent(
    JSON.stringify(["session_id", "user_id", "expires_at", "state"])
  );
  const where = encodeURIComponent(
    `session_id = '${session_id}' AND token_hash = '${token_hash}' AND state = 'active' AND expires_at > '${nowStr}'`
  );
  const url = `/api/univer_city/select_where_route?table=session&select=${selectCols}&where=${where}`;

  const data = await callRoute(url);

  const row =
    (Array.isArray(data?.rows) && data.rows[0]) ||
    data?.result?.rows?.[0] ||
    data?.result?.[0] ||
    null;

  if (!row || !row.user_id) return null;

  // exp(UNIX seconds) 계산
  const expMs = new Date(row.expires_at).getTime();
  const exp = Math.floor(expMs / 1000);

  return { user_id: Number(row.user_id), exp };
}
