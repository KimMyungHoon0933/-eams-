const currentDateSpan = document.getElementById("current-date");
const slideTrack = document.getElementById("slide-track");

let currentDate = new Date();

const lectureData = {
  "2025-05-04": [],
  "2025-05-05": ["컴퓨터 구조", "자료구조"],
  "2025-05-06": ["알고리즘", "운영체제"],
};

function formatDate(date) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const day = days[date.getDay()];
  return `${yyyy}.${mm}.${dd}(${day})`;
}

function getKey(date) {
  return date.toISOString().split("T")[0];
}

function updateSchedule() {
  const key = getKey(currentDate);
  const lectures = lectureData[key] || [];
  currentDateSpan.textContent = formatDate(currentDate);

  const card = document.createElement("div");
  card.className = "schedule-card";
  card.innerHTML = lectures.length
    ? lectures.map(cls => `<div>${cls}</div>`).join("")
    : "데이터가 없습니다.";

  slideTrack.innerHTML = ""; // 기존 카드 제거
  slideTrack.appendChild(card);
}

document.getElementById("prev-day").onclick = () => {
  currentDate.setDate(currentDate.getDate() - 1);
  updateSchedule();
};

document.getElementById("next-day").onclick = () => {
  currentDate.setDate(currentDate.getDate() + 1);
  updateSchedule();
};

document.querySelector(".refresh-btn").onclick = updateSchedule;

updateSchedule();
