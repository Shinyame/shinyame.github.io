document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // タイトル反映
  const mainTitle = document.getElementById("currentMonthTitle");
  const prevTitle = document.getElementById("prevMonthTitle");
  const nextTitle = document.getElementById("nextMonthTitle");
  mainTitle.textContent = `${months[today.getMonth()]} ${today.getFullYear()}`;
  const prev = new Date(today.getFullYear(), today.getMonth()-1, 1);
  const nxt = new Date(today.getFullYear(), today.getMonth()+1, 1);
  prevTitle.textContent = `${months[prev.getMonth()]} ${prev.getFullYear()}`;
  nextTitle.textContent = `${months[nxt.getMonth()]} ${nxt.getFullYear()}`;

  renderCalendar("calendar", today.getFullYear(), today.getMonth(), today);
  renderCalendar("calendarPrev", prev.getFullYear(), prev.getMonth(), null);
  renderCalendar("calendarNext", nxt.getFullYear(), nxt.getMonth(), null);

  document.getElementById("goButton").addEventListener("click", () => {
    const y = parseInt(document.getElementById("yearInput").value);
    const m = parseInt(document.getElementById("monthInput").value) - 1;
    if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
      mainTitle.textContent = `${months[m]} ${y}`;
      const target = new Date(y, m, 1);
      const prev = new Date(y, m - 1, 1);
      const next = new Date(y, m + 1, 1);
      prevTitle.textContent = `${months[prev.getMonth()]} ${prev.getFullYear()}`;
      nextTitle.textContent = `${months[next.getMonth()]} ${next.getFullYear()}`;
      renderCalendar("calendar", y, m, new Date());
      renderCalendar("calendarPrev", prev.getFullYear(), prev.getMonth(), null);
      renderCalendar("calendarNext", next.getFullYear(), next.getMonth(), null);
    }
  });
});

function renderCalendar(containerId, year, month, highlightDate) {
  const cal = document.getElementById(containerId);
  cal.innerHTML = "";
  const first = new Date(year, month, 1);
  const last = new Date(year, month+1, 0);
  const firstIndex = first.getDay(), lastDate = last.getDate();
  const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  weekdays.forEach((d,i) => {
    const div = document.createElement("div");
    div.classList.add("day-name");
    if (i===0) div.classList.add("sunday");
    if (i===6) div.classList.add("saturday");
    div.textContent = d;
    cal.appendChild(div);
  });

  for (let i=0; i<firstIndex; i++){
    const e = document.createElement("div");
    e.classList.add("day");
    cal.appendChild(e);
  }

  for (let d=1; d<=lastDate; d++){
    const dt = new Date(year, month, d);
    const cell = document.createElement("div");
    cell.classList.add("day");
    const dow = dt.getDay();
    if (dow===0) cell.classList.add("sunday");
    if (dow===6) cell.classList.add("saturday");
    const holidayName = JapaneseHolidays.isHoliday(dt);
    if (holidayName) {
      cell.classList.add("holiday");
    }
    if (highlightDate && dt.toDateString()===highlightDate.toDateString()) cell.classList.add("today");

    const dateSpan = document.createElement("div");
    dateSpan.textContent = d;
    cell.appendChild(dateSpan);

    if (holidayName) {
      const holidayLabel = document.createElement("div");
      holidayLabel.textContent = holidayName;
      holidayLabel.style.color = "red";
      holidayLabel.style.fontSize = "0.75em";
      holidayLabel.style.marginTop = "4px";
      cell.appendChild(holidayLabel);
    }

    cal.appendChild(cell);
  }
} 
