/* =========================
📄 homework-content.js
========================= */
export const DEADLINES = {
'컴퓨터공학개론': '2025-11-30',
'자료구조': '2025-12-05',
'운영체제': '2025-12-10',
'데이터베이스': '2025-12-15'
};


export function validateForm({ subject, title, desc, files }) {
const errors = {};
if (!subject) errors.subject = '과목을 선택하세요';
if (!title || title.trim().length < 3) errors.title = '제목을 3자 이상 입력하세요';
if (!desc || desc.trim().length < 10) errors.desc = '설명을 10자 이상 입력하세요';
if (!files || files.length === 0) errors.files = '파일을 최소 1개 이상 제출하세요';
return errors;
}


export function showToast(msg) {
const toast = document.getElementById('toast');
toast.textContent = msg;
toast.hidden = false;
setTimeout(() => (toast.hidden = true), 2400);
}