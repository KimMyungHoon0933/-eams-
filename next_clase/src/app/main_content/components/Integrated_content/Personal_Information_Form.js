// app/main_content/components/personal_information/Personal_Information_Form.js
"use client";

import { useEffect, useState } from "react";

function normalizeUserFromApi(data) {
  if (!data || !data.result) return null;

  const r = data.result;

  // 1) result가 배열인 경우
  if (Array.isArray(r) && r.length > 0) {
    return r[0];
  }

  // 2) result.rows[0] 형태인 경우
  if (r && Array.isArray(r.rows) && r.rows.length > 0) {
    return r.rows[0];
  }

  // 3) 그 외: 그냥 result 자체가 row인 경우라고 가정
  return r;
}

export default function Personal_Information_Form() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [user, setUser] = useState(null);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ---------- 1) 최초 로딩: 현재 사용자 정보 가져오기 ----------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        // 현재 세션 기반 사용자 정보 라우터
        const res = await fetch("/api/univer_city/user_route", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || data.ok === false) {
          throw new Error(
            data?.reason || "사용자 정보를 불러오는데 실패했습니다."
          );
        }

        const row = normalizeUserFromApi(data);

        if (!row) {
          throw new Error("사용자 정보가 비어 있습니다.");
        }

        setUser(row);
        setPhone(row.phone || "");
        setAddress(row.address || "");
      } catch (e) {
        console.error(e);
        setLoadError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ---------- 2) 전화번호 간단 검증 ----------
  const phoneRegex = /^[0-9]{3}-[0-9]{4}-[0-9]{4}$/;
  const isPhoneValid = phoneRegex.test(phone);

  // ---------- 3) 저장 버튼 클릭 시 ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);

    if (!user) {
      setSaveError("사용자 정보가 없습니다.");
      return;
    }

    if (!isPhoneValid) {
      setSaveError("전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678");
      return;
    }

    try {
      setSaving(true);

      // ⚠️ 여기서는 update 라우터를 가정해서 작성했습니다.
      // 실제 프로젝트의 update 라우터 경로/파라미터에 맞게 수정해서 사용하면 됩니다.
      const updateBody = {
        table: "user",
        set: {
          phone,
          address,
        },
        where: `user_id = ${user.user_id}`,
      };

      const res = await fetch("/api/univer_city/update_where_route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateBody),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(
          data?.reason || "개인정보를 수정하는 데 실패했습니다."
        );
      }

      setSaveSuccess(true);
      // 로컬 user 상태도 업데이트
      setUser((prev) =>
        prev
          ? {
              ...prev,
              phone,
              address,
            }
          : prev
      );
    } catch (e) {
      console.error(e);
      setSaveError(e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  // ---------- 4) 렌더링 ----------
  if (loading) {
    return <div>개인정보를 불러오는 중입니다...</div>;
  }

  if (loadError) {
    return <div style={{ color: "red" }}>오류: {loadError}</div>;
  }

  if (!user) {
    return <div>사용자 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ marginBottom: "16px" }}>개인정보 수정</h2>

      <form onSubmit={handleSubmit}>
        {/* 읽기 전용 기본 정보들 */}
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}
          >
            사용자 ID
          </label>
          <input
            type="text"
            value={user.user_id ?? ""}
            disabled
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}
          >
            이름
          </label>
          <input
            type="text"
            value={user.user_name ?? ""}
            disabled
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}
          >
            생년월일
          </label>
          <input
            type="text"
            value={user.birth_date ?? ""}
            disabled
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}
          >
            성별
          </label>
          <input
            type="text"
            value={user.gender ?? ""}
            disabled
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {/* 수정 가능: 전화번호 */}
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}
          >
            전화번호
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-1234-5678"
            style={{ width: "100%", padding: "8px" }}
          />
          {!isPhoneValid && phone.length > 0 && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678
            </div>
          )}
        </div>

        {/* 수정 가능: 주소 */}
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}
          >
            주소
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="주소를 입력하세요"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {/* 계좌는 읽기 전용(원하면 나중에 수정 가능으로 변경) */}
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}
          >
            계좌번호
          </label>
          <input
            type="text"
            value={user.account_number ?? ""}
            disabled
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {/* 저장 결과 메시지 */}
        {saveError && (
          <div style={{ color: "red", marginBottom: "8px" }}>{saveError}</div>
        )}
        {saveSuccess && (
          <div style={{ color: "green", marginBottom: "8px" }}>
            개인정보가 수정되었습니다.
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "8px 16px",
            fontWeight: "bold",
            borderRadius: "4px",
            border: "none",
            backgroundColor: saving ? "#999" : "#1e40af",
            color: "#fff",
            cursor: saving ? "default" : "pointer",
          }}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
