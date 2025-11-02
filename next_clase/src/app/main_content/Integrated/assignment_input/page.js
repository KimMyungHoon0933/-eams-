"use client";

import { useEffect } from "react";
import {
  DEADLINES,
  validateForm,
  showToast,
} from "../../components/Integrated_content/homework-content.js";
import "./homework.css";
import IntegratedMenu from "../../components/IntegratedMenu"; // 왼쪽 메뉴 import

export default function HomeworkPage() {
  useEffect(() => {
    const getEl = (id) => document.getElementById(id);

    const subject = getEl("subject");
    const titleEl = getEl("title");
    const desc = getEl("desc");
    const dropzone = getEl("dropzone");
    const fileInput = getEl("fileInput");
    const fileList = getEl("fileList");
    const form = getEl("hwForm");
    const deadlineWrap = getEl("deadlineWrap");
    const deadlineText = getEl("deadlineText");

    const ERR = {
      subject: getEl("err-subject"),
      title: getEl("err-title"),
      desc: getEl("err-desc"),
      files: getEl("err-files"),
    };

    let files = [];

    function refreshDeadline() {
      if (!subject || !deadlineWrap || !deadlineText) return;
      const sel = subject.value;
      if (DEADLINES[sel]) {
        deadlineText.textContent = DEADLINES[sel];
        deadlineWrap.hidden = false;
      } else deadlineWrap.hidden = true;
    }

    function renderFiles() {
      if (!fileList) return;
      fileList.innerHTML = "";
      files.forEach((f, i) => {
        const row = document.createElement("div");
        row.className = "fileRow";
        row.innerHTML = `
          <div>📎 ${f.name} (${Math.round(f.size / 1024)}KB)</div>
          <button type="button" class="btn ghost">삭제</button>
        `;
        row.querySelector("button").addEventListener("click", () => {
          files.splice(i, 1);
          renderFiles();
        });
        fileList.appendChild(row);
      });
    }

    function addFiles(list) {
      const arr = Array.from(list || []);
      if (!arr.length) return;
      files = [...files, ...arr];
      renderFiles();
    }

    dropzone?.addEventListener("click", () => fileInput?.click());
    ["dragenter", "dragover"].forEach((t) =>
      dropzone?.addEventListener(t, (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      })
    );
    ["dragleave", "drop"].forEach((t) =>
      dropzone?.addEventListener(t, (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      })
    );
    dropzone?.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));
    fileInput?.addEventListener("change", (e) => addFiles(e.target.files));

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const errors = validateForm({
        subject: subject?.value,
        title: titleEl?.value,
        desc: desc?.value,
        files,
      });

      let ok = true;
      for (const key in ERR) {
        if (errors[key]) {
          ERR[key].hidden = false;
          ok = false;
        } else ERR[key].hidden = true;
      }

      if (!ok) return showToast("입력값을 확인해주세요.");

      showToast(
        "제출 완료! 과제번호: HW-" +
          Math.random().toString(36).slice(2, 8).toUpperCase()
      );

      setTimeout(() => getEl("btnReset")?.click(), 300);
    });

    subject?.addEventListener("change", refreshDeadline);
    refreshDeadline();

    return () => {
      subject?.removeEventListener("change", refreshDeadline);
    };
  }, []);

  return (
    <div style={{ display: "flex" }}>
      {/* ✅ 왼쪽 메뉴 */}
      <IntegratedMenu />

      {/* ✅ 오른쪽 과제 제출 본문 */}
      <main className="hw-wrap">
        <div className="hw-card">
          <div className="hw-header">
            <h2 className="hw-title">📘 과제 제출</h2>
          </div>

          <form id="hwForm" className="hw-form">
            <label>
              과목 선택
              <select id="subject" className="select">
                <option value="">과목을 선택하세요</option>
                <option value="컴퓨터공학개론">컴퓨터공학개론</option>
                <option value="자료구조">자료구조</option>
                <option value="운영체제">운영체제</option>
                <option value="데이터베이스">데이터베이스</option>
              </select>
              <small id="err-subject" hidden style={{ color: "red" }}>
                과목을 선택하세요
              </small>
            </label>

            <div id="deadlineWrap" hidden>
              <p>마감일: <strong id="deadlineText"></strong></p>
            </div>

            <label>
              과제 제목
              <input id="title" className="input" placeholder="과제 제목을 입력하세요" />
              <small id="err-title" hidden style={{ color: "red" }}>
                제목을 입력하세요
              </small>
            </label>

            <label>
              설명
              <textarea id="desc" className="text" placeholder="과제 설명을 입력하세요" />
              <small id="err-desc" hidden style={{ color: "red" }}>
                설명을 입력하세요
              </small>
            </label>

            <label>
              파일 업로드
              <div id="dropzone" className="dropzone">
                파일을 이곳에 드래그하거나 클릭하여 업로드
              </div>
              <input id="fileInput" type="file" multiple hidden />
              <div id="fileList" className="fileList"></div>
              <small id="err-files" hidden style={{ color: "red" }}>
                파일을 업로드하세요
              </small>
            </label>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button type="reset" id="btnReset" className="btn ghost">
                초기화
              </button>
              <button type="submit" className="btn primary">
                제출하기
              </button>
            </div>
          </form>
        </div>

        <div id="toast" className="toast" hidden>
          토스트 메시지
        </div>
      </main>
    </div>
  );
}

return (
  <div className="hw-layout">
    <IntegratedMenu /> {/* 왼쪽 메뉴 */}

    <div className="hw-wrap">
      <div className="hw-card">
        <div className="hw-header">
          <h2 className="hw-title">📘 과제 제출</h2>
        </div>

        <form id="hwForm" className="hw-form">
          {/* 과목, 제목, 설명, 파일 업로드 */}
        </form>
      </div>
    </div>
  </div>
);
