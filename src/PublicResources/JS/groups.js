//Subjects to be changed

let currentDay = "Monday";
let currentMode = "driver";

// Groups and stuff that decides when they show up

const groups = [
  {day: "Monday", role: "driver", name: "ALG med Gutterne"},
  {day: "Tuesday", role: "passenger", name: "Skyd mig det er en SLIAL dag"},
  {day: "Wednesday", role: "passenger", name: "DEB er BED baglæns"},
  {day: "Friday", role: "driver", name: "IWP står for I Wanna Pray"}
];

function renderGroups() {
  
  const groupTitleElement = document.querySelector(".group-title");
  
  const visibleGroups = groups.filter(group => {
  return (
    group.day === currentDay &&
    group.role === currentMode
  );
});

const activeGroup = visibleGroups[0];

if (!activeGroup) {
  groupTitleElement.textContent = "No group available";
  return;
}

groupTitleElement.textContent = activeGroup.name;


}

// Things to do with modes

function setMode(mode) {
  const allowedModes = ["driver","passenger"];
  if (!allowedModes.includes(mode)) {
    console.warn("Invalid mode detected!");
    return;
  }
  currentMode = mode;

/// Changing of the title

  document.body.classList.remove("mode-driver", "mode-passenger");
  document.body.classList.add(`mode-${mode}`);

  const title = document.getElementById("pageTitle");
  if (mode === "driver") {
    title.textContent = "My Groups - Driver";
  } else {
    title.textContent = "My Groups - Passenger";
  }
  renderGroups();
}

/// Beeg toggle
const modeToggle = document.querySelector(".switch input");

modeToggle.addEventListener("change", () => {
  
  let mode;

  if (modeToggle.checked) {
    mode = "passenger";
  } else {
    mode = "driver";
  }
  setMode(mode);
});

let initialMode;

if (modeToggle.checked) {
  initialMode = "passenger";
} else {
  initialMode = "driver";
}

setMode(initialMode);




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
    
    currentDay = selectedDay;
    
    renderSchedule(selectedDay);

    renderGroups();
  });
});

// Initial render
renderSchedule("Monday");