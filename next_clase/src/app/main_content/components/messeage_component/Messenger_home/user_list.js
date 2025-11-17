// app/components/messeage_component/Messenger_chatwindow/user_list.js
"use client";

import { useState, useCallback } from "react";

/**
 * 유저 검색 + 목록 컴포넌트
 *
 * props:
 *  - onUserClick?: (user) => void       // 한 줄 클릭 시 콜백
 *  - selectedUserIds?: (number|string)[]  // 선택된 user_id 목록 (하이라이트용)
 */
export default function UserList({ onUserClick, selectedUserIds = [] }) {
  const [keyword, setKeyword] = useState(""); // 검색어(이름)
  const [users, setUsers] = useState([]); // {user_id, user_name, department_name, user_type, ...}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false); // 한번이라도 검색했는지

  // select_where_route 응답 rows 추출 유틸
  const extractRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.result?.rows)) return payload.result.rows;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  // user_type → 한글 라벨
  const mapUserTypeLabel = (userType) => {
    switch (userType) {
      case "Professor":
        return "교수";
      case "student":
        return "학생";
      case "employee":
        return "직원";
      case "teaching_assistant":
        return "조교";
      case "user":
      default:
        return "일반";
    }
  };

  // 실제 유저 검색 함수 (이름으로 user 테이블 조회)
  const fetchUsers = useCallback(async (nameKeyword) => {
    try {
      setLoading(true);
      setError(null);

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

      const urlUser = new URL(
        "/api/univer_city/select_where_route",
        origin
      );
      urlUser.searchParams.set("table", "user");
      urlUser.searchParams.set(
        "select",
        JSON.stringify(["user_id", "user_name", "department_id"])
      );

      const safeKeyword = (nameKeyword || "").trim().replace(/'/g, "''");
      const where = `user_name LIKE '%${safeKeyword}%'`;

      urlUser.searchParams.set("where", where);

      const resUser = await fetch(urlUser.toString(), {
        cache: "no-store",
      });
      const dataUser = await resUser.json();

      if (!resUser.ok) {
        throw new Error(
          dataUser?.message ||
            `user 조회 실패 (status ${resUser.status})`
        );
      }

      const userRows = extractRows(dataUser);

      if (userRows.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // 2) department 정보 한 번에 조회
      const deptIds = [
        ...new Set(
          userRows
            .map((u) => u.department_id)
            .filter((v) => v !== null && v !== undefined)
        ),
      ];

      const deptMap = {};
      if (deptIds.length > 0) {
        const urlDept = new URL(
          "/api/univer_city/select_where_route",
          origin
        );
        urlDept.searchParams.set("table", "department");
        urlDept.searchParams.set(
          "select",
          JSON.stringify(["department_id", "department_name"])
        );
        urlDept.searchParams.set(
          "where",
          `department_id IN (${deptIds.join(",")})`
        );

        const resDept = await fetch(urlDept.toString(), {
          cache: "no-store",
        });
        const dataDept = await resDept.json();
        const deptRows = extractRows(dataDept);

        for (const d of deptRows) {
          deptMap[d.department_id] = d.department_name;
        }
      }

      // 3) 각 user_id 별로 /api/user_type 호출
      const typeMap = {};
      await Promise.all(
        userRows.map(async (u) => {
          try {
            const urlType = new URL("/api/user_type", origin);
            urlType.searchParams.set("user_id", String(u.user_id));
            const resType = await fetch(urlType.toString(), {
              cache: "no-store",
            });
            const dataType = await resType.json();
            if (dataType?.ok) {
              typeMap[u.user_id] = dataType.user_type || "user";
            }
          } catch {
            typeMap[u.user_id] = "user";
          }
        })
      );

      // 4) 최종 머지
      const merged = userRows.map((u) => ({
        ...u,
        department_name: deptMap[u.department_id] || "",
        user_type: typeMap[u.user_id] || "user",
      }));

      setUsers(merged);
    } catch (e) {
      console.error(e);
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 검색 실행 함수 (form 안 씀!)
  const handleSearch = () => {
    const trimmed = keyword.trim();

    if (!trimmed) {
      setUsers([]);
      setSearched(false);
      return;
    }

    setSearched(true);
    fetchUsers(trimmed);
  };

  // 선택 여부
  const isSelected = (userId) =>
    selectedUserIds.some((id) => Number(id) === Number(userId));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      {/* 검색창 (form 제거, 버튼/엔터로 직접 호출) */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 4 }}
      >
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="이름으로 검색"
          style={{
            flex: 1,
            borderRadius: 6,
            border: "1px solid #ddd",
            padding: "6px 8px",
            fontSize: 13,
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          style={{
            borderRadius: 6,
            border: "none",
            padding: "6px 12px",
            fontSize: 13,
            cursor: "pointer",
            background: "#2563eb",
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          검색
        </button>
      </div>

      {/* 상태 메시지 */}
      {loading && (
        <div style={{ fontSize: 13, color: "#666" }}>조회 중...</div>
      )}
      {error && !loading && (
        <div style={{ fontSize: 13, color: "crimson" }}>
          조회 실패: {error}
        </div>
      )}

      {/* 유저 목록 */}
      {!loading && !error && (
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 6,
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {!searched && users.length === 0 ? (
            <div
              style={{
                padding: 8,
                fontSize: 13,
                color: "#999",
              }}
            >
              이름을 입력하고 &quot;검색&quot; 버튼을 눌러 주세요.
            </div>
          ) : users.length === 0 ? (
            <div
              style={{
                padding: 8,
                fontSize: 13,
                color: "#999",
              }}
            >
              검색 결과가 없습니다.
            </div>
          ) : (
            users.map((u) => {
              const selected = isSelected(u.user_id);
              return (
                <div
                  key={u.user_id}
                  onClick={() => onUserClick && onUserClick(u)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "6px 10px",
                    borderBottom: "1px solid #f1f1f1",
                    cursor: onUserClick ? "pointer" : "default",
                    background: selected ? "#eff6ff" : "#fff",
                  }}
                >
                  {/* 맨 왼쪽: 학번(=user_id) */}
                  <div
                    style={{
                      minWidth: 80,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#111",
                    }}
                  >
                    {u.user_id}
                  </div>

                  {/* 오른쪽: 이름 + (학과 / 타입) */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>
                      {u.user_name}
                      {selected && (
                        <span
                          style={{
                            marginLeft: 4,
                            fontSize: 11,
                            color: "#2563eb",
                          }}
                        >
                          (선택됨)
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        marginTop: 2,
                        fontSize: 11,
                        color: "#666",
                      }}
                    >
                      {u.department_name || "학과 정보 없음"} /{" "}
                      {mapUserTypeLabel(u.user_type)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
