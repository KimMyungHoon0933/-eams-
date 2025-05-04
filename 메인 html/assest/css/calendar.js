const calendarGrid = document.getElementById("calendarGrid");
const monthYear = document.getElementById("monthYear");

let currentDate = new Date();

// 예시 공휴일/행사
const events = {
  "2025-05-05": "어린이날",
  "2025-05-15": "스승의 날",
  "2025-05-20": "학교 축제"
};

function renderCalendar(date) {
  calendarGrid.innerHTML = ""; // 기존 내용 초기화

  const year = date.getFullYear();
  const month = date.getMonth();

  // 상단 표시
  monthYear.textContent = `${year}년 ${month + 1}월`;

  // 이번 달 시작 요일
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 달력에 빈 칸 추가 (시작 요일 맞추기)
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    calendarGrid.appendChild(emptyCell);
  }

  // 날짜 채우기
  for (let i = 1; i <= lastDate; i++) {
    const cell = document.createElement("div");
    cell.classList.add("calendar-cell");

    const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    cell.innerHTML = `<div class="date">${i}</div>`;

    // 이벤트가 있는 날짜일 경우
    if (events[fullDate]) {
      const eventDiv = document.createElement("div");
      eventDiv.classList.add("event");
      eventDiv.textContent = events[fullDate];
      cell.appendChild(eventDiv);
    }

    calendarGrid.appendChild(cell);
  }
}

// 이전/다음 버튼 이벤트
document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

// 초기 렌더링
renderCalendar(currentDate);
