// app/components/messeage_component/Messenger_chatwindow/create_chatwindow_container.js
"use client";

import { useState, useEffect } from "react";
import UserList from "./user_list";

/**
 * 새 채팅방 생성용 컨테이너
 *
 * props:
 *  - currentUserId?: 현재 로그인한 유저 ID (없어도 됨, 세션 라우터로 다시 확인)
 *  - onClose: 모달(창) 닫기 콜백
 *  - onCreated: 채팅방 생성 후 콜백 (예: 목록 리로드용)
 */
export default function CreateChatWindowContainer({
  currentUserId,
  onClose,
  onCreated,
}) {
  const [roomName, setRoomName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]); // 전체 선택된 유저 객체
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // ✅ 3번 라우터에서 현재 사용자 정보 가져오기
  const [sessionUserId, setSessionUserId] = useState(null);
  const [sessionError, setSessionError] = useState(null);

  useEffect(() => {
    const loadSessionUser = async () => {
      try {
        const origin =
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000";

        const url = new URL("api/univer_city/user_route", origin);
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.session?.user_id) {
          setSessionError("현재 사용자 정보를 가져올 수 없습니다.");
          return;
        }

        setSessionUserId(Number(data.session.user_id));
      } catch (e) {
        console.error("세션 사용자 조회 오류:", e);
        setSessionError("현재 사용자 정보를 가져오는 중 오류가 발생했습니다.");
      }
    };

    loadSessionUser();
  }, []);

  // 세션에서 가져온 ID가 우선, 없으면 props 사용
  const effectiveCurrentUserId =
    sessionUserId != null
      ? Number(sessionUserId)
      : currentUserId != null
      ? Number(currentUserId)
      : null;

  // 유저 클릭(토글 선택)
  const handleToggleUser = (user) => {
    setSelectedUsers((prev) => {
      const exists = prev.some(
        (u) => Number(u.user_id) === Number(user.user_id)
      );
      if (exists) {
        // 이미 있으면 제거
        return prev.filter(
          (u) => Number(u.user_id) !== Number(user.user_id)
        );
      }
      // 없으면 추가
      return [...prev, user];
    });
  };

  // 채팅방 생성
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateError(null);

    // 0) 현재 사용자 확인
    if (!effectiveCurrentUserId) {
      alert("현재 사용자 정보를 불러올 수 없어 채팅방을 만들 수 없습니다.");
      return;
    }

    // 1) 선택된 유저들의 ID만 먼저 모음
    const selectedIds = selectedUsers.map((u) => Number(u.user_id));

    // 2) 현재 사용자가 선택 목록에 포함되어 있는지 검사
    const includedSelf = selectedIds.includes(Number(effectiveCurrentUserId));
    if (!includedSelf) {
      alert("자신이 포함해서 채팅방을 만들어야 합니다.");
      return;
    }

    // 3) 최종 멤버 ID (중복 제거)
    const memberIds = Array.from(
      new Set([...selectedIds, Number(effectiveCurrentUserId)])
    );

    // 자기 자신 포함 기준으로 최소 2명 이상
    if (memberIds.length < 2) {
      alert("자기 자신 외에 최소 1명 이상 선택해야 합니다.");
      return;
    }

    try {
      setCreating(true);

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

      // 채팅방 이름: 직접 입력 없으면 선택된 유저 이름으로 자동
      const autoName =
        selectedUsers.length > 0
          ? selectedUsers.map((u) => u.user_name).join(", ")
          : "새 채팅방";
      const finalRoomName = roomName.trim() || autoName;

      // is_group: 2명(1:1)은 'f', 그 이상은 't'
      const isGroup = memberIds.length > 2 ? "t" : "f";

      // -----------------------------------
      // ① Chatroom INSERT
      // -----------------------------------
      const roomCols = ["chatroom_name", "is_group"];
      const roomValues = [[finalRoomName, isGroup]];

      const urlRoom = new URL(
        "/api/univer_city/insert_route",
        origin
      );
      urlRoom.searchParams.set("table", "Chatroom");
      urlRoom.searchParams.set("cols", JSON.stringify(roomCols));
      urlRoom.searchParams.set("values", JSON.stringify(roomValues));

      const roomRes = await fetch(urlRoom.toString(), {
        cache: "no-store",
      });
      const roomBody = await roomRes.json();

      if (!roomRes.ok) {
        throw new Error(
          roomBody?.message || "채팅방 생성(insert Chatroom) 실패"
        );
      }

      const chatroomId =
        roomBody?.insertId || roomBody?.chatroom_id || null;
      if (!chatroomId) {
        throw new Error("채팅방 ID를 가져올 수 없습니다.");
      }

      // -----------------------------------
      // ② Chatroom_List INSERT
      // -----------------------------------
      const memberCols = ["chatroom_id", "member_id"];
      const memberValues = memberIds.map((uid) => [
        chatroomId,
        uid,
      ]);

      const urlMember = new URL(
        "/api/univer_city/insert_route",
        origin
      );
      urlMember.searchParams.set("table", "Chatroom_List");
      urlMember.searchParams.set("cols", JSON.stringify(memberCols));
      urlMember.searchParams.set("values", JSON.stringify(memberValues));

      const memberRes = await fetch(urlMember.toString(), {
        cache: "no-store",
      });
      const memberBody = await memberRes.json();

      if (!memberRes.ok) {
        throw new Error(
          memberBody?.message ||
            "채팅방 멤버 추가(insert Chatroom_List) 실패"
        );
      }

      // 성공 콜백
      if (onCreated) {
        onCreated({
          chatroomId,
          chatroomName: finalRoomName,
          memberIds,
          members: selectedUsers,
        });
      }

      if (onClose) onClose();
    } catch (err) {
      console.error("채팅방 생성 실패:", err);
      setCreateError(err?.message || String(err));
    } finally {
      setCreating(false);
    }
  };

  const labels = memberIdsText(effectiveCurrentUserId, selectedUsers);

  const selectedUserIds = selectedUsers.map((u) => u.user_id);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 480,
          maxWidth: "90%",
          maxHeight: "80vh",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,.25)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <header
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16 }}>새 채팅방 만들기</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 18,
              cursor: "pointer",
            }}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        {/* 내용 */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "12px 16px",
            gap: 12,
            overflow: "hidden",
            flex: 1,
          }}
        >
          {/* 채팅방 이름 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13, color: "#555" }}>
              채팅방 이름 (선택)
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="입력 안 하면 선택한 사람 이름으로 자동 생성"
              style={{
                borderRadius: 6,
                border: "1px solid #ddd",
                padding: "6px 8px",
                fontSize: 13,
              }}
            />
          </div>

          {/* 선택된 멤버 표시 */}
          <div style={{ fontSize: 12, color: "#555" }}>
            선택된 멤버 ({labels.length}) :
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 4,
                minHeight: 22,
              }}
            >
              {labels.length === 0 ? (
                <span style={{ fontSize: 11, color: "#aaa" }}>
                  아직 선택된 멤버가 없습니다.
                </span>
              ) : (
                labels.map((label, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "2px 6px",
                      borderRadius: 999,
                      border: "1px solid #ddd",
                      fontSize: 11,
                      background: "#f9fafb",
                    }}
                  >
                    {label}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* 세션 에러가 있다면 표시 (선택) */}
          {sessionError && (
            <div style={{ fontSize: 12, color: "crimson" }}>
              {sessionError}
            </div>
          )}

          {/* 유저 검색 + 리스트 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              flex: 1,
              minHeight: 0,
            }}
          >
            <div style={{ fontSize: 13, color: "#555" }}>
              대화 상대 선택 (검색 후 클릭해서 추가)
            </div>

            <UserList
              onUserClick={handleToggleUser}
              selectedUserIds={selectedUserIds}
            />
          </div>

          {/* 에러 */}
          {createError && (
            <div style={{ fontSize: 12, color: "crimson" }}>
              채팅방 생성 실패: {createError}
            </div>
          )}

          {/* 버튼 */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 4,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
              disabled={creating}
            >
              취소
            </button>
            <button
              type="submit"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
              disabled={creating}
            >
              {creating ? "생성 중..." : "채팅방 만들기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * 선택된 멤버 라벨 텍스트 만들기
 * - 본인(currentUserId)는 "(나)" 붙여서 표시
 */
function memberIdsText(currentUserId, selectedUsers) {
  const labels = [];

  for (const u of selectedUsers) {
    labels.push(`${u.user_id} ${u.user_name}`);
  }

  return labels;
}
