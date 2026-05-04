// Grab all weekday items
const dayItems = document.querySelectorAll(".day-list li");

// Schedule data
const schedules = {
  Monday: [
    { time: "07:00", address: "Muligvisvej 3" }
  ],
  Tuesday: [
    { time: "07:00", address: "Vestergade 12" },
    { time: "07:20", address: "Kattevej 21" }
  ],
  Wednesday: [],
  Thursday: [],
  Friday: []
};

// Where schedule rows will be rendered
const scheduleElement = document.querySelector(".schedule");

// Render schedule for a given day
function renderSchedule(day) {
  scheduleElement.innerHTML = "";

  const entries = schedules[day];
  if (!entries || entries.length === 0) {
    scheduleElement.textContent = "No schedule for this day";
    return;
  }

  entries.forEach(entry => {
    const row = document.createElement("div");
    row.className = "schedule-row";

    const time = document.createElement("span");
    time.className = "time";
    time.textContent = entry.time;

    const address = document.createElement("span");
    address.className = "address";
    address.textContent = entry.address;

    row.append(time, address);
    scheduleElement.appendChild(row);
  });
}

// Click handling for weekday selection
dayItems.forEach(day => {
  day.addEventListener("click", () => {
    dayItems.forEach(d => d.classList.remove("active"));
    day.classList.add("active");

    const selectedDay = day.textContent;
    renderSchedule(selectedDay);
  });
});

// Initial render
renderSchedule("Monday");